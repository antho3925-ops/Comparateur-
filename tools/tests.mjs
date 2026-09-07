#!/usr/bin/env node
/**
 * Suite de tests du moteur de calcul.
 *
 *   node tools/tests.mjs
 *
 * Chaque cas porte une valeur attendue calculee a la main, ecrite dans son
 * intitule. Un test qui echoue affiche l'ecart et le detail de la ligne, de
 * sorte qu'on sache immediatement quelle regle a lache.
 */
import { readFileSync } from 'node:fs';

globalThis.window = globalThis;
for (const f of ['data/db.js', 'js/format.js', 'js/moteur-lamal.js',
                 'js/moteur-lca.js', 'js/comparateur.js']) {
  (0, eval)(readFileSync(f, 'utf8'));
}

let reussis = 0;
const echecs = [];
let section = '';

const titre = (t) => { section = t; console.log('\n\x1b[1m' + t + '\x1b[0m'); };

function verifier(nom, obtenu, attendu, detail) {
  const ok = Math.abs(obtenu - attendu) < 0.011;
  if (ok) {
    reussis += 1;
    console.log('  \x1b[32mok\x1b[0m   ' + nom.padEnd(64) + Fmt.chf(obtenu).padStart(11));
  } else {
    echecs.push({ section, nom, obtenu, attendu, detail });
    console.log('  \x1b[31mECHEC\x1b[0m ' + nom.padEnd(64) + Fmt.chf(obtenu).padStart(11)
      + '   attendu ' + Fmt.chf(attendu));
    if (detail) console.log('        ' + detail);
  }
}

function verifierVrai(nom, condition, detail) {
  if (condition) {
    reussis += 1;
    console.log('  \x1b[32mok\x1b[0m   ' + nom);
  } else {
    echecs.push({ section, nom, obtenu: 'faux', attendu: 'vrai', detail });
    console.log('  \x1b[31mECHEC\x1b[0m ' + nom + (detail ? '   ' + detail : ''));
  }
}

/** Construit un etat complet a partir de quelques champs. */
function cas(o) {
  return Comparateur.comparer({
    client: Object.assign({ categorie: 'adulte', franchise: 300, modele: 'standard' }, o.client),
    cumuls: o.cumuls || {},
    filtresProduits: o.filtresProduits || {},
    clubActif: !!o.clubActif,
    caissesMasquees: o.caissesMasquees || [],
    actuel: Object.assign({ mode: 'base', assureurId: null, produitIds: [] }, o.actuel),
    facture: (o.facture || []).map((f, i) => Object.assign({ id: i + 1 }, f)),
  });
}

const chez = (r, id) => r.concurrents.find((c) => c.assureurId === id);
const ligne = (res, i) => res.lca.parLigne[i || 0];

// ===========================================================================
titre('Assurance de base — franchise, quote-part, plafonds');

verifier('consultation 400, franchise 300 : 300 + 10% de 100',
  cas({ actuel: { assureurId: 'assura' },
        facture: [{ prestationId: 'consultation_medecin', montant: 400 }] }).lamal.resteACharge,
  310);

verifier('consultation 400, franchise 2500 : tout sur la franchise',
  cas({ client: { franchise: 2500 }, actuel: { assureurId: 'assura' },
        facture: [{ prestationId: 'consultation_medecin', montant: 400 }] }).lamal.resteACharge,
  400);

verifier('consultation 10 000 : quote-part ecretee au plafond de 700',
  cas({ actuel: { assureurId: 'assura' },
        facture: [{ prestationId: 'consultation_medecin', montant: 10000 }] }).lamal.resteACharge,
  1000);

verifier('enfant, franchise 0, 10 000 : quote-part plafonnee a 350',
  cas({ client: { categorie: 'enfant', franchise: 0 }, actuel: { assureurId: 'assura' },
        facture: [{ prestationId: 'consultation_medecin', montant: 10000 }] }).lamal.resteACharge,
  350);

verifier('hospitalisation commune 5 000 sur 4 jours : + 4 x 15 de contribution',
  cas({ actuel: { assureurId: 'assura' },
        facture: [{ prestationId: 'hospitalisation_commune', montant: 5000, jours: 4 }] })
    .lamal.resteACharge,
  830);

