// Commande unique de l'aperçu client : npm run build:preview
//   1. build Astro avec PREVIEW=true (filigrane, formulaire désactivé, noindex)
//   2. chemins rendus relatifs (ouverture par double-clic, sans serveur ni Internet)
//   3. PDF desktop + mobile des pages principales
// Fonctionne sous Windows, macOS et Linux (pas de syntaxe "VAR=valeur" du shell).
import { spawnSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';

const run = (args, env = {}) => {
  const r = spawnSync(process.execPath, args, { stdio: 'inherit', env: { ...process.env, ...env } });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

console.log('\n▶ 1/3  Build de l\'aperçu (PREVIEW=true)…');
run(['node_modules/astro/astro.js', 'build'], { PREVIEW: 'true' });

console.log('\n▶ 2/3  Chemins relatifs…');
run(['scripts/make-relative.mjs', 'dist-preview']);
await writeFile('dist-preview/LISEZ-MOI.txt', [
  "Aperçu du site JON'ART SRL — version de validation, non publiée.",
  '',
  '1. Décompressez le dossier.',
  '2. Double-cliquez sur « index.html » : le site s\'ouvre dans votre navigateur, sans connexion Internet.',
  '',
  'Le formulaire de devis est volontairement désactivé dans cet aperçu.',
  'Les mentions [À COMPLÉTER] signalent les informations à nous transmettre.',
  '',
].join('\r\n'));

if (process.argv.includes('--no-pdf')) {
  console.log('\n(PDF ignoré : --no-pdf)');
} else {
  console.log('\n▶ 3/3  Génération des PDF…');
  run(['scripts/pdf.mjs']);
}
console.log('\n✓ Aperçu prêt : dossier dist-preview/ (à zipper) + apercu-pdf/\n');
