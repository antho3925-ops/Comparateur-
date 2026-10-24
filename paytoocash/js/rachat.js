import { icon } from './icons.js';
import { loadData } from './store.js';
import { initPage, finishPage, catVisual, showError } from './layout.js';
import { infosPratiques } from './infos.js';
import { esc, pub, telHref, smsHref } from './util.js';

initPage('rachat');
const main = document.getElementById('main');

try {
  const data = await loadData();
  const { boutique: b, categories } = data;
  const sms = smsHref(b.tel, "Bonjour, je souhaite faire racheter : (marque, modèle, état, accessoires). Je vous joins des photos.");

  main.innerHTML = `
    <section class="hero hero-sm">
      <div class="wrap hero-in">
        <span class="hero-kicker anim-icon">${icon('cash')}Rachat cash</span>
        <h1 class="hero-title">${esc(pub(b.slogan) || 'Nous rachetons tous vos objets en cash')}</h1>
        <p class="hero-sub">Vous vendez, on vous paie tout de suite, en espèces. Pas d'annonce à publier, pas d'inconnu à recevoir chez vous.</p>
        <div class="btn-row hero-ctas">
          <a class="btn btn-gold btn-lg" href="${telHref(b.tel)}">${icon('phone')}Appeler le magasin</a>
          <a class="btn btn-white btn-lg" href="${sms}">${icon('message')}Envoyer des photos par SMS</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <h2 class="h2 center">Comment ça marche ?</h2>
        <ol class="steps">
          <li class="step reveal anim-icon">
            <span class="step-ico">${icon('store')}</span>
            <h3>1. Apportez votre objet</h3>
            <p>Passez au magasin avec l'objet, son chargeur et ses accessoires. Une question avant de vous déplacer ? Envoyez-nous des photos par SMS.</p>
          </li>
          <li class="step reveal anim-icon">
            <span class="step-ico">${icon('eye')}</span>
            <h3>2. Estimation sur place</h3>
            <p>On vérifie l'objet devant vous et on vous fait une offre. Vous êtes libre de l'accepter ou non.</p>
          </li>
          <li class="step reveal anim-icon">
            <span class="step-ico">${icon('cash')}</span>
            <h3>3. Paiement cash immédiat</h3>
            <p>Offre acceptée : vous repartez avec l'argent en main, sans attendre.</p>
          </li>
        </ol>
      </div>
    </section>

    <section class="section section-alt">
      <div class="wrap">
        <h2 class="h2 center">Ce que nous rachetons</h2>
        <p class="lead center">Et bien d'autres choses encore : demandez-nous !</p>
        <div class="buy-grid">
          ${categories.map((c) => `<div class="buy-item reveal anim-icon"><span class="cat-icon">${catVisual(c)}</span>${esc(c.nom)}</div>`).join('')}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap tips reveal">
        <h2 class="h2">Pour une meilleure offre</h2>
        <ul class="tip-list">
          <li>${icon('id')}<span><strong>Pièce d'identité en cours de validité</strong> : obligatoire pour tout rachat.</span></li>
          <li>${icon('check')}<span>Un objet <strong>propre et en état de marche</strong>, chargé si possible.</span></li>
          <li>${icon('receipt')}<span>La <strong>facture</strong>, la <strong>boîte</strong> et les <strong>accessoires</strong> d'origine augmentent l'estimation.</span></li>
          <li>${icon('smartphone')}<span>Téléphones et tablettes : pensez à <strong>déconnecter votre compte</strong> (iCloud, Google) avant de venir.</span></li>
        </ul>
        <div class="btn-row">
          <a class="btn btn-green" href="${telHref(b.tel)}">${icon('phone')}${esc(b.tel)}</a>
          <a class="btn btn-gold" href="${sms}">${icon('message')}Demander une estimation par SMS</a>
        </div>
      </div>
    </section>

    ${infosPratiques(b)}`;

  finishPage(data);
} catch (e) {
  showError(main, e);
}