verifier('enfant hospitalise 4 jours : aucune contribution journaliere',
  cas({ client: { categorie: 'enfant', franchise: 0 }, actuel: { assureurId: 'assura' },
        facture: [{ prestationId: 'hospitalisation_commune', montant: 1000, jours: 4 }] })
    .lamal.resteACharge,
  100);

verifier('accouchement 8 000 sur 5 jours : exoneration maternite integrale',
  cas({ actuel: { assureurId: 'assura' },
        facture: [{ prestationId: 'accouchement', montant: 8000, jours: 5 }] }).lamal.resteACharge,
  0);

verifier('franchise et quote-part deja epuisees : plus rien a charge',
  cas({ cumuls: { franchisePayee: 300, quotePartAtteinte: 700 }, actuel: { assureurId: 'assura' },
        facture: [{ prestationId: 'consultation_medecin', montant: 2000 }] }).lamal.resteACharge,
  0);

verifier('medicament original substituable : quote-part portee a 20%',
  cas({ cumuls: { franchisePayee: 300 }, actuel: { assureurId: 'assura' },
        facture: [{ prestationId: 'medicaments_liste', montant: 1000, quotePartTaux: 0.20 }] })
    .lamal.resteACharge,
  200);

// ===========================================================================
titre('Complementaire — taux, plafonds, enveloppes');

{
  const r = cas({ actuel: { assureurId: 'assura', produitIds: ['assura_denta_sana'] },
    facture: [{ prestationId: 'dentaire_prophylaxie', montant: 200 },
              { prestationId: 'dentaire_soins', montant: 4000 },
              { prestationId: 'dentaire_prothese_implant', montant: 5000 }] });
  verifier('Denta Sana, prophylaxie 200 : 100% plafonne a 80, sans franchise',
    ligne(r.actuel, 0).montant, 80);
  verifier('Denta Sana, soins 4 000 : 75%', ligne(r.actuel, 1).montant, 3000);
  verifier('Denta Sana, protheses 5 000 : enveloppe commune de 6 000 saturee',
    ligne(r.actuel, 2).montant, 3000);
  verifier('Denta Sana, total rembourse : 80 + 6 000', r.actuel.lca.totalRembourse, 6080);
}

verifier('Denta Ortho niveau 2, orthodontie 20 000 : 75% plafonne a 6 000',
  ligne(cas({ actuel: { assureurId: 'assura', produitIds: ['assura_denta_ortho_2'] },
    facture: [{ prestationId: 'dentaire_orthodontie', montant: 20000 }] }).actuel).montant,
  6000);

verifier('Natura, 900 sur 6 seances : (900 - 200 de franchise) x 90%',
  ligne(cas({ actuel: { assureurId: 'assura', produitIds: ['assura_natura'] },
    facture: [{ prestationId: 'osteopathie', montant: 900, seances: 6 }] }).actuel).montant,
  630);

verifier('Natura, 20 seances : quota de 12, plafond de 110 par seance',
  ligne(cas({ actuel: { assureurId: 'assura', produitIds: ['assura_natura'] },
    facture: [{ prestationId: 'osteopathie', montant: 6000, seances: 20 }] }).actuel).montant,
  1320);

verifier('Complementa Extra, dentaire 1 200 : franchise 500 puis 100%',
  ligne(cas({ actuel: { assureurId: 'assura', produitIds: ['assura_complementa_extra'] },
    facture: [{ prestationId: 'dentaire_soins', montant: 1200 }] }).actuel).montant,
  700);

verifier('Complementa Extra, dentaire 2 000 : plafond de remboursement a 1 000',
  ligne(cas({ actuel: { assureurId: 'assura', produitIds: ['assura_complementa_extra'] },
    facture: [{ prestationId: 'dentaire_soins', montant: 2000 }] }).actuel).montant,
  1000);

