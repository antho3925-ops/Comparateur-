import { icon } from './icons.js';
import { loadData } from './store.js';
import { initPage, finishPage, articleCard, catVisual, reveal, showError, vendusEnBas } from './layout.js';
import { esc, norm, pub, qs, qsa } from './util.js';

initPage('catalogue');
const main = document.getElementById('main');

// Filtres facultatifs, affichés seulement si au moins un article a le champ.
const FACETTES = [['stockage', 'Stockage'], ['couleur', 'Couleur'], ['matiere', 'Matière']];
const SETS = ['cat', 'marque', ...FACETTES.map(([k]) => k)];

function lireUrl() {
  const p = new URLSearchParams(location.search);
  const s = { q: p.get('q') || '', min: p.get('min') || '', max: p.get('max') || '', dispo: p.get('dispo') || 'tous', tri: p.get('tri') || 'recent' };
  for (const k of SETS) s[k] = new Set((p.get(k) || '').split(',').filter(Boolean));
  return s;
}

function ecrireUrl(s) {
  const p = new URLSearchParams();
  if (s.q) p.set('q', s.q);
  for (const k of SETS) if (s[k].size) p.set(k, [...s[k]].join(','));
  if (s.min) p.set('min', s.min);
  if (s.max) p.set('max', s.max);
  if (s.dispo !== 'tous') p.set('dispo', s.dispo);
  if (s.tri !== 'recent') p.set('tri', s.tri);
  const qsStr = p.toString();
  history.replaceState(null, '', location.pathname + (qsStr ? '?' + qsStr : ''));
}

const texteRecherche = (a) => norm([a.titre, pub(a.marque), a.type, a.categorie?.nom, pub(a.specs), pub(a.couleur), pub(a.stockage), pub(a.matiere)].filter(Boolean).join(' '));

function filtrer(articles, s, sauf) {
  const mots = norm(s.q).split(/\s+/).filter(Boolean);
  const min = s.min === '' ? null : Number(s.min);
  const max = s.max === '' ? null : Number(s.max);
  return articles.filter((a) => {
    if (sauf !== 'cat' && s.cat.size && !s.cat.has(a.categorie?.slug)) return false;
    if (sauf !== 'marque' && s.marque.size && !s.marque.has(pub(a.marque))) return false;
    for (const [k] of FACETTES) if (sauf !== k && s[k].size && !s[k].has(pub(a[k]))) return false;
    if (min != null && !(Number(a.prix) >= min)) return false;
    if (max != null && !(Number(a.prix) <= max)) return false;
    if (s.dispo === 'dispo' && !a.disponible) return false;
    if (s.dispo === 'vendus' && a.disponible) return false;
    if (mots.length) { const t = a._t ??= texteRecherche(a); if (!mots.every((m) => t.includes(m))) return false; }
    return true;
  });
}

function trier(list, tri) {
  const cmp = {
    'prix-asc': (x, y) => (x.prix ?? Infinity) - (y.prix ?? Infinity),
    'prix-desc': (x, y) => (y.prix ?? -Infinity) - (x.prix ?? -Infinity),
    recent: (x, y) => String(y.created_at).localeCompare(String(x.created_at)),
  }[tri] || (() => 0);
  return vendusEnBas([...list].sort(cmp));
}

// Valeurs proposées pour un filtre, calculées sur les articles retenus par
// les autres filtres (les filtres se combinent).
function valeurs(articles, s, k, get) {
  const m = new Map();
  for (const a of filtrer(articles, s, k)) { const v = get(a); if (v) m.set(v, (m.get(v) || 0) + 1); }
  for (const v of s[k]) if (!m.has(v)) m.set(v, 0);
  return [...m].sort((x, y) => x[0].localeCompare(y[0], 'fr'));
}

const chips = (k, items, s, label = (v) => v) => `
  <div class="chips">${items.map(([v, n]) => `
    <label class="fchip${s[k].has(v) ? ' on' : ''}">
      <input type="checkbox" data-set="${k}" value="${esc(v)}"${s[k].has(v) ? ' checked' : ''}>
      ${label(v)} <small>${n}</small>
    </label>`).join('')}
  </div>`;

