import { icon } from './icons.js';
import { loadData, getClient } from './store.js';
import { initPage, finishPage, articleCard, catVisual, photoOrPlaceholder, showError } from './layout.js';
import { esc, formatPrix, pub, telHref, smsHref, whatsappHref, estReserve, heureFin, param, qs, qsa } from './util.js';

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

function ouvrirReservation(a, b, source) {
  const dlg = document.createElement('dialog');
  dlg.className = 'resa';
  dlg.innerHTML = `
    <form method="dialog" class="resa-form">
      <h2>Réserver pendant 24 h</h2>
      <p class="muted small">« ${esc(a.titre)} » vous attend en magasin pendant 24 h. Passé ce délai, il est remis en vente.</p>
      <label>Votre prénom et nom<input name="nom" required minlength="2" maxlength="80" autocomplete="name"></label>
      <label>Votre téléphone<input name="tel" type="tel" required minlength="10" maxlength="30" autocomplete="tel" inputmode="tel"></label>
      <p class="resa-err" hidden></p>
      <div class="btn-row">
        <button class="btn btn-ghost" value="cancel" formnovalidate>Annuler</button>
        <button class="btn btn-green" value="ok">${icon('calendar')}Confirmer la réservation</button>
      </div>
    </form>`;
  document.body.append(dlg);
  dlg.addEventListener('close', () => dlg.remove());
  const form = qs('form', dlg), err = qs('.resa-err', dlg);
  form.addEventListener('submit', async (e) => {
    if (e.submitter?.value !== 'ok') return;
    e.preventDefault();
    const nom = form.nom.value.trim(), tel = form.tel.value.trim();
    // Mode démo (sans base) : la réservation passe par SMS.
    if (source !== 'supabase') {
      location.href = smsHref(b.tel, `Bonjour, je souhaite réserver « ${a.titre} » (${formatPrix(a.prix)}) pendant 24 h. ${nom}, ${tel}`);
      dlg.close();
      return;
    }
    const btn = e.submitter;
    btn.disabled = true;
    try {
      const sb = await getClient();
      const { data: fin, error } = await sb.rpc('reserver_article', { p_article: a.id, p_nom: nom, p_tel: tel });
      if (error) throw error;
      dlg.innerHTML = `<div class="resa-form"><h2>${icon('check')} C'est réservé !</h2>
        <p>« ${esc(a.titre)} » vous attend au magasin jusqu'à <strong>${esc(heureFin(fin))}</strong>.</p>
        <p class="muted small">${esc(b.adresse)} · ${esc(b.tel)}</p>
        <button class="btn btn-green" type="button" onclick="location.reload()">Fermer</button></div>`;
    } catch (ex) {
      const m = ex?.message || '';
      err.hidden = false;
      err.textContent = /déjà réservé/.test(m) ? 'Désolé, cet article vient d’être réservé par quelqu’un d’autre.'
        : /indisponible/.test(m) ? 'Désolé, cet article n’est plus disponible.'
        : /Trop de réservations/.test(m) ? 'Vous avez déjà 2 réservations en cours : appelez-nous pour en ajouter.'
        : /invalide/.test(m) ? 'Vérifiez votre nom et votre numéro de téléphone.'
        : 'La réservation n’a pas abouti. Réessayez ou appelez-nous.';
      btn.disabled = false;
    }
  });
  dlg.showModal();
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
    const message = `Bonjour, je suis intéressé(e) par l'article « ${a.titre} » (${formatPrix(a.prix)}) vu sur votre site. Est-il toujours disponible ?`;
    const sms = smsHref(b.tel, message);
    const wa = whatsappHref(b.tel, message);
    const reserve = estReserve(a);

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
              ${a.disponible ? `<span class="chip chip-green">${icon('check')}Testé, en état de marche</span>` : ''}
              ${a.garantie === true ? `<span class="chip chip-gold">${icon('shield')}Garanti</span>` : ''}
              ${a.facture === true ? `<span class="chip chip-gold">${icon('receipt')}Facture</span>` : ''}
            </div>
            ${caracteristiques(a)}
            ${a.disponible ? `
              ${reserve ? `<p class="reserved-box">${icon('calendar')}<span><strong>Article réservé</strong> jusqu'à ${esc(heureFin(a.reserve_jusqu_au))}. S'il n'est pas retiré, il sera de nouveau disponible.</span></p>` : ''}
              <div class="product-actions">
                <a class="btn btn-green btn-lg" data-tel href="${telHref(b.tel)}">${icon('phone')}Appeler le magasin</a>
                <a class="btn btn-gold btn-lg" href="${sms}">${icon('message')}Je suis intéressé</a>
                <a class="btn btn-outline btn-lg" href="${wa}" target="_blank" rel="noopener">${icon('whatsapp')}WhatsApp</a>
                ${reserve ? '' : `<button class="btn btn-outline btn-lg" type="button" id="reserver">${icon('calendar')}Réserver 24 h</button>`}
              </div>
              <p class="muted small">Réservation gratuite et sans paiement : l'article vous attend 24 h en magasin. Article visible au magasin : ${esc(b.adresse)}.</p>` : `
              <div class="sold-box">
                <p><strong>Cet article a trouvé preneur.</strong> Des arrivages ont lieu chaque semaine.</p>
                ${c ? `<a class="btn btn-outline" href="catalogue.html?cat=${encodeURIComponent(c.slug)}&dispo=dispo">Voir les ${esc(c.nom)} disponibles</a>` : ''}
              </div>`}
          </div>
        </article>
      </div>
      ${a.disponible ? `
        <div class="sticky-cta">
          <a class="btn btn-green" href="${telHref(b.tel)}" aria-label="Appeler">${icon('phone')}</a>
          <a class="btn btn-outline" href="${wa}" target="_blank" rel="noopener" aria-label="WhatsApp">${icon('whatsapp')}</a>
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
    qs('#reserver')?.addEventListener('click', () => ouvrirReservation(a, b, data.source));
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
