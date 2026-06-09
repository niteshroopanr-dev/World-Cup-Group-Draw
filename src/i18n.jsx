// src/i18n.jsx: tiny, dependency-free language layer for the app.
//
// ===================================================================================
//  TRANSLATION STYLE: STANDING RULE FOR EVERY LANGUAGE, NOW AND IN FUTURE
// ===================================================================================
//  Never translate word for word. Translate the meaning, intent and tone into what a
//  relaxed, friendly native speaker would actually say.
//
//  - Australian and English idioms and casual phrases ("dead simple", "bragging
//    rights", "have a crack", "your mates", "no worries", "a bit of fun") must be
//    rendered as the natural, equivalent casual expression in each language, never a
//    literal rendering. If an idiom has no natural equivalent, express the same
//    friendly intent in plain, warm language in that tongue.
//  - Keep one consistent relaxed, warm, welcoming register across the whole app in
//    every language. It should never read like stiff or machine-literal translation.
//
//  NEVER TRANSLATED, leave exactly as the English: human-entered values (group name,
//  member names, group code); the literal words "World Cup" and "ProfitPulse" wherever
//  they appear, even inside a larger phrase; all numbers (scores, points, positions,
//  percentages); flag emojis; three-letter team codes like ESP and FRA; country and
//  team names (English); currency codes (AUD, USD, ...); the URL; and the site-level
//  index.html <title> and Open Graph / social meta tags.
//
//  Any key missing in a language automatically falls back to the English string, so a
//  half-finished language is never blank.
// ===================================================================================

