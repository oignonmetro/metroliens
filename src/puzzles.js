import { directLines, SEG, buildGraph, findOptimal, linesAt } from './metro.js';

// Calcule le statut de chaque contrainte.
// `final=false` (pendant le jeu) : les contraintes "passer_par" restent
// neutres ('pending'), car leur respect ne doit être révélé qu'à la fin.
// `final=true` (écran de résultat) : tout est évalué.
function computeReqStatus(routeSteps, req, final = false, banned = []) {
  return req.map(r => {
    if (r.type === 'passer_par') {
      if (!final) return 'pending'; // masqué pendant le jeu
      for (let i = 1; i < routeSteps.length; i++) {
        if (routeSteps[i].st === r.st) return 'satisfied';
        if ((routeSteps[i].intermediates || []).includes(r.st)) return 'satisfied';
      }
      return 'failed';
    }
    if (r.type === 'changer') {
      const idx = routeSteps.findIndex(s => s.st === r.st);
      if (idx === -1) return 'pending';
      if (idx === 0 || idx === routeSteps.length - 1) return 'pending';
      // Le joueur ne saisit que des stations, jamais les lignes. Un changement à X
      // est satisfait dès qu'il EXISTE une affectation de lignes cohérente où la
      // ligne par laquelle on arrive à X diffère d'une ligne par laquelle on peut
      // repartir. On regarde donc les lignes possibles du segment précédent
      // (station avant X -> X) et du segment suivant (X -> station après X) :
      // s'il existe une ligne d'arrivée A et une ligne de départ B avec A != B,
      // le changement est possible et donc accepté.
      const before = routeSteps[idx - 1].st;
      const after = routeSteps[idx + 1].st;
      const arrLines = directLines(before, r.st, banned);
      const depLines = directLines(r.st, after, banned);
      if (!arrLines.length || !depLines.length) return 'failed';
      const canChange = arrLines.some(a => depLines.some(b => a !== b));
      return canChange ? 'satisfied' : 'failed';
    }
    if (r.type === 'pas_changer') {
      // Interdit de FAIRE SA CORRESPONDANCE à X. Pendant le jeu, on n'évalue
      // la contrainte qu'à la fin (comme passer_par) pour ne pas afficher le
      // trait barré avant que le trajet soit complet.
      if (!final) return 'pending';
      const idx = routeSteps.findIndex((s, i) => i > 0 && i < routeSteps.length - 1 && s.st === r.st);
      if (idx === -1) return 'satisfied'; // X n'est pas un nœud intérieur : OK
      return routeSteps[idx + 1].transfer ? 'failed' : 'satisfied';
    }
    if (r.type === 'pas_passer_par') {
      // Interdit de traverser X, même en station intermédiaire sur une ligne.
      if (!final) return 'pending';
      for (let i = 1; i < routeSteps.length; i++) {
        if (routeSteps[i].st === r.st) return 'failed';
        if ((routeSteps[i].intermediates || []).includes(r.st)) return 'failed';
      }
      return 'satisfied';
    }
    if (r.type === 'pas_utiliser_ligne') {
      // Interdit d'emprunter la ligne r.ln. Le joueur ne saisit que des stations :
      // un segment est jugé fautif seulement s'il N'A AUCUNE alternative à la ligne
      // interdite (toutes les lignes directes possibles SONT la ligne interdite).
      // S'il existe une autre ligne directe, on suppose le joueur l'a prise (tolérant,
      // comme pour "changer"). Évalué uniquement à la fin.
      if (!final) return 'pending';
      for (let i = 1; i < routeSteps.length; i++) {
        const lines = routeSteps[i].allLines || [];
        if (lines.length && lines.every(l => l === r.ln)) return 'failed';
      }
      return 'satisfied';
    }
    if (r.type === 'utiliser_ligne') {
      // Imposé d'emprunter la ligne r.ln au moins sur un segment. Évalué à la fin.
      if (!final) return 'pending';
      for (let i = 1; i < routeSteps.length; i++) {
        if (routeSteps[i].chosenLine === r.ln) return 'satisfied';
      }
      return 'failed';
    }
  });
}

