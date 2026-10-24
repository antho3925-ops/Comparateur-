import { icon, facebookLogo } from './icons.js';
import { loadData } from './store.js';
import { initPage, finishPage, categoryCard, articleCard, showError } from './layout.js';
import { infosPratiques } from './infos.js';
import { esc, pub, smsHref, telIntl, facebookHref } from './util.js';

initPage('accueil');
const main = document.getElementById('main');

const etoiles = (n) => {
  const v = Math.round(Number(n) || 0);
  return `<span class="stars">${'★'.repeat(v)}<span class="stars-off">${'★'.repeat(Math.max(0, 5 - v))}</span></span>`;
};

function jsonLd(b) {
  const days = { lundi: 'Monday', mardi: 'Tuesday', mercredi: 'Wednesday', jeudi: 'Thursday', vendredi: 'Friday', samedi: 'Saturday', dimanche: 'Sunday' };
  const m = /^(.*?),?\s*(\d{5})\s+(.+)$/.exec(b.adresse || '');
  const ld = {
    '@context': 'https://schema.org', '@type': 'Store', name: b.nom, telephone: telIntl(b.tel), email: b.email || undefined,
    address: m ? { '@type': 'PostalAddress', streetAddress: m[1], postalCode: m[2], addressLocality: m[3], addressCountry: 'FR' } : b.adresse,
    openingHoursSpecification: b.horaires.filter((h) => h.ouvert).map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: days[h.jour], opens: h.de, closes: h.a })),
  };
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.textContent = JSON.stringify(ld);
  document.head.append(s);
}

