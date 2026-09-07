#!/usr/bin/env node
/**
 * Campagne combinatoire : plus d'un millier de scenarios deterministes,
 * verifies non pas sur une valeur attendue — impossible a calculer a la main
 * mille fois — mais sur des invariants qui doivent tenir quel que soit le cas.
 *
 *   node tools/tests-combinatoires.mjs
 *   node tools/tests-combinatoires.mjs --detail    (affiche chaque anomalie)
 *
 * Un invariant qui casse designe un bug reel : c'est ce qu'on cherche.
 */
import { readFileSync } from 'node:fs';

globalThis.window = globalThis;
for (const f of ['data/db.js', 'js/format.js', 'js/moteur-lamal.js',
                 'js/moteur-lca.js', 'js/comparateur.js']) {
  (0, eval)(readFileSync(f, 'utf8'));
}

const DETAIL = process.argv.includes('--detail');
const anomalies = [];
let scenarios = 0;
let controles = 0;

function signaler(type, message, contexte) {
  anomalies.push({ type, message, contexte });
}

function verifier(type, condition, message, contexte) {
  controles += 1;
  if (!condition) signaler(type, message, contexte);
}

const PRESTATIONS = DB.catalogue.prestations
  .filter((p) => p.actif !== false && p.nature === 'remboursement');
const CAISSES = DB.assureurs.filter((a) => a.actif !== false);
const fini = (n) => typeof n === 'number' && Number.isFinite(n);

/** Montants et unites plausibles pour une prestation donnee. */
function lignePour(p, taille) {
  const bases = { petit: 180, moyen: 1400, gros: 12000 };
  const f = { prestationId: p.id, montant: bases[taille] };
  if (p.unite_saisie === 'montant_et_seances') f.seances = taille === 'gros' ? 18 : 4;
  if (p.unite_saisie === 'montant_et_jours') f.jours = taille === 'gros' ? 22 : 5;
  if (p.categorie === 'MIXTE') f.montantPartLamal = Math.round(f.montant * 0.45);
  return f;
}

function lancer(o) {
  scenarios += 1;
  return Comparateur.comparer({
    client: Object.assign({ categorie: 'adulte', franchise: 300, modele: 'standard' }, o.client),
    cumuls: o.cumuls || {},
    filtresProduits: {},
    clubActif: !!o.clubActif,
    caissesMasquees: o.caissesMasquees || [],
    actuel: Object.assign({ mode: 'base', assureurId: null, produitIds: [] }, o.actuel),
    facture: (o.facture || []).map((f, i) => Object.assign({ id: i + 1 }, f)),
  });
}

/** Invariants qui doivent tenir pour tout resultat. */
function controlerResultat(r, ctx) {
  const toutes = (r.actuel ? [r.actuel] : []).concat(r.concurrents);

  verifier('valeur', fini(r.lamal.resteACharge), 'part base non numerique', ctx);
  verifier('base-negative', r.lamal.resteACharge >= -0.011,
    'part base negative : ' + r.lamal.resteACharge, ctx);

  for (const c of toutes) {
    const nom = (c.nom || '?');
    verifier('valeur', fini(c.resteACharge), `reste a charge non numerique chez ${nom}`, ctx);
    verifier('reste-negatif', c.resteACharge >= -0.011,
      `reste a charge negatif chez ${nom} : ${c.resteACharge}`, ctx);

    for (const d of c.lca.parLigne) {
      verifier('valeur', fini(d.montant), `remboursement non numerique chez ${nom}`, ctx);
      verifier('remb-negatif', d.montant >= -0.011,
        `remboursement negatif chez ${nom} sur ${d.ligne.prestationId}`, ctx);
      verifier('remb-superieur', d.montant <= d.ligne.montantLca + 0.011,
        `remboursement ${d.montant} superieur a la ligne ${d.ligne.montantLca} `
        + `chez ${nom} sur ${d.ligne.prestationId}`, ctx);
      verifier('etat', ['rembourse', 'non_couvert', 'a_preciser'].indexOf(d.etat) !== -1,
        `etat inconnu « ${d.etat} » chez ${nom}`, ctx);
      verifier('a-preciser-nul', d.etat !== 'a_preciser' || d.montant === 0,
        `une ligne « a preciser » porte un montant chez ${nom}`, ctx);
      verifier('produit-nomme', d.etat !== 'rembourse' || !!d.produit,
        `remboursement sans produit nomme chez ${nom}`, ctx);
    }

    const attendu = c.lamal.resteACharge + c.lca.totalLca - c.lca.totalRembourse;
    verifier('somme', Math.abs(c.resteACharge - attendu) < 0.011,
      `somme des parts incoherente chez ${nom} : ${c.resteACharge} vs ${attendu}`, ctx);
  }

  // La part base ne depend pas de l'assureur, sauf lorsqu'un rabais partenaire
  // fait baisser une facture LAMal — auquel cas elle baisse pour cette caisse.
  if (!r.clubActif) {
    for (const c of r.concurrents) {
      verifier('base-identique',
        Math.abs(c.lamal.resteACharge - r.lamal.resteACharge) < 0.011,
        `part base differente chez ${c.nom}`, ctx);
    }
  }

  for (let i = 1; i < r.concurrents.length; i += 1) {
    verifier('tri', r.concurrents[i].resteACharge >= r.concurrents[i - 1].resteACharge - 0.011,
      'classement non trie', ctx);
  }
}

