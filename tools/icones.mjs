#!/usr/bin/env node
// Dessine les icones de l'application installee (ecran d'accueil) :
// tuile doree « Suivi » aux couleurs de l'en-tete, rendue par Chromium.
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

// Tuile doree portant le mot « Suivi » et une courbe montante.
const page = (taille, marge) => {
  const cote = taille * (1 - 2 * marge);
  return `<!doctype html><html><body style="margin:0">
<div style="width:${taille}px;height:${taille}px;display:grid;place-items:center;
  background:radial-gradient(${taille}px ${taille * 0.55}px at 20% -10%, rgba(201,169,97,.28), transparent 65%),
             linear-gradient(170deg,#12203a 0%,#060d18 100%)">
  <div style="width:${cote}px;height:${cote}px;border-radius:${taille * 0.14}px;
    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${cote * 0.04}px;
    background:linear-gradient(150deg,#e3ce97,#8a7340);
    box-shadow:inset 0 ${taille * 0.01}px 0 rgba(255,255,255,.45),0 ${taille * 0.02}px ${taille * 0.06}px rgba(0,0,0,.35)">
    <svg width="${cote * 0.62}" height="${cote * 0.26}" viewBox="0 0 62 26" fill="none">
      <polyline points="3,22 17,14 28,18 44,6 57,4" stroke="#0a1628" stroke-width="3.6"
        stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="57" cy="4" r="3.6" fill="#0a1628"/>
    </svg>
    <span style="font-family:'Palatino Linotype',Palatino,Georgia,'Times New Roman',serif;font-weight:700;
      color:#0a1628;font-size:${cote * 0.27}px;letter-spacing:.02em;line-height:1">Suivi</span>
  </div></div></body></html>`;
};

const b = await chromium.launch();
for (const { fichier, taille, marge } of ICONES) {
  const p = await b.newPage({ viewport: { width: taille, height: taille } });
  await p.setContent(page(taille, marge));
  await p.screenshot({ path: `assets/icones/${fichier}`, omitBackground: false });
  await p.close();
  console.log(`assets/icones/${fichier}  ${taille}x${taille}`);
}
await b.close();