// Sans la franchise, les 90% donneraient 810, mais le plafond de 110 par
// seance ramene a 6 x 110. La franchise n'est donc pas le seul frein.
verifier('franchise de produit deja atteinte : 90% du plein, borne a 110 par seance',
  ligne(cas({ cumuls: { franchisesProduitsConsommees: true },
    actuel: { assureurId: 'assura', produitIds: ['assura_natura'] },
    facture: [{ prestationId: 'osteopathie', montant: 900, seances: 6 }] }).actuel).montant,
  660);

// ===========================================================================
titre('Complementaire — participation journaliere et plafonds cumulables');

{
  const r = cas({ actuel: { assureurId: 'assura', produitIds: ['assura_optima_flex_varia'] },
    facture: [{ prestationId: 'hospitalisation_privee', montant: 26000,
                montantPartLamal: 6000, jours: 10 }] });
  verifier('Optima Flex Varia, 10 jours : participation de 300 par jour',
    ligne(r.actuel).montant, 17000);
  verifier('base : 300 + 10% de 5 700 + 10 x 15', r.lamal.resteACharge, 1020);
  verifier('reste a charge total', r.actuel.resteACharge, 4020);
}

verifier('Optima Flex Varia, 20 jours : participation bornee a 15 jours',
  ligne(cas({ actuel: { assureurId: 'assura', produitIds: ['assura_optima_flex_varia'] },
    facture: [{ prestationId: 'hospitalisation_privee', montant: 36000,
                montantPartLamal: 6000, jours: 20 }] }).actuel).montant,
  25500);

verifier('Optima Plus Varia : aucune participation',
  ligne(cas({ actuel: { assureurId: 'assura', produitIds: ['assura_optima_plus_varia'] },
    facture: [{ prestationId: 'hospitalisation_privee', montant: 26000,
                montantPartLamal: 6000, jours: 10 }] }).actuel).montant,
  20000);

verifier('lunettes 600 apres 1 an : plafond annuel de 100',
  ligne(cas({ actuel: { assureurId: 'assura', produitIds: ['assura_complementa_extra'] },
    facture: [{ prestationId: 'lunettes_lentilles_adulte', montant: 600, anneesCumul: 1 }] })
    .actuel).montant, 100);

verifier('lunettes 600 apres 3 ans : 3 x 100 cumules',
  ligne(cas({ actuel: { assureurId: 'assura', produitIds: ['assura_complementa_extra'] },
    facture: [{ prestationId: 'lunettes_lentilles_adulte', montant: 600, anneesCumul: 3 }] })
    .actuel).montant, 300);

verifier('lunettes 600 apres 7 ans : cumul borne a 5 ans, soit 500',
  ligne(cas({ actuel: { assureurId: 'assura', produitIds: ['assura_complementa_extra'] },
    facture: [{ prestationId: 'lunettes_lentilles_adulte', montant: 600, anneesCumul: 7 }] })
    .actuel).montant, 500);

// ===========================================================================
titre('Prestations mixtes');

{
  const r = cas({ actuel: { assureurId: 'assura', produitIds: ['assura_optima_varia'] },
    facture: [{ prestationId: 'hospitalisation_demi_privee', montant: 12000,
                montantPartLamal: 5000, jours: 6 }] });
  verifier('mi-privee 12 000 dont 5 000 au tarif LAMal : part base',
    r.lamal.resteACharge, 860);
  verifier('part complementaire prise a 100% par Optima Varia',
    ligne(r.actuel).montant, 7000);
  verifier('reste a charge total', r.actuel.resteACharge, 860);
}

{
  const r = cas({ actuel: { assureurId: 'assura', produitIds: ['assura_optima_varia'] },
    facture: [{ prestationId: 'hospitalisation_demi_privee', montant: 12000, jours: 6 }] });
  verifierVrai('part LAMal absente : la ligne est signalee incomplete',
    r.incompletes.length === 1 && r.actuel.lca.parLigne.length === 0);
}

// ===========================================================================
titre('Choix du produit et etats affiches');

verifier('deux produits coches : le plus favorable est retenu',
  ligne(cas({ actuel: { assureurId: 'assura',
      produitIds: ['assura_denta_sana', 'assura_denta_ortho_3'] },
    facture: [{ prestationId: 'dentaire_orthodontie', montant: 20000 }] }).actuel).montant,
  10000);

