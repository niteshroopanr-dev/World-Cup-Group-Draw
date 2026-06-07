import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Trophy, Users, UserPlus, Plus, X, Copy, Check, ArrowLeft, Sparkles,
  Crown, Coins, Wand2, Flag, Shuffle, Info, RotateCcw, Lock, ChevronDown, Share2
} from "lucide-react";
import { supabase } from "./supabase.js";

/* ------------------------------------------------------------------ */
/*  DATA  —  2026 FIFA World Cup (48 teams, 12 groups)                 */
/*  Rankings below are an approximate FIFA-ranking ordering used only  */
/*  to tier the draw. The live website version pulls official figures. */
/* ------------------------------------------------------------------ */
const TEAMS = {
  ESP:{n:"Spain",f:"🇪🇸",g:"H",r:2},  ARG:{n:"Argentina",f:"🇦🇷",g:"J",r:3},
  FRA:{n:"France",f:"🇫🇷",g:"I",r:1}, ENG:{n:"England",f:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",g:"L",r:4},
  BRA:{n:"Brazil",f:"🇧🇷",g:"C",r:6}, POR:{n:"Portugal",f:"🇵🇹",g:"K",r:5},
  NED:{n:"Netherlands",f:"🇳🇱",g:"F",r:7}, BEL:{n:"Belgium",f:"🇧🇪",g:"G",r:9},
  GER:{n:"Germany",f:"🇩🇪",g:"E",r:10}, CRO:{n:"Croatia",f:"🇭🇷",g:"L",r:11},
  MAR:{n:"Morocco",f:"🇲🇦",g:"C",r:8}, COL:{n:"Colombia",f:"🇨🇴",g:"K",r:12},
  MEX:{n:"Mexico",f:"🇲🇽",g:"A",r:14}, URU:{n:"Uruguay",f:"🇺🇾",g:"H",r:16},
  USA:{n:"USA",f:"🇺🇸",g:"D",r:15}, SUI:{n:"Switzerland",f:"🇨🇭",g:"B",r:18},
  JPN:{n:"Japan",f:"🇯🇵",g:"F",r:17}, SEN:{n:"Senegal",f:"🇸🇳",g:"I",r:13},
  IRN:{n:"Iran",f:"🇮🇷",g:"G",r:19}, KOR:{n:"South Korea",f:"🇰🇷",g:"A",r:23},
  ECU:{n:"Ecuador",f:"🇪🇨",g:"E",r:21}, AUT:{n:"Austria",f:"🇦🇹",g:"J",r:22},
  AUS:{n:"Australia",f:"🇦🇺",g:"D",r:24}, TUR:{n:"Türkiye",f:"🇹🇷",g:"D",r:20},
  NOR:{n:"Norway",f:"🇳🇴",g:"I",r:28}, SWE:{n:"Sweden",f:"🇸🇪",g:"F",r:31},
  EGY:{n:"Egypt",f:"🇪🇬",g:"G",r:26}, CAN:{n:"Canada",f:"🇨🇦",g:"B",r:27},
  CIV:{n:"Côte d'Ivoire",f:"🇨🇮",g:"E",r:30}, TUN:{n:"Tunisia",f:"🇹🇳",g:"F",r:35},
  ALG:{n:"Algeria",f:"🇩🇿",g:"J",r:25}, QAT:{n:"Qatar",f:"🇶🇦",g:"B",r:38},
  PAR:{n:"Paraguay",f:"🇵🇾",g:"D",r:32}, CZE:{n:"Czechia",f:"🇨🇿",g:"A",r:33},
  SCO:{n:"Scotland",f:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",g:"C",r:34}, PAN:{n:"Panama",f:"🇵🇦",g:"L",r:29},
  KSA:{n:"Saudi Arabia",f:"🇸🇦",g:"H",r:41}, IRQ:{n:"Iraq",f:"🇮🇶",g:"I",r:39},
  UZB:{n:"Uzbekistan",f:"🇺🇿",g:"K",r:37}, RSA:{n:"South Africa",f:"🇿🇦",g:"A",r:40},
  JOR:{n:"Jordan",f:"🇯🇴",g:"J",r:42}, COD:{n:"DR Congo",f:"🇨🇩",g:"K",r:36},
  BIH:{n:"Bosnia & Herz.",f:"🇧🇦",g:"B",r:43}, CPV:{n:"Cabo Verde",f:"🇨🇻",g:"H",r:44},
  GHA:{n:"Ghana",f:"🇬🇭",g:"L",r:45}, CUW:{n:"Curaçao",f:"🇨🇼",g:"E",r:46},
  HAI:{n:"Haiti",f:"🇭🇹",g:"C",r:47}, NZL:{n:"New Zealand",f:"🇳🇿",g:"G",r:48},
};
const GROUPS = {
  A:["MEX","RSA","KOR","CZE"], B:["SUI","CAN","QAT","BIH"],
  C:["BRA","MAR","SCO","HAI"], D:["USA","AUS","TUR","PAR"],
  E:["GER","ECU","CIV","CUW"], F:["NED","JPN","SWE","TUN"],
  G:["BEL","IRN","EGY","NZL"], H:["ESP","URU","KSA","CPV"],
  I:["FRA","SEN","NOR","IRQ"], J:["ARG","AUT","ALG","JOR"],
  K:["POR","COL","UZB","COD"], L:["ENG","CRO","PAN","GHA"],
};
const LETTERS = Object.keys(GROUPS);
const tierOf = (id) => Math.ceil(TEAMS[id].r / 12);
const TIER_NAMES = { 1:"Elite", 2:"Strong", 3:"Mid", 4:"Underdog" };
const TIER_VAR = { 1:"var(--t1)", 2:"var(--t2)", 3:"var(--t3)", 4:"var(--t4)" };

// 72 group-stage fixtures, approximate dates (11–27 June).
const FIXTURES = (() => {
  const rounds = [[[0,1],[2,3]], [[0,2],[1,3]], [[0,3],[1,2]]];
  const out = [];
  LETTERS.forEach((L, gi) => {
    GROUPS[L]; const ids = GROUPS[L];
    rounds.forEach((pairs, r) => {
      pairs.forEach((p, pi) => {
        const day = [11,16,22][r] + Math.floor(gi/2);
        const hour = pi === 0 ? 18 : 21;
        out.push({ id:`${L}${r}${p[0]}${p[1]}`, grp:L, round:r,
          home:ids[p[0]], away:ids[p[1]], ko: Date.UTC(2026, 5, Math.min(day,27), hour, 0) });
      });
    });
  });
  return out.sort((a,b)=>a.ko-b.ko);
})();
const FIX_BY_TEAM = (() => {
  const m = {}; Object.keys(TEAMS).forEach(t => m[t]=[]);
  FIXTURES.forEach(fx => { m[fx.home].push(fx); m[fx.away].push(fx); });
  return m;
})();

/* ------------------------------- HELPERS -------------------------- */
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const genCode = (len=10) => Array.from({length:len}, () => CODE_CHARS[Math.floor(Math.random()*CODE_CHARS.length)]).join("");
const shuffle = (arr) => { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
// Tap-to-join deep link: read ?code= from the URL, normalised the same way the join field is. Returns
// a valid 10-char alphanumeric code (uppercase) or "" when absent/invalid, so the normal landing is unaffected.
const readUrlCode = () => { try { const c=(new URLSearchParams(window.location.search).get("code")||"").toUpperCase().replace(/[^A-Z0-9]/g,""); return /^[A-Z0-9]{10}$/.test(c) ? c : ""; } catch { return ""; } };

// Allocation: every one of the 48 teams is always shared out and the squads are balanced to be about
// equally strong. Team strength = 49 - r (top side worth 48, lowest worth 1); elite = tier 1, strong
// = tier 2. The balance follows a strict priority order, each level only relaxed to help the next:
//   1. elite teams per person as even as possible;
//   2. then elite + strong per person as even as possible (fewer elite is compensated with strong);
//   3. then each person's total squad strength as even as possible.
// Counts: 12 or fewer → no duplicates, all 48 split as evenly as possible (everyone on at least four,
// exactly four at twelve). More than 12 → exactly four each; all 48 appear once and the extra slots
// are duplicates drawn from outside the top 24 (mid and underdog) so the elite/strong balance holds.
// opts.pins { memberId: [teamId,...] } locks teams to people first: they count toward each person's
// running elite, elite+strong and strength tallies so the balancer compensates around them, and they
// never move afterwards. opts.fewerIds names who gets the smaller squad at uneven sizes of twelve or
// fewer. Randomised throughout, so an unpinned or partly-pinned draw still varies on re-run.
const buildAllocations = (members, opts = {}) => {
  const N = members.length;
  const ids = Object.keys(TEAMS);
  const alloc = {}; members.forEach(m => alloc[m.id]=[]);
  if (N === 0) return alloc;

  const strength = (id) => 49 - TEAMS[id].r;
  const byTier = [[],[],[],[]];                       // byTier[0] elite … byTier[3] underdog
  ids.forEach(id => byTier[tierOf(id)-1].push(id));
  const [elite, strong, mid, under] = byTier;
  const cls = (id) => tierOf(id)===1 ? 0 : tierOf(id)===2 ? 1 : 2;   // elite / strong / other
  const idx = members.map((_,i)=>i);
  const memberIndex = {}; members.forEach((m,i)=>memberIndex[m.id]=i);

  // Normalise pins: each valid team is claimed by at most one member (first claim wins).
  const claim = {};                                   // teamId -> member index
  Object.entries(opts.pins || {}).forEach(([mid_, teams]) => {
    const i = memberIndex[mid_]; if (i === undefined) return;
    (teams || []).forEach(t => { if (TEAMS[t] && claim[t] === undefined) claim[t] = i; });
  });
  const pinCount = members.map(()=>0);
  Object.values(claim).forEach(i => pinCount[i]++);

  // Capacity per person: more than twelve → four each; twelve or fewer → all 48 split as evenly as
  // possible (sizes differ by at most one). At uneven sizes opts.fewerIds names who gets the smaller
  // squad; otherwise the extra team is handed out at random, favouring anyone whose pins need room.
  const cap = members.map(()=>4);
  if (N <= 12) {
    const base = Math.floor(48/N), rem = 48 - base*N;   // rem people get base+1
    members.forEach((_,i)=>cap[i]=base);
    if (rem > 0) {
      const fewer = Array.isArray(opts.fewerIds)
        ? opts.fewerIds.map(id=>memberIndex[id]).filter(i=>i!==undefined) : null;
      let big;
      if (fewer && fewer.length === N - rem) {           // explicit smaller-squad choice
        const fewerS = new Set(fewer); big = idx.filter(i=>!fewerS.has(i));
      } else {                                            // random +1, but anyone needing room first
        const need = idx.filter(i=>pinCount[i] > base);
        const rest = shuffle(idx.filter(i=>pinCount[i] <= base));
        big = [...need, ...rest].slice(0, rem);
      }
      new Set(big).forEach(i => cap[i] = base+1);
    }
  }

  const hand = members.map(()=>[]);
  const has  = members.map(()=>new Set());
  const locked = members.map(()=>new Set());          // pinned teams, never moved later
  const total = members.map(()=>0), eliteCnt = members.map(()=>0), esCnt = members.map(()=>0);
  const place = (i, id, lock) => { hand[i].push(id); has[i].add(id); total[i]+=strength(id);
    if(cls(id)===0) eliteCnt[i]++; if(cls(id)<=1) esCnt[i]++; if(lock) locked[i].add(id); };

  // Seed the locked pins first (defensively ignoring any that would exceed a member's cap) and take
  // them out of the pool. Pinned teams now count toward each person's running tallies.
  const claimed = new Set();
  Object.entries(claim).forEach(([t, i]) => { if (hand[i].length < cap[i]) { place(i, t, true); claimed.add(t); } });
  const free = (arr) => arr.filter(t => !claimed.has(t));

  const pickMin = (key) => {                           // roomy member with the smallest key, ties random
    let best=-1; for(const i of shuffle(idx)){ if(hand[i].length>=cap[i]) continue;
      if(best===-1 || key(i)<key(best)) best=i; } return best;
  };

  // Priority 1: spread the remaining elite as evenly as possible around any pinned ones.
  shuffle(free(elite)).forEach(id => { const i=pickMin(x=>eliteCnt[x]); if(i!==-1) place(i,id); });
  // Priority 2: compensation, handing strong to whoever has the lowest elite + strong count so far.
  shuffle(free(strong)).forEach(id => { const i=pickMin(x=>esCnt[x]); if(i!==-1) place(i,id); });

  // Fill the rest from the remaining mid + underdog (plus duplicates above twelve, taken only from
  // mid + underdog). Priority 3 seed: strongest still-free team to the currently weakest squad.
  const pool = [...free(mid), ...free(under)];
  const slotsLeft = idx.reduce((s,i)=>s+(cap[i]-hand[i].length),0);
  if (N > 12) { const rota = shuffle([...mid, ...under]); let r=0;
    while (pool.length < slotsLeft) pool.push(rota[r++ % rota.length]); }
  pool.sort((a,b)=>strength(b)-strength(a));
  const leftover = [];
  for (const id of pool) {
    let best = -1;
    for (const i of shuffle(idx)) { if(hand[i].length>=cap[i] || has[i].has(id)) continue;
      if(best===-1 || total[i]<total[best]) best=i; }
    if (best !== -1) place(best, id); else leftover.push(id);
  }
  // Any duplicate with no roomy taker lands by swapping an unpinned mid/underdog team out of a full
  // member to a roomy one. Only unpinned mid/underdog moves, so balance and pins stay intact.
  for (const X of leftover) {
    let P = idx.find(i => hand[i].length<cap[i] && !has[i].has(X));
    if (P === undefined) P = idx.find(i => hand[i].length<cap[i]);
    if (P === undefined) break;
    for (const d of idx) {
      if (d===P || hand[d].length<cap[d] || has[d].has(X)) continue;
      const zi = hand[d].findIndex(z => cls(z)===2 && z!==X && !has[P].has(z) && !locked[d].has(z));
      if (zi === -1) continue;
      const Z = hand[d][zi];
      hand[d][zi]=X; has[d].delete(Z); has[d].add(X); total[d]+=strength(X)-strength(Z);
      place(P, Z); break;
    }
  }

  // Priority 3 refine: same-class pair swaps (elite↔elite, strong↔strong, other↔other) that pull the
  // squad-strength totals together. Same class keeps the counts untouched; pinned teams never move.
  const sumT = total.reduce((a,b)=>a+b,0), mean = sumT/N, dev = v => (v-mean)*(v-mean);
  for (let pass=0; pass<300; pass++) {
    let improved=false; const ord = shuffle(idx);
    for (const i of ord) for (const j of ord) {
      if (i>=j) continue;
      for (let x=0;x<hand[i].length;x++) for (let y=0;y<hand[j].length;y++) {
        const a=hand[i][x], b=hand[j][y];
        if (locked[i].has(a) || locked[j].has(b)) continue;     // never move locked teams
        if (a===b || cls(a)!==cls(b) || has[i].has(b) || has[j].has(a)) continue;
        const ni=total[i]-strength(a)+strength(b), nj=total[j]-strength(b)+strength(a);
        if (dev(ni)+dev(nj) < dev(total[i])+dev(total[j]) - 1e-9) {
          hand[i][x]=b; hand[j][y]=a; has[i].delete(a); has[i].add(b); has[j].delete(b); has[j].add(a);
          total[i]=ni; total[j]=nj; improved=true;
        }
      }
    }
    if (!improved) break;
  }

  members.forEach((m,i)=>{ alloc[m.id]=hand[i]; });
  return alloc;
};

// Target squad size per member, mirroring buildAllocations' caps for the deterministic cases. Used by
// the creator-only hand-pick screen to show per-person targets and stop over-pinning. At uneven sizes
// of twelve or fewer it needs fewerIds (who gets the smaller squad); elsewhere it is fixed.
const squadCaps = (members, fewerIds) => {
  const N = members.length;
  if (N > 12) return members.map(()=>4);
  const base = Math.floor(48/N), rem = 48 - base*N;
  if (rem === 0) return members.map(()=>base);
  const fewerS = new Set(fewerIds || []);
  return members.map(m => fewerS.has(m.id) ? base : base+1);
};

const CURRENCIES = ["AUD","USD","GBP","EUR","NZD","ZAR","INR","JPY"];
const money = (n, cur) => { try { return new Intl.NumberFormat(undefined,{style:"currency",currency:cur,maximumFractionDigits:2,minimumFractionDigits:0}).format(n||0); } catch { return `${cur} ${Math.round(n||0)}`; } };
const predResult = (p) => p==="home" ? {h:1,a:0} : p==="away" ? {h:0,a:1} : {h:0,a:0};
const outcome = (res) => res.h>res.a ? "home" : res.h<res.a ? "away" : "draw";

// One team's score (with bonuses) from a results map.
const teamStats = (id, results) => {
  let pld=0,w=0,d=0,l=0,gf=0,ga=0,pts=0,bestUpset=0;
  for (const fx of FIX_BY_TEAM[id]) {
    const res = results[fx.id]; if (!res) continue;
    const home = fx.home===id, my = home?res.h:res.a, op = home?res.a:res.h, oppId = home?fx.away:fx.home;
    pld++; gf+=my; ga+=op;
    if (my>op){ w++; pts+=3; pts+=Math.min(my-op,5);
      if (TEAMS[oppId].r < TEAMS[id].r){ const gap=TEAMS[id].r-TEAMS[oppId].r; pts+= gap>=20?5:3; if(gap>bestUpset)bestUpset=gap; }
    } else if (my===op){ d++; pts+=1; } else { l++; }
    if (op===0) pts+=1;
  }
  return {pld,w,d,l,gf,ga,gd:gf-ga,pts,bestUpset};
};

// Real tournament group table (plain 3/1/0, no bonuses).
const groupStandings = (letter, results) => {
  const rows = GROUPS[letter].map(id => {
    let pld=0,w=0,d=0,l=0,gf=0,ga=0,pts=0;
    for (const fx of FIXTURES) {
      if (fx.grp!==letter || (fx.home!==id && fx.away!==id)) continue;
      const res = results[fx.id]; if (!res) continue;
      const home = fx.home===id, my=home?res.h:res.a, op=home?res.a:res.h;
      pld++; gf+=my; ga+=op;
      if (my>op){w++;pts+=3;} else if (my===op){d++;pts+=1;} else l++;
    }
    return {id,pld,w,d,l,gf,ga,gd:gf-ga,pts};
  });
  rows.sort((a,b)=> b.pts-a.pts || b.gd-a.gd || b.gf-a.gf || TEAMS[a.id].n.localeCompare(TEAMS[b.id].n));
  return rows;
};

/* ------------------------------- STORAGE -------------------------- */
/* The SHARED half (group, results, predictions, pool) lives in Supabase so every device on the
   same code sees the same data, with per-row results and predictions so two devices writing at
   once never clobber each other. The DEVICE half (last, mine, me, creator) stays in this browser's
   localStorage via the window.storage shim — personal to the device, never synced. */
const store = {
  ok: typeof window!=="undefined" && window.storage, // device half (localStorage shim)

  /* ---- SHARED half → Supabase ---- */
  async getGroup(code){
    if(!supabase) return null;
    try{
      const { data:g, error } = await supabase.from("groups").select("*").eq("code",code).maybeSingle();
      if(error || !g) return null;
      const { data:rows } = await supabase.from("results").select("fixture,h,a").eq("code",code);
      const results = {}; (rows||[]).forEach(r=>{ results[r.fixture]={h:r.h,a:r.a}; });
      return { code:g.code, name:g.name, members:g.members, alloc:g.alloc, pool:g.pool||{}, results };
    }catch{ return null; }
  },
  // Upserts only the groups row (code, name, members, alloc, pool). Results are per-row, kept apart.
  async setGroup(code,g){
    if(!supabase) return;
    try{ await supabase.from("groups").upsert({ code, name:g.name, members:g.members, alloc:g.alloc, pool:g.pool||{} }); }catch(e){}
  },
  // One score → one results row. Clearing a score deletes that one row. Never rewrites the group.
  async setResult(code,fixture,h,a){
    if(!supabase) return;
    try{ await supabase.from("results").upsert({ code, fixture, h, a, updated_at:new Date().toISOString() }); }catch(e){}
  },
  async clearResult(code,fixture){
    if(!supabase) return;
    try{ await supabase.from("results").delete().eq("code",code).eq("fixture",fixture); }catch(e){}
  },
  async getPreds(code){
    if(!supabase) return {};
    try{
      const { data } = await supabase.from("predictions").select("member,fixture,pick").eq("code",code);
      const out = {}; (data||[]).forEach(r=>{ (out[r.member]=out[r.member]||{})[r.fixture]=r.pick; }); return out;
    }catch{ return {}; }
  },
  // One pick → one predictions row. Toggling a pick off deletes that one row.
  async setPick(code,member,fixture,pick){
    if(!supabase) return;
    try{ await supabase.from("predictions").upsert({ code, member, fixture, pick, updated_at:new Date().toISOString() }); }catch(e){}
  },
  async clearPick(code,member,fixture){
    if(!supabase) return;
    try{ await supabase.from("predictions").delete().eq("code",code).eq("member",member).eq("fixture",fixture); }catch(e){}
  },

  /* ---- DEVICE half → localStorage (window.storage shim), unchanged ---- */
  async setLast(code){ if(!this.ok) return; try{ await window.storage.set("wcfd:last",code,false);}catch(e){} },
  async getLast(){ if(!this.ok) return null; try{ const r=await window.storage.get("wcfd:last",false); return r?r.value:null;}catch{return null;} },
  async getMine(code){ if(!this.ok) return []; try{ const r=await window.storage.get("wcfd:mine:"+code,false); if(r) return JSON.parse(r.value); const o=await window.storage.get("wcfd:me:"+code,false); return o?[o.value]:[]; }catch{return [];} },
  async setMine(code,arr){ if(!this.ok) return; try{ await window.storage.set("wcfd:mine:"+code,JSON.stringify(arr),false);}catch(e){} },
  async markCreator(code){ if(!this.ok) return; try{ await window.storage.set("wcfd:creator:"+code,"1",false);}catch(e){} },
  async isCreator(code){ if(!this.ok) return false; try{ const r=await window.storage.get("wcfd:creator:"+code,false); return !!(r && r.value==="1"); }catch{ return false; } },
};

/* ================================================================== */
export default function WorldCupFamilyDraw(){
  const [view, setView] = useState(() => readUrlCode() ? "join" : "home");   // ?code= deep link lands on Join
  const [joinCode, setJoinCode] = useState(() => readUrlCode());             // pre-filled join code (not auto-submitted)
  const [group, setGroup] = useState(null);
  const [preds, setPreds] = useState({});
  const [mine, setMine] = useState([]);
  const [lastCode, setLastCode] = useState(null);
  const [boom, setBoom] = useState(0);
  const [isCreator, setIsCreator] = useState(false);
  const [matches, setMatches] = useState({});        // group games, keyed by app fixture id
  const [knockouts, setKnockouts] = useState({});    // knockout games (fixture null), keyed by match id

  useEffect(() => {
    const link = document.createElement("link");
    link.rel="stylesheet"; link.href="https://fonts.googleapis.com/css2?family=Anton&family=Outfit:wght@300;400;500;600;700;800&display=swap";
    document.head.appendChild(link);
    store.getLast().then(c => { if(c) setLastCode(c); });
  }, []);

  // Live World Cup feed: read the shared, tournament-wide `matches` table (read-only, anon) and
  // keep it in sync via Realtime, so real kick-off times, statuses and scores appear live across
  // devices. Group games (non-null fixture) are kept keyed by app fixture id; knockout games
  // (null fixture) are kept separately keyed by match id. The two stay clearly apart in state.
  useEffect(() => {
    if(!supabase) return;
    let active = true;
    const KO_COLS = "id,match_number,stage,kickoff,status,home_team,away_team,home_score,away_score,home_odds,draw_odds,away_odds";
    (async () => {
      const { data } = await supabase.from("matches")
        .select("fixture,kickoff,status,home_score,away_score,home_odds,draw_odds,away_odds").not("fixture","is",null);
      if(!active) return;
      const out = {}; (data||[]).forEach(r=>{ if(r.fixture) out[r.fixture]=r; }); setMatches(out);
    })();
    (async () => {
      const { data } = await supabase.from("matches").select(KO_COLS).is("fixture", null);
      if(!active) return;
      const out = {}; (data||[]).forEach(r=>{ if(r.id!=null) out[r.id]=r; }); setKnockouts(out);
    })();
    const koRow = (r) => ({ id:r.id, match_number:r.match_number, stage:r.stage, kickoff:r.kickoff, status:r.status, home_team:r.home_team, away_team:r.away_team, home_score:r.home_score, away_score:r.away_score, home_odds:r.home_odds, draw_odds:r.draw_odds, away_odds:r.away_odds });
    const ch = supabase.channel("wcfd:matches")
      .on("postgres_changes", { event:"*", schema:"public", table:"matches" }, (p) => {
        if(p.eventType==="DELETE"){
          const id=p.old?.id, fx=p.old?.fixture;
          if(fx) setMatches(prev=>{ const o={...prev}; delete o[fx]; return o; });
          if(id!=null) setKnockouts(prev=>{ const o={...prev}; delete o[id]; return o; });
          return;
        }
        const r=p.new;
        if(r?.fixture) setMatches(prev=>({ ...prev, [r.fixture]:{ fixture:r.fixture, kickoff:r.kickoff, status:r.status, home_score:r.home_score, away_score:r.away_score, home_odds:r.home_odds, draw_odds:r.draw_odds, away_odds:r.away_odds } }));
        else if(r?.id!=null) setKnockouts(prev=>({ ...prev, [r.id]:koRow(r) }));
      })
      .subscribe();
    return () => { active=false; supabase.removeChannel(ch); };
  }, []);

  // Live sync: while a group is open, fold incoming row changes into the same React state the
  // component already renders. One person's score or pick lands on every other open device within
  // a second, no refresh. (Supabase Realtime, filtered by the current code.)
  useEffect(() => {
    const code = group?.code;
    if(!code || !supabase) return;
    const ch = supabase.channel("wcfd:"+code)
      .on("postgres_changes", { event:"*", schema:"public", table:"results", filter:"code=eq."+code }, (p) => {
        setGroup(g => {
          if(!g || g.code!==code) return g;
          const results = {...g.results};
          if(p.eventType==="DELETE"){ const fx=p.old?.fixture; if(fx) delete results[fx]; }
          else { const r=p.new; results[r.fixture]={h:r.h,a:r.a}; }
          return {...g, results};
        });
      })
      .on("postgres_changes", { event:"*", schema:"public", table:"predictions", filter:"code=eq."+code }, (p) => {
        setPreds(prev => {
          const out = {...prev};
          if(p.eventType==="DELETE"){
            const o=p.old; if(o?.member && o?.fixture && out[o.member]){ const m={...out[o.member]}; delete m[o.fixture]; out[o.member]=m; }
          } else {
            const r=p.new; const m={...(out[r.member]||{})}; m[r.fixture]=r.pick; out[r.member]=m;
          }
          return out;
        });
      })
      .on("postgres_changes", { event:"*", schema:"public", table:"groups", filter:"code=eq."+code }, (p) => {
        if(p.eventType==="DELETE") return;
        const r=p.new;
        setGroup(g => (g && g.code===code) ? {...g, name:r.name, members:r.members, alloc:r.alloc, pool:r.pool||{}} : g);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [group?.code]);

  const fire = () => setBoom(Date.now());
  const openGroup = async (g) => { setGroup(g); setView("group"); store.setLast(g.code); setLastCode(g.code); setPreds(await store.getPreds(g.code)); setMine(await store.getMine(g.code)); setIsCreator(await store.isCreator(g.code)); };
  const saveGroup = async (g) => { setGroup(g); await store.setGroup(g.code, g); };
  // Per-row writes: a score or a pick touches one row, not the whole group/preds blob.
  const saveResult = async (fxId, h, a) => {
    setGroup(g => { const results={...g.results}; if(h===null) delete results[fxId]; else results[fxId]={h,a}; return {...g, results}; });
    if(group){ if(h===null) await store.clearResult(group.code, fxId); else await store.setResult(group.code, fxId, h, a); }
  };
  const savePick = async (memId, fxId, pick) => {
    setPreds(prev => { const cur=prev[memId]?{...prev[memId]}:{}; if(pick==null) delete cur[fxId]; else cur[fxId]=pick; return {...prev, [memId]:cur}; });
    if(group){ if(pick==null) await store.clearPick(group.code, memId, fxId); else await store.setPick(group.code, memId, fxId, pick); }
  };
  const toggleMine = async (id) => { const next = mine.includes(id) ? mine.filter(x=>x!==id) : [...mine, id]; setMine(next); if(group) await store.setMine(group.code, next); };

  return (
    <div className="wc-root">
      <StyleBlock/>
      {boom ? <Confetti key={boom} done={()=>setBoom(0)}/> : null}
      {view==="home" && <Home lastCode={lastCode} onCreate={()=>setView("create")} onJoin={()=>{ setJoinCode(""); setView("join"); }}
        onResume={async()=>{ const g=await store.getGroup(lastCode); if(g) openGroup(g); else setLastCode(null); }}/>}
      {view==="create" && <Create back={()=>setView("home")}
        onDone={async(g)=>{ await store.setGroup(g.code,g); await store.markCreator(g.code); setGroup(g); setIsCreator(true); setView("drawing"); }}/>}
      {view==="join" && <Join back={()=>setView("home")} onFound={openGroup} initialCode={joinCode}/>}
      {view==="drawing" && group && <Drawing onDone={()=>setView("ceremony")}/>}
      {view==="ceremony" && group && <Ceremony group={group} fire={fire} onEnter={()=>openGroup(group)}/>}
      {view==="group" && group && <GroupView group={group} preds={preds} onPick={savePick} mine={mine} toggleMine={toggleMine} isCreator={isCreator} matches={matches} knockouts={knockouts}
        onCeremony={()=>setView("ceremony")} saveGroup={saveGroup} saveResult={saveResult} exit={()=>{setGroup(null);setView("home");}}/>}
      <footer className="foot">
        <div className="foot-note">A just-for-fun group game · not affiliated with FIFA · no real money is handled here</div>
        {view!=="drawing" && <a className="foot-credit brand-logo" href="https://profit-pulse.com.au" target="_blank" rel="noopener noreferrer" aria-label="ProfitPulse, visit profit-pulse.com.au"><span className="foot-by">Built by</span><img className="foot-logo" src="/profitpulse-logo.png" alt="ProfitPulse"/></a>}
      </footer>
    </div>
  );
}

/* ------------------------------- HOME ----------------------------- */
function Home({ onCreate, onJoin, onResume, lastCode }){
  return (
    <div className="wrap home">
      <div className="ball">⚽</div>
      <p className="kicker">48 nations · one global rivalry</p>
      <h1 className="display title">The World Cup<br/><span className="gold">Group Draw</span></h1>
      <p className="lede">Insert everyone's names in, the site randomly allocates countries to each member of the group. Then watch the leaderboard fight it out all the way to the final. Built for connected groups scattered across the world.</p>
      <div className="cta-col">
        <button className="btn btn-gold big" onClick={onCreate}><Sparkles size={20}/> Create new team</button>
        <button className="btn btn-ghost big" onClick={onJoin}><Users size={20}/> View an existing team</button>
        {lastCode && <button className="btn btn-link" onClick={onResume}><RotateCcw size={15}/> Resume my last team ({lastCode})</button>}
      </div>
      <div className="how">
        <Step n="1" t="Add your group" d="Type in up to 100 names — the whole group, wherever they are."/>
        <Step n="2" t="Share out all 48" d="Every team goes to someone, and squads are balanced to be about equally strong. Twelve members means four each; fewer means more each; more means some teams get shared."/>
        <Step n="3" t="Climb the table" d="One code lets anyone follow the group standings, predict games and track the pot."/>
      </div>
    </div>
  );
}
const Step = ({n,t,d}) => (<div className="step"><span className="step-n display">{n}</span><div><div className="step-t">{t}</div><div className="step-d">{d}</div></div></div>);

/* ------------------------------ CREATE ---------------------------- */
function Create({ back, onDone }){
  const [name, setName] = useState("");
  const [one, setOne] = useState("");
  const [bulk, setBulk] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [people, setPeople] = useState([]);
  const [code, setCode] = useState("");          // the person sets their own code first
  const [avail, setAvail] = useState("idle");    // idle | checking | ok | taken
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("form");    // form | setup (creator-only count choice + hand-pick)
  const inputRef = useRef(null);

  // Live, debounced availability check: once the code is a valid 10-char alphanumeric, look it up
  // the same way "View a team" does and flag whether it is free. Debounced so we don't query on
  // every keystroke; cancelled if the code changes mid-check so stale results never win.
  useEffect(()=>{
    if(!/^[A-Z0-9]{10}$/.test(code)){ setAvail("idle"); return; }
    setAvail("checking");
    let cancelled=false;
    const t=setTimeout(async()=>{
      try{ const g=await store.getGroup(code); if(!cancelled) setAvail(g?"taken":"ok"); }
      catch{ if(!cancelled) setAvail("idle"); }
    }, 450);
    return ()=>{ cancelled=true; clearTimeout(t); };
  }, [code]);

  const addName = (raw) => { const t=raw.trim(); if(!t) return;
    setPeople(p => { if(p.length>=100) return p; let nm=t,k=2; while(p.some(x=>x.name.toLowerCase()===nm.toLowerCase())) nm=`${t} (${k++})`;
      return [...p,{id:Math.random().toString(36).slice(2,9),name:nm}]; }); };
  const addOne = () => { addName(one); setOne(""); inputRef.current?.focus(); };
  const addBulk = () => { bulk.split(/[\n,]/).forEach(addName); setBulk(""); setShowBulk(false); };
  const remove = (id) => setPeople(p=>p.filter(x=>x.id!==id));
  const perPerson = people.length ? Math.ceil(48/people.length) : 0;
  const codeOk = /^[A-Z0-9]{10}$/.test(code);

  // Validate, then hand off to the optional creator setup (count choice + hand-pick) before the draw.
  const start = async () => {
    const c = code.trim().toUpperCase();
    if(people.length<2){ setErr("Add at least two members for the draw."); return; }
    if(!/^[A-Z0-9]{10}$/.test(c)){ setErr("Your code needs to be 10 letters or numbers."); return; }
    setBusy(true); setErr("");
    const taken = await store.getGroup(c); setBusy(false);
    // Re-check on submit in case the code was claimed in the moment before the click; fail gently.
    if(taken){ setAvail("taken"); return; }
    setStage("setup");
  };
  // Pins and fewerIds are transient creator-side inputs; only the resulting allocation is saved.
  const finish = (pins, fewerIds) => {
    const g = { code:code.trim().toUpperCase(), name:name.trim()||"Our World Cup Draw", created:Date.now(),
      members:people, alloc:buildAllocations(people, { pins, fewerIds }), results:{}, pool:{amount:0,cur:"AUD",structure:"top15"} };
    onDone(g);
  };

  if(stage==="setup") return <Setup members={people} onBack={()=>setStage("form")} finish={finish}/>;

  return (
    <div className="wrap">
      <TopBar back={back} title="New draw"/>
      <label className="field-lbl">Name your group</label>
      <input className="input" placeholder="e.g. The Crew World Cup" value={name} onChange={e=>setName(e.target.value)} maxLength={48}/>
      <div className="row-between mt">
        <label className="field-lbl no-mb">Add members <span className="muted">({people.length}/100)</span></label>
        <button className="btn btn-mini" onClick={()=>setShowBulk(s=>!s)}>{showBulk?"Single":"Paste a list"}</button>
      </div>
      {!showBulk ? (
        <div className="add-row">
          <input ref={inputRef} className="input flex" placeholder="Type a name and hit +" value={one}
            onChange={e=>setOne(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter"){e.preventDefault();addOne();} }}/>
          <button className="btn btn-gold sq" onClick={addOne} disabled={!one.trim()||people.length>=100}><Plus size={20}/></button>
        </div>
      ) : (
        <div>
          <textarea className="input area" rows={5} placeholder={"One name per line\nAva\nNoah\nMia"} value={bulk} onChange={e=>setBulk(e.target.value)}/>
          <button className="btn btn-gold full mt-s" onClick={addBulk} disabled={!bulk.trim()}><UserPlus size={18}/> Add everyone</button>
        </div>
      )}
      {people.length>0 && <div className="chips">{people.map(p=>(<span key={p.id} className="chip">{p.name}<button onClick={()=>remove(p.id)}><X size={13}/></button></span>))}</div>}
      {people.length>=2 && <p className="hint"><Info size={13}/> {
        people.length<12 ? `All 48 teams get shared out with no duplicates, so each member holds about ${perPerson}, everyone on at least four, with squads balanced to be about equally strong.`
        : people.length===12 ? "The sweet spot: all 48 teams, exactly four each, no duplicates, with squads balanced to be about equally strong."
        : "Everyone holds four teams and all 48 are covered. Squads are balanced to be about equally strong, sharing the elite and strong sides out evenly first, so a few teams get held by two or more people."}</p>}
      <label className="field-lbl">Choose a group code <span className="muted">(everyone enters this)</span></label>
      <input className="input code-field display" placeholder="e.g. WORLDCUP26" value={code} maxLength={10}
        onChange={e=>{ setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,10)); setErr(""); }}/>
      <div className="code-foot">
        {!codeOk
          ? <span className="code-msg"><Info size={13}/> Pick something easy to remember and share. 10 letters or numbers.</span>
          : avail==="checking" ? <span className="code-status checking">Checking…</span>
          : avail==="ok" ? <span className="code-status ok"><Check size={14}/> Available</span>
          : avail==="taken" ? <span className="code-status taken">That code is taken, try another.</span>
          : <span className="code-msg"/>}
        <button className="btn btn-link gen-link" onClick={()=>{ setCode(genCode(10)); setErr(""); }}><Shuffle size={14}/> Or generate one for me</button>
      </div>
      {err && <p className="err">{err}</p>}
      <div className="sticky-cta">
        <button className="btn btn-gold big full" disabled={people.length<2 || avail!=="ok" || busy} onClick={start}><Shuffle size={20}/> {busy?"Checking…":`Run the draw${people.length>=2?` · ${people.length}`:""}`}</button>
      </div>
    </div>
  );
}

/* ------------------------------- SETUP ---------------------------- */
// Creator-only flow between the form and the ceremony: an optional count choice (uneven sizes of
// twelve or fewer) and an optional hand-pick screen. Both are skippable; skipping both gives exactly
// today's draw. Inputs are transient and never synced; only the final allocation is built and saved.
const toPins = (assign) => { const p={}; Object.entries(assign).forEach(([t,mid])=>{ if(mid){ (p[mid]=p[mid]||[]).push(t); } }); return p; };

function Setup({ members, onBack, finish }){
  const N = members.length;
  const base = Math.floor(48/N), rem = 48 - base*N;
  const uneven = rem !== 0 && N <= 12;
  const smaller = N - rem;                          // how many people get the smaller squad
  const [phase, setPhase] = useState(uneven ? "count" : "manual");   // count | choose | manual
  const [fewerIds, setFewerIds] = useState(null);  // the chosen (or app-picked) smaller-squad set
  const [sel, setSel] = useState([]);              // selections while choosing who gets fewer
  const [assign, setAssign] = useState({});        // teamId -> memberId pins

  const caps = useMemo(()=>squadCaps(members, fewerIds), [members, fewerIds]);
  const capMap = useMemo(()=>{ const o={}; members.forEach((m,i)=>o[m.id]=caps[i]); return o; }, [members, caps]);
  const pinCount = useMemo(()=>{ const o={}; members.forEach(m=>o[m.id]=0);
    Object.values(assign).forEach(mid=>{ if(mid) o[mid]=(o[mid]||0)+1; }); return o; }, [assign, members]);
  const tiers = useMemo(()=>{ const t=[[],[],[],[]]; Object.keys(TEAMS).forEach(id=>t[tierOf(id)-1].push(id));
    t.forEach(a=>a.sort((x,y)=>TEAMS[x].r-TEAMS[y].r)); return t; }, []);

  if(phase==="count") return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-h">Even it out?</div>
        <p className="lede" style={{margin:"8px 0 0"}}>The 48 teams will not split evenly between {N} people.</p>
        <div className="modal-split">{rem} {rem===1?"person gets":"people get"} {base+1} teams and {smaller} {smaller===1?"gets":"get"} {base}.</div>
        <p className="hint" style={{marginTop:0}}><Info size={13}/> Squads are still balanced to be about equally strong, so whoever gets fewer teams tends to get higher-ranked ones to make up for it. It is fine to let the app decide.</p>
        <div className="modal-actions">
          <button className="btn btn-gold full" onClick={()=>{ setSel([]); setPhase("choose"); }}><Users size={18}/> Let me choose who gets fewer</button>
          <button className="btn btn-ghost full" onClick={()=>{ setFewerIds(shuffle(members).slice(0, smaller).map(m=>m.id)); setPhase("manual"); }}><Shuffle size={18}/> Let the app decide</button>
        </div>
      </div>
    </div>
  );

  if(phase==="choose") return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-h">Who gets the smaller squad?</div>
        <p className="hint" style={{marginTop:8}}><Info size={13}/> Pick {smaller} of {N}. They will get {base} teams; everyone else gets {base+1}.</p>
        <div className="choose-list">
          {members.map(m=>{ const on=sel.includes(m.id);
            return <button key={m.id} className={"choose-name"+(on?" on":"")}
              onClick={()=>setSel(s => on ? s.filter(x=>x!==m.id) : (s.length>=smaller ? s : [...s, m.id]))}>
              <span>{m.name}</span>{on && <Check size={16}/>}</button>; })}
        </div>
        <div className="modal-actions">
          <button className="btn btn-gold full" disabled={sel.length!==smaller} onClick={()=>{ setFewerIds(sel); setPhase("manual"); }}>Continue · {sel.length} of {smaller} picked</button>
          <button className="btn btn-link" onClick={()=>setPhase("count")}><ArrowLeft size={15}/> Back</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="wrap">
      <TopBar back={onBack} title="Hand-pick teams (optional)"/>
      <p className="hint"><Info size={13}/> Anything left on Auto is shared out by the balanced draw. Hand-picking a lot of teams for one person can tip the balance, so light touches work best.</p>
      <div className="setup-people">
        {members.map(m=>{ const full=pinCount[m.id]>=capMap[m.id];
          return <span key={m.id} className={"setup-person"+(full?" full":"")}>{m.name} · {pinCount[m.id]} of {capMap[m.id]}{full?" (full)":""}</span>; })}
      </div>
      {tiers.map((arr,ti)=>(
        <div key={ti}>
          <div className="md-head" style={{color:TIER_VAR[ti+1]}}>{TIER_NAMES[ti+1]}</div>
          {arr.map(id=>(
            <div className="assign-row" key={id}>
              <span className="t-flag">{TEAMS[id].f}</span>
              <span className="t-name">{TEAMS[id].n}</span>
              <span className="t-tier" style={{background:TIER_VAR[tierOf(id)]}}>{TIER_NAMES[tierOf(id)]}</span>
              <select className="assign-sel" value={assign[id]||""} onChange={e=>{ const v=e.target.value;
                setAssign(prev=>{ const o={...prev}; if(v) o[id]=v; else delete o[id]; return o; }); }}>
                <option value="">Auto</option>
                {members.map(m=>{ const full=pinCount[m.id]>=capMap[m.id] && assign[id]!==m.id;
                  return <option key={m.id} value={m.id} disabled={full}>{m.name}{full?" (full)":""}</option>; })}
              </select>
            </div>
          ))}
        </div>
      ))}
      <div className="sticky-cta">
        <button className="btn btn-gold big full" onClick={()=>finish(toPins(assign), fewerIds || undefined)}><Shuffle size={20}/> Run the draw</button>
        <button className="btn btn-link" style={{width:"100%",marginTop:8}} onClick={()=>finish({}, fewerIds || undefined)}>Skip, allocate everything automatically</button>
      </div>
    </div>
  );
}

/* ------------------------------- JOIN ----------------------------- */
function Join({ back, onFound, initialCode }){
  const [code,setCode]=useState(initialCode || ""); const [err,setErr]=useState(""); const [busy,setBusy]=useState(false);
  const go = async () => { const c=code.trim().toUpperCase(); if(c.length<4){setErr("Enter the group code you were given.");return;}
    setBusy(true); setErr(""); const g=await store.getGroup(c); setBusy(false);
    if(g) onFound(g); else setErr("No group found for that code. Double-check the characters?"); };
  return (
    <div className="wrap">
      <TopBar back={back} title="View a team"/>
      <div className="join-card">
        <div className="ball sm">⚽</div>
        <p className="lede center">Pop in the code the team creator shared with you to follow the draw, table and pot.</p>
        <input className="input code-input display" placeholder="GROUPCODE1" value={code} maxLength={10}
          onChange={e=>setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,10))} onKeyDown={e=>{ if(e.key==="Enter") go(); }}/>
        {err && <p className="err">{err}</p>}
        <button className="btn btn-gold big full mt-s" onClick={go} disabled={busy}>{busy?"Looking…":"View the team"}</button>
      </div>
    </div>
  );
}

/* --------------------------- DRAW LOADING ------------------------- */
// A short, fixed visual pause shown to the creator after the draw is computed and saved, before the
// ceremony. Purely cosmetic: the allocation and the synced data are already done; this only delays
// the view by a beat. Honours prefers-reduced-motion (softens to a fade) and always proceeds on a
// timer, so it never blocks the flow.
const DRAW_CAPTIONS = [
  "Balancing the squads, no favourites allowed.",
  "Sharing out the giants fairly, hold tight.",
  "Doing the maths so nobody cops a dud squad.",
  "Crunching the rankings. This is the ProfitPulse bit.",
];
function Drawing({ onDone }){
  const [i, setI] = useState(0);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    const timers = [];
    DRAW_CAPTIONS.forEach((_, k) => { if(k>0) timers.push(setTimeout(()=>setI(k), k*1875)); });
    timers.push(setTimeout(()=>setClosing(true), 7500));   // four captions read comfortably first
    timers.push(setTimeout(onDone, 8500));                 // hold the closing state ~1s, then go
    return () => timers.forEach(clearTimeout);
  }, []);
  return (
    <div className="wrap draw-load">
      <div className="dl-inner">
        <a className="brand-logo dl-logo" href="https://profit-pulse.com.au" target="_blank" rel="noopener noreferrer" aria-label="ProfitPulse, visit profit-pulse.com.au">
          <img src="/profitpulse-logo.png" alt="ProfitPulse"/>
        </a>
        <div className="dl-bar"><span/></div>
        <div className="dl-cap">{closing ? "Squads balanced. Enjoy the games." : DRAW_CAPTIONS[i]}</div>
        {closing && <div className="dl-by">by <span className="gold">ProfitPulse</span></div>}
      </div>
    </div>
  );
}

