// Modele du suivi des contrats : types, statuts, normalisation, filtres,
// totaux, export CSV. Aucune dependance au DOM, pour etre teste sous Node.
(function (racine) {
  const TYPES = {
    maladie:  { libelle: 'Assurance maladie', court: 'Maladie',  montant: 'Prime complémentaire (CHF / mois)' },
    everlife: { libelle: 'Everlife',          court: 'Everlife', montant: 'Prime Everlife (CHF)' },
    lpp:      { libelle: 'Transfert LPP',     court: 'LPP',      montant: 'Montant transféré (CHF)' },
  };

  const STATUTS = {
    proposition: 'Proposition',
    signe:       'Signé',
    transmis:    'Transmis à la compagnie',
    accepte:     'Accepté',
    refuse:      'Refusé',
    annule:      'Annulé',
  };
  // Un contrat refuse ou annule ne sera ni police ni commissionne : il sort des
  // listes « a faire ».
  const CLOS = new Set(['refuse', 'annule']);

  const texte = (v) => (v == null ? '' : String(v).trim());
  const nombre = (v) => {
    if (v === '' || v == null) return null;
    const n = typeof v === 'number' ? v : Number(String(v).replace(/['\s]/g, '').replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  };
  const date = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(texte(v)) ? texte(v) : '');
  const oui = (v) => v === true || v === 'true' || v === 1 || v === 'oui';

  function nouvelId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  // Ramene n'importe quel objet (formulaire, fichier importe) a la forme stockee.
  // Renvoie null si l'enregistrement n'a pas de sens (ni nom ni prenom).
  function normaliser(brut, maintenant = new Date().toISOString()) {
    if (!brut || typeof brut !== 'object') return null;
    const c = {
      id:                texte(brut.id) || nouvelId(),
      type:              TYPES[brut.type] ? brut.type : 'maladie',
      nom:               texte(brut.nom),
      prenom:            texte(brut.prenom),
      compagnie:         texte(brut.compagnie),
      montant:           nombre(brut.montant),
      points:            nombre(brut.points),
      statut:            STATUTS[brut.statut] ? brut.statut : 'proposition',
      dateSignature:     date(brut.dateSignature),
      police:            oui(brut.police),
      datePolice:        date(brut.datePolice),
      commissionne:      oui(brut.commissionne),
      dateCommission:    date(brut.dateCommission),
      montantCommission: nombre(brut.montantCommission),
      // Propre a Everlife : sans objet pour les autres types.
      paiementDirect:    brut.type === 'everlife' && oui(brut.paiementDirect),
      note:              texte(brut.note),
      cree:              texte(brut.cree) || maintenant,
      modifie:           texte(brut.modifie) || maintenant,
    };
    if (!c.nom && !c.prenom) return null;
    return c;
  }

  function filtrer(contrats, f = {}) {
    const q = texte(f.recherche).toLowerCase();
    return contrats.filter((c) => {
      if (f.type && f.type !== 'tous' && c.type !== f.type) return false;
      if (f.statut && f.statut !== 'tous' && c.statut !== f.statut) return false;
      if (f.police === 'oui' && !c.police) return false;
      if (f.police === 'non' && c.police) return false;
      if (f.commissionne === 'oui' && !c.commissionne) return false;
      if (f.commissionne === 'non' && c.commissionne) return false;
      if (q) {
        const foin = [c.nom, c.prenom, c.compagnie, c.note].join(' ').toLowerCase();
        if (!q.split(/\s+/).every((mot) => foin.includes(mot))) return false;
      }
      return true;
    });
  }

  const TRIS = {
    recent:  (a, b) => (b.dateSignature || b.cree).localeCompare(a.dateSignature || a.cree),
    nom:     (a, b) => (a.nom + ' ' + a.prenom).localeCompare(b.nom + ' ' + b.prenom, 'fr', { sensitivity: 'base' }),
    montant: (a, b) => (b.montant ?? -1) - (a.montant ?? -1),
    points:  (a, b) => (b.points ?? -1) - (a.points ?? -1),
    commission: (a, b) => (b.montantCommission ?? -1) - (a.montantCommission ?? -1),
  };
  function trier(contrats, cle = 'recent') {
    return [...contrats].sort(TRIS[cle] || TRIS.recent);
  }

  function totaux(contrats) {
    const t = {
      nombre: contrats.length,
      points: 0,
      montantParType: { maladie: 0, everlife: 0, lpp: 0 },
      aPolicer: 0,
      aCommissionner: 0,
      commissions: 0,        // toutes les commissions notees
      commissionsPercues: 0, // sur les contrats deja commissionnes
      commissionsAttendues: 0, // sur les contrats en cours pas encore commissionnes
    };
    for (const c of contrats) {
      t.points += c.points ?? 0;
      t.montantParType[c.type] += c.montant ?? 0;
      const com = c.montantCommission ?? 0;
      t.commissions += com;
      if (c.commissionne) t.commissionsPercues += com;
      if (CLOS.has(c.statut)) continue;
      if (!c.commissionne) t.commissionsAttendues += com;
      if (!c.police) t.aPolicer += 1;
      if (!c.commissionne) t.aCommissionner += 1;
    }
    return t;
  }

  // CSV pour Excel suisse romand : separateur « ; », decimales au point,
  // BOM UTF-8 pour que les accents s'affichent a l'ouverture.
  const COLONNES = [
    ['Nom', (c) => c.nom],
    ['Prénom', (c) => c.prenom],
    ['Type', (c) => TYPES[c.type].libelle],
    ['Compagnie', (c) => c.compagnie],
    ['Montant CHF', (c) => c.montant ?? ''],
    ['Points', (c) => c.points ?? ''],
    ['Commission CHF', (c) => c.montantCommission ?? ''],
    ['Statut', (c) => STATUTS[c.statut]],
    ['Date de signature', (c) => c.dateSignature],
    ['Policé', (c) => (c.police ? 'oui' : 'non')],
    ['Date de police', (c) => c.datePolice],
    ['Commissionné', (c) => (c.commissionne ? 'oui' : 'non')],
    ['Date de commission', (c) => c.dateCommission],
    ['Paiement direct', (c) => (c.type === 'everlife' ? (c.paiementDirect ? 'oui' : 'non') : '')],
    ['Note', (c) => c.note],
  ];
  const cellule = (v) => {
    const s = String(v);
    return /[;"\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  function versCsv(contrats) {
    const lignes = [COLONNES.map(([t]) => t).join(';')];
    for (const c of contrats) lignes.push(COLONNES.map(([, f]) => cellule(f(c))).join(';'));
    return '﻿' + lignes.join('\r\n') + '\r\n';
  }

  // Lecture d'une sauvegarde JSON. Accepte l'enveloppe { contrats: [...] } ou
  // un tableau nu. Les lignes illisibles sont comptees, pas ignorees en silence.
  function lireSauvegarde(texteJson) {
    let brut;
    try { brut = JSON.parse(texteJson); } catch { throw new Error('Fichier illisible : ce n\'est pas une sauvegarde JSON.'); }
    const liste = Array.isArray(brut) ? brut : brut?.contrats;
    if (!Array.isArray(liste)) throw new Error('Fichier sans liste de contrats.');
    const contrats = [];
    let rejetes = 0;
    for (const b of liste) {
      const c = normaliser(b);
      if (c) contrats.push(c); else rejetes += 1;
    }
    return { contrats, rejetes };
  }

  // Fusion : un contrat de meme id est remplace par la version la plus recente.
  function fusionner(existants, importes) {
    const parId = new Map(existants.map((c) => [c.id, c]));
    let ajoutes = 0, maj = 0;
    for (const c of importes) {
      const deja = parId.get(c.id);
      if (!deja) { parId.set(c.id, c); ajoutes += 1; }
      else if (c.modifie > deja.modifie) { parId.set(c.id, c); maj += 1; }
    }
    return { contrats: [...parId.values()], ajoutes, maj };
  }

  racine.SuiviModele = {
    TYPES, STATUTS, CLOS, normaliser, filtrer, trier, totaux, versCsv, lireSauvegarde, fusionner,
  };
})(typeof window !== 'undefined' ? window : globalThis);
