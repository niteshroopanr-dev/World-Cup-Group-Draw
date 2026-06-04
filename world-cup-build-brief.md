# World Cup Family Draw — Production Build Brief

A step by step plan for building the family World Cup tool into a real website using Claude Code. You supervise; Claude Code does the coding.

The plan is staged so the most valuable piece (real cross country sharing) goes live early, with live data and odds added cleanly afterwards. It is a fun, low stakes family tool, so the approach stays deliberately simple.

**The stack:** a Vite + React frontend hosted on Vercel, a Supabase database (Postgres plus one scheduled function), BALLDONTLIE for live World Cup data, and optionally The Odds API. All free at this scale.

---

## How to use this document

There are two kinds of step below:

- **Claude Code:** an instruction for the agent. Paste or paraphrase it to Claude Code.
- **You:** a step in a browser or terminal that the agent cannot do for you.

Save this file as `BUILD_BRIEF.md` in an empty project folder. Start Claude Code in that folder, then say: *"Read BUILD_BRIEF.md. Let's do Stage 1 only, and stop at the checkpoint."* Do one stage at a time.

---

## Before you start (about 15 minutes, all you)

1. **Install Claude Code (Mac).** The native installer needs no Node.js:
   ```
   curl -fsSL https://claude.ai/install.sh | bash
   ```
   Or with Homebrew: `brew install --cask claude-code`. (The npm method `npm install -g @anthropic-ai/claude-code` also works and needs Node 18+, which your Expo setup already has.) Claude Code needs a paid Claude plan (Pro, Max, Team or Enterprise) or Console API access; the free plan does not include it.
2. **Make an empty project folder**, open Terminal, `cd` into it, and run `claude` to start.
3. **Create the accounts and keys** (have these ready to paste when asked):
   - A **GitHub** repo, or let Claude Code create one for you.
   - A **Supabase** project at supabase.com. From Project Settings then API, copy the **Project URL** and the **anon public key**.
   - A free **BALLDONTLIE** account and **API key**. Their World Cup feed defaults to the 2026 tournament.
   - Optional: a free key at the-odds-api.com if you want their odds instead.
4. **Download the prototype** from the chat (`world-cup-family-draw.jsx`) and drop it into the project folder so Claude Code can use it as the starting component.

A useful detail for Claude Code: the prototype already keeps all storage behind a single `store` object, and keeps the fixture list separate from the scoring logic. That means the database swap and the live data swap are each contained to one small area of the code.

---

## Stage 1 — Get it live (port and deploy)

Goal: the app runs as a real website and is deployed. An early win that proves the pipeline. Cross device sharing arrives in Stage 2.

**Claude Code:**
- Scaffold a Vite + React app (JavaScript, not TypeScript, to keep it light).
- Use the component in `world-cup-family-draw.jsx` as the main app. Keep its CSS exactly as is.
- The prototype's `store` object currently uses an in chat storage API. For Stage 1 only, reimplement `store` against the browser's `localStorage`, keeping the same method names (`getGroup`, `setGroup`, `getPreds`, `setPreds`, `getLast`, `setLast`) so later stages only touch this one object.
- Run it locally (`npm run dev`) and confirm the draw, Squads, Predict, Cup and Pot tabs all work.
- Initialise git and push to GitHub.

**You:**
- In Vercel (vercel.com), import the GitHub repo and deploy.
- Add your subdomain under Project then Settings then Domains: `worldcup.profit-pulse.com.au`. Vercel shows you a CNAME record; add it in your domain registrar's DNS.

**Checkpoint:** the app loads at your subdomain. Group codes only work on the same device for now.

---

## Stage 2 — Real cross country sharing (Supabase)

Goal: one group code works for your whole family, anywhere. This is the big unlock; once it is done you can let people start using it.

**Claude Code:**
- Add the Supabase JS client. Read the URL and anon key from environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Never hard code them.
- Create the tables using the SQL in the appendix below.
- Reimplement the `store` object against Supabase:
  - `setGroup` / `getGroup` read and write the group's row (name, members, alloc, pool).
  - For scores, write each result as an upsert into the `results` table, so two people entering different scores never clobber each other. The app reads a group's results and rebuilds the results map it already expects.
  - For predictions, generate a random `user_token` per browser (store it in `localStorage`) and upsert each person's picks into `predictions`, keyed by group and token. This keeps predictions per person.
  - Keep "last group" in `localStorage` (a per device convenience).
- Enable Row Level Security with the simple open policies in the appendix. This is a fun family tool, so open access for anyone holding the code is fine. A per group PIN can be added later if you ever want it.

**You:**
- Paste the appendix SQL into the Supabase SQL editor and run it.
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel (Settings then Environment Variables), then redeploy.

**Checkpoint:** create a group on your phone, open the code on a laptop. Same group, same scores, live.

The prototype's invented fixture dates can stay as they are for now; manual score entry still works. Stage 3 replaces them with the real schedule.

---

## Stage 3 — Automatic results from BALLDONTLIE

Goal: scores and group tables fill in on their own.

