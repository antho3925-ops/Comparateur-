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
                       seances: f.seances || 0, jours: f.jours || 0,
                       anneesCumul: f.anneesCumul || 1 };

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
    const cible = filtreIds && filtreIds.length;
    return (assureur.produits_lca || []).filter((p) => {
      if (p.hors_perimetre_facture) return false;
      // Un produit en portefeuille ferme ne se souscrit plus : il reste
      // selectionnable comme couverture actuelle d'un client qui le detient,
      // mais n'a rien a faire dans une caisse qu'on propose en alternative.
      if (p.portefeuille_ferme && !cible) return false;
      if (cible) return filtreIds.indexOf(p.id) !== -1;
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

  // Etendue de l'offre complementaire : nombre de prestations distinctes qu'une
  // caisse rembourse effectivement, c'est-a-dire avec un taux exploitable. Mesure
  // la largeur de la gamme, pas ce que coute une facture donnee.
  function etendue(assureur) {
    const remboursables = new Set(db().catalogue.prestations
      .filter((p) => p.nature === 'remboursement' && p.actif !== false).map((p) => p.id));
    const chiffrees = new Set();
    const aPreciser = new Set();
    for (const prod of assureur.produits_lca || []) {
      if (prod.hors_perimetre_facture || prod.portefeuille_ferme) continue;
      for (const c of prod.couvertures || []) {
        if (!remboursables.has(c.prestation_id)) continue;
        (c.statut === 'a_completer' ? aPreciser : chiffrees).add(c.prestation_id);
      }
    }
    for (const id of chiffrees) aPreciser.delete(id);
    return { chiffrees: chiffrees.size, aPreciser: aPreciser.size, set: chiffrees };
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
      const prog = assureur.programme_partenaires;
      const touchees = etat.facture
        .filter((f) => rabais[f.prestationId] && f.montant > 0)
        .map((f) => ({ libelle: (prestation(f.prestationId) || {}).libelle,
                       montant: f.montant, rabais: rabais[f.prestationId] }));
      if (!touchees.length) return null;

      // Deux ordres possibles, et ils ne donnent pas le meme resultat.
      //
      // « facture » : le partenaire facture moins, la caisse rembourse sur ce
      //   montant reduit. C'est ce que decrit le document du Club Assura, qui
      //   precise que les offres agissent sur le prix facture.
      //
      // « reste_a_charge » : la caisse rembourse sur le prix plein, puis le
      //   rabais porte sur ce qui reste a payer. Plus avantageux a annoncer,
      //   mais plus cher pour le client.
      //
      // Sur des lunettes a CHF 1'000 avec CHF 500 cumules et 30% de rabais :
      // CHF 200 a charge dans le premier cas, CHF 350 dans le second.
      if (prog.application_rabais === 'reste_a_charge') {
        let reduction = 0;
        for (const d of evalContractuelle.lca.parLigne) {
          const r = rabais[d.ligne.prestationId];
          if (!r || d.etat !== window.MoteurLca.ETAT.REMBOURSE) continue;
          reduction += Math.max(0, d.ligne.montantLca - d.montant) * r.taux;
        }
        return {
          lamal: evalContractuelle.lamal, lca: evalContractuelle.lca,
          resteACharge: evalContractuelle.resteACharge - reduction,
          economie: reduction, touchees, programme: prog,
        };
      }

      const ev = evaluer(produits, etat, rabais);
      return Object.assign(ev, {
        economie: evalContractuelle.resteACharge - ev.resteACharge,
        touchees,
        programme: prog,
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
        const club = avecClub(a, produits, ev);
        actuel = { assureurId: a.id, nom: a.nom, saisieLibre: false, assureur: a, produits, club,
                   // Le detail doit decrire le meme scenario que le total : quand
                   // les partenaires sont actifs, ce sont les montants remises.
                   lamal: club ? club.lamal : ev.lamal,
                   lca: club ? club.lca : ev.lca,
                   contractuel: ev.resteACharge,
                   resteACharge: club ? club.resteACharge : ev.resteACharge };
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

    // Classement par etendue de gamme, toutes caisses confondues, y compris la
    // caisse actuelle : c'est un axe de comparaison distinct du reste a charge.
    const etendues = db().assureurs
      .filter((a) => a.actif !== false)
      .map((a) => {
        const e = etendue(a);
        return {
          assureurId: a.id, nom: a.nom, chiffrees: e.chiffrees, aPreciser: e.aPreciser,
          couvertesFacture: refs.lignesLca.filter((l) => e.set.has(l.prestationId)).length,
          actuelle: !!(actuel && actuel.assureurId === a.id),
        };
      })
      .sort((x, y) => y.chiffrees - x.chiffrees || x.nom.localeCompare(y.nom));

    return { lamal, actuel, concurrents, etendues,
             lignesFactureLca: refs.lignesLca.length,
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

  return { comparer, preparerLignes, prestation, argumentaire, etendue };
})();
