import { useState, useMemo, useCallback, useEffect } from "react";

const LM = {
  '1':  {c:'#FFCD00',t:'#1A1400'}, '2':  {c:'#003CA6',t:'#fff'},
  '3':  {c:'#837902',t:'#fff'},    '3b': {c:'#6EC4E8',t:'#002233'},
  '4':  {c:'#CF009E',t:'#fff'},    '5':  {c:'#FF7E2E',t:'#2A0800'},
  '6':  {c:'#6ECA97',t:'#003318'}, '7':  {c:'#FA9ABA',t:'#4A0026'},
  '7b': {c:'#83C491',t:'#003310'}, '8':  {c:'#E19BDF',t:'#3A003A'},
  '9':  {c:'#B6BD00',t:'#2A2A00'}, '10': {c:'#C9910D',t:'#3A2000'},
  '11': {c:'#704B1C',t:'#fff'},    '12': {c:'#007852',t:'#fff'},
  '13': {c:'#98D4E2',t:'#001A22'}, '14': {c:'#62259D',t:'#fff'},
};

const SEG = {
  '1': [['La Défense (Grande Arche)','Esplanade de La Défense','Pont de Neuilly',
    'Les Sablons','Porte Maillot','Argentine','Charles de Gaulle-Étoile',
    'George V','Franklin D. Roosevelt','Champs-Élysées-Clemenceau','Concorde',
    'Tuileries','Palais Royal-Musée du Louvre','Louvre-Rivoli','Châtelet',
    'Hôtel de Ville','Saint-Paul (Le Marais)','Bastille','Gare de Lyon',
    'Reuilly-Diderot','Nation','Porte de Vincennes','Saint-Mandé','Bérault',
    'Château de Vincennes']],

  '2': [['Porte Dauphine','Victor Hugo','Charles de Gaulle-Étoile','Ternes',
    'Courcelles','Monceau','Villiers','Rome','Place de Clichy','Blanche',
    'Pigalle','Anvers','Barbès-Rochechouart','La Chapelle','Stalingrad',
    'Jaurès','Colonel Fabien','Belleville','Couronnes','Ménilmontant',
    'Père Lachaise','Philippe Auguste','Alexandre Dumas','Avron','Nation']],

  '3': [['Pont de Levallois-Bécon','Anatole France','Louise Michel',
    'Porte de Champerret','Pereire','Wagram','Malesherbes','Villiers','Europe',
    'Saint-Lazare','Havre-Caumartin','Opéra','Quatre-Septembre','Bourse',
    'Sentier','Réaumur-Sébastopol','Arts et Métiers','Temple','République',
    'Parmentier','Rue Saint-Maur','Père Lachaise','Gambetta','Porte de Bagnolet',
    'Gallieni']],

  '3b': [['Gambetta','Pelleport','Saint-Fargeau','Porte des Lilas']],

  '4': [['Porte de Clignancourt','Simplon','Marcadet-Poissonniers','Château Rouge',
    'Barbès-Rochechouart','Gare du Nord',"Gare de l'Est","Château d'Eau",
    'Strasbourg-Saint-Denis','Réaumur-Sébastopol','Étienne Marcel','Les Halles',
    'Châtelet','Cité','Saint-Michel','Odéon','Saint-Germain-des-Prés',
    'Saint-Sulpice','Saint-Placide','Montparnasse-Bienvenue','Vavin','Raspail',
    'Denfert-Rochereau','Mouton-Duvernet','Alésia',"Porte d'Orléans",
    'Mairie de Montrouge','Barbara','Bagneux-Lucie Aubrac']],

  '5': [["Place d'Italie",'Campo-Formio','Saint-Marcel',"Gare d'Austerlitz",
    'Quai de la Rapée','Bastille','Bréguet-Sabin','Richard-Lenoir','Oberkampf',
    'République','Jacques Bonsergent',"Gare de l'Est",'Gare du Nord','Stalingrad',
    'Jaurès','Laumière','Ourcq','Porte de Pantin','Hoche','Église de Pantin',
    'Bobigny-Pantin-Raymond Queneau','Bobigny-Pablo Picasso']],

  '6': [['Charles de Gaulle-Étoile','Kléber','Boissière','Trocadéro','Passy',
    'Bir-Hakeim','Dupleix','La Motte-Picquet-Grenelle','Cambronne','Sèvres-Lecourbe',
    'Pasteur','Montparnasse-Bienvenue','Edgar Quinet','Raspail','Denfert-Rochereau',
    'Saint-Jacques','Glacière','Corvisart',"Place d'Italie",'Nationale','Chevaleret',
    'Quai de la Gare','Bercy','Dugommier','Daumesnil','Bel-Air','Picpus','Nation']],

  '7': [
    ["La Courneuve-8 Mai 1945","Fort d'Aubervilliers",
     'Aubervilliers-Pantin-Quatre Chemins','Porte de la Villette','Corentin Cariou',
     'Crimée','Riquet','Stalingrad','Louis Blanc','Château-Landon',"Gare de l'Est",
     'Poissonnière','Cadet','Le Peletier',"Chaussée d'Antin-La Fayette",'Opéra',
     'Pyramides','Palais Royal-Musée du Louvre','Pont Neuf','Châtelet','Pont Marie',
     'Sully-Morland','Jussieu','Place Monge','Censier-Daubenton','Les Gobelins',
     "Place d'Italie",'Tolbiac','Maison Blanche'],
    ['Maison Blanche','Le Kremlin-Bicêtre','Villejuif-Léo Lagrange',
     'Villejuif-Paul Vaillant-Couturier','Villejuif-Louis Aragon'],
    ['Maison Blanche',"Porte d'Italie",'Porte de Choisy',"Porte d'Ivry",
     'Pierre et Marie Curie',"Mairie d'Ivry"]],

  '7b': [['Louis Blanc','Jaurès','Bolivar','Buttes-Chaumont','Botzaris',
    'Place des Fêtes','Pré-Saint-Gervais','Danube']],

  '8': [['Balard','Lourmel','Boucicaut','Félix Faure','Commerce',
    'La Motte-Picquet-Grenelle','École Militaire','La Tour-Maubourg','Invalides',
    'Concorde','Madeleine','Opéra','Richelieu-Drouot','Grands Boulevards',
    'Bonne Nouvelle','Strasbourg-Saint-Denis','République','Filles du Calvaire',
    'Saint-Sébastien-Froissart','Chemin Vert','Bastille','Ledru-Rollin',
    'Faidherbe-Chaligny','Reuilly-Diderot','Montgallet','Daumesnil','Michel Bizot',
    'Porte Dorée','Porte de Charenton','Liberté','Charenton-Écoles',
    'École Vétérinaire de Maisons-Alfort','Maisons-Alfort-Stade',
    'Maisons-Alfort-Les Juilliottes',"Créteil-L'Échat",'Créteil-Université',
    'Créteil-Préfecture','Pointe du Lac']],

  '9': [['Pont de Sèvres','Billancourt','Marcel Sembat','Porte de Saint-Cloud',
    'Exelmans','Michel-Ange-Molitor','Michel-Ange-Auteuil','Jasmin','Ranelagh',
    'La Muette','Rue de la Pompe','Trocadéro','Iéna','Alma-Marceau',
    'Franklin D. Roosevelt','Saint-Philippe du Roule','Miromesnil','Saint-Augustin',
    'Havre-Caumartin',"Chaussée d'Antin-La Fayette",'Richelieu-Drouot',
    'Grands Boulevards','Bonne Nouvelle','Strasbourg-Saint-Denis','République',
    'Oberkampf','Saint-Ambroise','Voltaire','Charonne','Rue des Boulets','Nation',
    'Buzenval','Maraîchers','Porte de Montreuil','Robespierre','Croix de Chavaux',
    'Mairie de Montreuil']],

  '10': [['Boulogne-Pont de Saint-Cloud','Boulogne-Jean Jaurès','Michel-Ange-Molitor',
    'Chardon-Lagache','Mirabeau','Javel-André Citroën','Charles Michels',
    'Avenue Émile Zola','La Motte-Picquet-Grenelle','Ségur','Duroc','Vaneau',
    'Sèvres-Babylone','Mabillon','Odéon','Cluny-La Sorbonne','Maubert-Mutualité',
    'Cardinal Lemoine','Jussieu',"Gare d'Austerlitz","Église d'Auteuil",
    'Michel-Ange-Auteuil',"Porte d'Auteuil"]],

  '11': [['Châtelet','Hôtel de Ville','Rambuteau','Arts et Métiers','République',
    'Goncourt','Belleville','Pyrénées','Jourdain','Place des Fêtes','Télégraphe',
    'Porte des Lilas','Mairie des Lilas','Serge Gainsbourg','Romainville-Carnot',
    'Montreuil-Hôpital','La Dhuys','Coteaux-Beauclair','Rosny-Bois-Perrier']],

  '12': [["Mairie d'Issy",'Corentin Celton','Porte de Versailles','Convention',
    'Vaugirard','Volontaires','Pasteur','Falguière','Montparnasse-Bienvenue',
    'Notre-Dame-des-Champs','Rennes','Sèvres-Babylone','Rue du Bac','Solférino',
    'Assemblée Nationale','Concorde','Madeleine','Saint-Lazare',
    "Trinité-d'Estienne d'Orves",'Notre-Dame-de-Lorette','Saint-Georges','Pigalle',
    'Abbesses','Lamarck-Caulaincourt','Jules Joffrin','Marcadet-Poissonniers',
    'Marx Dormoy','Porte de la Chapelle','Front Populaire','Aimé Césaire',
    "Mairie d'Aubervilliers"]],

  '13': [
    ['Châtillon-Montrouge','Malakoff-Rue Étienne Dolet','Malakoff-Plateau de Vanves',
     'Porte de Vanves','Plaisance','Pernety','Gaîté','Montparnasse-Bienvenue','Duroc',
     'Saint-François-Xavier','Varenne','Invalides','Champs-Élysées-Clemenceau',
     'Miromesnil','Saint-Lazare','Liège','Place de Clichy','La Fourche'],
    ['La Fourche','Guy Môquet','Porte de Saint-Ouen','Garibaldi','Mairie de Saint-Ouen',
     'Carrefour Pleyel','Saint-Denis-Porte de Paris','Basilique de Saint-Denis',
     'Saint-Denis-Université'],
    ['La Fourche','Brochant','Porte de Clichy','Mairie de Clichy','Gabriel Péri',
     'Les Agnettes','Les Courtilles']],

  '14': [['Saint-Denis-Pleyel','Mairie de Saint-Ouen','Saint-Ouen','Porte de Clichy',
    'Pont Cardinet','Saint-Lazare','Madeleine','Pyramides','Châtelet','Gare de Lyon',
    'Bercy','Cour Saint-Émilion','Bibliothèque François Mitterrand','Olympiades',
    'Maison Blanche-Paris XIIIe','Hôpital Bicêtre','Villejuif-Gustave Roussy',
    "L'Haÿ-les-Roses",'Chevilly-Larue','Thiais-Orly',"Aéroport d'Orly"]],
};

