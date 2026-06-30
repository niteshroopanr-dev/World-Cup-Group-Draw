-- Stage 4 (data layer only): additive columns for extra-time / penalty-shootout detail.
--
-- The BALLDONTLIE feed exposes, per match, has_extra_time, has_penalty_shootout and the
-- penalty-shootout score (home/away spot-kicks). The sync now reads these and writes them here.
--
-- STRICTLY ADDITIVE AND SAFE ON THE LIVE TABLE:
--   * Only ADD COLUMN; no existing column is altered, renamed or dropped.
--   * Every column is NULLABLE with NO default, so all existing rows stay NULL and no row is
--     rewritten (adding a nullable column with no default is a fast metadata-only change in
--     Postgres — no table rewrite, no lock on existing data).
--   * Nothing in the app reads these columns yet, so current reads and scoring are unaffected.
--   * IF NOT EXISTS on each column makes this script safe to re-run.
--
-- The matches table already has an anon SELECT policy `using (true)` and a table-level
-- `grant select`, both of which are column-agnostic, so these new columns are readable by the
-- browser automatically — no policy or grant change is needed. The table is already in the
-- `supabase_realtime` publication; new columns are included in change payloads automatically, so
-- there is nothing to republish.
--
-- Run in the Supabase dashboard SQL editor (Project: World Cup Draw).

alter table matches add column if not exists home_score_penalties int;
alter table matches add column if not exists away_score_penalties int;
alter table matches add column if not exists has_extra_time        boolean;
alter table matches add column if not exists has_penalty_shootout  boolean;

-- ---- Verify (optional) ----
-- New columns exist and are nullable with no default:
--   select column_name, data_type, is_nullable, column_default
--   from information_schema.columns
--   where table_name = 'matches'
--     and column_name in ('home_score_penalties','away_score_penalties','has_extra_time','has_penalty_shootout')
--   order by column_name;
-- All existing rows are NULL for the new columns until the updated sync has run:
--   select count(*) as rows, count(has_penalty_shootout) as with_pen_flag from matches;