// ===========================================================================
console.log('Campagne combinatoire\n');

// --- 1. Chaque prestation, trois tailles, avec et sans partenaires ----------
for (const p of PRESTATIONS) {
  for (const taille of ['petit', 'moyen', 'gros']) {
    for (const club of [false, true]) {
      const r = lancer({ clubActif: club,
        actuel: { assureurId: 'groupe_mutuel', produitIds: [] },
        facture: [lignePour(p, taille)] });
      controlerResultat(r, `${p.id} / ${taille}${club ? ' / partenaires' : ''}`);
    }
  }
}
console.log(`  ${scenarios} scenarios — chaque prestation en trois tailles, partenaires actifs ou non`);

// --- 2. Categories d'age et franchises --------------------------------------
let n0 = scenarios;
const FRANCHISES = { adulte: [300, 500, 1000, 1500, 2000, 2500],
                     jeune_adulte: [300, 1000, 2500], enfant: [0, 200, 600] };
for (const cat of Object.keys(FRANCHISES)) {
  for (const fr of FRANCHISES[cat]) {
    for (const montant of [200, 2000, 20000]) {
      const r = lancer({ client: { categorie: cat, franchise: fr },
        actuel: { assureurId: 'assura', produitIds: ['assura_complementa_extra'] },
        facture: [{ prestationId: 'consultation_medecin', montant },
                  { prestationId: 'hospitalisation_commune', montant: montant * 2, jours: 6 }] });
      controlerResultat(r, `${cat} / franchise ${fr} / ${montant}`);
      const plafond = cat === 'enfant' ? 350 : 700;
      verifier('plafond-quote-part', r.lamal.quotePart <= plafond + 0.011,
        `quote-part ${r.lamal.quotePart} au-dela du plafond ${plafond}`, `${cat} / ${fr}`);
      verifier('franchise-bornee', r.lamal.franchise <= fr + 0.011,
        `franchise consommee ${r.lamal.franchise} superieure a la franchise choisie`, `${cat}`);
    }
  }
}
console.log(`  ${scenarios - n0} scenarios — categories d'age et franchises`);

// --- 3. Cumuls annuels ------------------------------------------------------
n0 = scenarios;
for (const fp of [0, 150, 300, 600]) {
  for (const qp of [0, 200, 700, 900]) {
    for (const fl of [false, true]) {
      const r = lancer({ cumuls: { franchisePayee: fp, quotePartAtteinte: qp,
                                   franchisesProduitsConsommees: fl },
        actuel: { assureurId: 'assura', produitIds: ['assura_natura'] },
        facture: [{ prestationId: 'consultation_medecin', montant: 3000 },
                  { prestationId: 'osteopathie', montant: 900, seances: 6 }] });
      controlerResultat(r, `cumuls ${fp}/${qp}/${fl}`);
    }
  }
}
console.log(`  ${scenarios - n0} scenarios — cumuls annuels deja consommes`);

// --- 4. Chaque caisse, chacun de ses produits pris seul ---------------------
n0 = scenarios;
for (const a of CAISSES) {
  for (const prod of a.produits_lca || []) {
    const presta = (prod.couvertures || [])[0];
    if (!presta) continue;
    const p = DB.catalogue.prestations.find((x) => x.id === presta.prestation_id);
    if (!p || p.nature !== 'remboursement' || p.actif === false) continue;
    const r = lancer({ actuel: { assureurId: a.id, produitIds: [prod.id] },
      facture: [lignePour(p, 'moyen')] });
    controlerResultat(r, `${a.id} / ${prod.id}`);
  }
}
console.log(`  ${scenarios - n0} scenarios — chaque produit de chaque caisse, pris seul`);

