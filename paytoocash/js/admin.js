// Administration Paytoocash : articles, catégories, infos du magasin.

import { CONFIG } from './config.js';
import { icon, CATEGORY_ICONS, ICONES_PAR_DEFAUT } from './icons.js';
import { creerClientDemo } from './demo-client.js';
import { isConfigured, getClient, loadFromSupabase, loadSeed, seedToData, relier, ARTICLE_FIELDS, HORAIRES_PAR_DEFAUT } from './store.js';
import { esc, formatPrix, aConfirmer, aVerifier, slugify, norm, cap, reduire, estReserve, heureFin, telHref, whatsappHref, qs, qsa } from './util.js';

const app = qs('#app');
const dlg = qs('#dlg');
let sb = null;
let state = { categories: [], articles: [], boutique: {}, reservations: [], estimations: [] };
let tab = 'articles';
let recherche = '';
let readonly = false;
let demo = false;

// ---------- Petits outils d'interface ----------

function toast(msg, type = 'ok') {
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  document.body.append(t);
  setTimeout(() => t.classList.add('out'), type === 'err' ? 5000 : 2600);
  setTimeout(() => t.remove(), type === 'err' ? 5400 : 3000);
}

const pastille = (show = true) => (show ? '<span class="pastille">à vérifier</span>' : '');

async function busy(btn, fn) {
  const label = btn?.innerHTML;
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>Patientez…'; }
  try { return await fn(); }
  catch (e) { console.error(e); toast(messageErreur(e), 'err'); }
  finally { if (btn && btn.isConnected) { btn.disabled = false; btn.innerHTML = label; } }
}

function messageErreur(e) {
  const m = e?.message || String(e);
  if (/row-level security|permission|not authorized|403/i.test(m)) return "Action refusée : ce compte n'a pas les droits administrateur.";
  if (/Failed to fetch|NetworkError/i.test(m)) return 'Connexion impossible. Vérifiez le réseau et réessayez.';
  if (/duplicate key/i.test(m)) return 'Ce nom existe déjà.';
  return 'Erreur : ' + m;
}

function catVisual(c) {
  if (c?.image_url) return `<img class="cat-img" src="${esc(c.image_url)}" alt="">`;
  return icon(c?.icone || 'carton');
}

// ---------- Photos ----------