const REQ_LABELS = {
  passer_par:        'PASSER PAR',
  changer:           'CHANGER À',
  pas_changer:       'SANS CHANGER À',
  pas_passer_par:    'ÉVITER',
  pas_utiliser_ligne:'SANS LA LIGNE',
  utiliser_ligne:    'AVEC LA LIGNE',
};

// Puzzles de secours : utilisés si le générateur échoue après 300 essais.
const FALLBACK_PUZZLES = [
  { from:'Nation', to:'Saint-Lazare', banned:['1'],
    req:[{st:'Madeleine', type:'changer'}],
    hint:'Sans la 1 — changez à Madeleine.' },
  { from:'Bastille', to:'Montparnasse-Bienvenue', banned:[],
    req:[{st:'République', type:'passer_par'}],
    hint:'Votre itinéraire doit passer par République.' },
  { from:'Charles de Gaulle-Étoile', to:'Nation', banned:[],
    req:[{st:"Place d'Italie", type:'passer_par'}],
    hint:"Faites le grand tour par Place d'Italie." },
  { from:'Châtelet', to:'Denfert-Rochereau', banned:['4'],
    req:[{st:'Montparnasse-Bienvenue', type:'changer'}],
    hint:'Sans la 4 — changez à Montparnasse.' },
  { from:'Gare du Nord', to:'Nation', banned:['4'],
    req:[{st:'Bastille', type:'changer'}],
    hint:'Sans la 4 — changez à Bastille.' },
  { from:'Gare du Nord', to:'Montparnasse-Bienvenue', banned:[],
    req:[{st:'Bastille', type:'passer_par'}],
    hint:'Votre itinéraire doit passer par Bastille.' },
  { from:'Denfert-Rochereau', to:'Place de Clichy', banned:[],
    req:[{st:'Montparnasse-Bienvenue', type:'pas_changer'}],
    hint:'Sans changer à Montparnasse.' },
  { from:'Bastille', to:'Place de Clichy', banned:[],
    req:[{st:'République', type:'passer_par'}, {st:'Saint-Lazare', type:'pas_changer'}],
    hint:'Par République, mais sans changer à Saint-Lazare.' },
];

// ── Générateur déterministe de puzzle quotidien ──────────────────────────

// Générateur pseudo-aléatoire seedé (mulberry32). Toujours initialiser avec
// dayNumber() pour que le même jour produise le même puzzle partout.
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Stations servant sur au moins 2 lignes (stations de correspondance).
// Calculé une seule fois au chargement du module.
const INTERCHANGE_STATIONS = (() => {
  const stSet = new Set();
  for (const segs of Object.values(SEG))
    for (const seg of segs)
      for (const st of seg)
        stSet.add(st);
  return [...stSet].filter(st => linesAt(st).length >= 2).sort();
})();

// Toutes les lignes du réseau.
const ALL_LINES = Object.keys(SEG);

// Profil de difficulté selon le jour de la semaine.
// 2025-01-01 (epoch, dayNumber=0) est un mercredi → offset +2 pour que 0=lundi.
function getProfile(dayN) {
  const dow = ((dayN + 2) % 7 + 7) % 7; // 0=lundi … 6=dimanche
  if (dow === 0) return { nbReq: 1, types: ['passer_par'],                              minBase: 600,  allowBanned: false };
  if (dow === 1) return { nbReq: 1, types: ['passer_par','changer'],                   minBase: 600,  allowBanned: false };
  if (dow === 2) return { nbReq: 1, types: ['passer_par','changer','pas_changer'],      minBase: 720,  allowBanned: false };
  if (dow === 3) return { nbReq: 'rand', types: ['passer_par','changer','pas_changer','pas_passer_par','pas_utiliser_ligne','utiliser_ligne'], minBase: 720, allowBanned: false };
  if (dow === 4) return { nbReq: 2,      types: ['passer_par','changer','pas_changer','pas_passer_par','pas_utiliser_ligne','utiliser_ligne'], minBase: 720, allowBanned: false };
  if (dow === 5) return { nbReq: 2,      types: ['passer_par','changer','pas_changer','pas_passer_par','pas_utiliser_ligne','utiliser_ligne'], minBase: 840, allowBanned: true  };
                 return { nbReq: 2,      types: ['passer_par','changer','pas_changer','pas_passer_par','pas_utiliser_ligne','utiliser_ligne'], minBase: 900, allowBanned: true  };
}

