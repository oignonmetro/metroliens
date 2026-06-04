// Script de validation : vérifie les puzzles générés pour les N prochains jours.
// Usage : node scripts/validate-puzzles.mjs [nbJours]
// Nécessite Node ≥ 18 (ESM natif, "type":"module" dans package.json).

import { buildGraph, findOptimal } from '../src/metro.js';
import {
  isConstraintBinding, pathChangesAt, pathPassesThrough,
  dayNumber, generatePuzzle,
} from '../src/puzzles.js';

const N = parseInt(process.argv[2] || '60', 10);
const today = dayNumber();

let passed = 0, failed = 0;

function fmt(s) {
  const m = Math.floor(s / 60), sec = s % 60;
  return sec ? `${m}m${sec}s` : `${m}m`;
}

const rows = [];

for (let offset = 0; offset < N; offset++) {
  const dayN = today + offset;
  const errors = [];

  // Déterminisme : générer deux fois le même puzzle
  const p1 = generatePuzzle(dayN);
  const p2 = generatePuzzle(dayN);
  if (JSON.stringify(p1) !== JSON.stringify(p2)) {
    errors.push('NON-DETERMINISTE');
  }

  const puzzle = p1;

  // Graphe libre (sans noChange) pour vérifier le caractère contraignant
  const { adj, sl } = buildGraph(puzzle.banned);
  const baseOpt = findOptimal(adj, sl, puzzle.from, puzzle.to, []);

  // 1. Non-trivialité
  if (!baseOpt) {
    errors.push('BASE-OPT-NULL');
  } else if (baseOpt.time < 600) {
    errors.push(`BASE-TROP-COURT(${fmt(baseOpt.time)})`);
  }

  // 2. Contraintes individuellement contraignantes
  for (const r of puzzle.req) {
    if (!isConstraintBinding(r, baseOpt)) {
      errors.push(`NON-CONTRAIGNANT(${r.type}@${r.st})`);
    }
  }

  // 3. Solubilité avec toutes les contraintes
  const noChangeSts = puzzle.req.filter(r => r.type === 'pas_changer').map(r => r.st);
  const bannedSts   = puzzle.req.filter(r => r.type === 'pas_passer_par').map(r => r.st);
  const finalGraph = buildGraph(puzzle.banned, noChangeSts, bannedSts);
  const finalOpt = findOptimal(
    finalGraph.adj, finalGraph.sl,
    puzzle.from, puzzle.to,
    puzzle.req.filter(r => r.type !== 'pas_changer' && r.type !== 'pas_passer_par')
  );
  if (!finalOpt) {
    errors.push('INSOLUBLE');
  }

  const ok = errors.length === 0;
  if (ok) passed++; else failed++;

  const reqStr = puzzle.req.map(r => `${r.type.replace('pas_passer_par','!pp').replace('passer_par','pp').replace('pas_changer','!ch').replace('changer','ch')}@${r.st}`).join(' + ');
  const bannedStr = puzzle.banned.length ? ` [!${puzzle.banned.join(',')}]` : '';
  const baseTime = baseOpt ? fmt(baseOpt.time) : '?';
  const finalTime = finalOpt ? fmt(finalOpt.time) : '?';
  const status = ok ? '✓' : '✗';

  rows.push({ dayN, status, from: puzzle.from, to: puzzle.to, bannedStr, reqStr, baseTime, finalTime, errors });
}

// Affichage tableau
const header = `${'Jour'.padEnd(6)} ${'S'.padEnd(2)} ${'Départ'.padEnd(30)} ${'Arrivée'.padEnd(30)} ${'Base'.padEnd(6)} ${'Opt'.padEnd(6)} Contraintes`;
console.log(header);
console.log('-'.repeat(header.length));
for (const r of rows) {
  const line = `${String(r.dayN).padEnd(6)} ${r.status.padEnd(2)} ${(r.from).padEnd(30)} ${(r.to + r.bannedStr).padEnd(30)} ${r.baseTime.padEnd(6)} ${r.finalTime.padEnd(6)} ${r.reqStr}`;
  console.log(line);
  if (r.errors.length) console.log(`       !! ${r.errors.join(', ')}`);
}
console.log('-'.repeat(header.length));
console.log(`Résultat : ${passed}/${N} valides, ${failed} échecs.`);
if (failed > 0) process.exit(1);
