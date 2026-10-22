// Génère deux PDF de relecture à partir de l'aperçu hors ligne :
//   apercu-pdf/JONART-apercu-desktop.pdf  (largeur 1440 px)
//   apercu-pdf/JONART-apercu-mobile.pdf   (largeur 390 px, type smartphone)
// Chaque page du site devient une page PDF continue, rendue comme à l'écran.
import { chromium } from 'playwright-core';
import { PDFDocument } from 'pdf-lib';
import { mkdir, writeFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = resolve('dist-preview');
const OUT = resolve('apercu-pdf');
const PAGES = [
  'index.html', 'presentation.html', 'realisations.html', 'devis.html', 'instagram.html',
  'es.html', 'es/presupuesto.html',
];
const FORMATS = [
  { name: 'desktop', width: 1440, height: 900, mobile: false },
  { name: 'mobile', width: 390, height: 844, mobile: true },
];

// Chromium : celui de Playwright s'il est installé, sinon chemin fourni par CHROMIUM_PATH.
async function findChromium() {
  const candidates = [process.env.CHROMIUM_PATH, '/opt/pw-browsers/chromium'].filter(Boolean);
  for (const c of candidates) { try { await access(c); return c; } catch {} }
  return undefined; // playwright-core cherchera un navigateur installé (npx playwright install chromium)
}

const browser = await chromium.launch({ executablePath: await findChromium() });
await mkdir(OUT, { recursive: true });

for (const f of FORMATS) {
  const merged = await PDFDocument.create();
  const ctx = await browser.newContext({
    viewport: { width: f.width, height: f.height },
    deviceScaleFactor: 1,
    isMobile: f.mobile,
    hasTouch: f.mobile,
  });
  const page = await ctx.newPage();
  await page.emulateMedia({ media: 'screen' });

  for (const p of PAGES) {
    await page.goto(pathToFileURL(resolve(ROOT, p)).href, { waitUntil: 'load' });
    // Force le chargement des images différées, puis attend polices et images.
    await page.evaluate(async () => {
      document.querySelectorAll('img[loading="lazy"]').forEach((img) => { img.loading = 'eager'; });
      await document.fonts.ready;
      await Promise.all([...document.images].map((img) => img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; })));
    });
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    const pdf = await page.pdf({
      width: `${f.width}px`,
      height: `${height + 2}px`,
      printBackground: true,
      pageRanges: '1',
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
    const doc = await PDFDocument.load(pdf);
    const [copied] = await merged.copyPages(doc, [0]);
    merged.addPage(copied);
  }
  const file = resolve(OUT, `JONART-apercu-${f.name}.pdf`);
  await writeFile(file, await merged.save());
  console.log(`✓ PDF ${f.name} : ${file}`);
  await ctx.close();
}
await browser.close();
