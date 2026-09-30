// Clavier integre de secours. Sur iPhone, dans l'application ajoutee a l'ecran
// d'accueil, iOS n'ouvre parfois pas son clavier (bug WebKit 279904) : le champ
// est actif mais rien ne s'affiche. Ce clavier prend alors le relais.
//
// Declenchement : application installee sur iPhone/iPad, un champ vient d'etre
// touche, et 0,7 s plus tard l'ecran visible n'a pas retreci (le clavier d'iOS
// n'est donc pas la). Une fois declenche, il reste en service jusqu'a la
// fermeture de l'application. Pour essai : localStorage « stf-clavier-integre »
// a « toujours » (ou « jamais » pour le couper).
(function () {
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const installee = navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
  const reglage = (() => { try { return localStorage.getItem('stf-clavier-integre'); } catch { return null; } })();
  if (reglage === 'jamais') return;

  const TYPES_TEXTE = new Set(['text', 'search', 'email', 'tel', 'url', 'number']);
  const estChamp = (el) => !!el && !el.readOnly && !el.disabled
    && (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && TYPES_TEXTE.has(el.type)));
  const estNombre = (el) => el.dataset.clavierNombre === '1' || el.type === 'number';
  const MAJUSCULE_AUTO = new Set(['nom', 'prenom', 'compagnie']);

  let actif = reglage === 'toujours';
  let champ = null;
  let maj = false;
  let disposition = 'lettres';

  const DISPOSITIONS = {
    lettres: [
      ['é', 'è', 'ê', 'à', 'â', 'ç', 'ô', 'î', 'ï', 'ü'],
      ['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm'],
      ['⇧', 'w', 'x', 'c', 'v', 'b', 'n', "'", '⌫'],
      ['123', '-', 'espace', 'Suivant', 'OK'],
    ],
    symboles: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      ['.', ',', '/', '(', ')', '&', '@', '+', ':', '?'],
      ['ABC', '-', 'espace', '⌫'],
      ['Suivant', 'OK'],
    ],
    nombres: [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['.', '0', '⌫'],
      ['Suivant', 'OK'],
    ],
  };
  const LARGES = { espace: 4, Suivant: 2, OK: 2, '123': 1.5, ABC: 1.5, '⇧': 1.5, '⌫': 1.5 };

  const panneau = document.createElement('div');
  panneau.className = 'clavier';
  panneau.hidden = true;
  panneau.setAttribute('aria-hidden', 'true');

  function dessiner() {
    const lignes = DISPOSITIONS[champ && estNombre(champ) ? 'nombres' : disposition];
    panneau.classList.toggle('pave', lignes === DISPOSITIONS.nombres);
    panneau.innerHTML = '<div class="clavier-titre">Clavier de secours</div>' + lignes.map((ligne) =>
      `<div class="clavier-ligne">${ligne.map((t) => {
        const aff = t.length === 1 && maj ? t.toUpperCase() : t === 'espace' ? ' ' : t;
        const classe = t.length > 1 || t === '⇧' || t === '⌫' ? 'k fonction' : 'k';
        const actifMaj = t === '⇧' && maj ? ' enfonce' : '';
        return `<button type="button" tabindex="-1" class="${classe}${actifMaj}${t === 'OK' ? ' ok' : ''}"
          data-t="${t.replace(/"/g, '&quot;')}" style="flex:${LARGES[t] || 1}">${aff}</button>`;
      }).join('')}</div>`).join('');
  }

  function signaler() {
    champ.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function inserer(texte) {
    if (estNombre(champ)) {
      if (texte === '.' && champ.value.includes('.')) return;
      champ.value += texte;
    } else {
      const debut = champ.selectionStart ?? champ.value.length;
      const fin = champ.selectionEnd ?? debut;
      champ.setRangeText(texte, debut, fin, 'end');
    }
    signaler();
  }
  function effacer() {
    if (estNombre(champ)) {
      champ.value = champ.value.slice(0, -1);
    } else {
      const debut = champ.selectionStart ?? champ.value.length;
      const fin = champ.selectionEnd ?? debut;
      if (debut !== fin) champ.setRangeText('', debut, fin, 'end');
      else if (debut > 0) champ.setRangeText('', debut - 1, debut, 'end');
    }
    signaler();
  }
  function suivant() {
    const conteneur = champ.closest('form') || document;
    const champs = [...conteneur.querySelectorAll('input, select, textarea')]
      .filter((el) => el.offsetParent !== null && !el.disabled && el.type !== 'hidden'
        && el.type !== 'radio' && el.type !== 'checkbox' && !el.readOnly);
    const i = champs.indexOf(champ);
    const prochain = champs[i + 1];
    if (prochain) prochain.focus();
    else fermer();
  }
  function fermer() {
    const el = champ;
    cacher();
    el?.blur();
  }

  // Les chiffres d'un champ numerique passent en texte le temps de la saisie :
  // un champ « number » refuse une valeur intermediaire comme « 12. ».
  function preparer(el) {
    el.inputMode = 'none';
    if (el.type === 'number') {
      el.dataset.clavierNombre = '1';
      el.type = 'text';
    }
  }

  function montrer() {
    if (!champ) return;
    preparer(champ);
    maj = MAJUSCULE_AUTO.has(champ.name) && champ.value === '';
    disposition = 'lettres';
    dessiner();
    panneau.hidden = false;
    document.body.classList.add('clavier-ouvert');
    document.documentElement.style.setProperty('--hauteur-clavier', panneau.offsetHeight + 'px');
    requestAnimationFrame(() => rendreVisible(champ));
  }
  // Amene le champ au milieu de la zone restee visible au-dessus du clavier.
  function rendreVisible(el) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    const limite = panneau.hidden ? window.innerHeight : panneau.getBoundingClientRect().top;
    const decalage = r.top + r.height / 2 - limite / 2;
    const conteneur = el.closest('.dlg-fond');
    if (conteneur) conteneur.scrollBy({ top: decalage, behavior: 'smooth' });
    else window.scrollBy({ top: decalage, behavior: 'smooth' });
  }
  function cacher() {
    panneau.hidden = true;
    document.body.classList.remove('clavier-ouvert');
    champ = null;
  }

  // Toucher une touche ne doit pas faire perdre le champ actif.
  panneau.addEventListener('pointerdown', (e) => e.preventDefault());
  panneau.addEventListener('mousedown', (e) => e.preventDefault());
  panneau.addEventListener('click', (e) => {
    const b = e.target.closest('[data-t]');
    if (!b || !champ) return;
    const t = b.dataset.t;
    if (t === '⌫') effacer();
    else if (t === '⇧') { maj = !maj; dessiner(); }
    else if (t === '123') { disposition = 'symboles'; dessiner(); }
    else if (t === 'ABC') { disposition = 'lettres'; dessiner(); }
    else if (t === 'espace') inserer(' ');
    else if (t === 'Suivant') suivant();
    else if (t === 'OK') fermer();
    else {
      inserer(maj ? t.toUpperCase() : t);
      if (maj) { maj = false; dessiner(); }
    }
  });

  document.addEventListener('focusin', (e) => {
    if (!estChamp(e.target)) {
      if (!panneau.contains(e.target)) cacher();
      return;
    }
    champ = e.target;
    if (actif) { montrer(); return; }
    if (!(ios && installee)) return;
    const visible = () => window.visualViewport?.height ?? window.innerHeight;
    const avant = visible();
    const cible = champ;
    setTimeout(() => {
      if (document.activeElement !== cible) return;
      // Le clavier d'iOS reduit la zone visible d'au moins 150 px.
      if (avant - visible() < 120) { actif = true; champ = cible; montrer(); }
    }, 700);
  });
  document.addEventListener('focusout', () => {
    setTimeout(() => {
      if (!estChamp(document.activeElement)) cacher();
    }, 0);
  });

  const installer = () => document.body.appendChild(panneau);
  if (document.body) installer();
  else document.addEventListener('DOMContentLoaded', installer);
})();