verifierVrai('prestation non couverte par le produit coche : etat « non couvert »',
  ligne(cas({ actuel: { assureurId: 'assura', produitIds: ['assura_denta_sana'] },
    facture: [{ prestationId: 'osteopathie', montant: 500 }] }).actuel).etat === 'non_couvert');

{
  const r = cas({ actuel: { assureurId: 'groupe_mutuel', produitIds: ['gm_soins_premium'] },
    facture: [{ prestationId: 'medicaments_hors_liste', montant: 800 }] });
  verifierVrai('couverture sans taux exploitable : etat « a preciser », hors totaux',
    ligne(r.actuel).etat === 'a_preciser' && ligne(r.actuel).montant === 0
    && r.actuel.lca.nbAPreciser === 1);
}

verifierVrai('aucun produit coche : la complementaire ne rembourse rien',
  cas({ actuel: { assureurId: 'assura', produitIds: [] },
    facture: [{ prestationId: 'dentaire_soins', montant: 2000 }] }).actuel.lca.totalRembourse === 0);

verifierVrai('produit hors perimetre coche : ignore dans le calcul de facture',
  cas({ actuel: { assureurId: 'assura', produitIds: ['assura_hospita'] },
    facture: [{ prestationId: 'dentaire_soins', montant: 2000 }] }).actuel.lca.totalRembourse === 0);

{
  const r = cas({ actuel: { assureurId: 'groupe_mutuel', produitIds: [] },
    facture: [{ prestationId: 'dentaire_soins', montant: 3000 }] });
  const a = chez(r, 'assura');
  verifierVrai('portefeuille ferme exclu des caisses comparees',
    a.produits.every((p) => !p.portefeuille_ferme));
}

verifierVrai('portefeuille ferme retenu s\'il est coche comme couverture actuelle',
  cas({ actuel: { assureurId: 'assura', produitIds: ['assura_denta_plus'] },
    facture: [{ prestationId: 'dentaire_soins', montant: 3000 }] })
    .actuel.lca.totalRembourse > 0);

// ===========================================================================
titre('Comparatif — perimetre et classement');

{
  const r = cas({ actuel: { assureurId: 'assura', produitIds: ['assura_denta_sana'] },
    facture: [{ prestationId: 'dentaire_soins', montant: 3000 }] });
  verifierVrai('la caisse du client figure aussi au classement, gamme complete',
    r.concurrents.some((c) => c.assureurId === 'assura' && c.estCaisseDuClient));
  verifierVrai('les 9 caisses sont evaluees', r.concurrents.length === 9);
  verifierVrai('classement par reste a charge croissant',
    r.concurrents.every((c, i) => i === 0 || c.resteACharge >= r.concurrents[i - 1].resteACharge));
}

{
  const r = cas({ caissesMasquees: ['swica'],
    actuel: { assureurId: 'groupe_mutuel', produitIds: [] },
    facture: [{ prestationId: 'dentaire_soins', montant: 3000 }] });
  verifierVrai('caisse masquee : retiree du tableau et comptee',
    r.concurrents.length === 8 && r.nbMasquees === 1
    && !r.concurrents.some((c) => c.assureurId === 'swica'));
}

{
  const r = cas({ actuel: { assureurId: 'assura', produitIds: ['assura_denta_sana'] },
    facture: [{ prestationId: 'indemnite_journaliere', montant: 5000, jours: 30 }] });
  verifierVrai('prestation versee : exclue du reste a charge et listee a part',
    r.versees.length === 1 && r.actuel.resteACharge === 0);
}

{
  const r = cas({ actuel: { assureurId: 'assura', produitIds: [] },
    facture: [{ prestationId: 'dentaire_soins', montant: 3000 }] });
  verifierVrai('etendue : les 9 caisses classees par largeur de gamme decroissante',
    r.etendues.length === 9
    && r.etendues.every((e, i) => i === 0 || e.chiffrees <= r.etendues[i - 1].chiffrees));
}

// ===========================================================================
titre('Programme partenaires');

