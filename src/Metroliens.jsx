import { useState, useMemo, useCallback, useEffect } from "react";
import {
  SEG, LM, intermediateStations, linesAt, computeSegment,
  buildGraph, findOptimal, fmt, timeBreakdown, optimalBreakdown, directLines,
} from "./metro.js";
import {
  computeReqStatus, REQ_LABELS, isConstraintBinding,
  dayNumber, dayKey, getDailyPuzzle, recordResult, todaysResult, loadStore,
} from "./puzzles.js";

const T = {
  bg:'#F7F8FB', surf1:'#FFFFFF', surf2:'#EEF1F6', border:'#DDE2EC',
  text:'#1A1E2C', muted:'#6B7390', dim:'#9AA1B8',
  accent:'#62259D',
};

// Couleurs sémantiques (thème clair) : texte foncé, fond pâle, bordure moyenne.
const C = {
  gold:    { fg:'#A8780A', bg:'#FBF3D6', bd:'#E8CE7A' }, // optimal exact (or/doré)
  success: { fg:'#1B7A47', bg:'#E6F5EC', bd:'#A9DDBE' }, // bien (≤ 110 %)
  warn:    { fg:'#9A6A00', bg:'#FBF2DC', bd:'#E8D08A' }, // moyen (≤ 135 %)
  error:   { fg:'#C0322B', bg:'#FBE9E8', bd:'#EDB3AF' }, // lent (> 135 %)
  invalid: { fg:'#7A1020', bg:'#F4E0E4', bd:'#D89AA4' }, // contrainte non respectée (bordeaux)
  goal:    { fg:'#62259D', bg:'#F1E9FA', bd:'#D2BCEC' }, // destination (pastille de saisie)
};

function LineBadge({lid, size=24}) {
  const m = LM[lid] || {c:'#555',t:'#fff'};
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      width:size, height:size, borderRadius:'50%',
      background:m.c, color:m.t,
      fontSize: size <= 22 ? 9 : 11,
      fontWeight:700, flexShrink:0, fontFamily:'monospace', letterSpacing:'-0.5px',
    }}>{lid}</span>
  );
}

