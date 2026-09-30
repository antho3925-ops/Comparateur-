#!/usr/bin/env node
// Replie tout le projet dans un fichier unique : styles, scripts, base de donnees,
// bandeau et logos deviennent des donnees en ligne. Le resultat s'ouvre par un
// double-clic, se copie sur une cle, s'envoie par courriel — et reste hors ligne.
//
//   node tools/exporter.mjs
//     dist/comparateur.html   fichier autonome, a distribuer
//     dist/artifact.html      meme page sans enveloppe html/head/body, pour publication
//     dist/suivi.html         suivi des contrats, fichier autonome
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { extname } from 'node:path';

const TITRE = 'Comparateur LAMal &amp; LCA';
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
               '.svg': 'image/svg+xml', '.webp': 'image/webp' };

const lire = (f) => readFileSync(f, 'utf8');
const dataUri = (f) => {
  const type = MIME[extname(f).toLowerCase()];
  if (!type) throw new Error(`type non gere : ${f}`);
  return `data:${type};base64,${readFileSync(f).toString('base64')}`;
};

// --- Base de donnees, logos convertis en donnees en ligne -------------------
let db = lire('data/db.js');
const logos = JSON.parse(lire('data/db.js').match(/"logos":\s*(\{[^}]*\})/)?.[1] || '{}');
let nbLogos = 0;
for (const [id, chemin] of Object.entries(logos)) {
  if (!existsSync(chemin)) continue;
  db = db.replace(`"${chemin}"`, () => JSON.stringify(dataUri(chemin)));
  nbLogos += 1;
}

// --- Corps de la page ------------------------------------------------------
const html = lire('index.html');
let corps = html.slice(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'));
corps = corps.replace(/\s*<script src="[^"]*"><\/script>/g, '');
corps = corps.replace('src="assets/banniere-stf-psg.jpg"',
                      () => `src="${dataUri('assets/banniere-stf-psg.jpg')}"`);

const styles = `<style>\n${lire('assets/styles.css')}\n</style>`;
const scripts = ['data/db.js', 'js/format.js', 'js/moteur-lamal.js', 'js/moteur-lca.js',
                 'js/comparateur.js', 'js/app.js']
  .map((f) => `<script>\n${f === 'data/db.js' ? db : lire(f)}\n</script>`)
  .join('\n');

// Le DOM est deja construit quand ces scripts s'executent : on declenche
// nous-memes l'initialisation que la page attendait de DOMContentLoaded.
const amorce = `<script>
if (document.readyState !== 'loading') {
  document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true, cancelable: true }));
}
</script>`;

mkdirSync('dist', { recursive: true });

const page = `${corps}\n${scripts}\n${amorce}\n`;
writeFileSync('dist/artifact.html', `<title>${TITRE}</title>\n${styles}\n${page}`);
writeFileSync('dist/comparateur.html',
  `<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n`
  + `<meta name="viewport" content="width=device-width, initial-scale=1">\n`
  + `<meta name="robots" content="noindex, nofollow">\n<title>${TITRE}</title>\n${styles}\n`
  + `</head>\n<body>\n${page}</body>\n</html>\n`);

// --- Suivi des contrats ----------------------------------------------------
const suivi = lire('suivi.html');
let corpsSuivi = suivi.slice(suivi.indexOf('<body>') + 6, suivi.lastIndexOf('</body>'));
corpsSuivi = corpsSuivi.replace(/\s*<script src="[^"]*"><\/script>/g, '');
const scriptsSuivi = ['js/format.js', 'js/suivi-modele.js', 'js/suivi.js', 'js/clavier.js']
  .map((f) => `<script>\n${lire(f)}\n</script>`)
  .join('\n');
writeFileSync('dist/suivi.html',
  `<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n`
  + `<meta name="viewport" content="width=device-width, initial-scale=1">\n`
  + `<meta name="robots" content="noindex, nofollow">\n<title>Suivi des contrats</title>\n`
  + `<style>\n${lire('assets/styles.css')}\n${lire('assets/suivi.css')}\n</style>\n`
  + `</head>\n<body>\n${corpsSuivi}\n${scriptsSuivi}\n${amorce}\n</body>\n</html>\n`);

const ko = (f) => Math.round(statSync(f).size / 1024);
console.log(`dist/comparateur.html  ${ko('dist/comparateur.html')} Ko  (autonome, hors ligne)`);
console.log(`dist/artifact.html     ${ko('dist/artifact.html')} Ko  (pour publication)`);
console.log(`dist/suivi.html        ${ko('dist/suivi.html')} Ko  (suivi des contrats, autonome)`);
console.log(`${nbLogos} logo(s) et le bandeau integres en donnees`);