const translations = {
  /* ----------------------------------------------------------------- ENGLISH (en) */
  en: {
    // common / shared
    "common.back": "Back",
    "common.runDraw": "Run the draw",
    "common.pts": "pts",
    "common.draw": "Draw",
    "common.live": "Live",
    "common.fullTime": "Full time",
    "common.versus": "v",
    "common.clear": "Clear",
    "common.teamsCount": "{n} teams",
    "common.groupX": "Group {g}",
    "common.grpX": "Grp {g}",

    // squad tiers
    "tier.elite": "Elite",
    "tier.strong": "Strong",
    "tier.mid": "Mid",
    "tier.underdog": "Underdog",

    // table-column / record abbreviations
    "abbr.p": "P",
    "abbr.w": "W",
    "abbr.d": "D",
    "abbr.l": "L",
    "abbr.gd": "GD",
    "abbr.pts": "Pts",

    // countdown units
    "cd.d": "d",
    "cd.h": "h",
    "cd.m": "m",
    "cd.s": "s",

    // language picker
    "lang.choose": "Choose your language",

    // footer
    "foot.note": "A just-for-fun group game · not affiliated with FIFA · no real money is handled here",
    "foot.builtBy": "Built by",
    "foot.ppAria": "ProfitPulse, visit profit-pulse.com.au",

    // home / landing
    "home.kicker": "48 nations · one global rivalry",
    "home.titleL1": "The World Cup",
    "home.titleL2": "Group Draw",
    "home.lede": "Insert everyone's names in, the site randomly allocates countries to each member of the group. Then watch the leaderboard fight it out all the way to the final. Built for connected groups scattered across the world.",
    "home.create": "Create new team",
    "home.viewExisting": "View an existing team",
    "home.resume": "Resume my last team ({code})",
    "home.step1t": "Add your group",
    "home.step1d": "Type in up to 100 names — the whole group, wherever they are.",
    "home.step2t": "Share out all 48",
    "home.step2d": "Every team goes to someone, and squads are balanced to be about equally strong. Twelve members means four each; fewer means more each; more means some teams get shared.",
    "home.step3t": "Climb the table",
    "home.step3d": "One code lets anyone follow the group standings, predict games and track the pot.",

    // create
    "create.title": "New draw",
    "create.nameLabel": "Name your group",
    "create.namePlaceholder": "e.g. The Crew World Cup",
    "create.addMembers": "Add members",
    "create.single": "Single",
    "create.pasteList": "Paste a list",
    "create.onePlaceholder": "Type a name and hit +",
    "create.bulkPlaceholder": "One name per line\nAva\nNoah\nMia",
    "create.addEveryone": "Add everyone",
    "create.hintUnder12": "All 48 teams get shared out with no duplicates, so each member holds about {per}, everyone on at least four, with squads balanced to be about equally strong.",
    "create.hint12": "The sweet spot: all 48 teams, exactly four each, no duplicates, with squads balanced to be about equally strong.",
    "create.hintOver12": "Everyone holds four teams and all 48 are covered. Squads are balanced to be about equally strong, sharing the elite and strong sides out evenly first, so a few teams get held by two or more people.",
    "create.codeLabel": "Choose a group code",
    "create.codeLabelHint": "(everyone enters this)",
    "create.codePlaceholder": "e.g. WORLDCUP26",
    "create.codeMsg": "Pick something easy to remember and share. 10 letters or numbers.",
    "create.checking": "Checking…",
    "create.available": "Available",
    "create.codeTaken": "That code is taken, try another.",
    "create.generate": "Or generate one for me",
    "create.errMin": "Add at least two members for the draw.",
    "create.errCode": "Your code needs to be 10 letters or numbers.",
    "create.defaultName": "Our World Cup Draw",

    // setup (creator-only count choice + hand-pick)
    "setup.handpickTitle": "Hand-pick teams (optional)",
    "setup.evenTitle": "Even it out?",
    "setup.evenLede": "The 48 teams will not split evenly between {n} people.",
    "setup.split": "{rem} {who} {big} teams and {smaller} {who2} {small}.",
    "setup.personGets": "person gets",
    "setup.peopleGet": "people get",
    "setup.gets": "gets",
    "setup.get": "get",
    "setup.evenHint": "Squads are still balanced to be about equally strong, so whoever gets fewer teams tends to get higher-ranked ones to make up for it. It is fine to let the app decide.",
    "setup.chooseWho": "Let me choose who gets fewer",
    "setup.appDecide": "Let the app decide",
    "setup.chooseTitle": "Who gets the smaller squad?",
    "setup.chooseHint": "Pick {smaller} of {n}. They will get {base} teams; everyone else gets {big}.",
    "setup.continuePicked": "Continue · {sel} of {smaller} picked",
    "setup.manualHint": "Anything left on {auto} is shared out by the balanced draw. Hand-picking a lot of teams for one person can tip the balance, so light touches work best.",
    "setup.auto": "Auto",
    "setup.personCount": "{name} · {n} of {cap}",
    "setup.fullSuffix": " (full)",
    "setup.skip": "Skip, allocate everything automatically",

    // join
    "join.errEmpty": "Enter the group code you were given.",
    "join.errNotFound": "No group found for that code. Double-check the characters?",
    "join.title": "View a team",
    "join.lede": "Pop in the code the team creator shared with you to follow the draw, table and pot.",
    "join.placeholder": "GROUPCODE1",
    "join.looking": "Looking…",
    "join.viewTeam": "View the team",

    // draw loading
    "draw.cap1": "Balancing the squads, no favourites allowed.",
    "draw.cap2": "Sharing out the giants fairly, hold tight.",
    "draw.cap3": "Doing the maths so nobody cops a dud squad.",
    "draw.cap4": "Crunching the rankings. This is the ProfitPulse bit.",
    "draw.closing": "Squads balanced. Enjoy the games.",
    "draw.by": "by",

    // ceremony
    "cer.doneL1": "The draw",
    "cer.doneL2": "is done!",
    "cer.doneLede": "All teams are shared out across {n} members.",
    "cer.strongestPre": " Strongest squad on paper goes to ",
    "cer.strongestPost": ".",
    "cer.seeTable": "See the group table",
    "cer.replay": "Replay the draw",
    "cer.kicker": "The big draw",
    "cer.timeL1": "Time for",
    "cer.timeL2": "the draw",
    "cer.modeLede": "Gather everyone around one screen, choose a style, then tap through to reveal who gets whom.",
    "cer.teamByTeam": "Team by team",
    "cer.teamByTeamD": "One team at a time, going round the group, building up to the big sides.",
    "cer.wholeSquads": "Whole squads",
    "cer.wholeSquadsD": "Each member's full set of teams, one member at a time.",
    "cer.skip": "Skip it, just deal them out",
    "cer.memberOf": "Member {i} of {n}",
    "cer.drawOf": "Draw {i} of {n}",
    "cer.teamsCount": "{n} teams",
    "cer.teamOf": "Team {i} of {n}",
    "cer.finish": "Finish the draw",
    "cer.next": "Next: {name}",

    // group view
    "group.membersCount": "{n} members",
    "group.crystalOn": "Showing the table from your picks — tap for live only",
    "group.crystalOff": "Crystal Ball: project your own picks onto the table",
    "group.crystalName": "Crystal Ball",
    "group.watchAgain": "Watch the draw again",

    // tabs
    "tab.ranks": "Ranks",
    "tab.squads": "Squads",
    "tab.predict": "Predict",
    "tab.cup": "Cup",
    "tab.pot": "Pot",

    // title badges (tooltips)
    "title.topDog": "Top Dog",
    "title.woodenSpoon": "Wooden Spoon",
    "title.giantSlayer": "Giant Slayer",
    "title.goalMachine": "Goal Machine",
    "title.darkHorse": "Dark Horse",
    "title.onFire": "On Fire",

    // banner
    "banner.leads": "leads the group",
    "banner.nextKickoff": "Next kick-off",
    "banner.liveNowish": "· live now-ish",
    "banner.allIn": "All group games are in 🎉",
    "banner.justPlayed": "Just played",
    "banner.noResults": "No results entered yet",
    "banner.noResultsSub": "Head to the {cup} tab to log scores.",

    // ranks
    "ranks.title": "Group standings",
    "ranks.projected": "projected",
    "ranks.live": "live",
    "ranks.notStarted": "not started",
    "ranks.empty": "The draw is set. Once games kick off (or you fill in the {predict} tab), the group leaderboard comes alive.",
    "ranks.offTop": "{n} off top",
    "ranks.hint": "Scores reward wins, goal margins, clean sheets and giant-killing upsets across all of a member's teams.",

    // squads
    "squads.dupesPre": "With more than 12 members, every team is still allocated and squads are balanced to be about equally strong, sharing the elite and strong sides out evenly first, so some teams get held by more than one member. A ",
    "squads.dupesPost": " tag shows how many members hold that team.",
    "squads.heldBy": "Held by {n} members",

    // predict
    "predict.title": "Predictions league",
    "predict.onDevice": "{n} on this device",
    "predict.pickWinners": "pick the winners",
    "predict.predictingFor": "You're predicting for",
    "predict.tapHint": "Tap everyone you're entering picks for, including kids without their own phone. One device can hold several people's predictions.",
    "predict.standings": "Standings",
    "predict.correctOf": "{c} correct of {n}",
    "predict.yours": "yours",
    "predict.standingsHint": "The standings light up as games finish. Each correct winner is worth one point.",
    "predict.upcoming": "Upcoming picks",
    "predict.startHint": "Tap the names above to start predicting. Picks lock at kick-off and stay hidden from everyone else until then.",
    "predict.noGames": "No games left to predict right now.",
    "predict.chanceNote": "Estimated chances from bookmakers' odds, for interest only.",
    "predict.resultsCalls": "Results & everyone's calls",
    "predict.kickedOff": "Kicked off",
    "predict.noPick": "no pick",

    // cup / tournament
    "cup.title": "The tournament",
    "cup.subKo": "knockout bracket",
    "cup.subGroups": "real groups & results",
    "cup.knockouts": "Knockouts",
    "cup.team": "Team",
    "cup.advance": "Top two (highlighted) advance, plus the best third-placed sides.",
    "cup.fixtures": "Group {g} fixtures",
    "cup.mdX": "MD{n}",
    "cup.hint": "Official scores from the live feed fill in automatically. Until then, anyone in the group can enter a score here, and results flow straight into both the real group table above and the group standings.",

    // knockouts
    "ko.r32": "Round of 32",
    "ko.r16": "Round of 16",
    "ko.qf": "Quarter-finals",
    "ko.sf": "Semi-finals",
    "ko.third": "Play-off for third",
    "ko.final": "Final",
    "ko.tagR32": "R32",
    "ko.tagR16": "R16",
    "ko.tagQF": "QF",
    "ko.tagSF": "SF",
    "ko.tagThird": "3rd",
    "ko.tagFinal": "Final",
    "ko.tbd": "To be decided",
    "ko.winnerOf": "Winner of Match {n}",
    "ko.loserOf": "Loser of Match {n}",
    "ko.winnersGroup": "Winners of Group {g}",
    "ko.runnersGroup": "Runners-up of Group {g}",
    "ko.thirdGroup": "Third place Group {g}",
    "ko.tbs": "To be scheduled",
    "ko.empty": "The knockout bracket appears here once the fixtures are published.",
    "ko.hint": "Knockout kickoffs, teams and scores update automatically from the live feed. This view is read only.",

    // pot
    "pot.top15T": "Top 15% share it",
    "pot.top15D": "Tapered — biggest slice to the leader, then down the line. Fair for big groups.",
    "pot.winnerT": "Winner takes all",
    "pot.winnerD": "One champion scoops the lot.",
    "pot.top3T": "Podium (50 / 30 / 20)",
    "pot.top3D": "Classic top-three split.",
    "pot.evenT": "Everyone shares",
    "pot.evenD": "Split evenly — pure participation fun.",
    "pot.championT": "Back the Champion",
    "pot.championD": "20% held for whoever owns the team that wins the Cup; the rest via the top-15% taper.",
    "pot.prizePot": "Prize pot",
    "pot.clear": "clear",
    "pot.howSplit": "How should it be split?",
    "pot.ifEnded": "If it ended {when}…",
    "pot.predictedTable": "on the predicted table",
    "pot.rightNow": "right now",
    "pot.reserve": "{money} held for the Champion's backer — decided at the Final",
    "pot.noSplit": "No results yet to split on.",
    "pot.hintLive": "The split appears here once real match results are in. To preview it from predictions instead, switch on the {crystal} in the {ranks} tab.",
    "pot.hintEmpty": "Set a pot above and pick a split. The numbers come alive once results are in.",
    "pot.disclaimer": "The app only tracks the pot and suggests a split. Settle up between yourselves — no money moves through here.",

    // code pill
    "code.label": "CODE",
    "code.copyTitle": "Copy group code",

    // share invite
    "share.msgIntro": "You're invited to our World Cup draw. A bit of fun for the tournament: you get a random set of national teams to follow, then we all battle it out on a shared leaderboard. Tap the link to jump in, your code is already loaded.",
    "share.msgCode": "Code: {code}",
    "share.msgOutro": "Made by ProfitPulse. Every team at this World Cup is chasing the trophy; we help business owners chase theirs. https://profit-pulse.com.au",
    "share.title": "World Cup Group Draw",
    "share.button": "Share invite",
    "share.copied": "Copied, paste it to your group",
  },

  /* --------------------------------------------------------- SPANISH (es), Español */
  /* Relaxed, idiomatic Latin/Spain-neutral register. "World Cup" and "ProfitPulse"
     stay in English by rule; the people-group is "grupo" and the national sides are
     "selecciones" so the two never blur. */
  es: {
    "common.back": "Atrás",
    "common.runDraw": "Hacer el sorteo",
    "common.pts": "pts",
    "common.draw": "Empate",
    "common.live": "En vivo",
    "common.fullTime": "Finalizado",
    "common.versus": "vs",
    "common.clear": "Borrar",
    "common.teamsCount": "{n} selecciones",
    "common.groupX": "Grupo {g}",
    "common.grpX": "Gr {g}",

    "tier.elite": "Élite",
    "tier.strong": "Fuerte",
    "tier.mid": "Medio",
    "tier.underdog": "Modesto",

    "abbr.p": "PJ",
    "abbr.w": "G",
    "abbr.d": "E",
    "abbr.l": "P",
    "abbr.gd": "DG",
    "abbr.pts": "Pts",

    "cd.d": "d",
    "cd.h": "h",
    "cd.m": "m",
    "cd.s": "s",

    "lang.choose": "Elige tu idioma",

    "foot.note": "Un juego de grupo solo por diversión · sin relación con la FIFA · aquí no se maneja dinero real",
    "foot.builtBy": "Hecho por",
    "foot.ppAria": "ProfitPulse, visita profit-pulse.com.au",

    "home.kicker": "48 naciones · una rivalidad mundial",
    "home.titleL1": "El World Cup",
    "home.titleL2": "Sorteo de grupos",
    "home.lede": "Pon los nombres de todos y la web reparte países al azar entre cada miembro del grupo. Luego mira cómo la clasificación se pelea hasta la final. Pensado para grupos unidos repartidos por todo el mundo.",
    "home.create": "Crear grupo nuevo",
    "home.viewExisting": "Ver un grupo que ya existe",
    "home.resume": "Volver a mi último grupo ({code})",
    "home.step1t": "Suma a tu grupo",
    "home.step1d": "Escribe hasta 100 nombres, todo el grupo, estén donde estén.",
    "home.step2t": "Reparte las 48",
    "home.step2d": "Cada selección va a alguien, y las plantillas quedan parejas de fuerza. Doce miembros son cuatro cada uno; menos, más cada uno; más, algunas selecciones se comparten.",
    "home.step3t": "Sube en la tabla",
    "home.step3d": "Con un solo código cualquiera sigue la clasificación del grupo, predice partidos y controla el bote.",

    "create.title": "Nuevo sorteo",
    "create.nameLabel": "Ponle nombre a tu grupo",
    "create.namePlaceholder": "p. ej. El World Cup de la Banda",
    "create.addMembers": "Añade miembros",
    "create.single": "Uno a uno",
    "create.pasteList": "Pegar una lista",
    "create.onePlaceholder": "Escribe un nombre y dale a +",
    "create.bulkPlaceholder": "Un nombre por línea\nAna\nLucas\nMía",
    "create.addEveryone": "Añadir a todos",
    "create.hintUnder12": "Las 48 selecciones se reparten sin repetir, así que cada miembro tiene unas {per}, todos con al menos cuatro y con las plantillas parejas de fuerza.",
    "create.hint12": "El punto justo: las 48 selecciones, exactamente cuatro cada uno, sin repetir y con las plantillas parejas de fuerza.",
    "create.hintOver12": "Cada uno tiene cuatro selecciones y están las 48. Las plantillas quedan parejas de fuerza, repartiendo primero por igual a las grandes y a las fuertes, así que unas pocas selecciones las tienen dos o más personas.",
    "create.codeLabel": "Elige un código de grupo",
    "create.codeLabelHint": "(todos escriben este)",
    "create.codePlaceholder": "p. ej. WORLDCUP26",
    "create.codeMsg": "Elige algo fácil de recordar y compartir. 10 letras o números.",
    "create.checking": "Comprobando…",
    "create.available": "Libre",
    "create.codeTaken": "Ese código está pillado, prueba con otro.",
    "create.generate": "O genera uno por mí",
    "create.errMin": "Añade al menos dos miembros para el sorteo.",
    "create.errCode": "Tu código tiene que ser de 10 letras o números.",
    "create.defaultName": "Nuestro sorteo del World Cup",

    "setup.handpickTitle": "Elige selecciones a mano (opcional)",
    "setup.evenTitle": "¿Lo igualamos?",
    "setup.evenLede": "Las 48 selecciones no se reparten justas entre {n} personas.",
    "setup.split": "{rem} {who} {big} selecciones y {smaller} {who2} {small}.",
    "setup.personGets": "persona recibe",
    "setup.peopleGet": "personas reciben",
    "setup.gets": "recibe",
    "setup.get": "reciben",
    "setup.evenHint": "Las plantillas siguen quedando parejas de fuerza, así que quien recibe menos selecciones suele llevarse las mejor clasificadas para compensar. No pasa nada por dejar que la app decida.",
    "setup.chooseWho": "Déjame elegir quién recibe menos",
    "setup.appDecide": "Que decida la app",
    "setup.chooseTitle": "¿Quién se lleva la plantilla más pequeña?",
    "setup.chooseHint": "Elige {smaller} de {n}. Recibirán {base} selecciones; el resto, {big}.",
    "setup.continuePicked": "Continuar · {sel} de {smaller} elegidos",
    "setup.manualHint": "Todo lo que dejes en {auto} lo reparte el sorteo equilibrado. Asignar muchas selecciones a una sola persona puede romper el equilibrio, así que mejor con mano ligera.",
    "setup.auto": "Automático",
    "setup.personCount": "{name} · {n} de {cap}",
    "setup.fullSuffix": " (lleno)",
    "setup.skip": "Saltar, repartir todo automáticamente",

    "join.errEmpty": "Escribe el código de grupo que te pasaron.",
    "join.errNotFound": "No hay ningún grupo con ese código. ¿Revisas las letras?",
    "join.title": "Ver un grupo",
    "join.lede": "Mete el código que te pasó quien creó el grupo y sigue el sorteo, la tabla y el bote.",
    "join.placeholder": "GROUPCODE1",
    "join.looking": "Buscando…",
    "join.viewTeam": "Ver el grupo",

    "draw.cap1": "Equilibrando las plantillas, aquí no hay favoritos.",
    "draw.cap2": "Repartiendo a los grandes con justicia, aguanta un momento.",
    "draw.cap3": "Haciendo las cuentas para que a nadie le toque una plantilla mala.",
    "draw.cap4": "Procesando el ranking. Esta es la parte de ProfitPulse.",
    "draw.closing": "Plantillas equilibradas. A disfrutar de los partidos.",
    "draw.by": "por",

    "cer.doneL1": "El sorteo",
    "cer.doneL2": "¡está hecho!",
    "cer.doneLede": "Todas las selecciones quedaron repartidas entre {n} miembros.",
    "cer.strongestPre": " La mejor plantilla sobre el papel es para ",
    "cer.strongestPost": ".",
    "cer.seeTable": "Ver la tabla del grupo",
    "cer.replay": "Repetir el sorteo",
    "cer.kicker": "El gran sorteo",
    "cer.timeL1": "Llegó la hora",
    "cer.timeL2": "del sorteo",
    "cer.modeLede": "Reúne a todos frente a una pantalla, elige un estilo y ve tocando para descubrir quién se lleva a quién.",
    "cer.teamByTeam": "Selección a selección",
    "cer.teamByTeamD": "Una selección cada vez, dando la vuelta al grupo y subiendo hasta las grandes.",
    "cer.wholeSquads": "Plantillas enteras",
    "cer.wholeSquadsD": "Todas las selecciones de cada miembro, de uno en uno.",
    "cer.skip": "Sáltatelo, reparte y ya",
    "cer.memberOf": "Miembro {i} de {n}",
    "cer.drawOf": "Sorteo {i} de {n}",
    "cer.teamsCount": "{n} selecciones",
    "cer.teamOf": "Selección {i} de {n}",
    "cer.finish": "Terminar el sorteo",
    "cer.next": "Siguiente: {name}",

    "group.membersCount": "{n} miembros",
    "group.crystalOn": "Mostrando la tabla con tus pronósticos, toca para ver solo lo real",
    "group.crystalOff": "Bola de cristal: proyecta tus pronósticos en la tabla",
    "group.crystalName": "Bola de cristal",
    "group.watchAgain": "Ver el sorteo otra vez",

    "tab.ranks": "Tabla",
    "tab.squads": "Plantillas",
    "tab.predict": "Pronósticos",
    "tab.cup": "Copa",
    "tab.pot": "Bote",

    "title.topDog": "El mejor",
    "title.woodenSpoon": "Farolillo rojo",
    "title.giantSlayer": "Matagigantes",
    "title.goalMachine": "Máquina de goles",
    "title.darkHorse": "Tapado",
    "title.onFire": "En racha",

    "banner.leads": "lidera el grupo",
    "banner.nextKickoff": "Próximo saque",
    "banner.liveNowish": "· casi en vivo",
    "banner.allIn": "Ya están todos los partidos del grupo 🎉",
    "banner.justPlayed": "Recién jugado",
    "banner.noResults": "Aún no hay resultados",
    "banner.noResultsSub": "Ve a la pestaña {cup} para anotar los marcadores.",

    "ranks.title": "Clasificación del grupo",
    "ranks.projected": "proyectada",
    "ranks.live": "en directo",
    "ranks.notStarted": "sin empezar",
    "ranks.empty": "El sorteo está listo. En cuanto rueden los partidos (o rellenes la pestaña {predict}), la clasificación del grupo cobra vida.",
    "ranks.offTop": "a {n} del líder",
    "ranks.hint": "La puntuación premia victorias, diferencias de goles, porterías a cero y sorpresas ante los grandes en todas las selecciones de cada miembro.",

    "squads.dupesPre": "Con más de 12 miembros, cada selección se reparte igual y las plantillas quedan parejas de fuerza, repartiendo primero por igual a las grandes y a las fuertes, así que algunas selecciones las tienen más de un miembro. Una etiqueta ",
    "squads.dupesPost": " indica cuántos miembros tienen esa selección.",
    "squads.heldBy": "La tienen {n} miembros",

    "predict.title": "Liga de pronósticos",
    "predict.onDevice": "{n} en este dispositivo",
    "predict.pickWinners": "elige a los ganadores",
    "predict.predictingFor": "Estás pronosticando por",
    "predict.tapHint": "Toca a todos por quienes vas a pronosticar, incluidos los peques sin móvil propio. Un dispositivo puede llevar los pronósticos de varias personas.",
    "predict.standings": "Clasificación",
    "predict.correctOf": "{c} acertados de {n}",
    "predict.yours": "tuyo",
    "predict.standingsHint": "La clasificación se enciende según acaban los partidos. Cada ganador acertado vale un punto.",
    "predict.upcoming": "Próximos pronósticos",
    "predict.startHint": "Toca los nombres de arriba para empezar a pronosticar. Los pronósticos se cierran al saque y quedan ocultos para los demás hasta entonces.",
    "predict.noGames": "No quedan partidos por pronosticar ahora mismo.",
    "predict.chanceNote": "Probabilidades estimadas a partir de las cuotas, solo a título informativo.",
    "predict.resultsCalls": "Resultados y lo que dijo cada uno",
    "predict.kickedOff": "Ya empezó",
    "predict.noPick": "sin pronóstico",

    "cup.title": "El torneo",
    "cup.subKo": "cuadro eliminatorio",
    "cup.subGroups": "grupos y resultados reales",
    "cup.knockouts": "Eliminatorias",
    "cup.team": "Equipo",
    "cup.advance": "Los dos primeros (resaltados) avanzan, más los mejores terceros.",
    "cup.fixtures": "Partidos del Grupo {g}",
    "cup.mdX": "J{n}",
    "cup.hint": "Los marcadores oficiales del directo se rellenan solos. Hasta entonces, cualquiera del grupo puede meter un marcador aquí, y los resultados pasan directos tanto a la tabla real de arriba como a la clasificación del grupo.",

    "ko.r32": "Dieciseisavos",
    "ko.r16": "Octavos",
    "ko.qf": "Cuartos de final",
    "ko.sf": "Semifinales",
    "ko.third": "Partido por el tercer puesto",
    "ko.final": "Final",
    "ko.tagR32": "R32",
    "ko.tagR16": "R16",
    "ko.tagQF": "CF",
    "ko.tagSF": "SF",
    "ko.tagThird": "3º",
    "ko.tagFinal": "Final",
    "ko.tbd": "Por decidir",
    "ko.winnerOf": "Ganador del partido {n}",
    "ko.loserOf": "Perdedor del partido {n}",
    "ko.winnersGroup": "Primero del Grupo {g}",
    "ko.runnersGroup": "Segundo del Grupo {g}",
    "ko.thirdGroup": "Tercero del Grupo {g}",
    "ko.tbs": "Por programar",
    "ko.empty": "El cuadro eliminatorio aparece aquí en cuanto se publiquen los cruces.",
    "ko.hint": "Los horarios, equipos y marcadores de las eliminatorias se actualizan solos desde el directo. Esta vista es de solo lectura.",

    "pot.top15T": "El 15% de arriba lo reparte",
    "pot.top15D": "Escalonado: la mayor tajada para el líder y bajando. Justo para grupos grandes.",
    "pot.winnerT": "El ganador se lo lleva todo",
    "pot.winnerD": "Un solo campeón se lleva el bote.",
    "pot.top3T": "Podio (50 / 30 / 20)",
    "pot.top3D": "El clásico reparto entre los tres primeros.",
    "pot.evenT": "Reparto para todos",
    "pot.evenD": "A partes iguales, pura diversión por participar.",
    "pot.championT": "Apuesta por el Campeón",
    "pot.championD": "Se guarda un 20% para quien tenga a la selección que gane la Copa; el resto, con el escalonado del 15% de arriba.",
    "pot.prizePot": "Bote del premio",
    "pot.clear": "borrar",
    "pot.howSplit": "¿Cómo se reparte?",
    "pot.ifEnded": "Si terminara {when}…",
    "pot.predictedTable": "con la tabla proyectada",
    "pot.rightNow": "ahora mismo",
    "pot.reserve": "{money} guardado para quien apostó por el Campeón, se decide en la Final",
    "pot.noSplit": "Aún no hay resultados que repartir.",
    "pot.hintLive": "El reparto aparece aquí en cuanto haya resultados reales. Para verlo desde los pronósticos, activa la {crystal} en la pestaña {ranks}.",
    "pot.hintEmpty": "Pon un bote arriba y elige un reparto. Los números cobran vida en cuanto haya resultados.",
    "pot.disclaimer": "La app solo lleva la cuenta del bote y sugiere un reparto. Arreglad las cuentas entre vosotros, aquí no se mueve dinero.",

    "code.label": "CÓDIGO",
    "code.copyTitle": "Copiar el código de grupo",

    "share.msgIntro": "Te invitamos a nuestro sorteo del World Cup. Un poco de diversión para el torneo: te toca un grupo de selecciones al azar para seguir, y luego competimos todos en una clasificación compartida. Toca el enlace para entrar, tu código ya va cargado.",
    "share.msgCode": "Código: {code}",
    "share.msgOutro": "Hecho por ProfitPulse. Cada selección de este World Cup va a por el trofeo; nosotros ayudamos a los dueños de negocios a ir a por el suyo. https://profit-pulse.com.au",
    "share.title": "World Cup: Sorteo de grupos",
    "share.button": "Compartir invitación",
    "share.copied": "Copiado, pégalo en tu grupo",
  },
};

