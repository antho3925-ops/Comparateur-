// Assemble les moteurs : ventile la facture, calcule la part LAMal une seule fois
// (elle est identique partout a franchise egale) puis la part LCA pour la couverture
// actuelle et pour chaque autre caisse.
window.Comparateur = (function () {
  function db() { return window.DB; }

  function prestation(id) {
    return db().catalogue.prestations.find((p) => p.id === id) || null;
  }

  // Ventile chaque ligne de facture entre part LAMal et part complementaire.
  // `rabais` applique un rabais partenaire au montant facture AVANT toute
  // ventilation : c'est bien la facture qui baisse, pas le remboursement.
  function preparerLignes(facture, rabais) {
    const lignesLamal = [];
    const lignesLca = [];
    const incompletes = [];
    const versees = [];

    for (const brut of facture) {
      const p = prestation(brut.prestationId);
      if (!p || !(brut.montant > 0)) continue;

      let f = brut;
      const r = rabais && rabais[brut.prestationId];
      if (r) {
        f = Object.assign({}, brut, {
          montant: brut.montant * (1 - r.taux),
          montantPartLamal: brut.montantPartLamal == null ? brut.montantPartLamal
                            : Number(brut.montantPartLamal) * (1 - r.taux),
          rabais: r,
        });
      }

      if (p.nature === 'prestation_versee') {
        versees.push({ facture: f, prestation: p });
        continue;
      }

      const commun = { factureId: f.id, prestation: p, prestationId: p.id,
                       seances: f.seances || 0, jours: f.jours || 0 };

      if (p.categorie === 'LAMal') {
        lignesLamal.push(Object.assign({}, commun, {
          montantLamal: f.montant,
          quotePartTaux: f.quotePartTaux != null ? f.quotePartTaux : null,
          exonere: p.exoneration_id === 'maternite',
        }));
      } else if (p.categorie === 'LCA') {
        lignesLca.push(Object.assign({}, commun, { montantLca: f.montant }));
      } else {
        // MIXTE : la repartition est saisie a la main, jamais estimee.
        if (f.montantPartLamal == null || f.montantPartLamal === '') {
          incompletes.push({ facture: f, prestation: p });
          continue;
        }
        const partLamal = Math.min(Number(f.montantPartLamal), f.montant);
        lignesLamal.push(Object.assign({}, commun, {
          montantLamal: partLamal,
          quotePartTaux: f.quotePartTaux != null ? f.quotePartTaux : null,
          exonere: p.exoneration_id === 'maternite',
        }));
        lignesLca.push(Object.assign({}, commun, { montantLca: f.montant - partLamal }));
      }
    }
    return { lignesLamal, lignesLca, incompletes, versees };
  }

  function produitsRetenus(assureur, filtreIds) {
    return (assureur.produits_lca || []).filter((p) => {
      if (p.hors_perimetre_facture) return false;
      if (filtreIds && filtreIds.length) return filtreIds.indexOf(p.id) !== -1;
      return true;
    });
  }

  // Meilleur rabais partenaire par prestation, pour un assureur donne.
  function rabaisDe(assureur, actif) {
    const pp = assureur && assureur.programme_partenaires;
    if (!actif || !pp) return null;
    const m = {};
    for (const r of pp.rabais || []) {
      for (const id of r.prestation_ids) {
        if (!m[id] || r.taux > m[id].taux) {
          m[id] = { taux: r.taux, partenaire: r.partenaire, remarque: r.remarque };
        }
      }
    }
    return Object.keys(m).length ? m : null;
  }

  function evaluer(produits, etat, rabais) {
    const prep = preparerLignes(etat.facture, rabais);
    const lamal = window.MoteurLamal.calculer(prep.lignesLamal, {
      franchise: etat.client.franchise,
      franchisePayee: etat.cumuls.franchisePayee || 0,
      quotePartAtteinte: etat.cumuls.quotePartAtteinte || 0,
      categorie: etat.client.categorie,
      meta: db().meta,
    });
    const lca = window.MoteurLca.calculer(prep.lignesLca, produits);
    return { lamal, lca, prep, resteACharge: lamal.resteACharge + lca.resteACharge };
  }

  function comparer(etat) {
    const refs = preparerLignes(etat.facture, null);
    const lamal = window.MoteurLamal.calculer(refs.lignesLamal, {
      franchise: etat.client.franchise,
      franchisePayee: etat.cumuls.franchisePayee || 0,
      quotePartAtteinte: etat.cumuls.quotePartAtteinte || 0,
      categorie: etat.client.categorie,
      meta: db().meta,
    });

    // Enrichit une evaluation du volet partenaires, lorsqu'il est actif.
    // Le rabais fait baisser la facture, donc aussi le remboursement qui en
    // decoule : l'economie reelle du client est l'ecart entre les deux restes
    // a charge, jamais le montant du rabais.
    function avecClub(assureur, produits, evalContractuelle) {
      const rabais = rabaisDe(assureur, etat.clubActif);
      if (!rabais) return null;
      const ev = evaluer(produits, etat, rabais);
      const touchees = etat.facture
        .filter((f) => rabais[f.prestationId] && f.montant > 0)
        .map((f) => ({ libelle: (prestation(f.prestationId) || {}).libelle,
                       montant: f.montant, rabais: rabais[f.prestationId] }));
      if (!touchees.length) return null;
      return Object.assign(ev, {
        economie: evalContractuelle.resteACharge - ev.resteACharge,
        touchees,
        programme: assureur.programme_partenaires,
      });
    }

    // --- Couverture actuelle -------------------------------------------------
    let actuel = null;
    if (etat.actuel.mode === 'libre') {
      const pseudo = [{
        id: '_libre', nom: 'Couverture decrite a la main', code_produit: null,
        franchises_produit: [etat.actuel.libre.franchise || 0],
        enveloppes: [], couvertures: etat.actuel.libre.couvertures,
      }];
      const ev = evaluer(pseudo, etat, null);
      actuel = { assureurId: '_libre', saisieLibre: true, produits: pseudo,
                 nom: etat.actuel.libre.nom || 'Caisse actuelle (saisie manuelle)',
                 lamal: ev.lamal, lca: ev.lca, resteACharge: ev.resteACharge };
    } else if (etat.actuel.assureurId) {
      const a = db().assureurs.find((x) => x.id === etat.actuel.assureurId);
      if (a) {
        const produits = produitsRetenus(a, etat.actuel.produitIds);
        const ev = evaluer(produits, etat, null);
        actuel = { assureurId: a.id, nom: a.nom, saisieLibre: false, assureur: a, produits,
                   lamal: ev.lamal, lca: ev.lca, resteACharge: ev.resteACharge,
                   contractuel: ev.resteACharge, club: avecClub(a, produits, ev) };
        if (actuel.club) actuel.resteACharge = actuel.club.resteACharge;
      }
    }

    // --- Caisses comparees ---------------------------------------------------
    const masquees = etat.caissesMasquees || [];
    const candidates = db().assureurs
      .filter((a) => a.actif !== false)
      .filter((a) => !actuel || a.id !== actuel.assureurId);

    const concurrents = candidates
      .filter((a) => masquees.indexOf(a.id) === -1)
      .map((a) => {
        const produits = produitsRetenus(a, (etat.filtresProduits || {})[a.id]);
        const ev = evaluer(produits, etat, null);
        const club = avecClub(a, produits, ev);
        return {
          assureurId: a.id, nom: a.nom, assureur: a, produits,
          lamal: club ? club.lamal : ev.lamal,
          lca: club ? club.lca : ev.lca,
          contractuel: ev.resteACharge,
          club,
          resteACharge: club ? club.resteACharge : ev.resteACharge,
          produitsDisponibles: (a.produits_lca || []).filter((p) => !p.hors_perimetre_facture),
        };
      })
      .sort((x, y) => x.resteACharge - y.resteACharge || x.nom.localeCompare(y.nom));

    return { lamal, actuel, concurrents,
             nbCaisses: candidates.length,
             nbMasquees: candidates.length - concurrents.length,
             incompletes: refs.incompletes, versees: refs.versees,
             clubActif: !!etat.clubActif,
             totalFacture: etat.facture.reduce((s, f) => s + (Number(f.montant) || 0), 0),
             lignesLca: refs.lignesLca, lignesLamal: refs.lignesLamal };
  }

  // Compare une caisse a la couverture actuelle, prestation par prestation.
  // Sert a preparer l'entretien : les points forts comme les points faibles,
  // parce qu'un argumentaire qui tait les seconds ne survit pas a la premiere
  // objection du client.
  function argumentaire(actuel, concurrent) {
    if (!actuel || !concurrent) return null;

    const refs = {};
    for (const d of actuel.lca.parLigne) refs[d.ligne.factureId] = d;

    const mieux = [], moins = [], aPreciser = [];
    for (const d of concurrent.lca.parLigne) {
      const ref = refs[d.ligne.factureId];
      const montantRef = ref ? ref.montant : 0;
      const item = {
        libelle: d.ligne.prestation.libelle,
        montantLca: d.ligne.montantLca,
        rembourse: d.montant,
        rembourseActuel: montantRef,
        ecart: d.montant - montantRef,
        produit: d.produit,
        etat: d.etat,
        etatActuel: ref ? ref.etat : null,
      };
      if (d.etat === 'a_preciser') aPreciser.push(item);
      else if (item.ecart > 0.005) mieux.push(item);
      else if (item.ecart < -0.005) moins.push(item);
    }
    mieux.sort((a, b) => b.ecart - a.ecart);
    moins.sort((a, b) => a.ecart - b.ecart);

    return {
      mieux, moins, aPreciser,
      gain: mieux.reduce((s, i) => s + i.ecart, 0),
      perte: moins.reduce((s, i) => s + i.ecart, 0),
    };
  }

  return { comparer, preparerLignes, prestation, argumentaire };
})();