// ── Score de difficulté ──────────────────────────────────────────────────
// Combine plusieurs facteurs ressentis par le joueur :
//   - le temps total du trajet contraint (effort brut)
//   - le détour qu'imposent les contraintes par rapport au trajet libre
//     (à quel point on est forcé de s'écarter du plus court chemin)
//   - le nombre de correspondances sur le trajet contraint (charge mentale)
//   - la complexité des types de contraintes elles-mêmes (lire/retenir/vérifier
//     "sans changer à X" est plus exigeant que "passer par X", etc.)
// Le score sert à viser une difficulté CROISSANTE au fil de la semaine plutôt
// que de s'arrêter sur le premier puzzle valide rencontré (qui peut être trivial,
// p.ex. une contrainte qui ne coûte qu'1min30 de détour un jeudi).
const TYPE_WEIGHT = {
  passer_par: 1, changer: 1.2, pas_changer: 1.6, pas_passer_par: 1.5,
  pas_utiliser_ligne: 1.8, utiliser_ligne: 1.7,
};
function countTransfers(path) {
  let t = 0;
  for (let i = 1; i < path.length; i++) if (path[i].st === path[i-1].st) t++;
  return t;
}
function difficultyScore(req, banned, freeOpt, finalOpt) {
  const totalMin  = finalOpt.time / 60;
  const detourMin = (finalOpt.time - freeOpt.time) / 60;
  const transfers = countTransfers(finalOpt.path);
  const typeWeight = req.reduce((a, r) => a + (TYPE_WEIGHT[r.type] || 1), 0) + (banned.length ? 1.8 : 0);
  return totalMin * 0.5 + detourMin * 2.5 + transfers * 1.5 + typeWeight * 3;
}
// Bandes-cibles de score par jour (0=lundi … 6=dimanche), légèrement chevauchantes
// pour rester atteignables tout en imposant une tendance nettement croissante.
const DIFFICULTY_BANDS = [
  [14, 21], // lundi    — prise en main
  [22, 28], // mardi
  [29, 35], // mercredi
  [36, 42], // jeudi
  [43, 50], // vendredi
  [51, 60], // samedi
  [61, 84], // dimanche — le plus corsé
];

function pickRand(arr, rand) { return arr[Math.floor(rand() * arr.length)]; }

// Retourne true si le chemin optimal emprunte une des lignes indiquées.
function pathUsesLines(path, lines) {
  return path.some(node => lines.includes(node.ln));
}

// Trouve l'optimal contraint qui emprunte obligatoirement la ligne lineId,
// en testant chaque station de cette ligne comme point de passage forcé.
function findOptimalViaLine(adj, sl, from, to, lineId, posReqs) {
  let best = null;
  for (const seg of SEG[lineId]) {
    for (const st of seg) {
      if (st === from || st === to) continue;
      const r = findOptimal(adj, sl, from, to, [...posReqs, {st, type:'passer_par'}]);
      if (r && (!best || r.time < best.time)) best = r;
    }
  }
  return best;
}

