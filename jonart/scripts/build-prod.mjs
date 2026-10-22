// Build de production : npm run build  (PREVIEW=false, URL propres, formulaire actif).
import { spawnSync } from 'node:child_process';

if (!process.env.SITE_URL && !process.env.URL) {
  console.warn('⚠ SITE_URL non défini : les liens canoniques, Open Graph et le sitemap utiliseront http://localhost:4321.');
  console.warn('  Définissez SITE_URL=https://votre-domaine.be (Netlify fournit URL automatiquement).\n');
}
const r = spawnSync(process.execPath, ['node_modules/astro/astro.js', 'build'], {
  stdio: 'inherit',
  env: { ...process.env, PREVIEW: 'false' },
});
process.exit(r.status ?? 1);
