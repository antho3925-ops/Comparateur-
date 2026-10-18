/* ============================================================================
   Chez Eva — logique du site
   Tout le contenu vient de js/contenu.js : ce fichier ne fait que l'afficher.
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
    PRESENTATION.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');

  $('#atouts').innerHTML = ATOUTS.map(function (a) {
    return '<article class="atout"><h3>' + esc(a.titre) + '</h3><p>' + esc(a.texte) + '</p></article>';
  }).join('');

  /* ------------------- Les façons de prendre rendez-vous ----------------- */
  if (typeof PRISE_DE_RDV !== 'undefined' && $('#prise-rdv')) {
    if (typeof PRISE_DE_RDV_TITRE === 'string') {
      $('#prise-rdv-titre').textContent = PRISE_DE_RDV_TITRE;
    }

    var numeroSalon = (SALON.telephone || '').replace(/[^\d+]/g, '');
    var waSalon = (SALON.whatsapp || '').replace(/\D/g, '');

    $('#prise-rdv').innerHTML = PRISE_DE_RDV.map(function (f) {
      var lien = '';
      if (f.bouton === 'telephone' && numeroSalon) {
        lien = '<a class="btn btn-plein" href="tel:' + esc(numeroSalon) + '">'
             + esc(SALON.telephone) + '</a>';
      } else if (f.bouton === 'whatsapp' && waSalon) {
        lien = '<a class="btn btn-vide" href="https://wa.me/' + esc(waSalon)
             + '" target="_blank" rel="noopener">Écrire sur WhatsApp</a>';
      } else if (f.bouton === 'formulaire') {
        lien = '<a class="btn btn-vide" href="#reserver">Réserver en ligne</a>';
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
    return d.toLocaleDateString('fr-CH', options);
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
      return { etat: 'absente', badge: 'Bientôt de retour', ligne: null };
    }
    if (debut && aujourdhui < debut) {
      var meme = fin && debut.getMonth() === fin.getMonth()
                     && debut.getFullYear() === fin.getFullYear();
      return {
        etat: 'avenir',
        badge: 'À partir du ' + enFrancais(debut),
        ligne: fin
          ? 'Présente du ' + (meme ? debut.getDate() : enFrancais(debut))
            + ' au ' + enFrancais(fin)
          : null
      };
    }
    if (fin) {
      return { etat: 'ici', badge: 'Disponible', ligne: "Jusqu'au " + enFrancais(fin) };
    }
    return { etat: 'ici', badge: 'Disponible', ligne: null };
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
           + (trouvee ? esc(trouvee.drapeau) + ' ' + esc(trouvee.nom) : esc(l))
           + '</span>';
    }).join('');
  }

  /* Construit une fiche. Le bouton d'appel n'apparait que pour les masseuses
     presentes — proposer d'appeler quelqu'un qui n'est pas la ne sert qu'a
     decevoir — et celles qui arrivent a une date connue recoivent a la place
     un bouton de reservation anticipee. */
  function carteMasseuse(m, choix) {
    var avecAppel = choix && choix.appel;
    var meta = [];
    if (m.age)     { meta.push(m.age + ' ans'); }
    if (m.origine) { meta.push(m.origine); }

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
      return '<span class="tag">' + esc(s) + '</span>';
    }).join('');

    var sonNumero = (m.telephone || '').trim();
    var bouton = '';
    if (avecAppel && sonNumero) {
      bouton = '<a class="fiche-tel" href="tel:' + esc(sonNumero.replace(/[^\d+]/g, '')) + '">'
             + 'Appeler ' + esc(m.prenom) + ' &middot; ' + esc(sonNumero) + '</a>';
    } else if (choix && choix.reserver) {
      bouton = '<button type="button" class="fiche-reserver" data-masseuse="'
             + esc(m.id || '') + '">Réserver avec ' + esc(m.prenom) + '</button>';
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
          '<p class="fiche-texte">' + esc(m.presentation) + '</p>' +
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
  $('#masseuses-chapeau').textContent = solo ? 'Qui vous reçoit' : 'Notre équipe';
  $('#masseuses-titre').textContent   = solo ? 'La masseuse' : 'Les masseuses';
  $('#masseuses-intro').textContent   = typeof MASSEUSES_INTRO === 'string' ? MASSEUSES_INTRO : '';

  var grille = $('#grille-masseuses');
  grille.classList.toggle('solo', solo);
  grille.innerHTML = presentes.map(function (m) {
    return carteMasseuse(m, { appel: true });
  }).join('');

  if (!presentes.length) {
    grille.innerHTML = '<p class="intro">Aucune masseuse au salon en ce moment. '
      + 'Appelez-nous, nous vous dirons qui revient et quand.</p>';
  }

  var blocAvance = $('#bloc-avance');
  if (blocAvance) {
    blocAvance.hidden = aVenir.length === 0;
    $('#avance-intro').textContent = aVenir.length > 1
      ? 'Elles arrivent à une date connue. Vous pouvez déjà réserver votre rendez-vous avec elles.'
      : 'Elle arrive à une date connue. Vous pouvez déjà réserver votre rendez-vous avec elle.';
    $('#grille-avance').innerHTML = aVenir.map(function (m) {
      return carteMasseuse(m, { reserver: true });
    }).join('');
  }

  var blocBientot = $('#bloc-bientot');
  if (blocBientot) {
    blocBientot.hidden = bientot.length === 0;
    $('#bientot-intro').textContent = bientot.length > 1
      ? 'Elles ne sont pas au salon en ce moment et leur retour n\'a pas encore de date. Appelez-nous pour en savoir plus.'
      : 'Elle n\'est pas au salon en ce moment et son retour n\'a pas encore de date. Appelez-nous pour en savoir plus.';
    $('#grille-bientot').innerHTML = bientot.map(function (m) {
      return carteMasseuse(m, {});
    }).join('');
  }

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

  /* Les jours ou le salon n'ouvre pas, annonces avant que le client n'essaie. */
  (function annoncerFermetures() {
    var etat = window.SALON_ETAT || {};
    var dits = etat.fermetures || [];
    if (!dits.length) { return; }
    var note = $('#horaires-note');
    var bloc = document.createElement('p');
    bloc.className = 'note note-fermeture';
    bloc.innerHTML = dits.map(function (d) { return esc(d); }).join('<br>');
    note.parentNode.insertBefore(bloc, note);
  }());

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

  if (typeof QUATRE_MAINS !== 'undefined' && $('#quatre-mains')) {
    $('#quatre-mains').hidden = false;
    $('#quatre-mains-titre').textContent = QUATRE_MAINS.titre || '';
    $('#quatre-mains-texte').textContent = QUATRE_MAINS.texte || '';
    $('#quatre-mains-note').textContent = QUATRE_MAINS.note || '';
  }

  $('#supplements').innerHTML = SUPPLEMENTS.map(function (s) {
    return '<li><span class="supp-nom">' + esc(s.nom) + '</span>' +
           '<span class="supp-prix">' + esc(s.prix) + '</span></li>';
  }).join('');

  $('#tarifs-note').textContent = TARIFS_NOTE;

  /* -------------------------------- Galerie ------------------------------ */
  $('#grille-galerie').innerHTML = GALERIE.map(function (g) {
    return '<button type="button" class="vignette"' +
             ' data-src="' + esc(g.src) + '" data-legende="' + esc(g.legende || '') + '">' +
             '<span class="vignette-vide">Photo à venir</span>' +
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

  if (SALON.photoEntree) {
    var legendeEntree = SALON.photoEntreeLegende || "L'entrée";
    $('#contact-photo').innerHTML =
      '<button type="button" class="vignette vignette-entree"' +
        ' data-src="' + esc(SALON.photoEntree) + '" data-legende="' + esc(legendeEntree) + '">' +
        '<img src="' + esc(SALON.photoEntree) + '" alt="' + esc(legendeEntree) + '" loading="lazy"' +
        ' onerror="this.closest(\'.vignette\').style.display=\'none\'">' +
        '<span class="vignette-legende">' + esc(legendeEntree) + '</span>' +
      '</button>';
  }

  $('#regles').innerHTML = REGLES.map(function (r) {
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
        intro.textContent = 'La réservation en ligne est momentanément fermée. '
          + 'Appelez-nous, nous fixons le rendez-vous avec vous.';
      }
      form.innerHTML =
        '<div class="champ champ-large suspendu">'
        + '<a class="btn btn-plein" href="tel:' + esc(SALON.telephone.replace(/\s/g, '')) + '">'
        + esc(SALON.telephone) + '</a>'
        + (SALON.whatsapp
           ? '<a class="btn" href="https://wa.me/' + esc(SALON.whatsapp.replace(/\D/g, '')) + '">'
             + 'Écrire sur WhatsApp</a>'
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
      $('#reserver-note-duo').textContent =
        'Le formulaire réserve une masseuse. Pour un massage à quatre mains, '
        + 'appelez-nous : nous composons le duo avec vous.';
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
         n'affiche que l'option choisie, pas le groupe auquel elle appartient. */
      var court = t.nom.replace(/^Massage\s+/i, '');
      court = court.charAt(0).toUpperCase() + court.slice(1);

      var options = (t.lignes || []).map(function (l) {
        var n = minutes(l.duree);
        if (!n) { return ''; }
        return '<option value="' + n + '" data-nom="' + esc(t.nom + ' — ' + l.duree) + '"'
             + ' data-prix="' + esc(l.prix) + '">'
             + esc(court + ' · ' + l.duree + ' — ' + l.prix) + '</option>';
      }).join('');
      return options ? '<optgroup label="' + esc(t.nom) + '">' + options + '</optgroup>' : '';
    }).join('');

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
        zoneCreneaux.innerHTML = '<p class="note">Choisissez d\'abord un jour.</p>';
        return;
      }
      zoneCreneaux.innerHTML = '<p class="note">Recherche des disponibilités…</p>';

      var adresse = 'reserver.php?action=creneaux'
        + '&masseuse=' + encodeURIComponent(champMasseuse.value)
        + '&date=' + encodeURIComponent(date)
        + '&duree=' + encodeURIComponent(champPrestation.value);

      fetch(adresse, { headers: { 'Accept': 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          var libres = (d && d.creneaux) || [];
          if (!libres.length) {
            zoneCreneaux.innerHTML = '<p class="note">Aucune disponibilité ce jour-là. '
              + 'Essayez un autre jour, ou appelez-nous.</p>';
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
                                 + esc(h.replace(':', 'h')) + '</button>';
                          }).join('')
                        : '<p class="note">' + esc(g.vide) + '</p>')
                     + '</div>';
              }).join('')
            + '<p class="creneaux-choix" hidden></p>';
        })
        .catch(function () {
          zoneCreneaux.innerHTML = '<p class="note">Disponibilités indisponibles. Appelez-nous.</p>';
        });
    }

    /* Les trois moments de la journee, et ce qu'on dit quand l'un d'eux
       n'a plus rien a offrir. */
    var MOMENTS = [
      { titre: 'Matin',      jusqua: 12, vide: 'Plus de place le matin. Essayez l’après-midi ou la soirée.' },
      { titre: 'Après-midi', jusqua: 18, vide: 'Plus de place l’après-midi. Essayez le matin ou la soirée.' },
      { titre: 'Soirée',     jusqua: 24, vide: 'Plus de place en soirée. Essayez le matin ou l’après-midi.' },
    ];

    /* Rappelle l'heure retenue : elle peut appartenir a un moment de la
       journee que le visiteur ne regarde plus. */
    function rappelerChoix() {
      var rappel = zoneCreneaux.querySelector('.creneaux-choix');
      if (!rappel) { return; }
      rappel.hidden = !heureChoisie;
      rappel.textContent = heureChoisie
        ? 'Heure retenue : ' + heureChoisie.replace(':', 'h')
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

      if (!heureChoisie) { message('Choisissez une heure.', 'ko'); return; }
      if ($('#r-prenom').value.trim().length < 2) { message('Indiquez votre prénom.', 'ko'); return; }
      if ($('#r-tel').value.replace(/\D/g, '').length < 9) { message('Indiquez un numéro de téléphone valable.', 'ko'); return; }

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
      message('Envoi…');

      fetch('reserver.php', { method: 'POST', body: donnees })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          bouton.disabled = false;
          if (d && d.ok) {
            form.reset();
            heureChoisie = null;
            zoneCreneaux.innerHTML = '<p class="note">Choisissez d\'abord un jour.</p>';
            message(d.message || 'Demande enregistrée.', 'ok');
          } else {
            message((d && d.erreur) || 'Envoi impossible. Appelez-nous.', 'ko');
            chargerCreneaux();
          }
        })
        .catch(function () {
          bouton.disabled = false;
          message('Envoi impossible. Appelez-nous.', 'ko');
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
