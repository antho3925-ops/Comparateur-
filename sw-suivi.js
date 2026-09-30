// Fonctionnement hors connexion du suivi des contrats, une fois installe.
// Seuls les fichiers de l'application sont mis en cache ; les contrats, eux,
// restent dans le stockage du telephone et ne passent jamais par ici.
//
// Strategie « reseau d'abord » : en ligne, la derniere version publiee est
// chargee (les mises a jour arrivent seules) ; hors ligne, la copie en cache.
const CACHE = 'suivi-stf-v10';
const FICHIERS = [
  './suivi.html',
  './suivi.webmanifest',
  './assets/styles.css',
  './assets/suivi.css',
  './js/format.js',
  './js/suivi-modele.js',
  './js/suivi.js',
  './js/clavier.js',
  './assets/icones/icone-192.png',
  './assets/icones/icone-512.png',
  './assets/icones/icone-maskable-512.png',
  './assets/icones/apple-touch-icon.png',
];
const URLS = new Set(FICHIERS.map((f) => new URL(f, self.location).href));
const DELAI_RESEAU_MS = 4000;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((cles) => Promise.all(cles.filter((k) => k.startsWith('suivi-stf-') && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  url.search = '';
  url.hash = '';
  // Le reste du site (le comparateur) n'est pas concerne.
  if (e.request.method !== 'GET' || !URLS.has(url.href)) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const reponse = await Promise.race([
        fetch(e.request),
        new Promise((_, rejet) => setTimeout(() => rejet(new Error('delai')), DELAI_RESEAU_MS)),
      ]);
      if (reponse.ok) cache.put(url.href, reponse.clone());
      return reponse;
    } catch {
      const copie = await cache.match(url.href);
      if (copie) return copie;
      throw new Error('Hors connexion et pas encore en cache');
    }
  })());
});
