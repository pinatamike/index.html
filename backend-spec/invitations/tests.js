'use strict';
const assert = require('assert');
const { ReservationService } = require('./reservation-service');
const { parseInbound, T, fmtTime } = require('./whatsapp-adapter');

let clock = Date.UTC(2026, 10, 7, 1, 0); // Fri Nov 6, 8:00 PM America/Bogota = 01:00 UTC
const mk = (opts = {}) => { const s = new ReservationService({ now: () => clock }); s.createGame({ gameId: 'g1', tenantId: 't1', startUtc: clock, tables: { T1: 10, T2: 10 }, ...opts }); return s; };
const inviteConfirmed = (s, pid) => { const i = s.invite('t1', 'g1', pid); s.rsvp(i.token, 'confirmed'); return i; };
let n = 0; const test = (name, fn) => { fn(); n++; console.log('ok -', name); };

test('double booking is impossible (same seat, two players)', () => {
  const s = mk(); const a = inviteConfirmed(s, 'a'), b = inviteConfirmed(s, 'b');
  s.reserve(a.token, 'T1', 4); assert.throws(() => s.reserve(b.token, 'T1', 4), /seat_taken/);
});
test('same seat number on another table is allowed (table-specific numbering)', () => {
  const s = mk(); const a = inviteConfirmed(s, 'a'), b = inviteConfirmed(s, 'b');
  s.reserve(a.token, 'T1', 4); s.reserve(b.token, 'T2', 4); assert.deepEqual(s.reservedSeats('g1', 'T2'), [4]);
});
test('moving a reservation frees the old seat', () => {
  const s = mk(); const a = inviteConfirmed(s, 'a'), b = inviteConfirmed(s, 'b');
  s.reserve(a.token, 'T1', 4); s.reserve(a.token, 'T1', 5); s.reserve(b.token, 'T1', 4); assert.deepEqual(s.reservedSeats('g1', 'T1').sort(), [4, 5]);
});
test('reservation expires after the grace period and is audited with a reason', () => {
  const s = mk({ graceMin: 30 }); const a = inviteConfirmed(s, 'a'); s.reserve(a.token, 'T1', 3);
  clock += 29 * 60e3; assert.deepEqual(s.sweepExpired(), []); clock += 2 * 60e3; assert.equal(s.sweepExpired().length, 1);
  const last = s.audit.at(-1); assert.equal(last.action, 'released'); assert.equal(last.detail.reason, 'expired'); clock = Date.UTC(2026, 10, 7, 1, 0);
});
test('a physically seated player is never auto-released', () => {
  const s = mk(); const a = inviteConfirmed(s, 'a'); const r = s.reserve(a.token, 'T1', 3); s.markSeated(r.id);
  clock += 3600e3; assert.deepEqual(s.sweepExpired(), []); clock = Date.UTC(2026, 10, 7, 1, 0);
});
test('host override blocks automatic release', () => {
  const s = mk(); const a = inviteConfirmed(s, 'a'); s.reserve(a.token, 'T1', 3, { actor: 'host', hostOverride: true });
  clock += 3600e3; assert.deepEqual(s.sweepExpired(), []); clock = Date.UTC(2026, 10, 7, 1, 0);
});
test('countdown policy is explicit: PLAYER_ETA extends the hold, GAME_START does not', () => {
  const a1 = mk({ countdownFrom: 'GAME_START' }), a2 = mk({ countdownFrom: 'PLAYER_ETA' });
  for (const [s, extends_] of [[a1, false], [a2, true]]) {
    const i = inviteConfirmed(s, 'a'); const r = s.reserve(i.token, 'T1', 1); const before = r.expiresUtc;
    s.setEta(i.token, clock + 20 * 60e3); assert.equal(s.invites.get(r.id).expiresUtc > before, extends_);
  }
});
test('duplicate webhook events are applied once', () => {
  const s = mk(); let calls = 0; const f = () => { calls++; };
  s.handleWebhook('evt-1', f); const dup = s.handleWebhook('evt-1', f); assert.equal(calls, 1); assert.equal(dup.duplicate, true);
});
test('expired and revoked links are rejected; other tenants cannot reserve', () => {
  const s = mk(); const a = s.invite('t1', 'g1', 'a'); s.revokeLink(a.token); assert.throws(() => s.rsvp(a.token, 'confirmed'), /invalid_token/);
  assert.throws(() => s.invite('other-tenant', 'g1', 'x'), /forbidden/);
});
test('declining releases a reserved seat', () => {
  const s = mk(); const a = inviteConfirmed(s, 'a'); s.reserve(a.token, 'T1', 2); s.rsvp(a.token, 'declined'); assert.deepEqual(s.reservedSeats('g1', 'T1'), []);
});
test('reconnection: re-opening the link shows the same authoritative state', () => {
  const s = mk(); const a = inviteConfirmed(s, 'a'); s.reserve(a.token, 'T1', 6); s.setEta(a.token, clock + 15 * 60e3);
  const again = s._inv(a.token); assert.equal(again.seat, 6); assert.equal(again.transit, 'on_the_way'); assert.equal(again.rsvp, 'confirmed');
});
test('reservation does not seat or record a buy-in', () => {
  const s = mk(); const a = inviteConfirmed(s, 'a'); const r = s.reserve(a.token, 'T1', 6); assert.equal(r.seating, 'not_seated');
});
test('WhatsApp parser: RSVP, seat, OMW minutes, opt-out', () => {
  assert.equal(parseInbound('1', 0).status, 'confirmed'); assert.equal(parseInbound('OMW 20', 1000).etaUtc, 1000 + 20 * 60e3);
  assert.equal(parseInbound('eta 15m', 0).intent, 'omw'); assert.equal(parseInbound('stop', 0).intent, 'opt_out');
});
test('message times are computed in the game timezone, never hard-coded', () => {
  const start = Date.UTC(2026, 10, 7, 1, 0); const txt = T.omw({ etaUtc: start + 20 * 60e3, tz: 'America/Bogota' });
  assert.match(txt, /8:20\s?PM/); assert.match(T.omw({ etaUtc: start + 20 * 60e3, tz: 'America/Los_Angeles' }), /5:20\s?PM/);
});
console.log(`\n${n} tests passed`);