/* ----------------------------- CEREMONY --------------------------- */
function Ceremony({ group, onEnter, fire }){
  const members = group.members;
  // squad display: strongest first
  const teamsFor = (m) => [...(group.alloc[m.id]||[])].sort((a,b)=>tierOf(a)-tierOf(b)||TEAMS[a].r-TEAMS[b].r);
  // team-by-team reveal order: mid, then underdog, then strong, then elite (builds the suspense)
  const REVEAL = {3:0, 4:1, 2:2, 1:3};
  const seqFor = (m) => [...(group.alloc[m.id]||[])].sort((a,b)=>REVEAL[tierOf(a)]-REVEAL[tierOf(b)] || TEAMS[a].r-TEAMS[b].r);
  const [mode, setMode] = useState(null);   // null | "squad" | "team"
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);

  // team  -> round robin, adding one team per person each pass (cumulative cards)
  // squad -> one card per person, whole allocation
  const steps = useMemo(()=>{
    if(mode==="squad") return members.map((_,p)=>({p, full:true}));
    if(mode==="team"){
      const lists = members.map(m=>seqFor(m));
      const maxLen = Math.max(0, ...lists.map(l=>l.length));
      const out = [];
      for(let r=0; r<maxLen; r++) members.forEach((_,p)=>{ if(r<lists[p].length) out.push({p, r}); });
      return out;
    }
    return [];
  }, [mode, members]);

  const cardElite = (st) => st.full ? teamsFor(members[st.p]).some(id=>tierOf(id)===1) : tierOf(seqFor(members[st.p])[st.r])===1;
  const maybeConfetti = (st) => { if(st && cardElite(st)) fire(); };

  const start = (m) => { const first = m==="team" ? {p:0,r:0} : {p:0,full:true}; setMode(m); setIdx(0); maybeConfetti(first); };
  const onNext = () => { if(idx >= steps.length-1){ setDone(true); fire(); return; } const ni=idx+1; setIdx(ni); maybeConfetti(steps[ni]); };
  const replay = () => { setDone(false); setMode(null); setIdx(0); };

  const strongest = useMemo(()=>{ let best=null,bv=-1; members.forEach(m=>{ const v=(group.alloc[m.id]||[]).reduce((s,id)=>s+(49-TEAMS[id].r),0); if(v>bv){bv=v;best=m;} }); return best; }, [group, members]);

  if(done) return (
    <div className="wrap cer">
      <div className="cer-done">
        <div className="ball">🏆</div>
        <h1 className="display cer-h">The draw<br/><span className="gold">is done!</span></h1>
        <p className="lede center">All teams are shared out across {members.length} members.{strongest && <> Strongest squad on paper goes to <b>{strongest.name}</b>.</>}</p>
        <button className="btn btn-gold big full" onClick={onEnter}><Trophy size={20}/> See the group table</button>
        <button className="btn btn-link" onClick={replay}><RotateCcw size={15}/> Replay the draw</button>
      </div>
    </div>
  );

  if(!mode) return (
    <div className="wrap cer">
      <p className="kicker center">The big draw</p>
      <h1 className="display cer-h center">Time for<br/><span className="gold">the draw</span></h1>
      <p className="lede center">Gather everyone around one screen, choose a style, then tap through to reveal who gets whom.</p>
      <div className="mode-grid">
        <button className="mode-card" onClick={()=>start("team")}>
          <Sparkles size={26}/>
          <div className="mode-t">Team by team</div>
          <div className="mode-d">One team at a time, going round the group, building up to the big sides.</div>
        </button>
        <button className="mode-card" onClick={()=>start("squad")}>
          <Users size={26}/>
          <div className="mode-t">Whole squads</div>
          <div className="mode-d">Each member's full set of teams, one member at a time.</div>
        </button>
      </div>
      <button className="btn btn-ghost full mt-s" onClick={onEnter}><Shuffle size={18}/> Skip it, just deal them out</button>
    </div>
  );

  const st = steps[idx];
  const person = members[st.p];
  const total = (group.alloc[person.id]||[]).length;
  const shown = st.full ? total : st.r+1;
  const display = st.full ? teamsFor(person) : seqFor(person).slice(0, shown).reverse(); // team: newest on top
  const atEnd = idx >= steps.length-1;
  const nextName = atEnd ? null : members[steps[idx+1].p].name;
  const progress = mode==="squad" ? `Member ${idx+1} of ${steps.length}` : `Draw ${idx+1} of ${steps.length}`;

  return (
    <div className="wrap cer">
      <div className="cer-top"><span className="cer-prog">{progress}</span></div>
      <div className="cer-card" key={idx}>
        <div className="cer-name display">{person.name}</div>
        <div className="cer-sub">{st.full ? `${total} teams` : `Team ${shown} of ${total}`}</div>
        <div className="cer-teams">
          {display.map((id,i)=>{
            const isNew = mode==="squad" ? true : i===0;
            return (
              <div className={"cer-team"+(isNew?" pop":"")} key={id} style={isNew ? {animationDelay:`${mode==="squad"?Math.min(i*0.05,0.8):0}s`} : undefined}>
                <span className="ct-flag">{TEAMS[id].f}</span>
                <span className="ct-name">{TEAMS[id].n}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="sticky-cta">
        <button className="btn btn-gold big full" onClick={onNext}><Sparkles size={18}/> {atEnd ? "Finish the draw" : `Next: ${nextName}`}</button>
      </div>
    </div>
  );
}

/* ---------------------------- GROUP VIEW -------------------------- */
function GroupView({ group, preds, onPick, mine, toggleMine, saveGroup, saveResult, exit, isCreator, onCeremony, matches, knockouts }){
  const [tab, setTab] = useState("ranks");
  const [project, setProject] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [openCard, setOpenCard] = useState(null);
  useEffect(()=>{ const t=setInterval(()=>setNow(Date.now()),1000); return ()=>clearInterval(t); },[]);

  // Official feed scores win; manual per-group results remain the fallback for unfilled fixtures.
  const results = useMemo(()=>mergeResults(group.results, matches), [group.results, matches]);

  const primary = mine[0];
  const myPreds = (primary && preds[primary]) ? preds[primary] : {};
  const effResults = useMemo(()=>{
    const r = {...results};
    if(project){ for(const fx of FIXTURES){ if(!r[fx.id] && myPreds[fx.id]) r[fx.id]=predResult(myPreds[fx.id]); } }
    return r;
  }, [results, preds, mine, project]);

  const standings = useMemo(()=>{
    const rows = group.members.map(m=>{
      const teams = group.alloc[m.id].map(id=>({id, ...teamStats(id, effResults)}));
      const agg = teams.reduce((s,t)=>({pts:s.pts+t.pts,gd:s.gd+t.gd,gf:s.gf+t.gf,w:s.w+t.w,d:s.d+t.d,l:s.l+t.l,pld:s.pld+t.pld,bestUpset:Math.max(s.bestUpset,t.bestUpset)}),{pts:0,gd:0,gf:0,w:0,d:0,l:0,pld:0,bestUpset:0});
      return { ...m, teams, ...agg };
    });
    rows.sort((a,b)=> b.pts-a.pts || b.gd-a.gd || b.gf-a.gf || b.w-a.w || a.name.localeCompare(b.name));
    let rank=0,prev=null; rows.forEach((row,i)=>{ if(prev===null||row.pts!==prev){rank=i+1;prev=row.pts;} row.rank=rank; });
    return rows;
  }, [group, effResults]);

  const anyPlayed = standings.some(s=>s.pld>0);
  const titles = useMemo(()=>computeTitles(standings, anyPlayed, group, effResults), [standings, anyPlayed, group, effResults]);
  const teamHolders = useMemo(()=>{ const m={}; group.members.forEach(mem=>(group.alloc[mem.id]||[]).forEach(tid=> m[tid]=(m[tid]||0)+1)); return m; }, [group]);

  const { nextFx, lastFx } = useMemo(()=>{
    const unplayed = FIXTURES.filter(fx=>!results[fx.id]).sort((a,b)=>koOf(a,matches)-koOf(b,matches));
    const played = FIXTURES.filter(fx=>results[fx.id]).sort((a,b)=>koOf(b,matches)-koOf(a,matches));
    return { nextFx: unplayed[0]||null, lastFx: played[0]||null };
  }, [results, matches, now]);

  const setResult = (fxId,h,a) => saveResult(fxId, h, a);

  const tabs = [
    {k:"ranks", label:"Ranks", icon:<Trophy size={16}/>},
    {k:"squads", label:"Squads", icon:<Users size={16}/>},
    {k:"predict", label:"Predict", icon:<Wand2 size={16}/>},
    {k:"cup", label:"Cup", icon:<Flag size={16}/>},
    {k:"pot", label:"Pot", icon:<Coins size={16}/>},
  ];

  return (
    <div className="wrap group">
      <div className="grp-head">
        <button className="icon-btn" onClick={exit}><ArrowLeft size={20}/></button>
        <div className="grp-id"><div className="grp-name display">{group.name}</div><div className="grp-meta">{group.members.length} members</div></div>
        <CodePill code={group.code}/>
      </div>
      <ShareInvite code={group.code}/>
      <Banner nextFx={nextFx} lastFx={lastFx} now={now} leader={anyPlayed?standings[0]:null} results={results} matches={matches}/>
      {isCreator && <button className="replay-draw" onClick={onCeremony}><Sparkles size={14}/> Watch the draw again</button>}
      <div className="tabs">
        {tabs.map(t=>(<button key={t.k} className={"tab"+(tab===t.k?" on":"")} onClick={()=>setTab(t.k)}>{t.icon}<span>{t.label}</span></button>))}
      </div>

      {tab==="ranks" &&
        <button className={"crystal"+(project?" on":"")} onClick={()=>setProject(p=>!p)}>
          <Wand2 size={16}/> {project ? "Showing the table from your picks — tap for live only" : "Crystal Ball: project your own picks onto the table"}
        </button>}

      {tab==="ranks" && <RanksTab standings={standings} titles={titles} anyPlayed={anyPlayed} pool={group.pool} project={project}/>}
      {tab==="squads" && <SquadsTab standings={standings} titles={titles} anyPlayed={anyPlayed} teamHolders={teamHolders} openCard={openCard} setOpenCard={setOpenCard}/>}
      {tab==="predict" && <PredictTab group={group} preds={preds} onPick={onPick} mine={mine} toggleMine={toggleMine} now={now} results={results} matches={matches}/>}
      {tab==="cup" && <CupTab group={group} setResult={setResult} nextFx={nextFx} results={results} matches={matches} knockouts={knockouts}/>}
      {tab==="pot" && <PotTab group={group} standings={standings} saveGroup={saveGroup} project={project} anyPlayed={anyPlayed}/>}
    </div>
  );
}

function computeTitles(standings, anyPlayed, group, effResults){
  const t = {}; const add=(id,b)=>{ if(!id)return; (t[id]=t[id]||[]).push(b); };
  if(!anyPlayed) return t;
  add(standings[0].id, {e:"👑",l:"Top Dog"});
  if(standings.length>1) add(standings[standings.length-1].id, {e:"🥄",l:"Wooden Spoon"});
  const slayer=[...standings].sort((a,b)=>b.bestUpset-a.bestUpset)[0]; if(slayer.bestUpset>0) add(slayer.id,{e:"🐉",l:"Giant Slayer"});
  const goals=[...standings].sort((a,b)=>b.gf-a.gf)[0]; if(goals.gf>0) add(goals.id,{e:"⚽",l:"Goal Machine"});
  const dh=[...standings].map(s=>({id:s.id,v:Math.max(0,...s.teams.filter(x=>tierOf(x.id)===4).map(x=>x.pts))})).sort((a,b)=>b.v-a.v)[0];
  if(dh && dh.v>0) add(dh.id,{e:"🐎",l:"Dark Horse"});
  let lastRound=-1; for(const fx of FIXTURES){ if(effResults[fx.id]) lastRound=Math.max(lastRound,fx.round); }
  if(lastRound>=0){ const rr={}; for(const fx of FIXTURES){ if(fx.round===lastRound && effResults[fx.id]) rr[fx.id]=effResults[fx.id]; }
    const fr=group.members.map(m=>({id:m.id,v:group.alloc[m.id].reduce((s,tid)=>s+teamStats(tid,rr).pts,0)})).sort((a,b)=>b.v-a.v)[0];
    if(fr.v>0) add(fr.id,{e:"🔥",l:"On Fire"}); }
  return t;
}

/* ------------------------------ BANNER ---------------------------- */
function Banner({ nextFx, lastFx, now, leader, results, matches }){
  const cd = nextFx ? countdown(koOf(nextFx, matches) - now) : null;
  return (
    <div className="banner">
      {leader && <div className="brag"><Crown size={15}/> <b>{leader.name}</b> leads the group · {leader.pts} pts</div>}
      <div className="banner-grid">
        {nextFx ? (
          <div className="bcell next">
            <div className="bcell-lbl">Next kick-off {cd && cd.done ? "· live now-ish" : ""}</div>
            <div className="match"><Side id={nextFx.home}/><span className="vs">v</span><Side id={nextFx.away} right/></div>
            {cd && !cd.done && <div className="cd display">{cd.d}d {cd.h}h {cd.m}m {cd.s}s</div>}
            <div className="bcell-sub">Group {nextFx.grp} · {fmtKickoff(koOf(nextFx, matches))}</div>
          </div>
        ) : <div className="bcell next"><div className="bcell-lbl">All group games are in 🎉</div></div>}
        {lastFx ? (
          <div className="bcell last">
            <div className="bcell-lbl">Just played</div>
            <div className="match"><Side id={lastFx.home}/><span className="score display">{results[lastFx.id]?`${results[lastFx.id].h}–${results[lastFx.id].a}`:""}</span><Side id={lastFx.away} right/></div>
            <div className="bcell-sub">Group {lastFx.grp} · {fmtKickoff(koOf(lastFx, matches))}</div>
          </div>
        ) : <div className="bcell last"><div className="bcell-lbl">No results entered yet</div><div className="bcell-sub">Head to the Cup tab to log scores.</div></div>}
      </div>
    </div>
  );
}
const Side = ({id, right}) => (<span className={"side"+(right?" r":"")}><span className="flag">{TEAMS[id].f}</span><span className="abbr">{id}</span></span>);

/* ------------------------------ RANKS ----------------------------- */
function RanksTab({ standings, titles, anyPlayed, pool, project }){
  const max = Math.max(1, ...standings.map(s=>s.pts));
  const top = standings.length ? standings[0].pts : 0;
  const payouts = pool.amount>0 ? computePayouts(standings, pool) : null;
  return (
    <div>
      <div className="section-head"><span className="display sh-title">Group standings</span>
        <span className="sh-sub">{standings.length} members · {project?"projected":(anyPlayed?"live":"not started")}</span></div>
      {!anyPlayed && <p className="empty-note"><Sparkles size={15}/> The draw is set. Once games kick off (or you fill in the Predict tab), the group leaderboard comes alive.</p>}
      <div className="board">
        {standings.map((s,i)=>(
          <div key={s.id} className={"lb-row"+(s.rank===1&&anyPlayed?" lead":"")}>
            <div className={"lb-rank display"+(s.rank<=3&&anyPlayed?" medal m"+s.rank:"")}>{anyPlayed? s.rank : i+1}</div>
            <div className="lb-main">
              <div className="lb-name">{s.name}{(titles[s.id]||[]).slice(0,3).map((b,j)=><span key={j} className="badge" title={b.l}>{b.e}</span>)}</div>
              <div className="lb-bar-wrap"><div className="lb-bar" style={{width:`${(s.pts/max)*100}%`}}/></div>
              <div className="lb-sub">{s.teams.length} teams · {s.w}W {s.d}D {s.l}L
                {anyPlayed && s.rank!==1 ? ` · ${top-s.pts} off top` : ""}
                {payouts&&payouts[s.id]?` · ${money(payouts[s.id],pool.cur)}`:""}</div>
            </div>
            <div className="lb-pts display">{s.pts}<span>pts</span></div>
          </div>
        ))}
      </div>
      <p className="hint center"><Info size={13}/> Scores reward wins, goal margins, clean sheets and giant-killing upsets across all of a member's teams.</p>
    </div>
  );
}

/* ------------------------------ SQUADS ---------------------------- */
function SquadsTab({ standings, titles, anyPlayed, teamHolders, openCard, setOpenCard }){
  const alpha = [...standings].sort((a,b)=>a.name.localeCompare(b.name));
  const hasDupes = Object.values(teamHolders||{}).some(c=>c>1);
  return (<div className="squads">
    {hasDupes && <p className="hint"><Info size={13}/> With more than 12 members, every team is still allocated and squads are balanced to be about equally strong, sharing the elite and strong sides out evenly first, so some teams get held by more than one member. A <span className="t-share inline">×N</span> tag shows how many members hold that team.</p>}
    {alpha.map(s=>(
    <Card key={s.id} s={s} titles={titles[s.id]||[]} anyPlayed={anyPlayed} teamHolders={teamHolders} open={openCard===s.id} onToggle={()=>setOpenCard(o=>o===s.id?null:s.id)}/>
  ))}</div>);
}
function Card({ s, titles, anyPlayed, teamHolders, open, onToggle }){
  const teams = [...s.teams].sort((a,b)=> tierOf(a.id)-tierOf(b.id) || TEAMS[a.id].r-TEAMS[b.id].r);
  return (
    <div className={"card"+(open?" open":"")}>
      <button className="card-head" onClick={onToggle}>
        <div className="card-rank display">{anyPlayed? "#"+s.rank : "—"}</div>
        <div className="card-name">{s.name}
          <div className="card-badges">{titles.map((b,i)=><span key={i} className="badge">{b.e}</span>)}<span className="card-tag">{teams.length} teams</span></div>
        </div>
        <div className="card-pts display">{s.pts}<span>pts</span></div>
      </button>
      <div className="card-teams" style={open?{maxHeight:teams.length*46+16}:undefined}>
        {teams.map(t=>(
          <div className="team-row" key={t.id}>
            <span className="t-flag">{TEAMS[t.id].f}</span>
            <span className="t-name">{TEAMS[t.id].n}</span>
            {teamHolders&&teamHolders[t.id]>1 && <span className="t-share" title={`Held by ${teamHolders[t.id]} members`}>×{teamHolders[t.id]}</span>}
            <span className="t-rec">{t.pld>0?`${t.w}-${t.d}-${t.l}`:"—"}</span>
            <span className="t-pts display">{t.pts}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------- PREDICT ----------------------------- */
// Quiet, information-only chance line: "🇲🇽 68% / Draw 21% / 🇿🇦 12%". Renders nothing when the
// feed has no figures or the game is over.
function Chances({ fx, matches }){
  const c = chancesFor(fx, matches);
  if(!c) return null;
  return (
    <div className="chances">
      <span className="chc"><span className="flag">{TEAMS[fx.home].f}</span> <b>{c.home}%</b></span>
      <span className="chc-sep">/</span>
      <span className="chc">Draw <b>{c.draw}%</b></span>
      <span className="chc-sep">/</span>
      <span className="chc"><span className="flag">{TEAMS[fx.away].f}</span> <b>{c.away}%</b></span>
    </div>
  );
}
function PredictTab({ group, preds, onPick, mine, toggleMine, now, results, matches }){
  const members = group.members;
  const managed = members.filter(m=>mine.includes(m.id));
  const setPick = (memId, fx, p) => {
    if(now>=koOf(fx,matches) || results[fx.id]) return;
    const next = (preds[memId]||{})[fx.id]===p ? null : p; // tapping the same pick toggles it off
    onPick(memId, fx.id, next);
  };

  const anyResult = FIXTURES.some(fx=>results[fx.id]);
  const upcoming = FIXTURES.filter(fx=> now < koOf(fx,matches) && !results[fx.id]);
  const reveal = FIXTURES.filter(fx=> now>=koOf(fx,matches) || results[fx.id]).sort((a,b)=>koOf(b,matches)-koOf(a,matches));
  const pickedCount = (id) => upcoming.filter(fx=>(preds[id]||{})[fx.id]).length;
  const upcomingHasChances = upcoming.some(fx=>chancesFor(fx,matches));
  const revealHasChances = reveal.some(fx=>chancesFor(fx,matches));

  const board = useMemo(()=>{
    const rows = members.map(m=>{
      let correct=0, called=0;
      for(const fx of FIXTURES){
        const res = results[fx.id]; if(!res) continue;
        const pk = preds[m.id] && preds[m.id][fx.id]; if(!pk) continue;
        called++; if(outcome(res)===pk) correct++;
      }
      return { ...m, correct, called };
    });
    rows.sort((a,b)=> b.correct-a.correct || b.called-a.called || a.name.localeCompare(b.name));
    let rank=0,prev=null; rows.forEach((r,i)=>{ if(prev===null||r.correct!==prev){rank=i+1;prev=r.correct;} r.rank=rank; });
    return rows;
  }, [members, preds, results]);

  return (
    <div>
      <div className="section-head"><span className="display sh-title">Predictions league</span>
        <span className="sh-sub">{managed.length? `${managed.length} on this device` : "pick the winners"}</span></div>

      <div className="me-pick">
        <span className="me-lbl">You're predicting for</span>
        <div className="me-chips">
          {members.map(m=>(<button key={m.id} className={"me-chip"+(mine.includes(m.id)?" on":"")} onClick={()=>toggleMine(m.id)}>{m.name}</button>))}
        </div>
      </div>
      <p className="hint"><Info size={13}/> Tap everyone you're entering picks for, including kids without their own phone. One device can hold several people's predictions.</p>

      <div className="md-head">Standings</div>
      {anyResult ? (
        <div className="board">
          {board.map(s=>(
            <div key={s.id} className={"pl-row"+(s.rank===1?" lead":"")}>
              <span className="pl-rank display">{s.rank}</span>
              <span className="pl-name">{s.name}{mine.includes(s.id) && <span className="pl-you">yours</span>}</span>
              <span className="pl-stat">{s.correct} correct of {s.called}</span>
              <span className="pl-pts display">{s.correct}<span>pts</span></span>
            </div>
          ))}
        </div>
      ) : <p className="hint"><Info size={13}/> The standings light up as games finish. Each correct winner is worth one point.</p>}

      <div className="md-head">Upcoming picks</div>
      {managed.length===0 ? <p className="hint"><Info size={13}/> Tap the names above to start predicting. Picks lock at kick-off and stay hidden from everyone else until then.</p>
        : <>
          <div className="pred-progress">
            {managed.map(m=>(<span className="prog-item" key={m.id}><b>{m.name}</b> {pickedCount(m.id)}/{upcoming.length}</span>))}
          </div>
          {upcoming.length===0 ? <p className="hint"><Info size={13}/> No games left to predict right now.</p>
          : <>
            {upcomingHasChances && <p className="chance-note">Estimated chances from bookmakers' odds, for interest only.</p>}
            <div className="fixtures">
              {upcoming.map(fx=>(
                <div className="fx" key={fx.id}>
                  <div className="fx-top"><span className="fx-grp">Grp {fx.grp}</span><span className="fx-date">{fmtKickoff(koOf(fx,matches))}</span></div>
                  <div className="fx-main">
                    <div className="fx-team"><span className="flag">{TEAMS[fx.home].f}</span><span>{TEAMS[fx.home].n}</span></div>
                    <span className="fx-mid">v</span>
                    <div className="fx-team r"><span>{TEAMS[fx.away].n}</span><span className="flag">{TEAMS[fx.away].f}</span></div>
                  </div>
                  <Chances fx={fx} matches={matches}/>
                  {managed.map(m=>{
                    const pick = (preds[m.id]||{})[fx.id];
                    return (
                      <div className="pick-line" key={m.id}>
                        {managed.length>1 && <span className="pick-who">{m.name}</span>}
                        <div className="pred-row">
                          {[["home",fx.home],["draw","Draw"],["away",fx.away]].map(([p,lbl])=>(
                            <button key={p} className={"pred-btn"+(pick===p?" on":"")} onClick={()=>setPick(m.id,fx,p)}>{lbl}</button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div></>}
        </>}

      {reveal.length>0 && <>
        <div className="md-head">Results &amp; everyone's calls</div>
        {revealHasChances && <p className="chance-note">Estimated chances from bookmakers' odds, for interest only.</p>}
        <div className="fixtures">
          {reveal.map(fx=>{
            const res = results[fx.id];
            const act = res ? outcome(res) : null;
            const off = officialFor(fx, matches);
            const live = res && off && off.hasScore && isLiveStatus(off.status);
            return (
              <div className={"fx"+(res?" done":"")} key={fx.id}>
                <div className="fx-top"><span className="fx-grp">Grp {fx.grp}</span>
                  <span className="fx-date">{res? `${live?"Live":"Full time"} ${res.h}–${res.a}` : "Kicked off"}</span></div>
                <div className="fx-main">
                  <div className="fx-team"><span className="flag">{TEAMS[fx.home].f}</span><span>{TEAMS[fx.home].n}</span></div>
                  <span className="fx-mid">v</span>
                  <div className="fx-team r"><span>{TEAMS[fx.away].n}</span><span className="flag">{TEAMS[fx.away].f}</span></div>
                </div>
                <Chances fx={fx} matches={matches}/>
                <div className="calls">
                  {members.map(m=>{
                    const pk = preds[m.id] && preds[m.id][fx.id];
                    const right = act && pk ? pk===act : null;
                    const lbl = !pk ? "no pick" : pk==="draw" ? "Draw" : pk==="home" ? TEAMS[fx.home].n : TEAMS[fx.away].n;
                    return (
                      <div className={"call"+(right===true?" hit":right===false?" miss":"")} key={m.id}>
                        <span className="call-name">{m.name}{mine.includes(m.id) && <span className="call-mine">yours</span>}</span>
                        <span className="call-pick">{lbl}{right===true?" ✓":right===false?" ✗":""}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </>}
    </div>
  );
}

/* ------------------------------- CUP ------------------------------ */
function CupTab({ group, setResult, nextFx, results, matches, knockouts }){
  const [sel, setSel] = useState(()=> nextFx ? nextFx.grp : "A");
  const isKO = sel==="KO";
  const table = isKO ? [] : groupStandings(sel, results);
  const fixtures = isKO ? [] : FIXTURES.filter(fx=>fx.grp===sel).sort((a,b)=>koOf(a,matches)-koOf(b,matches));
  return (
    <div>
      <div className="section-head"><span className="display sh-title">The tournament</span><span className="sh-sub">{isKO?"knockout bracket":"real groups & results"}</span></div>
      <div className="grp-sel">
        {LETTERS.map(L=>(<button key={L} className={"grp-chip"+(sel===L?" on":"")} onClick={()=>setSel(L)}>{L}</button>))}
        <button className={"grp-chip ko"+(isKO?" on":"")} onClick={()=>setSel("KO")}>Knockouts</button>
      </div>

      {isKO ? <KnockoutList knockouts={knockouts}/> : <>
      <div className="std-card">
        <div className="std-title">Group {sel}</div>
        <div className="std-row std-h"><span className="std-pos"></span><span className="std-team">Team</span><span>P</span><span>W</span><span>D</span><span>L</span><span>GD</span><span className="std-pts">Pts</span></div>
        {table.map((t,i)=>(
          <div className={"std-row"+(i<2?" qual":"")} key={t.id}>
            <span className="std-pos">{i+1}</span>
            <span className="std-team"><span className="t-flag sm">{TEAMS[t.id].f}</span><span className="std-name">{TEAMS[t.id].n}</span></span>
            <span>{t.pld}</span><span>{t.w}</span><span>{t.d}</span><span>{t.l}</span><span>{t.gd>=0?"+":""}{t.gd}</span><span className="std-pts">{t.pts}</span>
          </div>
        ))}
        <div className="std-foot">Top two (highlighted) advance, plus the best third-placed sides.</div>
      </div>

      <div className="md-head">Group {sel} fixtures</div>
      <div className="fixtures">
        {fixtures.map(fx=>{
          const res = results[fx.id];
          const off = officialFor(fx, matches);
          const showOfficial = !!(off && off.hasScore);
          return (
            <div className={"fx"+(res?" done":"")} key={fx.id}>
              <div className="fx-top"><span className="fx-grp">MD{fx.round+1}</span>
                <span className="fx-date">{showOfficial ? (isLiveStatus(off.status)?"Live":"Full time") : fmtKickoff(koOf(fx,matches))}</span></div>
              <div className="fx-main">
                <div className="fx-team"><span className="flag">{TEAMS[fx.home].f}</span><span>{TEAMS[fx.home].n}</span></div>
                {showOfficial
                  ? <span className="score display">{off.h}–{off.a}</span>
                  : <ScoreEntry fx={fx} res={res} onSet={setResult}/>}
                <div className="fx-team r"><span>{TEAMS[fx.away].n}</span><span className="flag">{TEAMS[fx.away].f}</span></div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="hint"><Info size={13}/> Official scores from the live feed fill in automatically. Until then, anyone in the group can enter a score here, and results flow straight into both the real group table above and the group standings.</p>
      </>}
    </div>
  );
}

/* ---------------------------- KNOCKOUTS --------------------------- */
// Read-only bracket view (no manual scores, no predictions). Reads the knockout rows from the
// shared feed, decodes undecided slot tokens into readable placeholders, and shows local kick-off
// times, live/final scores and chance percentages with the same treatment as the group games.
const KO_STAGE_ORDER = ["Round of 32","Round of 16","Quarterfinal","Semifinal","Match for 3rd place","Final"];
const KO_STAGE_LABEL = { "Round of 32":"Round of 32", "Round of 16":"Round of 16", "Quarterfinal":"Quarter-finals", "Semifinal":"Semi-finals", "Match for 3rd place":"Play-off for third", "Final":"Final" };
const KO_STAGE_TAG = { "Round of 32":"R32", "Round of 16":"R16", "Quarterfinal":"QF", "Semifinal":"SF", "Match for 3rd place":"3rd", "Final":"Final" };
// Token -> readable placeholder for a slot whose team is not decided yet. Real team ids fall through
// to TEAMS elsewhere; unknown formats show the raw token rather than guess.
function koSlotLabel(tok){
  if(!tok) return "To be decided";
  let m;
  if((m=/^W(\d+)$/.exec(tok))) return `Winner of Match ${m[1]}`;
  if((m=/^L(\d+)$/.exec(tok))) return `Loser of Match ${m[1]}`;
  if((m=/^1([A-L])$/.exec(tok))) return `Winners of Group ${m[1]}`;
  if((m=/^2([A-L])$/.exec(tok))) return `Runners-up of Group ${m[1]}`;
  if((m=/^3([A-L])/.exec(tok))) return `Third place Group ${m[1]}`;
  return tok;
}
function KoTeam({ tok, right }){
  const t = TEAMS[tok];
  if(!t) return <div className={"fx-team"+(right?" r":"")}><span className="ko-tbd">{koSlotLabel(tok)}</span></div>;
  return right
    ? <div className="fx-team r"><span>{t.n}</span><span className="flag">{t.f}</span></div>
    : <div className="fx-team"><span className="flag">{t.f}</span><span>{t.n}</span></div>;
}
function KoMatch({ row }){
  const ko = row.kickoff ? Date.parse(row.kickoff) : NaN;
  const completed = (row.status||"")==="completed";
  const hasScore = row.home_score!=null && row.away_score!=null;
  const live = hasScore && isLiveStatus(row.status);
  const showChances = !completed && row.home_odds!=null && row.draw_odds!=null && row.away_odds!=null;
  return (
    <div className={"fx"+(hasScore?" done":"")}>
      <div className="fx-top"><span className="fx-grp">{KO_STAGE_TAG[row.stage]||""}</span>
        <span className="fx-date">{hasScore ? `${live?"Live":"Full time"} ${row.home_score}–${row.away_score}` : (Number.isNaN(ko) ? "To be scheduled" : fmtKickoff(ko))}</span></div>
      <div className="fx-main">
        <KoTeam tok={row.home_team}/>
        <span className="fx-mid">v</span>
        <KoTeam tok={row.away_team} right/>
      </div>
      {showChances && (
        <div className="chances">
          <span className="chc">{TEAMS[row.home_team]?.f && <span className="flag">{TEAMS[row.home_team].f}</span>} <b>{row.home_odds}%</b></span>
          <span className="chc-sep">/</span>
          <span className="chc">Draw <b>{row.draw_odds}%</b></span>
          <span className="chc-sep">/</span>
          <span className="chc">{TEAMS[row.away_team]?.f && <span className="flag">{TEAMS[row.away_team].f}</span>} <b>{row.away_odds}%</b></span>
        </div>
      )}
    </div>
  );
}
function KnockoutList({ knockouts }){
  const rows = Object.values(knockouts||{});
  if(!rows.length) return <p className="empty-note"><Sparkles size={15}/> The knockout bracket appears here once the fixtures are published.</p>;
  const byStage = {}; rows.forEach(r=>{ (byStage[r.stage]=byStage[r.stage]||[]).push(r); });
  const order = KO_STAGE_ORDER.filter(s=>byStage[s]);
  Object.keys(byStage).forEach(s=>{ if(!order.includes(s)) order.push(s); });
  return (
    <div>
      {order.map(stage=>{
        const list = byStage[stage].slice().sort((a,b)=> (Date.parse(a.kickoff)||0)-(Date.parse(b.kickoff)||0) || (a.match_number||0)-(b.match_number||0));
        return (
          <div key={stage}>
            <div className="md-head">{KO_STAGE_LABEL[stage]||stage}</div>
            <div className="fixtures">{list.map(r=> <KoMatch key={r.id} row={r}/>)}</div>
          </div>
        );
      })}
      <p className="hint"><Info size={13}/> Knockout kickoffs, teams and scores update automatically from the live feed. This view is read only.</p>
    </div>
  );
}
function ScoreEntry({ fx, res, onSet }){
  const [h,setH]=useState(res?String(res.h):""); const [a,setA]=useState(res?String(res.a):"");
  useEffect(()=>{ setH(res?String(res.h):""); setA(res?String(res.a):""); },[res, fx.id]);
  const commit=(hv,av)=>{ if(hv!==""&&av!=="") onSet(fx.id, Math.max(0,+hv||0), Math.max(0,+av||0)); };
  return (
    <div className="score-entry">
      <input className="sc" inputMode="numeric" value={h} placeholder="–" onChange={e=>{const v=e.target.value.replace(/\D/g,"").slice(0,2);setH(v);commit(v,a);}}/>
      <span className="dash">:</span>
      <input className="sc" inputMode="numeric" value={a} placeholder="–" onChange={e=>{const v=e.target.value.replace(/\D/g,"").slice(0,2);setA(v);commit(h,v);}}/>
      {res && <button className="clr" onClick={()=>onSet(fx.id,null)} title="Clear"><X size={13}/></button>}
    </div>
  );
}

/* ------------------------------- POT ------------------------------ */
const STRUCTURES = [
  {k:"top15", t:"Top 15% share it", d:"Tapered — biggest slice to the leader, then down the line. Fair for big groups."},
  {k:"winner", t:"Winner takes all", d:"One champion scoops the lot."},
  {k:"top3", t:"Podium (50 / 30 / 20)", d:"Classic top-three split."},
  {k:"even", t:"Everyone shares", d:"Split evenly — pure participation fun."},
  {k:"champion", t:"Back the Champion", d:"20% held for whoever owns the team that wins the Cup; the rest via the top-15% taper."},
];
function PotTab({ group, standings, saveGroup, project, anyPlayed }){
  const { pool } = group; const set=(patch)=>saveGroup({...group, pool:{...pool, ...patch}});
  const live = anyPlayed || project;
  const payouts = pool.amount>0 ? computePayouts(standings, pool) : {};
  const reserve = pool.structure==="champion" && pool.amount>0 ? pool.amount*0.2 : 0;
  const winners = standings.filter(s=>payouts[s.id]>0);
  return (
    <div>
      <div className="pot-set">
        <label className="field-lbl no-mb">Prize pot</label>
        <div className="pot-amount">
          <select className="cur-sel" value={pool.cur} onChange={e=>set({cur:e.target.value})}>{CURRENCIES.map(c=><option key={c}>{c}</option>)}</select>
          <input className="input pot-input display" inputMode="numeric" placeholder="0" value={pool.amount||""} onChange={e=>set({amount:Math.max(0,+e.target.value.replace(/\D/g,"")||0)})}/>
        </div>
        <div className="quick">{[50,100,250,500].map(v=><button key={v} className="qbtn" onClick={()=>set({amount:v})}>+{v}</button>)}{pool.amount>0 && <button className="qbtn ghost" onClick={()=>set({amount:0})}>clear</button>}</div>
      </div>
      <label className="field-lbl">How should it be split?</label>
      <div className="struct-list">{STRUCTURES.map(s=>(
        <button key={s.k} className={"struct"+(pool.structure===s.k?" on":"")} onClick={()=>set({structure:s.k})}>
          <div className="struct-t">{s.t}{pool.structure===s.k&&<Check size={15}/>}</div><div className="struct-d">{s.d}</div>
        </button>))}</div>
      {pool.amount>0 ? (
        live ? (
        <div className="payout-box">
          <div className="payout-head">If it ended {project?"on the predicted table":"right now"}…</div>
          {reserve>0 && <div className="reserve">🏆 {money(reserve,pool.cur)} held for the Champion's backer — decided at the Final</div>}
          {winners.length>0 ? winners.map(s=>(
            <div className="payout-row" key={s.id}><span className="po-rank display">{s.rank}</span><span className="po-name">{s.name}</span><span className="po-amt display">{money(payouts[s.id],pool.cur)}</span></div>
          )) : <div className="muted center pad">No results yet to split on.</div>}
        </div>
        ) : <p className="hint center"><Coins size={14}/> The split appears here once real match results are in. To preview it from predictions instead, switch on the Crystal Ball in the Ranks tab.</p>
      ) : <p className="hint center"><Coins size={14}/> Set a pot above and pick a split. The numbers come alive once results are in.</p>}
      <p className="disclaimer"><Info size={13}/> The app only tracks the pot and suggests a split. Settle up between yourselves — no money moves through here.</p>
    </div>
  );
}

/* ---------------------------- SHARED BITS ------------------------- */
function TopBar({ back, title }){ return <div className="topbar"><button className="icon-btn" onClick={back}><ArrowLeft size={20}/></button><span className="topbar-t">{title}</span><span style={{width:40}}/></div>; }
function CodePill({ code }){
  const [done,setDone]=useState(false);
  const copy = async () => { try{ await navigator.clipboard.writeText(code);}catch(e){} setDone(true); setTimeout(()=>setDone(false),1400); };
  return (<button className="code-pill" onClick={copy} title="Copy group code"><span className="code-lbl">CODE</span><span className="code-val display">{code}</span>{done?<Check size={15}/>:<Copy size={14}/>}</button>);
}

// Share invite: native share sheet where available, otherwise copy the message to the clipboard. A
// purely client-side action, it never touches the saved data or the Supabase sync.
function ShareInvite({ code }){
  const [copied,setCopied]=useState(false);
  const share = async () => {
    const joinUrl = `${window.location.origin}/?code=${code}`;
    const message = `You're invited to our World Cup draw. A bit of fun for the tournament: you get a random set of national teams to follow, then we all battle it out on a shared leaderboard. Tap the link to jump in, your code is already loaded.

${joinUrl}

Code: ${code}

Made by ProfitPulse. Every team at this World Cup is chasing the trophy; we help business owners chase theirs. https://profit-pulse.com.au`;
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try { await navigator.share({ title:"World Cup Group Draw", text:message }); }   // link is in the message; no url param so it is not appended again
      catch(e){ if(e && e.name==="AbortError") return; }   // user cancelled the sheet, or share failed; ignore quietly
      return;
    }
    try { await navigator.clipboard.writeText(message); setCopied(true); setTimeout(()=>setCopied(false),2000); }
    catch(e){}
  };
  return (
    <div className="share-invite">
      <button className="btn btn-ghost share-btn" onClick={share}><Share2 size={16}/> Share invite</button>
      {copied && <span className="share-copied"><Check size={14}/> Copied, paste it to your group</span>}
    </div>
  );
}

/* ---------------------------- PAYOUT MATHS ------------------------ */
function computePayouts(standings, pool){
  const N=standings.length, amt=pool.amount, out={};
  if(amt<=0||N===0) return out;
  const ranked=standings;
  const give=(list)=>list.forEach(([id,share])=> out[id]=(out[id]||0)+amt*share);
  const taper=(pot,count)=>{ const W=Math.max(1,Math.min(count,N)), sum=W*(W+1)/2; return ranked.slice(0,W).map((s,i)=>[s.id,(pot/amt)*((W-i)/sum)]); };
  if(pool.structure==="winner") give([[ranked[0].id,1]]);
  else if(pool.structure==="even") give(ranked.map(s=>[s.id,1/N]));
  else if(pool.structure==="top3"){ const sh=N>=3?[.5,.3,.2]:N===2?[.6,.4]:[1]; give(ranked.slice(0,sh.length).map((s,i)=>[s.id,sh[i]])); }
  else if(pool.structure==="champion") give(taper(amt*0.8, Math.max(1,Math.ceil(0.15*N))));
  else give(taper(amt, Math.max(1,Math.ceil(0.15*N))));
  return out;
}

/* ----------------------------- TIME UTILS ------------------------- */
function countdown(ms){ if(ms<=0) return {done:true}; const s=Math.floor(ms/1000); return {done:false,d:Math.floor(s/86400),h:Math.floor(s%86400/3600),m:Math.floor(s%3600/60),s:s%60}; }
function fmtDate(ms){ try{ return new Date(ms).toLocaleString(undefined,{day:"numeric",month:"short",hour:"numeric",minute:"2-digit"}); }catch{ return new Date(ms).toDateString(); } }
// Kick-off in the viewer's OWN timezone (device default, no prompt), e.g. "Thu 11 Jun, 5:00 am AEST".
// The short timezone label keeps it unambiguous which zone the time is shown in.
function fmtKickoff(ms){ try{ return new Date(ms).toLocaleString(undefined,{weekday:"short",day:"numeric",month:"short",hour:"numeric",minute:"2-digit",timeZoneName:"short"}); }catch{ return fmtDate(ms); } }

/* --------------------------- LIVE FEED OVERLAY -------------------- */
// The shared `matches` feed (read-only, anon) overlays the app's hardcoded fixtures.
// Real kick-off for a fixture: the feed's official time when present, else the hardcoded fallback.
function koOf(fx, matches){ const m=matches&&matches[fx.id]; if(m&&m.kickoff){ const t=Date.parse(m.kickoff); if(!Number.isNaN(t)) return t; } return fx.ko; }
const isLiveStatus = (s) => /progress|live|playing/i.test(s||"");
// Official score (with status) for a fixture from the feed, or null if the feed has not filled it.
function officialFor(fx, matches){ const m=matches&&matches[fx.id]; if(!m) return null; const hasScore = m.home_score!=null && m.away_score!=null; return { status:m.status, hasScore, h:hasScore?m.home_score:null, a:hasScore?m.away_score:null }; }
// Results map with official feed scores taking precedence over the manual per-group results,
// manual entry remaining the fallback for any fixture the feed has not filled.
function mergeResults(manual, matches){ const out={...(manual||{})}; for(const fx of FIXTURES){ const m=matches&&matches[fx.id]; if(m&&m.home_score!=null&&m.away_score!=null) out[fx.id]={h:m.home_score,a:m.away_score}; } return out; }
// Win/draw/loss CHANCE percentages (whole numbers) for a fixture, from the feed's odds-derived
// figures. Shown only before/during a game (never once completed) and only when all three exist.
function chancesFor(fx, matches){ const m=matches&&matches[fx.id]; if(!m || (m.status||"")==="completed") return null; if(m.home_odds==null||m.draw_odds==null||m.away_odds==null) return null; return { home:m.home_odds, draw:m.draw_odds, away:m.away_odds }; }

/* ------------------------------ CONFETTI -------------------------- */
function Confetti({ done }){
  const pieces = useMemo(()=>Array.from({length:46},(_,i)=>({ id:i, left:Math.random()*100, delay:Math.random()*0.25, dur:0.9+Math.random()*0.8, rot:Math.random()*360, size:7+Math.random()*8, c:["#ffd23f","#39a9db","#5cc46b","#ff7a59","#ffffff","#f4b400"][Math.floor(Math.random()*6)] })),[]);
  useEffect(()=>{ const t=setTimeout(done,1900); return ()=>clearTimeout(t); },[done]);
  return (<div className="confetti">{pieces.map(p=>(<span key={p.id} style={{left:p.left+"%",width:p.size,height:p.size*0.6,background:p.c,animationDelay:p.delay+"s",animationDuration:p.dur+"s",transform:`rotate(${p.rot}deg)`}}/>))}</div>);
}

/* ------------------------------- STYLE ---------------------------- */
function StyleBlock(){ return <style>{CSS}</style>; }
const CSS = `
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;margin:0;padding:0}
:root{--pitch:#0e7d44;--pitch2:#074a28;--night:#04140c;--gold:#ffd23f;--gold2:#f4b400;--cream:#fbf7ec;--ink:#06160e;--line:rgba(255,255,255,.13);--card:#0d2a1c;--t1:#ffd23f;--t2:#39a9db;--t3:#5cc46b;--t4:#ff7a59;}
/* min-height (never a fixed height) so the page grows with content and the document is the one scroll
   surface; overflow-x:clip stops sideways overflow WITHOUT turning the wrapper into a scroll container
   (unlike overflow-x:hidden, which would force overflow-y to auto and trap the scroll). */
.wc-root{font-family:'Outfit',system-ui,sans-serif;color:var(--cream);min-height:100vh;min-height:100dvh;position:relative;overflow-x:clip;background:radial-gradient(125% 80% at 50% -12%,#15a05a 0%,#0a5c34 42%,#04140c 100%);}
.wc-root:before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.05;z-index:0;background-image:repeating-linear-gradient(0deg,#fff 0 1px,transparent 1px 70px),repeating-linear-gradient(90deg,#fff 0 1px,transparent 1px 70px);}
.display{font-family:'Anton',sans-serif;letter-spacing:.015em;text-transform:uppercase;line-height:.96;font-weight:400}
.gold{color:var(--gold)}.muted{color:rgba(251,247,236,.55);font-weight:500}.center{text-align:center}
.wrap{max-width:680px;margin:0 auto;padding:20px 16px calc(130px + env(safe-area-inset-bottom,0px));position:relative;z-index:1}
.foot{position:relative;z-index:1;text-align:center;font-size:11px;color:rgba(251,247,236,.45);padding:13px 16px 26px;max-width:680px;margin:-110px auto 0;border-top:1px solid var(--line)}
.foot-note{line-height:1.5}
.foot-credit{display:inline-flex;align-items:center;gap:7px;margin-top:8px;font-size:12px;font-weight:600;letter-spacing:.02em;color:rgba(251,247,236,.5);line-height:1}
.foot-by{line-height:1}
.foot-logo{height:26px;width:auto;display:block}
/* every ProfitPulse logo is a link to profit-pulse.com.au with a subtle hover */
.brand-logo{cursor:pointer;text-decoration:none;transition:opacity .15s}
.brand-logo:hover{opacity:.82}
.brand-logo:active{opacity:.7}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;border:none;cursor:pointer;font-family:'Outfit';font-weight:700;font-size:15px;border-radius:14px;padding:13px 18px;transition:transform .12s,box-shadow .12s,background .15s;color:var(--ink)}
.btn:active{transform:scale(.97)}
.btn-gold{background:linear-gradient(180deg,#ffe066,#f4b400);color:#3a2a00;box-shadow:0 6px 0 #b88600,0 10px 22px rgba(0,0,0,.3)}
.btn-gold:active{box-shadow:0 2px 0 #b88600;transform:translateY(3px) scale(.99)}
.btn-gold:disabled{filter:grayscale(.6) opacity(.5);box-shadow:none;cursor:not-allowed}
.btn-ghost{background:rgba(255,255,255,.08);color:var(--cream);border:1.5px solid var(--line)}
.btn-link{background:none;color:rgba(251,247,236,.7);font-size:13px;font-weight:600;padding:6px}
.btn.big{font-size:16px;padding:15px 20px}.btn.full{width:100%}
.btn-mini{background:rgba(255,255,255,.1);color:var(--cream);font-size:12px;font-weight:600;padding:6px 11px;border-radius:9px}
.btn.sq{padding:0;width:50px;height:50px;flex:none;border-radius:13px}
.home{text-align:center;padding-top:30px}
.ball{font-size:54px;line-height:1;animation:spin 6s linear infinite,bob 3s ease-in-out infinite}
.ball.sm{font-size:38px;animation:bob 3s ease-in-out infinite}
@keyframes spin{to{transform:rotate(360deg)}}@keyframes bob{50%{transform:translateY(-8px)}}
.kicker{margin-top:14px;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);font-weight:700}
.title{font-size:clamp(40px,11vw,66px);margin:8px 0 0;text-shadow:0 4px 0 rgba(0,0,0,.25)}
.lede{max-width:440px;margin:16px auto 0;color:rgba(251,247,236,.82);font-size:15px;line-height:1.5}
.lede.center{margin:10px auto}
.cta-col{display:flex;flex-direction:column;gap:11px;max-width:360px;margin:26px auto 0}
.how{display:grid;gap:12px;max-width:440px;margin:38px auto 0;text-align:left}
.step{display:flex;gap:14px;align-items:flex-start;background:rgba(255,255,255,.045);border:1px solid var(--line);padding:14px;border-radius:15px}
.step-n{font-size:26px;color:var(--gold);width:30px;flex:none}
.step-t{font-weight:700;font-size:15px}.step-d{font-size:13px;color:rgba(251,247,236,.65);margin-top:2px;line-height:1.45}
.field-lbl{display:block;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:rgba(251,247,236,.6);margin:18px 0 8px}
.field-lbl.no-mb{margin:0}
.input{width:100%;background:rgba(255,255,255,.07);border:1.5px solid var(--line);border-radius:13px;color:var(--cream);font-family:'Outfit';font-size:16px;font-weight:500;padding:13px 15px;outline:none;transition:border .15s,background .15s}
.input:focus{border-color:var(--gold);background:rgba(255,255,255,.1)}
.input::placeholder{color:rgba(251,247,236,.38)}
.input.flex{flex:1}.input.area{resize:vertical;line-height:1.5}
.add-row{display:flex;gap:9px}
.mt{margin-top:18px}.mt-s{margin-top:10px}.row-between{display:flex;align-items:center;justify-content:space-between}
.chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:14px}
.chip{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.1);border:1px solid var(--line);border-radius:20px;padding:6px 7px 6px 13px;font-size:13.5px;font-weight:600}
.chip button{background:rgba(255,255,255,.12);border:none;color:var(--cream);border-radius:50%;width:20px;height:20px;display:grid;place-items:center;cursor:pointer}
.chip button:active{background:var(--t4)}
.hint{display:flex;gap:7px;align-items:flex-start;font-size:12.5px;color:rgba(251,247,236,.6);margin-top:14px;line-height:1.45}
.hint.center{justify-content:center;text-align:center}
.hint svg{flex:none;margin-top:2px}
.sticky-cta{position:sticky;bottom:18px;margin-top:26px}
.err{color:#ff9b7d;font-size:13px;margin-top:10px;text-align:center;font-weight:600}
.topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.topbar-t{font-weight:700;font-size:16px}
.icon-btn{background:rgba(255,255,255,.08);border:1px solid var(--line);color:var(--cream);width:40px;height:40px;border-radius:12px;display:grid;place-items:center;cursor:pointer}
.icon-btn:active{transform:scale(.94)}
.join-card{text-align:center;background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:20px;padding:30px 22px;margin-top:30px}
.code-input{text-align:center;letter-spacing:.18em;font-size:24px;padding:16px;margin-top:18px}
.group{padding-top:14px}
.grp-head{display:flex;align-items:center;gap:12px;margin-bottom:14px}
.grp-id{flex:1;min-width:0}
.grp-name{font-size:clamp(20px,5.5vw,28px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.grp-meta{font-size:12px;color:rgba(251,247,236,.55);margin-top:1px}
.code-pill{display:flex;flex-direction:column;align-items:center;gap:1px;background:linear-gradient(180deg,#ffe066,#f4b400);border:none;border-radius:13px;padding:7px 13px;cursor:pointer;color:#3a2a00;position:relative;box-shadow:0 4px 0 #b88600}
.code-pill:active{transform:translateY(2px);box-shadow:0 2px 0 #b88600}
.code-lbl{font-size:9px;font-weight:800;letter-spacing:.15em}
.code-val{font-size:15px;letter-spacing:.04em}
.code-field{letter-spacing:.16em;font-weight:700}
.code-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:10px;flex-wrap:wrap}
.code-msg{display:flex;align-items:center;gap:6px;font-size:12.5px;color:rgba(251,247,236,.6);line-height:1.4}
.code-msg svg{flex:none}
.code-status{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600}
.code-status svg{flex:none}
.code-status.checking{color:rgba(251,247,236,.55)}
.code-status.ok{color:#7be08c}
.code-status.taken{color:#ffc78a}
.gen-link{flex:none;white-space:nowrap;padding:6px 0}
/* Ceremony */
.cer{padding-top:8px}
.cer-h{font-size:clamp(34px,9vw,52px);margin:6px 0 0}
.mode-grid{display:grid;gap:12px;margin:24px 0 14px}
.mode-card{background:var(--card);border:1.5px solid var(--line);border-radius:18px;padding:20px 16px;cursor:pointer;color:var(--cream);text-align:center;transition:transform .12s,border-color .15s}
.mode-card:active{transform:scale(.98)}
.mode-card:hover{border-color:rgba(255,210,63,.45)}
.mode-card svg{color:var(--gold)}
.mode-t{font-family:'Anton',sans-serif;text-transform:uppercase;letter-spacing:.02em;font-size:19px;margin:9px 0 4px}
.mode-d{font-size:13px;color:rgba(251,247,236,.62);line-height:1.45}
.sound-toggle{display:none}
.cer-top{display:flex;align-items:center;justify-content:space-between;margin:6px 0 12px}
.cer-prog{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--gold);font-weight:700}
.cer-card{background:linear-gradient(180deg,#0f3220,#0a2417);border:1.5px solid rgba(255,210,63,.25);border-radius:22px;padding:22px 16px;min-height:300px;animation:cardin .35s ease}
@keyframes cardin{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}
.cer-name{font-size:clamp(30px,8vw,46px);color:var(--cream);text-align:center;line-height:1}
.cer-sub{font-size:13px;color:rgba(251,247,236,.6);margin:5px 0 16px;text-align:center}
.cer-teams{display:flex;flex-direction:column;gap:9px;max-height:46vh;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:2px}
.cer-team{display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.05);border:1px solid var(--line);border-left:4px solid rgba(255,210,63,.5);border-radius:13px;padding:11px 13px}
.cer-team.tier1{border-left-color:var(--t1)}.cer-team.tier2{border-left-color:var(--t2)}.cer-team.tier3{border-left-color:var(--t3)}.cer-team.tier4{border-left-color:var(--t4)}
.cer-team.hidden{justify-content:center;border-style:dashed;border-left-width:1px;color:rgba(251,247,236,.3);min-height:46px}
.cer-team.pop{animation:pop .42s cubic-bezier(.2,1.3,.4,1) both}
@keyframes pop{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:scale(1)}}
.ct-flag{font-size:26px;flex:none}
.ct-name{flex:1;text-align:left;font-weight:700;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ct-tier{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#06160e;padding:3px 8px;border-radius:6px;flex:none}
.ct-q{font-family:'Anton',sans-serif;font-size:22px}
.cer-done{text-align:center;padding-top:18px}
.cer-done .ball{font-size:60px}
.cer-done .btn-gold{margin-top:8px}
.code-pill svg{position:absolute;top:5px;right:5px;opacity:.6}
.share-invite{display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin:-2px 0 14px}
.share-btn{padding:9px 14px;font-size:13.5px}
.share-copied{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;font-weight:600;color:#7be08c}
.banner{background:rgba(0,0,0,.22);border:1px solid var(--line);border-radius:17px;padding:13px;margin-bottom:14px}
.brag{display:flex;align-items:center;gap:7px;font-size:13px;background:rgba(255,210,63,.13);border:1px solid rgba(255,210,63,.3);color:#ffe89a;padding:8px 12px;border-radius:11px;margin-bottom:11px}
.brag svg{color:var(--gold);flex:none}
.banner-grid{display:grid;grid-template-columns:1fr 1fr;gap:11px}
.bcell{background:rgba(255,255,255,.05);border-radius:13px;padding:12px}
.bcell-lbl{font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);font-weight:700;margin-bottom:7px}
.bcell-sub{font-size:11px;color:rgba(251,247,236,.55);margin-top:6px}
.match{display:flex;align-items:center;gap:8px;justify-content:center}
.side{display:flex;align-items:center;gap:5px;font-weight:700;font-size:13px}
.side.r{flex-direction:row-reverse}
.flag{font-size:19px}.abbr{font-size:12px;letter-spacing:.03em}
.vs{color:rgba(251,247,236,.4);font-size:12px}
.score{font-size:22px;color:var(--cream);min-width:42px;text-align:center}
.cd{font-size:21px;color:var(--gold);text-align:center;margin-top:8px}
@media(max-width:430px){.banner-grid{grid-template-columns:1fr}}
.tabs{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;background:rgba(0,0,0,.22);padding:5px;border-radius:14px;margin-bottom:14px}
.tab{display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:none;color:rgba(251,247,236,.6);font-family:'Outfit';font-weight:600;font-size:10.5px;padding:8px 2px;border-radius:10px;cursor:pointer;transition:all .15s}
.tab.on{background:linear-gradient(180deg,#ffe066,#f4b400);color:#3a2a00}
.tab:not(.on):active{background:rgba(255,255,255,.06)}
.crystal{display:flex;align-items:center;gap:8px;width:100%;justify-content:center;background:rgba(57,169,219,.12);border:1px solid rgba(57,169,219,.35);color:#9fdcf2;font-family:'Outfit';font-weight:600;font-size:13px;padding:11px;border-radius:12px;margin-bottom:14px;cursor:pointer}
.replay-draw{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;background:rgba(255,210,63,.1);border:1px solid rgba(255,210,63,.35);color:#ffe89a;font-family:'Outfit';font-weight:600;font-size:13px;padding:10px;border-radius:12px;margin-bottom:12px;cursor:pointer}
.replay-draw:active{transform:scale(.99)}
.crystal.on{background:rgba(255,210,63,.16);border-color:rgba(255,210,63,.4);color:#ffe89a}
.section-head{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:12px}
.sh-title{font-size:22px}
.sh-sub{font-size:11.5px;color:rgba(251,247,236,.55);letter-spacing:.04em;text-transform:uppercase;font-weight:600}
.empty-note{display:flex;gap:8px;align-items:center;justify-content:center;text-align:center;background:rgba(255,255,255,.05);border:1px dashed var(--line);border-radius:13px;padding:14px;font-size:13px;color:rgba(251,247,236,.7);margin-bottom:12px}
.board{display:flex;flex-direction:column;gap:8px}
.lb-row{display:flex;align-items:center;gap:12px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:11px 13px}
.lb-row.lead{border-color:rgba(255,210,63,.5);background:linear-gradient(90deg,rgba(255,210,63,.12),var(--card) 60%)}
.lb-rank{font-size:21px;width:26px;text-align:center;color:rgba(251,247,236,.55);flex:none}
.lb-rank.medal{color:var(--ink);border-radius:8px}
.lb-rank.m1{background:var(--gold)}.lb-rank.m2{background:#cdd3da}.lb-rank.m3{background:#e0a06a}
.lb-main{flex:1;min-width:0}
.lb-name{font-weight:700;font-size:15px;display:flex;align-items:center;gap:5px;flex-wrap:wrap}
.badge{font-size:14px}
.lb-bar-wrap{height:5px;background:rgba(255,255,255,.09);border-radius:4px;margin:6px 0 5px;overflow:hidden}
.lb-bar{height:100%;background:linear-gradient(90deg,var(--gold2),var(--gold));border-radius:4px;transition:width .5s}
.lb-sub{font-size:11.5px;color:rgba(251,247,236,.6)}
.lb-pts{font-size:25px;color:var(--gold);text-align:right;flex:none}
.lb-pts span{display:block;font-size:9px;color:rgba(251,247,236,.5);letter-spacing:.1em}
.squads{display:flex;flex-direction:column;gap:10px}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden}
.card.open{border-color:rgba(255,210,63,.4)}
.card-head{display:flex;align-items:center;gap:12px;width:100%;background:none;border:none;color:var(--cream);padding:13px 14px;cursor:pointer;text-align:left}
.card-rank{font-size:19px;color:var(--gold);flex:none;min-width:34px}
.card-name{flex:1;font-weight:700;font-size:15.5px;min-width:0}
.card-badges{display:flex;gap:5px;margin-top:3px;align-items:center;flex-wrap:wrap}
.card-tag{font-size:10px;color:rgba(251,247,236,.5);letter-spacing:.06em;text-transform:uppercase;font-weight:600}
.card-pts{font-size:23px;color:var(--gold);flex:none}.card-pts span{font-size:9px;display:block;color:rgba(251,247,236,.5);letter-spacing:.08em;text-align:right}
.card-teams{max-height:0;overflow:hidden;transition:max-height .35s ease;padding:0 14px}
.card.open .card-teams{padding-bottom:12px}
.team-row{display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid rgba(255,255,255,.07)}
.t-flag{font-size:22px;flex:none}.t-flag.sm{font-size:18px}
.t-name{flex:1;font-weight:600;font-size:14px;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.t-tier{font-size:9.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:#06160e;padding:3px 7px;border-radius:6px;flex:none}
.t-share{font-size:9.5px;font-weight:800;letter-spacing:.02em;color:#9fdcf2;background:rgba(57,169,219,.16);border:1px solid rgba(57,169,219,.32);padding:2px 6px;border-radius:6px;flex:none}
.t-share.inline{padding:1px 5px;vertical-align:middle}
.t-rec{font-size:12px;color:rgba(251,247,236,.6);font-variant-numeric:tabular-nums;flex:none;min-width:44px;text-align:right}
.t-pts{font-size:17px;color:var(--gold);flex:none;min-width:24px;text-align:right}
.md-head{font-family:'Anton',sans-serif;text-transform:uppercase;letter-spacing:.04em;font-size:14px;color:rgba(251,247,236,.85);margin:16px 0 8px}
.fixtures{display:flex;flex-direction:column;gap:9px}
.fx{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 13px}
.fx.done{border-color:rgba(92,196,107,.35);background:linear-gradient(180deg,rgba(92,196,107,.07),var(--card))}
.fx-top{display:flex;justify-content:space-between;font-size:11px;color:rgba(251,247,236,.5);margin-bottom:9px}
.fx-grp{font-weight:700;color:var(--gold);letter-spacing:.04em}
.fx-main{display:flex;align-items:center;gap:8px}
.fx-team{flex:1;display:flex;align-items:center;gap:8px;font-weight:600;font-size:13.5px;min-width:0}
.fx-team span:not(.flag){white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fx-team.r{flex-direction:row-reverse;text-align:right}
.fx-mid{color:rgba(251,247,236,.4);font-size:12px;font-weight:700;flex:none}
.score-entry{display:flex;align-items:center;gap:4px;flex:none;position:relative}
.sc{width:38px;height:42px;text-align:center;background:rgba(255,255,255,.08);border:1.5px solid var(--line);border-radius:10px;color:var(--cream);font-family:'Anton';font-size:20px;outline:none}
.sc:focus{border-color:var(--gold)}
.dash{color:rgba(251,247,236,.4);font-weight:700}
.clr{position:absolute;right:-21px;background:rgba(255,122,89,.2);border:none;color:#ff9b7d;width:18px;height:18px;border-radius:50%;display:grid;place-items:center;cursor:pointer}
.pred-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:11px;padding-top:11px;border-top:1px solid rgba(255,255,255,.07)}
.pred-lbl{font-size:11px;color:rgba(251,247,236,.5);font-weight:600}
.pick-line{display:flex;align-items:center;gap:10px;margin-top:9px;padding-top:9px;border-top:1px solid rgba(255,255,255,.06)}
.pick-line .pred-row{margin:0;padding:0;border:0;flex:1;flex-wrap:nowrap}
.pick-line .pred-btn{flex:1;text-align:center;padding-left:4px;padding-right:4px}
.pick-who{font-size:12.5px;font-weight:700;color:rgba(251,247,236,.78);min-width:54px;max-width:96px;flex:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pred-progress{display:flex;flex-wrap:wrap;gap:7px;margin:0 0 11px}
.prog-item{font-size:11.5px;color:rgba(251,247,236,.62);background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:8px;padding:4px 9px}
.prog-item b{color:var(--cream);font-weight:700}
.call-mine{font-size:8px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#06160e;background:var(--gold);padding:1px 5px;border-radius:4px;margin-left:6px;vertical-align:middle}
.chances{display:flex;align-items:center;justify-content:center;gap:9px;flex-wrap:wrap;margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.06);font-size:12px;color:rgba(251,247,236,.62);font-variant-numeric:tabular-nums}
.chc{display:inline-flex;align-items:center;gap:5px}
.chc .flag{font-size:15px}
.chc b{color:var(--cream);font-weight:700}
.chc-sep{color:rgba(251,247,236,.3)}
.chance-note{font-size:11px;color:rgba(251,247,236,.45);margin:-2px 0 9px;line-height:1.4}
.pred-btn{background:rgba(255,255,255,.06);border:1px solid var(--line);color:rgba(251,247,236,.8);font-family:'Outfit';font-weight:600;font-size:13px;padding:6px 12px;border-radius:9px;cursor:pointer}
.pred-btn.on{background:rgba(57,169,219,.22);border-color:rgba(57,169,219,.55);color:#bfe8fa}
.locked-row{color:rgba(251,247,236,.55)}
.locked-row svg{flex:none}
.pick-locked{font-size:12px;font-weight:600}
.pick-locked.hit{color:#7be08c}.pick-locked.miss{color:#ff9b7d}
.me-pick{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:13px;padding:11px 13px;margin-bottom:6px;flex-wrap:wrap}
.me-lbl{font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:rgba(251,247,236,.55);flex:none}
.me-chips{display:flex;gap:6px;flex-wrap:wrap}
.me-chip{background:rgba(255,255,255,.07);border:1px solid var(--line);color:rgba(251,247,236,.8);font-family:'Outfit';font-weight:600;font-size:13px;padding:6px 12px;border-radius:20px;cursor:pointer}
.me-chip.on{background:linear-gradient(180deg,#ffe066,#f4b400);color:#3a2a00;border-color:transparent}
.pl-row{display:flex;align-items:center;gap:12px;background:var(--card);border:1px solid var(--line);border-radius:13px;padding:10px 13px;margin-bottom:7px}
.pl-row.lead{border-color:rgba(255,210,63,.5);background:linear-gradient(90deg,rgba(255,210,63,.12),var(--card) 60%)}
.pl-rank{font-size:18px;width:22px;text-align:center;color:rgba(251,247,236,.55);flex:none}
.pl-name{flex:1;font-weight:700;font-size:15px;display:flex;align-items:center;gap:7px;min-width:0}
.pl-you{font-size:9px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#06160e;background:var(--gold);padding:2px 6px;border-radius:5px}
.pl-stat{font-size:11.5px;color:rgba(251,247,236,.6);flex:none}
.pl-pts{font-size:21px;color:var(--gold);flex:none;text-align:right}
.pl-pts span{display:block;font-size:8.5px;color:rgba(251,247,236,.5);letter-spacing:.1em}
.calls{display:flex;flex-direction:column;gap:1px;margin-top:11px;padding-top:10px;border-top:1px solid rgba(255,255,255,.07)}
.call{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:5px 0;font-size:13px}
.call-name{color:rgba(251,247,236,.7);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.call-pick{color:rgba(251,247,236,.5);font-weight:600;flex:none}
.call.hit .call-pick{color:#7be08c}.call.miss .call-pick{color:#ff9b7d}
.call.hit .call-name{color:var(--cream)}
.grp-sel{display:flex;gap:6px;overflow-x:auto;padding-bottom:6px;margin-bottom:6px;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
.grp-chip{flex:none;width:38px;height:38px;border-radius:11px;background:rgba(255,255,255,.06);border:1px solid var(--line);color:rgba(251,247,236,.7);font-family:'Anton';font-size:16px;cursor:pointer}
.grp-chip.on{background:linear-gradient(180deg,#ffe066,#f4b400);color:#3a2a00;border-color:transparent}
.grp-chip.ko{width:auto;padding:0 13px;font-family:'Outfit';font-size:12px;font-weight:700;letter-spacing:.02em}
.ko-tbd{font-weight:600;font-size:12.5px;color:rgba(251,247,236,.55)}
.std-card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px 13px;margin-top:4px}
.std-title{font-family:'Anton',sans-serif;text-transform:uppercase;font-size:17px;color:var(--gold);margin-bottom:8px}
.std-row{display:grid;grid-template-columns:20px 1fr 18px 18px 18px 18px 30px 30px;align-items:center;gap:4px;padding:7px 0;font-size:12.5px;font-variant-numeric:tabular-nums;border-top:1px solid rgba(255,255,255,.06)}
.std-row.std-h{color:rgba(251,247,236,.45);font-size:10.5px;text-transform:uppercase;letter-spacing:.03em;border-top:none;font-weight:700}
.std-row span{text-align:center}
.std-pos{color:rgba(251,247,236,.5);text-align:center}
.std-team{display:flex;align-items:center;gap:7px;text-align:left!important}
.std-name{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600}
.std-pts{font-weight:800;color:var(--gold)}
.std-row.qual .std-pos{color:#7be08c;font-weight:800}
.std-row.qual{background:linear-gradient(90deg,rgba(92,196,107,.08),transparent)}
.std-foot{font-size:10.5px;color:rgba(251,247,236,.45);margin-top:9px;padding-top:8px;border-top:1px solid rgba(255,255,255,.06)}
.pot-set{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:15px;margin-bottom:6px}
.pot-amount{display:flex;gap:8px;margin-top:8px}
.cur-sel{background:rgba(255,255,255,.08);border:1.5px solid var(--line);color:var(--cream);font-family:'Outfit';font-weight:700;font-size:15px;border-radius:12px;padding:0 10px;outline:none;flex:none}
.pot-input{font-size:24px;text-align:right}
.quick{display:flex;gap:7px;margin-top:11px;flex-wrap:wrap}
.qbtn{background:rgba(255,210,63,.14);border:1px solid rgba(255,210,63,.3);color:#ffe89a;font-family:'Outfit';font-weight:700;font-size:13px;padding:7px 13px;border-radius:10px;cursor:pointer}
.qbtn.ghost{background:rgba(255,255,255,.06);border-color:var(--line);color:rgba(251,247,236,.6)}
.struct-list{display:flex;flex-direction:column;gap:8px}
.struct{text-align:left;background:var(--card);border:1.5px solid var(--line);border-radius:13px;padding:12px 14px;cursor:pointer;color:var(--cream)}
.struct.on{border-color:var(--gold);background:linear-gradient(180deg,rgba(255,210,63,.1),var(--card))}
.struct-t{display:flex;align-items:center;justify-content:space-between;font-weight:700;font-size:14.5px}
.struct-t svg{color:var(--gold)}
.struct-d{font-size:12px;color:rgba(251,247,236,.6);margin-top:3px;line-height:1.4}
.payout-box{background:rgba(0,0,0,.22);border:1px solid var(--line);border-radius:15px;padding:14px;margin-top:16px}
.payout-head{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--gold);font-weight:700;margin-bottom:11px}
.reserve{font-size:12.5px;background:rgba(255,210,63,.12);border:1px solid rgba(255,210,63,.3);color:#ffe89a;padding:9px 11px;border-radius:10px;margin-bottom:10px;line-height:1.4}
.payout-row{display:flex;align-items:center;gap:12px;padding:9px 0;border-top:1px solid rgba(255,255,255,.07)}
.payout-row:first-of-type{border-top:none}
.po-rank{font-size:17px;color:var(--gold);min-width:22px}
.po-name{flex:1;font-weight:600;font-size:14.5px}
.po-amt{font-size:18px;color:#7be08c}
.pad{padding:8px 0}
.disclaimer{display:flex;gap:7px;align-items:flex-start;font-size:11.5px;color:rgba(251,247,236,.5);margin-top:16px;line-height:1.45}
.disclaimer svg{flex:none;margin-top:1px}
.confetti{position:fixed;inset:0;pointer-events:none;z-index:99;overflow:hidden}
.confetti span{position:absolute;top:-20px;border-radius:2px;animation-name:fall;animation-timing-function:ease-in;animation-fill-mode:forwards}
@keyframes fall{to{transform:translateY(110vh) rotate(540deg);opacity:0}}
/* creator setup: count pop-up + hand-pick screen */
.modal-overlay{position:fixed;inset:0;z-index:60;background:rgba(4,20,12,.74);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:20px}
.modal-card{background:var(--card);border:1.5px solid rgba(255,210,63,.28);border-radius:20px;padding:22px 18px;max-width:440px;width:100%;max-height:88vh;overflow:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
.modal-h{font-family:'Anton',sans-serif;text-transform:uppercase;letter-spacing:.03em;font-size:21px;color:var(--cream)}
.modal-split{font-weight:700;color:var(--gold);font-size:15.5px;margin:12px 0;line-height:1.4}
.modal-actions{display:flex;flex-direction:column;gap:10px;margin-top:18px}
.choose-list{margin:14px 0 4px;max-height:46vh;overflow:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
.choose-name{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;padding:11px 13px;border:1.5px solid var(--line);border-radius:12px;margin-bottom:8px;cursor:pointer;color:var(--cream);font-family:'Outfit';font-weight:600;font-size:14.5px;background:rgba(255,255,255,.04);text-align:left}
.choose-name.on{border-color:var(--gold);background:rgba(255,210,63,.12)}
.choose-name svg{color:var(--gold);flex:none}
.setup-people{display:flex;flex-wrap:wrap;gap:6px;margin:14px 0 6px}
.setup-person{font-size:12px;font-weight:600;color:rgba(251,247,236,.66);background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:8px;padding:4px 9px}
.setup-person.full{color:#7be08c;border-color:rgba(123,224,140,.4)}
.assign-row{display:flex;align-items:center;gap:9px;flex-wrap:wrap;padding:9px 0;border-top:1px solid rgba(255,255,255,.07)}
.assign-row .t-name{flex:1;min-width:90px}
.assign-sel{flex:1;min-width:130px;max-width:180px;background:rgba(255,255,255,.07);border:1.5px solid var(--line);border-radius:10px;color:var(--cream);font-family:'Outfit';font-weight:600;font-size:13px;padding:9px 10px;outline:none;cursor:pointer}
/* draw loading sequence */
.draw-load{min-height:72vh;display:flex;align-items:center;justify-content:center;text-align:center}
.dl-inner{max-width:440px;width:100%;padding:0 24px}
.dl-logo{display:block;width:fit-content;margin:0 auto}
.dl-logo img{display:block;width:240px;max-width:70vw;height:auto;animation:dlpulse 1.9s ease-in-out infinite}
.dl-bar{position:relative;height:2px;width:240px;max-width:74%;margin:26px auto 0;background:rgba(255,255,255,.1);border-radius:2px;overflow:hidden}
.dl-bar span{position:absolute;top:0;left:0;height:100%;width:0;background:linear-gradient(90deg,var(--gold2),var(--gold));border-radius:2px;animation:dlfill 8.5s linear forwards}
.dl-cap{margin-top:22px;font-size:14px;font-weight:500;color:rgba(251,247,236,.7);line-height:1.5;min-height:21px;transition:opacity .3s}
.dl-by{margin-top:9px;font-size:12.5px;font-weight:600;color:rgba(251,247,236,.5)}
@keyframes dlpulse{0%,100%{opacity:.78;transform:scale(1)}50%{opacity:1;transform:scale(1.04)}}
@keyframes dlfill{from{width:0}to{width:100%}}
@keyframes dlfade{from{opacity:0}to{opacity:1}}
@media (prefers-reduced-motion: reduce){
  .dl-logo img{animation:dlfade .6s ease forwards}
  .dl-bar span{animation:none;width:100%;opacity:.45}
}
`;