function lineAdj(lid) {
  const ladj = {};
  for (const seg of SEG[lid]) {
    for (let i = 0; i < seg.length - 1; i++) {
      const a = seg[i], b = seg[i+1];
      if (!ladj[a]) ladj[a] = []; if (!ladj[b]) ladj[b] = [];
      ladj[a].push(b); ladj[b].push(a);
    }
  }
  return ladj;
}

function intermediateStations(from, to, lid) {
  for (const seg of SEG[lid]) {
    const iF = seg.indexOf(from), iT = seg.indexOf(to);
    if (iF !== -1 && iT !== -1) {
      const [lo, hi] = iF < iT ? [iF, iT] : [iT, iF];
      return seg.slice(lo + 1, hi);
    }
  }
  const ladj = lineAdj(lid);
  const prev = {[from]: null}, q = [from];
  while (q.length) {
    const c = q.shift();
    if (c === to) {
      const path = [];
      let cur = prev[to];
      while (cur !== null && cur !== from) { path.unshift(cur); cur = prev[cur]; }
      return path;
    }
    for (const n of (ladj[c]||[])) { if (!(n in prev)) { prev[n] = c; q.push(n); } }
  }
  return [];
}

function directLines(from, to, bannedLines = []) {
  const result = [];
  for (const lid of Object.keys(SEG)) {
    if (bannedLines.includes(lid)) continue;
    const ladj = lineAdj(lid);
    if (!ladj[from]) continue;
    const vis = new Set([from]), q = [from];
    let found = false;
    while (q.length && !found) {
      const c = q.shift();
      if (c === to) { found = true; break; }
      for (const n of (ladj[c] || [])) { if (!vis.has(n)) { vis.add(n); q.push(n); } }
    }
    if (found) result.push(lid);
  }
  return result.sort();
}

