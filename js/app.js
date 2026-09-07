(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const el = (t, c, txt) => { const e = document.createElement(t); if (c) e.className = c;
                              if (txt != null) e.textContent = txt; return e; };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g,
    (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));

  let etat, prochainId = 1;

  function etatVierge() {
    return {
      client: { categorie: 'adulte', franchise: 300, modele: 'standard', date: '' },
      cumuls: { franchisePayee: 0, quotePartAtteinte: 0 },
      actuel: { mode: 'base', assureurId: '', produitIds: [],
                libre: { nom: '', franchise: 0, couvertures: [] } },
      facture: [],
      filtresProduits: {},
      detailOuvert: null,
    };
  }

  // ---------------------------------------------------------------- Selects
  function prestationsFacturables() {
    return DB.catalogue.prestations.filter((p) => p.actif !== false && p.nature === 'remboursement');
  }

  function optionsPrestations(select, valeur) {
    select.innerHTML = '<option value="">— Choisir une prestation —</option>';
    for (const g of DB.catalogue.groupes) {
      const liste = prestationsFacturables().filter((p) => p.groupe === g.id);
      if (!liste.length) continue;
      const og = el('optgroup'); og.label = g.libelle;
      for (const p of liste) {
        const o = el('option', null, p.libelle + (p.categorie === 'MIXTE' ? '  (base + compl.)'
                     : p.categorie === 'LAMal' ? '  (base)' : ''));
        o.value = p.id;
        if (p.id === valeur) o.selected = true;
        og.appendChild(o);
      }
      select.appendChild(og);
    }
  }

  function remplirEntetes() {
    const fr = $('#franchise');
    const cat = etat.client.categorie;
    const cle = cat === 'enfant' ? 'franchises_enfant'
              : cat === 'jeune_adulte' ? 'franchises_jeune_adulte' : 'franchises_adulte';
    fr.innerHTML = '';
    for (const v of DB.meta.lamal[cle]) {
      const o = el('option', null, 'CHF ' + Fmt.nombre(v)); o.value = v;
      if (v === etat.client.franchise) o.selected = true;
      fr.appendChild(o);
    }
    if (!DB.meta.lamal[cle].includes(etat.client.franchise)) {
      etat.client.franchise = DB.meta.lamal[cle][0];
      fr.value = etat.client.franchise;
    }

    const mo = $('#modele'); mo.innerHTML = '';
    for (const m of DB.meta.modeles_assurance) {
      const o = el('option', null, m.libelle); o.value = m.id;
      if (m.id === etat.client.modele) o.selected = true;
      mo.appendChild(o);
    }

    const as = $('#assureur-actuel');
    as.innerHTML = '<option value="">— Sélectionner —</option>';
    for (const a of DB.assureurs.filter((x) => x.actif !== false)
                                .sort((x, y) => x.nom.localeCompare(y.nom))) {
      const o = el('option', null, a.nom); o.value = a.id;
      if (a.id === etat.actuel.assureurId) o.selected = true;
      as.appendChild(o);
    }
  }

  // ------------------------------------------------- Produits de la caisse
  function rendreProduits() {
    const zone = $('#liste-produits');
    const compte = $('#compte-produits');
    zone.innerHTML = '';
    const a = DB.assureurs.find((x) => x.id === etat.actuel.assureurId);
    if (!a) { compte.textContent = "Choisissez d'abord une caisse."; return; }

    const n = etat.actuel.produitIds.length;
    compte.textContent = n ? `${n} produit(s) coché(s)` : 'Aucun produit coché — base LAMal seule.';

    const box = el('div', 'produits');
    const parType = {};
    for (const p of a.produits_lca || []) (parType[p.type] = parType[p.type] || []).push(p);

    for (const type of Object.keys(parType).sort()) {
      box.appendChild(el('div', 'grp', type.replace(/_/g, ' ')));
      for (const p of parType[type]) {
        const lab = el('label', 'produit');
        const cb = el('input'); cb.type = 'checkbox'; cb.value = p.id;
        cb.checked = etat.actuel.produitIds.includes(p.id);
        cb.addEventListener('change', () => {
          etat.actuel.produitIds = cb.checked
            ? etat.actuel.produitIds.concat([p.id])
            : etat.actuel.produitIds.filter((x) => x !== p.id);
          rendreProduits(); rendreResultat();
        });
        const d = el('div');
        d.appendChild(el('div', 'nom', p.nom));
        const bits = [];
        if (p.hors_perimetre_facture) bits.push('hors comparatif de facture');
        const nb = (p.couvertures || []).length;
        const chiffrees = (p.couvertures || []).filter((c) => c.statut !== 'a_completer').length;
        bits.push(`${chiffrees}/${nb} prestation(s) chiffrée(s)`);
        if (p.delai_attente_mois) bits.push(`carence ${p.delai_attente_mois} mois`);
        d.appendChild(el('div', 'meta', bits.join(' · ')));
        lab.appendChild(cb); lab.appendChild(d);
        box.appendChild(lab);
      }
    }
    zone.appendChild(box);
  }

  // ------------------------------------------------------ Saisie libre
  function rendreLibre() {
    const zone = $('#libre-couvertures'); zone.innerHTML = '';
    etat.actuel.libre.couvertures.forEach((c, i) => {
      const l = el('div', 'ligne-facture');
      const h = el('div', 'haut');
      const d1 = el('div'); d1.appendChild(el('label', null, 'Prestation'));
      const sel = el('select'); optionsPrestations(sel, c.prestation_id);
      sel.addEventListener('change', () => { c.prestation_id = sel.value; rendreResultat(); });
      d1.appendChild(sel);
      const d2 = el('div'); d2.appendChild(el('label', null, 'Taux (%)'));
      const t = el('input'); t.type = 'number'; t.min = 0; t.max = 100; t.step = 5;
      t.value = c.taux_remboursement == null ? '' : Math.round(c.taux_remboursement * 100);
      t.addEventListener('input', () => {
        c.taux_remboursement = t.value === '' ? null : Math.min(1, Math.max(0, Number(t.value) / 100));
        rendreResultat();
      });
      d2.appendChild(t);
      const d3 = el('div'); d3.appendChild(el('label', null, 'Plafond annuel'));
      const pl = el('input'); pl.type = 'number'; pl.min = 0; pl.step = 50;
      pl.value = c.plafond_annuel == null ? '' : c.plafond_annuel;
      pl.addEventListener('input', () => {
        c.plafond_annuel = pl.value === '' ? null : Number(pl.value); rendreResultat();
      });
      d3.appendChild(pl);
      const d4 = el('div');
      const sup = el('button', 'btn danger mini', 'Retirer'); sup.type = 'button';
      sup.addEventListener('click', () => {
        etat.actuel.libre.couvertures.splice(i, 1); rendreLibre(); rendreResultat();
      });
      d4.appendChild(sup);
      h.append(d1, d2, d3, d4); l.appendChild(h); zone.appendChild(l);
    });
  }

  // ------------------------------------------------------------- Facture
  function rendreFacture() {
    const zone = $('#lignes-facture'); zone.innerHTML = '';
    $('#facture-vide').hidden = etat.facture.length > 0;

    etat.facture.forEach((f) => {
      const p = Comparateur.prestation(f.prestationId);
      const l = el('div', 'ligne-facture');
      const h = el('div', 'haut');

      const d1 = el('div'); d1.appendChild(el('label', null, 'Prestation'));
      const sel = el('select'); optionsPrestations(sel, f.prestationId);
      sel.addEventListener('change', () => { f.prestationId = sel.value; rendreFacture(); rendreResultat(); });
      d1.appendChild(sel);

      const d2 = el('div'); d2.appendChild(el('label', null, 'Montant facturé (CHF)'));
      const m = el('input'); m.type = 'number'; m.min = 0; m.step = 0.05; m.value = f.montant || '';
      m.addEventListener('input', () => { f.montant = Number(m.value) || 0; rendreResultat(); });
      d2.appendChild(m);

      const d3 = el('div');
      const unite = p ? p.unite_saisie : 'montant';
      if (unite === 'montant_et_seances') {
        d3.appendChild(el('label', null, 'Nb séances'));
        const s = el('input'); s.type = 'number'; s.min = 0; s.step = 1; s.value = f.seances || '';
        s.addEventListener('input', () => { f.seances = Number(s.value) || 0; rendreResultat(); });
        d3.appendChild(s);
      } else if (unite === 'montant_et_jours') {
        d3.appendChild(el('label', null, 'Nb jours'));
        const j = el('input'); j.type = 'number'; j.min = 0; j.step = 1; j.value = f.jours || '';
        j.addEventListener('input', () => { f.jours = Number(j.value) || 0; rendreResultat(); });
        d3.appendChild(j);
      }

      const d4 = el('div');
      const sup = el('button', 'btn danger mini', 'Retirer'); sup.type = 'button';
      sup.addEventListener('click', () => {
        etat.facture = etat.facture.filter((x) => x.id !== f.id); rendreFacture(); rendreResultat();
      });
      d4.appendChild(sup);

      h.append(d1, d2, d3, d4); l.appendChild(h);

      if (p && p.categorie === 'MIXTE') {
        const mix = el('div', 'mixte');
        mix.appendChild(el('div', 'avert',
          "Prestation partagée entre la base et la complémentaire. Indiquez la part facturée au "
          + "tarif LAMal ; sans elle, la ligne n'entre pas dans le calcul."));
        const lab = el('label', null, 'Part au tarif LAMal (CHF)');
        const pi = el('input'); pi.type = 'number'; pi.min = 0; pi.step = 0.05;
        pi.value = f.montantPartLamal == null ? '' : f.montantPartLamal;
        pi.addEventListener('input', () => {
          f.montantPartLamal = pi.value === '' ? null : Number(pi.value); rendreResultat();
        });
        mix.append(lab, pi);
        if (p.remarque) {
          const r = el('div', 'produit-src', p.remarque); r.style.marginTop = '8px';
          mix.appendChild(r);
        }
        l.appendChild(mix);
      }
      zone.appendChild(l);
    });
  }

  // ------------------------------------------------------------ Résultat
  function etiquette(etatLigne) {
    if (etatLigne === 'rembourse') return '<span class="etiq ok">remboursé</span>';
    if (etatLigne === 'a_preciser') return '<span class="etiq prec">à préciser</span>';
    return '<span class="etiq non">non couvert</span>';
  }

  function tableauDetail(res) {
    let h = '<table class="lignes"><thead><tr><th>Prestation</th><th class="num">Base LAMal</th>'
          + '<th class="num">Part compl.</th><th class="num">Remboursé compl.</th>'
          + '<th>Produit retenu</th></tr></thead><tbody>';

    const parFacture = {};
    for (const d of res.lamal.detail) {
      const k = d.ligne.factureId;
      parFacture[k] = parFacture[k] || { nom: d.ligne.prestation.libelle, base: 0, lca: 0, remb: 0,
                                         etat: null, produit: null, notes: [] };
      parFacture[k].base += d.franchise + d.quotePart + d.contribution;
      parFacture[k].exonere = d.exonere;
    }
    for (const d of res.lca.parLigne) {
      const k = d.ligne.factureId;
      parFacture[k] = parFacture[k] || { nom: d.ligne.prestation.libelle, base: 0, lca: 0, remb: 0,
                                         etat: null, produit: null, notes: [] };
      parFacture[k].lca += d.ligne.montantLca;
      parFacture[k].remb += d.montant;
      parFacture[k].etat = d.etat;
      parFacture[k].produit = d.produit;
      parFacture[k].notes = d.notes || [];
    }

    for (const k of Object.keys(parFacture)) {
      const r = parFacture[k];
      const nomProduit = r.produit ? esc(r.produit.nom) : '—';
      const notes = r.notes.length ? `<div class="produit-src">${esc(r.notes.join(' · '))}</div>` : '';
      h += `<tr><td>${esc(r.nom)}${r.exonere ? ' <span class="etiq ok">exonéré</span>' : ''}</td>`
        + `<td class="num">${r.base ? Fmt.chf(r.base) : '—'}</td>`
        + `<td class="num">${r.lca ? Fmt.chf(r.lca) : '—'}</td>`
        + `<td class="num">${r.etat ? (r.etat === 'rembourse' ? Fmt.chf(r.remb) : etiquette(r.etat)) : '—'}</td>`
        + `<td>${nomProduit}${notes}</td></tr>`;
    }
    return h + '</tbody></table>';
  }

  function rendreResultat() {
    const zone = $('#resultat');
    const pret = etat.facture.some((f) => f.prestationId && f.montant > 0)
      && (etat.actuel.mode === 'libre' ? etat.actuel.libre.couvertures.length >= 0
                                       : !!etat.actuel.assureurId);
    if (!pret) {
      zone.innerHTML = '<div class="vide">Renseignez la couverture actuelle et au moins une prestation.</div>';
      return;
    }

    const res = Comparateur.comparer(etat);
    let h = '';

    if (res.incompletes.length) {
      h += `<div class="avertissement"><strong>${res.incompletes.length} ligne(s) incomplète(s).</strong> `
        + esc(res.incompletes.map((i) => i.prestation.libelle).join(', '))
        + ' — la part au tarif LAMal doit être renseignée. Ces lignes sont exclues du calcul.</div>';
    }
    if (res.versees.length) {
      h += `<div class="avertissement">${res.versees.length} prestation(s) versée(s) `
        + '(capital, rente, indemnité) exclue(s) du reste à charge : ce sont des montants versés, '
        + 'pas des remboursements de facture.</div>';
    }
    if (etat.actuel.mode === 'libre') {
      h += '<div class="avertissement"><strong>Couverture actuelle décrite à la main.</strong> '
        + 'Elle ne provient pas de la base vérifiée.</div>';
    }

    const act = res.actuel;
    const meilleur = res.concurrents[0];
    h += '<div class="chiffre-cle">';
    h += `<div><div class="l">Total facturé</div><div class="v">${Fmt.chf(res.totalFacture)}</div></div>`;
    if (act) {
      h += `<div><div class="l">Reste à charge actuel</div><div class="v">${Fmt.chf(act.resteACharge)}</div></div>`;
    }
    if (meilleur && act) {
      const ecart = act.resteACharge - meilleur.resteACharge;
      h += `<div><div class="l">Meilleure caisse</div><div class="v">${esc(meilleur.nom)}</div></div>`;
      h += `<div><div class="l">Écart</div><div class="v ${ecart > 0 ? 'gain' : ''}">`
        + (ecart > 0 ? '− ' + Fmt.chf(ecart) : Fmt.chf(0)) + '</div></div>';
    }
    h += '</div>';

    h += '<h3 style="margin:22px 0 10px;font-size:14px">Détail de la part base (identique chez toutes les caisses)</h3>';
    h += `<table class="lignes"><tbody>
      <tr><td>Franchise consommée</td><td class="num">${Fmt.chf(res.lamal.franchise)}</td></tr>
      <tr><td>Quote-part (plafond CHF ${Fmt.nombre(res.lamal.plafondQuotePart)})</td><td class="num">${Fmt.chf(res.lamal.quotePart)}</td></tr>
      <tr><td>Contribution hospitalière</td><td class="num">${Fmt.chf(res.lamal.contribution)}</td></tr>
      <tr><td><strong>Reste à charge base</strong></td><td class="num"><strong>${Fmt.chf(res.lamal.resteACharge)}</strong></td></tr>
      </tbody></table>`;
    if (res.lamal.quotePartEcretee > 0.005) {
      h += `<div class="produit-src" style="margin-top:6px">Quote-part écrêtée de ${Fmt.chf(res.lamal.quotePartEcretee)} par le plafond annuel.</div>`;
    }

    h += '<h3 style="margin:24px 0 10px;font-size:14px">Comparatif des caisses</h3>';
    h += '<table class="compare"><thead><tr><th>Caisse</th><th class="num">Part base</th>'
      + '<th class="num">Remboursé compl.</th><th class="num">Reste à charge</th>'
      + '<th class="num">Écart</th><th>À préciser</th></tr></thead><tbody>';

    if (act) {
      h += `<tr class="actuelle" data-id="${esc(act.assureurId)}"><td><span class="rang"></span>`
        + `${esc(act.nom)} <span class="etiq actu">actuelle</span></td>`
        + `<td class="num">${Fmt.chf(res.lamal.resteACharge)}</td>`
        + `<td class="num">${Fmt.chf(act.lca.totalRembourse)}</td>`
        + `<td class="num">${Fmt.chf(act.resteACharge)}</td><td class="num">—</td>`
        + `<td>${act.lca.nbAPreciser || '—'}</td></tr>`;
    }
    res.concurrents.forEach((c, i) => {
      const ecart = act ? act.resteACharge - c.resteACharge : null;
      const cls = ecart == null ? '' : ecart > 0.005 ? 'gain' : ecart < -0.005 ? 'perte' : '';
      const txt = ecart == null ? '—' : (ecart > 0 ? '− ' : ecart < 0 ? '+ ' : '') + Fmt.chf(Math.abs(ecart));
      h += `<tr data-id="${esc(c.assureurId)}"><td><span class="rang">${i + 1}</span>${esc(c.nom)}</td>`
        + `<td class="num">${Fmt.chf(res.lamal.resteACharge)}</td>`
        + `<td class="num">${Fmt.chf(c.lca.totalRembourse)}</td>`
        + `<td class="num">${Fmt.chf(c.resteACharge)}</td>`
        + `<td class="num ${cls}">${txt}</td>`
        + `<td>${c.lca.nbAPreciser || '—'}</td></tr>`;
      if (etat.detailOuvert === c.assureurId) {
        h += `<tr class="detail"><td colspan="6"><div class="corps">`
          + `<div style="margin-bottom:12px"><label for="filtre-${esc(c.assureurId)}">Produits retenus pour cette caisse</label>`
          + `<select id="filtre-${esc(c.assureurId)}" data-filtre="${esc(c.assureurId)}" style="max-width:420px">`
          + `<option value="">Tous les produits (le plus favorable par prestation)</option>`
          + c.produitsDisponibles.map((p) => {
              const sel = ((etat.filtresProduits[c.assureurId] || [])[0] === p.id) ? ' selected' : '';
              return `<option value="${esc(p.id)}"${sel}>${esc(p.nom)}</option>`;
            }).join('')
          + '</select></div>' + tableauDetail(c) + '</div></td></tr>';
      }
    });
    h += '</tbody></table>';

    if (act) {
      h += '<h3 style="margin:24px 0 10px;font-size:14px">Détail de la couverture actuelle</h3>'
        + tableauDetail(act);
    }

    h += '<div class="produit-src" style="margin-top:18px">'
      + 'Chez les caisses comparées, le client ne possède aucun produit : le montant retenu est '
      + 'celui du produit le plus favorable, nommé dans le détail. Les plafonds annuels des '
      + 'concurrentes sont considérés comme intacts, contrairement à ceux de la caisse actuelle.'
      + '</div>';

    zone.innerHTML = h;

    zone.querySelectorAll('table.compare tbody tr[data-id]').forEach((tr) => {
      tr.addEventListener('click', (ev) => {
        if (ev.target.closest('select')) return;
        const id = tr.getAttribute('data-id');
        etat.detailOuvert = etat.detailOuvert === id ? null : id;
        rendreResultat();
      });
    });
    zone.querySelectorAll('select[data-filtre]').forEach((s) => {
      s.addEventListener('change', () => {
        const id = s.getAttribute('data-filtre');
        if (s.value) etat.filtresProduits[id] = [s.value];
        else delete etat.filtresProduits[id];
        rendreResultat();
      });
    });
  }

  // ------------------------------------------------------------ Évènements
  function brancher() {
    $('#categorie').addEventListener('change', (e) => {
      etat.client.categorie = e.target.value; remplirEntetes(); rendreResultat();
    });
    $('#franchise').addEventListener('change', (e) => {
      etat.client.franchise = Number(e.target.value); rendreResultat();
    });
    $('#modele').addEventListener('change', (e) => { etat.client.modele = e.target.value; });
    $('#date-facture').addEventListener('change', (e) => { etat.client.date = e.target.value; });
    $('#franchise-payee').addEventListener('input', (e) => {
      etat.cumuls.franchisePayee = Number(e.target.value) || 0; rendreResultat();
    });
    $('#qp-atteinte').addEventListener('input', (e) => {
      etat.cumuls.quotePartAtteinte = Number(e.target.value) || 0; rendreResultat();
    });
    $('#assureur-actuel').addEventListener('change', (e) => {
      etat.actuel.assureurId = e.target.value;
      etat.actuel.produitIds = [];
      etat.detailOuvert = null;
      rendreProduits(); rendreResultat();
    });
    $('#btn-ajout-ligne').addEventListener('click', () => {
      etat.facture.push({ id: prochainId++, prestationId: '', montant: 0, seances: 0, jours: 0,
                          montantPartLamal: null });
      rendreFacture(); rendreResultat();
    });
    $('#btn-mode-libre').addEventListener('click', () => {
      etat.actuel.mode = etat.actuel.mode === 'libre' ? 'base' : 'libre';
      $('#bloc-base').hidden = etat.actuel.mode === 'libre';
      $('#bloc-libre').hidden = etat.actuel.mode !== 'libre';
      $('#btn-mode-libre').textContent = etat.actuel.mode === 'libre'
        ? 'Revenir aux caisses de la base' : 'Caisse absente de la base';
      rendreResultat();
    });
    $('#btn-libre-ajout').addEventListener('click', () => {
      etat.actuel.libre.couvertures.push({ prestation_id: '', taux_remboursement: null,
                                           plafond_annuel: null });
      rendreLibre(); rendreResultat();
    });
    $('#libre-nom').addEventListener('input', (e) => { etat.actuel.libre.nom = e.target.value; rendreResultat(); });
    $('#libre-franchise').addEventListener('input', (e) => {
      etat.actuel.libre.franchise = Number(e.target.value) || 0; rendreResultat();
    });
    $('#btn-imprimer').addEventListener('click', () => window.print());
    $('#btn-reset').addEventListener('click', () => {
      if (!confirm('Repartir de zéro pour un nouveau client ?')) return;
      reinitialiser();
    });
  }

  function reinitialiser() {
    etat = etatVierge();
    prochainId = 1;
    document.querySelectorAll('input').forEach((i) => {
      if (i.type === 'checkbox') i.checked = false; else i.value = '';
    });
    $('#bloc-base').hidden = false;
    $('#bloc-libre').hidden = true;
    $('#btn-mode-libre').textContent = 'Caisse absente de la base';
    $('#compte-produits').textContent = "Choisissez d'abord une caisse.";
    $('#liste-produits').innerHTML = '';
    $('#libre-couvertures').innerHTML = '';
    document.querySelectorAll('details.repliable').forEach((d) => { d.open = false; });
    remplirEntetes();
    // Une ligne vide prete a saisir, comme au premier chargement.
    etat.facture.push({ id: prochainId++, prestationId: '', montant: 0, seances: 0, jours: 0,
                        montantPartLamal: null });
    rendreFacture(); rendreResultat();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!window.DB) {
      document.body.innerHTML = '<p style="padding:40px;font-family:sans-serif">'
        + 'Base de données absente. Lancer <code>node build.mjs</code> pour générer '
        + '<code>data/db.js</code>.</p>';
      return;
    }
    etat = etatVierge();
    remplirEntetes();
    brancher();
    etat.facture.push({ id: prochainId++, prestationId: '', montant: 0, seances: 0, jours: 0,
                        montantPartLamal: null });
    rendreFacture();
    rendreResultat();
  });
})();
