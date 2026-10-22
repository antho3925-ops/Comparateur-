// robots.txt : tout est bloqué en aperçu ; en production, on autorise et on pointe le sitemap.
import { PREVIEW, SITE_URL } from '../config.js';

export function GET() {
  const body = PREVIEW
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ${new URL('/sitemap.xml', SITE_URL).href}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
