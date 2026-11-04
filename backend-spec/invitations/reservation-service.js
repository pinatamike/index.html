'use strict';
/* Reference implementation of NORA's authoritative reservation service (in-memory).
   Production: same rules inside one DB transaction per call (see schema.sql: unique seat index).
   A reservation is NEVER a buy-in: nothing here touches chips, hours or the ledger. */
const crypto = require('crypto');

class ReservationService {
  constructor({ now = () => Date.now(), onEvent = () => {} } = {}) {
    this.now = now; this.onEvent = onEvent;
    this.games = new Map();        // gameId -> {tenantId, startUtc, graceMin, countdownFrom, tables:{tableId:seats}, autoRelease}
    this.invites = new Map();      // invitationId -> record (separate status fields, not one enum)
    this.seatOwner = new Map();    // `${gameId}|${tableId}|${seat}` -> invitationId  (uniqueness = no double booking)
    this.processed = new Set();    // idempotency keys for webhook events
    this.tokens = new Map();       // tokenHash -> {invitationId, expiresAt, revoked}
    this.audit = [];
  }
  _log(tenantId, gameId, invitationId, action, detail) {
    const row = { at: this.now(), tenantId, gameId, invitationId, action, detail }; this.audit.push(row); this.onEvent(row); return row;
  }
  createGame(g) { this.games.set(g.gameId, { graceMin: 30, countdownFrom: 'GAME_START', autoRelease: true, ...g }); }
  invite(tenantId, gameId, playerId) {
    const g = this._game(tenantId, gameId); const id = crypto.randomUUID();
    const raw = crypto.randomBytes(24).toString('base64url');
    this.tokens.set(hash(raw), { invitationId: id, expiresAt: g.startUtc + 12 * 3600e3, revoked: false });
    this.invites.set(id, { id, tenantId, gameId, playerId, rsvp: 'invited', seatStatus: 'none', transit: 'not_started',
      waitlist: null, seating: 'not_seated', table: null, seat: null, etaUtc: null, expiresUtc: null, hostOverride: false });
    this._log(tenantId, gameId, id, 'invited', { playerId }); return { id, token: raw };
  }
  _game(tenantId, gameId) { const g = this.games.get(gameId); if (!g || g.tenantId !== tenantId) throw new Error('forbidden'); return g; }
  _inv(token) {
    const t = this.tokens.get(hash(token)); if (!t || t.revoked || t.expiresAt < this.now()) throw new Error('invalid_token');
    return this.invites.get(t.invitationId);
  }
  revokeLink(token) { const t = this.tokens.get(hash(token)); if (t) t.revoked = true; }
  rsvp(token, status) {
    const inv = this._inv(token); if (!['confirmed', 'tentative', 'declined'].includes(status)) throw new Error('bad_status');
    inv.rsvp = status; this._log(inv.tenantId, inv.gameId, inv.id, 'rsvp', { status });
    if (status === 'declined' && inv.seatStatus === 'reserved') this.release(inv.id, 'player_declined');
    return inv;
  }
  /* atomic: check + claim happen together; a second claimant gets seat_taken */
  reserve(token, tableId, seat, { actor = 'player', hostOverride = false } = {}) {
    const inv = this._inv(token); const g = this._game(inv.tenantId, inv.gameId);
    if (inv.rsvp !== 'confirmed' && inv.rsvp !== 'tentative') throw new Error('rsvp_required');
    if (!g.tables[tableId] || seat < 1 || seat > g.tables[tableId]) throw new Error('bad_seat');
    const key = `${inv.gameId}|${tableId}|${seat}`; const owner = this.seatOwner.get(key);
    if (owner && owner !== inv.id) throw new Error('seat_taken');
    if (inv.seatStatus === 'reserved') this.seatOwner.delete(`${inv.gameId}|${inv.table}|${inv.seat}`); // move
    this.seatOwner.set(key, inv.id);
    Object.assign(inv, { seatStatus: 'reserved', table: tableId, seat, hostOverride: hostOverride || inv.hostOverride });
    inv.expiresUtc = this._expiry(g, inv);
    this._log(inv.tenantId, inv.gameId, inv.id, 'reserved', { tableId, seat, actor, expiresUtc: inv.expiresUtc }); return inv;
  }
  /* ONE clear policy: countdown starts at GAME_START or at the player's ETA, never an ambiguous mix */
  _expiry(g, inv) { const base = g.countdownFrom === 'PLAYER_ETA' && inv.etaUtc ? inv.etaUtc : g.startUtc; return base + g.graceMin * 60e3; }
  setEta(token, etaUtc) {
    const inv = this._inv(token); const g = this._game(inv.tenantId, inv.gameId);
    inv.etaUtc = etaUtc; inv.transit = 'on_the_way';
    if (inv.seatStatus === 'reserved') inv.expiresUtc = this._expiry(g, inv);
    this._log(inv.tenantId, inv.gameId, inv.id, 'eta', { etaUtc }); return inv;
  }
  release(invitationId, reason) {
    const inv = this.invites.get(invitationId); if (!inv || inv.seatStatus !== 'reserved') return inv;
    this.seatOwner.delete(`${inv.gameId}|${inv.table}|${inv.seat}`);
    const was = { table: inv.table, seat: inv.seat };
    Object.assign(inv, { seatStatus: reason === 'expired' ? 'expired' : 'released', table: null, seat: null, expiresUtc: null });
    this._log(inv.tenantId, inv.gameId, inv.id, 'released', { ...was, reason }); return inv;
  }
  /* run on a timer; never touches a physically seated player */
  sweepExpired() {
    const out = [];
    for (const inv of this.invites.values()) {
      const g = this.games.get(inv.gameId);
      if (inv.seatStatus === 'reserved' && inv.seating !== 'seated' && g.autoRelease && !inv.hostOverride && inv.expiresUtc <= this.now()) {
        this.release(inv.id, 'expired'); out.push(inv.id);
      }
    }
    return out;
  }
  /* called ONLY by the existing WF03 Seat Player + Initial Buy-In flow after it succeeds */
  markSeated(invitationId) {
    const inv = this.invites.get(invitationId); inv.seating = 'seated'; inv.transit = 'arrived';
    this._log(inv.tenantId, inv.gameId, invitationId, 'seated', {}); return inv;
  }
  /* idempotent webhook: same provider event id is applied once */
  handleWebhook(eventId, fn) {
    if (this.processed.has(eventId)) return { duplicate: true };
    this.processed.add(eventId); return { duplicate: false, result: fn() };
  }
  reservedSeats(gameId, tableId) {
    return [...this.invites.values()].filter(i => i.gameId === gameId && i.table === tableId && i.seatStatus === 'reserved').map(i => i.seat);
  }
}
const hash = t => crypto.createHash('sha256').update(t).digest('hex');
module.exports = { ReservationService };