async function envoyer(file, dossier, nom) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = nom ? `${dossier}/${nom}` : `${dossier}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await sb.storage.from(CONFIG.BUCKET).upload(path, file, { contentType: file.type || undefined, cacheControl: '31536000', upsert: Boolean(nom) });
  if (error) throw error;
  return sb.storage.from(CONFIG.BUCKET).getPublicUrl(path).data.publicUrl;
}

function cheminStockage(url) {
  const marker = `/storage/v1/object/public/${CONFIG.BUCKET}/`;
  const i = String(url || '').indexOf(marker);
  return i < 0 ? null : decodeURIComponent(url.slice(i + marker.length).split('?')[0]);
}

async function supprimerFichiers(urls) {
  const paths = urls.map(cheminStockage).filter(Boolean);
  if (paths.length) await sb.storage.from(CONFIG.BUCKET).remove(paths);
}

// ---------- Démarrage ----------

async function demarrer() {
  if (!isConfigured()) return modeDemo();
  sb = await getClient();
  const { data: { session } } = await sb.auth.getSession();
  if (session) await apresConnexion();
  else ecranConnexion();
}

// Sans Supabase : l'admin complète tourne sur une base de démonstration en mémoire.
async function modeDemo() {
  demo = true;
  sb = creerClientDemo(seedToData(await loadSeed()));
  await recharger();
  coquille();
}

function ecranConnexion(msg = '') {
  const avecEmail = !CONFIG.ADMIN_EMAIL;
  app.innerHTML = `
    <div class="login">
      <form class="login-card" id="login">
        <img src="paytoocash-logo/logo.svg" alt="Paytoocash" width="210" height="53">
        <h1>Administration</h1>
        ${msg ? `<p class="form-err">${esc(msg)}</p>` : ''}
        <label class="field ${avecEmail ? '' : 'hidden'}"><span>E-mail</span>
          <input type="email" name="email" autocomplete="username" value="${esc(CONFIG.ADMIN_EMAIL)}" ${avecEmail ? 'required' : ''}>
        </label>
        <label class="field"><span>Mot de passe</span>
          <input type="password" name="password" autocomplete="current-password" required autofocus>
        </label>
        <button class="btn btn-green btn-lg" type="submit">Se connecter</button>
        <a class="muted small" href="index.html">← Retour au site</a>
      </form>
    </div>`;
  qs('#login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    await busy(e.submitter, async () => {
      const { error } = await sb.auth.signInWithPassword({ email: String(f.get('email')).trim(), password: String(f.get('password')) });
      if (error) return ecranConnexion('Mot de passe incorrect.');
      await apresConnexion();
    });
  });
}

async function apresConnexion() {
  app.innerHTML = '<div class="loader"></div>';
  const { data: ok, error } = await sb.rpc('is_admin');
  if (error || !ok) {
    await sb.auth.signOut();
    return ecranConnexion(error ? "Base non initialisée : exécutez supabase/schema.sql (voir SUPABASE.md)." : "Ce compte n'est pas administrateur.");
  }
  await recharger();
  if (!state.categories.length && !state.articles.length) await importer();
  coquille();
}

async function recharger() {
  const depuis = new Date(Date.now() - 30 * 864e5).toISOString();
  const [data, r, e] = await Promise.all([
    loadFromSupabase(sb),
    sb.from('reservations').select('*').gte('created_at', depuis).order('created_at', { ascending: false }),
    sb.from('estimations').select('*').order('created_at', { ascending: false }).limit(200),
  ]);
  state = relier(data);
  // Tables absentes si le bloc « Ajouts » de schema.sql n'a pas été exécuté.
  state.reservations = r.error ? [] : r.data;
  state.estimations = e.error ? [] : e.data;
}

const reservationsActives = () => state.reservations.filter((r) => !r.annulee && new Date(r.expire_at) > new Date());
const nbDemandes = () => reservationsActives().length + state.estimations.filter((x) => !x.traitee).length;

// ---------- Import initial du JSON ----------

async function importer() {
  app.innerHTML = `
    <div class="login"><div class="login-card">
      <h1>Premier lancement</h1>
      <p>Import du catalogue de départ et des photos…</p>
      <div class="progress"><div id="bar"></div></div>
      <p class="muted small" id="step"></p>
    </div></div>`;
  const bar = qs('#bar'), step = qs('#step');
  const seed = await loadSeed();
  const data = seedToData(seed);
  const total = data.articles.length + 2;
  let n = 0;
  const avance = (txt) => { n++; bar.style.width = `${Math.round((n / total) * 100)}%`; step.textContent = txt; };

  const photoLocale = async (chemin, dossier) => {
    try {
      const r = await fetch(chemin);
      if (!r.ok) return null;
      const blob = await r.blob();
      const nom = chemin.split('/').pop();
      return await envoyer(new File([blob], nom, { type: blob.type || 'image/jpeg' }), dossier, nom);
    } catch { return null; }
  };

  const { data: cats, error: e1 } = await sb.from('categories')
    .insert(data.categories.map(({ nom, slug, icone, ordre }) => ({ nom, slug, icone, ordre }))).select();
  if (e1) throw e1;
  const idParSlug = Object.fromEntries(cats.map((c) => [c.slug, c.id]));
  avance('Catégories créées');

  const b = { ...data.boutique };
  b.vitrine = await Promise.all((b.vitrine || []).map(async (v) => ({ ...v, photo: (await photoLocale(v.photo, 'vitrines')) || v.photo })));
  const { error: e2 } = await sb.from('boutique').upsert({ id: 1, ...b });
  if (e2) throw e2;
  avance('Infos du magasin enregistrées');

  let sansPhoto = 0;
  for (const a of [...data.articles].sort((x, y) => x.id - y.id)) {
    const photos = [];
    for (const p of a.photos) { const url = await photoLocale(p, 'articles'); if (url) photos.push(url); }
    if (!photos.length) sansPhoto++;
    const row = Object.fromEntries(ARTICLE_FIELDS.map((k) => [k, a[k]]));
    row.categorie_id = a.categorie_id ? idParSlug[a.categorie_id] ?? null : null;
    row.photos = photos;
    row.created_at = a.created_at;
    const { error } = await sb.from('articles').insert(row);
    if (error) throw error;
    avance(a.titre);
  }
  await recharger();
  toast(`Catalogue importé : ${data.articles.length} articles${sansPhoto ? ` (${sansPhoto} sans photo trouvée)` : ''}.`);
}

// ---------- Coquille ----------

function barre(connecte = true) {
  return `
    <header class="admin-bar">
      <div class="wrap admin-bar-in">
        <img src="paytoocash-logo/logo.svg" alt="Paytoocash" width="142" height="36">
        <span class="admin-tag">Admin</span>
        <a class="btn btn-ghost btn-sm" href="index.html" target="_blank" rel="noopener">${icon('eye')}<span class="hide-xs">Voir le site</span></a>
        ${connecte && !demo ? `<button class="icon-btn" type="button" data-act="logout" aria-label="Se déconnecter" title="Se déconnecter">${icon('logout')}</button>` : ''}
      </div>
    </header>`;
}

function coquille() {
  const nbVerif = state.articles.filter((a) => aVerifier(a).length).length;
  app.innerHTML = `
    ${barre()}
    <nav class="tabs wrap" role="tablist">
      ${[['articles', 'Articles', state.articles.length], ['demandes', 'Demandes', nbDemandes()], ['categories', 'Catégories', state.categories.length], ['boutique', 'Infos du magasin', null]]
        .map(([k, l, n]) => `<button role="tab" type="button" class="tab${tab === k ? ' on' : ''}" data-tab="${k}" aria-selected="${tab === k}">${l}${n != null ? ` <small>${n}</small>` : ''}${(k === 'articles' && nbVerif) || (k === 'demandes' && n) ? '<i class="dot-warn"></i>' : ''}</button>`).join('')}
    </nav>
    ${demo ? `<div class="wrap"><p class="demo-band">${icon('alert')}<span><strong>Mode démo</strong> : tout fonctionne, mais rien n'est enregistré, et tout revient à zéro au rechargement de la page.</span></p></div>` : ''}
    <div class="wrap admin-main" id="tab-content"></div>`;
  ({ articles: renderArticles, demandes: renderDemandes, categories: renderCategories, boutique: renderBoutique })[tab]();
}

// ---------- Articles ----------

function ligneArticle(a) {
  const verif = aVerifier(a);
  return `
    <li class="row${a.disponible ? '' : ' sold'}" data-id="${esc(a.id)}">
      <div class="row-thumb">${a.photos[0] ? `<img src="${esc(a.photos[0])}" alt="" loading="lazy" onerror="this.remove()">` : ''}${icon(a.categorie?.icone || 'carton')}</div>
      <div class="row-main">
        <strong class="row-title">${esc(a.titre)}</strong>
        <span class="row-meta">${esc(a.categorie?.nom || 'Sans catégorie')} · <b>${formatPrix(a.prix) || 'prix ?'}</b>${a.disponible ? '' : ' · <span class="chip chip-grey">Vendu</span>'}${estReserve(a) ? ` · <span class="chip chip-gold">Réservé jusqu'à ${esc(heureFin(a.reserve_jusqu_au))}</span>` : ''}</span>
        ${verif.length ? `<span class="row-warn">${pastille()} ${esc(verif.join(', '))}</span>` : ''}
      </div>
      ${readonly ? '' : `
      <div class="row-actions">
        <button type="button" class="btn btn-sm ${a.disponible ? 'btn-outline' : 'btn-gold'}" data-act="vendu">${a.disponible ? 'Vendu' : 'Remettre en vente'}</button>
        <button type="button" class="icon-btn" data-act="edit" aria-label="Modifier">${icon('edit')}</button>
        <button type="button" class="icon-btn danger" data-act="delete" aria-label="Supprimer">${icon('trash')}</button>
      </div>`}
    </li>`;
}

function renderArticles() {
  const el = qs('#tab-content');
  const mots = norm(recherche).split(/\s+/).filter(Boolean);
  const list = state.articles
    .filter((a) => !mots.length || mots.every((m) => norm(`${a.titre} ${a.marque} ${a.categorie?.nom}`).includes(m)))
    .sort((x, y) => Number(!x.disponible) - Number(!y.disponible) || String(y.created_at).localeCompare(String(x.created_at)));
  const verif = list.filter((a) => aVerifier(a).length);
  const autres = list.filter((a) => !aVerifier(a).length);
  el.innerHTML = `
    <div class="admin-toolbar">
      ${readonly ? '' : `<button type="button" class="btn btn-gold btn-lg" data-act="new">${icon('plus')}Ajouter un article</button>`}
      <label class="search">${icon('search')}<input type="search" id="admin-q" placeholder="Rechercher un article" value="${esc(recherche)}"></label>
    </div>
    ${verif.length ? `
      <section class="block block-warn">
        <h2>${icon('alert')}À vérifier <small>${verif.length}</small></h2>
        <p class="muted small">Ces informations sont masquées sur le site tant qu'elles contiennent « à confirmer » (ou une note de prix). Corrigez-les pour les afficher.</p>
        <ul class="rows">${verif.map(ligneArticle).join('')}</ul>
      </section>` : ''}
    <section class="block">
      <h2>Articles <small>${autres.length}</small></h2>
      ${autres.length ? `<ul class="rows">${autres.map(ligneArticle).join('')}</ul>` : '<p class="muted">Aucun article.</p>'}
    </section>`;
  const q = qs('#admin-q');
  q.addEventListener('input', () => {
    recherche = q.value;
    const pos = q.selectionStart;
    renderArticles();
    const nq = qs('#admin-q'); nq.focus(); nq.setSelectionRange(pos, pos);
  });
}

const ETATS = ['Neuf', 'Neuf, avec facture', 'Comme neuf', 'Parfait état', 'Très bon état', 'Bon état', 'État correct', 'Pour pièces'];

function champ(nom, label, a, { type = 'text', attrs = '', full = false, hint = '' } = {}) {
  const v = a[nom] ?? '';
  const warn = aConfirmer(v);
  return `
    <label class="field${full ? ' full' : ''}${warn ? ' warn' : ''}"><span>${label}${pastille(warn)}</span>
      ${type === 'textarea'
        ? `<textarea name="${nom}" rows="2" ${attrs}>${esc(v)}</textarea>`
        : `<input type="${type}" name="${nom}" value="${esc(v)}" ${attrs}>`}
      ${hint ? `<small class="muted">${hint}</small>` : ''}
    </label>`;
}

function ouvrirArticle(a) {
  const nouveau = !a;
  a ??= { titre: '', disponible: true, photos: [], garantie: true, categorie_id: null };
  // Photos affichées dans le formulaire : existantes (url) ou nouvelles (file).
  let photos = a.photos.map((url) => ({ url }));
  const optionnels = ['type', 'specs', 'stockage', 'couleur', 'matiere', 'poids', 'ram', 'garantie_jusqu_au', 'prix_note'];
  const ouvert = optionnels.some((k) => a[k]);

  dlg.innerHTML = `
    <form class="sheet" id="art-form" novalidate>
      <header class="sheet-head">
        <h2>${nouveau ? 'Nouvel article' : 'Modifier l’article'}</h2>
        <button type="button" class="icon-btn" data-close aria-label="Fermer">${icon('x')}</button>
      </header>
      <div class="sheet-body">
        <div class="field full"><span>Photos <small class="muted">(la première est la photo principale)</small></span>
          <div class="photos" id="photos"></div>
          <label class="btn btn-outline add-photo">${icon('upload')}Ajouter des photos
            <input type="file" accept="image/*" multiple hidden id="photo-input">
          </label>
        </div>
        ${champ('titre', 'Titre *', a, { attrs: 'required maxlength="160"', full: true })}
        <div class="cols">
          ${champ('marque', 'Marque', a)}
          <label class="field"><span>Catégorie</span>
            <select name="categorie_id">
              <option value="">— Sans catégorie —</option>
              ${state.categories.map((c) => `<option value="${c.id}"${String(c.id) === String(a.categorie_id) ? ' selected' : ''}>${esc(c.nom)}</option>`).join('')}
            </select>
          </label>
          ${champ('prix', 'Prix (€) *', a, { type: 'number', attrs: 'required min="0" step="0.01" inputmode="decimal"' })}
          ${champ('etat', 'État', a, { attrs: 'list="etats"' })}
          <label class="field"><span>Garantie</span>
            <select name="garantie">
              <option value="true"${a.garantie === true ? ' selected' : ''}>Oui</option>
              <option value="false"${a.garantie === false ? ' selected' : ''}>Non</option>
              <option value=""${a.garantie == null ? ' selected' : ''}>Non précisé</option>
            </select>
          </label>
          <label class="field check"><input type="checkbox" name="facture"${a.facture ? ' checked' : ''}><span>Facture fournie</span></label>
        </div>
        ${champ('inclus', 'Ce qui est inclus', a, { full: true, hint: 'Ex. : chargeur, boîte, 1 manette' })}
        <details class="more"${ouvert ? ' open' : ''}>
          <summary>Champs optionnels</summary>
          <div class="cols">
            ${champ('type', 'Type', a, { hint: 'Ex. : Smartphone, Écran' })}
            ${champ('stockage', 'Stockage', a, { hint: 'Ex. : 256 Go' })}
            ${champ('couleur', 'Couleur', a)}
            ${champ('matiere', 'Matière', a, { hint: 'Ex. : Or 18 carats' })}
            ${champ('poids', 'Poids', a)}
            ${champ('ram', 'Mémoire vive', a)}
            ${champ('garantie_jusqu_au', "Garantie jusqu'au", a, { hint: 'Ex. : 07/2028' })}
          </div>
          ${champ('specs', 'Caractéristiques', a, { type: 'textarea', full: true })}
          ${champ('prix_note', 'Note interne sur le prix (jamais affichée)', a, { full: true })}
        </details>
        <label class="field check"><input type="checkbox" name="disponible"${a.disponible ? ' checked' : ''}><span>Disponible à la vente</span></label>
        <datalist id="etats">${ETATS.map((e) => `<option value="${e}">`).join('')}</datalist>
        <p class="form-err" id="form-err" hidden></p>
      </div>
      <footer class="sheet-foot">
        <button type="button" class="btn btn-ghost" data-close>Annuler</button>
        <button type="submit" class="btn btn-green">${icon('check')}Enregistrer</button>
      </footer>
    </form>`;

  const zone = qs('#photos', dlg);
  const dessinerPhotos = () => {
    zone.innerHTML = photos.length ? photos.map((p, i) => `
      <div class="photo">
        <img src="${esc(p.url || p.preview)}" alt="">
        ${i === 0 ? '<span class="photo-main">Principale</span>' : `<button type="button" class="photo-btn photo-first" data-i="${i}" title="Mettre en premier">${icon('star')}</button>`}
        <button type="button" class="photo-btn photo-del" data-i="${i}" title="Retirer">${icon('x')}</button>
      </div>`).join('') : `<p class="photos-empty">${icon('image')}Aucune photo</p>`;
  };
  dessinerPhotos();
  qs('#photo-input', dlg).addEventListener('change', (e) => {
    for (const file of e.target.files) photos.push({ file, preview: URL.createObjectURL(file) });
    e.target.value = '';
    dessinerPhotos();
  });
  zone.addEventListener('click', (e) => {
    const b = e.target.closest('.photo-btn');
    if (!b) return;
    const i = Number(b.dataset.i);
    if (b.classList.contains('photo-del')) photos.splice(i, 1);
    else photos.unshift(...photos.splice(i, 1));
    dessinerPhotos();
  });

  qs('#art-form', dlg).addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const f = new FormData(form);
    const err = qs('#form-err', dlg);
    const titre = String(f.get('titre')).trim();
    const prix = String(f.get('prix')).trim();
    if (!titre || prix === '' || Number(prix) < 0) {
      err.hidden = false;
      err.textContent = 'Le titre et le prix sont obligatoires.';
      return;
    }
    await busy(e.submitter, async () => {
      const urls = [];
      for (const p of photos) urls.push(p.url || await envoyer(await reduire(p.file), 'articles'));
      const txt = (k) => { const v = String(f.get(k) ?? '').trim(); return v || null; };
      const row = {
        titre, prix: Number(prix), photos: urls,
        marque: txt('marque'), etat: txt('etat'), inclus: txt('inclus'), type: txt('type'), specs: txt('specs'),
        stockage: txt('stockage'), couleur: txt('couleur'), matiere: txt('matiere'), poids: txt('poids'), ram: txt('ram'),
        garantie_jusqu_au: txt('garantie_jusqu_au'), prix_note: txt('prix_note'),
        categorie_id: f.get('categorie_id') ? Number(f.get('categorie_id')) : null,
        garantie: f.get('garantie') === '' ? null : f.get('garantie') === 'true',
        facture: f.get('facture') ? true : null,
        disponible: Boolean(f.get('disponible')),
        updated_at: new Date().toISOString(),
      };
      const res = nouveau ? await sb.from('articles').insert(row) : await sb.from('articles').update(row).eq('id', a.id);
      if (res.error) throw res.error;
      const retirees = a.photos.filter((u) => !urls.includes(u));
      if (retirees.length) await supprimerFichiers(retirees).catch(console.warn);
      photos.forEach((p) => p.preview && URL.revokeObjectURL(p.preview));
      dlg.close();
      await recharger();
      coquille();
      toast(nouveau ? 'Article ajouté' : 'Article enregistré');
    });
  });

  dlg.showModal();
}

// ---------- Demandes (réservations et estimations) ----------

function renderDemandes() {
  const actives = reservationsActives();
  const passees = state.reservations.filter((r) => !actives.includes(r)).slice(0, 15);
  const aTraiter = state.estimations.filter((x) => !x.traitee);
  const traitees = state.estimations.filter((x) => x.traitee).slice(0, 20);
  const date = (iso) => new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' });
  const contact = (nom, tel, objet) => `
    <a class="btn btn-sm btn-green" href="${telHref(tel)}">${icon('phone')}Appeler</a>
    <a class="btn btn-sm btn-outline" href="${whatsappHref(tel, `Bonjour ${nom}, c'est Paytoocash au sujet de ${objet}.`)}" target="_blank" rel="noopener">${icon('whatsapp')}WhatsApp</a>`;
  const resa = (r, active) => `
    <li class="row${active ? '' : ' sold'}" data-resa="${r.id}">
      <div class="row-main">
        <strong class="row-title">${esc(r.article_titre || 'Article supprimé')}</strong>
        <span class="row-meta">${esc(r.nom)} · ${esc(r.tel)} · réservé le ${date(r.created_at)}</span>
        <span class="row-meta">${r.annulee ? 'Annulée' : active ? `<b>Jusqu'à ${esc(heureFin(r.expire_at))}</b>` : 'Expirée, article remis en vente'}</span>
      </div>
      <div class="row-actions">
        ${contact(r.nom, r.tel, `votre réservation « ${r.article_titre} »`)}
        ${active ? `<button type="button" class="btn btn-sm btn-ghost" data-act="annuler-resa">Annuler</button>` : ''}
      </div>
    </li>`;
  const estim = (x) => `
    <li class="row estim-row${x.traitee ? ' sold' : ''}" data-estim="${x.id}">
      <div class="row-main">
        <strong class="row-title">${esc(x.objet)}</strong>
        <span class="row-meta">${esc(x.nom)} · ${esc(x.tel)} · ${date(x.created_at)}</span>
        ${x.etat || x.prix_souhaite ? `<span class="row-meta">${[x.etat, x.prix_souhaite ? `Prix souhaité : ${esc(x.prix_souhaite)}` : ''].filter(Boolean).map(esc).join(' · ')}</span>` : ''}
        ${x.details ? `<p class="estim-details">${esc(x.details)}</p>` : ''}
        ${x.photos.length ? `<div class="estim-photos" data-photos='${esc(JSON.stringify(x.photos))}'></div>` : ''}
      </div>
      <div class="row-actions">
        ${contact(x.nom, x.tel, `votre demande d'estimation (${x.objet})`)}
        <button type="button" class="btn btn-sm ${x.traitee ? 'btn-ghost' : 'btn-gold'}" data-act="traiter">${x.traitee ? 'Rouvrir' : 'Traitée'}</button>
        <button type="button" class="icon-btn danger" data-act="del-estim" aria-label="Supprimer">${icon('trash')}</button>
      </div>
    </li>`;
  qs('#tab-content').innerHTML = `
    <section class="block${actives.length ? ' block-warn' : ''}">
      <h2>${icon('calendar')}Réservations en cours <small>${actives.length}</small></h2>
      <p class="muted small">Un article réservé revient automatiquement en vente au bout de 24 h. S'il est vendu, marquez-le « Vendu » dans l'onglet Articles.</p>
      ${actives.length ? `<ul class="rows">${actives.map((r) => resa(r, true)).join('')}</ul>` : '<p class="muted">Aucune réservation en cours.</p>'}
    </section>
    <section class="block${aTraiter.length ? ' block-warn' : ''}">
      <h2>${icon('cash')}Demandes d'estimation <small>${aTraiter.length}</small></h2>
      ${aTraiter.length ? `<ul class="rows">${aTraiter.map(estim).join('')}</ul>` : '<p class="muted">Aucune nouvelle demande.</p>'}
    </section>
    ${traitees.length ? `<section class="block"><h2>Estimations traitées</h2><ul class="rows">${traitees.map(estim).join('')}</ul></section>` : ''}
    ${passees.length ? `<section class="block"><h2>Réservations passées (30 jours)</h2><ul class="rows">${passees.map((r) => resa(r, false)).join('')}</ul></section>` : ''}`;
  // Photos privées : liens temporaires (1 h).
  qsa('.estim-photos').forEach(async (el) => {
    const paths = JSON.parse(el.dataset.photos);
    const { data } = await sb.storage.from('estimations').createSignedUrls(paths, 3600);
    el.innerHTML = (data || []).filter((d) => d.signedUrl).map((d) => `<a href="${esc(d.signedUrl)}" target="_blank" rel="noopener"><img src="${esc(d.signedUrl)}" alt=""></a>`).join('');
  });
}

// ---------- Catégories ----------

function renderCategories() {
  const el = qs('#tab-content');
  const nb = (c) => state.articles.filter((a) => a.categorie?.id === c.id).length;
  el.innerHTML = `
    <section class="block">
      <h2>Nouvelle catégorie</h2>
      <form class="inline-form" id="cat-new">
        <input type="text" name="nom" placeholder="Nom de la catégorie" required maxlength="60">
        <button class="btn btn-gold" type="submit">${icon('plus')}Créer</button>
      </form>
    </section>
    <section class="block">
      <h2>Catégories <small>${state.categories.length}</small></h2>
      <p class="muted small">L'image (PNG ou SVG, fond transparent accepté) remplace l'icône sur le site : carte de la catégorie, bandeau de sa page et badge des fiches articles.</p>
      <ul class="rows">
        ${state.categories.map((c, i) => `
          <li class="row cat-row" data-cat="${c.id}">
            <button type="button" class="cat-pick" data-act="icon" title="Choisir l'icône">${catVisual(c)}</button>
            <div class="row-main">
              <input class="cat-name-input" type="text" value="${esc(c.nom)}" data-act="rename" aria-label="Nom de la catégorie" maxlength="60">
              <span class="row-meta">${nb(c)} article${nb(c) > 1 ? 's' : ''}${c.image_url ? ' · image personnalisée' : ''}</span>
              <div class="cat-tools">
                <button type="button" class="btn btn-ghost btn-sm" data-act="icon">${icon(c.icone)}Icône</button>
                <label class="btn btn-ghost btn-sm">${icon('upload')}Image
                  <input type="file" accept="image/png,image/svg+xml,image/webp,image/jpeg" hidden data-act="image">
                </label>
                ${c.image_url ? `<button type="button" class="btn btn-ghost btn-sm" data-act="noimage">${icon('x')}Retirer l'image</button>` : ''}
              </div>
            </div>
            <div class="row-actions vertical">
              <button type="button" class="icon-btn" data-act="up" aria-label="Monter"${i === 0 ? ' disabled' : ''}>${icon('up')}</button>
              <button type="button" class="icon-btn" data-act="down" aria-label="Descendre"${i === state.categories.length - 1 ? ' disabled' : ''}>${icon('down')}</button>
              <button type="button" class="icon-btn danger" data-act="delcat" aria-label="Supprimer">${icon('trash')}</button>
            </div>
          </li>`).join('')}
      </ul>
    </section>`;

  qs('#cat-new').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nom = String(new FormData(e.target).get('nom')).trim();
    if (!nom) return;
    await busy(e.submitter, async () => {
      const ordre = Math.max(-1, ...state.categories.map((c) => c.ordre ?? 0)) + 1;
      const { error } = await sb.from('categories').insert({ nom, slug: slugUnique(nom), icone: ICONES_PAR_DEFAUT[nom] || 'carton', ordre });
      if (error) throw error;
      await recharger(); coquille(); toast('Catégorie créée');
    });
  });

  el.addEventListener('change', async (e) => {
    const li = e.target.closest('[data-cat]');
    if (!li) return;
    const c = state.categories.find((x) => String(x.id) === li.dataset.cat);
    if (e.target.dataset.act === 'rename') {
      const nom = e.target.value.trim();
      if (!nom || nom === c.nom) { e.target.value = c.nom; return; }
      await busy(null, async () => {
        const { error } = await sb.from('categories').update({ nom, slug: slugUnique(nom, c.id) }).eq('id', c.id);
        if (error) { e.target.value = c.nom; throw error; }
        await recharger(); toast('Catégorie renommée');
      });
    } else if (e.target.dataset.act === 'image') {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 3e6) return toast('Image trop lourde (3 Mo maximum).', 'err');
      await busy(null, async () => {
        const url = await envoyer(file, 'categories');
        const { error } = await sb.from('categories').update({ image_url: url }).eq('id', c.id);
        if (error) throw error;
        if (c.image_url) await supprimerFichiers([c.image_url]).catch(console.warn);
        await recharger(); coquille(); toast('Image enregistrée');
      });
    }
  });
}

