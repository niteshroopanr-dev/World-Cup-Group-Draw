// supabase/functions/sync-matches/index.ts
//
// Stage 3 backend job. Pulls the real 2026 FIFA World Cup feed from BALLDONTLIE and upserts every
// match into the shared `matches` table. Group-stage games are mapped to the app's existing
// FIXTURES (by the unordered pair of the two teams) so scores can later flow into the app.
//
// SECURITY: the paid BALLDONTLIE key lives ONLY here, as a Supabase Edge Function secret
// (Deno.env.get("BALLDONTLIE_KEY")). It is never in the app bundle, the repo, or any client code.
// Writes use the auto-injected SERVICE_ROLE key, which bypasses RLS; the browser only ever reads
// `matches`. Auth header for BALLDONTLIE is the raw key (no "Bearer").
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BDL_BASE = "https://api.balldontlie.io/fifa/worldcup/v1";

/* ---- App data — mirrors src/App.jsx (TEAMS ids/names + GROUPS). Keep in sync. ---- */
const APP_TEAMS: Record<string, string> = {
  ESP: "Spain", ARG: "Argentina", FRA: "France", ENG: "England", BRA: "Brazil", POR: "Portugal",
  NED: "Netherlands", BEL: "Belgium", GER: "Germany", CRO: "Croatia", MAR: "Morocco", COL: "Colombia",
  MEX: "Mexico", URU: "Uruguay", USA: "USA", SUI: "Switzerland", JPN: "Japan", SEN: "Senegal",
  IRN: "Iran", KOR: "South Korea", ECU: "Ecuador", AUT: "Austria", AUS: "Australia", TUR: "Türkiye",
  NOR: "Norway", SWE: "Sweden", EGY: "Egypt", CAN: "Canada", CIV: "Côte d'Ivoire", TUN: "Tunisia",
  ALG: "Algeria", QAT: "Qatar", PAR: "Paraguay", CZE: "Czechia", SCO: "Scotland", PAN: "Panama",
  KSA: "Saudi Arabia", IRQ: "Iraq", UZB: "Uzbekistan", RSA: "South Africa", JOR: "Jordan", COD: "DR Congo",
  BIH: "Bosnia & Herz.", CPV: "Cabo Verde", GHA: "Ghana", CUW: "Curaçao", HAI: "Haiti", NZL: "New Zealand",
};
const GROUPS: Record<string, string[]> = {
  A: ["MEX", "RSA", "KOR", "CZE"], B: ["SUI", "CAN", "QAT", "BIH"],
  C: ["BRA", "MAR", "SCO", "HAI"], D: ["USA", "AUS", "TUR", "PAR"],
  E: ["GER", "ECU", "CIV", "CUW"], F: ["NED", "JPN", "SWE", "TUN"],
  G: ["BEL", "IRN", "EGY", "NZL"], H: ["ESP", "URU", "KSA", "CPV"],
  I: ["FRA", "SEN", "NOR", "IRQ"], J: ["ARG", "AUT", "ALG", "JOR"],
  K: ["POR", "COL", "UZB", "COD"], L: ["ENG", "CRO", "PAN", "GHA"],
};

// Rebuild the app's 72 group fixtures, indexed by the unordered team pair.
const pairKey = (a: string, b: string) => [a, b].sort().join("|");
const FIXTURES: { id: string; grp: string; home: string; away: string }[] = (() => {
  const rounds = [[[0, 1], [2, 3]], [[0, 2], [1, 3]], [[0, 3], [1, 2]]];
  const out: { id: string; grp: string; home: string; away: string }[] = [];
  for (const L of Object.keys(GROUPS)) {
    const ids = GROUPS[L];
    rounds.forEach((pairs, r) => pairs.forEach((p) => {
      out.push({ id: `${L}${r}${p[0]}${p[1]}`, grp: L, home: ids[p[0]], away: ids[p[1]] });
    }));
  }
  return out;
})();
const FIX_BY_PAIR: Record<string, { id: string; grp: string; home: string; away: string }> = {};
for (const fx of FIXTURES) FIX_BY_PAIR[pairKey(fx.home, fx.away)] = fx;

/* ---- BALLDONTLIE team -> app team id. Abbreviations are FIFA tri-codes (same as app ids), so a
       direct match handles almost everything; the name map + aliases cover any naming variants. ---- */
const norm = (s: string) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const NAME_TO_ID: Record<string, string> = {};
for (const [id, name] of Object.entries(APP_TEAMS)) NAME_TO_ID[norm(name)] = id;
const ALIASES: Record<string, string> = {
  unitedstates: "USA", unitedstatesofamerica: "USA",
  bosniaandherzegovina: "BIH", bosniaherzegovina: "BIH",
  ivorycoast: "CIV",
  congodr: "COD", drcongo: "COD", democraticrepublicofthecongo: "COD",
  capeverde: "CPV",
  korearepublic: "KOR", republicofkorea: "KOR",
  iriran: "IRN", islamicrepublicofiran: "IRN",
  turkey: "TUR",
  czechrepublic: "CZE",
};
for (const [k, v] of Object.entries(ALIASES)) NAME_TO_ID[k] = v;