/* ----------------------------------------------------------------- MACHINERY ----- */
import React, { createContext, useContext, useState, useCallback } from "react";

const LANG_KEY = "wcfd:lang";

// The two languages ready in this stage, each in its own native name (never translated).
// Adding a language later is just one entry here plus its block in `translations` above.
export const LANGS = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
];

// Locale per language for Intl date formatting. `en` stays undefined so existing English
// date output is byte-for-byte unchanged (the browser default, exactly as it reads now);
// every other language maps to its own locale so day and month names render in that tongue.
// The viewer's own timezone is never touched here; only the language of the names changes.
export const LOCALES = { en: undefined, es: "es" };

// Module-level so the plain date helpers in App.jsx can read the active locale without
// threading it through every component. The provider keeps it in step on each render.
let _locale = LOCALES.en;
export const getLocale = () => _locale;

const readLang = () => {
  try { const v = localStorage.getItem(LANG_KEY); return (v && translations[v]) ? v : "en"; }
  catch { return "en"; }
};

const LangContext = createContext({ lang: "en", setLang: () => {}, langs: LANGS });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(readLang);
  _locale = LOCALES[lang];                                  // keep date locale in step, synchronously
  const setLang = useCallback((next) => {
    setLangState(next);
    try { localStorage.setItem(LANG_KEY, next); } catch (e) {}   // remember the choice; never break on a storage fault
  }, []);
  return <LangContext.Provider value={{ lang, setLang, langs: LANGS }}>{children}</LangContext.Provider>;
}

export function useLang() { return useContext(LangContext); }

// t(key, vars?): look up the active language, fall back to English, then to the key itself
// so nothing is ever blank. {placeholders} in the string are filled from vars.
export function useT() {
  const { lang } = useContext(LangContext);
  return useCallback((key, vars) => {
    const table = translations[lang] || translations.en;
    let s = (table && key in table) ? table[key]
          : (key in translations.en) ? translations.en[key]
          : key;
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? String(vars[k]) : m));
    return s;
  }, [lang]);
}
