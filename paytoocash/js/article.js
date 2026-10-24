import { icon } from './icons.js';
import { loadData } from './store.js';
import { initPage, finishPage, articleCard, catVisual, photoOrPlaceholder, showError } from './layout.js';
import { esc, formatPrix, pub, telHref, smsHref, param, qs, qsa } from './util.js';

initPage('catalogue');
const main = document.getElementById('main');

function garantieTexte(a) {
  if (a.garantie !== true) return null;
  const jusqu = pub(a.garantie_jusqu_au);
  return jusqu ? `Garanti jusqu'au ${jusqu}` : 'Oui';
}

function caracteristiques(a) {
  const rows = [
    ['État', pub(a.etat)],
    ['Garantie', garantieTexte(a)],
    ['Facture', a.facture === true ? 'Fournie' : null],
    ['Inclus', pub(a.inclus)],
    ['Marque', pub(a.marque)],
    ['Type', pub(a.type)],
    ['Stockage', pub(a.stockage)],
    ['Mémoire vive', pub(a.ram)],
    ['Couleur', pub(a.couleur)],
    ['Matière', pub(a.matiere)],
    ['Poids', pub(a.poids)],
    ['Caractéristiques', pub(a.specs)],
  ].filter(([, v]) => v);
  return `<dl class="specs">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
}

try {
  const data = await loadData();
  const { articles, boutique: b } = data;
  const a = articles.find((x) => String(x.id) === param('id'));

  if (!a) {
    main.innerHTML = `
      <div class="wrap empty page-pad">
        ${icon('search')}
        <h1 class="h2">Article introuvable</h1>
        <p>Il a peut-être été retiré du catalogue.</p>
        <a class="btn btn-green" href="catalogue.html">Voir le catalogue</a>
      </div>`;
  } else {
    document.title = `${a.titre} · Paytoocash Pontarlier`;
    qs('meta[name="description"]')?.setAttribute('content', `${a.titre} d'occasion à ${formatPrix(a.prix)} chez Paytoocash, Pontarlier.`);
    const c = a.categorie;
    const similaires = articles.filter((x) => x.id !== a.id && x.disponible && c && x.categorie?.id === c.id).slice(0, 4);
    const sms = smsHref(b.tel, `Bonjour, je suis intéressé(e) par l'article « ${a.titre} » (${formatPrix(a.prix)}) vu sur votre site. Est-il toujours disponible ?`);

    main.innerHTML = `
      <div class="wrap page-pad">
        <nav class="crumbs" aria-label="Fil d'Ariane">
          <a href="catalogue.html">${icon('back')}Catalogue</a>
          ${c ? `<span>/</span><a href="catalogue.html?cat=${encodeURIComponent(c.slug)}">${esc(c.nom)}</a>` : ''}
        </nav>
        <article class="product${a.disponible ? '' : ' is-sold'}">
          <div class="gallery">
            <div class="gallery-main">
              ${photoOrPlaceholder(a, 'gallery-img', true)}
              ${a.disponible ? '' : '<span class="badge-sold badge-sold-lg">Vendu</span>'}
            </div>
            ${a.photos.length > 1 ? `
              <div class="thumbs">
                ${a.photos.map((p, i) => `<button type="button" class="thumb${i ? '' : ' on'}" data-src="${esc(p)}" aria-label="Photo ${i + 1}"><img src="${esc(p)}" alt="" loading="lazy"></button>`).join('')}
              </div>` : ''}
          </div>
          <div class="product-info">
            ${c ? `<a class="cat-badge anim-icon" href="catalogue.html?cat=${encodeURIComponent(c.slug)}">${catVisual(c)}${esc(c.nom)}</a>` : ''}
            <h1 class="product-title">${esc(a.titre)}</h1>
            ${pub(a.marque) ? `<p class="product-brand">${esc(a.marque)}</p>` : ''}
            <p class="product-price">${formatPrix(a.prix)}</p>
            <div class="product-tags">
              ${a.disponible ? '<span class="chip chip-green">' + icon('check') + 'Disponible en magasin</span>' : '<span class="chip chip-grey">Vendu</span>'}
              ${a.garantie === true ? `<span class="chip chip-gold">${icon('shield')}Garanti</span>` : ''}
              ${a.facture === true ? `<span class="chip chip-gold">${icon('receipt')}Facture</span>` : ''}
            </div>
            ${caracteristiques(a)}
            ${a.disponible ? `
              <div class="product-actions">
                <a class="btn btn-green btn-lg" data-tel href="${telHref(b.tel)}">${icon('phone')}Appeler le magasin</a>
                <a class="btn btn-gold btn-lg" href="${sms}">${icon('message')}Je suis intéressé</a>
              </div>
              <p class="muted small">Article visible au magasin : ${esc(b.adresse)}.</p>` : `
              <div class="sold-box">
                <p><strong>Cet article a trouvé preneur.</strong> Des arrivages ont lieu chaque semaine.</p>
                ${c ? `<a class="btn btn-outline" href="catalogue.html?cat=${encodeURIComponent(c.slug)}&dispo=dispo">Voir les ${esc(c.nom)} disponibles</a>` : ''}
              </div>`}
          </div>
        </article>
      </div>
      ${a.disponible ? `
        <div class="sticky-cta">
          <a class="btn btn-green" href="${telHref(b.tel)}">${icon('phone')}Appeler</a>
          <a class="btn btn-gold" href="${sms}">${icon('message')}Je suis intéressé</a>
        </div>` : ''}
      ${similaires.length ? `
        <section class="section section-alt">
          <div class="wrap">
            <h2 class="h2">Dans le même rayon</h2>
            <div class="grid">${similaires.map(articleCard).join('')}</div>
          </div>
        </section>` : ''}`;

    if (a.disponible) document.body.classList.add('has-sticky-cta');
    qsa('.thumb').forEach((btn) => btn.addEventListener('click', () => {
      const img = qs('.gallery-main img');
      if (img) img.src = btn.dataset.src;
      qsa('.thumb').forEach((x) => x.classList.toggle('on', x === btn));
    }));
  }
  finishPage(data);
} catch (e) {
  showError(main, e);
}
