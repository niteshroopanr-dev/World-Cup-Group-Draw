import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Trophy, Users, UserPlus, Plus, X, Copy, Check, ArrowLeft, Sparkles,
  Crown, Coins, Wand2, Flag, Shuffle, Info, RotateCcw, Lock, ChevronDown
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  DATA  —  2026 FIFA World Cup (48 teams, 12 groups)                 */
/*  Rankings below are an approximate FIFA-ranking ordering used only  */
/*  to tier the draw. The live website version pulls official figures. */
/* ------------------------------------------------------------------ */
const TEAMS = {
  ESP:{n:"Spain",f:"🇪🇸",g:"H",r:1},  ARG:{n:"Argentina",f:"🇦🇷",g:"J",r:2},
  FRA:{n:"France",f:"🇫🇷",g:"I",r:3}, ENG:{n:"England",f:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",g:"L",r:4},
  BRA:{n:"Brazil",f:"🇧🇷",g:"C",r:5}, POR:{n:"Portugal",f:"🇵🇹",g:"K",r:6},
  NED:{n:"Netherlands",f:"🇳🇱",g:"F",r:7}, BEL:{n:"Belgium",f:"🇧🇪",g:"G",r:8},
  GER:{n:"Germany",f:"🇩🇪",g:"E",r:9}, CRO:{n:"Croatia",f:"🇭🇷",g:"L",r:10},
  MAR:{n:"Morocco",f:"🇲🇦",g:"C",r:11}, COL:{n:"Colombia",f:"🇨🇴",g:"K",r:12},
  MEX:{n:"Mexico",f:"🇲🇽",g:"A",r:13}, URU:{n:"Uruguay",f:"🇺🇾",g:"H",r:14},
  USA:{n:"USA",f:"🇺🇸",g:"D",r:15}, SUI:{n:"Switzerland",f:"🇨🇭",g:"B",r:16},
  JPN:{n:"Japan",f:"🇯🇵",g:"F",r:17}, SEN:{n:"Senegal",f:"🇸🇳",g:"I",r:18},
  IRN:{n:"Iran",f:"🇮🇷",g:"G",r:19}, KOR:{n:"South Korea",f:"🇰🇷",g:"A",r:20},
  ECU:{n:"Ecuador",f:"🇪🇨",g:"E",r:21}, AUT:{n:"Austria",f:"🇦🇹",g:"J",r:22},
  AUS:{n:"Australia",f:"🇦🇺",g:"D",r:23}, TUR:{n:"Türkiye",f:"🇹🇷",g:"D",r:24},
  NOR:{n:"Norway",f:"🇳🇴",g:"I",r:25}, SWE:{n:"Sweden",f:"🇸🇪",g:"F",r:26},
  EGY:{n:"Egypt",f:"🇪🇬",g:"G",r:27}, CAN:{n:"Canada",f:"🇨🇦",g:"B",r:28},
  CIV:{n:"Côte d'Ivoire",f:"🇨🇮",g:"E",r:29}, TUN:{n:"Tunisia",f:"🇹🇳",g:"F",r:30},
  ALG:{n:"Algeria",f:"🇩🇿",g:"J",r:31}, QAT:{n:"Qatar",f:"🇶🇦",g:"B",r:32},
  PAR:{n:"Paraguay",f:"🇵🇾",g:"D",r:33}, CZE:{n:"Czechia",f:"🇨🇿",g:"A",r:34},
  SCO:{n:"Scotland",f:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",g:"C",r:35}, PAN:{n:"Panama",f:"🇵🇦",g:"L",r:36},
  KSA:{n:"Saudi Arabia",f:"🇸🇦",g:"H",r:37}, IRQ:{n:"Iraq",f:"🇮🇶",g:"I",r:38},
  UZB:{n:"Uzbekistan",f:"🇺🇿",g:"K",r:39}, RSA:{n:"South Africa",f:"🇿🇦",g:"A",r:40},
  JOR:{n:"Jordan",f:"🇯🇴",g:"J",r:41}, COD:{n:"DR Congo",f:"🇨🇩",g:"K",r:42},
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
const genCode = () => Array.from({length:6}, () => CODE_CHARS[Math.floor(Math.random()*CODE_CHARS.length)]).join("");
const shuffle = (arr) => { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };

// Allocation: every one of the 48 teams is always shared out across the group.
//  • 12 players  → exactly 4 each, one per tier, no duplicates.
//  • <12 players → all 48 dealt evenly, so players hold more than 4. No duplicates.
//  • >12 players → 4 each (one per tier); all 48 covered once, the rest are duplicates.
const buildAllocations = (members) => {
  const N = members.length;
  const tiers = [[],[],[],[]];
  Object.keys(TEAMS).forEach(id => tiers[tierOf(id)-1].push(id));
  const alloc = {}; members.forEach(m => alloc[m.id]=[]);
  if (N === 0) return alloc;
  if (N <= 12) {
    // Continuous pointer across the four shuffled tiers → all 48 dealt, even hands, tier-spread.
    let ptr = 0;
    tiers.forEach(t => shuffle(t).forEach(team => { alloc[members[ptr % N].id].push(team); ptr++; }));
  } else {
    // One team per tier per player; cover all 12 in a tier, then duplicate evenly.
    tiers.forEach(t => {
      let deck = []; while (deck.length < N) deck = deck.concat(shuffle(t));
      deck = deck.slice(0, N);
      shuffle(members.map((_,i)=>i)).forEach((mi, idx) => alloc[members[mi].id].push(deck[idx]));
    });
  }
  return alloc;
};

const CURRENCIES = ["AUD","USD","GBP","EUR","NZD","ZAR","INR","JPY"];
const money = (n, cur) => { try { return new Intl.NumberFormat(undefined,{style:"currency",currency:cur,maximumFractionDigits:2,minimumFractionDigits:0}).format(n||0); } catch { return `${cur} ${Math.round(n||0)}`; } };
const predResult = (p) => p==="home" ? {h:1,a:0} : p==="away" ? {h:0,a:1} : {h:0,a:0};
const outcome = (res) => res.h>res.a ? "home" : res.h<res.a ? "away" : "draw";

// One team's family score (with bonuses) from a results map.
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
const store = {
  ok: typeof window!=="undefined" && window.storage,
  async getGroup(code){ if(!this.ok) return null; try{ const r=await window.storage.get("wcfd:group:"+code,true); return r?JSON.parse(r.value):null; }catch{ return null; } },
  async setGroup(code,g){ if(!this.ok) return; try{ await window.storage.set("wcfd:group:"+code,JSON.stringify(g),true);}catch(e){} },
  async setLast(code){ if(!this.ok) return; try{ await window.storage.set("wcfd:last",code,false);}catch(e){} },
  async getLast(){ if(!this.ok) return null; try{ const r=await window.storage.get("wcfd:last",false); return r?r.value:null;}catch{return null;} },
  async getPreds(code){ if(!this.ok) return {}; try{ const r=await window.storage.get("wcfd:pred:"+code,false); return r?JSON.parse(r.value):{};}catch{return {};} },
  async setPreds(code,p){ if(!this.ok) return; try{ await window.storage.set("wcfd:pred:"+code,JSON.stringify(p),false);}catch(e){} },
};

/* ================================================================== */
export default function WorldCupFamilyDraw(){
  const [view, setView] = useState("home");
  const [group, setGroup] = useState(null);
  const [preds, setPreds] = useState({});
  const [lastCode, setLastCode] = useState(null);
  const [boom, setBoom] = useState(0);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel="stylesheet"; link.href="https://fonts.googleapis.com/css2?family=Anton&family=Outfit:wght@300;400;500;600;700;800&display=swap";
    document.head.appendChild(link);
    store.getLast().then(c => { if(c) setLastCode(c); });
  }, []);

  const fire = () => setBoom(Date.now());
  const openGroup = async (g) => { setGroup(g); setView("group"); store.setLast(g.code); setLastCode(g.code); setPreds(await store.getPreds(g.code)); };
  const saveGroup = async (g) => { setGroup(g); await store.setGroup(g.code, g); };
  const savePreds = async (p) => { setPreds(p); if(group) await store.setPreds(group.code, p); };

  return (
    <div className="wc-root">
      <StyleBlock/>
      {boom ? <Confetti key={boom} done={()=>setBoom(0)}/> : null}
      {view==="home" && <Home lastCode={lastCode} onCreate={()=>setView("create")} onJoin={()=>setView("join")}
        onResume={async()=>{ const g=await store.getGroup(lastCode); if(g) openGroup(g); else setLastCode(null); }}/>}
      {view==="create" && <Create back={()=>setView("home")} fire={fire}
        onDone={async(g)=>{ await store.setGroup(g.code,g); openGroup(g); }}/>}
      {view==="join" && <Join back={()=>setView("home")} onFound={openGroup}/>}
      {view==="group" && group && <GroupView group={group} preds={preds} setPreds={savePreds}
        saveGroup={saveGroup} exit={()=>{setGroup(null);setView("home");}}/>}
      <footer className="foot">A just-for-fun family game · not affiliated with FIFA · no real money is handled here</footer>
    </div>
  );
}

/* ------------------------------- HOME ----------------------------- */
function Home({ onCreate, onJoin, onResume, lastCode }){
  return (
    <div className="wrap home">
      <div className="ball">⚽</div>
      <p className="kicker">Summer 2026 · 48 nations · one family rivalry</p>
      <h1 className="display title">The Family<br/><span className="gold">World Cup Draw</span></h1>
      <p className="lede">Toss everyone's name in, share out all 48 teams, then watch the family leaderboard fight it out all the way to the final. Built for families scattered across the world.</p>
      <div className="cta-col">
        <button className="btn btn-gold big" onClick={onCreate}><Sparkles size={20}/> Start a new draw</button>
        <button className="btn btn-ghost big" onClick={onJoin}><Users size={20}/> Join with a group code</button>
        {lastCode && <button className="btn btn-link" onClick={onResume}><RotateCcw size={15}/> Resume my last group ({lastCode})</button>}
      </div>
      <div className="how">
        <Step n="1" t="Add the crew" d="Type in up to 100 names — the whole family, wherever they are."/>
        <Step n="2" t="Share out all 48" d="Every team goes to someone. Twelve players means four each; fewer means more each; more means teams get shared."/>
        <Step n="3" t="Climb the table" d="One code lets anyone follow the family standings, predict games and track the pot."/>
      </div>
    </div>
  );
}
const Step = ({n,t,d}) => (<div className="step"><span className="step-n display">{n}</span><div><div className="step-t">{t}</div><div className="step-d">{d}</div></div></div>);

/* ------------------------------ CREATE ---------------------------- */
function Create({ back, onDone, fire }){
  const [name, setName] = useState("");
  const [one, setOne] = useState("");
  const [bulk, setBulk] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [people, setPeople] = useState([]);
  const inputRef = useRef(null);

  const addName = (raw) => { const t=raw.trim(); if(!t) return;
    setPeople(p => { if(p.length>=100) return p; let nm=t,k=2; while(p.some(x=>x.name.toLowerCase()===nm.toLowerCase())) nm=`${t} (${k++})`;
      return [...p,{id:Math.random().toString(36).slice(2,9),name:nm}]; }); };
  const addOne = () => { addName(one); setOne(""); inputRef.current?.focus(); };
  const addBulk = () => { bulk.split(/[\n,]/).forEach(addName); setBulk(""); setShowBulk(false); };
  const remove = (id) => setPeople(p=>p.filter(x=>x.id!==id));
  const perPerson = people.length ? Math.ceil(48/people.length) : 0;

  const generate = () => {
    const g = { code:genCode(), name:name.trim()||"Our World Cup Draw", created:Date.now(),
      members:people, alloc:buildAllocations(people), results:{}, pool:{amount:0,cur:"AUD",structure:"top15"} };
    fire(); onDone(g);
  };

  return (
    <div className="wrap">
      <TopBar back={back} title="New draw"/>
      <label className="field-lbl">Name your group</label>
      <input className="input" placeholder="e.g. The Sharma Family Cup" value={name} onChange={e=>setName(e.target.value)} maxLength={48}/>
      <div className="row-between mt">
        <label className="field-lbl no-mb">Add players <span className="muted">({people.length}/100)</span></label>
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
      {people.length>0 && <p className="hint"><Info size={13}/> {
        people.length<12 ? `All 48 teams get shared out, so each player holds about ${perPerson} teams — no duplicates.`
        : people.length===12 ? "The sweet spot: all 48 teams, exactly four each, no duplicates."
        : "Everyone gets four teams and all 48 are covered, so the popular sides will be shared by a few people."}</p>}
      <div className="sticky-cta">
        <button className="btn btn-gold big full" disabled={people.length<1} onClick={generate}><Shuffle size={20}/> Run the draw {people.length>0 && `· ${people.length}`}</button>
      </div>
    </div>
  );
}

/* ------------------------------- JOIN ----------------------------- */
function Join({ back, onFound }){
  const [code,setCode]=useState(""); const [err,setErr]=useState(""); const [busy,setBusy]=useState(false);
  const go = async () => { const c=code.trim().toUpperCase(); if(c.length<4){setErr("Enter your 6-character code");return;}
    setBusy(true); setErr(""); const g=await store.getGroup(c); setBusy(false);
    if(g) onFound(g); else setErr("No group found for that code. Double-check the letters?"); };
  return (
    <div className="wrap">
      <TopBar back={back} title="Join a group"/>
      <div className="join-card">
        <div className="ball sm">⚽</div>
        <p className="lede center">Pop in the code a family member shared with you.</p>
        <input className="input code-input display" placeholder="ABC123" value={code} maxLength={6}
          onChange={e=>setCode(e.target.value.toUpperCase())} onKeyDown={e=>{ if(e.key==="Enter") go(); }}/>
        {err && <p className="err">{err}</p>}
        <button className="btn btn-gold big full mt-s" onClick={go} disabled={busy}>{busy?"Looking…":"Find my group"}</button>
      </div>
    </div>
  );
}

/* ---------------------------- GROUP VIEW -------------------------- */
function GroupView({ group, preds, setPreds, saveGroup, exit }){
  const [tab, setTab] = useState("ranks");
  const [project, setProject] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [openCard, setOpenCard] = useState(null);
  useEffect(()=>{ const t=setInterval(()=>setNow(Date.now()),1000); return ()=>clearInterval(t); },[]);

  const effResults = useMemo(()=>{
    const r = {...group.results};
    if(project){ for(const fx of FIXTURES){ if(!r[fx.id] && preds[fx.id]) r[fx.id]=predResult(preds[fx.id]); } }
    return r;
  }, [group.results, preds, project]);

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
    const unplayed = FIXTURES.filter(fx=>!group.results[fx.id]).sort((a,b)=>a.ko-b.ko);
    const played = FIXTURES.filter(fx=>group.results[fx.id]).sort((a,b)=>b.ko-a.ko);
    return { nextFx: unplayed[0]||null, lastFx: played[0]||null };
  }, [group.results, now]);

  const setResult = (fxId,h,a) => { const results={...group.results}; if(h===null) delete results[fxId]; else results[fxId]={h,a}; saveGroup({...group, results}); };

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
        <div className="grp-id"><div className="grp-name display">{group.name}</div><div className="grp-meta">{group.members.length} players</div></div>
        <CodePill code={group.code}/>
      </div>
      <Banner nextFx={nextFx} lastFx={lastFx} now={now} leader={anyPlayed?standings[0]:null} results={group.results}/>
      <div className="tabs">
        {tabs.map(t=>(<button key={t.k} className={"tab"+(tab===t.k?" on":"")} onClick={()=>setTab(t.k)}>{t.icon}<span>{t.label}</span></button>))}
      </div>

      {tab==="ranks" &&
        <button className={"crystal"+(project?" on":"")} onClick={()=>setProject(p=>!p)}>
          <Wand2 size={16}/> {project ? "Showing the predicted family table — tap for live only" : "Crystal Ball: project everyone's picks onto the table"}
        </button>}

      {tab==="ranks" && <RanksTab standings={standings} titles={titles} anyPlayed={anyPlayed} pool={group.pool} project={project}/>}
      {tab==="squads" && <SquadsTab standings={standings} titles={titles} anyPlayed={anyPlayed} teamHolders={teamHolders} openCard={openCard} setOpenCard={setOpenCard}/>}
      {tab==="predict" && <PredictTab group={group} preds={preds} setPreds={setPreds} now={now}/>}
      {tab==="cup" && <CupTab group={group} setResult={setResult} nextFx={nextFx}/>}
      {tab==="pot" && <PotTab group={group} standings={standings} saveGroup={saveGroup} project={project}/>}
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
function Banner({ nextFx, lastFx, now, leader, results }){
  const cd = nextFx ? countdown(nextFx.ko - now) : null;
  return (
    <div className="banner">
      {leader && <div className="brag"><Crown size={15}/> <b>{leader.name}</b> leads the family · {leader.pts} pts</div>}
      <div className="banner-grid">
        {nextFx ? (
          <div className="bcell next">
            <div className="bcell-lbl">Next kick-off {cd && cd.done ? "· live now-ish" : ""}</div>
            <div className="match"><Side id={nextFx.home}/><span className="vs">v</span><Side id={nextFx.away} right/></div>
            {cd && !cd.done && <div className="cd display">{cd.d}d {cd.h}h {cd.m}m {cd.s}s</div>}
            <div className="bcell-sub">Group {nextFx.grp} · {fmtDate(nextFx.ko)}</div>
          </div>
        ) : <div className="bcell next"><div className="bcell-lbl">All group games are in 🎉</div></div>}
        {lastFx ? (
          <div className="bcell last">
            <div className="bcell-lbl">Just played</div>
            <div className="match"><Side id={lastFx.home}/><span className="score display">{results[lastFx.id]?`${results[lastFx.id].h}–${results[lastFx.id].a}`:""}</span><Side id={lastFx.away} right/></div>
            <div className="bcell-sub">Group {lastFx.grp} · {fmtDate(lastFx.ko)}</div>
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
      <div className="section-head"><span className="display sh-title">Family standings</span>
        <span className="sh-sub">{standings.length} players · {project?"projected":(anyPlayed?"live":"not started")}</span></div>
      {!anyPlayed && <p className="empty-note"><Sparkles size={15}/> The draw is set. Once games kick off (or you fill in the Predict tab), the family leaderboard comes alive.</p>}
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
      <p className="hint center"><Info size={13}/> Scores reward wins, goal margins, clean sheets and giant-killing upsets across all of a player's teams.</p>
    </div>
  );
}

/* ------------------------------ SQUADS ---------------------------- */
function SquadsTab({ standings, titles, anyPlayed, teamHolders, openCard, setOpenCard }){
  const alpha = [...standings].sort((a,b)=>a.name.localeCompare(b.name));
  const hasDupes = Object.values(teamHolders||{}).some(c=>c>1);
  return (<div className="squads">
    {hasDupes && <p className="hint"><Info size={13}/> With more than 12 players, every team is still allocated and the popular sides are shared. A <span className="t-share inline">×N</span> tag shows how many players hold that team.</p>}
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
            <span className="t-tier" style={{background:TIER_VAR[tierOf(t.id)]}}>{TIER_NAMES[tierOf(t.id)]}</span>
            {teamHolders&&teamHolders[t.id]>1 && <span className="t-share" title={`Held by ${teamHolders[t.id]} players`}>×{teamHolders[t.id]}</span>}
            <span className="t-rec">{t.pld>0?`${t.w}-${t.d}-${t.l}`:"—"}</span>
            <span className="t-pts display">{t.pts}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------- PREDICT ----------------------------- */
function PredictTab({ group, preds, setPreds, now }){
  const setPick = (fx,p) => { if(now>=fx.ko || group.results[fx.id]) return; setPreds({...preds, [fx.id]: preds[fx.id]===p?undefined:p}); };
  const upcoming = FIXTURES.filter(fx=> now < fx.ko && !group.results[fx.id]);
  const picked = upcoming.filter(fx=>preds[fx.id]).length;
  const byRound = [0,1,2].map(r=>({r, list:FIXTURES.filter(fx=>fx.round===r)}));
  return (
    <div>
      <div className="section-head"><span className="display sh-title">Your predictions</span>
        <span className="sh-sub">{picked}/{upcoming.length} upcoming picked</span></div>
      <p className="hint"><Info size={13}/> Pick a result for any game that hasn't kicked off. Picks lock the moment the whistle blows. Turn on the Crystal Ball in the Ranks tab to see how your picks reshape the family table.</p>
      {byRound.map(({r,list})=>(
        <div key={r}>
          <div className="md-head">Matchday {r+1}</div>
          <div className="fixtures">
            {list.map(fx=>{
              const res = group.results[fx.id];
              const locked = now>=fx.ko || res;
              const pick = preds[fx.id];
              const correct = res && pick ? (outcome(res)===pick) : null;
              return (
                <div className={"fx"+(res?" done":"")} key={fx.id}>
                  <div className="fx-top"><span className="fx-grp">Grp {fx.grp}</span>
                    <span className="fx-date">{res? `Full time ${res.h}–${res.a}` : (now>=fx.ko? "Kicked off" : fmtDate(fx.ko))}</span></div>
                  <div className="fx-main">
                    <div className="fx-team"><span className="flag">{TEAMS[fx.home].f}</span><span>{TEAMS[fx.home].n}</span></div>
                    <span className="fx-mid">v</span>
                    <div className="fx-team r"><span>{TEAMS[fx.away].n}</span><span className="flag">{TEAMS[fx.away].f}</span></div>
                  </div>
                  {!locked ? (
                    <div className="pred-row">
                      <span className="pred-lbl">Pick:</span>
                      {[["home",TEAMS[fx.home].f],["draw","Draw"],["away",TEAMS[fx.away].f]].map(([p,lbl])=>(
                        <button key={p} className={"pred-btn"+(pick===p?" on":"")} onClick={()=>setPick(fx,p)}>{lbl}</button>
                      ))}
                    </div>
                  ) : (
                    <div className="pred-row locked-row">
                      <Lock size={12}/>
                      {pick ? (
                        <span className={"pick-locked"+(correct===true?" hit":correct===false?" miss":"")}>
                          You picked {pick==="draw"?"Draw":pick==="home"?TEAMS[fx.home].n:TEAMS[fx.away].n}
                          {correct===true?" ✓":correct===false?" ✗":""}
                        </span>
                      ) : <span className="pick-locked muted">No pick {res?"made":"before kick-off"}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------- CUP ------------------------------ */
function CupTab({ group, setResult, nextFx }){
  const [sel, setSel] = useState(()=> nextFx ? nextFx.grp : "A");
  const table = groupStandings(sel, group.results);
  const fixtures = FIXTURES.filter(fx=>fx.grp===sel).sort((a,b)=>a.ko-b.ko);
  return (
    <div>
      <div className="section-head"><span className="display sh-title">The tournament</span><span className="sh-sub">real groups & results</span></div>
      <div className="grp-sel">{LETTERS.map(L=>(<button key={L} className={"grp-chip"+(sel===L?" on":"")} onClick={()=>setSel(L)}>{L}</button>))}</div>

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
          const res = group.results[fx.id];
          return (
            <div className={"fx"+(res?" done":"")} key={fx.id}>
              <div className="fx-top"><span className="fx-grp">MD{fx.round+1}</span><span className="fx-date">{fmtDate(fx.ko)}</span></div>
              <div className="fx-main">
                <div className="fx-team"><span className="flag">{TEAMS[fx.home].f}</span><span>{TEAMS[fx.home].n}</span></div>
                <ScoreEntry fx={fx} res={res} onSet={setResult}/>
                <div className="fx-team r"><span>{TEAMS[fx.away].n}</span><span className="flag">{TEAMS[fx.away].f}</span></div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="hint"><Info size={13}/> Anyone in the group can enter a final score here. Results flow straight into both the real group table above and the family standings.</p>
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
function PotTab({ group, standings, saveGroup, project }){
  const { pool } = group; const set=(patch)=>saveGroup({...group, pool:{...pool, ...patch}});
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
        <div className="payout-box">
          <div className="payout-head">If it ended {project?"on the predicted table":"right now"}…</div>
          {reserve>0 && <div className="reserve">🏆 {money(reserve,pool.cur)} held for the Champion's backer — decided at the Final</div>}
          {winners.length>0 ? winners.map(s=>(
            <div className="payout-row" key={s.id}><span className="po-rank display">{s.rank}</span><span className="po-name">{s.name}</span><span className="po-amt display">{money(payouts[s.id],pool.cur)}</span></div>
          )) : <div className="muted center pad">Log or predict some results to see who's in the money.</div>}
        </div>
      ) : <p className="hint center"><Coins size={14}/> Set a pot above and pick a split. The numbers update live as results come in.</p>}
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
.wc-root{font-family:'Outfit',system-ui,sans-serif;color:var(--cream);min-height:100vh;position:relative;overflow-x:hidden;background:radial-gradient(125% 80% at 50% -12%,#15a05a 0%,#0a5c34 42%,#04140c 100%);}
.wc-root:before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.05;z-index:0;background-image:repeating-linear-gradient(0deg,#fff 0 1px,transparent 1px 70px),repeating-linear-gradient(90deg,#fff 0 1px,transparent 1px 70px);}
.display{font-family:'Anton',sans-serif;letter-spacing:.015em;text-transform:uppercase;line-height:.96;font-weight:400}
.gold{color:var(--gold)}.muted{color:rgba(251,247,236,.55);font-weight:500}.center{text-align:center}
.wrap{max-width:680px;margin:0 auto;padding:20px 16px 130px;position:relative;z-index:1}
.foot{position:relative;z-index:1;text-align:center;font-size:11px;color:rgba(251,247,236,.45);padding:0 16px 26px;max-width:680px;margin:-110px auto 0}
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
.code-input{text-align:center;letter-spacing:.35em;font-size:30px;padding:16px;margin-top:18px}
.group{padding-top:14px}
.grp-head{display:flex;align-items:center;gap:12px;margin-bottom:14px}
.grp-id{flex:1;min-width:0}
.grp-name{font-size:clamp(20px,5.5vw,28px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.grp-meta{font-size:12px;color:rgba(251,247,236,.55);margin-top:1px}
.code-pill{display:flex;flex-direction:column;align-items:center;gap:1px;background:linear-gradient(180deg,#ffe066,#f4b400);border:none;border-radius:13px;padding:7px 13px;cursor:pointer;color:#3a2a00;position:relative;box-shadow:0 4px 0 #b88600}
.code-pill:active{transform:translateY(2px);box-shadow:0 2px 0 #b88600}
.code-lbl{font-size:9px;font-weight:800;letter-spacing:.15em}
.code-val{font-size:18px;letter-spacing:.08em}
.code-pill svg{position:absolute;top:5px;right:5px;opacity:.6}
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
.pred-btn{background:rgba(255,255,255,.06);border:1px solid var(--line);color:rgba(251,247,236,.8);font-family:'Outfit';font-weight:600;font-size:13px;padding:6px 12px;border-radius:9px;cursor:pointer}
.pred-btn.on{background:rgba(57,169,219,.22);border-color:rgba(57,169,219,.55);color:#bfe8fa}
.locked-row{color:rgba(251,247,236,.55)}
.locked-row svg{flex:none}
.pick-locked{font-size:12px;font-weight:600}
.pick-locked.hit{color:#7be08c}.pick-locked.miss{color:#ff9b7d}
.grp-sel{display:flex;gap:6px;overflow-x:auto;padding-bottom:6px;margin-bottom:6px;-webkit-overflow-scrolling:touch}
.grp-chip{flex:none;width:38px;height:38px;border-radius:11px;background:rgba(255,255,255,.06);border:1px solid var(--line);color:rgba(251,247,236,.7);font-family:'Anton';font-size:16px;cursor:pointer}
.grp-chip.on{background:linear-gradient(180deg,#ffe066,#f4b400);color:#3a2a00;border-color:transparent}
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
`;