// Génère le puzzle du jour de façon déterministe à partir de dayN.
function generatePuzzle(dayN) {
  const rand = mulberry32(dayN);
  const profile = getProfile(dayN);
  // Jeudi : le rand est appelé une fois pour le nbReq, il faut le faire avec rand()
  const nbReq = (profile.nbReq === 'rand') ? (rand() < 0.5 ? 1 : 2) : profile.nbReq;
  const dow = ((dayN + 2) % 7 + 7) % 7;
  const [bandLo, bandHi] = DIFFICULTY_BANDS[dow];

  // Budget de recherche généreux : beaucoup de tentatives échouent à la validité
  // (insoluble, contrainte redondante…), surtout les jours difficiles. Un budget
  // large garantit assez de candidats RÉELLEMENT notés pour tomber dans la bande
  // de difficulté visée. La génération n'a lieu qu'une fois par jour (mémoïsée).
  const MAX_TRIES = 1200;
  // On ne s'arrête pas au premier puzzle valide : on vise une difficulté précise
  // pour ce jour de la semaine (DIFFICULTY_BANDS). Tant qu'aucun candidat ne tombe
  // dans la bande-cible, on retient le plus proche ("best") et on continue à
  // chercher ; au bout du budget de tentatives, on retourne le meilleur trouvé.
  let best = null, bestDist = Infinity;

  for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
    // 1. Tirer la paire (from, to)
    const from = pickRand(INTERCHANGE_STATIONS, rand);
    const to   = pickRand(INTERCHANGE_STATIONS, rand);
    if (from === to) continue;

    // 2. Décider si on bannit une ligne (selon profil)
    let banned = [];
    if (profile.allowBanned && rand() < 0.5) {
      const candidateLine = pickRand(ALL_LINES, rand);
      banned = [candidateLine];
    }

    // 3. Optimal libre (sans contraintes, avec éventuellement la ligne bannie)
    const { adj, sl } = buildGraph(banned);
    const baseOpt = findOptimal(adj, sl, from, to, []);
    if (!baseOpt || baseOpt.time < profile.minBase) continue;

    // 4. Si ligne bannie : vérifier qu'elle est effectivement contraignante
    //    (l'optimal sans bannissement l'empruie)
    if (banned.length > 0) {
      const { adj: adjFull, sl: slFull } = buildGraph([]);
      const freeOpt = findOptimal(adjFull, slFull, from, to, []);
      if (!freeOpt || !pathUsesLines(freeOpt.path, banned)) continue;
    }

    // 5. Construire les contraintes une à une
    const req = [];
    let valid = true;

    for (let ri = 0; ri < nbReq; ri++) {
      // Éviter les doublons de station dans les contraintes
      const usedStations = req.map(r => r.st);

      // Choisir le type parmi ceux disponibles pour ce profil
      // Pour pas_changer : on ne l'autorise que s'il en reste de la place
      const isLastReq = (ri === nbReq - 1);
      const availableTypes = profile.types.filter(t => {
        if (t === 'pas_changer'        && req.some(r => r.type === 'pas_changer'))        return false;
        if (t === 'changer'            && req.some(r => r.type === 'changer'))            return false;
        if (t === 'pas_passer_par'     && req.some(r => r.type === 'pas_passer_par'))     return false;
        if (t === 'pas_utiliser_ligne' && req.some(r => r.type === 'pas_utiliser_ligne')) return false;
        if (t === 'utiliser_ligne'     && req.some(r => r.type === 'utiliser_ligne'))     return false;
        // Contraintes de ligne tirées en dernier : la ligne est alors choisie d'après
        // l'optimal DÉJÀ dévié par les contraintes de station (passer_par/changer),
        // donc réellement mordante au lieu d'être prise sur le trajet libre — où une
        // ligne empruntée sur le plus court chemin devient souvent redondante une fois
        // le détour imposé. Avec nbReq=1, isLastReq est toujours vrai (inchangé).
        if (t === 'pas_utiliser_ligne' && !isLastReq) return false;
        if (t === 'utiliser_ligne'     && !isLastReq) return false;
        return true;
      });
      if (!availableTypes.length) { valid = false; break; }
      const type = pickRand(availableTypes, rand);

      // Calculer l'optimal courant avec les contraintes déjà accumulées
      const noChangeSts  = req.filter(r => r.type === 'pas_changer').map(r => r.st);
      const bannedSts    = req.filter(r => r.type === 'pas_passer_par').map(r => r.st);
      const bannedLns    = req.filter(r => r.type === 'pas_utiliser_ligne').map(r => r.ln);
      const curGraph = buildGraph([...banned, ...bannedLns], noChangeSts, bannedSts);
      const curOpt = findOptimal(curGraph.adj, curGraph.sl, from, to,
                                  req.filter(r => r.type === 'passer_par' || r.type === 'changer'));
      if (!curOpt) { valid = false; break; }

      // Trouver une station candidate contraignante
      // Préférence : stations sur le chemin optimal courant (pour passer_par/changer)
      //              ou stations où l'optimal courant change de ligne (pour pas_changer)
      let candidateSt = null;
      let candidateLn = null;
      const pathStations = curOpt.path.map(p => p.st).filter(s =>
        s !== from && s !== to && !usedStations.includes(s)
      );
      const interchangesOnPath = pathStations.filter(s => linesAt(s).length >= 2);

      if (type === 'pas_changer') {
        // Trouver une station où l'optimal courant change de ligne
        const changeStations = [];
        for (let i = 1; i < curOpt.path.length - 1; i++) {
          const p = curOpt.path[i];
          if (p.st !== from && p.st !== to &&
              !usedStations.includes(p.st) &&
              curOpt.path[i-1].st === p.st && curOpt.path[i].ln !== curOpt.path[i-1].ln) {
            changeStations.push(p.st);
          }
        }
        // Aussi détecter les changements via les nœuds consécutifs différents
        for (let i = 1; i < curOpt.path.length; i++) {
          const prev = curOpt.path[i-1], cur = curOpt.path[i];
          if (prev.st !== cur.st) continue; // pas le même nœud
          if (cur.st === from || cur.st === to) continue;
          if (usedStations.includes(cur.st)) continue;
          if (!changeStations.includes(cur.st)) changeStations.push(cur.st);
        }
        if (!changeStations.length) { valid = false; break; }
        candidateSt = pickRand(changeStations, rand);
      } else if (type === 'passer_par') {
        // Station pas déjà sur le chemin de baseOpt
        const notOnPath = INTERCHANGE_STATIONS.filter(s =>
          s !== from && s !== to && !usedStations.includes(s) &&
          !pathPassesThrough(baseOpt.path, s)
        );
        if (!notOnPath.length) { valid = false; break; }
        candidateSt = pickRand(notOnPath, rand);
      } else if (type === 'pas_passer_par') {
        // Station sur le chemin optimal courant (hors départ/arrivée/déjà utilisées)
        // Dédupliquée car le même nœud peut apparaître plusieurs fois (demi-tour).
        const seen = new Set();
        const onPath = curOpt.path
          .map(p => p.st)
          .filter(s => {
            if (s === from || s === to || usedStations.includes(s) || seen.has(s)) return false;
            seen.add(s); return true;
          });
        if (!onPath.length) { valid = false; break; }
        candidateSt = pickRand(onPath, rand);
      } else if (type === 'pas_utiliser_ligne') {
        // Ligne empruntée par l'optimal courant (hors lignes déjà bannies/interdites).
        const usedLines = req.filter(r => r.type === 'pas_utiliser_ligne').map(r => r.ln);
        const onPathLines = [...new Set(curOpt.path.map(p => p.ln))].filter(l =>
          l && !banned.includes(l) && !usedLines.includes(l)
        );
        if (!onPathLines.length) { valid = false; break; }
        candidateLn = pickRand(onPathLines, rand);
      } else if (type === 'utiliser_ligne') {
        // Ligne NON empruntée par l'optimal courant (binding), non bannie, non déjà
        // utilisée dans une contrainte de ligne (utiliser ou pas_utiliser).
        const excludedLns = req
          .filter(r => r.type === 'utiliser_ligne' || r.type === 'pas_utiliser_ligne')
          .map(r => r.ln);
        const candidates = ALL_LINES.filter(l =>
          !banned.includes(l) && !excludedLns.includes(l) && !pathUsesLines(curOpt.path, [l])
        );
        if (!candidates.length) { valid = false; break; }
        candidateLn = pickRand(candidates, rand);
      } else { // changer
        // Station d'interchange sur le chemin courant où l'optimal ne change pas déjà
        const notChanging = interchangesOnPath.filter(s =>
          !pathChangesAt(curOpt.path, s)
        );
        if (!notChanging.length) { valid = false; break; }
        candidateSt = pickRand(notChanging, rand);
      }

      const r = (type === 'pas_utiliser_ligne' || type === 'utiliser_ligne')
        ? { ln: candidateLn, type }
        : { st: candidateSt, type };

      // Vérifier que la contrainte est bien contraignante vs baseOpt ET vs curOpt.
      // Le test vs baseOpt garantit qu'elle a un sens absolu (non déjà satisfaite
      // sur le trajet libre). Le test vs curOpt garantit qu'elle ajoute une vraie
      // difficulté dans le contexte des contraintes déjà choisies — sans quoi deux
      // contraintes pourraient s'annuler mutuellement (l'une satisfait l'autre).
      if (!isConstraintBinding(r, baseOpt) || !isConstraintBinding(r, curOpt)) { valid = false; break; }

      req.push(r);
    }

    if (!valid || req.length !== nbReq) continue;

    // 6. Vérification finale : puzzle soluble avec toutes les contraintes combinées
    const noChangeSts = req.filter(r => r.type === 'pas_changer').map(r => r.st);
    const bannedSts   = req.filter(r => r.type === 'pas_passer_par').map(r => r.st);
    const bannedLns   = req.filter(r => r.type === 'pas_utiliser_ligne').map(r => r.ln);
    const finalGraph = buildGraph([...banned, ...bannedLns], noChangeSts, bannedSts);
    const posReqs = req.filter(r => r.type === 'passer_par' || r.type === 'changer');
    const utiliserLn = req.find(r => r.type === 'utiliser_ligne');
    const finalOpt = utiliserLn
      ? findOptimalViaLine(finalGraph.adj, finalGraph.sl, from, to, utiliserLn.ln, posReqs)
      : findOptimal(finalGraph.adj, finalGraph.sl, from, to, posReqs);
    if (!finalOpt) continue;

    // 7. Revalidation croisée (« leave-one-out ») : chaque contrainte doit rester
    //    contraignante face à TOUTES les autres, pas seulement face aux précédentes.
    //    Une contrainte tirée tôt peut devenir redondante une fois les suivantes
    //    ajoutées (ex. bannir une ligne que le détour imposé par un passer_par
    //    n'emprunte de toute façon pas). On recompute l'optimal en retirant la
    //    contrainte testée et on vérifie qu'elle reste binding.
    let allBinding = true;
    for (let k = 0; k < req.length && allBinding; k++) {
      const others = req.filter((_, j) => j !== k);
      const ncs  = others.filter(r => r.type === 'pas_changer').map(r => r.st);
      const bsts = others.filter(r => r.type === 'pas_passer_par').map(r => r.st);
      const blns = others.filter(r => r.type === 'pas_utiliser_ligne').map(r => r.ln);
      const g = buildGraph([...banned, ...blns], ncs, bsts);
      const optWithout = findOptimal(g.adj, g.sl, from, to,
        others.filter(r => r.type === 'passer_par' || r.type === 'changer'));
      if (!optWithout || !isConstraintBinding(req[k], optWithout)) allBinding = false;
    }
    if (!allBinding) continue;

    // La ligne bannie « du jour » (banned) doit elle aussi rester contraignante face
    // aux req : l'optimal honorant toutes les req SANS le bannissement doit emprunter
    // la ligne bannie (sinon l'interdire ne change rien).
    if (banned.length > 0) {
      const ncs  = req.filter(r => r.type === 'pas_changer').map(r => r.st);
      const bsts = req.filter(r => r.type === 'pas_passer_par').map(r => r.st);
      const blns = req.filter(r => r.type === 'pas_utiliser_ligne').map(r => r.ln);
      const g = buildGraph([...blns], ncs, bsts); // sans le banned du jour
      const optNoBan = findOptimal(g.adj, g.sl, from, to,
        req.filter(r => r.type === 'passer_par' || r.type === 'changer'));
      if (!optNoBan || !pathUsesLines(optNoBan.path, banned)) continue;
    }

    // 8. Le candidat est valide : on évalue sa difficulté pour ce jour de la
    //    semaine. S'il tombe dans la bande-cible, on le retient immédiatement ;
    //    sinon on le garde comme "meilleur jusqu'ici" (le plus proche de la bande)
    //    et on poursuit la recherche pour tenter de mieux viser.
    const score = difficultyScore(req, banned, baseOpt, finalOpt);
    const dist = score < bandLo ? bandLo - score : score > bandHi ? score - bandHi : 0;
    const candidate = { from, to, banned, req };
    if (dist === 0) return candidate;
    if (dist < bestDist) { bestDist = dist; best = candidate; }
  }

  // Aucun candidat n'est tombé pile dans la bande-cible : on retient le plus
  // proche trouvé pendant la recherche plutôt que le premier valide rencontré.
  if (best) return best;

  // Filet de sécurité
  return FALLBACK_PUZZLES[((dayN % FALLBACK_PUZZLES.length) + FALLBACK_PUZZLES.length) % FALLBACK_PUZZLES.length];
}

