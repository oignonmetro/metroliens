import { directLines } from './metro.js';

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
      // Interdit de FAIRE SA CORRESPONDANCE à X. Traverser X sur une ligne (sans
      // y changer) reste autorisé. La faute n'existe que si X est saisi comme nœud
      // intérieur du trajet ET que le joueur y change de ligne (le segment suivant
      // est une correspondance). Tant que X n'est pas un point de changement saisi,
      // la contrainte est respectée.
      const idx = routeSteps.findIndex((s, i) => i > 0 && i < routeSteps.length - 1 && s.st === r.st);
      if (idx === -1) return 'satisfied'; // X n'est pas un nœud intérieur : OK
      // X est un nœud intérieur : il y a faute s'il sert de correspondance.
      return routeSteps[idx + 1].transfer ? 'failed' : 'satisfied';
    }
    return 'pending';
  });
}

const REQ_LABELS = {
  passer_par: 'PASSER PAR',
  changer:    'CHANGER À',
  pas_changer:'SANS CHANGER À',
};

const PUZZLES = [
  // Tous vérifiés contraignants par assertBinding (voir ci-dessous).
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
  // Numéro de puzzle affiché au joueur (commence à 1).
  const index = ((n % PUZZLES.length) + PUZZLES.length) % PUZZLES.length;
  return { ...PUZZLES[index], puzzleNo: n + 1, index };
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
  computeReqStatus, REQ_LABELS, PUZZLES, pathPassesThrough, pathChangesAt,
  isConstraintBinding, dayNumber, dayKey, getDailyPuzzle,
  loadStore, saveStore, recordResult, todaysResult,
};
