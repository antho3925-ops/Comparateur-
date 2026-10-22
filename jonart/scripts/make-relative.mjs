// Post-traitement de l'aperçu : rend tous les chemins relatifs pour que le site
// s'ouvre par double-clic (file://), sans serveur ni connexion Internet.
// Supprime aussi les fichiers inutiles en aperçu (originaux non référencés, pages de production).
import { readdir, readFile, writeFile, rm, stat } from 'node:fs/promises';
import { join, relative, dirname, posix, sep } from 'node:path';

const root = process.argv[2] || 'dist-preview';

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

// Fichiers propres à la production, sans intérêt hors ligne.
for (const p of ['sitemap.xml', 'devis/merci.html', 'es/presupuesto/gracias.html', 'admin']) {
  await rm(join(root, p), { recursive: true, force: true });
}
for (const d of ['devis', 'es/presupuesto']) {
  try { if ((await readdir(join(root, d))).length === 0) await rm(join(root, d), { recursive: true }); } catch {}
}

const files = await walk(root);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const cssFiles = files.filter((f) => f.endsWith('.css'));
const used = new Set();

/** Convertit "/chemin" en chemin relatif depuis le fichier `from`. */
function rel(from, absPath) {
  const [path, suffix = ''] = absPath.split(/(?=[#?])/);
  if (path === '/') return 'index.html' + suffix;
  used.add(join(root, path));
  let r = relative(dirname(from), join(root, path)).split(sep).join(posix.sep);
  if (!r.startsWith('.')) r = './' + r;
  return r + suffix;
}

for (const file of htmlFiles) {
  let html = await readFile(file, 'utf8');
  // Attributs simples : href, src, action, poster, data-large
  html = html.replace(/\b(href|src|action|poster|data-large)="(\/(?!\/)[^"]*)"/g, (_, attr, p) => `${attr}="${rel(file, p)}"`);
  // srcset : liste "url largeur, url largeur"
  html = html.replace(/\bsrcset="([^"]+)"/g, (_, list) =>
    `srcset="${list.split(',').map((part) => {
      const [u, ...rest] = part.trim().split(/\s+/);
      return [u.startsWith('/') ? rel(file, u) : u, ...rest].join(' ');
    }).join(', ')}"`
  );
  // url(/...) dans les styles inline (polices, images de fond)
  html = html.replace(/url\((["']?)(\/(?!\/)[^)"']+)\1\)/g, (_, q, p) => `url(${q}${rel(file, p)}${q})`);
  await writeFile(file, html);
}

for (const file of cssFiles) {
  let css = await readFile(file, 'utf8');
  css = css.replace(/url\((["']?)(\/(?!\/)[^)"']+)\1\)/g, (_, q, p) => `url(${q}${rel(file, p)}${q})`);
  await writeFile(file, css);
}

// Supprime les images d'origine non utilisées (Astro les copie par défaut).
let removed = 0, saved = 0;
for (const f of files) {
  if (!f.includes(`${sep}_astro${sep}`) || f.endsWith('.css') || used.has(f)) continue;
  try { saved += (await stat(f)).size; await rm(f); removed++; } catch {}
}

// Contrôle : plus aucun chemin absolu ne doit subsister.
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const left = html.match(/\b(?:href|src|srcset|action)="\/(?!\/)[^"]*"/g);
  if (left) throw new Error(`Chemins absolus restants dans ${file} : ${left.slice(0, 3).join(' ')}`);
}

console.log(`✓ Chemins relatifs : ${htmlFiles.length} pages traitées, ${removed} fichiers inutiles retirés (${(saved / 1e6).toFixed(1)} Mo).`);
