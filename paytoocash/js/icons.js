// Icônes SVG originales, en trait fin (grille 24×24, trait = currentColor).
// Aucune marque ni personnage : les marques n'apparaissent qu'en texte.

const dot = (x, y, r = 0.9) => `<circle cx="${x}" cy="${y}" r="${r}" fill="currentColor" stroke="none"/>`;

// Icônes proposées pour les catégories (choix dans l'admin).
export const CATEGORY_ICONS = {
  smartphone: { label: 'Téléphone', svg: '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>' },
  tablette: { label: 'Tablette', svg: '<rect x="3.5" y="3" width="17" height="18" rx="2.5"/><path d="M11 18h2"/>' },
  ordinateur: { label: 'Ordinateur portable', svg: '<rect x="4.5" y="4.5" width="15" height="10.5" rx="1.5"/><path d="M2 19h20l-1.5-4h-17z"/>' },
  ecran: { label: 'Écran', svg: '<rect x="2.5" y="3.5" width="19" height="13" rx="1.5"/><path d="M12 16.5V21M8.5 21h7"/>' },
  tv: { label: 'Télévision', svg: '<rect x="2.5" y="7" width="19" height="13" rx="2"/><path d="M8 2.5l4 4.5 4-4.5"/>' },
  montre: { label: 'Montre', svg: '<rect x="6" y="6" width="12" height="12" rx="3.2"/><path d="M9 6l.8-3.5h4.4L15 6M9 18l.8 3.5h4.4L15 18M12 9.5V12l1.8 1.3"/>' },
  casque: { label: 'Casque audio', svg: '<path d="M4 15.5V12a8 8 0 0 1 16 0v3.5"/><rect x="3" y="14" width="4.5" height="7" rx="1.6"/><rect x="16.5" y="14" width="4.5" height="7" rx="1.6"/>' },
  enceinte: { label: 'Enceinte', svg: `<rect x="5.5" y="2.5" width="13" height="19" rx="2.5"/><circle cx="12" cy="14.5" r="3.6"/>${dot(12, 7, 1.2)}` },
  perceuse: { label: 'Perceuse', svg: '<path d="M3.5 6h10.5a2.5 2.5 0 0 1 2.5 2.5v.5a2.5 2.5 0 0 1-2.5 2.5H3.5z"/><path d="M16.5 8.75H21M3.5 6v5.5"/><path d="M7 11.5 6 21h5l1-9.5"/><path d="M10 14.5h1.5"/>' },
  outils: { label: 'Outils', svg: '<path d="M14.5 6.5a4 4 0 0 0 5 5l-9 9a2.1 2.1 0 0 1-3-3l9-9a4 4 0 0 0-2-2z"/><path d="M14.5 6.5 17 4l3 3-2.5 2.5"/>' },
  trottinette: { label: 'Trottinette', svg: '<circle cx="5.5" cy="18" r="2.5"/><circle cx="18.5" cy="18" r="2.5"/><path d="M8 18h8M18.5 18 15 4M12.5 4h5"/>' },
  velo: { label: 'Vélo', svg: '<circle cx="5.5" cy="16.5" r="3.5"/><circle cx="18.5" cy="16.5" r="3.5"/><path d="M5.5 16.5 9 9h7l2.5 7.5M9 9l3.5 7.5h-7M14.5 6H17l-1 3"/>' },
  electromenager: { label: 'Électroménager', svg: `<rect x="4" y="2.5" width="16" height="19" rx="2"/><path d="M4 7h16"/><circle cx="12" cy="14" r="4.3"/>${dot(7.2, 4.8, 0.8)}${dot(10, 4.8, 0.8)}` },
  cuisine: { label: 'Cuisine', svg: '<path d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M2 12h2M20 12h2M9 6.5c0-1 1-1.5 1-2.5M14 6.5c0-1 1-1.5 1-2.5"/>' },
  manette: { label: 'Manette', svg: `<path d="M7 7h10a4.6 4.6 0 0 1 4.5 5.6l-.9 4.2a2.6 2.6 0 0 1-4.5 1.2L14.4 16H9.6L7.9 18a2.6 2.6 0 0 1-4.5-1.2l-.9-4.2A4.6 4.6 0 0 1 7 7z"/><path d="M8 10v4M6 12h4"/>${dot(15.8, 10.8)}${dot(17.6, 12.8)}` },
  console_portable: { label: 'Console portable rétro', svg: `<rect x="5.5" y="2" width="13" height="20" rx="2.2"/><rect x="8" y="4.5" width="8" height="6.5" rx="1"/><path d="M8 15.5h3M9.5 14v3"/>${dot(15.3, 14.6)}${dot(13.9, 16.9)}` },
  casque_vr: { label: 'Casque VR', svg: '<path d="M4.5 8h15A2.5 2.5 0 0 1 22 10.5v4a2.5 2.5 0 0 1-2.5 2.5h-4l-1.6-2.2a2.3 2.3 0 0 0-3.8 0L8.5 17h-4A2.5 2.5 0 0 1 2 14.5v-4A2.5 2.5 0 0 1 4.5 8z"/><path d="M7 8 8.5 5h7L17 8"/>' },
  musique: { label: 'Musique', svg: '<path d="M9 18V5.5l11-2.5v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>' },
  jardin: { label: 'Jardin', svg: '<path d="M12 21v-9"/><path d="M12 12C12 7 8.5 4 4 4c0 5 3.5 8 8 8z"/><path d="M12 14.5c0-4.2 3-7 8-7 0 4.5-3 7-8 7z"/>' },
  photo: { label: 'Appareil photo', svg: '<path d="M3 8.5A2 2 0 0 1 5 6.5h2.5L9 4h6l1.5 2.5H19a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3.8"/>' },
  diamant: { label: 'Diamant', svg: '<path d="M6 3.5h12L21.5 9 12 21 2.5 9z"/><path d="M2.5 9h19M9.5 3.5 8 9l4 12 4-12-1.5-5.5"/>' },
  bague: { label: 'Bague', svg: '<circle cx="12" cy="15" r="6"/><path d="M9 5.5 10.5 3h3L15 5.5 12 9z"/>' },
  vetement: { label: 'Vêtements', svg: '<path d="M8.5 3 3 6l2 4.2 2.5-1.2V21h9V9l2.5 1.2L21 6l-5.5-3a3.5 3.5 0 0 1-7 0z"/>' },
  meuble: { label: 'Meubles', svg: '<path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/><path d="M3 13a2 2 0 0 1 4 0v1h10v-1a2 2 0 0 1 4 0v5H3z"/><path d="M5 18v2.5M19 18v2.5"/>' },
  livre: { label: 'Livres', svg: '<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5z"/><path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H20v-3"/>' },
  voiture: { label: 'Auto', svg: '<path d="M3 16v-3.5l2-5A2 2 0 0 1 6.9 6h10.2a2 2 0 0 1 1.9 1.5l2 5V16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M3 12.5h18"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>' },
  sport: { label: 'Sport', svg: '<circle cx="12" cy="12" r="9"/><path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18M3 12h18"/>' },
  jouet: { label: 'Jouets', svg: '<rect x="4" y="9" width="16" height="11" rx="2"/><path d="M8 9V6.5a4 4 0 0 1 8 0V9"/><path d="M12 13v3"/>' },
  cartes: { label: 'Cartes à collectionner', svg: '<rect x="3" y="6" width="11" height="15" rx="1.6" transform="rotate(-10 8.5 13.5)"/><rect x="10" y="3" width="11" height="15" rx="1.6" transform="rotate(8 15.5 10.5)"/><path d="m15.6 7.4.9 1.9 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z"/>' },
  carton: { label: 'Divers', svg: '<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/>' },
  etiquette: { label: 'Étiquette', svg: `<path d="M3 12.5V4a1 1 0 0 1 1-1h8.5l8.5 8.5-8.5 8.5z"/>${dot(7.5, 7.5, 1.3)}` },
};

