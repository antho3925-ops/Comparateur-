// sitemap.xml avec liens hreflang FR/ES (généré sans dépendance supplémentaire).
import { SITE_URL } from '../config.js';
import { ROUTES, LANGS, href } from '../lib/routes.js';

const INDEXABLE = ['home', 'presentation', 'realisations', 'devis', 'instagram', 'mentions', 'confidentialite'];

export function GET() {
  const abs = (p) => new URL(p, SITE_URL).href;
  const urls = INDEXABLE.flatMap((key) =>
    LANGS.map((lang) => {
      const alts = LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${abs(href(key, l))}"/>`).join('\n');
      return `  <url>\n    <loc>${abs(href(key, lang))}</loc>\n${alts}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(href(key, 'fr'))}"/>\n  </url>`;
    })
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