// Liste toutes les lignes (réelles, sans filtrage) qui desservent une station,
// dans l'ordre numérique du réseau. Utilisé pour l'écran de fin.
function linesAt(station) {
  const lines = [];
  for (const lid of Object.keys(SEG)) {
    if (SEG[lid].some(seg => seg.includes(station))) lines.push(lid);
  }
  return lines.sort((a, b) => {
    const na = parseFloat(a), nb = parseFloat(b);
    return na - nb || a.localeCompare(b);
  });
}

function stopsOnLine(from, to, lid) {
  for (const seg of SEG[lid]) {
    const iF = seg.indexOf(from), iT = seg.indexOf(to);
    if (iF !== -1 && iT !== -1) return Math.abs(iF - iT);
  }
  const ladj = lineAdj(lid);
  const dist = {[from]: 0}, q = [from];
  while (q.length) {
    const c = q.shift();
    if (c === to) return dist[c];
    for (const n of (ladj[c] || [])) {
      if (dist[n] === undefined) { dist[n] = dist[c] + 1; q.push(n); }
    }
  }
  return Infinity;
}

function computeSegment(from, to, fromLine, bannedLines) {
  const allLines = directLines(from, to, bannedLines);
  if (!allLines.length) return null;
  let chosenLine = null, stops = Infinity, transfer = false;
  if (fromLine && allLines.includes(fromLine)) {
    chosenLine = fromLine;
    stops = stopsOnLine(from, to, fromLine);
  } else {
    transfer = fromLine !== null;
    for (const l of allLines) {
      const s = stopsOnLine(from, to, l);
      if (s < stops) { stops = s; chosenLine = l; }
    }
  }
  return { chosenLine, stops, transfer, time: stops * 90 + (transfer ? 240 : 0), allLines };
}

