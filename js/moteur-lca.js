// Part complementaire : propre a chaque assureur.
// Ordre : quota de seances -> franchise produit -> taux -> plafond par seance/jour
//         -> plafond annuel de la prestation -> plafond de l'enveloppe partagee.
// Si plusieurs produits couvrent la meme prestation, on retient le plus favorable,
// jamais un cumul.
window.MoteurLca = (function () {
  const ETAT = { REMBOURSE: 'rembourse', NON_COUVERT: 'non_couvert', A_PRECISER: 'a_preciser' };

  function nouveauxCumuls() {
    return { prestation: {}, enveloppe: {}, seances: {}, franchise: {}, franchisePrestation: {} };
  }

  function cle() {
    return Array.from(arguments).join('|');
  }

  // Ce que ce produit rembourserait sur cette ligne, compte tenu du deja consomme.
  function evaluer(produit, couverture, ligne, cumuls) {
    if (couverture.statut === 'a_completer') {
      return { etat: ETAT.A_PRECISER, montant: 0, produit, couverture };
    }

    let base = ligne.montantLca;
    let seancesRetenues = ligne.seances || 0;
    const notes = [];

    // Quota annuel de seances : les seances au-dela du quota ne sont pas remboursees.
    if (couverture.nb_seances_max_annuel != null && ligne.seances > 0) {
      const k = cle(produit.id, couverture.prestation_id, 'seances');
      const deja = cumuls.seances[k] || 0;
      const restantes = Math.max(0, couverture.nb_seances_max_annuel - deja);
      const facturables = Math.min(ligne.seances, restantes);
      if (facturables < ligne.seances) {
        notes.push(`${facturables} seance(s) sur ${ligne.seances} dans le quota annuel`);
      }
      base = base * (facturables / ligne.seances);
      // Le plafond par seance porte sur les seances retenues, pas sur celles facturees.
      seancesRetenues = facturables;
    }

    // Franchise propre au produit, consommee une fois par annee.
    const franchiseProduit = Array.isArray(produit.franchises_produit)
      ? Math.min.apply(null, produit.franchises_produit)
      : (produit.franchise_produit || 0);
    // Certaines prestations echappent expressement a la franchise du produit :
    // chez Assura Denta Plus, la prophylaxie est due « sans franchise ni quote-part ».
    if (franchiseProduit > 0 && !couverture.exempt_franchise_produit) {
      const k = cle(produit.id, 'franchise');
      const restante = Math.max(0, franchiseProduit - (cumuls.franchise[k] || 0));
      const prise = Math.min(restante, base);
      base -= prise;
      if (prise > 0) notes.push(`franchise produit de ${prise.toFixed(2)} deduite`);
    }

    // Franchise propre a une prestation, distincte de celle du produit.
    // Chez Assura, le dentaire de Complementa Extra en porte une de CHF 500
    // alors que le reste du produit n'en a aucune.
    if (couverture.franchise_prestation > 0) {
      const k = cle(produit.id, couverture.prestation_id, 'fr');
      const restante = Math.max(0, couverture.franchise_prestation - (cumuls.franchisePrestation[k] || 0));
      const prise = Math.min(restante, base);
      base -= prise;
      if (prise > 0) notes.push(`franchise de ${prise.toFixed(2)} sur cette prestation`);
    }

    let montant = base * couverture.taux_remboursement;

    if (couverture.plafond_par_seance != null && seancesRetenues > 0) {
      montant = Math.min(montant, couverture.plafond_par_seance * seancesRetenues);
    }
    if (couverture.plafond_par_jour != null && ligne.jours > 0) {
      montant = Math.min(montant, couverture.plafond_par_jour * ligne.jours);
    }
    if (couverture.plafond_annuel != null) {
      // Certains plafonds se cumulent d'annee en annee tant que rien n'est
      // reclame : chez Assura, les lunettes valent CHF 100 par an cumulables
      // sur cinq ans. Un client qui change de monture tous les trois ans
      // dispose donc de CHF 300, pas de CHF 100.
      let plafond = couverture.plafond_annuel;
      const cum = couverture.plafond_cumulable;
      const annees = Math.max(1, Math.floor(ligne.anneesCumul || 1));
      if (cum && annees > 1) {
        const retenues = cum.annees_max ? Math.min(annees, cum.annees_max) : annees;
        plafond = couverture.plafond_annuel * retenues;
        if (cum.plafond_max != null) plafond = Math.min(plafond, cum.plafond_max);
        notes.push(`plafond cumule sur ${retenues} annee(s) : ${plafond.toFixed(2)}`);
      }
      const k = cle(produit.id, couverture.prestation_id);
      const restant = Math.max(0, plafond - (cumuls.prestation[k] || 0));
      if (montant > restant) notes.push('plafond de la prestation atteint');
      montant = Math.min(montant, restant);
    }
    if (couverture.enveloppe_id) {
      const env = (produit.enveloppes || []).find((e) => e.id === couverture.enveloppe_id);
      if (env && env.plafond_annuel != null) {
        const k = cle(produit.id, env.id);
        const restant = Math.max(0, env.plafond_annuel - (cumuls.enveloppe[k] || 0));
        if (montant > restant) notes.push(`plafond commun « ${env.libelle} » atteint`);
        montant = Math.min(montant, restant);
      }
    }
    if (couverture.plafond_a_preciser) {
      notes.push('plafond dependant de l\'option souscrite, non applique');
    }

    // Participation journaliere a la charge de l'assure, distincte d'une franchise :
    // elle se compte par jour d'hospitalisation et porte son propre plafond annuel.
    if (couverture.participation_par_jour > 0 && ligne.jours > 0) {
      let part = couverture.participation_par_jour * ligne.jours;
      if (couverture.participation_jours_max != null) {
        part = couverture.participation_par_jour
             * Math.min(ligne.jours, couverture.participation_jours_max);
      }
      if (couverture.participation_plafond_annuel != null) {
        part = Math.min(part, couverture.participation_plafond_annuel);
      }
      if (part > 0) {
        montant -= part;
        notes.push(`participation de ${part.toFixed(2)} a charge de l'assure`);
      }
    }

    montant = Math.max(0, Math.min(montant, ligne.montantLca));
    return { etat: ETAT.REMBOURSE, montant, produit, couverture, notes };
  }

  function enregistrer(resultat, ligne, cumuls) {
    if (!resultat || resultat.etat !== ETAT.REMBOURSE) return;
    const { produit, couverture, montant } = resultat;
    if (couverture.plafond_annuel != null) {
      const k = cle(produit.id, couverture.prestation_id);
      cumuls.prestation[k] = (cumuls.prestation[k] || 0) + montant;
    }
    if (couverture.enveloppe_id) {
      const k = cle(produit.id, couverture.enveloppe_id);
      cumuls.enveloppe[k] = (cumuls.enveloppe[k] || 0) + montant;
    }
    if (couverture.nb_seances_max_annuel != null && ligne.seances > 0) {
      const k = cle(produit.id, couverture.prestation_id, 'seances');
      cumuls.seances[k] = (cumuls.seances[k] || 0) + ligne.seances;
    }
    if (couverture.franchise_prestation > 0) {
      const k = cle(produit.id, couverture.prestation_id, 'fr');
      cumuls.franchisePrestation[k] = Math.min(
        couverture.franchise_prestation,
        (cumuls.franchisePrestation[k] || 0) + ligne.montantLca);
    }
    const franchiseProduit = Array.isArray(produit.franchises_produit)
      ? Math.min.apply(null, produit.franchises_produit)
      : (produit.franchise_produit || 0);
    // Certaines prestations echappent expressement a la franchise du produit :
    // chez Assura Denta Plus, la prophylaxie est due « sans franchise ni quote-part ».
    if (franchiseProduit > 0 && !couverture.exempt_franchise_produit) {
      const k = cle(produit.id, 'franchise');
      cumuls.franchise[k] = Math.min(franchiseProduit, (cumuls.franchise[k] || 0) + ligne.montantLca);
    }
  }

  /**
   * @param lignes  [{prestationId, montantLca, seances, jours}]
   * @param produits produits retenus pour cet assureur (deja filtres)
   */
  function calculer(lignes, produits, options) {
    const cumuls = nouveauxCumuls();
    // Franchises des complementaires deja atteintes plus tot dans l'annee : on
    // les marque consommees d'entree, sans quoi elles seraient deduites une
    // seconde fois sur la facture en cours.
    if (options && options.franchisesProduitsConsommees) {
      const enorme = Number.MAX_SAFE_INTEGER;
      for (const p of produits) {
        cumuls.franchise[cle(p.id, 'franchise')] = enorme;
        for (const c of p.couvertures || []) {
          if (c.franchise_prestation > 0) {
            cumuls.franchisePrestation[cle(p.id, c.prestation_id, 'fr')] = enorme;
          }
        }
      }
    }
    const parLigne = [];
    let totalRembourse = 0;
    let totalLca = 0;
    let nbAPreciser = 0;

    for (const ligne of lignes) {
      totalLca += ligne.montantLca;
      let meilleur = null;
      let aPreciser = null;

      for (const produit of produits) {
        for (const couverture of produit.couvertures || []) {
          if (couverture.prestation_id !== ligne.prestationId) continue;
          const r = evaluer(produit, couverture, ligne, cumuls);
          if (r.etat === ETAT.A_PRECISER) {
            if (!aPreciser) aPreciser = r;
          } else if (!meilleur || r.montant > meilleur.montant) {
            meilleur = r;
          }
        }
      }

      if (meilleur) {
        enregistrer(meilleur, ligne, cumuls);
        totalRembourse += meilleur.montant;
        parLigne.push({ ligne, etat: ETAT.REMBOURSE, montant: meilleur.montant,
                        produit: meilleur.produit, couverture: meilleur.couverture,
                        notes: meilleur.notes || [] });
      } else if (aPreciser) {
        nbAPreciser++;
        parLigne.push({ ligne, etat: ETAT.A_PRECISER, montant: 0,
                        produit: aPreciser.produit, couverture: aPreciser.couverture, notes: [] });
      } else {
        parLigne.push({ ligne, etat: ETAT.NON_COUVERT, montant: 0, produit: null,
                        couverture: null, notes: [] });
      }
    }

    return { parLigne, totalRembourse, totalLca, nbAPreciser,
             resteACharge: totalLca - totalRembourse };
  }

  return { calculer, ETAT };
})();
