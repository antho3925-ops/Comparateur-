// Configuration Astro du site JON'ART.
// Deux modes, pilotés par la variable d'environnement PREVIEW :
//   PREVIEW=true  -> aperçu hors ligne (fichiers .html, CSS inline, chemins rendus relatifs ensuite)
//   PREVIEW=false -> production (URL propres /page/, sitemap, formulaire actif)
import { defineConfig } from 'astro/config';
import { PREVIEW, SITE_URL } from './src/config.js';

export default defineConfig({
  site: SITE_URL,
  outDir: PREVIEW ? './dist-preview' : './dist',
  // En aperçu, chaque page devient un fichier "page.html" pour s'ouvrir sans serveur.
  build: {
    format: PREVIEW ? 'file' : 'directory',
    // CSS inline : évite toute requête de fichier qui casserait en file://
    inlineStylesheets: PREVIEW ? 'always' : 'auto',
  },
  trailingSlash: PREVIEW ? 'ignore' : 'always',
  devToolbar: { enabled: false },
});