const resolveId = (abbr?: string | null, name?: string | null): string | null => {
  if (abbr && APP_TEAMS[abbr.toUpperCase()]) return abbr.toUpperCase();
  if (name && NAME_TO_ID[norm(name)]) return NAME_TO_ID[norm(name)];
  if (abbr && NAME_TO_ID[norm(abbr)]) return NAME_TO_ID[norm(abbr)];
  return null;
};

async function bdlFetch(path: string, key: string): Promise<any[]> {
  const out: any[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < 20; page++) {
    const url = new URL(BDL_BASE + path);
    url.searchParams.set("per_page", "100");
    if (cursor) url.searchParams.set("cursor", cursor);
    const res = await fetch(url.toString(), { headers: { Authorization: key } });
    if (!res.ok) throw new Error(`BALLDONTLIE ${path} -> ${res.status}: ${await res.text()}`);
    const body = await res.json();
    const items: any[] = body.data ?? [];
    out.push(...items);
    const next = body.meta?.next_cursor;
    if (next === null || next === undefined || items.length === 0) break;
    cursor = String(next);
  }
  return out;
}

// Group-stage games carry a group (A..L); knockout games do not. (BALLDONTLIE's match_number is a
// per-round counter with duplicates, so it is NOT a reliable 1..104 discriminator.)
const isGroupStage = (m: any) => !!m.group?.name;

Deno.serve(async () => {
  try {
    const key = Deno.env.get("BALLDONTLIE_KEY");
    if (!key) return json({ error: "BALLDONTLIE_KEY secret is not set" }, 500);
    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Teams — build the abbreviation -> app id map and surface anything that did not resolve.
    const teams = await bdlFetch("/teams", key);
    const abbrToId: Record<string, string> = {};
    const unmappedTeams: { abbreviation: string | null; name: string }[] = [];
    for (const t of teams) {
      const id = resolveId(t.abbreviation, t.name);
      if (id) { if (t.abbreviation) abbrToId[t.abbreviation.toUpperCase()] = id; }
      else unmappedTeams.push({ abbreviation: t.abbreviation ?? null, name: t.name });
    }
    const idOf = (team: any): string | null => {
      if (!team) return null;
      const ab = (team.abbreviation || "").toUpperCase();
      return abbrToId[ab] ?? resolveId(team.abbreviation, team.name);
    };

    // 2. Matches — upsert all; map group-stage games to app fixtures with correct orientation.
    const matches = await bdlFetch("/matches", key);
    const rows: any[] = [];
    const matchedFixtures = new Set<string>();
    const unmatched: any[] = [];
    for (const m of matches) {
      const homeId = idOf(m.home_team);
      const awayId = idOf(m.away_team);
      const group = isGroupStage(m);
      let fixture: string | null = null;
      let grp: string | null = m.group?.name ?? null;
      let homeTeam = homeId ?? m.home_team?.abbreviation ?? null;
      let awayTeam = awayId ?? m.away_team?.abbreviation ?? null;
      let hs = m.home_score ?? null;
      let as = m.away_score ?? null;

      if (group && homeId && awayId) {
        const fx = FIX_BY_PAIR[pairKey(homeId, awayId)];
        if (fx) {
          fixture = fx.id; grp = fx.grp; matchedFixtures.add(fx.id);
          homeTeam = fx.home; awayTeam = fx.away;
          if (homeId !== fx.home) { const t = hs; hs = as; as = t; } // orient scores to the app's home/away
        } else {
          unmatched.push({ match_number: m.match_number, group: m.group?.name, home: m.home_team?.abbreviation, away: m.away_team?.abbreviation, homeId, awayId, reason: "pair-not-in-app-groups" });
        }
      } else if (group) {
        unmatched.push({ match_number: m.match_number, group: m.group?.name, home: m.home_team?.abbreviation, away: m.away_team?.abbreviation, homeId, awayId, reason: "team-unmapped" });
      }

      rows.push({
        id: m.id,
        match_number: m.match_number ?? null,
        fixture,
        stage: m.stage?.name ?? null,
        grp,
        kickoff: m.datetime ?? null,
        status: m.status ?? null,
        home_team: homeTeam,
        away_team: awayTeam,
        home_score: hs,
        away_score: as,
        updated_at: new Date().toISOString(),
      });
    }

    if (rows.length) {
      const { error } = await supa.from("matches").upsert(rows, { onConflict: "id" });
      if (error) return json({ error: "upsert failed: " + error.message, sampleRow: rows[0] }, 500);
    }

    // 3. Report
    const missingFixtures = FIXTURES.filter((fx) => !matchedFixtures.has(fx.id))
      .map((fx) => ({ id: fx.id, grp: fx.grp, pair: `${fx.home} v ${fx.away}` }));
    const sample = rows.filter((r) => r.fixture).slice(0, 6).map((r) => ({
      fixture: r.fixture, grp: r.grp, teams: `${r.home_team} v ${r.away_team}`,
      kickoff: r.kickoff, status: r.status,
      score: r.home_score != null ? `${r.home_score}-${r.away_score}` : null,
    }));
    return json({
      ok: true,
      totals: { teams: teams.length, matches: matches.length, upserted: rows.length },
      groupFixtures: { target: 72, matched: matchedFixtures.size, missing: 72 - matchedFixtures.size },
      missingFixtures,
      unmatchedBdlGroupMatches: unmatched,
      unmappedTeams,
      sample,
    });
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, null, 2), { status, headers: { "Content-Type": "application/json" } });
}