function slugUnique(nom, sauf) {
  const base = slugify(nom);
  let s = base, i = 2;
  while (state.categories.some((c) => c.slug === s && c.id !== sauf)) s = `${base}-${i++}`;
  return s;
}

function choisirIcone(c) {
  dlg.innerHTML = `
    <div class="sheet">
      <header class="sheet-head"><h2>Icône · ${esc(c.nom)}</h2><button type="button" class="icon-btn" data-close aria-label="Fermer">${icon('x')}</button></header>
      <div class="sheet-body">
        ${c.image_url ? '<p class="muted small">Cette catégorie a une image personnalisée : l’icône ne s’affichera qu’après avoir retiré l’image.</p>' : ''}
        <div class="icon-grid">
          ${Object.entries(CATEGORY_ICONS).map(([k, v]) => `
            <button type="button" class="icon-choice${k === c.icone ? ' on' : ''}" data-icone="${k}">${icon(k)}<span>${v.label}</span></button>`).join('')}
        </div>
      </div>
    </div>`;
  qs('.icon-grid', dlg).addEventListener('click', async (e) => {
    const b = e.target.closest('[data-icone]');
    if (!b) return;
    await busy(null, async () => {
      const { error } = await sb.from('categories').update({ icone: b.dataset.icone }).eq('id', c.id);
      if (error) throw error;
      dlg.close(); await recharger(); coquille(); toast('Icône modifiée');
    });
  });
  dlg.showModal();
}

