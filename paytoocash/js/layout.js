// En-tête, pied de page, cartes et animations communes aux pages publiques.

import { icon, facebookLogo } from './icons.js';
import { esc, formatPrix, pub, telHref, mapsHref, facebookHref, estReserve, qs, qsa } from './util.js';

const NAV = [
  ['accueil', 'index.html', 'Accueil'],
  ['catalogue', 'catalogue.html', 'Catalogue'],
  ['rachat', 'rachat.html', 'On rachète'],
];

export function renderHeader(active) {
  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML = `
    <div class="wrap header-in">
      <a class="brand" href="index.html" aria-label="Paytoocash, accueil">
        <img src="paytoocash-logo/logo.svg" alt="Paytoocash" width="190" height="48">
      </a>
      <nav class="nav" id="nav" aria-label="Navigation principale">
        ${NAV.map(([k, href, label]) => `<a href="${href}"${k === active ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
      </nav>
      <a class="btn btn-gold btn-sm header-call" data-tel href="#">${icon('phone')}<span>Appeler</span></a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav" aria-label="Menu">${icon('menu')}</button>
    </div>`;
  document.body.prepend(header);
  const btn = qs('.menu-btn', header);
  btn.addEventListener('click', () => {
    const open = header.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
}

export function renderFooter(b) {
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `
    <div class="wrap footer-in">
      <div>
        <img class="footer-logo" src="paytoocash-logo/logo.svg" alt="Paytoocash" width="170" height="43">
        <p>${esc(pub(b.slogan) || 'Achat, vente et rachat d’occasion')}</p>
      </div>
      <ul class="footer-list">
        <li>${icon('pin')}<a href="${mapsHref(b.adresse)}" target="_blank" rel="noopener">${esc(b.adresse)}</a></li>
        <li>${icon('phone')}<a href="${telHref(b.tel)}">${esc(b.tel)}</a></li>
        ${b.email ? `<li>${icon('mail')}<a href="mailto:${esc(b.email)}">${esc(b.email)}</a></li>` : ''}
        ${b.facebook ? `<li>${facebookLogo('ico')}<a href="${esc(facebookHref(b.facebook))}" target="_blank" rel="noopener">Facebook · ${esc(b.facebook)}</a></li>` : ''}
      </ul>
      <ul class="footer-links">
        ${NAV.map(([, href, label]) => `<li><a href="${href}">${label}</a></li>`).join('')}
        <li><a href="mentions-legales.html">Mentions légales</a></li>
      </ul>
    </div>
    <p class="wrap footer-copy">© ${new Date().getFullYear()} ${esc(b.nom || 'Paytoocash')} · Pontarlier</p>`;
  document.body.append(footer);
}

// Met à jour les liens qui dépendent des infos du magasin.
export function applyBoutique(b) {
  qsa('[data-tel]').forEach((a) => { a.href = telHref(b.tel); });
}

export function catVisual(c, cls = '') {
  if (c?.image_url) return `<img class="cat-img ${cls}" src="${esc(c.image_url)}" alt="" loading="lazy">`;
  return icon(c?.icone || 'carton', cls);
}

export function categoryCard(c, count) {
  return `
    <a class="cat-card reveal anim-icon" href="catalogue.html?cat=${encodeURIComponent(c.slug)}">
      <span class="cat-icon">${catVisual(c)}</span>
      <span class="cat-name">${esc(c.nom)}</span>
      <span class="cat-count">${count} article${count > 1 ? 's' : ''}</span>
    </a>`;
}

export function photoOrPlaceholder(a, cls = '', eager = false) {
  const src = a.photos?.[0];
  const ph = `<span class="ph ${cls}">${icon(a.categorie?.icone || 'carton')}</span>`;
  if (!src) return ph;
  return `<img class="${cls}" src="${esc(src)}" alt="${esc(a.titre)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" data-fallback="${esc(a.categorie?.icone || 'carton')}">`;
}

export function articleCard(a) {
  const etat = pub(a.etat);
  return `
    <a class="card reveal anim-icon${a.disponible ? '' : ' is-sold'}" href="article.html?id=${encodeURIComponent(a.id)}">
      <div class="card-media">
        ${photoOrPlaceholder(a)}
        ${a.disponible ? '' : '<span class="badge-sold">Vendu</span>'}
        ${estReserve(a) ? '<span class="badge-sold badge-reserved">Réservé</span>' : ''}
        ${a.categorie ? `<span class="card-cat" title="${esc(a.categorie.nom)}">${catVisual(a.categorie)}</span>` : ''}
      </div>
      <div class="card-body">
        <p class="card-brand">${esc(pub(a.marque) || a.categorie?.nom || '')}</p>
        <h3 class="card-title">${esc(a.titre)}</h3>
        <div class="card-foot">
          <span class="price">${formatPrix(a.prix)}</span>
          ${a.garantie === true && a.disponible ? `<span class="chip chip-green">${icon('shield')}Garanti</span>` : ''}
        </div>
        ${etat ? `<p class="card-state">${esc(etat)}</p>` : ''}
      </div>
    </a>`;
}

// Disponibles d'abord, vendus en bas.
export const vendusEnBas = (list) => [...list].sort((x, y) => Number(!x.disponible) - Number(!y.disponible));

let observer;
export function reveal(root = document) {
  const els = qsa('.reveal:not(.in)', root);
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach((el) => el.classList.add('in'));
    return;
  }
  observer ??= new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); observer.unobserve(e.target); }
  }, { rootMargin: '0px 0px -5% 0px' });
  els.forEach((el, i) => { el.style.transitionDelay = `${Math.min(i % 8, 7) * 40}ms`; observer.observe(el); });
}

function setupGlobalBehaviours() {
  // Photo manquante : on affiche l'icône de la catégorie à la place.
  document.addEventListener('error', (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || !img.dataset.fallback) return;
    const span = document.createElement('span');
    span.className = 'ph ' + img.className;
    span.innerHTML = icon(img.dataset.fallback);
    img.replaceWith(span);
  }, true);

  // Clic sur un article : la carte s'agrandit jusqu'à remplir l'écran, puis la fiche s'ouvre.
  document.addEventListener('click', (e) => {
    const lien = e.target.closest?.('a.card');
    if (!lien || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey
      || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    e.preventDefault();
    const r = lien.getBoundingClientRect();
    const img = lien.querySelector('.card-media img');
    const z = document.createElement('div');
    z.className = 'zoom-tr';
    z.innerHTML = `<div class="zoom-media">${img ? `<img src="${esc(img.currentSrc || img.src)}" alt="">` : ''}</div>`;
    document.body.append(z);
    const de = { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, borderRadius: '14px' };
    const vers = { left: '0px', top: '0px', width: `${innerWidth}px`, height: `${innerHeight}px`, borderRadius: '0px' };
    const anim = z.animate([de, vers], { duration: 480, easing: 'cubic-bezier(.65, 0, .2, 1)', fill: 'forwards' });
    try { sessionStorage.setItem('zoom-tr', '1'); } catch {}
    anim.finished.then(() => { location.href = lien.href; });
  });
  // Retour arrière depuis la fiche : on retire l'agrandissement resté affiché.
  addEventListener('pageshow', () => document.querySelectorAll('.zoom-tr').forEach((x) => x.remove()));

  // Animation des icônes au toucher (le survol ne fonctionne pas au doigt).
  document.addEventListener('touchstart', (e) => {
    const el = e.target.closest?.('.anim-icon');
    if (!el) return;
    el.classList.remove('touched');
    void el.offsetWidth;
    el.classList.add('touched');
    setTimeout(() => el.classList.remove('touched'), 700);
  }, { passive: true });
}

export function initPage(active) {
  renderHeader(active);
  setupGlobalBehaviours();
}

export function finishPage(data) {
  renderFooter(data.boutique);
  applyBoutique(data.boutique);
  reveal();
}

export function showError(main, err) {
  console.error(err);
  main.innerHTML = `<div class="wrap empty"><p>Le catalogue n'a pas pu être chargé. Réessayez dans un instant.</p></div>`;
}
