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
  const filtre = { type: 'tous', statut: 'tous', police: 'tous', commissionne: 'tous', recherche: '', tri: 'recent' };

  // ------------------------------------------------------------ Rendu
  const tuile = ([l, v, s, alerte]) =>
    `<div class="${alerte ? 'alerte' : ''}"><div class="l">${l}</div><div class="v">${v}</div><div class="s">${esc(s)}</div></div>`;

  // Maladie, Everlife et LPP ont chacun leur bloc : leurs montants ne
  // s'additionnent pas (prime mensuelle, nombre de contrats, capital transfere).
  function rendreChiffres() {
    const t = M.totaux(contrats);
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
        ['Paiement direct', Fmt.nombre(e.paiementDirect), 'Contrats cochés'],
        ['Points', pts(e.points), 'Somme des points'],
      ],
      lpp: [
        ['Montant transféré', 'CHF ' + chf(l.montantActif), 'Hors refusés et annulés'],
        ['Transferts', Fmt.nombre(l.nombre), `${l.signes} signé(s)`],
        ['Points', pts(l.points), 'Somme des points'],
      ],
    };
    $('blocs-types').innerHTML = Object.entries(blocs)
      .filter(([type]) => filtre.type === 'tous' || filtre.type === type)
      .map(([type, tuiles]) => `<div class="bloc-type ${type}">
        <h3>${M.TYPES[type].libelle}</h3>
        <div class="chiffre-cle suivi-chiffres">${tuiles.map(tuile).join('')}</div></div>`)
      .join('');
    $('blocs-types').classList.toggle('seul', filtre.type !== 'tous');

    const actifs = contrats.filter((c) => filtre.type === 'tous' || c.type === filtre.type);
    const g = M.totaux(actifs);
    $('chiffres').innerHTML = [
      ['Points au total', pts(g.points), filtre.type === 'tous' ? 'Tous types confondus' : M.TYPES[filtre.type].libelle],
      ['À policer', Fmt.nombre(g.aPolicer), 'Hors refusés et annulés', g.aPolicer > 0],
      ['À commissionner', Fmt.nombre(g.aCommissionner), 'Hors refusés et annulés', g.aCommissionner > 0],
      ['Commissions', 'CHF ' + chf(g.commissions),
        `CHF ${chf(g.commissionsPercues)} perçus · CHF ${chf(g.commissionsAttendues)} à recevoir`],
    ].map(tuile).join('');
  }

  function ligne(c) {
    const typ = M.TYPES[c.type];
    const nom = [c.nom, c.prenom].filter(Boolean).join(' ');
    const sous = [c.compagnie, c.paiementDirect && 'paiement direct', c.dateSignature && 'signé le ' + dateCh(c.dateSignature)].filter(Boolean).join(' · ');
    const interrupteur = (champ, actif, dateIso, libelle) =>
      `<button type="button" class="oui-non" data-bascule="${champ}" aria-pressed="${actif}"
         aria-label="${libelle} : ${actif ? 'oui' : 'non'}">${actif ? 'Oui' : 'Non'}${
         actif && dateIso ? `<span class="d">${dateCh(dateIso)}</span>` : ''}</button>`;
    return `<tr data-id="${esc(c.id)}" class="${M.CLOS.has(c.statut) ? 'clos' : ''}">
      <td class="client"><div class="n">${esc(nom)}</div>${sous ? `<div class="c">${esc(sous)}</div>` : ''}${
        c.note ? `<div class="c">${esc(c.note)}</div>` : ''}</td>
      <td data-l="Type"><span class="type ${c.type}">${typ.court}</span></td>
      <td class="num" data-l="Montant CHF">${c.type === 'everlife' ? '' : chf(c.montant)}</td>
      <td class="num" data-l="Points">${pts(c.points)}</td>
      <td class="num" data-l="Commission CHF">${chf(c.montantCommission)}</td>
      <td data-l="Statut"><span class="statut ${c.statut}">${M.STATUTS[c.statut]}</span></td>
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
          type === 'maladie' && p.moyenne != null ? 'moyenne CHF ' + chf(p.moyenne) : '',
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
      vide.textContent = contrats.length
        ? 'Aucun contrat ne correspond aux filtres.'
        : 'Aucun contrat pour l\'instant. Ajoutez-en un avec « Nouveau contrat ».';
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

  function rendre() {
    rendreChiffres();
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
    $('bloc-paiement-direct').hidden = type !== 'everlife';
    $('lbl-compagnie').textContent = type === 'lpp' ? 'Institution de prévoyance / libre passage' : 'Compagnie';
    const deja = contrats.filter((c) => c.type === type).map((c) => c.compagnie).filter(Boolean);
    const proposees = [...new Set([...(type === 'maladie' ? CAISSES : []), ...deja])].sort();
    $('compagnies').innerHTML = proposees.map((p) => `<option value="${esc(p)}">`).join('');
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
    f.statut.value = src.statut;
    f.police.checked = !!src.police;
    f.commissionne.checked = !!src.commissionne;
    f.paiementDirect.checked = !!src.paiementDirect;
    $('dlg-titre').textContent = c ? 'Modifier le contrat' : 'Nouveau contrat';
    $('btn-supprimer').hidden = !c;
    majLibelles();
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
    $('c-statut').innerHTML = optionsStatut;

    $('onglets').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-type]');
      if (!b) return;
      filtre.type = b.dataset.type;
      for (const x of $('onglets').children) x.setAttribute('aria-selected', String(x === b));
      rendre();
    });
    const lier = (id, cle) => $(id).addEventListener('input', (e) => { filtre[cle] = e.target.value; rendre(); });
    lier('f-recherche', 'recherche');
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
      if (e.target.closest('[data-modifier]')) ouvrir(c);
    });
    $('lignes').addEventListener('dblclick', (e) => {
      const tr = e.target.closest('tr[data-id]');
      if (tr && !e.target.closest('button')) ouvrir(contrats.find((x) => x.id === tr.dataset.id));
    });

    $('btn-nouveau').addEventListener('click', () => ouvrir(null));
    form.addEventListener('submit', soumettre);
    form.addEventListener('change', (e) => {
      if (e.target.name === 'type') majLibelles();
      // Cocher « policé » ou « commissionné » propose la date du jour.
      if (e.target.name === 'police' && e.target.checked && !form.elements.datePolice.value) {
        form.elements.datePolice.value = aujourdhui();
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