// ---------- Infos du magasin ----------

function renderBoutique() {
  const b = state.boutique;
  const h = Array.isArray(b.horaires) && b.horaires.length === 7 ? b.horaires : HORAIRES_PAR_DEFAUT;
  // Les bannières existantes, plus un emplacement vide pour en ajouter une.
  const vitrines = [...b.vitrine, { titre: '' }];
  const avis = b.avis;
  const listeAvis = [...avis.liste, { texte: '' }];
  const f = (k, label, type = 'text', hint = '') => champ(k, label, b, { type, hint });
  qs('#tab-content').innerHTML = `
    <form id="shop" class="block-form">
      <section class="block">
        <h2>Contact</h2>
        <div class="cols">
          ${f('nom', 'Nom du magasin')}
          ${f('tel', 'Téléphone', 'tel', 'Utilisé pour les boutons « Appeler » et les SMS')}
          ${f('email', 'E-mail', 'email')}
          ${f('facebook', 'Page Facebook', 'text', 'Nom de la page ou adresse complète')}
        </div>
        ${champ('adresse', 'Adresse', b, { full: true })}
        <div class="cols">
          ${f('slogan', 'Accroche')}
          ${f('atout', 'Atout', 'text', 'Ex. : 3 salles de vente')}
        </div>
      </section>
      <section class="block">
        <h2>Horaires</h2>
        <div class="hours-edit">
          ${h.map((d, i) => `
            <div class="day" data-i="${i}">
              <label class="check"><input type="checkbox" name="ouvert-${i}"${d.ouvert ? ' checked' : ''}><span>${cap(d.jour)}</span></label>
              <input type="time" name="de-${i}" value="${esc(d.de || '10:00')}" aria-label="Ouverture ${d.jour}">
              <span>–</span>
              <input type="time" name="a-${i}" value="${esc(d.a || '19:00')}" aria-label="Fermeture ${d.jour}">
            </div>`).join('')}
        </div>
        ${champ('horaires_note', 'Message sous les horaires', b, { full: true, hint: 'Ex. : Fermé exceptionnellement le 1er novembre. Laissez vide si rien à signaler.' })}
      </section>
      <section class="block">
        <h2>Bannières de l'accueil</h2>
        <p class="muted small">Pour retirer une bannière, décochez « Afficher ». Remplissez le dernier bloc pour en ajouter une.</p>
        ${vitrines.map((v, i) => `
        <fieldset class="vitrine-edit">
          <legend>${v.titre ? esc(v.titre) : 'Nouvelle bannière'}</legend>
          <label class="field check"><input type="checkbox" name="v_on_${i}"${v.titre ? ' checked' : ''}><span>Afficher</span></label>
          <div class="cols">
            <label class="field"><span>Titre</span><input name="v_titre_${i}" value="${esc(v.titre || '')}"></label>
            <label class="field"><span>Petit titre</span><input name="v_categorie_${i}" value="${esc(v.categorie || '')}"></label>
          </div>
          <label class="field full"><span>Texte</span><input name="v_texte_${i}" value="${esc(v.texte || '')}"></label>
          <div class="cols">
            <label class="field"><span>Bouton vers</span>
              <select name="v_lien_${i}">
                <option value="catalogue.html">Tout le catalogue</option>
                <option value="index.html#infos"${v.lien === 'index.html#infos' ? ' selected' : ''}>Infos pratiques (venir en magasin)</option>
                ${state.categories.map((c) => { const l = `catalogue.html?cat=${c.slug}`; return `<option value="${l}"${v.lien === l ? ' selected' : ''}>Rayon ${esc(c.nom)}</option>`; }).join('')}
              </select>
            </label>
            <label class="field"><span>Icône</span>
              <select name="v_icone_${i}">
                ${Object.entries(CATEGORY_ICONS).map(([k, x]) => `<option value="${k}"${(v.icone || 'carton') === k ? ' selected' : ''}>${x.label}</option>`).join('')}
              </select>
            </label>
            <label class="field"><span>Photo</span><input type="file" name="v_photo_${i}" accept="image/*"></label>
          </div>
          ${v.photo ? `<img class="vitrine-preview" src="${esc(v.photo)}" alt="" onerror="this.remove()">` : ''}
        </fieldset>`).join('')}
      </section>
      <section class="block">
        <h2>Photos du magasin</h2>
        <p class="muted small">Affichées sur l'accueil dans « Le magasin ». La section reste masquée tant qu'il n'y a aucune photo.</p>
        <div class="photos">
          ${b.galerie.map((src, i) => `
            <div class="photo"><img src="${esc(src)}" alt="">
              <label class="photo-btn photo-del" title="Retirer"><input type="checkbox" name="g_del_${i}" hidden>${icon('x')}</label>
            </div>`).join('')}
        </div>
        <label class="field"><span>Ajouter des photos</span><input type="file" name="g_new" accept="image/*" multiple></label>
      </section>
      <section class="block">
        <h2>Avis Google</h2>
        <p class="muted small">Recopiez de vrais avis publiés sur la fiche Google du magasin. La section reste masquée tant qu'aucun avis n'est saisi.</p>
        <div class="cols">
          <label class="field"><span>Note moyenne (ex. 4,8)</span><input name="a_note" inputmode="decimal" value="${esc(avis.note ?? '')}"></label>
          <label class="field"><span>Nombre d'avis</span><input name="a_nombre" inputmode="numeric" value="${esc(avis.nombre ?? '')}"></label>
        </div>
        <label class="field full"><span>Lien vers la fiche Google</span><input name="a_lien" type="url" value="${esc(avis.lien)}" placeholder="https://maps.app.goo.gl/…"></label>
        ${listeAvis.map((a, i) => `
        <fieldset class="vitrine-edit">
          <legend>${a.texte ? esc(a.auteur || 'Avis') : 'Nouvel avis'}</legend>
          <div class="cols">
            <label class="field"><span>Auteur</span><input name="av_auteur_${i}" value="${esc(a.auteur || '')}"></label>
            <label class="field"><span>Note</span><select name="av_note_${i}">${[5, 4, 3, 2, 1].map((n) => `<option${Number(a.note || 5) === n ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
            <label class="field"><span>Date</span><input name="av_date_${i}" value="${esc(a.date || '')}" placeholder="Ex. : il y a 2 mois"></label>
          </div>
          <label class="field full"><span>Texte de l'avis${a.texte ? ' (vider pour supprimer)' : ''}</span><textarea name="av_texte_${i}" rows="3">${esc(a.texte || '')}</textarea></label>
        </fieldset>`).join('')}
      </section>
      <div class="save-bar"><button class="btn btn-green btn-lg" type="submit">${icon('check')}Enregistrer les infos</button></div>
    </form>`;

  qs('#shop').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const t = (k) => String(fd.get(k) ?? '').trim();
    await busy(e.submitter, async () => {
      const vitrine = [];
      const anciennes = [];
      for (const [i, v] of vitrines.entries()) {
        const titre = t(`v_titre_${i}`);
        if (!fd.get(`v_on_${i}`) || !titre) { if (v.photo) anciennes.push(v.photo); continue; }
        const file = fd.get(`v_photo_${i}`);
        let photo = v.photo || '';
        if (file && file.size) {
          photo = await envoyer(await reduire(file, 2000), 'vitrines');
          if (v.photo) anciennes.push(v.photo);
        }
        vitrine.push({ titre, categorie: t(`v_categorie_${i}`), texte: t(`v_texte_${i}`), lien: t(`v_lien_${i}`), icone: t(`v_icone_${i}`), photo });
      }
      const galerie = b.galerie.filter((_, i) => !fd.get(`g_del_${i}`));
      for (const file of fd.getAll('g_new').filter((x) => x && x.size)) galerie.push(await envoyer(await reduire(file, 2000), 'magasin'));
      anciennes.push(...b.galerie.filter((_, i) => fd.get(`g_del_${i}`)));
      const nb = (k) => { const v = Number(t(k).replace(',', '.')); return t(k) && Number.isFinite(v) ? v : null; };
      const avisRow = {
        note: nb('a_note'), nombre: nb('a_nombre'), lien: t('a_lien'),
        liste: listeAvis.map((_, i) => ({ auteur: t(`av_auteur_${i}`), note: Number(t(`av_note_${i}`)) || 5, date: t(`av_date_${i}`), texte: t(`av_texte_${i}`) })).filter((x) => x.texte),
      };
      const row = {
        id: 1, avis: avisRow, galerie, nom: t('nom'), tel: t('tel'), email: t('email'), facebook: t('facebook'), adresse: t('adresse'),
        slogan: t('slogan'), atout: t('atout'), horaires_note: t('horaires_note'), vitrine,
        horaires: h.map((d, i) => ({ jour: d.jour, ouvert: Boolean(fd.get(`ouvert-${i}`)), de: t(`de-${i}`) || '10:00', a: t(`a-${i}`) || '19:00' })),
        updated_at: new Date().toISOString(),
      };
      const { error } = await sb.from('boutique').upsert(row);
      if (error) throw error;
      if (anciennes.length) await supprimerFichiers(anciennes).catch(console.warn);
      await recharger(); coquille(); toast('Infos du magasin enregistrées');
    });
  });
}

// ---------- Actions (délégation) ----------

app.addEventListener('click', async (e) => {
  const tabBtn = e.target.closest('[data-tab]');
  if (tabBtn) { tab = tabBtn.dataset.tab; coquille(); return; }
  const btn = e.target.closest('[data-act]');
  if (!btn || readonly) return;
  const act = btn.dataset.act;
  const art = state.articles.find((a) => String(a.id) === btn.closest('[data-id]')?.dataset.id);
  const cat = state.categories.find((c) => String(c.id) === btn.closest('[data-cat]')?.dataset.cat);

  const resaId = btn.closest('[data-resa]')?.dataset.resa;
  const est = state.estimations.find((x) => String(x.id) === btn.closest('[data-estim]')?.dataset.estim);

  if (act === 'logout') { await sb.auth.signOut(); ecranConnexion(); }
  else if (act === 'annuler-resa') {
    const r = state.reservations.find((x) => String(x.id) === resaId);
    if (!confirm(`Annuler la réservation de ${r.nom} ? L'article est remis en vente tout de suite.`)) return;
    await busy(btn, async () => {
      const e1 = await sb.from('reservations').update({ annulee: true }).eq('id', r.id);
      if (e1.error) throw e1.error;
      if (r.article_id) {
        const e2 = await sb.from('articles').update({ reserve_jusqu_au: null }).eq('id', r.article_id);
        if (e2.error) throw e2.error;
      }
      await recharger(); coquille(); toast('Réservation annulée');
    });
  } else if (act === 'traiter') {
    await busy(btn, async () => {
      const { error } = await sb.from('estimations').update({ traitee: !est.traitee }).eq('id', est.id);
      if (error) throw error;
      await recharger(); coquille();
    });
  } else if (act === 'del-estim') {
    if (!confirm(`Supprimer la demande de ${est.nom} et ses photos ?`)) return;
    await busy(btn, async () => {
      if (est.photos.length) await sb.storage.from('estimations').remove(est.photos).catch(console.warn);
      const { error } = await sb.from('estimations').delete().eq('id', est.id);
      if (error) throw error;
      await recharger(); coquille(); toast('Demande supprimée');
    });
  }
  else if (act === 'new') ouvrirArticle(null);
  else if (act === 'edit') ouvrirArticle(art);
  else if (act === 'vendu') {
    await busy(btn, async () => {
      const { error } = await sb.from('articles').update({ disponible: !art.disponible, updated_at: new Date().toISOString() }).eq('id', art.id);
      if (error) throw error;
      art.disponible = !art.disponible;
      renderArticles();
      toast(art.disponible ? 'Remis en vente' : 'Marqué vendu');
    });
  } else if (act === 'delete') {
    if (!confirm(`Supprimer définitivement « ${art.titre} » ?\n\nPour un article vendu, préférez le bouton « Vendu ».`)) return;
    await busy(btn, async () => {
      const { error } = await sb.from('articles').delete().eq('id', art.id);
      if (error) throw error;
      await supprimerFichiers(art.photos).catch(console.warn);
      await recharger(); coquille(); toast('Article supprimé');
    });
  } else if (act === 'icon') choisirIcone(cat);
  else if (act === 'noimage') {
    await busy(btn, async () => {
      const { error } = await sb.from('categories').update({ image_url: null }).eq('id', cat.id);
      if (error) throw error;
      await supprimerFichiers([cat.image_url]).catch(console.warn);
      await recharger(); coquille(); toast("Image retirée : l'icône est de retour");
    });
  } else if (act === 'up' || act === 'down') {
    const list = [...state.categories];
    const i = list.indexOf(cat), j = act === 'up' ? i - 1 : i + 1;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    await busy(null, async () => {
      const res = await Promise.all(list.map((c, k) => (c.ordre === k ? null : sb.from('categories').update({ ordre: k }).eq('id', c.id))));
      const err = res.find((r) => r?.error);
      if (err) throw err.error;
      await recharger(); coquille();
    });
  } else if (act === 'delcat') {
    const n = state.articles.filter((a) => a.categorie?.id === cat.id).length;
    if (!confirm(`Supprimer la catégorie « ${cat.nom} » ?${n ? `\n\nSes ${n} article(s) seront conservés, sans catégorie.` : ''}`)) return;
    await busy(btn, async () => {
      const { error } = await sb.from('categories').delete().eq('id', cat.id);
      if (error) throw error;
      if (cat.image_url) await supprimerFichiers([cat.image_url]).catch(console.warn);
      await recharger(); coquille(); toast('Catégorie supprimée');
    });
  }
});

dlg.addEventListener('click', (e) => {
  if (e.target.closest('[data-close]') || e.target === dlg) dlg.close();
});

demarrer().catch((e) => {
  console.error(e);
  app.innerHTML = `<div class="wrap admin-main"><div class="notice notice-red"><h2>Erreur</h2><p>${esc(messageErreur(e))}</p><button class="btn btn-outline" onclick="location.reload()">Recharger</button></div></div>`;
});