**Claude Code:**
- Create a Supabase Edge Function (TypeScript) called `refresh-scores` that:
  - Calls the BALLDONTLIE World Cup endpoints for matches and standings (season 2026). Authenticate with the BALLDONTLIE key stored as a Supabase secret, never in the frontend.
  - Replaces the prototype's invented fixtures with the real schedule: populate a `fixtures` table from the API, mapping BALLDONTLIE team names to the app's existing three letter codes via a small fixed name to code map. The app already holds the 48 teams and 12 groups, so this map is short.
  - Writes match scores into a shared `match_results` table keyed by the real fixture id. Because real games are the same for every family group, all groups derive from this one shared table rather than storing scores per group.
  - Schedule it with Supabase Cron, for example every 5 minutes, and only fetch during the tournament window.
- Update the frontend to load fixtures and results from these tables instead of the invented generator. The family scoring logic itself does not change, since it already reads from a fixtures list and a results map.

**You:**
- Add the BALLDONTLIE key as a Supabase secret (Edge Functions then Secrets).
- Deploy the function and set the cron schedule. Claude Code will give you the exact CLI commands.

**Checkpoint:** enter no scores yourself. Once real games play, the family table moves on its own.

Expect one fiddly bit: team name matching. BALLDONTLIE may say "Korea Republic" where the app says "South Korea", or "United States" versus "USA". Tell Claude Code to build and test the name map against the actual API response and to log any names it cannot match, so none slip through.

---

## Stage 4 — Odds beside each upcoming game

Goal: a home, draw, away line under each unplayed game in the Predict tab, purely as colour for the picks.

**Claude Code:**
- Extend the function (or add `refresh-odds`) to fetch pre match odds: BALLDONTLIE's odds endpoint returns moneyline prices in the same feed, or use The Odds API (sport key `soccer_fifa_world_cup`) for a wider set of bookmakers. Store the latest prices in an `odds` table keyed by fixture id. Keep the odds key as a Supabase secret.
- In the Predict tab, show the latest home, draw and away price under each upcoming fixture, clearly labelled as information only.
- Keep the existing "no real money, family game" framing. Do not add any betting flow.

**You:**
- Add the odds API key as a Supabase secret.
- Set a gentler cron schedule for odds; pre match prices move slowly, so once or twice a day is plenty and stays well inside the free limits.

**Checkpoint:** odds appear next to upcoming games and refresh on schedule.

---

## Guardrails and good habits (for Claude Code)

- Do one stage at a time. After each, run the app and confirm the checkpoint before moving on.
- Commit to git before and after each stage, so anything can be rolled back.
- API keys for BALLDONTLIE and the odds provider live only as Supabase secrets, never in the frontend or in git. The only key in the frontend is the Supabase anon key, which is designed to be public.
- Cache aggressively. Results never change once a game is full time, and odds move slowly. This is what keeps usage inside the free tiers.
- Keep it simple. This is a family game, not a high traffic product, so favour the plainest solution that works.

---

## Appendix: Supabase SQL (Stage 2)

```sql
-- One row per family draw
create table if not exists groups (
  code    text primary key,
  name    text not null,
  members jsonb not null default '[]',
  alloc   jsonb not null default '{}',
  pool    jsonb not null default '{}',
  created timestamptz not null default now()
);

-- One row per fixture per group (manual scores)
create table if not exists results (
  group_code text not null references groups(code) on delete cascade,
  fixture_id text not null,
  home int not null,
  away int not null,
  updated timestamptz not null default now(),
  primary key (group_code, fixture_id)
);

-- Per person predictions
create table if not exists predictions (
  group_code text not null references groups(code) on delete cascade,
  user_token text not null,
  picks jsonb not null default '{}',
  updated timestamptz not null default now(),
  primary key (group_code, user_token)
);

-- Open access for a low stakes family tool
alter table groups enable row level security;
alter table results enable row level security;
alter table predictions enable row level security;

create policy "read groups"   on groups      for select using (true);
create policy "insert groups" on groups      for insert with check (true);
create policy "update groups" on groups      for update using (true);
create policy "read results"   on results     for select using (true);
create policy "insert results" on results     for insert with check (true);
create policy "update results" on results     for update using (true);
create policy "read preds"   on predictions for select using (true);
create policy "insert preds" on predictions for insert with check (true);
create policy "update preds" on predictions for update using (true);
```

## Appendix: extra tables (Stage 3 and 4)

Claude Code should adjust these to the real shape of the BALLDONTLIE response.

```sql
-- Real schedule, replaces the prototype's invented fixtures (Stage 3)
create table if not exists fixtures (
  fixture_id text primary key,
  grp        text,
  home_code  text,
  away_code  text,
  kickoff    timestamptz,
  round      int
);

-- Shared real results, same for every group (Stage 3)
create table if not exists match_results (
  fixture_id text primary key references fixtures(fixture_id),
  home int, away int, status text,
  updated timestamptz default now()
);

-- Latest pre match odds per fixture (Stage 4)
create table if not exists odds (
  fixture_id text primary key references fixtures(fixture_id),
  home numeric, draw numeric, away numeric,
  updated timestamptz default now()
);
```

## Reference: free tiers

- **BALLDONTLIE:** free account and key; World Cup feed covers matches, standings, events and odds; defaults to 2026.
- **API-Football:** 100 requests per day free; an alternative results source with roughly 15 to 60 second live refresh.
- **The Odds API:** 500 credits per month free; a two region, three market call costs 6 credits, so cache.
- **Supabase and Vercel:** free tiers are comfortably enough for this.