try {
  const data = await loadData();
  const { categories, articles } = data;
  const catParSlug = new Map(categories.map((c) => [c.slug, c]));
  const s = lireUrl();

  main.innerHTML = `
    <div id="cat-banner"></div>
    <div class="wrap catalogue">
      <div class="toolbar">
        <label class="search">${icon('search')}
          <input id="q" type="search" placeholder="Rechercher : iPhone, perceuse, PS5…" value="${esc(s.q)}" autocomplete="off" enterkeyhint="search">
        </label>
        <div class="toolbar-row">
          <button class="btn btn-outline btn-sm filters-btn" type="button" id="open-filters">${icon('filter')}Filtres <span id="nb-filtres"></span></button>
          <label class="sort">Trier
            <select id="tri">
              <option value="recent">Nouveautés</option>
              <option value="prix-asc">Prix croissant</option>
              <option value="prix-desc">Prix décroissant</option>
            </select>
          </label>
        </div>
      </div>
      <div class="cat-layout">
        <aside class="filters" id="filters" aria-label="Filtres"></aside>
        <section>
          <p class="results-count" id="count" aria-live="polite"></p>
          <div class="grid" id="results"></div>
        </section>
      </div>
    </div>`;

  const elQ = qs('#q'), elTri = qs('#tri'), elFilters = qs('#filters');
  elTri.value = s.tri;

  const nbActifs = () => SETS.reduce((n, k) => n + s[k].size, 0) + (s.min ? 1 : 0) + (s.max ? 1 : 0) + (s.dispo !== 'tous' ? 1 : 0);

  function renderBanner() {
    const el = qs('#cat-banner');
    const c = s.cat.size === 1 ? catParSlug.get([...s.cat][0]) : null;
    if (!c) { el.innerHTML = ''; return; }
    const n = articles.filter((a) => a.categorie?.slug === c.slug && a.disponible).length;
    el.innerHTML = `
      <div class="cat-banner${c.image_url ? ' has-img' : ''}">
        <div class="wrap cat-banner-in anim-icon">
          <span class="cat-banner-visual">${catVisual(c)}</span>
          <div><h1>${esc(c.nom)}</h1><p>${n} article${n > 1 ? 's' : ''} disponible${n > 1 ? 's' : ''}</p></div>
        </div>
      </div>`;
  }

  function renderFilters() {
    const marques = valeurs(articles, s, 'marque', (a) => pub(a.marque));
    const cats = valeurs(articles, s, 'cat', (a) => a.categorie?.slug);
    const facettes = FACETTES.map(([k, label]) => [k, label, valeurs(articles, s, k, (a) => pub(a[k]))]).filter(([, , v]) => v.length);
    elFilters.innerHTML = `
      <div class="filters-head">
        <h2>Filtres</h2>
        <button class="icon-btn" type="button" id="close-filters" aria-label="Fermer">${icon('x')}</button>
      </div>
      <div class="filters-body">
        <fieldset><legend>Catégorie</legend>
          ${chips('cat', cats.filter(([v]) => catParSlug.has(v)), s, (v) => esc(catParSlug.get(v).nom))}
        </fieldset>
        <fieldset><legend>Disponibilité</legend>
          <div class="seg">
            ${[['tous', 'Tous'], ['dispo', 'Disponibles'], ['vendus', 'Vendus']].map(([v, l]) => `
              <label class="${s.dispo === v ? 'on' : ''}"><input type="radio" name="dispo" value="${v}"${s.dispo === v ? ' checked' : ''}>${l}</label>`).join('')}
          </div>
        </fieldset>
        <fieldset><legend>Prix (€)</legend>
          <div class="price-range">
            <input type="number" inputmode="numeric" min="0" id="min" placeholder="Min" value="${esc(s.min)}" aria-label="Prix minimum">
            <span>à</span>
            <input type="number" inputmode="numeric" min="0" id="max" placeholder="Max" value="${esc(s.max)}" aria-label="Prix maximum">
          </div>
        </fieldset>
        ${marques.length ? `<fieldset><legend>Marque</legend>${chips('marque', marques, s, esc)}</fieldset>` : ''}
        ${facettes.map(([k, label, v]) => `<fieldset><legend>${label}</legend>${chips(k, v, s, esc)}</fieldset>`).join('')}
      </div>
      <div class="filters-foot">
        <button class="btn btn-ghost" type="button" id="reset">Tout effacer</button>
        <button class="btn btn-green" type="button" id="apply"></button>
      </div>`;
  }

  function renderResults() {
    const list = trier(filtrer(articles, s), s.tri);
    const dispo = list.filter((a) => a.disponible).length;
    qs('#count').textContent = list.length
      ? `${list.length} article${list.length > 1 ? 's' : ''}${dispo !== list.length ? ` · ${dispo} disponible${dispo > 1 ? 's' : ''}` : ''}`
      : '';
    qs('#results').innerHTML = list.length ? list.map(articleCard).join('') : `
      <div class="empty">
        ${icon('search')}
        <p>Aucun article ne correspond.<br>Le stock change chaque semaine : appelez-nous, on a peut-être ce qu'il vous faut en réserve.</p>
        <button class="btn btn-outline btn-sm" type="button" data-reset>Effacer les filtres</button>
      </div>`;
    const n = nbActifs();
    qs('#nb-filtres').textContent = n ? `(${n})` : '';
    const apply = qs('#apply');
    if (apply) apply.textContent = `Voir ${list.length} article${list.length > 1 ? 's' : ''}`;
    reveal(qs('#results'));
  }

  function update({ filters = true } = {}) {
    ecrireUrl(s);
    renderBanner();
    if (filters) renderFilters();
    renderResults();
  }

  function reset() {
    for (const k of SETS) s[k].clear();
    s.min = s.max = s.q = ''; s.dispo = 'tous';
    elQ.value = '';
    update();
  }

  let t;
  elQ.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { s.q = elQ.value.trim(); update(); }, 180); });
  elTri.addEventListener('change', () => { s.tri = elTri.value; update({ filters: false }); });

  elFilters.addEventListener('change', (e) => {
    const el = e.target;
    if (el.dataset.set) { s[el.dataset.set][el.checked ? 'add' : 'delete'](el.value); }
    else if (el.name === 'dispo') s.dispo = el.value;
    else if (el.id === 'min' || el.id === 'max') s[el.id] = el.value;
    update();
  });
  const fermer = () => document.body.classList.remove('filters-open');
  document.addEventListener('click', (e) => {
    if (e.target.closest('#open-filters')) document.body.classList.add('filters-open');
    else if (e.target.closest('#close-filters, #apply')) fermer();
    else if (e.target.closest('#reset, [data-reset]')) reset();
    else if (e.target.classList.contains('filters-backdrop')) fermer();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fermer(); });
  const backdrop = document.createElement('div');
  backdrop.className = 'filters-backdrop';
  document.body.append(backdrop);

  const c1 = s.cat.size === 1 ? catParSlug.get([...s.cat][0]) : null;
  if (c1) document.title = `${c1.nom} d'occasion · Paytoocash Pontarlier`;

  update();
  finishPage(data);
} catch (e) {
  showError(main, e);
}
