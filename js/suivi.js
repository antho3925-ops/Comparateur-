// Interface du suivi des contrats. Les donnees vivent dans le localStorage de
// ce navigateur ; la page fonctionne ouverte en file:// et sans connexion.
(function () {
  const M = window.SuiviModele;
  const CLE = 'stf-suivi-contrats-v1';
  const CLE_SAUVEGARDE = 'stf-suivi-derniere-sauvegarde';
  const CAISSES = ['Assura', 'AXA', 'CONCORDIA', 'CSS', 'Groupe Mutuel', 'Helsana', 'Sanitas', 'SWICA', 'Visana'];

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const chf = (n) => (n == null ? '—' : Fmt.chf(n));
  const pts = (n) => (n == null ? '—' : Fmt.nombre(Math.round(n * 100) / 100));
  const dateCh = (iso) => (iso ? iso.split('-').reverse().join('.') : '');
  const aujourdhui = () => new Date().toISOString().slice(0, 10);

  // ------------------------------------------------------------ Stockage
  let stockageOk = true;
  function charger() {
    try {
      const brut = localStorage.getItem(CLE);
      if (!brut) return [];
      return M.lireSauvegarde(brut).contrats;
    } catch {
      stockageOk = false;
      return [];
    }
  }
  function enregistrer() {
    try {
      localStorage.setItem(CLE, JSON.stringify({ version: 1, contrats }));
      stockageOk = true;
    } catch {
      stockageOk = false;
    }
    alerteStockage();
  }
  function alerteStockage() {
    const el = $('alerte-stockage');
    el.hidden = stockageOk;
    if (!stockageOk) {
      el.innerHTML = '<strong>Enregistrement impossible.</strong> Ce navigateur bloque le stockage '
        + '(navigation privée ou réglage de sécurité). Les saisies seront perdues à la fermeture : '
        + 'exportez une sauvegarde avant de quitter.';
    }
  }

  let contrats = charger();
  const moisCourant = () => new Date().toISOString().slice(0, 7);
  const filtre = { mois: moisCourant(), type: 'tous', statut: 'tous', police: 'tous', commissionne: 'tous', recherche: '', tri: 'recent' };

  // ------------------------------------------------------------ Rendu
  const tuile = ([l, v, s, alerte]) =>
    `<div class="${alerte ? 'alerte' : ''}"><div class="l">${l}</div><div class="v">${v}</div><div class="s">${esc(s)}</div></div>`;

  // Maladie, Everlife et LPP ont chacun leur bloc : leurs montants ne
  // s'additionnent pas (prime mensuelle, nombre de contrats, capital transfere).
  function rendreChiffres() {
    const duMois = M.filtrer(contrats, { mois: filtre.mois });
    const t = M.totaux(duMois);
    const m = t.parType.maladie, e = t.parType.everlife, l = t.parType.lpp;
    const blocs = {
      maladie: [
        ['Contrats', Fmt.nombre(m.nombre), `${m.signes} signé(s)`],
        ['Complémentaires', 'CHF ' + chf(m.montantActif), 'Hors refusés et annulés'],
        ['Moyenne par contrat', m.moyenne == null ? '—' : 'CHF ' + chf(m.moyenne),
          m.avecMontant ? `Sur ${m.avecMontant} contrat(s) en cours` : 'Aucun montant noté'],
        ['Points', pts(m.points), 'Somme des points'],
      ],
      everlife: [
        ['Contrats signés', Fmt.nombre(e.signes), `Sur ${e.nombre} saisi(s)`],
        ['Clients payés', Fmt.nombre(e.payes), `dont ${e.paiementDirect} en paiement direct`],
        ['Points', pts(e.points), e.pointsEnAttente ? `${pts(e.pointsEnAttente)} pts en attente de paiement` : 'Clients payés uniquement'],
      ],
      lpp: [
        ['Montant transféré', 'CHF ' + chf(l.montantActif), 'Hors refusés et annulés'],
        ['Moyenne par transfert', l.moyenne == null ? '—' : 'CHF ' + chf(l.moyenne),
          l.avecMontant ? `Sur ${l.avecMontant} transfert(s) en cours` : 'Aucun montant noté'],
        ['En attente de réception', 'CHF ' + chf(l.fondsAttente), 'Pas encore sur le libre passage', l.fondsAttente > 0],
        ['Reçu sur le libre passage', 'CHF ' + chf(l.fondsRecus), 'Arrivé sur le compte'],
        ['Transferts', Fmt.nombre(l.nombre), `${l.signes} signé(s)`],
        ['Points', pts(l.points), l.pointsEnAttente ? `${pts(l.pointsEnAttente)} pts en attente de l'argent` : 'Argent reçu uniquement'],
      ],
    };
    $('blocs-types').innerHTML = Object.entries(blocs)
      .filter(([type]) => filtre.type === 'tous' || filtre.type === type)
      .map(([type, tuiles]) => `<div class="bloc-type ${type}">
        <h3>${M.TYPES[type].libelle}</h3>
        <div class="chiffre-cle suivi-chiffres">${tuiles.map(tuile).join('')}</div></div>`)
      .join('');
    $('blocs-types').classList.toggle('seul', filtre.type !== 'tous');

    // Le mois pour ce qui se produit ; tous les mois pour ce qui reste a suivre.
    const tousMois = filtre.mois === 'tous';
    const g = M.totaux(M.filtrer(contrats, { mois: filtre.mois, type: filtre.type }));
    const general = M.totaux(M.filtrer(contrats, { type: filtre.type }));
    $('chiffres').innerHTML = [
      [tousMois ? 'Points' : 'Points du mois', pts(g.points),
        g.pointsEnAttente ? `+ ${pts(g.pointsEnAttente)} pts en attente`
          : filtre.type === 'tous' ? 'Tous types confondus' : M.TYPES[filtre.type].libelle],
      [tousMois ? 'Commissions générées' : 'Commission du mois', 'CHF ' + chf(g.commissions),
        `CHF ${chf(g.commissionsPercues)} perçus · CHF ${chf(g.commissionsAttendues)} à recevoir`
        + (g.commissionsEnAttenteFonds ? ` · + CHF ${chf(g.commissionsEnAttenteFonds)} LPP en attente de l'argent` : '')],
      ['Commission générale', 'CHF ' + chf(general.commissions),
        `CHF ${chf(general.commissionsAttendues)} pas encore arrivés`
        + (general.commissionsEnAttenteFonds ? ` · + CHF ${chf(general.commissionsEnAttenteFonds)} LPP en attente de l'argent` : ''),
        general.commissionsAttendues > 0],
      ['À policer', Fmt.nombre(general.aPolicer), 'Tous mois confondus', general.aPolicer > 0],
      ['À commissionner', Fmt.nombre(general.aCommissionner), 'Tous mois confondus', general.aCommissionner > 0],
    ].map(tuile).join('');
  }

  function ligne(c) {
    const typ = M.TYPES[c.type];
    const nom = [c.nom, c.prenom].filter(Boolean).join(' ');
    const base = c.type !== 'maladie' || M.CLOS.has(c.statut) ? ''
      : `<button type="button" class="paye ${c.baseSignee ? 'oui' : ''}" data-base aria-pressed="${c.baseSignee}">${
          c.baseSignee ? 'Base + complémentaire' : 'Complémentaire seule'}</button>`;
    const paye = c.type !== 'everlife' || M.CLOS.has(c.statut) ? ''
      : c.paiementDirect ? '<span class="paye oui">Paiement direct</span>'
      : `<button type="button" class="paye ${c.clientPaye ? 'oui' : ''}" data-paye aria-pressed="${c.clientPaye}">${
          c.clientPaye ? 'Client a payé' : 'Pas encore payé'}</button>`;
    const sous = [c.compagnie, c.dateSignature && 'signé le ' + dateCh(c.dateSignature)].filter(Boolean).join(' · ');
    const interrupteur = (champ, actif, dateIso, libelle) =>
      `<button type="button" class="oui-non" data-bascule="${champ}" aria-pressed="${actif}"
         aria-label="${libelle} : ${actif ? 'oui' : 'non'}">${actif ? 'Oui' : 'Non'}${
         actif && dateIso ? `<span class="d">${dateCh(dateIso)}</span>` : ''}</button>`;
    return `<tr data-id="${esc(c.id)}" class="${M.CLOS.has(c.statut) ? 'clos' : ''}">
      <td class="client"><div class="n">${esc(nom)}</div>${sous ? `<div class="c">${esc(sous)}</div>` : ''}${
        c.note ? `<div class="c">${esc(c.note)}</div>` : ''}</td>
      <td data-l="Type"><span class="type ${c.type}">${typ.court}</span>${base}${paye}</td>
      <td class="num" data-l="Montant CHF">${c.type === 'everlife' ? '' : chf(c.montant)}</td>
      <td class="num ${!M.CLOS.has(c.statut) && !M.pointsAcquis(c) && c.points ? 'en-attente' : ''}" data-l="Points"
          title="${!M.CLOS.has(c.statut) && !M.pointsAcquis(c) ? (c.type === 'lpp' ? 'Compte à réception de l\'argent' : 'Compte une fois le client payé') : ''}">${pts(c.points)}</td>
      <td class="num ${!M.CLOS.has(c.statut) && !M.commissionAcquise(c) && c.montantCommission ? 'en-attente' : ''}" data-l="Commission CHF"
          title="${!M.CLOS.has(c.statut) && !M.commissionAcquise(c) ? 'Acquise à réception de l\'argent' : ''}">${chf(c.montantCommission)}</td>
      <td data-l="Statut"><span class="statut ${c.statut}">${M.STATUTS[c.statut]}</span>${
        c.dateFondsRecus ? `<div class="c">le ${dateCh(c.dateFondsRecus)}</div>` : ''}</td>
      <td class="centre" data-l="Policé">${interrupteur('police', c.police, c.datePolice, 'Policé')}</td>
      <td class="centre" data-l="Commissionné">${interrupteur('commissionne', c.commissionne, c.dateCommission, 'Commissionné')}</td>
      <td class="actions"><button type="button" class="btn-modifier" data-modifier>Modifier</button></td>
    </tr>`;
  }

  function rendreListe() {
    const visibles = M.trier(M.filtrer(contrats, filtre), filtre.tri);
    // Vue « Tous » : une section par type, chacune avec son propre total.
    if (filtre.type === 'tous') {
      $('lignes').innerHTML = Object.keys(M.TYPES).map((type) => {
        const rangs = visibles.filter((c) => c.type === type);
        if (!rangs.length) return '';
        const p = M.totaux(rangs).parType[type];
        const resume = [`${rangs.length} contrat(s)`,
          type === 'everlife' ? `${p.signes} signé(s)` : 'CHF ' + chf(p.montantActif),
          type !== 'everlife' && p.moyenne != null ? 'moyenne CHF ' + chf(p.moyenne) : '',
          type === 'lpp' && p.fondsAttente ? 'CHF ' + chf(p.fondsAttente) + ' en attente' : '',
          `${pts(p.points)} pts`].filter(Boolean).join(' · ');
        return `<tr class="section ${type}"><th colspan="9">${M.TYPES[type].libelle}<span>${resume}</span></th></tr>`
          + rangs.map(ligne).join('');
      }).join('');
    } else {
      $('lignes').innerHTML = visibles.map(ligne).join('');
    }
    const vide = $('vide');
    if (!visibles.length) {
      vide.hidden = false;
      const moisVide = filtre.mois !== 'tous' && !M.filtrer(contrats, { mois: filtre.mois }).length;
      vide.textContent = !contrats.length
        ? 'Aucun contrat pour l\'instant. Ajoutez-en un avec « Nouveau contrat ».'
        : moisVide ? `Aucun contrat signé en ${M.libelleMois(filtre.mois).toLowerCase()}.`
        : 'Aucun contrat ne correspond aux filtres.';
      $('pied-table').innerHTML = '';
      return;
    }
    vide.hidden = true;
    const t = M.totaux(visibles);
    const montant = Object.values(t.parType).reduce((a, p) => a + p.montantActif, 0);
    // Additionner une prime mensuelle et un capital LPP n'a pas de sens : le
    // total des montants n'apparait que sur un seul type.
    const typesVus = new Set(visibles.map((c) => c.type));
    $('pied-table').innerHTML = `<tr>
      <td>${visibles.length} contrat(s)</td><td></td>
      <td class="num">${typesVus.size === 1 && !typesVus.has('everlife') ? 'CHF ' + chf(montant) : ''}</td>
      <td class="num">${pts(t.points)} pts</td>
      <td class="num">CHF ${chf(t.commissions)}</td>
      <td></td>
      <td class="centre">${visibles.filter((c) => c.police).length} policé(s)</td>
      <td class="centre">${visibles.filter((c) => c.commissionne).length} commissionné(s)</td>
      <td></td></tr>`;
  }

  function rendreMois() {
    const presents = new Set(contrats.map(M.moisDe).filter(Boolean));
    presents.add(moisCourant());
    if (filtre.mois !== 'tous') presents.add(filtre.mois);
    $('f-mois').innerHTML = [...presents].sort().reverse()
      .map((m) => `<option value="${m}">${M.libelleMois(m)}</option>`).join('')
      + '<option value="tous">Tous les mois</option>';
    $('f-mois').value = filtre.mois;
    $('mois-prec').disabled = $('mois-suiv').disabled = filtre.mois === 'tous';
  }

  function rendreRecap() {
    const recap = M.recapMensuel(M.filtrer(contrats, { type: filtre.type }));
    $('recap-vide').hidden = recap.length > 0;
    const rangee = (libelle, t, attrs = '') => {
      const m = t.parType.maladie, e = t.parType.everlife, l = t.parType.lpp;
      return `<tr ${attrs}>
        <td class="client"><div class="n">${libelle}</div></td>
        <td class="num" data-l="Maladie">${m.nombre} · CHF ${chf(m.montantActif)}</td>
        <td class="num" data-l="Moyenne compl.">${m.moyenne == null ? '—' : 'CHF ' + chf(m.moyenne)}</td>
        <td class="num" data-l="Everlife signés">${e.signes}</td>
        <td class="num" data-l="LPP transféré">${l.nombre ? 'CHF ' + chf(l.montantActif) : '—'}</td>
        <td class="num" data-l="Points">${pts(t.points)}</td>
        <td class="num" data-l="Commission générée">CHF ${chf(t.commissions)}</td>
        <td class="num" data-l="Perçue">CHF ${chf(t.commissionsPercues)}</td>
        <td class="num ${t.commissionsAttendues > 0 ? 'attendu' : ''}" data-l="À recevoir">CHF ${chf(t.commissionsAttendues)}</td>
      </tr>`;
    };
    $('recap').innerHTML = recap.map((r) =>
      rangee(r.libelle, r.totaux, `data-mois="${r.mois}" class="${r.mois === filtre.mois ? 'choisi' : ''}"`)).join('');
    $('pied-recap').innerHTML = recap.length > 1
      ? rangee('Total', M.totaux(M.filtrer(contrats, { type: filtre.type }))).replace('<tr >', '<tr>') : '';
  }

  function rendre() {
    rendreMois();
    rendreChiffres();
    rendreRecap();
    rendreListe();
    const d = lireDerniereSauvegarde();
    $('derniere-sauvegarde').textContent = d ? `Dernière sauvegarde exportée : ${d}.` : 'Aucune sauvegarde exportée pour l\'instant.';
  }

  // ------------------------------------------------------------ Fenetre
  const dlg = $('dlg-contrat');
  const form = $('form-contrat');

  function majLibelles() {
    const type = form.elements.type.value;
    $('bloc-montant').hidden = !M.TYPES[type].montant;
    if (M.TYPES[type].montant) $('lbl-montant').textContent = M.TYPES[type].montant;
    // Simple rappel des montants usuels, rien n'est calcule a partir de lui.
    $('aide-commission').textContent = type === 'everlife'
      ? 'Everlife : CHF 150.– à la signature, CHF 400.– une fois l\'apport payé.'
      : type === 'lpp' ? 'Comptée une fois l\'argent reçu sur le libre passage.' : '';
    $('bloc-paiement-direct').hidden = type !== 'everlife';
    $('bloc-base').hidden = type !== 'maladie';
    // Maladie et LPP : points calcules, le champ n'est plus saisissable.
    form.elements.points.readOnly = type !== 'everlife';
    $('aide-points').textContent = type === 'maladie'
      ? 'Calculés : moins de CHF 25.– = 0, de 25 à 50 = 50, plus de 50 = 100 — avec la base LAMal.'
      : type === 'lpp' ? 'Calculés : 150 points par CHF 100\'000 transférés, comptés à réception de l\'argent.'
      : 'À noter ; comptés une fois le client payé ou en paiement direct.';
    majAuto();
    // Liste des statuts propre au type ; le statut choisi est garde s'il existe.
    const sel = form.elements.statut, avant = sel.value;
    sel.innerHTML = M.STATUTS_PAR_TYPE[type].map((v) => `<option value="${v}">${M.STATUTS[v]}</option>`).join('');
    sel.value = M.statutPour(type, avant || 'proposition');
    majFonds();
    $('lbl-compagnie').textContent = type === 'lpp' ? 'Institution de prévoyance / libre passage' : 'Compagnie';
    const deja = contrats.filter((c) => c.type === type).map((c) => c.compagnie).filter(Boolean);
    const proposees = [...new Set([...(type === 'maladie' ? CAISSES : []), ...deja])].sort();
    $('compagnies').innerHTML = proposees.map((p) => `<option value="${esc(p)}">`).join('');
  }

  // Recalcule dans la fiche ce qui decoule des regles : points maladie et LPP,
  // commission Everlife (sauf montant saisi a la main).
  function majAuto() {
    const f = form.elements, type = f.type.value;
    const nb = (v) => (v === '' ? null : Number(v));
    if (type !== 'everlife') {
      const p = M.pointsCalcules(type, nb(f.montant.value), f.baseSignee.checked, null);
      f.points.value = p ?? '';
    } else {
      const com = M.commissionEverlifeAjustee(nb(f.montantCommission.value),
        { statut: f.statut.value, clientPaye: f.clientPaye.checked, paiementDirect: f.paiementDirect.checked });
      f.montantCommission.value = com ?? '';
    }
  }

  function majFonds() {
    $('bloc-fonds').hidden = !(form.elements.type.value === 'lpp' && form.elements.statut.value === 'argent_recu');
  }

  function ouvrir(c) {
    form.reset();
    $('erreur-form').hidden = true;
    const f = form.elements;
    const src = c || { type: filtre.type !== 'tous' ? filtre.type : 'maladie', statut: 'proposition', dateSignature: aujourdhui() };
    f.id.value = c?.id || '';
    f.type.value = src.type;
    for (const k of ['nom', 'prenom', 'compagnie', 'dateSignature', 'datePolice', 'dateCommission', 'note']) {
      f[k].value = src[k] || '';
    }
    for (const k of ['montant', 'points', 'montantCommission']) f[k].value = src[k] ?? '';
    f.police.checked = !!src.police;
    f.commissionne.checked = !!src.commissionne;
    f.paiementDirect.checked = !!src.paiementDirect;
    f.clientPaye.checked = !!src.clientPaye;
    f.baseSignee.checked = !!src.baseSignee;
    f.dateFondsRecus.value = src.dateFondsRecus || '';
    $('dlg-titre').textContent = c ? 'Modifier le contrat' : 'Nouveau contrat';
    $('btn-supprimer').hidden = !c;
    majLibelles();
    f.statut.value = src.statut;
    majFonds();
    dlg.showModal();
    f.nom.focus();
  }

  function soumettre(e) {
    e.preventDefault();
    const f = form.elements;
    const id = f.id.value;
    const avant = contrats.find((c) => c.id === id);
    const brut = {
      id: id || undefined,
      type: f.type.value,
      nom: f.nom.value, prenom: f.prenom.value, compagnie: f.compagnie.value,
      montant: f.montant.value, points: f.points.value, statut: f.statut.value,
      dateSignature: f.dateSignature.value,
      police: f.police.checked,
      datePolice: f.police.checked ? f.datePolice.value : '',
      commissionne: f.commissionne.checked,
      dateCommission: f.commissionne.checked ? f.dateCommission.value : '',
      montantCommission: f.montantCommission.value,
      paiementDirect: f.paiementDirect.checked,
      clientPaye: f.clientPaye.checked,
      baseSignee: f.baseSignee.checked,
      dateFondsRecus: f.dateFondsRecus.value,
      note: f.note.value,
      cree: avant?.cree,
      modifie: new Date().toISOString(),
    };
    const c = M.normaliser(brut);
    if (!c) {
      $('erreur-form').textContent = 'Indiquez au moins le nom ou le prénom du client.';
      $('erreur-form').hidden = false;
      f.nom.focus();
      return;
    }
    contrats = avant ? contrats.map((x) => (x.id === id ? c : x)) : [...contrats, c];
    // Un contrat signe un autre mois ne doit pas disparaitre de l'ecran.
    if (filtre.mois !== 'tous' && M.moisDe(c) !== filtre.mois) filtre.mois = M.moisDe(c);
    enregistrer();
    dlg.close();
    rendre();
  }

  // ------------------------------------------------------------ Sauvegarde
  function lireDerniereSauvegarde() {
    try { return localStorage.getItem(CLE_SAUVEGARDE) || ''; } catch { return ''; }
  }
  function telecharger(nom, contenu, type) {
    const url = URL.createObjectURL(new Blob([contenu], { type }));
    const a = Object.assign(document.createElement('a'), { href: url, download: nom });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function exporterJson() {
    const d = aujourdhui();
    telecharger(`suivi-contrats-${d}.json`,
      JSON.stringify({ version: 1, exporte: new Date().toISOString(), contrats }, null, 2), 'application/json');
    try { localStorage.setItem(CLE_SAUVEGARDE, dateCh(d)); } catch { /* sans stockage, rien a retenir */ }
    rendre();
  }
  function exporterCsv() {
    const visibles = M.trier(M.filtrer(contrats, filtre), filtre.tri);
    telecharger(`suivi-contrats-${aujourdhui()}.csv`, M.versCsv(visibles), 'text/csv;charset=utf-8');
  }
  async function importer(fichier) {
    try {
      const { contrats: importes, rejetes } = M.lireSauvegarde(await fichier.text());
      let message;
      if (contrats.length && confirm(
        `${importes.length} contrat(s) dans le fichier.\n\nOK : fusionner avec les ${contrats.length} contrat(s) déjà présents.\n`
        + 'Annuler : remplacer entièrement la liste actuelle par le fichier.')) {
        const r = M.fusionner(contrats, importes);
        contrats = r.contrats;
        message = `${r.ajoutes} ajouté(s), ${r.maj} mis à jour.`;
      } else {
        if (contrats.length && !confirm(`Remplacer les ${contrats.length} contrat(s) actuels ? Cette action est définitive.`)) return;
        contrats = importes;
        message = `${importes.length} contrat(s) chargé(s).`;
      }
      if (rejetes) message += ` ${rejetes} ligne(s) ignorée(s) faute de nom.`;
      enregistrer();
      rendre();
      alert('Import terminé : ' + message);
    } catch (e) {
      alert(e.message);
    }
  }

  // ------------------------------------------------------------ Evenements
  document.addEventListener('DOMContentLoaded', () => {
    const optionsStatut = Object.entries(M.STATUTS).map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
    $('f-statut').insertAdjacentHTML('beforeend', optionsStatut);

    $('onglets').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-type]');
      if (!b) return;
      filtre.type = b.dataset.type;
      for (const x of $('onglets').children) x.setAttribute('aria-selected', String(x === b));
      rendre();
    });
    const lier = (id, cle) => $(id).addEventListener('input', (e) => { filtre[cle] = e.target.value; rendre(); });
    lier('f-recherche', 'recherche');
    lier('f-mois', 'mois');
    const allerAu = (mois) => { filtre.mois = mois; rendre(); };
    $('mois-prec').addEventListener('click', () => allerAu(M.decalerMois(filtre.mois, -1)));
    $('mois-suiv').addEventListener('click', () => allerAu(M.decalerMois(filtre.mois, 1)));
    $('mois-courant').addEventListener('click', () => allerAu(moisCourant()));
    $('recap').addEventListener('click', (e) => {
      const tr = e.target.closest('tr[data-mois]');
      if (tr) { allerAu(tr.dataset.mois); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    });
    lier('f-statut', 'statut');
    lier('f-police', 'police');
    lier('f-commission', 'commissionne');
    lier('f-tri', 'tri');

    $('lignes').addEventListener('click', (e) => {
      const tr = e.target.closest('tr[data-id]');
      if (!tr) return;
      const c = contrats.find((x) => x.id === tr.dataset.id);
      const bascule = e.target.closest('[data-bascule]');
      if (bascule) {
        const champ = bascule.dataset.bascule;
        const champDate = champ === 'police' ? 'datePolice' : 'dateCommission';
        const actif = !c[champ];
        const maj = { ...c, [champ]: actif, [champDate]: actif ? (c[champDate] || aujourdhui()) : '',
                      modifie: new Date().toISOString() };
        contrats = contrats.map((x) => (x.id === c.id ? maj : x));
        enregistrer();
        rendre();
        return;
      }
      if (e.target.closest('[data-paye]')) {
        const maj = { ...c, clientPaye: !c.clientPaye, modifie: new Date().toISOString() };
        maj.montantCommission = M.commissionEverlifeAjustee(c.montantCommission, maj);
        contrats = contrats.map((x) => (x.id === c.id ? maj : x));
        enregistrer();
        rendre();
        return;
      }
      if (e.target.closest('[data-base]')) {
        const maj = M.normaliser({ ...c, baseSignee: !c.baseSignee, modifie: new Date().toISOString() });
        contrats = contrats.map((x) => (x.id === c.id ? maj : x));
        enregistrer();
        rendre();
        return;
      }
      if (e.target.closest('[data-modifier]')) ouvrir(c);
    });
    $('lignes').addEventListener('dblclick', (e) => {
      const tr = e.target.closest('tr[data-id]');
      if (tr && !e.target.closest('button')) ouvrir(contrats.find((x) => x.id === tr.dataset.id));
    });

    $('btn-nouveau').addEventListener('click', () => ouvrir(null));
    form.addEventListener('submit', soumettre);
    form.addEventListener('input', (e) => { if (e.target.name === 'montant') majAuto(); });
    form.addEventListener('change', (e) => {
      if (e.target.name === 'type') majLibelles();
      if (['statut', 'clientPaye', 'paiementDirect', 'baseSignee'].includes(e.target.name)) majAuto();
      // Cocher « policé » ou « commissionné » propose la date du jour.
      if (e.target.name === 'police' && e.target.checked && !form.elements.datePolice.value) {
        form.elements.datePolice.value = aujourdhui();
      }
      if (e.target.name === 'statut') majFonds();
      if (e.target.name === 'statut' && e.target.value === 'argent_recu' && !form.elements.dateFondsRecus.value) {
        form.elements.dateFondsRecus.value = aujourdhui();
      }
      if (e.target.name === 'commissionne' && e.target.checked && !form.elements.dateCommission.value) {
        form.elements.dateCommission.value = aujourdhui();
      }
    });
    $('btn-annuler').addEventListener('click', () => dlg.close());
    $('btn-fermer').addEventListener('click', () => dlg.close());
    $('btn-supprimer').addEventListener('click', () => {
      const id = form.elements.id.value;
      const c = contrats.find((x) => x.id === id);
      if (!c || !confirm(`Supprimer le contrat de ${[c.prenom, c.nom].filter(Boolean).join(' ')} ?`)) return;
      contrats = contrats.filter((x) => x.id !== id);
      enregistrer();
      dlg.close();
      rendre();
    });

    $('btn-export-json').addEventListener('click', exporterJson);
    $('btn-export-csv').addEventListener('click', exporterCsv);
    $('btn-import').addEventListener('click', () => $('fichier-import').click());
    $('fichier-import').addEventListener('change', (e) => {
      const f = e.target.files[0];
      e.target.value = '';
      if (f) importer(f);
    });

    // Demande au navigateur de ne pas purger ces donnees sous pression d'espace.
    navigator.storage?.persist?.().catch(() => {});
    alerteStockage();
    rendre();
  });
})();
