'use strict';
/* Replaceable messaging layer. Business logic only sees MessagingAdapter; swap EvolutionAdapter for CloudApiAdapter later. */
class MessagingAdapter { async send(/* {to, text|template, idempotencyKey} */) { throw new Error('not implemented'); } }

/* Evolution API (self-hosted). Endpoint/headers per your Evolution version: POST {base}/message/sendText/{instance} with apikey header. */
class EvolutionAdapter extends MessagingAdapter {
  constructor({ baseUrl, instance, apiKey, fetchImpl = fetch }) { super(); Object.assign(this, { baseUrl, instance, apiKey, fetchImpl }); }
  async send({ to, text }) {
    const res = await this.fetchImpl(`${this.baseUrl}/message/sendText/${this.instance}`, {
      method: 'POST', headers: { 'content-type': 'application/json', apikey: this.apiKey }, body: JSON.stringify({ number: to, text }) });
    if (!res.ok) throw new Error('send_failed_' + res.status); return res.json();
  }
}

/* Times are computed from the game's timezone + current time. Nothing is hard-coded. */
function fmtTime(utcMs, tz, locale = 'en-US') { return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', timeZone: tz }).format(new Date(utcMs)); }
const T = {
  invite: ({ title, startUtc, tz, blinds }) => `${title}\nStarts ${fmtTime(startUtc, tz)}\nBlinds ${blinds}\n\nReply:\n1 — I’m In\n2 — Running Late\n3 — Out`,
  confirmed: () => 'You’re confirmed! Would you like to reserve a seat? Reply with a seat number or OPEN to view the table.',
  reserved: seat => `Seat ${seat} reserved. Reply OMW when you’re heading over.`,
  omw: ({ etaUtc, tz }) => `Perfect. Your host has been notified. Expected arrival: ${fmtTime(etaUtc, tz)}.`,
};

/* Inbound intents. Natural-language times beyond "OMW 20" / "ETA 15m" go to an LLM parser behind the same return shape. */
function parseInbound(text, nowUtc) {
  const t = String(text || '').trim().toUpperCase();
  if (/^(STOP|UNSUBSCRIBE|BAJA)$/.test(t)) return { intent: 'opt_out' };
  if (/^(1|YES|Y|SI|SÍ|IN)$/.test(t)) return { intent: 'rsvp', status: 'confirmed' };
  if (/^(2|LATE)$/.test(t)) return { intent: 'rsvp', status: 'tentative' };
  if (/^(3|NO|N|OUT)$/.test(t)) return { intent: 'rsvp', status: 'declined' };
  if (t === 'OPEN') return { intent: 'list_open_seats' };
  if (t === 'LINK') return { intent: 'send_link' };
  if (/^CANCEL/.test(t)) return { intent: 'cancel_reservation' };
  let m = t.match(/^(?:OMW|ETA)\s*(\d{1,3})\s*(?:M|MIN|MINS)?$/);
  if (m) return { intent: 'omw', etaUtc: nowUtc + Number(m[1]) * 60e3 };
  if (t === 'OMW') return { intent: 'omw', etaUtc: null };
  m = t.match(/^(?:SEAT\s*)?(\d{1,2})$/);
  if (m) return { intent: 'seat', seat: Number(m[1]) };    // context decides: "1" at the RSVP step is an answer, a number after confirmation is a seat
  return { intent: 'unknown' };
}
module.exports = { MessagingAdapter, EvolutionAdapter, T, parseInbound, fmtTime };