// Alias pour la compatibilité avec les exports existants
const PUZZLES = FALLBACK_PUZZLES;


// ── Vérification du caractère contraignant d'une contrainte ──────────────
// Une contrainte n'est légitime que si l'itinéraire optimal SANS elle ne la
// satisfait pas déjà : sinon elle n'impose aucun détour et n'a aucun sens.
function pathPassesThrough(path, st) { return path.some(p => p.st === st); }
function pathChangesAt(path, st) {
  for (let i = 1; i < path.length - 1; i++) {
    if (path[i].st === st && path[i-1].ln !== path[i+1].ln) return true;
  }
  // cas du double-nœud de correspondance (st|||A puis st|||B)
  for (let i = 1; i < path.length; i++) {
    if (path[i].st === st && path[i-1].st === st && path[i].ln !== path[i-1].ln) return true;
  }
  return false;
}

function isConstraintBinding(req, baseOpt) {
  if (!baseOpt) return true;
  if (req.type === 'passer_par') {
    // contraignant si l'optimal libre ne passe pas déjà par la station
    return !pathPassesThrough(baseOpt.path, req.st);
  }
  if (req.type === 'changer') {
    // contraignant si l'optimal libre ne change pas déjà de ligne ici
    return !pathChangesAt(baseOpt.path, req.st);
  }
  if (req.type === 'pas_changer') {
    // contraignant si l'optimal libre change justement de ligne à cette station
    // (l'interdire force alors un autre itinéraire) ; sinon la contrainte est vide.
    return pathChangesAt(baseOpt.path, req.st);
  }
  if (req.type === 'pas_passer_par') {
    // contraignant si l'optimal libre passe par cette station
    return pathPassesThrough(baseOpt.path, req.st);
  }
  if (req.type === 'pas_utiliser_ligne') {
    // contraignant si l'optimal libre emprunte justement cette ligne
    return pathUsesLines(baseOpt.path, [req.ln]);
  }
  if (req.type === 'utiliser_ligne') {
    // contraignant si l'optimal libre n'emprunte PAS cette ligne (l'imposer ajoute un détour)
    return !pathUsesLines(baseOpt.path, [req.ln]);
  }
  return true;
}

