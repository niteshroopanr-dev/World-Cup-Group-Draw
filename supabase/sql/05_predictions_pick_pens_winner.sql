-- Stage 6 (data layer only): widen the predictions.pick CHECK constraint for the penalty-winner picks.
--
-- The knockout penalty option now names the winner, so the app stores "home:pens" / "away:pens"
-- (matching the existing "home:nt"/"away:nt"/"home:et"/"away:et" pattern). The old bare "pens"
-- (shootout, no winner named) stays allowed for backward compatibility with picks already stored.
--
-- STRICTLY ADDITIVE — IT ONLY WIDENS WHAT IS PERMITTED:
--   * The full list keeps every currently-allowed value
--     (home, draw, away, home:nt, away:nt, home:et, away:et, pens) and ADDS home:pens / away:pens.
--   * Every prediction already stored uses one of the currently-allowed values, so every existing row
--     still satisfies the new constraint — the ADD CONSTRAINT re-validates all rows and cannot fail.
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
    check (pick in ('home', 'draw', 'away', 'home:nt', 'away:nt', 'home:et', 'away:et', 'pens', 'home:pens', 'away:pens'));
commit;

-- ---- Verify (optional) ----
-- The new constraint definition (should list all ten values, including home:pens / away:pens):
--   select pg_get_constraintdef(oid) from pg_constraint where conname = 'predictions_pick_check';
-- No existing row violates it (expect 0):
--   select count(*) from predictions
--   where pick not in ('home','draw','away','home:nt','away:nt','home:et','away:et','pens','home:pens','away:pens');
