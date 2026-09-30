// Modele du suivi des contrats : types, statuts, normalisation, filtres,
// totaux, export CSV. Aucune dependance au DOM, pour etre teste sous Node.
(function (racine) {
  const TYPES = {
    maladie:  { libelle: 'Assurance maladie', court: 'Maladie',  montant: 'Prime complémentaire (CHF / mois)' },
    // Everlife se compte en contrats signes : aucun montant n'est saisi.
    everlife: { libelle: 'Everlife',          court: 'Everlife', montant: null },
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
  // Un contrat compte comme signe des sa signature, et le reste une fois
  // transmis puis accepte.
  const SIGNES = new Set(['signe', 'transmis', 'accepte']);

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
      montant:           brut.type === 'everlife' ? null : nombre(brut.montant),
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
      // Propre au LPP : l'argent est-il arrive sur le compte de libre passage ?
      fondsRecus:        brut.type === 'lpp' && oui(brut.fondsRecus),
      dateFondsRecus:    brut.type === 'lpp' && oui(brut.fondsRecus) ? date(brut.dateFondsRecus) : '',
      note:              texte(brut.note),
      cree:              texte(brut.cree) || maintenant,
      modifie:           texte(brut.modifie) || maintenant,
    };
    if (!c.nom && !c.prenom) return null;
    return c;
  }

  // Les compteurs repartent de zero chaque mois : un contrat appartient au
  // mois de sa signature, a defaut au mois de sa saisie.
  const NOMS_MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet',
                     'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const moisDe = (c) => (c.dateSignature || c.cree || '').slice(0, 7);
  function libelleMois(mois) {
    if (!/^\d{4}-\d{2}$/.test(mois || '')) return 'Sans date';
    const nom = NOMS_MOIS[Number(mois.slice(5)) - 1];
    return nom[0].toUpperCase() + nom.slice(1) + ' ' + mois.slice(0, 4);
  }
  function decalerMois(mois, n) {
    const d = new Date(Date.UTC(Number(mois.slice(0, 4)), Number(mois.slice(5)) - 1 + n, 1));
    return d.toISOString().slice(0, 7);
  }

  function filtrer(contrats, f = {}) {
    const q = texte(f.recherche).toLowerCase();
    return contrats.filter((c) => {
      if (f.mois && f.mois !== 'tous' && moisDe(c) !== f.mois) return false;
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
      // Un contrat refuse ou annule ne rapporte rien : sa commission sort de
      // tous les totaux, meme si elle avait ete notee ou cochee.
      commissions: 0,          // commissions des contrats en cours
      commissionsPercues: 0,   // dont deja commissionnees
      commissionsAttendues: 0, // dont pas encore arrivees
      parType: {},
    };
    for (const type of Object.keys(TYPES)) {
      // montantActif / avecMontant : contrats en cours (ni refuses ni annules)
      // portant un montant, base de la moyenne par contrat.
      t.parType[type] = { nombre: 0, signes: 0, points: 0, montant: 0, montantActif: 0,
                          avecMontant: 0, moyenne: null, paiementDirect: 0,
                          fondsAttente: 0, fondsRecus: 0 };
    }
    for (const c of contrats) {
      const p = t.parType[c.type];
      p.nombre += 1;
      p.points += c.points ?? 0;
      p.montant += c.montant ?? 0;
      if (SIGNES.has(c.statut)) p.signes += 1;
      if (c.paiementDirect) p.paiementDirect += 1;
      if (!CLOS.has(c.statut) && c.montant != null) { p.montantActif += c.montant; p.avecMontant += 1; }
      t.points += c.points ?? 0;
      t.montantParType[c.type] += c.montant ?? 0;
      if (CLOS.has(c.statut)) continue;
      const com = c.montantCommission ?? 0;
      t.commissions += com;
      if (c.commissionne) t.commissionsPercues += com;
      else t.commissionsAttendues += com;
      if (!c.police) t.aPolicer += 1;
      if (!c.commissionne) t.aCommissionner += 1;
      if (c.type === 'lpp' && c.montant != null) {
        if (c.fondsRecus) p.fondsRecus += c.montant; else p.fondsAttente += c.montant;
      }
    }
    for (const p of Object.values(t.parType)) {
      if (p.avecMontant) p.moyenne = p.montantActif / p.avecMontant;
    }
    return t;
  }

  // Un recapitulatif par mois, du plus recent au plus ancien.
  function recapMensuel(contrats) {
    const parMois = new Map();
    for (const c of contrats) {
      const m = moisDe(c);
      if (!parMois.has(m)) parMois.set(m, []);
      parMois.get(m).push(c);
    }
    return [...parMois.keys()].sort().reverse()
      .map((mois) => ({ mois, libelle: libelleMois(mois), totaux: totaux(parMois.get(mois)) }));
  }

  // CSV pour Excel suisse romand : separateur « ; », decimales au point,
  // BOM UTF-8 pour que les accents s'affichent a l'ouverture.
  const COLONNES = [
    ['Nom', (c) => c.nom],
    ['Prénom', (c) => c.prenom],
    ['Type', (c) => TYPES[c.type].libelle],
    ['Compagnie', (c) => c.compagnie],
    ['Montant CHF', (c) => (c.type === 'everlife' ? '' : c.montant ?? '')],
    ['Points', (c) => c.points ?? ''],
    ['Commission CHF', (c) => c.montantCommission ?? ''],
    ['Statut', (c) => STATUTS[c.statut]],
    ['Date de signature', (c) => c.dateSignature],
    ['Mois', (c) => libelleMois(moisDe(c))],
    ['Policé', (c) => (c.police ? 'oui' : 'non')],
    ['Date de police', (c) => c.datePolice],
    ['Commissionné', (c) => (c.commissionne ? 'oui' : 'non')],
    ['Date de commission', (c) => c.dateCommission],
    ['Fonds reçus sur le libre passage', (c) => (c.type === 'lpp' ? (c.fondsRecus ? 'oui' : 'non') : '')],
    ['Date de réception des fonds', (c) => c.dateFondsRecus],
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
    TYPES, STATUTS, CLOS, SIGNES, normaliser, moisDe, libelleMois, decalerMois, recapMensuel, filtrer, trier, totaux, versCsv, lireSauvegarde, fusionner,
  };
})(typeof window !== 'undefined' ? window : globalThis);
