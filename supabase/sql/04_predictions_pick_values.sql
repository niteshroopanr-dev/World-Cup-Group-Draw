-- Stage 5 (data layer only): widen the predictions.pick CHECK constraint for richer knockout picks.
--
-- The Predict tab now stores a combined knockout choice (winner + manner) as a single per-match value:
--   home:nt / away:nt  (team, decided in normal time)
--   home:et / away:et  (team, after extra time)
--   pens               (decided by a penalty shootout)
-- Group-stage and legacy knockout picks still use the original home / draw / away. The existing
-- constraint `predictions_pick_check` only permits home / draw / away, so the new values are rejected
-- (Postgres error 23514) until this runs.
--
-- STRICTLY ADDITIVE — IT ONLY WIDENS WHAT IS PERMITTED:
--   * The full list keeps home / draw / away unchanged and simply ADDS the five new values.
--   * Every prediction already stored uses home / draw / away (the only values the old constraint
--     allowed), so every existing row still satisfies the new constraint — the ADD CONSTRAINT
--     re-validates all rows and cannot fail on existing data.
--   * No table, column, policy, index, or row data is changed; nothing here touches the matches work.
--
-- SAFE ON THE LIVE TABLE: the drop + re-add run in one transaction (no committed window without a
-- constraint), validation over the existing rows is near-instant, and the brief ACCESS EXCLUSIVE lock
-- on `predictions` is momentary. Re-runnable: DROP ... IF EXISTS makes a second run a no-op-then-rebuild.
--
-- Run in the Supabase dashboard SQL editor (Project: World Cup Draw). Review first; this is the only
-- step that changes the predictions table.

begin;
  alter table predictions drop constraint if exists predictions_pick_check;
  alter table predictions add constraint predictions_pick_check
    check (pick in ('home', 'draw', 'away', 'home:nt', 'away:nt', 'home:et', 'away:et', 'pens'));
commit;

-- ---- Verify (optional) ----
-- The new constraint definition (should list all eight values):
--   select pg_get_constraintdef(oid) from pg_constraint where conname = 'predictions_pick_check';
-- No existing row violates it (expect 0):
--   select count(*) from predictions
--   where pick not in ('home','draw','away','home:nt','away:nt','home:et','away:et','pens');