function buildGraph(bannedLines = [], noChangeStations = []) {
  const noChange = new Set(noChangeStations);
  const adj = {}, sl = {};
  const add = (a, b, t) => {
    if (!adj[a]) adj[a] = []; if (!adj[b]) adj[b] = [];
    adj[a].push({to:b,t}); adj[b].push({to:a,t});
  };
  for (const [lid, segs] of Object.entries(SEG)) {
    if (bannedLines.includes(lid)) continue;
    for (const seg of segs) {
      for (let i = 0; i < seg.length - 1; i++) {
        const a = seg[i], b = seg[i+1];
        add(`${a}|||${lid}`, `${b}|||${lid}`, 90);
        if (!sl[a]) sl[a] = new Set(); if (!sl[b]) sl[b] = new Set();
        sl[a].add(lid); sl[b].add(lid);
      }
    }
  }
  for (const [st, ls] of Object.entries(sl)) {
    // À une station où la correspondance est interdite ("pas_changer"), on ne crée
    // pas les arêtes de changement de ligne : on peut traverser la station sur une
    // ligne, mais jamais y passer d'une ligne à une autre.
    if (noChange.has(st)) continue;
    const arr = [...ls];
    for (let i = 0; i < arr.length; i++)
      for (let j = i+1; j < arr.length; j++)
        add(`${st}|||${arr[i]}`, `${st}|||${arr[j]}`, 240);
  }
  const slF = {};
  for (const [k,v] of Object.entries(sl)) slF[k] = [...v];
  return {adj, sl: slF};
}