{
  const sans = cas({ actuel: { assureurId: 'assura', produitIds: ['assura_complementa_extra'] },
    facture: [{ prestationId: 'lunettes_lentilles_adulte', montant: 1000, anneesCumul: 5 }] });
  const avec = cas({ clubActif: true,
    actuel: { assureurId: 'assura', produitIds: ['assura_complementa_extra'] },
    facture: [{ prestationId: 'lunettes_lentilles_adulte', montant: 1000, anneesCumul: 5 }] });
  verifier('lunettes 1 000, 5 ans de cumul, sans partenaire', sans.actuel.resteACharge, 500);
  verifier('avec partenaire : facture ramenee a 700, plafond de 500 verse',
    avec.actuel.resteACharge, 200);
  verifier('economie reelle du client, et non le montant du rabais',
    avec.actuel.club.economie, 300);
  verifierVrai('le rabais ne touche que les caisses qui ont un programme',
    chez(avec, 'helsana').club === null || chez(avec, 'helsana').club === undefined);
}

verifier('Complementa Extra : tout medicament hors liste, 100% jusqu\'a 50 000',
  ligne(cas({ actuel: { assureurId: 'assura', produitIds: ['assura_complementa_extra'] },
    facture: [{ prestationId: 'medicaments_hors_liste', montant: 1000 }] }).actuel).montant,
  1000);

verifier('Medna seul : 80% apres la franchise de 200',
  ligne(cas({ actuel: { assureurId: 'assura', produitIds: ['assura_medna'] },
    facture: [{ prestationId: 'medicaments_hors_liste', montant: 1000 }] }).actuel).montant,
  640);

verifier('medicaments 1 000 chez Medna, rabais pharmacie de 15%',
  cas({ clubActif: true, actuel: { assureurId: 'assura', produitIds: ['assura_medna'] },
    facture: [{ prestationId: 'medicaments_hors_liste', montant: 1000 }] }).actuel.resteACharge,
  330);

// ===========================================================================
titre('Coherence generale');

{
  const r = cas({ actuel: { assureurId: 'helsana',
      produitIds: ['helsana_completa', 'helsana_dentaplus_argent', 'helsana_hospital_demi_privee'] },
    facture: [{ prestationId: 'consultation_specialiste', montant: 480 },
              { prestationId: 'osteopathie', montant: 540, seances: 4 },
              { prestationId: 'dentaire_soins', montant: 2800 },
              { prestationId: 'lunettes_lentilles_adulte', montant: 690 },
              { prestationId: 'hospitalisation_demi_privee', montant: 9800,
                montantPartLamal: 4200, jours: 5 }] });

  // Lignes LAMal : consultation 480 + part hospitaliere 4 200 = 4 680.
  verifier('panier complet : part base 300 + 10% de 4 380 + 5 x 15',
    r.lamal.resteACharge, 813);
  verifierVrai('reste a charge = part base + part complementaire non remboursee',
    Math.abs(r.actuel.resteACharge
      - (r.lamal.resteACharge + r.actuel.lca.totalLca - r.actuel.lca.totalRembourse)) < 0.011);
  verifierVrai('aucun remboursement ne depasse le montant de sa ligne',
    r.concurrents.every((c) => c.lca.parLigne.every((d) => d.montant <= d.ligne.montantLca + 0.011)));
  verifierVrai('aucun reste a charge negatif',
    r.concurrents.every((c) => c.resteACharge >= -0.011));
  verifierVrai('la part base est identique chez toutes les caisses',
    r.concurrents.every((c) => Math.abs(c.lamal.resteACharge - r.lamal.resteACharge) < 0.011));
}

// ===========================================================================
console.log('\n' + '─'.repeat(84));
if (echecs.length === 0) {
  console.log(`\x1b[32m${reussis} tests passes, aucun echec.\x1b[0m`);
} else {
  console.log(`\x1b[31m${echecs.length} echec(s) sur ${reussis + echecs.length} tests :\x1b[0m`);
  for (const e of echecs) {
    console.log(`  ${e.section} — ${e.nom}`);
    console.log(`    obtenu ${e.obtenu}, attendu ${e.attendu}`);
  }
  process.exit(1);
}
