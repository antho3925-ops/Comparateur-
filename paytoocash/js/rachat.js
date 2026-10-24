import { icon } from './icons.js';
import { loadData, getClient } from './store.js';
import { initPage, finishPage, catVisual, showError } from './layout.js';
import { infosPratiques } from './infos.js';
import { esc, pub, telHref, smsHref, whatsappHref, reduire, qs } from './util.js';

initPage('rachat');
const main = document.getElementById('main');

function brancherEstimation(data, wa) {
  const form = qs('#estim-form'), err = qs('#estim-err');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const t = (k) => String(f.get(k) ?? '').trim();
    const fichiers = [...form.photos.files].filter((x) => x.size);
    const tel = t('tel').replace(/[^\d+]/g, '');
    err.hidden = true;
    if (t('nom').length < 2 || tel.length < 10 || !t('objet')) {
      err.hidden = false; err.textContent = 'Indiquez votre nom, un numéro de téléphone valide et l’objet à vendre.'; return;
    }
    if (fichiers.length > 4) { err.hidden = false; err.textContent = '4 photos maximum.'; return; }
    const resume = `Bonjour, je souhaite faire estimer : ${t('objet')}${t('etat') ? ` (${t('etat')})` : ''}.${t('details') ? ` ${t('details')}.` : ''}${t('prix_souhaite') ? ` Prix souhaité : ${t('prix_souhaite')}.` : ''} ${t('nom')}, ${t('tel')}`;
    // Mode démo (sans base) : la demande part par WhatsApp, photos à joindre à la main.
    if (data.source !== 'supabase') {
      window.open(wa.replace(/text=.*/, 'text=' + encodeURIComponent(resume)), '_blank', 'noopener');
      return;
    }
    const btn = e.submitter; btn.disabled = true;
    const label = btn.innerHTML; btn.textContent = 'Envoi en cours…';
    try {
      const sb = await getClient();
      const photos = [];
      for (const file of fichiers) {
        const img = await reduire(file, 1600);
        const path = `${new Date().toISOString().slice(0, 10)}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        const { error } = await sb.storage.from('estimations').upload(path, img, { contentType: img.type || 'image/jpeg' });
        if (error) throw error;
        photos.push(path);
      }
      const { error } = await sb.from('estimations').insert({
        nom: t('nom'), tel: t('tel'), objet: t('objet'), etat: t('etat') || null,
        details: t('details') || null, prix_souhaite: t('prix_souhaite') || null, photos,
      });
      if (error) throw error;
      form.innerHTML = `<div class="full estim-ok">${icon('check')}<div><strong>Demande envoyée, merci !</strong><br>Le magasin vous rappelle rapidement au ${esc(t('tel'))}.</div></div>`;
    } catch (ex) {
      console.error(ex);
      err.hidden = false;
      err.textContent = 'L’envoi n’a pas abouti. Réessayez, ou envoyez vos photos par WhatsApp.';
      btn.disabled = false; btn.innerHTML = label;
    }
  });
}

try {
  const data = await loadData();
  const { boutique: b, categories } = data;
  const sms = smsHref(b.tel, "Bonjour, je souhaite faire racheter : (marque, modèle, état, accessoires). Je vous joins des photos.");
  const wa = whatsappHref(b.tel, 'Bonjour, je souhaite faire racheter : (marque, modèle, état, accessoires). Je vous envoie des photos.');

  main.innerHTML = `
    <section class="hero hero-sm">
      <div class="wrap hero-in">
        <span class="hero-kicker anim-icon">${icon('cash')}Rachat cash</span>
        <h1 class="hero-title">${esc(pub(b.slogan) || 'Nous rachetons tous vos objets en cash')}</h1>
        <p class="hero-sub">Vous vendez, on vous paie tout de suite, en espèces. Pas d'annonce à publier, pas d'inconnu à recevoir chez vous.</p>
        <div class="btn-row hero-ctas">
          <a class="btn btn-gold btn-lg" href="${telHref(b.tel)}">${icon('phone')}Appeler le magasin</a>
          <a class="btn btn-white btn-lg" href="#estimation">${icon('cash')}Demander une estimation</a>
          <a class="btn btn-white btn-lg" href="${wa}" target="_blank" rel="noopener">${icon('whatsapp')}Photos par WhatsApp</a>
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

    <section class="section section-green" id="estimation">
      <div class="wrap estim">
        <div class="estim-intro">
          <h2 class="h2">Demande d'estimation</h2>
          <p>Décrivez votre objet et ajoutez des photos : le magasin vous rappelle avec une première idée de prix. L'offre définitive est faite en magasin, après vérification.</p>
        </div>
        <form class="estim-form form-grid" id="estim-form" novalidate>
          <label>Votre prénom et nom *<input name="nom" required maxlength="80" autocomplete="name"></label>
          <label>Votre téléphone *<input name="tel" type="tel" required maxlength="30" autocomplete="tel" inputmode="tel"></label>
          <label class="full">Objet à vendre *<input name="objet" required maxlength="200" placeholder="Ex. : iPhone 14 128 Go, perceuse Makita 18 V…"></label>
          <label>État<select name="etat">
            <option value="">— Choisir —</option>
            <option>Neuf, jamais servi</option><option>Très bon état</option><option>Bon état</option><option>Traces d'usure</option><option>Ne fonctionne plus</option>
          </select></label>
          <label>Prix souhaité (facultatif)<input name="prix_souhaite" maxlength="30" inputmode="decimal" placeholder="Ex. : 300 €"></label>
          <label class="full">Accessoires, boîte, facture, remarques<textarea name="details" rows="3" maxlength="1500"></textarea></label>
          <label class="full">Photos (4 maximum)<input name="photos" type="file" accept="image/*" multiple></label>
          <p class="full form-err-pub" id="estim-err" hidden></p>
          <button class="btn btn-gold btn-lg full" type="submit">${icon('cash')}Envoyer ma demande</button>
          <p class="full small estim-note">Vos coordonnées servent uniquement à vous recontacter au sujet de cette demande.</p>
        </form>
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
          <a class="btn btn-gold" href="${sms}">${icon('message')}SMS</a>
          <a class="btn btn-outline" href="${wa}" target="_blank" rel="noopener">${icon('whatsapp')}WhatsApp</a>
        </div>
      </div>
    </section>

    ${infosPratiques(b)}`;

  brancherEstimation(data, wa);
  finishPage(data);
} catch (e) {
  showError(main, e);
}