function dijkstra(adj, sl, from, to, fromLine = null, forceChange = false) {
  if (!sl[from] || !sl[to]) return null;
  const dist = {}, prev = {}, q = [];
  for (const l of sl[from]) {
    // Si un changement est imposé au départ (contrainte "changer"), on interdit
    // de repartir sur la même ligne que celle d'arrivée.
    if (forceChange && fromLine && l === fromLine) continue;
    const n = `${from}|||${l}`;
    const cost = (fromLine && l !== fromLine) ? 240 : 0;
    dist[n] = cost; q.push({n, d: cost});
  }
  while (q.length) {
    q.sort((a,b) => a.d - b.d);
    const {n, d} = q.shift();
    if (d > (dist[n] ?? Infinity)) continue;
    if (n.split('|||')[0] === to) {
      const path = []; let cur = n;
      while (cur) { const [st,ln] = cur.split('|||'); path.unshift({st,ln}); cur = prev[cur]; }
      return {time: d, path};
    }
    for (const {to:nx, t} of (adj[n]||[])) {
      const nd = d + t;
      if (nd < (dist[nx] ?? Infinity)) { dist[nx] = nd; prev[nx] = n; q.push({n:nx,d:nd}); }
    }
  }
  return null;
}

function perms(arr) {
  if (arr.length <= 1) return [arr];
  return arr.flatMap((x,i) => perms([...arr.slice(0,i),...arr.slice(i+1)]).map(p => [x,...p]));
}

// req peut être soit une liste de noms de stations (waypoints simples),
// soit une liste d'objets {st, type}. Pour un waypoint de type "changer",
// on impose un vrai changement de ligne à cette station (la ligne par laquelle
// on repart doit différer de celle par laquelle on est arrivé).
function findOptimal(adj, sl, from, to, req = []) {
  // On ne garde comme waypoints (points de passage forcés) que les contraintes
  // positives : "passer_par" et "changer". Les contraintes négatives comme
  // "pas_changer" sont déjà prises en compte dans la construction du graphe
  // (arêtes de correspondance retirées), donc on les ignore ici.
  const reqObjs = req
    .map(r => typeof r === 'string' ? {st: r, type: 'passer_par'} : r)
    .filter(r => r.type === 'passer_par' || r.type === 'changer');
  if (!reqObjs.length) return dijkstra(adj, sl, from, to);
  let best = null;
  for (const p of perms(reqObjs)) {
    const pts = [{st: from}, ...p, {st: to}];
    let total = 0, fp = [], ok = true, arrivalLine = null;
    for (let i = 0; i < pts.length-1; i++) {
      // Si le point de DÉPART de ce segment est une contrainte "changer",
      // on force le changement de ligne à ce point.
      const forceChange = i > 0 && pts[i].type === 'changer';
      const r = dijkstra(adj, sl, pts[i].st, pts[i+1].st, arrivalLine, forceChange);
      if (!r) { ok = false; break; }
      total += r.time;
      arrivalLine = r.path[r.path.length - 1].ln;
      fp = i === 0 ? r.path : [...fp, ...r.path.slice(1)];
    }
    if (ok && (!best || total < best.time)) best = {time: total, path: fp};
  }
  return best;
}

function fmt(s) {
  const m = Math.floor(s/60), sec = s%60;
  return sec ? `${m}min ${sec}s` : `${m}min`;
}


function timeBreakdown(routeSteps) {
  let metro = 0, transfers = 0;
  for (const step of routeSteps) {
    if (step.stops) metro += step.stops * 90;
    if (step.transfer) transfers += 240;
  }
  return { metro, transfers };
}