try {
  const data = await loadData();
  const { boutique: b, categories, articles } = data;
  const counts = new Map();
  for (const a of articles) if (a.categorie && a.disponible) counts.set(a.categorie.id, (counts.get(a.categorie.id) || 0) + 1);
  const derniers = articles.filter((a) => a.disponible).sort((x, y) => String(y.created_at).localeCompare(String(x.created_at))).slice(0, 8);
  const catParSlug = new Map(categories.map((c) => [c.slug, c]));
  const bouton = (lien) => {
    if (/#infos$/.test(lien || '')) return 'Venir voir en magasin';
    const c = catParSlug.get(new URLSearchParams((lien || '').split('?')[1] || '').get('cat'));
    return c ? `Voir le rayon ${c.nom}` : 'Voir le catalogue';
  };

  main.innerHTML = `
    <section class="hero">
      <div class="wrap hero-in">
        <img class="hero-logo" src="paytoocash-logo/logo.svg" alt="Paytoocash" width="320" height="76">
        <h1 class="hero-title">${esc(pub(b.slogan) || 'Nous rachetons tous vos objets en cash')}</h1>
        <p class="hero-sub">Achat-vente d'occasion à Pontarlier : high-tech, gaming, outillage pro et bien plus, vérifiés et garantis.${pub(b.atout) ? ` ${esc(b.atout)} à visiter.` : ''}</p>
        <div class="btn-row hero-ctas">
          <a class="btn btn-gold btn-lg" href="rachat.html">${icon('cash')}Faire racheter un objet</a>
          <a class="btn btn-white btn-lg" href="catalogue.html">${icon('search')}Voir le catalogue</a>
        </div>
        <ul class="hero-points">
          <li class="anim-icon">${icon('cash')}Paiement cash immédiat</li>
          <li class="anim-icon">${icon('shield')}Occasion garantie</li>
          <li class="anim-icon">${icon('store')}${esc(pub(b.atout) || 'Magasin')} à Pontarlier</li>
        </ul>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="section-head">
          <h2 class="h2">Nos rayons</h2>
          <a class="link-more" href="catalogue.html">Tout le catalogue ${icon('arrow')}</a>
        </div>
        <div class="cat-grid">
          ${categories.map((c) => categoryCard(c, counts.get(c.id) || 0)).join('')}
        </div>
      </div>
    </section>

    ${derniers.length ? `
    <section class="section section-alt">
      <div class="wrap">
        <div class="section-head">
          <h2 class="h2">Derniers arrivages</h2>
          <a class="link-more" href="catalogue.html">Voir tout ${icon('arrow')}</a>
        </div>
        <div class="grid">${derniers.map(articleCard).join('')}</div>
      </div>
    </section>` : ''}

    ${b.vitrine.length ? `
    <section class="section">
      <div class="wrap banners${b.vitrine.length > 1 ? ' banners-2' : ''}">
        ${b.vitrine.map((v) => `
        <a class="banner reveal anim-icon" href="${esc(v.lien || 'catalogue.html')}">
          <img class="banner-img" src="${esc(v.photo)}" alt="" loading="lazy" data-fallback="${esc(v.icone || 'carton')}">
          <div class="banner-text">
            ${v.categorie ? `<span class="banner-kicker">${icon(v.icone || 'sparkle')}${esc(v.categorie)}</span>` : ''}
            <h2>${esc(v.titre)}</h2>
            ${v.texte ? `<p>${esc(v.texte)}</p>` : ''}
            <span class="btn btn-gold btn-sm">${esc(bouton(v.lien))} ${icon('arrow')}</span>
          </div>
        </a>`).join('')}
      </div>
    </section>` : ''}

    ${b.galerie.length ? `
    <section class="section section-alt">
      <div class="wrap">
        <h2 class="h2">Le magasin</h2>
        <p class="lead">${esc(pub(b.atout) || 'Nos salles de vente')} au 16 rue Denis Papin : venez flâner, tout est en rayon.</p>
        <div class="gallery-shop">
          ${b.galerie.map((src) => `<a class="reveal" href="${esc(src)}" target="_blank" rel="noopener"><img src="${esc(src)}" alt="Le magasin Paytoocash" loading="lazy"></a>`).join('')}
        </div>
      </div>
    </section>` : ''}

    ${b.avis.liste.length ? `
    <section class="section">
      <div class="wrap">
        <div class="section-head">
          <h2 class="h2">Ils nous font confiance</h2>
          ${b.avis.note ? `<p class="avis-score">${etoiles(b.avis.note)} <strong>${String(b.avis.note).replace('.', ',')}/5</strong>${b.avis.nombre ? ` · ${esc(b.avis.nombre)} avis Google` : ''}</p>` : ''}
        </div>
        <div class="avis-grid">
          ${b.avis.liste.map((a) => `
            <figure class="avis reveal">
              ${a.note ? `<div class="avis-stars" aria-label="${a.note} sur 5">${etoiles(a.note)}</div>` : ''}
              <blockquote>${esc(a.texte)}</blockquote>
              <figcaption><strong>${esc(a.auteur || 'Client')}</strong>${a.date ? ` · ${esc(a.date)}` : ''}</figcaption>
            </figure>`).join('')}
        </div>
        ${b.avis.lien ? `<p class="center"><a class="btn btn-outline" href="${esc(b.avis.lien)}" target="_blank" rel="noopener">${icon('star')}Voir tous les avis sur Google</a></p>` : ''}
      </div>
    </section>` : ''}

    ${b.facebook ? `
    <section class="section">
      <div class="wrap">
        <a class="fb-follow reveal anim-icon" href="${esc(facebookHref(b.facebook))}" target="_blank" rel="noopener">
          ${facebookLogo()}
          <div class="fb-follow-text">
            <h2>Suivez-nous sur Facebook</h2>
            <p>Les nouveaux arrivages sont publiés en premier sur notre page : soyez les premiers sur les bonnes affaires.</p>
          </div>
          <span class="btn btn-fb">${facebookLogo()}Suivez-nous</span>
        </a>
      </div>
    </section>` : ''}

    <section class="section section-green">
      <div class="wrap rachat-teaser reveal">
        <div>
          <h2 class="h2">Un objet qui dort dans un placard ?</h2>
          <p>Apportez-le en magasin : estimation sur place et paiement cash immédiat.</p>
        </div>
        <div class="btn-row">
          <a class="btn btn-gold" href="rachat.html">${icon('cash')}Comment ça marche</a>
          <a class="btn btn-white" href="${smsHref(b.tel, 'Bonjour, je souhaite faire racheter : ')}">${icon('message')}Envoyer un SMS</a>
        </div>
      </div>
    </section>

    ${infosPratiques(b)}`;

  jsonLd(b);
  finishPage(data);
} catch (e) {
  showError(main, e);
}