// Icônes de l'interface.
const UI = {
  phone: '<path d="M5 3h3.5l1.8 4.5-2.3 1.4a11 11 0 0 0 7.1 7.1l1.4-2.3L21 15.5V19a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
  whatsapp: '<path d="M4.5 19.5 5.6 16A8 8 0 1 1 8.4 18.6z"/><path d="M9.2 8.6c.3-.6.9-.6 1.1 0l.5 1.3c.1.3 0 .6-.2.8l-.4.4a5 5 0 0 0 2.6 2.6l.4-.4c.2-.2.5-.3.8-.2l1.3.5c.6.2.6.8 0 1.1-1.6 1-5.2-.6-6.4-3.4-.4-1-.2-2 .3-2.7z"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4M9 14.5l2 2 4-4"/>',
  message: '<path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1z"/><path d="M8 10h8M8 13h5"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>',
  social: '<circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="m8.2 10.8 7.6-4M8.2 13.2l7.6 4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  filter: '<path d="M3 5h18l-7 8.5V19l-4 2v-7.5z"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  shield: '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  back: '<path d="M15 5 8 12l7 7"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="9.5" r="1.8"/><path d="m21 16-5.5-5.5L5 20"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  cash: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>',
  sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  id: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2.2"/><path d="M5.5 16a3.5 3.5 0 0 1 7 0M14.5 10h4M14.5 13.5h3"/>',
  store: '<path d="M4 10v10h16V10"/><path d="M3 10 5 4h14l2 6c0 1.4-1.3 2.5-3 2.5S15 11.4 15 10c0 1.4-1.3 2.5-3 2.5S9 11.4 9 10c0 1.4-1.3 2.5-3 2.5S3 11.4 3 10z"/><path d="M10 20v-5h4v5"/>',
  tag: CATEGORY_ICONS.etiquette.svg,
  logout: '<path d="M9 4H5v16h4M16 8l4 4-4 4M10 12h10"/>',
  up: '<path d="m6 15 6-6 6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1L3.2 9.4l6.1-.8z"/>',
  alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4"/><circle cx="12" cy="17" r=".9" fill="currentColor" stroke="none"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
};

export function icon(name, cls = '') {
  const body = UI[name] ?? CATEGORY_ICONS[name]?.svg ?? CATEGORY_ICONS.carton.svg;
  return `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

// Icône par défaut des catégories du catalogue de départ.
export const ICONES_PAR_DEFAUT = {
  'Informatique': 'ordinateur',
  'TV et image': 'tv',
  'Montres connectées': 'montre',
  'Audio': 'casque',
  'Outillage pro': 'perceuse',
  'Mobilité électrique': 'trottinette',
  'Électroménager': 'electromenager',
  'Gaming': 'manette',
  'Téléphones': 'smartphone',
  'Tablettes': 'tablette',
  'Musique': 'musique',
  'Jardin': 'jardin',
  'Photo': 'photo',
  'Bijoux': 'diamant',
  'Rétro gaming': 'console_portable',
  'Cartes à collectionner': 'cartes',
};
