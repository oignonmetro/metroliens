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

// Station immédiatement voisine de `from` dans la direction de `to`, sur la ligne
// `lid`. Si `to` est déjà adjacente, c'est `to` elle-même.
function firstStepOnLine(from, to, lid) {
  const inter = intermediateStations(from, to, lid);
  return inter.length ? inter[0] : to;
}

// Détecte un demi-tour à la station `curSt` : on est arrivé depuis `prevSt` et on
// repart vers `nextSt` SUR LA MÊME LIGNE `lid`. Si le voisin de `curSt` du côté
// d'où l'on vient est le même que celui vers où l'on repart, c'est qu'on rebrousse
// chemin (même direction de départ que d'arrivée) → demi-tour. Sinon on continue
// tout droit (on traverse la station), ce qui ne coûte rien.
function isUTurn(prevSt, curSt, nextSt, lid) {
  if (!prevSt || !nextSt || !lid) return false;
  if (prevSt === curSt || nextSt === curSt) return false;
  return firstStepOnLine(curSt, prevSt, lid) === firstStepOnLine(curSt, nextSt, lid);
}

function computeSegment(from, to, fromLine, bannedLines, prevSt = null, avoidLines = []) {
  let allLines = directLines(from, to, bannedLines);
  if (!allLines.length) return null;
  // Lignes interdites par contrainte "pas_utiliser_ligne" : dès lors qu'au moins
  // une AUTRE ligne dessert le segment, on fait « comme si » la ligne interdite
  // n'existait pas ici — elle disparaît du choix et de l'affichage, et le décompte
  // de stations s'adapte à la ligne retenue (p.ex. Arts et Métiers → République :
  // la 11 est directe, mais si elle est interdite on prend la 3, qui passe par
  // Temple, soit 2 stations). Si la ligne interdite est la SEULE possible, on la
  // conserve : le joueur pourra l'emprunter et invalidera son trajet au bilan.
  if (avoidLines.length) {
    const remaining = allLines.filter(l => !avoidLines.includes(l));
    if (remaining.length) allLines = remaining;
  }
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
  // Demi-tour : on reste sur la même ligne (pas de correspondance) mais on repart
  // dans le sens inverse — on « descend » à la station pour reprendre la ligne dans
  // l'autre direction. Cela coûte 180 s (moins qu'une correspondance à 240 s).
  // Traverser la station dans le même sens (continuer tout droit) ne coûte rien.
  const uturn = !transfer && isUTurn(prevSt, from, to, chosenLine);
  const time = stops * 90 + (transfer ? 240 : 0) + (uturn ? 180 : 0);
  return { chosenLine, stops, transfer, uturn, time, allLines };
}

function buildGraph(bannedLines = [], noChangeStations = [], bannedStations = []) {
  const noChange = new Set(noChangeStations);
  const banned   = new Set(bannedStations);
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
        // Stations bannies ("pas_passer_par") : on retire complètement leurs nœuds
        // du graphe, Dijkstra ne peut donc jamais les traverser.
        if (banned.has(a) || banned.has(b)) continue;
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

// Indices d'un chemin où l'itinéraire fait demi-tour : on revient vers la station
// d'où l'on venait, sur la MÊME ligne (le nœud précédent et le nœud suivant sont la
// même station, même ligne de part et d'autre). Un demi-tour apparaît typiquement
// quand une contrainte "passer_par" force à aller chercher une station puis revenir.
function uturnIndices(path) {
  const res = [];
  for (let i = 1; i < path.length - 1; i++) {
    if (path[i - 1].st === path[i + 1].st &&
        path[i - 1].ln === path[i].ln && path[i].ln === path[i + 1].ln) {
      res.push(i);
    }
  }
  return res;
}
function countUTurns(path) { return uturnIndices(path).length; }
function uturnStations(path) { return new Set(uturnIndices(path).map(i => path[i].st)); }

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
      if (i === 0) {
        fp = r.path;
      } else {
        // Si le premier nœud du nouveau segment est sur une ligne différente de
        // arrivalLine, il y a une correspondance à la station charnière que le
        // path reconstruction n'a pas matérialisée (le nœud de départ du segment
        // était initialisé directement à coût 240 sans prédécesseur dans dijkstra).
        // On injecte ce nœud explicitement pour que optimalBreakdown le voie.
        const segStart = r.path[0];
        if (segStart.ln !== (fp[fp.length - 1]?.ln ?? segStart.ln)) {
          fp = [...fp, segStart, ...r.path.slice(1)];
        } else {
          fp = [...fp, ...r.path.slice(1)];
        }
      }
    }
    // Un demi-tour (rebroussement sur la même ligne, imposé par exemple par un
    // "passer_par" en cul-de-sac) coûte 180 s, à intégrer avant de comparer les
    // permutations pour choisir réellement la plus rapide.
    if (ok) {
      const t = total + 180 * countUTurns(fp);
      if (!best || t < best.time) best = { time: t, path: fp };
    }
  }
  return best;
}

function fmt(s) {
  const m = Math.floor(s/60), sec = s%60;
  return sec ? `${m}min ${sec}s` : `${m}min`;
}


function timeBreakdown(routeSteps) {
  let metro = 0, transfers = 0, uturns = 0;
  for (const step of routeSteps) {
    if (step.stops) metro += step.stops * 90;
    if (step.transfer) transfers += 240;
    if (step.uturn) uturns += 180;
  }
  return { metro, transfers, uturns };
}

function optimalBreakdown(path) {
  let metro = 0, transfers = 0;
  for (let i = 1; i < path.length; i++) {
    // Une correspondance se matérialise par deux nœuds consécutifs sur la même
    // station mais des lignes différentes (le hop ne fait alors pas avancer).
    if (path[i].st === path[i-1].st) { transfers += 240; continue; }
    metro += 90;
  }
  // Un "passer_par" en cul-de-sac peut forcer l'optimal à rebrousser chemin : on
  // compte alors les demi-tours (180 s chacun), pour que le détail somme au temps.
  return { metro, transfers, uturns: 180 * countUTurns(path) };
}

export {
  SEG, LM, lineAdj, intermediateStations, directLines, linesAt,
  stopsOnLine, computeSegment, buildGraph, dijkstra, perms, findOptimal,
  fmt, timeBreakdown, optimalBreakdown, countUTurns, uturnStations,
};
