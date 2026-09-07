// Part LAMal : identique chez tous les assureurs a franchise et modele egaux.
// Ordre : exonerations -> franchise -> quote-part plafonnee -> contribution hospitaliere.
window.MoteurLamal = (function () {
  function plafondQuotePart(categorie, meta) {
    return categorie === 'enfant'
      ? meta.lamal.quote_part_plafond_annuel_enfant
      : meta.lamal.quote_part_plafond_annuel_adulte;
  }

  function contributionJour(categorie, meta) {
    return categorie === 'enfant'
      ? meta.lamal.contribution_hospitaliere_par_jour_enfant
      : meta.lamal.contribution_hospitaliere_par_jour_adulte;
  }

  /**
   * @param lignes [{prestation, montantLamal, jours, quotePartTaux, exonere}]
   * @param p {franchise, franchisePayee, quotePartAtteinte, categorie, meta}
   */
  function calculer(lignes, p) {
    const meta = p.meta;
    let franchiseRestante = Math.max(0, p.franchise - (p.franchisePayee || 0));
    let franchiseConsommee = 0;
    let quotePartBrute = 0;
    let contribution = 0;
    const detail = [];

    for (const l of lignes) {
      if (l.montantLamal <= 0 && !l.jours) continue;

      if (l.exonere) {
        // Maternite : ni franchise, ni quote-part, ni contribution journaliere.
        detail.push({ ligne: l, franchise: 0, quotePart: 0, contribution: 0, exonere: true });
        continue;
      }

      const fr = Math.min(franchiseRestante, l.montantLamal);
      franchiseRestante -= fr;
      franchiseConsommee += fr;

      const taux = l.quotePartTaux != null ? l.quotePartTaux : meta.lamal.quote_part_taux;
      const qp = (l.montantLamal - fr) * taux;
      quotePartBrute += qp;

      const contrib = (l.jours || 0) * contributionJour(p.categorie, meta);
      contribution += contrib;

      detail.push({ ligne: l, franchise: fr, quotePart: qp, contribution: contrib, exonere: false });
    }

    const plafond = plafondQuotePart(p.categorie, meta);
    const marge = Math.max(0, plafond - (p.quotePartAtteinte || 0));
    const quotePart = Math.min(quotePartBrute, marge);
    const quotePartEcretee = quotePartBrute - quotePart;

    return {
      franchise: franchiseConsommee,
      quotePartBrute,
      quotePart,
      quotePartEcretee,
      plafondQuotePart: plafond,
      contribution,
      resteACharge: franchiseConsommee + quotePart + contribution,
      montantTotal: lignes.reduce((s, l) => s + l.montantLamal, 0),
      detail,
    };
  }

  return { calculer };
})();
