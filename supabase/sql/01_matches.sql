-- Stage 3: shared, tournament-wide feed of all 104 World Cup matches (group stage + knockouts).
-- Written ONLY by the server-side sync job (the sync-matches Edge Function, via the service-role
-- key, which bypasses RLS). The browser only ever READS this table. Has room for 1X2 odds (added
-- in a later step) alongside live scores and status.

create table if not exists matches (
  id           bigint primary key,          -- BALLDONTLIE match id (stable across the tournament)
  match_number int,                          -- 1..104 (1..72 are group stage)
  fixture      text,                         -- app FIXTURES id for matched group-stage games; null otherwise
  stage        text,                         -- e.g. "Group Stage", "Round of 16", "Final"
  grp          text,                         -- group letter (A..L) when applicable
  kickoff      timestamptz,                  -- official UTC kickoff
  status       text,                         -- scheduled | in_progress | completed | postponed | cancelled
  home_team    text,                         -- app team id (mapped); raw abbreviation or null if undecided
  away_team    text,
  home_score   int,
  away_score   int,
  home_odds    numeric,                       -- 1X2 odds — room to fill in later
  draw_odds    numeric,
  away_odds    numeric,
  updated_at   timestamptz not null default now()
);

create index if not exists matches_fixture_idx on matches (fixture);

alter table matches enable row level security;

-- Read-only for the browser (anon). No anon write policy on purpose: only the sync job writes,
-- via the service-role key (bypasses RLS), so official scores can't be tampered with from a client.
drop policy if exists anon_read_matches on matches;
create policy anon_read_matches on matches for select to anon using (true);

-- Grants matter: without an explicit SELECT grant, PostgREST omits the table from its schema cache
-- and the REST API 404s it (PGRST205) even with the policy above. (This bit us on Stage 2.)
grant usage on schema public to anon, authenticated;
grant select on matches to anon, authenticated;

-- Realtime, so score/status changes fan out to open devices like the other tables.
alter publication supabase_realtime add table matches;