// --- 5. Paniers composites --------------------------------------------------
n0 = scenarios;
const PANIERS = [
  ['consultation_specialiste', 'osteopathie', 'dentaire_soins'],
  ['hospitalisation_demi_privee', 'lunettes_lentilles_adulte', 'medicaments_hors_liste'],
  ['psychotherapie_medicale', 'physiotherapie_prescrite', 'analyses_laboratoire'],
  ['accouchement', 'maternite_complements', 'imagerie_medicale'],
  ['dentaire_orthodontie', 'dentaire_prophylaxie', 'dentaire_prothese_implant'],
  ['soins_etranger_urgence', 'rapatriement', 'transport_urgence'],
  ['acupuncture', 'homeopathie', 'medecine_chinoise', 'naturopathie_phytotherapie'],
  ['soins_domicile_lca', 'aide_menage', 'moyens_auxiliaires_lca'],
];
for (const noms of PANIERS) {
  for (const a of CAISSES) {
    for (const club of [false, true]) {
      const facture = noms.map((id) => {
        const p = DB.catalogue.prestations.find((x) => x.id === id);
        return p ? lignePour(p, 'moyen') : null;
      }).filter(Boolean);
      const produits = (a.produits_lca || [])
        .filter((x) => !x.hors_perimetre_facture).slice(0, 3).map((x) => x.id);
      const r = lancer({ clubActif: club, actuel: { assureurId: a.id, produitIds: produits },
                         facture });
      controlerResultat(r, `panier ${noms[0]} / ${a.id}${club ? ' / partenaires' : ''}`);
    }
  }
}
console.log(`  ${scenarios - n0} scenarios — paniers composites chez chaque caisse`);

// --- 6. Masquage de caisses -------------------------------------------------
n0 = scenarios;
for (const a of CAISSES) {
  const r = lancer({ caissesMasquees: [a.id],
    actuel: { assureurId: 'groupe_mutuel', produitIds: [] },
    facture: [{ prestationId: 'dentaire_soins', montant: 2500 }] });
  controlerResultat(r, `masquage ${a.id}`);
  verifier('masquage', r.concurrents.length === CAISSES.length - 1 && r.nbMasquees === 1,
    `masquage de ${a.id} incoherent`, 'masquage');
}
console.log(`  ${scenarios - n0} scenarios — masquage de chaque caisse`);

// ===========================================================================
// Monotonies : des relations qui doivent tenir entre deux scenarios voisins.
console.log('\nMonotonies');
n0 = scenarios;

const resteChez = (r, id) => (r.concurrents.find((c) => c.assureurId === id) || {}).resteACharge;

for (const p of PRESTATIONS.slice(0, 60)) {
  const base = { actuel: { assureurId: 'groupe_mutuel', produitIds: [] } };

  // Une facture plus elevee ne peut pas faire baisser le remboursement.
  const petit = lancer(Object.assign({ facture: [lignePour(p, 'petit')] }, base));
  const gros = lancer(Object.assign({ facture: [lignePour(p, 'gros')] }, base));
  for (const a of CAISSES) {
    const rp = petit.concurrents.find((c) => c.assureurId === a.id);
    const rg = gros.concurrents.find((c) => c.assureurId === a.id);
    if (!rp || !rg) continue;
    verifier('monotonie-montant', rg.lca.totalRembourse >= rp.lca.totalRembourse - 0.011,
      `remboursement en baisse quand la facture augmente, ${a.nom} sur ${p.id}`, p.id);
  }

  // Les partenaires ne peuvent pas augmenter le reste a charge.
  const sans = lancer(Object.assign({ facture: [lignePour(p, 'moyen')] }, base));
  const avec = lancer(Object.assign({ clubActif: true,
    facture: [lignePour(p, 'moyen')] }, base));
  verifier('monotonie-partenaires',
    resteChez(avec, 'assura') <= resteChez(sans, 'assura') + 0.011,
    `les partenaires augmentent le reste a charge d'Assura sur ${p.id}`, p.id);
}

// Plus d'annees de cumul ne peut pas reduire le remboursement.
for (const presta of ['lunettes_lentilles_adulte', 'chirurgie_refractive', 'dentaire_orthodontie']) {
  let precedent = -1;
  for (const annees of [1, 2, 3, 5, 8]) {
    const r = lancer({ actuel: { assureurId: 'assura', produitIds: ['assura_complementa_extra',
                                                                    'assura_denta_ortho_3'] },
      facture: [{ prestationId: presta, montant: 5000, anneesCumul: annees }] });
    const m = r.actuel.lca.totalRembourse;
    verifier('monotonie-cumul', m >= precedent - 0.011,
      `le cumul d'annees fait baisser le remboursement sur ${presta}`, presta);
    precedent = m;
  }
}

