# Invitations, RSVP, Reservations & WhatsApp: backend specification

The UI in `index.html` (WF1, 8, 48–54, 60, 68) is a **prototype**. Nothing here is connected to it. This folder is what the real backend must do.

| File | What it is |
|---|---|
| `schema.sql` | PostgreSQL migration: separate RSVP/seat/transit/seating fields, unique active seat index, audit, consent, idempotent message log |
| `reservation-service.js` | Reference implementation of the single authoritative service (in-memory) with the exact rules |
| `whatsapp-adapter.js` | `MessagingAdapter` interface, Evolution API adapter, inbound parser, timezone-computed templates |
| `tests.js` | `node tests.js` runs 14 tests (conflicts, expiry, duplicate webhooks, multi-table, reconnection, timezones) |

## Rules that must hold
1. **A reservation is not a buy-in.** `seating_status` becomes `seated` only after WF03 (Seat Player + Initial Buy-In) succeeds. Reservations never create chips, hours or ledger rows.
2. **One authoritative service** for the PWA link and WhatsApp. Seat claims are atomic: the partial unique index `uq_active_seat` is the double-booking guard.
3. **Countdown policy is explicit** (`countdown_from`: GAME_START or PLAYER_ETA), never an ambiguous mix. A reminder is sent before automatic release; every release is audited with a reason.
4. A physically seated player is never replaced or released automatically. Host override blocks auto-release.
5. Webhooks are idempotent by provider event id. Links are secure random tokens (stored hashed), expiring and revocable. Players never see other players' phone numbers, finances or a hidden address.
6. WhatsApp: opt-in consent, STOP handling, delivery-status tracking, approved templates where required. Business logic only talks to `MessagingAdapter`, so Evolution API can be swapped for the WhatsApp Cloud API.

## Still to build (not in this repo)
Real auth and tenant isolation (RLS), Postgres service and migrations, realtime channel (SSE/WebSocket) for table and dashboard updates, Evolution API instance and webhook endpoint, scheduled jobs (reminders, expiry sweep, waitlist offers), natural-language ETA parsing, PWA RSVP page, integration with the existing WF03 buy-in and WF09 waitlist services.

## Prototype status of each screen
All numbers, names, times and message threads in the UI are demo data. Times are computed from a demo clock (not hard-coded text). The WhatsApp conversation screens are **simulated**, not delivered.
