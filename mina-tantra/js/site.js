/* ============================================================================
   Chez Eva — logique du site
   Tout le contenu vient de js/contenu.js : ce fichier ne fait que l'afficher.
   ========================================================================== */
(function () {
  'use strict';

  var $  = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var esc = function (t) {
    return String(t == null ? '' : t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  /* ============================== Les langues ============================= */
  /* Le francais vit dans contenu.js ; les autres langues dans traductions.js.
     Le choix du visiteur est retenu, et un changement recharge simplement la
     page : tout se reconstruit alors dans la bonne langue. */
  var LANGUES_CONNUES = (typeof LANGUES_SITE !== 'undefined') ? LANGUES_SITE
    : [{ code: 'fr', drapeau: '🇫🇷', nom: 'Français', locale: 'fr-CH' }];
  var CLE_LANGUE = 'chez-eva-langue';

  function langueDemandee() {
    var par = /[?&]lang=([a-z]{2})/.exec(window.location.search);
    if (par && connue(par[1])) { return par[1]; }
    try {
      var gardee = localStorage.getItem(CLE_LANGUE);
      if (gardee && connue(gardee)) { return gardee; }
    } catch (e) {}
    if (window.LANGUE_SERVEUR && connue(window.LANGUE_SERVEUR)) { return window.LANGUE_SERVEUR; }
    var duTelephone = (navigator.language || '').slice(0, 2).toLowerCase();
    return connue(duTelephone) ? duTelephone : 'fr';
  }

  function connue(code) {
    return LANGUES_CONNUES.some(function (l) { return l.code === code; });
  }

  var LANGUE = langueDemandee();
  var LOCALE = (LANGUES_CONNUES.filter(function (l) { return l.code === LANGUE; })[0] || {}).locale || 'fr-CH';
  document.documentElement.lang = LANGUE;

  var TRAD = (typeof TRADUCTIONS !== 'undefined') ? (TRADUCTIONS[LANGUE] || {}) : {};
  var TRAD_FR = (typeof TRADUCTIONS !== 'undefined') ? (TRADUCTIONS.fr || {}) : {};

  /** L'heure telle qu'on l'ecrit dans la langue courante. */
  function heureAffichee(h) {
    return LANGUE === 'fr' ? String(h).replace(':', 'h') : String(h);
  }

  /** Un texte d'interface, avec le francais pour filet. */
  function T(cle) {
    var ui = TRAD.ui || {};
    if (typeof ui[cle] === 'string') { return ui[cle]; }
    var secours = TRAD_FR.ui || {};
    return typeof secours[cle] === 'string' ? secours[cle] : '';
  }

  /** Un morceau de contenu traduit, ou celui de contenu.js en francais. */
  function C(nom, defaut) {
    return (TRAD[nom] !== undefined && TRAD[nom] !== null) ? TRAD[nom] : defaut;
  }

  /** La traduction d'un terme du catalogue (prestation, langue, origine). */
  function terme(table, mot) {
    var dico = TRAD[table] || {};
    return dico[mot] || mot;
  }

  /* Le choix de langue, en drapeaux, dans l'en-tete. */
  (function poserLesDrapeaux() {
    var zone = $('#langues');
    if (!zone) { return; }
    zone.setAttribute('aria-label', T('langue_choisir'));
    zone.innerHTML = LANGUES_CONNUES.map(function (l) {
      return '<button type="button" class="langue' + (l.code === LANGUE ? ' active' : '')
           + '" data-langue="' + esc(l.code) + '" lang="' + esc(l.code) + '"'
           + ' title="' + esc(l.nom) + '" aria-label="' + esc(l.nom) + '"'
           + (l.code === LANGUE ? ' aria-current="true"' : '') + '>'
           + '<span class="drapeau">' + l.drapeau + '</span>'
           + '<span class="langue-code">' + esc(l.code.toUpperCase()) + '</span>'
           + '</button>';
    }).join('');

    zone.addEventListener('click', function (ev) {
      var b = ev.target.closest('.langue');
      if (!b || b.dataset.langue === LANGUE) { return; }
      try { localStorage.setItem(CLE_LANGUE, b.dataset.langue); } catch (e) {}
      var adresse = window.location.pathname + '?lang=' + b.dataset.langue + window.location.hash;
      window.location.replace(adresse);
    });
  }());

  /* Les textes fixes de la page portent un marqueur : on les remplit ici. */
  $$('[data-t]').forEach(function (el) { el.textContent = T(el.dataset.t); });
  $$('[data-t-html]').forEach(function (el) { el.innerHTML = T(el.dataset.tHtml); });
  $$('[data-t-aria]').forEach(function (el) { el.setAttribute('aria-label', T(el.dataset.tAria)); });

  document.title = T('titre_page');
  var metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) { metaDesc.setAttribute('content', T('description_page')); }

  /* ------------------------------ Porte 18+ ------------------------------ */
  var CLE = 'chez-eva-majeur';
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

  /* ------------------- Le nom du salon, en un seul endroit --------------- */
  ['#porte-marque', '#marque-nom', '#hero-titre', '#pied-marque', '#pied-nom']
    .forEach(function (id) {
      var el = $(id);
      if (el) { el.textContent = SALON.nom; }
    });

  /* A l'arrivee, le nom se compose lettre apres lettre. */
  (function composerLeNom() {
    var titre = $('#hero-titre');
    if (!titre) { return; }

    /* Le nom est toujours decoupe lettre par lettre : c'est ainsi que le C
       recoit sa taille d'embleme. Seule la mise en place animee est laissee
       de cote quand le visiteur demande moins de mouvement. */
    var anime = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var texte = titre.textContent;
    titre.textContent = '';
    texte.split('').forEach(function (lettre, i) {
      var morceau = document.createElement('span');
      morceau.className = lettre === ' ' ? 'espace' : 'lettre';
      morceau.textContent = lettre === ' ' ? '\u00A0' : lettre;
      if (anime) { morceau.style.animationDelay = (0.3 + i * 0.075) + 's'; }
      if (i === 0) { morceau.classList.add('grand-c'); }
      titre.appendChild(morceau);
    });
    titre.classList.add('compose');
  }());

  /* ------------------------------ Présentation --------------------------- */
  $('#presentation-texte').innerHTML =
    C('presentation', PRESENTATION).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');

  $('#atouts').innerHTML = C('atouts', ATOUTS).map(function (a) {
    return '<article class="atout"><h3>' + esc(a.titre) + '</h3><p>' + esc(a.texte) + '</p></article>';
  }).join('');

  /* ------------------- Les façons de prendre rendez-vous ----------------- */
  if (typeof PRISE_DE_RDV !== 'undefined' && $('#prise-rdv')) {
    $('#prise-rdv-titre').textContent =
      C('priseDeRdvTitre', typeof PRISE_DE_RDV_TITRE === 'string' ? PRISE_DE_RDV_TITRE : '');

    var numeroSalon = (SALON.telephone || '').replace(/[^\d+]/g, '');
    var waSalon = (SALON.whatsapp || '').replace(/\D/g, '');

    $('#prise-rdv').innerHTML = C('priseDeRdv', PRISE_DE_RDV).map(function (f) {
      var lien = '';
      if (f.bouton === 'telephone' && numeroSalon) {
        lien = '<a class="btn btn-plein" href="tel:' + esc(numeroSalon) + '">'
             + esc(SALON.telephone) + '</a>';
      } else if (f.bouton === 'whatsapp' && waSalon) {
        lien = '<a class="btn btn-vide" href="https://wa.me/' + esc(waSalon)
             + '" target="_blank" rel="noopener">' + esc(T('bouton_whatsapp')) + '</a>';
      } else if (f.bouton === 'formulaire') {
        lien = '<a class="btn btn-vide" href="#reserver">' + esc(T('reserver_titre')) + '</a>';
      }
      return '<article class="rdv-carte' + (f.bouton === 'formulaire' ? ' rdv-en-ligne' : '') + '">'
           + '<h4>' + esc(f.titre) + '</h4>'
           + '<p>' + esc(f.texte) + '</p>'
           + lien
           + '</article>';
    }).join('');
  }

  /* ------------------------------- Masseuses ----------------------------- */
  /* Sur le serveur, les fiches viennent de l'administration (data/masseuses.json),
     injectees par index.php. Hors serveur, on retombe sur celles de contenu.js. */
  var fiches = (window.MASSEUSES_SERVEUR && window.MASSEUSES_SERVEUR.length)
    ? window.MASSEUSES_SERVEUR
    : MASSEUSES;

  /* Une masseuse peut n'etre la que sur une periode donnee. Les deux dates
     sont facultatives : sans elles, elle est consideree comme permanente. */
  function jour(iso) {
    var p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
    return p ? new Date(+p[1], +p[2] - 1, +p[3]) : null;
  }

  function enFrancais(d) {
    var options = { day: 'numeric', month: 'long' };
    if (d.getFullYear() !== new Date().getFullYear()) { options.year = 'numeric'; }
    return d.toLocaleDateString(LOCALE, options);
  }

  /* Trois situations, et une seule compte vraiment pour le client :
     'ici'     — elle recoit en ce moment ;
     'avenir'  — elle arrive a une date connue ;
     'absente' — elle n'est pas la, sans date de retour. */
  function presence(m) {
    var debut = jour(m.debut);
    var fin = jour(m.fin);
    var aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);

    if (m.disponible === false || (fin && aujourdhui > fin)) {
      return { etat: 'absente', badge: T('badge_bientot'), ligne: null };
    }
    if (debut && aujourdhui < debut) {
      var meme = fin && debut.getMonth() === fin.getMonth()
                     && debut.getFullYear() === fin.getFullYear();
      return {
        etat: 'avenir',
        badge: T('badge_a_partir') + ' ' + enFrancais(debut),
        ligne: fin
          ? T('ligne_presente_du') + ' ' + (meme ? debut.getDate() : enFrancais(debut))
            + ' ' + T('ligne_au') + ' ' + enFrancais(fin)
          : null
      };
    }
    if (fin) {
      return { etat: 'ici', badge: T('badge_disponible'),
               ligne: T('ligne_jusquau') + ' ' + enFrancais(fin) };
    }
    return { etat: 'ici', badge: T('badge_disponible'), ligne: null };
  }

  /* Les langues, avec leur drapeau quand elles figurent au catalogue.
     Accepte aussi bien une liste qu'une ancienne saisie en texte libre. */
  function languesAffichees(valeur) {
    var liste = Array.isArray(valeur)
      ? valeur
      : String(valeur || '').split(',');
    liste = liste.map(function (l) { return String(l).trim(); }).filter(Boolean);
    if (!liste.length) { return ''; }

    var connues = (typeof LANGUES !== 'undefined') ? LANGUES : [];
    return liste.map(function (l) {
      var trouvee = null;
      connues.forEach(function (c) {
        if (c.nom.toLowerCase() === l.toLowerCase()) { trouvee = c; }
      });
      return '<span class="langue">'
           + (trouvee ? esc(trouvee.drapeau) + ' ' + esc(terme('languesParlees', trouvee.nom))
                      : esc(l))
           + '</span>';
    }).join('');
  }

  /* Le salon peut saisir la presentation d'une masseuse dans chaque langue.
     Tant qu'un champ est vide, le francais tient lieu de version unique. */
  function presentationTraduite(m) {
    var propre = m['presentation_' + LANGUE];
    return (typeof propre === 'string' && propre.trim() !== '') ? propre : (m.presentation || '');
  }

  /* Construit une fiche. Le bouton d'appel n'apparait que pour les masseuses
     presentes — proposer d'appeler quelqu'un qui n'est pas la ne sert qu'a
     decevoir — et celles qui arrivent a une date connue recoivent a la place
     un bouton de reservation anticipee. */
  function carteMasseuse(m, choix) {
    var avecAppel = choix && choix.appel;
    var meta = [];
    if (m.age)     { meta.push(m.age + ' ' + T('ans')); }
    if (m.origine) { meta.push(terme('origines', m.origine)); }

    var principale = m.photo || (m.photos && m.photos[0]);
    var photo = principale
      ? '<img src="' + esc(principale) + '" alt="' + esc(m.prenom) + '" loading="lazy"' +
        ' onerror="this.style.display=\'none\'">'
      : '';

    var ici = presence(m);
    var etat = '<span class="fiche-etat' + (ici.etat === 'ici' ? '' : ' absente') + '">'
             + esc(ici.badge) + '</span>';

    var langues = languesAffichees(m.langues);

    var tags = (m.specialites || []).map(function (s) {
      return '<span class="tag">' + esc(terme('specialites', s)) + '</span>';
    }).join('');

    var sonNumero = (m.telephone || '').trim();
    var bouton = '';
    if (avecAppel && sonNumero) {
      bouton = '<a class="fiche-tel" href="tel:' + esc(sonNumero.replace(/[^\d+]/g, '')) + '">'
             + esc(T('fiche_appeler')) + ' ' + esc(m.prenom)
             + ' &middot; ' + esc(sonNumero) + '</a>';
    } else if (choix && choix.reserver) {
      bouton = '<button type="button" class="fiche-reserver" data-masseuse="'
             + esc(m.id || '') + '">' + esc(T('fiche_reserver')) + ' '
             + esc(m.prenom) + '</button>';
    }

    var vignettes = (m.photos || []).map(function (src) {
      return '<button type="button" class="vignette vignette-mini"' +
               ' data-src="' + esc(src) + '" data-legende="' + esc(m.prenom) + '">' +
               '<img src="' + esc(src) + '" alt="' + esc(m.prenom) + '" loading="lazy"' +
               ' onerror="this.closest(\'.vignette\').style.display=\'none\'">' +
             '</button>';
    }).join('');

    return '' +
      '<article class="fiche' + (avecAppel ? '' : ' fiche-attente') + '">' +
        '<div class="fiche-photo">' +
          '<span class="fiche-initiale">' + esc((m.prenom || '?').charAt(0)) + '</span>' +
          photo + etat +
        '</div>' +
        '<div class="fiche-corps">' +
          '<h3 class="fiche-nom">' + esc(m.prenom) + '</h3>' +
          (meta.length ? '<p class="fiche-meta">' + esc(meta.join(' · ')) + '</p>' : '') +
          (ici.ligne ? '<p class="fiche-periode">' + esc(ici.ligne) + '</p>' : '') +
          '<p class="fiche-texte">' + esc(presentationTraduite(m)) + '</p>' +
          (langues ? '<p class="fiche-langues">' + langues + '</p>' : '') +
          '<div class="tags">' + tags + '</div>' +
          bouton +
          (vignettes ? '<div class="fiche-vignettes">' + vignettes + '</div>' : '') +
        '</div>' +
      '</article>';
  }

  /* Trois groupes, du plus utile au moins utile pour le client :
     celles qui recoivent maintenant, celles qu'on peut deja reserver,
     puis celles dont le retour n'a pas de date. */
  var presentes = [];
  var aVenir = [];
  var bientot = [];
  fiches.forEach(function (m) {
    var etat = presence(m).etat;
    if (etat === 'ici') { presentes.push(m); }
    else if (etat === 'avenir') { aVenir.push(m); }
    else { bientot.push(m); }
  });

  var solo = presentes.length === 1;
  $('#masseuses-chapeau').textContent = T(solo ? 'masseuses_chapeau_solo' : 'masseuses_chapeau_equipe');
  $('#masseuses-titre').textContent   = T(solo ? 'masseuses_titre_solo' : 'masseuses_titre_equipe');
  $('#masseuses-intro').textContent   =
    C('masseusesIntro', typeof MASSEUSES_INTRO === 'string' ? MASSEUSES_INTRO : '');

  var grille = $('#grille-masseuses');
  grille.classList.toggle('solo', solo);
  grille.innerHTML = presentes.map(function (m) {
    return carteMasseuse(m, { appel: true });
  }).join('');

  if (!presentes.length) {
    grille.innerHTML = '<p class="intro">' + esc(T('bientot_note')) + '</p>';
  }

  var blocAvance = $('#bloc-avance');
  if (blocAvance) {
    blocAvance.hidden = aVenir.length === 0;
    $('#avance-intro').textContent =
      T(aVenir.length > 1 ? 'avance_intro_plusieurs' : 'avance_intro_une');
    $('#grille-avance').innerHTML = aVenir.map(function (m) {
      return carteMasseuse(m, { reserver: true });
    }).join('');
  }

  var blocBientot = $('#bloc-bientot');
  if (blocBientot) {
    blocBientot.hidden = bientot.length === 0;
    $('#bientot-intro').textContent =
      T(bientot.length > 1 ? 'bientot_intro_plusieurs' : 'bientot_intro_une');
    $('#grille-bientot').innerHTML = bientot.map(function (m) {
      return carteMasseuse(m, {});
    }).join('');
  }

  /* -------------------------------- Horaires ----------------------------- */
  /* Le tableau garde l'ordre de contenu.js (lundi d'abord) ; seuls les mots
     changent de langue. */
  var joursTraduits = C('jours', null);
  var heuresTraduites = C('heures', null);
  var jourJs = new Date().getDay();                       // 0 = dimanche
  var indexAuj = (jourJs + 6) % 7;                        // 0 = lundi

  $('#horaires-table').innerHTML = '<tbody>' + HORAIRES.map(function (h, i) {
    var ferme = /ferm/i.test(h.heures);
    var classes = [];
    if (ferme) classes.push('ferme');
    if (i === indexAuj) classes.push('aujourdhui');
    var nomJour = joursTraduits ? joursTraduits[i] : h.jour;
    var heures = (heuresTraduites && !ferme) ? heuresTraduites : h.heures;
    return '<tr' + (classes.length ? ' class="' + classes.join(' ') + '"' : '') + '>' +
             '<td>' + esc(nomJour) + '</td><td>' + esc(heures) + '</td></tr>';
  }).join('') + '</tbody>';

  $('#horaires-note').textContent = C('horairesNote', HORAIRES_NOTE);

  /* Les jours ou le salon n'ouvre pas, annonces avant que le client n'essaie. */
  (function annoncerFermetures() {
    var etat = window.SALON_ETAT || {};
    var jours = etat.fermetures_jours || [];
    var phrases = [];

    /* Les journees entieres qui se suivent sont regroupees : « fermé du 24
       au 26 décembre » se lit mieux que trois lignes. */
    var debut = null, precedent = null;
    function clore() {
      if (!debut) { return; }
      phrases.push(debut === precedent
        ? T('ferme_le') + ' ' + enFrancais(jour(debut))
        : T('ferme_du') + ' ' + enFrancais(jour(debut))
          + ' ' + T('ferme_au') + ' ' + enFrancais(jour(precedent)));
      debut = null;
    }
    jours.forEach(function (f) {
      if (f.moment !== 'journee') {
        clore();
        phrases.push(T('ferme_le') + ' ' + enFrancais(jour(f.date))
          + T(f.moment === 'matin' ? 'ferme_matin' : 'ferme_apresmidi'));
        precedent = null;
        return;
      }
      if (debut && precedent) {
        var veille = jour(precedent);
        veille.setDate(veille.getDate() + 1);
        var deuxChiffres = function (n) { return (n < 10 ? '0' : '') + n; };
        var lendemain = veille.getFullYear() + '-' + deuxChiffres(veille.getMonth() + 1)
                      + '-' + deuxChiffres(veille.getDate());
        if (lendemain === f.date) { precedent = f.date; return; }
      }
      clore();
      debut = f.date;
      precedent = f.date;
    });
    clore();

    if (!phrases.length) { return; }
    var note = $('#horaires-note');
    var bloc = document.createElement('p');
    bloc.className = 'note note-fermeture';
    bloc.innerHTML = phrases.map(function (d) { return esc(d); }).join('<br>');
    note.parentNode.insertBefore(bloc, note);
  }());

  /* --------------------------------- Tarifs ------------------------------ */
  $('#grille-tarifs').innerHTML = TARIFS.map(function (t) {
    var dit = (TRAD.tarifs || {})[t.nom] || {};
    var lignes = (t.lignes || []).map(function (l) {
      return '<li><span class="duree">' + esc(terme('durees', l.duree)) + '</span>' +
             '<span class="prix">' + esc(l.prix) + '</span></li>';
    }).join('');
    return '<article class="carte-tarif' + (t.vedette ? ' vedette' : '') + '">' +
             '<h3>' + esc(dit.nom || t.nom) + '</h3>' +
             ((dit.resume || t.resume) ? '<p class="resume">' + esc(dit.resume || t.resume) + '</p>' : '') +
             '<ul class="lignes">' + lignes + '</ul>' +
           '</article>';
  }).join('');

  if (typeof QUATRE_MAINS !== 'undefined' && $('#quatre-mains')) {
    $('#quatre-mains').hidden = false;
    var duo = C('quatreMains', QUATRE_MAINS);
    $('#quatre-mains-titre').textContent = duo.titre || '';
    $('#quatre-mains-texte').textContent = duo.texte || '';
    $('#quatre-mains-note').textContent = duo.note || '';
  }

  $('#supplements').innerHTML = SUPPLEMENTS.map(function (s) {
    return '<li><span class="supp-nom">' + esc(terme('supplements', s.nom)) + '</span>' +
           '<span class="supp-prix">' + esc(s.prix) + '</span></li>';
  }).join('');

  $('#tarifs-note').textContent = C('tarifsNote', TARIFS_NOTE);

  /* -------------------------------- Galerie ------------------------------ */
  $('#grille-galerie').innerHTML = GALERIE.map(function (gf, i) {
    var dites = C('galerie', null);
    var g = { src: gf.src, legende: (dites && dites[i]) || gf.legende };
    return '<button type="button" class="vignette"' +
             ' data-src="' + esc(g.src) + '" data-legende="' + esc(g.legende || '') + '">' +
             '<span class="vignette-vide">' + esc(T('photo_a_venir')) + '</span>' +
             '<img src="' + esc(g.src) + '" alt="' + esc(g.legende || 'Le salon') + '"' +
             ' loading="lazy" onerror="this.style.display=\'none\'">' +
             (g.legende ? '<span class="vignette-legende">' + esc(g.legende) + '</span>' : '') +
           '</button>';
  }).join('');

  var lightbox = $('#lightbox');
  var lbImg = $('#lightbox-img');
  var lbLeg = $('#lightbox-legende');
  var lbCompteur = $('#lightbox-compteur');

  /* La visionneuse travaille sur une serie : les vignettes d'une meme fiche,
     ou les photos du salon. On y circule avec les fleches, le clavier ou le
     doigt, sans avoir a ressortir. */
  var serie = [];
  var rang = 0;

  function vignettesVoisines(bouton) {
    var groupe = bouton.closest('.fiche-vignettes')
              || bouton.closest('#grille-galerie')
              || bouton.parentElement;
    return Array.prototype.filter.call(
      groupe.querySelectorAll('.vignette'),
      function (v) {
        var img = v.querySelector('img');
        return img && img.style.display !== 'none';
      }
    );
  }

  function afficherPhoto(n) {
    if (!serie.length) { return; }
    rang = (n + serie.length) % serie.length;          // on boucle
    var photo = serie[rang];
    lbImg.classList.remove('change');
    void lbImg.offsetWidth;            // relance l'animation
    lbImg.classList.add('change');
    lbImg.src = photo.src;
    lbImg.alt = photo.legende || '';
    lbLeg.textContent = photo.legende || '';
    lbCompteur.textContent = serie.length > 1
      ? (rang + 1) + ' / ' + serie.length : '';
    lightbox.classList.toggle('seule', serie.length < 2);
  }

  function ouvrirLightbox(boutons, depart) {
    serie = boutons.map(function (v) {
      return { src: v.dataset.src, legende: v.dataset.legende || '' };
    });
    afficherPhoto(depart);
    lightbox.hidden = false;
    document.body.classList.add('bloque');
  }

  document.addEventListener('click', function (ev) {
    var bouton = ev.target.closest('.vignette');
    if (bouton) {
      var img = bouton.querySelector('img');
      if (!img || img.style.display === 'none') { return; }   // pas de photo déposée
      var voisines = vignettesVoisines(bouton);
      ouvrirLightbox(voisines, voisines.indexOf(bouton));
      return;
    }

    /* La grande photo d'une fiche ouvre la meme serie, des la premiere. */
    var cadre = ev.target.closest('.fiche-photo');
    if (cadre) {
      var fiche = cadre.closest('.fiche');
      var galerie = fiche && fiche.querySelector('.fiche-vignettes');
      if (galerie) {
        var toutes = vignettesVoisines(galerie.querySelector('.vignette'));
        if (toutes.length) { ouvrirLightbox(toutes, 0); }
      }
    }
  });

  $('#lightbox-precedent').addEventListener('click', function (ev) {
    ev.stopPropagation();
    afficherPhoto(rang - 1);
  });
  $('#lightbox-suivant').addEventListener('click', function (ev) {
    ev.stopPropagation();
    afficherPhoto(rang + 1);
  });

  /* Le glissement du doigt, comme dans une galerie de telephone. */
  var departX = null;
  lightbox.addEventListener('touchstart', function (ev) {
    departX = ev.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', function (ev) {
    if (departX === null) { return; }
    var ecart = ev.changedTouches[0].clientX - departX;
    departX = null;
    if (Math.abs(ecart) > 50) { afficherPhoto(rang + (ecart < 0 ? 1 : -1)); }
  }, { passive: true });

  function fermerLightbox() {
    lightbox.hidden = true;
    lbImg.src = '';
    serie = [];
    document.body.classList.remove('bloque');
  }
  $('#lightbox-fermer').addEventListener('click', fermerLightbox);
  lightbox.addEventListener('click', function (ev) {
    if (ev.target === lightbox) fermerLightbox();
  });
  document.addEventListener('keydown', function (ev) {
    if (lightbox.hidden) { return; }
    if (ev.key === 'Escape')     { fermerLightbox(); }
    if (ev.key === 'ArrowLeft')  { afficherPhoto(rang - 1); }
    if (ev.key === 'ArrowRight') { afficherPhoto(rang + 1); }
  });

  /* ----------------------------- Sortie rapide --------------------------- */
  /* Un bouton discret, toujours a portee de pouce : la page est remplacee
     par un site neutre, et l'adresse du salon ne reste pas dans le bouton
     « precedent ». Deux echappements de suite font la meme chose au clavier. */
  var SORTIE_VERS = 'https://www.google.ch/';

  function sortirVite() {
    /* Ce que le navigateur garde de nous reste chez le visiteur : on
       l'efface avant de partir. */
    try {
      localStorage.removeItem(CLE);
      localStorage.removeItem(CLE_LANGUE);
    } catch (e) {}
    window.location.replace(SORTIE_VERS);
  }

  var sortie = $('#sortie');
  if (sortie) {
    sortie.hidden = false;
    sortie.addEventListener('click', sortirVite);
  }

  var dernierEchap = 0;
  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Escape') { return; }
    /* Echap ferme d'abord ce qui est ouvert : la visionneuse, le panneau.
       Le raccourci ne part que depuis la page nue. */
    var quelqueChoseOuvert = ($('#lightbox') && !$('#lightbox').hidden)
                          || ($('#panneau-donnees') && !$('#panneau-donnees').hidden);
    if (quelqueChoseOuvert) { dernierEchap = 0; return; }
    var maintenant = Date.now();
    if (maintenant - dernierEchap < 700) { sortirVite(); }
    dernierEchap = maintenant;
  });

  /* ------------------------------ Vos données ---------------------------- */
  var panneau = $('#panneau-donnees');
  if (panneau) {
    var paragraphes = C('donnees', []);
    $('#panneau-donnees-texte').innerHTML = paragraphes.map(function (d) {
      return '<h3>' + esc(d.titre) + '</h3><p>' + esc(d.texte) + '</p>';
    }).join('');

    var ouvrirDonnees = function (ev) {
      if (ev) { ev.preventDefault(); }
      panneau.hidden = false;
      document.body.classList.add('bloque');
      $('#panneau-fermer').focus();
    };
    var fermerDonnees = function () {
      panneau.hidden = true;
      document.body.classList.remove('bloque');
    };

    $('#lien-donnees').addEventListener('click', ouvrirDonnees);
    $('#panneau-fermer').addEventListener('click', fermerDonnees);
    panneau.addEventListener('click', function (ev) {
      if (ev.target === panneau) { fermerDonnees(); }
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && !panneau.hidden) { fermerDonnees(); }
    });
  }

  /* -------------------------------- Contact ------------------------------ */
  var telBrut = (SALON.telephone || '').replace(/[^\d+]/g, '');
  $('#contact-tel').innerHTML = '<a href="tel:' + esc(telBrut) + '">' + esc(SALON.telephone) + '</a>';

  var boutons = [];
  if (telBrut) {
    boutons.push('<a class="btn btn-plein" href="tel:' + esc(telBrut) + '">'
                 + esc(T('bouton_appeler')) + '</a>');
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
    encodeURIComponent(adresseComplete) + '">' + esc(T('contact_carte')) + ' &rarr;</a>';
  $('#contact-parking').textContent = (TRAD.salon || {}).parking || SALON.parking || '';

  if (SALON.photoEntree) {
    var legendeEntree = (TRAD.salon || {}).photoEntreeLegende
                      || SALON.photoEntreeLegende || T('entree_defaut');
    $('#contact-photo').innerHTML =
      '<button type="button" class="vignette vignette-entree"' +
        ' data-src="' + esc(SALON.photoEntree) + '" data-legende="' + esc(legendeEntree) + '">' +
        '<img src="' + esc(SALON.photoEntree) + '" alt="' + esc(legendeEntree) + '" loading="lazy"' +
        ' onerror="this.closest(\'.vignette\').style.display=\'none\'">' +
        '<span class="vignette-legende">' + esc(legendeEntree) + '</span>' +
      '</button>';
  }

  $('#regles').innerHTML = C('regles', REGLES).map(function (r) {
    return '<li>' + esc(r) + '</li>';
  }).join('');

  $('#pied-adresse').textContent = adresseComplete;
  $('#annee').textContent = new Date().getFullYear();

  /* ------------------- Données structurées (fiche Google) ---------------- */
  var JOURS_SCHEMA = {
    'lundi': 'Monday', 'mardi': 'Tuesday', 'mercredi': 'Wednesday',
    'jeudi': 'Thursday', 'vendredi': 'Friday', 'samedi': 'Saturday',
    'dimanche': 'Sunday'
  };

  var ouvertures = HORAIRES.map(function (h) {
    var plage = String(h.heures).match(/(\d{1,2})h(\d{2}).*?(\d{1,2})h(\d{2})/);
    var jour = JOURS_SCHEMA[h.jour.toLowerCase()];
    if (!plage || !jour) return null;                       // jour fermé
    return {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: jour,
      opens: ('0' + plage[1]).slice(-2) + ':' + plage[2],
      closes: ('0' + plage[3]).slice(-2) + ':' + plage[4]
    };
  }).filter(Boolean);

  var site = SALON.site || '';
  $('#donnees-structurees').textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'HealthAndBeautyBusiness',
    name: SALON.nom,
    description: SALON.slogan,
    url: site || undefined,
    image: site ? site + '/assets/partage.jpg' : undefined,
    telephone: SALON.telephone,
    priceRange: 'CHF 150–350',
    currenciesAccepted: 'CHF',
    paymentAccepted: 'Espèces, Twint',
    address: {
      '@type': 'PostalAddress',
      streetAddress: SALON.adresse,
      postalCode: (SALON.codePostal || '').split(' ')[0],
      addressLocality: SALON.ville,
      addressRegion: 'NE',
      addressCountry: 'CH'
    },
    openingHoursSpecification: ouvertures
  });

  /* ----------------------- Prise de rendez-vous -------------------------- */
  /* Ne fonctionne que servie par le serveur : hors ligne, la section reste
     masquee et le client appelle le salon, comme avant. */
  if (typeof window.MASSEUSES_SERVEUR !== 'undefined') {
    installerReservation();
  }

  function installerReservation() {
    var section = $('#reserver');
    var form = $('#reservation');
    if (!section || !form) { return; }
    section.hidden = false;

    /* Quand le salon suspend la reservation en ligne, la section reste la :
       elle invite simplement a telephoner, pour ne perdre personne. */
    if ((window.SALON_ETAT || {}).suspendue) {
      var intro = section.querySelector('.intro');
      if (intro) {
        intro.textContent = T('suspendu_intro');
      }
      form.innerHTML =
        '<div class="champ champ-large suspendu">'
        + '<a class="btn btn-plein" href="tel:' + esc(SALON.telephone.replace(/\s/g, '')) + '">'
        + esc(SALON.telephone) + '</a>'
        + (SALON.whatsapp
           ? '<a class="btn" href="https://wa.me/' + esc(SALON.whatsapp.replace(/\D/g, '')) + '">'
             + esc(T('bouton_whatsapp')) + '</a>'
           : '')
        + '</div>';

      /* Sans formulaire, la mention sur les donnees du client n'a plus d'objet. */
      Array.prototype.forEach.call(section.querySelectorAll('.note'), function (n) {
        n.hidden = true;
      });
      return;
    }

    /* Les boutons « rendez-vous » menent desormais au formulaire. */
    Array.prototype.forEach.call(
      document.querySelectorAll('a[href="#contact"]'),
      function (a) { a.setAttribute('href', '#reserver'); }
    );

    if ($('#reserver-note-duo') && typeof QUATRE_MAINS !== 'undefined') {
      $('#reserver-note-duo').textContent = T('note_duo');
    }

    var champMasseuse   = $('#r-masseuse');
    var champPrestation = $('#r-prestation');
    var champDate       = $('#r-date');
    var zoneCreneaux    = $('#r-creneaux');
    var reponse         = $('#r-reponse');
    var bouton          = $('#r-envoyer');
    var heureChoisie    = null;

    /* --- Les masseuses encore d'actualite --- */
    var aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);
    var proposables = fiches.filter(function (m) {
      if (m.disponible === false) { return false; }
      var f = jour(m.fin);
      return !f || f >= aujourdhui;
    });

    if (!proposables.length) { section.hidden = true; return; }

    /* Les boutons « Réserver avec … » des fiches annoncées ne s'affichent
       qu'ici : sans serveur, il n'y a rien a reserver. */
    document.body.classList.add('avec-reservation');

    champMasseuse.innerHTML = proposables.map(function (m) {
      return '<option value="' + esc(m.id || m.prenom) + '">' + esc(m.prenom) + '</option>';
    }).join('');

    /* --- Les prestations, tirees de la grille tarifaire --- */
    function minutes(duree) {
      var h = /(\d+)\s*(?:h|heures?)\s*(\d+)?/i.exec(duree);
      if (h) { return parseInt(h[1], 10) * 60 + (h[2] ? parseInt(h[2], 10) : 0); }
      var m = /(\d+)\s*min/i.exec(duree);
      return m ? parseInt(m[1], 10) : 0;
    }

    champPrestation.innerHTML = TARIFS.map(function (t) {
      /* Le nom complet figure dans l'intitule : replie, un menu deroulant
         n'affiche que l'option choisie, pas le groupe auquel elle appartient.
         Le salon, lui, recevra toujours le nom francais : c'est sa langue de
         travail, et c'est elle qui figure dans l'agenda. */
      var nomDit = ((TRAD.tarifs || {})[t.nom] || {}).nom || t.nom;
      var court = nomDit.replace(/^(Massage|Masaje|Massagem)\s+/i, '');
      court = court.charAt(0).toUpperCase() + court.slice(1);

      var options = (t.lignes || []).map(function (l) {
        var n = minutes(l.duree);
        if (!n) { return ''; }
        var dureeDite = terme('durees', l.duree);
        return '<option value="' + n + '" data-nom="' + esc(t.nom + ' — ' + l.duree) + '"'
             + ' data-prix="' + esc(l.prix) + '">'
             + esc(court + ' · ' + dureeDite + ' — ' + l.prix) + '</option>';
      }).join('');
      return options ? '<optgroup label="' + esc(nomDit) + '">' + options + '</optgroup>' : '';
    }).join('');

    /* Le serveur repond en francais, mais joint un code : on prefere la
       phrase traduite quand on la connait. */
    function messageServeur(d) {
      var codes = {
        creneau: 'err_creneau', ferme: 'err_ferme', suspendu: 'err_suspendu',
        prenom: 'msg_prenom', telephone: 'msg_tel', heure: 'msg_heure',
      };
      var cle = d && codes[d.code];
      if (cle) { return T(cle); }
      return (d && d.erreur) || T('msg_ko');
    }

    /* --- Le jour --- */
    function iso(d) {
      return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    }
    var limite = new Date(aujourdhui.getTime() + 30 * 86400000);
    champDate.min = iso(aujourdhui);
    champDate.max = iso(limite);

    /* --- Les creneaux libres, demandes au serveur --- */
    function message(texte, classe) {
      reponse.textContent = texte;
      reponse.className = 'reponse' + (classe ? ' ' + classe : '');
    }

    function chargerCreneaux() {
      heureChoisie = null;
      var date = champDate.value;
      if (!date) {
        zoneCreneaux.innerHTML = '<p class="note">' + esc(T('creneaux_jour')) + '</p>';
        return;
      }
      zoneCreneaux.innerHTML = '<p class="note">' + esc(T('creneaux_recherche')) + '</p>';

      var adresse = 'reserver.php?action=creneaux'
        + '&masseuse=' + encodeURIComponent(champMasseuse.value)
        + '&date=' + encodeURIComponent(date)
        + '&duree=' + encodeURIComponent(champPrestation.value);

      fetch(adresse, { headers: { 'Accept': 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          var libres = (d && d.creneaux) || [];
          if (!libres.length) {
            zoneCreneaux.innerHTML = '<p class="note">' + esc(T('creneaux_aucun')) + '</p>';
            return;
          }
          /* Les quarts d'heure font une longue liste. On la range en trois
             moments de la journee, et le visiteur n'en voit qu'un a la fois :
             il appuie sur « Matin », « Après-midi » ou « Soirée ». */
          var debut = 0;
          var groupes = MOMENTS.map(function (moment) {
            var heures = libres.filter(function (h) {
              var n = parseInt(h, 10);
              return n >= debut && n < moment.jusqua;
            });
            debut = moment.jusqua;
            return { titre: moment.titre, vide: moment.vide, heures: heures };
          });

          /* On ouvre sur le premier moment qui a encore de la place. */
          var ouvert = 0;
          groupes.some(function (g, i) {
            if (g.heures.length) { ouvert = i; return true; }
            return false;
          });

          zoneCreneaux.innerHTML =
            '<div class="moments">'
            + groupes.map(function (g, i) {
                return '<button type="button" class="moment' + (g.heures.length ? '' : ' vide')
                     + '" data-moment="' + i + '"'
                     + (i === ouvert ? ' aria-current="true"' : '') + '>'
                     + esc(g.titre) + '</button>';
              }).join('')
            + '</div>'
            + groupes.map(function (g, i) {
                return '<div class="creneaux-liste" data-moment="' + i + '"'
                     + (i === ouvert ? '' : ' hidden') + '>'
                     + (g.heures.length
                        ? g.heures.map(function (h) {
                            return '<button type="button" class="creneau" data-heure="' + esc(h) + '">'
                                 + esc(heureAffichee(h)) + '</button>';
                          }).join('')
                        : '<p class="note">' + esc(g.vide) + '</p>')
                     + '</div>';
              }).join('')
            + '<p class="creneaux-choix" hidden></p>';
        })
        .catch(function () {
          zoneCreneaux.innerHTML = '<p class="note">' + esc(T('creneaux_indispo')) + '</p>';
        });
    }

    /* Les trois moments de la journee, et ce qu'on dit quand l'un d'eux
       n'a plus rien a offrir. */
    var MOMENTS = [
      { titre: T('moment_matin'),      jusqua: 12, vide: T('moment_matin_vide') },
      { titre: T('moment_apresmidi'),  jusqua: 18, vide: T('moment_apresmidi_vide') },
      { titre: T('moment_soiree'),     jusqua: 24, vide: T('moment_soiree_vide') },
    ];

    /* Rappelle l'heure retenue : elle peut appartenir a un moment de la
       journee que le visiteur ne regarde plus. */
    function rappelerChoix() {
      var rappel = zoneCreneaux.querySelector('.creneaux-choix');
      if (!rappel) { return; }
      rappel.hidden = !heureChoisie;
      rappel.textContent = heureChoisie
        ? T('heure_retenue') + ' ' + heureAffichee(heureChoisie)
        : '';
    }

    zoneCreneaux.addEventListener('click', function (ev) {
      var onglet = ev.target.closest('.moment');
      if (onglet) {
        Array.prototype.forEach.call(zoneCreneaux.querySelectorAll('.moment'), function (x) {
          x.removeAttribute('aria-current');
        });
        onglet.setAttribute('aria-current', 'true');
        Array.prototype.forEach.call(zoneCreneaux.querySelectorAll('.creneaux-liste'), function (liste) {
          liste.hidden = liste.dataset.moment !== onglet.dataset.moment;
        });
        return;
      }

      var b = ev.target.closest('.creneau');
      if (!b) { return; }
      Array.prototype.forEach.call(zoneCreneaux.querySelectorAll('.creneau'), function (x) {
        x.classList.remove('choisi');
      });
      b.classList.add('choisi');
      heureChoisie = b.dataset.heure;
      rappelerChoix();
      message('');
    });

    [champMasseuse, champPrestation, champDate].forEach(function (c) {
      c.addEventListener('change', chargerCreneaux);
    });

    /* --- Les boutons des fiches a venir --- */
    document.addEventListener('click', function (ev) {
      var b = ev.target.closest('.fiche-reserver');
      if (!b) { return; }
      var voulue = null;
      fiches.forEach(function (m) {
        if ((m.id || '') === b.dataset.masseuse) { voulue = m; }
      });
      if (!voulue) { return; }

      champMasseuse.value = b.dataset.masseuse;
      var arrivee = jour(voulue.debut);
      if (arrivee) { champDate.value = iso(arrivee); }
      chargerCreneaux();
      section.scrollIntoView({ behavior: 'smooth' });
    });

    /* --- L'envoi --- */
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();

      if (!heureChoisie) { message(T('msg_heure'), 'ko'); return; }
      if ($('#r-prenom').value.trim().length < 2) { message(T('msg_prenom'), 'ko'); return; }
      if ($('#r-tel').value.replace(/\D/g, '').length < 9) { message(T('msg_tel'), 'ko'); return; }

      var choix = champPrestation.options[champPrestation.selectedIndex];
      var donnees = new FormData();
      donnees.append('action', 'reserver');
      donnees.append('masseuse', champMasseuse.value);
      donnees.append('date', champDate.value);
      donnees.append('heure', heureChoisie);
      donnees.append('duree', champPrestation.value);
      donnees.append('prestation', choix ? choix.dataset.nom : '');
      donnees.append('prix', choix ? choix.dataset.prix : '');
      donnees.append('prenom', $('#r-prenom').value.trim());
      donnees.append('telephone', $('#r-tel').value.trim());
      donnees.append('site', $('#r-site').value);

      bouton.disabled = true;
      message(T('msg_envoi'));

      fetch('reserver.php', { method: 'POST', body: donnees })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          bouton.disabled = false;
          if (d && d.ok) {
            form.reset();
            heureChoisie = null;
            zoneCreneaux.innerHTML = '<p class="note">Choisissez d\'abord un jour.</p>';
            message(T('msg_ok'), 'ok');
          } else {
            message(messageServeur(d), 'ko');
            chargerCreneaux();
          }
        })
        .catch(function () {
          bouton.disabled = false;
          message(T('msg_ko'), 'ko');
        });
    });
  }

  /* --------------------------- Apparitions ------------------------------- */
  /* Les blocs se revelent quand ils entrent dans l'ecran, une seule fois.
     Les cartes d'une meme rangee se decalent legerement les unes des autres. */
  function animerApparitions() {
    if (!('IntersectionObserver' in window)) { return; }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { return; }

    var aAnimer = document.querySelectorAll(
      '.section .chapeau, .section .titre, .section .intro, .presentation p,'
      + ' .atout, .rdv-carte, .fiche, .carte-tarif, .quatre-mains, .supplements,'
      + ' .horaires, .galerie .vignette, .contact-bloc, .groupe-titre, .groupe-intro,'
      + ' .reservation'
    );

    var observateur = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (!e.isIntersecting) { return; }
        var rangDansLaRangee = Array.prototype.indexOf.call(
          e.target.parentElement.children, e.target
        );
        e.target.style.transitionDelay = Math.min(rangDansLaRangee, 5) * 70 + 'ms';
        e.target.classList.add('vu');
        observateur.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(aAnimer, function (el) {
      el.classList.add('apparait');
      observateur.observe(el);
    });
  }

  animerApparitions();

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