function optimalBreakdown(path) {
  let metro = 0, transfers = 0;
  for (let i = 1; i < path.length; i++) {
    metro += 90;
    if (path[i].ln !== path[i-1].ln) transfers += 240;
  }
  return { metro, transfers };
}

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
    if (query.length < 2) return [];
    // Normalisation : minuscules + suppression des diacritiques (accents),
    // pour que "cha" trouve "Châtelet", "eglise" trouve "Église", etc.
    const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const q = norm(query);
    return allStations
      .filter(s => s !== curSt && norm(s).includes(q))
      .filter(s => directLines(curSt, s, puzzle.banned).length > 0)
      .slice(0, 9);
  }, [query, allStations, curSt, puzzle.banned]);

  // reqStatus computed from route after each move

  const handlePickStation = useCallback((st) => {
    setQuery(''); setError(null);
    const seg = computeSegment(curSt, st, curLine, puzzle.banned);
    if (!seg) return; // station filtrée normalement, cas de secours silencieux
    const intermediates = intermediateStations(curSt, st, seg.chosenLine);
    const newStep = {st, ...seg, intermediates};
    const newRoute = [...route, newStep];
    const newTime = totalTime + seg.time;
    const newVisited = new Set(visited); newVisited.add(st);
    // Contrainte "pas_changer" : on bloque dès que le joueur tente de repartir
    // d'une station interdite sur une autre ligne (donc d'y faire sa correspondance).
    // Le changement se manifeste par seg.transfer sur ce nouveau segment qui part
    // de curSt : si curSt est une station "pas_changer" et qu'on change ici, faute.
    if (seg.transfer && route.length >= 2) {
      const forbidden = puzzle.req.find(r => r.type === 'pas_changer' && r.st === curSt);
      if (forbidden) {
        setError(`Vous ne pouvez pas changer à ${curSt}. Révisez votre itinéraire.`);
        return;
      }
    }
    // Vérification à l'arrivée : seules les contraintes MANIFESTES bloquent
    // la soumission (le joueur a clairement omis une action qu'il devait poser
    // lui-même, comme "changer à X"). Les contraintes vérifiées automatiquement
    // (passer_par) ne bloquent pas : la réponse est acceptée puis jugée à la fin.
    if (st === puzzle.to) {
      const finalStatus = computeReqStatus(newRoute, puzzle.req, true, puzzle.banned);
      const blockingIdx = puzzle.req.findIndex(
        (r, i) => r.type === 'changer' && finalStatus[i] !== 'satisfied'
      );
      if (blockingIdx !== -1) {
        const r = puzzle.req[blockingIdx];
        setError(`Vous devez ${REQ_LABELS[r.type].toLowerCase()} ${r.st}. Révisez votre itinéraire.`);
        return;
      }
    }
    setRoute(newRoute);
    setTotalTime(newTime);
    setCurSt(st); setCurLine(seg.chosenLine);
    setVisited(newVisited);
    const fStatus = computeReqStatus(newRoute, puzzle.req, st === puzzle.to, puzzle.banned);
    setReqStatus(fStatus);
    if (st === puzzle.to) {
      // Enregistrer le résultat du jour (une seule fois) et calculer le score.
      const success = !puzzle.req.some((r, i) => fStatus[i] === 'failed');
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
  // En cas de partie restaurée depuis le stockage (déjà jouée), on s'appuie sur
  // le succès enregistré plutôt que sur le recalcul (route non disponible).
  const storedResult = stats && stats.lastResult;
  const hasFailed = alreadyDone
    ? (storedResult ? !storedResult.success : false)
    : failedReqs.length > 0;

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
                placeholder="Tapez le nom d'une station…"
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
              {hasFailed && (
                <div style={{fontSize:13, fontWeight:700, color:C.invalid.fg, marginBottom:12,
                  paddingBottom:12, borderBottom:`1px solid ${sc.border}`}}>
                  Itinéraire invalide — il ne passe pas par{' '}
                  {failedReqs.map(r=>r.st).join(', ')}.
                </div>
              )}
              {/* Élément dominant : l'écart à l'optimal (ce qui compte vraiment). */}
              <div style={{fontSize:40, fontWeight:800, letterSpacing:'-1.5px', color:sc.color,
                lineHeight:1}}>
                {ratio<=100 ? 'Optimal' : `+${ratio-100}%`}
              </div>
              {scLabel && ratio>100 && (
                <div style={{fontSize:13, fontWeight:700, color:sc.color, marginTop:8,
                  letterSpacing:'0.3px'}}>
                  {scLabel}
                </div>
              )}
              {ratio<=100 && (
                <div style={{fontSize:13, color:T.muted, marginTop:8}}>
                  Vous avez trouvé le trajet le plus rapide.
                </div>
              )}
              {/* Comparaison des temps, avec le détail trajet / correspondances. */}
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
                          {/* Transition : ligne(s) + nombre de stations */}
                          <div style={{display:'flex', alignItems:'flex-start', gap:8, margin:'5px 0'}}>
                            <div style={{width:8, flexShrink:0, display:'flex', justifyContent:'center'}}>
                              <div style={{width:1, background:T.border, minHeight:34}}/>
                            </div>
                            <div style={{paddingBottom:4}}>
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
