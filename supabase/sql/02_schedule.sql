-- Stage 3: schedule the sync hands-free.
-- Runs the sync-matches Edge Function automatically every 1 minute via pg_cron + pg_net, so real
-- kick-off times, statuses and scores stay current with nobody pressing anything.
--
-- The paid BALLDONTLIE key stays server-side (it lives only as the Edge Function's secret). This job
-- never touches it: pg_net makes a server-side HTTPS call from inside Postgres to the function URL,
-- authenticated with the project's service_role key. Nothing here reaches the browser.
--
-- Run this in the Supabase dashboard SQL editor (Project: World Cup Draw). Replace
-- <SERVICE_ROLE_KEY> with the service_role key from Project Settings -> API -> Project API keys.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Replace any earlier copy of the job so re-running this script is safe.
do $$
begin
  perform cron.unschedule('sync-matches-every-1-min');
exception when others then null;
end $$;

select cron.schedule(
  'sync-matches-every-1-min',
  '* * * * *',
  $$
  select net.http_post(
    url     := 'https://ilybvcmueutdkygconib.supabase.co/functions/v1/sync-matches',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer <SERVICE_ROLE_KEY>'
    )
  ) as request_id;
  $$
);

-- ---- Verify it is active ----
-- The schedule:
--   select jobid, jobname, schedule, active from cron.job where jobname = 'sync-matches-every-1-min';
-- Recent runs (one row per minute once it is live):
--   select j.jobname, r.status, r.start_time, r.end_time
--   from cron.job_run_details r join cron.job j using (jobid)
--   where j.jobname = 'sync-matches-every-1-min'
--   order by r.start_time desc limit 5;
-- The feed actually refreshing (this timestamp should advance every minute):
--   select max(updated_at) as last_sync from matches;