// Cocher un produit de plus ne peut pas reduire le remboursement.
for (const a of CAISSES) {
  const dispo = (a.produits_lca || []).filter((p) => !p.hors_perimetre_facture).map((p) => p.id);
  if (dispo.length < 2) continue;
  for (const presta of ['dentaire_soins', 'osteopathie', 'lunettes_lentilles_adulte',
                        'medicaments_hors_liste', 'hospitalisation_demi_privee']) {
    const p = DB.catalogue.prestations.find((x) => x.id === presta);
    const facture = [lignePour(p, 'moyen')];
    let precedent = -1;
    for (let k = 1; k <= Math.min(dispo.length, 6); k += 1) {
      const r = lancer({ actuel: { assureurId: a.id, produitIds: dispo.slice(0, k) }, facture });
      const m = r.actuel.lca.totalRembourse;
      verifier('monotonie-produits', m >= precedent - 0.011,
        `cocher un produit de plus reduit le remboursement, ${a.nom} sur ${presta}`, a.id);
      precedent = m;
    }
  }
}

// Une franchise plus elevee ne peut pas reduire le reste a charge de base.
for (const montant of [500, 3000, 15000]) {
  let precedent = -1;
  for (const fr of [300, 500, 1000, 1500, 2000, 2500]) {
    const r = lancer({ client: { franchise: fr },
      actuel: { assureurId: 'assura', produitIds: [] },
      facture: [{ prestationId: 'consultation_medecin', montant }] });
    verifier('monotonie-franchise', r.lamal.resteACharge >= precedent - 0.011,
      `une franchise plus elevee reduit le reste a charge sur ${montant}`, `${montant}`);
    precedent = r.lamal.resteACharge;
  }
}
console.log(`  ${scenarios - n0} scenarios de comparaison`);

// ===========================================================================
// Audit des donnees : incoherences de saisie, dans un sens comme dans l'autre.
console.log('\nAudit des donnees');
for (const a of CAISSES) {
  for (const prod of a.produits_lca || []) {
    const vues = new Map();
    for (const c of prod.couvertures || []) {
      const p = DB.catalogue.prestations.find((x) => x.id === c.prestation_id);
      controles += 1;
      if (!p) { signaler('donnees', `${a.nom} / ${prod.nom} : prestation inconnue ${c.prestation_id}`); continue; }
      if (p.actif === false) signaler('donnees', `${a.nom} / ${prod.nom} : prestation desactivee ${c.prestation_id}`);
      if (vues.has(c.prestation_id)) {
        signaler('donnees', `${a.nom} / ${prod.nom} : ${c.prestation_id} declaree deux fois`);
      }
      vues.set(c.prestation_id, true);
      if (c.statut !== 'a_completer') {
        if (!(c.taux_remboursement > 0)) {
          signaler('donnees', `${a.nom} / ${prod.nom} / ${c.prestation_id} : taux nul ou absent`);
        }
        for (const champ of ['plafond_annuel', 'plafond_par_seance', 'plafond_par_jour']) {
          if (c[champ] != null && !(c[champ] > 0)) {
            signaler('donnees', `${a.nom} / ${prod.nom} / ${c.prestation_id} : ${champ} nul`);
          }
        }
      }
      if (c.enveloppe_id) {
        const env = (prod.enveloppes || []).find((e) => e.id === c.enveloppe_id);
        if (!env) signaler('donnees', `${a.nom} / ${prod.nom} : enveloppe ${c.enveloppe_id} absente`);
      }
    }
  }
}

// ===========================================================================
console.log('\n' + '─'.repeat(84));
console.log(`${scenarios} scenarios, ${controles} controles.`);
if (!anomalies.length) {
  console.log('\x1b[32mAucune anomalie.\x1b[0m');
} else {
  const parType = {};
  for (const a of anomalies) (parType[a.type] = parType[a.type] || []).push(a);
  console.log(`\x1b[31m${anomalies.length} anomalie(s) :\x1b[0m`);
  for (const type of Object.keys(parType).sort()) {
    const liste = parType[type];
    console.log(`\n  ${type} — ${liste.length}`);
    const montrer = DETAIL ? liste : liste.slice(0, 6);
    for (const a of montrer) {
      console.log('    ' + a.message + (a.contexte ? `   [${a.contexte}]` : ''));
    }
    if (!DETAIL && liste.length > montrer.length) {
      console.log(`    … ${liste.length - montrer.length} autre(s), relancer avec --detail`);
    }
  }
  process.exit(1);
}
