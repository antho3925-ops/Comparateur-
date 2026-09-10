/* ============================================================================
   Mina Tantra — logique du site
   Tout le contenu vient de data/contenu.js : ce fichier ne fait que l'afficher.
   ========================================================================== */
(function () {
  'use strict';

  var $  = function (s) { return document.querySelector(s); };
  var esc = function (t) {
    return String(t == null ? '' : t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  /* ------------------------------ Porte 18+ ------------------------------ */
  var CLE = 'mina-tantra-majeur';
  var porte = $('#porte');
  var dejaEntre = false;
  try { dejaEntre = localStorage.getItem(CLE) === 'oui'; } catch (e) {}

  if (!dejaEntre) {
    porte.hidden = false;
    document.body.classList.add('bloque');
  }
  $('#porte-oui').addEventListener('click', function () {
    try { localStorage.setItem(CLE, 'oui'); } catch (e) {}
    porte.hidden = true;
    document.body.classList.remove('bloque');
  });

  /* ------------------------------ Présentation --------------------------- */
  $('#presentation-texte').innerHTML =
    PRESENTATION.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');

  $('#atouts').innerHTML = ATOUTS.map(function (a) {
    return '<article class="atout"><h3>' + esc(a.titre) + '</h3><p>' + esc(a.texte) + '</p></article>';
  }).join('');

  /* ------------------------------- Masseuses ----------------------------- */
  $('#grille-masseuses').innerHTML = MASSEUSES.map(function (m) {
    var meta = [];
    if (m.age)     meta.push(m.age + ' ans');
    if (m.origine) meta.push(m.origine);

    var photo = m.photo
      ? '<img src="' + esc(m.photo) + '" alt="' + esc(m.prenom) + '" loading="lazy"' +
        ' onerror="this.style.display=\'none\'">'
      : '';

    var etat = m.disponible === false
      ? '<span class="fiche-etat absente">Bientôt de retour</span>'
      : '<span class="fiche-etat">Disponible</span>';

    var tags = (m.specialites || []).map(function (s) {
      return '<span class="tag">' + esc(s) + '</span>';
    }).join('');

    return '' +
      '<article class="fiche">' +
        '<div class="fiche-photo">' +
          '<span class="fiche-initiale">' + esc((m.prenom || '?').charAt(0)) + '</span>' +
          photo + etat +
        '</div>' +
        '<div class="fiche-corps">' +
          '<h3 class="fiche-nom">' + esc(m.prenom) + '</h3>' +
          (meta.length ? '<p class="fiche-meta">' + esc(meta.join(' · ')) + '</p>' : '') +
          '<p class="fiche-texte">' + esc(m.presentation) + '</p>' +
          (m.langues ? '<p class="fiche-langues">Langues : ' + esc(m.langues) + '</p>' : '') +
          '<div class="tags">' + tags + '</div>' +
        '</div>' +
      '</article>';
  }).join('');

  /* -------------------------------- Horaires ----------------------------- */
  var jourJs = new Date().getDay();                       // 0 = dimanche
  var jourAuj = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'][jourJs];

  $('#horaires-table').innerHTML = '<tbody>' + HORAIRES.map(function (h) {
    var classes = [];
    if (/ferm/i.test(h.heures)) classes.push('ferme');
    if (h.jour.toLowerCase() === jourAuj.toLowerCase()) classes.push('aujourdhui');
    return '<tr' + (classes.length ? ' class="' + classes.join(' ') + '"' : '') + '>' +
             '<td>' + esc(h.jour) + '</td><td>' + esc(h.heures) + '</td></tr>';
  }).join('') + '</tbody>';

  $('#horaires-note').textContent = HORAIRES_NOTE;

  /* --------------------------------- Tarifs ------------------------------ */
  $('#grille-tarifs').innerHTML = TARIFS.map(function (t) {
    var lignes = (t.lignes || []).map(function (l) {
      return '<li><span class="duree">' + esc(l.duree) + '</span>' +
             '<span class="prix">' + esc(l.prix) + '</span></li>';
    }).join('');
    return '<article class="carte-tarif' + (t.vedette ? ' vedette' : '') + '">' +
             '<h3>' + esc(t.nom) + '</h3>' +
             (t.resume ? '<p class="resume">' + esc(t.resume) + '</p>' : '') +
             '<ul class="lignes">' + lignes + '</ul>' +
           '</article>';
  }).join('');

  $('#supplements').innerHTML = SUPPLEMENTS.map(function (s) {
    return '<li><span class="supp-nom">' + esc(s.nom) + '</span>' +
           '<span class="supp-prix">' + esc(s.prix) + '</span></li>';
  }).join('');

  $('#tarifs-note').textContent = TARIFS_NOTE;

  /* -------------------------------- Galerie ------------------------------ */
  $('#grille-galerie').innerHTML = GALERIE.map(function (g, i) {
    return '<button type="button" class="vignette" data-i="' + i + '">' +
             '<span class="vignette-vide">Photo à venir</span>' +
             '<img src="' + esc(g.src) + '" alt="' + esc(g.legende || 'Le salon') + '"' +
             ' loading="lazy" onerror="this.style.display=\'none\'">' +
             (g.legende ? '<span class="vignette-legende">' + esc(g.legende) + '</span>' : '') +
           '</button>';
  }).join('');

  var lightbox = $('#lightbox');
  var lbImg = $('#lightbox-img');
  var lbLeg = $('#lightbox-legende');

  $('#grille-galerie').addEventListener('click', function (ev) {
    var bouton = ev.target.closest('.vignette');
    if (!bouton) return;
    var img = bouton.querySelector('img');
    if (!img || img.style.display === 'none') return;      // pas de photo déposée
    var item = GALERIE[bouton.dataset.i];
    lbImg.src = item.src;
    lbImg.alt = item.legende || '';
    lbLeg.textContent = item.legende || '';
    lightbox.hidden = false;
    document.body.classList.add('bloque');
  });

  function fermerLightbox() {
    lightbox.hidden = true;
    lbImg.src = '';
    document.body.classList.remove('bloque');
  }
  $('#lightbox-fermer').addEventListener('click', fermerLightbox);
  lightbox.addEventListener('click', function (ev) {
    if (ev.target === lightbox) fermerLightbox();
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && !lightbox.hidden) fermerLightbox();
  });

  /* -------------------------------- Contact ------------------------------ */
  var telBrut = (SALON.telephone || '').replace(/[^\d+]/g, '');
  $('#contact-tel').innerHTML = '<a href="tel:' + esc(telBrut) + '">' + esc(SALON.telephone) + '</a>';

  var boutons = [];
  if (telBrut) {
    boutons.push('<a class="btn btn-plein" href="tel:' + esc(telBrut) + '">Appeler</a>');
  }
  if (SALON.whatsapp) {
    var wa = SALON.whatsapp.replace(/[^\d]/g, '');
    boutons.push('<a class="btn btn-vide" href="https://wa.me/' + esc(wa) +
                 '" target="_blank" rel="noopener">WhatsApp</a>');
  }
  if (SALON.email) {
    boutons.push('<a class="btn btn-vide" href="mailto:' + esc(SALON.email) + '">E-mail</a>');
  }
  $('#contact-boutons').innerHTML = boutons.join('');

  var adresseComplete = [SALON.adresse, SALON.codePostal].filter(Boolean).join(', ');
  $('#contact-adresse').innerHTML =
    '<span class="contact-adresse-rue">' + esc(SALON.adresse) + '</span>' +
    (SALON.codePostal ? '<span class="contact-adresse-ville">' + esc(SALON.codePostal) + '</span>' : '') +
    '<a class="contact-lien" target="_blank" rel="noopener"' +
    ' href="https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent(adresseComplete) + '">Voir sur la carte &rarr;</a>';
  $('#contact-parking').textContent = SALON.parking || '';

  $('#regles').innerHTML = REGLES.map(function (r) {
    return '<li>' + esc(r) + '</li>';
  }).join('');

  $('#pied-adresse').textContent = adresseComplete;
  $('#annee').textContent = new Date().getFullYear();

  /* --------------------------- Menu & navigation ------------------------- */
  var entete = $('#entete');
  var menu   = $('#menu');
  var burger = $('#burger');

  burger.addEventListener('click', function () {
    var ouvert = menu.classList.toggle('ouvert');
    burger.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
  });
  menu.addEventListener('click', function (ev) {
    if (ev.target.tagName === 'A') {
      menu.classList.remove('ouvert');
      burger.setAttribute('aria-expanded', 'false');
    }
  });

  var liens = Array.prototype.slice.call(menu.querySelectorAll('a[href^="#"]'));
  var sections = liens
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  function surDefilement() {
    entete.classList.toggle('colle', window.scrollY > 40);

    var courant = null;
    sections.forEach(function (s) {
      if (s.getBoundingClientRect().top <= 120) courant = s.id;
    });
    liens.forEach(function (a) {
      a.classList.toggle('actif', a.getAttribute('href') === '#' + courant);
    });
  }
  window.addEventListener('scroll', surDefilement, { passive: true });
  surDefilement();
})();
