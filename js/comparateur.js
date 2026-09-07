// Assemble les moteurs : ventile la facture, calcule la part LAMal une seule fois
// (elle est identique partout a franchise egale) puis la part LCA pour la couverture
// actuelle et pour chaque autre caisse.
window.Comparateur = (function () {
  function db() { return window.DB; }

  function prestation(id) {
    return db().catalogue.prestations.find((p) => p.id === id) || null;
  }

  // Ventile chaque ligne de facture entre part LAMal et part complementaire.
  function preparerLignes(facture) {
    const lignesLamal = [];
    const lignesLca = [];
    const incompletes = [];
    const versees = [];

    for (const f of facture) {
      const p = prestation(f.prestationId);
      if (!p || !(f.montant > 0)) continue;

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

  function comparer(etat) {
    const { lignesLamal, lignesLca, incompletes, versees } = preparerLignes(etat.facture);

    const lamal = window.MoteurLamal.calculer(lignesLamal, {
      franchise: etat.client.franchise,
      franchisePayee: etat.cumuls.franchisePayee || 0,
      quotePartAtteinte: etat.cumuls.quotePartAtteinte || 0,
      categorie: etat.client.categorie,
      meta: db().meta,
    });

    // --- Couverture actuelle -------------------------------------------------
    let actuel = null;
    if (etat.actuel.mode === 'libre') {
      const pseudo = [{
        id: '_libre', nom: 'Couverture decrite a la main', code_produit: null,
        franchises_produit: [etat.actuel.libre.franchise || 0],
        enveloppes: [], couvertures: etat.actuel.libre.couvertures,
      }];
      actuel = {
        assureurId: '_libre',
        nom: etat.actuel.libre.nom || 'Caisse actuelle (saisie manuelle)',
        saisieLibre: true,
        lca: window.MoteurLca.calculer(lignesLca, pseudo),
        produits: pseudo,
      };
    } else if (etat.actuel.assureurId) {
      const a = db().assureurs.find((x) => x.id === etat.actuel.assureurId);
      if (a) {
        const produits = produitsRetenus(a, etat.actuel.produitIds);
        actuel = { assureurId: a.id, nom: a.nom, saisieLibre: false,
                   lca: window.MoteurLca.calculer(lignesLca, produits), produits };
      }
    }
    if (actuel) {
      actuel.lamal = lamal;
      actuel.resteACharge = lamal.resteACharge + actuel.lca.resteACharge;
    }

    // --- Caisses comparees ---------------------------------------------------
    const concurrents = db().assureurs
      .filter((a) => a.actif !== false)
      .filter((a) => !actuel || a.id !== actuel.assureurId)
      .map((a) => {
        const filtre = (etat.filtresProduits || {})[a.id];
        const produits = produitsRetenus(a, filtre);
        const lca = window.MoteurLca.calculer(lignesLca, produits);
        return {
          assureurId: a.id, nom: a.nom, assureur: a, produits, lamal, lca,
          resteACharge: lamal.resteACharge + lca.resteACharge,
          produitsDisponibles: (a.produits_lca || []).filter((p) => !p.hors_perimetre_facture),
        };
      })
      .sort((x, y) => x.resteACharge - y.resteACharge || x.nom.localeCompare(y.nom));

    return { lamal, actuel, concurrents, incompletes, versees,
             totalFacture: etat.facture.reduce((s, f) => s + (Number(f.montant) || 0), 0),
             lignesLca, lignesLamal };
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