export default function Metrodoku() {
  // Chargement de la police Familjen Grotesk (une seule fois).
  useEffect(() => {
    const id = 'familjen-grotesk-font';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }, []);

  const puzzle   = useMemo(getDailyPuzzle, []);
  // Graphe principal (pour le jeu : autocomplete, segments du joueur). Il ne retire
  // que les lignes interdites ; les correspondances "pas_changer" restent présentes,
  // pour que le joueur puisse tenter le changement et être bloqué.
  const {adj,sl} = useMemo(() => buildGraph(puzzle.banned), [puzzle]);
  // Stations où la correspondance est interdite (contrainte "pas_changer").
  const noChangeSts = useMemo(
    () => puzzle.req.filter(r => r.type === 'pas_changer').map(r => r.st),
    [puzzle]
  );
  // Graphe contraint (pour le calcul de l'optimal) : retire en plus les
  // correspondances aux stations "pas_changer".
  const optGraph = useMemo(
    () => buildGraph(puzzle.banned, noChangeSts), [puzzle, noChangeSts]
  );
  // Le vrai optimal doit honorer toutes les contraintes : passage pour "passer_par",
  // véritable changement pour "changer", et interdiction de changer pour "pas_changer"
  // (déjà encodée dans optGraph).
  const optimal  = useMemo(
    () => findOptimal(optGraph.adj, optGraph.sl, puzzle.from, puzzle.to, puzzle.req),
    [optGraph, puzzle]
  );
  // Optimal SANS les contraintes (lignes interdites uniquement) : sert de référence
  // pour vérifier que chaque contrainte impose réellement un détour.
  const baseOptimal = useMemo(() => findOptimal(adj, sl, puzzle.from, puzzle.to, []), [adj,sl,puzzle]);
  const vacuousReqs = useMemo(
    () => puzzle.req.filter(r => !isConstraintBinding(r, baseOptimal)),
    [puzzle, baseOptimal]
  );

  const allStations = useMemo(() => {
    const s = new Set();
    for (const segs of Object.values(SEG)) for (const seg of segs) for (const st of seg) s.add(st);
    return [...s].sort((a,b) => a.localeCompare(b,'fr'));
  }, []);

  const [phase,     setPhase]     = useState('playing');
  const [route,     setRoute]     = useState([{st: puzzle.from}]);
  const [curSt,     setCurSt]     = useState(puzzle.from);
  const [curLine,   setCurLine]   = useState(null);
  const [totalTime, setTotalTime] = useState(0);
  const [visited,   setVisited]   = useState(new Set([puzzle.from]));
  const [query,     setQuery]     = useState('');
  const [error,     setError]     = useState(null);
  const [reqStatus, setReqStatus] = useState(() => puzzle.req.map(()=>'pending'));
  const [stats,       setStats]       = useState(null);   // stats à jour après enregistrement
  const [alreadyDone, setAlreadyDone] = useState(false);  // partie du jour déjà jouée

  // Au montage : si la partie du jour est déjà enregistrée, on verrouille et on
  // restaure directement l'écran de résultat (empêche de rejouer le même jour).
  useEffect(() => {
    const dk = dayKey();
    // Charger les stats existantes pour afficher la série en cours dès l'ouverture.
    setStats(loadStore());
    const prev = todaysResult(dk);
    if (prev) {
      setAlreadyDone(true);
      setTotalTime(prev.playerTime);
      // Restaurer l'itinéraire joué pour pouvoir le réafficher avec la solution.
      if (prev.route && prev.route.length) {
        setRoute(prev.route);
        const last = prev.route[prev.route.length - 1];
        setCurSt(last.st);
        setCurLine(last.chosenLine ?? null);
        setVisited(new Set(prev.route.map(s => s.st)));
        setReqStatus(computeReqStatus(prev.route, puzzle.req, true, puzzle.banned));
      }
      setPhase('done');
    }
  }, []);

  const filtered = useMemo(() => {
    if (query.length < 3) return [];
    // Normalisation : minuscules + suppression des diacritiques (accents),
    // pour que "cha" trouve "Châtelet", "eglise" trouve "Église", etc.
    const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const q = norm(query);
    return allStations
      .filter(s => s !== curSt && norm(s).includes(q))
      .slice(0, 9);
  }, [query, allStations, curSt, puzzle.banned]);

  // reqStatus computed from route after each move

  const handlePickStation = useCallback((st) => {
    setQuery(''); setError(null);
    const seg = computeSegment(curSt, st, curLine, puzzle.banned);
    let newStep;
    if (!seg) {
      // Saut impossible (aucune ligne directe, ou seule ligne interdite). On NE
      // bloque PAS : on laisse le joueur faire l'erreur. Le segment est enregistré
      // comme "impossible" et l'invalidité sera révélée à l'écran de fin.
      const linesWithoutBan = directLines(curSt, st, []);
      const reason = linesWithoutBan.length
        ? `la ligne ${linesWithoutBan[0]} (qui relie ${curSt} à ${st}) est interdite aujourd'hui`
        : `aucune ligne ne relie directement ${curSt} à ${st}`;
      newStep = { st, impossible: true, reason, stops: 0, transfer: false,
        time: 0, allLines: [], intermediates: [] };
    } else {
      const intermediates = intermediateStations(curSt, st, seg.chosenLine);
      newStep = { st, ...seg, intermediates };
    }
    const newRoute = [...route, newStep];
    const newTime = totalTime + newStep.time;
    const newVisited = new Set(visited); newVisited.add(st);
    // Contrainte "pas_changer" : on bloque dès que le joueur tente de repartir
    // d'une station interdite sur une autre ligne (donc d'y faire sa correspondance).
    // Ne s'applique que sur un segment réellement emprunté (pas un saut impossible).
    if (seg && seg.transfer && route.length >= 2) {
      const forbidden = puzzle.req.find(r => r.type === 'pas_changer' && r.st === curSt);
      if (forbidden) {
        setError(`Vous ne pouvez pas changer à ${curSt}. Révisez votre itinéraire.`);
        return;
      }
    }
    // Vérification à l'arrivée : seules les contraintes MANIFESTES bloquent
    // la soumission (le joueur a clairement omis une action qu'il devait poser
    // lui-même, comme "changer à X"). Les sauts impossibles et les contraintes
    // vérifiées automatiquement (passer_par) ne bloquent pas : on accepte et on
    // juge à la fin.
    if (st === puzzle.to) {
      const finalStatus = computeReqStatus(newRoute, puzzle.req, true, puzzle.banned);
      const blockingIdx = puzzle.req.findIndex(
        (r, i) => r.type === 'changer' && finalStatus[i] !== 'satisfied'
      );
      // On ne bloque le "changer" manquant que si l'itinéraire est par ailleurs
      // possible : s'il contient déjà un saut impossible, on laisse aller au bilan final.
      const hasImpossible = newRoute.some(s => s.impossible);
      if (blockingIdx !== -1 && !hasImpossible) {
        const r = puzzle.req[blockingIdx];
        setError(`Vous devez ${REQ_LABELS[r.type].toLowerCase()} ${r.st}. Révisez votre itinéraire.`);
        return;
      }
    }
    setRoute(newRoute);
    setTotalTime(newTime);
    setCurSt(st); setCurLine(seg ? seg.chosenLine : null);
    setVisited(newVisited);
    const fStatus = computeReqStatus(newRoute, puzzle.req, st === puzzle.to, puzzle.banned);
    setReqStatus(fStatus);
    if (st === puzzle.to) {
      // Enregistrer le résultat du jour (une seule fois) et calculer le score.
      // Un itinéraire contenant un saut impossible est invalide, quelles que soient
      // les contraintes.
      const hasImpossible = newRoute.some(s => s.impossible);
      const success = !hasImpossible && !puzzle.req.some((r, i) => fStatus[i] === 'failed');
      const ratio = optimal ? Math.round((newTime / optimal.time) * 100) : null;
      const updated = recordResult({
        dayK: dayKey(), dayN: dayNumber(), puzzleNo: puzzle.puzzleNo,
        playerTime: newTime, optimalTime: optimal ? optimal.time : null,
        ratio, success, route: newRoute,
      });
      setStats(updated);
      setPhase('done');
    }
  }, [curSt, curLine, totalTime, visited, route, puzzle, reqStatus, optimal]);

  // Réinitialise la tentative EN COURS (uniquement pendant le jeu). Ne permet
  // pas de rejouer une partie déjà terminée : en phase 'done', ce bouton n'existe pas.
  const handleRestart = () => {
    if (alreadyDone) return;
    setPhase('playing');
    setRoute([{st: puzzle.from}]);
    setCurSt(puzzle.from); setCurLine(null);
    setTotalTime(0); setVisited(new Set([puzzle.from]));
    setReqStatus(puzzle.req.map(()=>'pending'));
    setQuery(''); setError(null);
  };

  const handleUndo = useCallback(() => {
    if (route.length <= 1) return;
    const newRoute = route.slice(0, -1);
    const prev = newRoute[newRoute.length - 1];
    // Recalculer curLine : ligne du dernier segment restant
    const prevLine = newRoute.length >= 2 ? newRoute[newRoute.length - 1].chosenLine ?? null : null;
    const newTime = newRoute.slice(1).reduce((acc, s) => acc + (s.time || 0), 0);
    const newVisited = new Set(newRoute.map(s => s.st));
    const newReqStatus = computeReqStatus(newRoute, puzzle.req, false, puzzle.banned);
    setRoute(newRoute);
    setCurSt(prev.st);
    setCurLine(prevLine);
    setTotalTime(newTime);
    setVisited(newVisited);
    setReqStatus(newReqStatus);
    setError(null);
  }, [route, puzzle]);

  const ratio = optimal ? Math.round((totalTime / optimal.time) * 100) : null;
  const today = new Date();
  const dateStr = today.toLocaleDateString('fr-FR',{day:'numeric',month:'long'});

  // Statut final des contraintes (calculé seulement quand la partie est finie).
  const finalReqStatus = useMemo(
    () => phase === 'done' ? computeReqStatus(route, puzzle.req, true, puzzle.banned) : [],
    [phase, route, puzzle]
  );
  const failedReqs = puzzle.req.filter((r, i) => finalReqStatus[i] === 'failed');
  // Sauts impossibles dans l'itinéraire (segments sans ligne directe, ou ligne interdite).
  const impossibleSteps = route.filter(s => s.impossible);
  // En cas de partie restaurée depuis le stockage (déjà jouée), on s'appuie sur
  // le succès enregistré plutôt que sur le recalcul (route non disponible).
  const storedResult = stats && stats.lastResult;
  const hasFailed = alreadyDone
    ? (storedResult ? !storedResult.success : false)
    : (failedReqs.length > 0 || impossibleSteps.length > 0);

  // Raisons d'invalidité, dans l'ordre : d'abord les sauts impossibles, puis les
  // contraintes non respectées. Sert à composer le message de l'écran de fin.
  const invalidReasons = [
    ...impossibleSteps.map(s => s.reason),
    ...failedReqs.map(r => `il ne passe pas par ${r.st}`),
  ];

  // Couleur du bloc score, par ordre de priorité :
  // 1. contrainte non respectée  -> bordeaux (invalide, prime sur tout)
  // 2. ratio == 100 (optimal)    -> or/doré (meilleure solution exacte)
  // 3. ratio <= 110              -> vert (très bien)
  // 4. ratio <= 135              -> orange (correct)
  // 5. ratio > 135               -> rouge (valide mais lent)
  const sc = hasFailed ? {color:C.invalid.fg,bg:C.invalid.bg,border:C.invalid.bd}
    : !ratio ? {color:T.muted,bg:T.surf1,border:T.border}
    : ratio<=100 ? {color:C.gold.fg,bg:C.gold.bg,border:C.gold.bd}
    : ratio<=110 ? {color:C.success.fg,bg:C.success.bg,border:C.success.bd}
    : ratio<=135 ? {color:C.warn.fg,bg:C.warn.bg,border:C.warn.bd}
    :              {color:C.error.fg,bg:C.error.bg,border:C.error.bd};

  // Libellé de performance, cohérent avec la couleur, pour lever toute ambiguïté
  // visuelle entre niveaux proches (or/vert, rouge/bordeaux).
  const scLabel = hasFailed ? null // la bannière d'invalidité tient déjà ce rôle
    : !ratio ? null
    : ratio<=100 ? 'Itinéraire optimal'
    : ratio<=110 ? 'Excellent'
    : ratio<=135 ? 'Pas mal'
    :              'Trop long';

  // Regroupe le chemin Dijkstra en segments de même ligne, en coupant aussi
  // aux arrêts obligatoires (puzzle.req) pour qu'ils apparaissent comme nœuds.
  // L'index avance strictement (i = j) pour éviter toute boucle infinie.
  function optimalSegments(path) {
    const forced = new Set(puzzle.req.map(r => r.st));
    const segs = [];
    let i = 0;
    while (i < path.length - 1) {
      const ln = path[i + 1].ln;
      let j = i + 1;
      // Étendre le segment tant que la ligne ne change pas
      // et qu'on ne traverse pas un arrêt obligatoire (qui doit devenir un nœud).
      while (
        j + 1 < path.length &&
        path[j + 1].ln === ln &&
        !forced.has(path[j].st)
      ) {
        j++;
      }
      segs.push({ from: path[i].st, to: path[j].st, ln, stops: j - i });
      i = j; // progression stricte
    }
    return segs;
  }

  // Construit les "nœuds" à afficher pour l'itinéraire du joueur. Chaque pas saisi
  // par le joueur (route[i]) est un trajet sur une seule ligne. Si une station de
  // type "passer_par" est traversée à l'intérieur de ce trajet (donc présente dans
  // ses intermediates), on coupe le segment à cette station pour la faire apparaître
  // comme nœud, exactement comme le fait l'itinéraire optimal.
  // Renvoie une liste de transitions : { st (station de départ), to, lines, stops,
  // transfer, multi } et le tout se termine par le nœud d'arrivée final.
  function playerNodes(route) {
    const passSts = new Set(
      puzzle.req.filter(r => r.type === 'passer_par').map(r => r.st)
    );
    const transitions = [];
    for (let i = 1; i < route.length; i++) {
      const step = route[i];
      const fromSt = route[i - 1].st;
      // Saut impossible : transition spéciale, sans ligne ni nombre de stations.
      if (step.impossible) {
        transitions.push({ from: fromSt, to: step.st, impossible: true });
        continue;
      }
      const inter = step.intermediates || [];
      // Indices des stations "passer_par" traversées dans ce segment, dans l'ordre.
      const cuts = [];
      inter.forEach((s, idx) => { if (passSts.has(s)) cuts.push({ st: s, idx }); });
      if (!cuts.length) {
        transitions.push({
          from: fromSt, to: step.st, lines: step.allLines,
          stops: step.stops, transfer: step.transfer, multi: step.allLines.length > 1,
        });
        continue;
      }
      // On découpe : fromSt -> cut1 -> cut2 -> ... -> step.st, sur la même ligne.
      // Le nombre de stations entre deux points est la différence de leurs positions
      // (les intermediates sont ordonnés entre fromSt (position -1) et step.st).
      let prevSt = fromSt, prevIdx = -1;
      for (const c of cuts) {
        transitions.push({
          from: prevSt, to: c.st, lines: step.allLines,
          stops: c.idx - prevIdx, transfer: prevSt === fromSt ? step.transfer : false,
          multi: step.allLines.length > 1,
        });
        prevSt = c.st; prevIdx = c.idx;
      }
      transitions.push({
        from: prevSt, to: step.st, lines: step.allLines,
        stops: (inter.length) - prevIdx, transfer: false,
        multi: step.allLines.length > 1,
      });
    }
    return transitions;
  }

  return (
    <div style={{fontFamily:"'Familjen Grotesk',system-ui,-apple-system,sans-serif", background:T.bg, color:T.text,
      minHeight:'100vh', display:'flex', flexDirection:'column', maxWidth:480, margin:'0 auto'}}>

      {/* EN-TÊTE */}
      <div style={{padding:'18px 20px 14px', borderBottom:`1px solid ${T.border}`,
        display:'flex', alignItems:'baseline', justifyContent:'space-between'}}>
        <div>
          <div style={{fontSize:22, fontWeight:800, letterSpacing:'-0.5px'}}>MÉTROLIENS</div>
          <div style={{fontSize:11, color:T.muted, marginTop:2, letterSpacing:'0.5px',
            display:'flex', alignItems:'center', gap:8}}>
            <span>{dateStr}</span>
            {stats && stats.streak > 0 && (
              <span style={{color:T.text, fontWeight:600}}>🔥 {stats.streak}</span>
            )}
            {stats && stats.optimalStreak > 0 && (
              <span style={{color:T.text, fontWeight:600}}>🌋 {stats.optimalStreak}</span>
            )}
          </div>
        </div>
        {phase==='playing' && (
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            {totalTime>0 && (
              <span style={{fontSize:13, color:T.muted, fontVariantNumeric:'tabular-nums'}}>
                {fmt(totalTime)}
              </span>
            )}
            <button onClick={handleRestart} style={{fontSize:11, color:T.muted,
              background:'none', border:`1px solid ${T.border}`, borderRadius:6,
              padding:'4px 10px', cursor:'pointer'}}>
              Recommencer
            </button>
          </div>
        )}
      </div>

      {/* CARTE PUZZLE */}
      <div style={{margin:'14px 16px 0', padding:'14px 16px', background:T.surf1,
        borderRadius:12, border:`1px solid ${T.border}`}}>
        <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
          <div style={{background:T.surf2, borderRadius:8, padding:'6px 12px',
            flex:1, textAlign:'center'}}>
            {phase==='done' && (
              <div style={{display:'flex', flexWrap:'wrap', justifyContent:'center', gap:4, marginBottom:5}}>
                {linesAt(puzzle.from).map(l => <LineBadge key={l} lid={l} size={18}/>)}
              </div>
            )}
            <div style={{fontSize:14, fontWeight:600}}>{puzzle.from}</div>
          </div>
          <span style={{color:T.muted, fontSize:18}}>→</span>
          <div style={{background:T.surf2, borderRadius:8, padding:'6px 12px',
            flex:1, textAlign:'center'}}>
            {phase==='done' && (
              <div style={{display:'flex', flexWrap:'wrap', justifyContent:'center', gap:4, marginBottom:5}}>
                {linesAt(puzzle.to).map(l => <LineBadge key={l} lid={l} size={18}/>)}
              </div>
            )}
            <div style={{fontSize:14, fontWeight:600}}>{puzzle.to}</div>
          </div>
        </div>
        <div style={{display:'flex', flexWrap:'wrap', gap:8, alignItems:'center'}}>
          {puzzle.banned.length>0 && (
            <div style={{display:'flex', alignItems:'center', gap:5}}>
              <span style={{fontSize:10, color:T.muted, letterSpacing:'0.4px'}}>INTERDITE</span>
              {puzzle.banned.map(l => <LineBadge key={l} lid={l} size={24}/>)}
            </div>
          )}
          {puzzle.req.length>0 && (
            <div style={{display:'flex', flexWrap:'wrap', gap:6,
              marginLeft:puzzle.banned.length?8:0}}>
              {puzzle.req.map((r, i) => {
                const status = reqStatus[i];
                const col = status==='satisfied' ? C.success.fg : status==='failed' ? C.error.fg : T.text;
                const bg  = status==='satisfied' ? C.success.bg : status==='failed' ? C.error.bg : C.goal.bg;
                const bd  = status==='satisfied' ? C.success.bd : status==='failed' ? C.error.bd : C.goal.bd;
                return (
                  <div key={i} style={{display:'flex', alignItems:'center', gap:5}}>
                    <span style={{fontSize:10, color:status==='pending'?C.goal.fg:col,
                      letterSpacing:'0.4px', fontWeight:700}}>
                      {REQ_LABELS[r.type]}
                    </span>
                    <span style={{fontSize:12, fontWeight:600, padding:'3px 10px',
                      background:bg, color:col, borderRadius:20, border:`1px solid ${bd}`,
                      textDecoration:status==='satisfied'?'line-through':'none'}}>
                      {r.st}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {vacuousReqs.length > 0 && (
          <div style={{marginTop:10, fontSize:11, color:C.warn.fg, padding:'7px 10px',
            background:C.warn.bg, borderRadius:7, border:`1px solid ${C.warn.bd}`, lineHeight:1.5}}>
            ⚠ Contrainte non contraignante : l'itinéraire le plus rapide satisfait déjà{' '}
            {vacuousReqs.map(r=>r.st).join(', ')} sans détour.
          </div>
        )}
      </div>

      {/* CORPS */}
      <div style={{flex:1, padding:'12px 16px 24px', display:'flex', flexDirection:'column', gap:14}}>

        {/* ── JEU ── */}
        {phase==='playing' && (
          <>
            {/* Règle du jeu */}
            <div style={{fontSize:13, color:T.muted, lineHeight:1.6, padding:'11px 14px',
              background:T.surf1, borderRadius:10, border:`1px solid ${T.border}`}}>
              Trouvez l'itinéraire le plus rapide, puis dictez vos{' '}
              <span style={{color:T.text}}>correspondances</span> une à une. Chaque correspondance coûte{' '}
              <span style={{color:T.text}}>4 min</span>, chaque station{' '}
              <span style={{color:T.text}}>1 min 30</span>.
            </div>

            {/* Timeline */}
            <div style={{display:'flex', flexDirection:'column'}}>
              {route.map((step, i) => {
                const isLast = i===route.length-1;
                return (
                  <div key={i} style={{display:'flex', gap:12, alignItems:'flex-start'}}>
                    <div style={{display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0}}>
                      <div style={{width:10, height:10, borderRadius:'50%', marginTop:5,
                        background:isLast?T.text:T.dim, border:isLast?'none':`1px solid ${T.dim}`,
                        boxSizing:'border-box'}}/>
                      {!isLast && <div style={{width:1, background:T.border, flex:1, minHeight:26}}/>}
                    </div>
                    <div style={{paddingBottom:isLast?0:10, flex:1}}>
                      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:8}}>
                        <div style={{fontSize:isLast?15:13, fontWeight:isLast?600:400,
                          color:isLast?T.text:T.muted}}>{step.st}</div>
                        {isLast && i > 0 && (
                          <button onClick={handleUndo} style={{
                            flexShrink:0, fontSize:11, color:T.dim,
                            background:'none', border:`1px solid ${T.border}`,
                            borderRadius:6, padding:'2px 8px', cursor:'pointer',
                            lineHeight:1.5,
                          }}>↩ annuler</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>



            {/* Saisie */}
            <div style={{display:'flex', flexDirection:'column', gap:0}}>
              <div style={{fontSize:11, color:T.muted, marginBottom:6, letterSpacing:'0.3px'}}>
                PROCHAINE CORRESPONDANCE
              </div>
              <input
                autoFocus
                value={query}
                onChange={e=>{setQuery(e.target.value);setError(null);}}
                onKeyDown={e=>{if(e.key==='Enter'&&filtered.length===1)handlePickStation(filtered[0]);}}
                placeholder="Tapez au moins 3 lettres…"
                style={{width:'100%', padding:'10px 14px', borderRadius:8,
                  border:`1px solid ${error?C.error.bd:T.border}`,
                  background:error?C.error.bg:T.surf1, color:T.text, fontSize:14,
                  outline:'none', boxSizing:'border-box'}}
              />
              {error && (
                <div style={{fontSize:12, color:C.error.fg, marginTop:6, padding:'6px 10px',
                  background:C.error.bg, borderRadius:6, border:`1px solid ${C.error.bd}`}}>
                  {error}
                </div>
              )}
              {filtered.length>0 && (
                <div style={{display:'flex', flexDirection:'column', gap:2, marginTop:6}}>
                  {filtered.map(st=>{
                    const isDst = st===puzzle.to;
                    const isReq = puzzle.req.some(r=>r.st===st && r.type!=='passer_par' && reqStatus[puzzle.req.findIndex(x=>x.st===st)] !== 'satisfied');
                    return (
                      <button key={st} onClick={()=>handlePickStation(st)} style={{
                        display:'flex', alignItems:'center', padding:'9px 12px', borderRadius:7,
                        border:`1px solid ${isDst?C.goal.bd:isReq?C.warn.bd:T.border}`,
                        background:isDst?C.goal.bg:isReq?C.warn.bg:T.surf2,
                        cursor:'pointer', textAlign:'left', color:T.text}}>
                        <span style={{fontSize:13}}>
                          {isDst&&<span style={{color:C.goal.fg,marginRight:6}}>★</span>}
                          {isReq&&!isDst&&<span style={{color:C.warn.fg,marginRight:6}}>!</span>}
                          {st}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── FIN ── */}
        {phase==='done' && optimal && (
          <div style={{display:'flex', flexDirection:'column', gap:14}}>

            {/* Score */}
            <div style={{padding:'20px', borderRadius:12, background:sc.bg,
              border:`1px solid ${sc.border}`, textAlign:'center'}}>
              {hasFailed ? (
                /* Cas invalide : on n'affiche que la ou les raisons, sans temps ni écart.
                   Les raisons (sauts impossibles, contraintes non respectées) sont
                   reliées par "et". */
                <div style={{fontSize:15, fontWeight:700, color:C.invalid.fg}}>
                  Itinéraire invalide car {invalidReasons.join(' et ')}.
                </div>
              ) : ratio<=100 ? (
                /* Cas optimal : le joueur a trouvé le meilleur trajet. On affiche
                   seulement son temps et son détail (la comparaison serait redondante). */
                (() => { const {metro,transfers} = timeBreakdown(route.slice(1)); return (
                  <div>
                    <div style={{fontSize:13, fontWeight:700, color:sc.color, marginBottom:10,
                      letterSpacing:'0.3px'}}>
                      Vous avez trouvé le trajet le plus rapide.
                    </div>
                    <div style={{fontSize:32, fontWeight:800, color:T.text,
                      fontVariantNumeric:'tabular-nums', lineHeight:1}}>{fmt(totalTime)}</div>
                    <div style={{fontSize:11, color:T.dim, marginTop:6}}>
                      🚇 {fmt(metro)} · 🔄 {fmt(transfers)}
                    </div>
                  </div>
                ); })()
              ) : (
                /* Cas normal : écart en grand, libellé, puis comparaison VOUS / OPTIMAL. */
                <>
                  <div style={{fontSize:40, fontWeight:800, letterSpacing:'-1.5px', color:sc.color,
                    lineHeight:1}}>
                    +{ratio-100}%
                  </div>
                  {scLabel && (
                    <div style={{fontSize:13, fontWeight:700, color:sc.color, marginTop:8,
                      letterSpacing:'0.3px'}}>
                      {scLabel}
                    </div>
                  )}
                  <div style={{margin:'16px auto 0', paddingTop:14, borderTop:`1px solid ${sc.border}`,
                    display:'flex', justifyContent:'center', gap:24, flexWrap:'wrap'}}>
                    {(() => { const {metro,transfers} = timeBreakdown(route.slice(1)); return (
                      <div style={{textAlign:'center'}}>
                        <div style={{fontSize:11, color:T.muted, letterSpacing:'0.3px'}}>VOUS</div>
                        <div style={{fontSize:20, fontWeight:700, color:T.text, marginTop:2,
                          fontVariantNumeric:'tabular-nums'}}>{fmt(totalTime)}</div>
                        <div style={{fontSize:10, color:T.dim, marginTop:3, lineHeight:1.5}}>
                          🚇 {fmt(metro)}<br/>🔄 {fmt(transfers)}
                        </div>
                      </div>
                    ); })()}
                    {(() => { const {metro,transfers} = optimalBreakdown(optimal.path); return (
                      <div style={{textAlign:'center'}}>
                        <div style={{fontSize:11, color:T.muted, letterSpacing:'0.3px'}}>OPTIMAL</div>
                        <div style={{fontSize:20, fontWeight:700, color:T.text, marginTop:2,
                          fontVariantNumeric:'tabular-nums'}}>{fmt(optimal.time)}</div>
                        <div style={{fontSize:10, color:T.dim, marginTop:3, lineHeight:1.5}}>
                          🚇 {fmt(metro)}<br/>🔄 {fmt(transfers)}
                        </div>
                      </div>
                    ); })()}
                  </div>
                </>
              )}
            </div>

            {/* Série d'optimaux consécutifs : rappel discret. */}
            {stats && (stats.optimalStreak || 0) > 0 && (
              <div style={{fontSize:12, color:T.muted, textAlign:'center'}}>
                🌋 {stats.optimalStreak} jour{stats.optimalStreak>1?'s':''} d'affilée en solution optimale
              </div>
            )}
            <div style={{padding:'14px 16px', background:T.surf1, borderRadius:10,
              border:`1px solid ${T.border}`}}>
              <div style={{fontSize:11, color:T.muted, letterSpacing:'0.5px', marginBottom:12}}>
                VOTRE ITINÉRAIRE
              </div>
              {(() => {
                const trans = playerNodes(route);
                return (
                  <>
                    {/* Nœud de départ */}
                    <div style={{display:'flex', alignItems:'center', gap:8}}>
                      <div style={{width:8, height:8, borderRadius:'50%', flexShrink:0, background:T.text}}/>
                      <span style={{fontSize:13, color:T.text, fontWeight:600}}>{route[0].st}</span>
                    </div>
                    {trans.map((t, i) => {
                      const isLast = i === trans.length - 1;
                      return (
                        <div key={i}>
                          {/* Transition : ligne(s) + nombre de stations, ou saut impossible */}
                          <div style={{display:'flex', alignItems:'flex-start', gap:8, margin:'5px 0'}}>
                            <div style={{width:8, flexShrink:0, display:'flex', justifyContent:'center'}}>
                              <div style={{width:1, background:t.impossible?C.invalid.bd:T.border, minHeight:34}}/>
                            </div>
                            <div style={{paddingBottom:4}}>
                              {t.impossible ? (
                                <div style={{fontSize:11, fontWeight:700, color:C.invalid.fg}}>
                                  ✗ aucune ligne directe
                                </div>
                              ) : (
                                <>
                                  {t.transfer && (
                                    <div style={{fontSize:10, color:C.warn.fg, marginBottom:4,
                                      letterSpacing:'0.3px'}}>CORRESPONDANCE</div>
                                  )}
                                  <div style={{display:'flex', flexWrap:'wrap', gap:5, alignItems:'center'}}>
                                    {t.lines.map(l => <LineBadge key={l} lid={l} size={22}/>)}
                                    <span style={{fontSize:11, color:T.dim}}>
                                      · {t.stops} station{t.stops>1?'s':''}
                                    </span>
                                    {t.multi && (
                                      <span style={{fontSize:10, color:T.dim}}>(plusieurs lignes possibles)</span>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                          {/* Nœud d'arrivée de la transition */}
                          <div style={{display:'flex', alignItems:'center', gap:8}}>
                            <div style={{width:8, height:8, borderRadius:'50%', flexShrink:0,
                              background:isLast?T.text:T.dim}}/>
                            <span style={{fontSize:13, color:isLast?T.text:T.muted,
                              fontWeight:isLast?600:400}}>{t.to}</span>
                          </div>
                        </div>
                      );
                    })}
                  </>
                );
              })()}
            </div>

            {/* Itinéraire optimal (si différent) */}
            {ratio>100 && (
              <div style={{padding:'14px 16px', background:T.surf1, borderRadius:10,
                border:`1px solid ${T.border}`}}>
                <div style={{fontSize:11, color:T.muted, letterSpacing:'0.5px', marginBottom:12}}>
                  ITINÉRAIRE OPTIMAL
                </div>
                {optimalSegments(optimal.path).map((seg, si, arr) => (
                  <div key={si}>
                    <div style={{display:'flex', alignItems:'center', gap:8}}>
                      <div style={{width:8, height:8, borderRadius:'50%', flexShrink:0,
                        background:si===0?T.text:T.dim}}/>
                      <span style={{fontSize:13, color:si===0?T.text:T.muted,
                        fontWeight:si===0?600:400}}>{seg.from}</span>
                    </div>
                    <div style={{display:'flex', gap:8, margin:'5px 0', alignItems:'center'}}>
                      <div style={{width:8, flexShrink:0, display:'flex', justifyContent:'center'}}>
                        <div style={{width:1, background:T.border, minHeight:28}}/>
                      </div>
                      <LineBadge lid={seg.ln} size={22}/>
                      <span style={{fontSize:11, color:T.dim}}>
                        {seg.stops} station{seg.stops>1?'s':''}
                      </span>
                    </div>
                    {si===arr.length-1 && (
                      <div style={{display:'flex', alignItems:'center', gap:8}}>
                        <div style={{width:8, height:8, borderRadius:'50%', background:T.text, flexShrink:0}}/>
                        <span style={{fontSize:13, color:T.text, fontWeight:600}}>{seg.to}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