// Numéro de jour : nombre de jours écoulés depuis une date de référence fixe.
// Cet entier augmente exactement de 1 chaque jour, ce qui garantit une rotation
// régulière des puzzles (contrairement à un seed AAAAMMJJ qui saute en fin de mois).
const EPOCH = Date.UTC(2025, 0, 1); // 1er janvier 2025, référence arbitraire
function dayNumber(date = new Date()) {
  const today = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((today - EPOCH) / 86400000);
}

// Clé de date locale "AAAA-MM-JJ", sert d'identifiant de la partie du jour.
function dayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDailyPuzzle() {
  const n = dayNumber();
  const puzzle = generatePuzzle(n);
  return { ...puzzle, puzzleNo: n + 1, index: n };
}

// ── Stockage local sûr ───────────────────────────────────────────────────
// Encapsule localStorage avec gestion d'erreur : si le navigateur le refuse
// (mode privé, environnement restreint), les fonctions échouent silencieusement
// sans casser le jeu. La clé regroupe tout l'état sous un seul objet JSON.
const STORE_KEY = 'metroliens:v1';

function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStore(obj) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(obj));
    return true;
  } catch {
    return false;
  }
}

// Enregistre le résultat de la partie du jour et met à jour deux séries :
// - streak : jours RÉUSSIS consécutifs (contrainte respectée), pour le 🔥.
// - optimalStreak : jours où la MEILLEURE solution (l'optimal) a été trouvée,
//   consécutifs. Une solution est optimale quand son temps égale l'optimal (ratio 100).
// N'écrase jamais un résultat déjà enregistré pour le même jour.
function recordResult({ dayK, dayN, puzzleNo, playerTime, optimalTime, ratio, success, route }) {
  const store = loadStore();
  if (store.lastDay === dayK && store.lastResult) {
    return store; // déjà joué aujourd'hui : on ne réécrit pas
  }
  // Série de jours réussis (consécutive : la victoire de la veille requise).
  const prevStreak = store.streak || 0;
  const prevDayN = store.lastDayN;
  let streak;
  if (success) {
    streak = (prevDayN === dayN - 1) ? prevStreak + 1 : 1;
  } else {
    streak = 0;
  }
  // Série d'optimaux (consécutive : l'optimal de la veille requis).
  const isOptimal = success && ratio != null && ratio <= 100;
  const prevOptStreak = store.optimalStreak || 0;
  const prevOptDayN = store.lastOptDayN;
  let optimalStreak;
  if (isOptimal) {
    optimalStreak = (prevOptDayN === dayN - 1) ? prevOptStreak + 1 : 1;
  } else {
    optimalStreak = 0;
  }
  const next = {
    ...store,
    lastDay: dayK,
    lastDayN: success ? dayN : prevDayN,
    streak,
    optimalStreak,
    lastOptDayN: isOptimal ? dayN : prevOptDayN,
    // On enregistre aussi l'itinéraire joué, afin de pouvoir le réafficher
    // (avec la solution) si le joueur revient sur la page le même jour.
    lastResult: { puzzleNo, playerTime, optimalTime, ratio, success, route },
  };
  saveStore(next);
  return next;
}

// Lit le résultat déjà enregistré pour aujourd'hui, s'il existe.
function todaysResult(dayK) {
  const store = loadStore();
  return store.lastDay === dayK ? store.lastResult : null;
}

export {
  computeReqStatus, REQ_LABELS, PUZZLES, FALLBACK_PUZZLES, pathPassesThrough, pathChangesAt,
  isConstraintBinding, dayNumber, dayKey, getDailyPuzzle, generatePuzzle,
  loadStore, saveStore, recordResult, todaysResult,
};
