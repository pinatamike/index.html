-- NORA Invitations, RSVP & Reservations — PostgreSQL migration (backend still to be built; the UI prototype does not use it)
-- All timestamps are UTC (timestamptz); presentation uses games.timezone. Every table carries tenant_id for isolation (enable RLS).

create table game_invitation_settings (
  tenant_id uuid primary key,
  allow_seat_reservations boolean not null default true,
  grace_minutes int not null default 30 check (grace_minutes between 5 and 240),
  countdown_from text not null default 'GAME_START' check (countdown_from in ('GAME_START','PLAYER_ETA')),
  auto_release boolean not null default true,
  notify_waitlist boolean not null default true,
  host_approves_seat_changes boolean not null default false,
  waitlist_offer_minutes int not null default 10,
  reminder_offsets_min int[] not null default '{1440,120,30}',
  address_visibility text not null default 'AFTER_CONFIRM' check (address_visibility in ('AFTER_CONFIRM','NEVER')),
  message_language text not null default 'en',
  whatsapp_provider text not null default 'evolution'
);

create table invitations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null, game_id uuid not null, player_id uuid not null,
  -- separate dimensions: a player can be confirmed + reserved + on the way at once
  rsvp_status text not null default 'invited' check (rsvp_status in ('invited','confirmed','tentative','declined')),
  seat_status text not null default 'none' check (seat_status in ('none','reserved','released','expired')),
  transit_status text not null default 'not_started' check (transit_status in ('not_started','on_the_way','arrived')),
  seating_status text not null default 'not_seated' check (seating_status in ('not_seated','seated')),  -- set only by WF03 buy-in success
  waitlist_position int, waitlist_status text check (waitlist_status in ('waiting','offered','accepted','expired','removed')),
  table_id uuid, seat_number int,
  eta_at timestamptz, reservation_expires_at timestamptz, host_override boolean not null default false,
  channel text not null default 'both', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (game_id, player_id)
);
-- the single guarantee against double booking: one active reservation per (game, table, seat)
create unique index uq_active_seat on invitations (game_id, table_id, seat_number) where seat_status = 'reserved';
create index ix_inv_expiry on invitations (reservation_expires_at) where seat_status = 'reserved';

create table invitation_tokens (
  token_hash bytea primary key,                       -- sha256 of the random token, never the token itself
  invitation_id uuid not null references invitations(id) on delete cascade,
  tenant_id uuid not null, expires_at timestamptz not null, revoked_at timestamptz
);

create table reservation_audit (
  id bigserial primary key, tenant_id uuid not null, game_id uuid not null, invitation_id uuid,
  action text not null, actor text not null,           -- player | host:<user> | system | whatsapp
  detail jsonb not null default '{}', at timestamptz not null default now()
);  -- append-only: revoke UPDATE/DELETE

create table messaging_consent (
  tenant_id uuid not null, player_id uuid not null, phone_e164 text not null,
  opted_in_at timestamptz, opted_out_at timestamptz, source text,
  primary key (tenant_id, player_id)
);

create table message_log (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null, invitation_id uuid,
  direction text not null check (direction in ('out','in')), provider_event_id text,  -- idempotency
  body text, status text, created_at timestamptz not null default now(),
  unique (tenant_id, provider_event_id)                 -- duplicate webhooks cannot apply twice
);

-- Waitlist stays WF09's table; add invitation_id so reservations and the waitlist share one list.
