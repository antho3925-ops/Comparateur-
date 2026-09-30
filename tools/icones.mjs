#!/usr/bin/env node
// Dessine les icones de l'application installee (ecran d'accueil) a partir
// du sceau STF de l'en-tete, rendu par Chromium.
//   node tools/icones.mjs  ->  assets/icones/*.png
let chromium;
try { ({ chromium } = await import('playwright')); }
catch { ({ chromium } = await import('/opt/node22/lib/node_modules/playwright/index.mjs')); }

// « marge » : part du cote reservee autour du sceau. L'icone « maskable »
// garde le sceau dans la zone sure (80 % central) que les lanceurs Android
// peuvent rogner en cercle ou en goutte.
const ICONES = [
  { fichier: 'icone-192.png', taille: 192, marge: 0.16 },
  { fichier: 'icone-512.png', taille: 512, marge: 0.16 },
  { fichier: 'icone-maskable-512.png', taille: 512, marge: 0.26 },
  { fichier: 'apple-touch-icon.png', taille: 180, marge: 0.14 },
];

const page = (taille, marge) => `<!doctype html><html><body style="margin:0">
<div style="width:${taille}px;height:${taille}px;display:grid;place-items:center;
  background:radial-gradient(${taille}px ${taille * 0.55}px at 20% -10%, rgba(201,169,97,.28), transparent 65%),
             linear-gradient(170deg,#12203a 0%,#060d18 100%)">
  <div style="width:${taille * (1 - 2 * marge)}px;height:${taille * (1 - 2 * marge)}px;
    border-radius:${taille * 0.14}px;display:grid;place-items:center;
    background:linear-gradient(150deg,#e3ce97,#8a7340);
    box-shadow:inset 0 ${taille * 0.01}px 0 rgba(255,255,255,.45),0 ${taille * 0.02}px ${taille * 0.06}px rgba(0,0,0,.35)">
    <span style="font-family:'Palatino Linotype',Palatino,Georgia,'Times New Roman',serif;font-weight:700;
      color:#0a1628;font-size:${taille * (1 - 2 * marge) * 0.36}px;letter-spacing:.05em">STF</span>
  </div></div></body></html>`;

const b = await chromium.launch();
for (const { fichier, taille, marge } of ICONES) {
  const p = await b.newPage({ viewport: { width: taille, height: taille } });
  await p.setContent(page(taille, marge));
  await p.screenshot({ path: `assets/icones/${fichier}`, omitBackground: false });
  await p.close();
  console.log(`assets/icones/${fichier}  ${taille}x${taille}`);
}
await b.close();
