/* ===== Espace administrateur ===== */
let adminOK=false,adminTab='apercu',admQ='',admStatus='all',rdvFilter='avenir';
try{adminOK=sessionStorage.getItem('vp-admin')==='1'}catch(e){}
const APPT_ST={prevu:['Prévu','blue'],fait:['Fait','ok'],annule:['Annulé','bad']};
const QUOTE_ST={brouillon:['Brouillon',''],envoye:['Envoyé','warn'],accepte:['Accepté','ok'],refuse:['Refusé','bad']};
const todayStr=()=>ymd(new Date());
const upcoming=()=>S.appts.filter(a=>a.status==='prevu'&&(a.date+a.time)>=(todayStr()+'00:00')).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
function summaryText(){
  const s=S.settings,t=todayStr(),newP=S.prospects.filter(p=>ymd(new Date(p.createdAt))===t),up=upcoming(),qs=S.quotes.filter(q=>ymd(new Date(q.createdAt))===t);
  let x=`RÉSUMÉ DU JOUR · ${s.agency}\n${fmtDate(t)}\n\nNouveaux prospects : ${newP.length}\n`;
  newP.forEach(p=>{x+=`• ${prospectLabel(p)}${p.name&&p.business?' ('+p.name+')':''}${p.phone?' · '+p.phone:''} · ${(HEAT[p.heat]||[''])[0]}\n`;(p.notes||[]).slice(0,2).forEach(n=>{x+='   - '+n.x+'\n'})});
  x+=`\nDevis du jour : ${qs.length}\n`;qs.forEach(q=>{const p=prospectById(q.prospectId);x+=`• ${q.num} · ${prospectLabel(p)} · ${eur(calcQuote(q).total)}\n`});
  x+=`\nProchains rendez-vous : ${up.length}\n`;up.slice(0,8).forEach(a=>{const p=prospectById(a.prospectId);x+=`• ${fmtDateS(a.date)} ${fmtT(a.time)} · ${prospectLabel(p)}${p&&p.phone?' · '+p.phone:''} · ${a.goal||''}\n`});
  return x;
}
function pageAdmin(){
  if(!adminOK){
    const html=`<div class="page gut"><div class="narrow"><div class="pagehead"><h1>Espace administrateur</h1><p>Saisissez votre code pour voir les prospects, les rendez-vous et les devis notés par le commercial.</p></div>
    <div class="card"><label class="fld" style="margin-top:0"><span>Code</span><input class="inp" id="pin" type="password" inputmode="numeric" autocomplete="off" maxlength="12" placeholder="••••"></label><p id="pinerr" class="hint" style="color:var(--bad);margin-top:8px" hidden>Code incorrect.</p><button class="btn block" style="margin-top:14px" data-unlock>${ic('lock',18)} Déverrouiller</button>${!S.settings.pinChanged?'<p class="hint" style="margin-top:12px">Première utilisation : le code par défaut est <b>1234</b>. Changez-le dans Réglages.</p>':''}</div>
    <p class="hint" style="margin-top:14px;text-align:center">Ce code évite les regards curieux. Il ne chiffre pas les données du téléphone.</p></div></div>`;
    return{html,init(root){
      const go1=()=>{if($('#pin',root).value===String(S.settings.pin)){adminOK=true;try{sessionStorage.setItem('vp-admin','1')}catch(e){}render()}else{$('#pinerr',root).hidden=false;$('#pin',root).value='';$('#pin',root).focus()}};
      $('[data-unlock]',root).onclick=go1;$('#pin',root).addEventListener('keydown',e=>{if(e.key==='Enter')go1()});}};
  }
  const tabs=[['apercu','Aperçu'],['prospects','Prospects ('+S.prospects.length+')'],['rdv','RDV ('+upcoming().length+')'],['devis','Devis ('+S.quotes.length+')'],['reglages','Réglages'],['donnees','Données']];
  const html=`<div class="page gut"><div class="pagehead"><h1>Espace administrateur</h1><p>Tout ce que le commercial a noté, enregistré sur ce téléphone.</p></div><div class="subtabs" role="tablist" id="atabs">${tabs.map(t=>`<button role="tab" data-a="${t[0]}" aria-selected="${adminTab===t[0]}">${esc(t[1])}</button>`).join('')}</div><div id="adm"></div><div style="margin-top:22px"><button class="btn sm line" data-lockadm>${ic('lock',16)} Verrouiller</button></div></div>`;
  return{html,init(root){
    const box=$('#adm',root);
    const draw=()=>{$$('#atabs button',root).forEach(b=>b.setAttribute('aria-selected',b.dataset.a===adminTab));({apercu:tApercu,prospects:tProspects,rdv:tRdv,devis:tDevis,reglages:tReglages,donnees:tDonnees}[adminTab])(box,draw)};
    $('#atabs',root).addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b){adminTab=b.dataset.a;draw()}});
    $('[data-lockadm]',root).onclick=()=>{adminOK=false;try{sessionStorage.removeItem('vp-admin')}catch(e){}render()};
    draw();}};
}
/* --- aperçu --- */
function tApercu(box,redraw){
  const up=upcoming(),open=S.quotes.filter(q=>['brouillon','envoye'].includes(q.status)),won=S.quotes.filter(q=>q.status==='accepte');
  const sum=a=>a.reduce((t,q)=>t+calcQuote(q).total,0),hot=S.prospects.filter(p=>p.heat==='chaud'&&!['signe','perdu'].includes(p.status)).length;
  const views=Object.entries(S.views).sort((a,b)=>b[1]-a[1]).slice(0,6),mx=views.length?views[0][1]:1;
  box.innerHTML=`<div class="kpis"><div class="kpi"><b>${S.prospects.length}</b><span>Prospects</span></div><div class="kpi"><b>${hot}</b><span>Prospects chauds</span></div><div class="kpi"><b>${up.length}</b><span>RDV à venir</span></div><div class="kpi"><b>${open.length}</b><span>Devis en cours · ${eur(sum(open))}</span></div></div>
  <div class="kpis" style="margin-top:10px"><div class="kpi"><b>${won.length}</b><span>Sites signés · ${eur(sum(won))}</span></div><div class="kpi"><b>${Object.values(S.views).reduce((a,b)=>a+b,0)}</b><span>Démos montrées</span></div></div>
  <div class="card" style="margin-top:14px"><h3>Prochains rendez-vous</h3>${up.length?`<div class="list">${up.slice(0,5).map(a=>{const p=prospectById(a.prospectId)||{};return `<div class="item"><div class="top"><div><h4>${fmtDateS(a.date)} · ${fmtT(a.time)}</h4><div class="meta">${esc(prospectLabel(p))}${p.phone?' · '+esc(p.phone):''}</div></div>${badge(a.place||'','')}</div></div>`}).join('')}</div>`:'<p class="hint" style="margin-top:8px">Aucun rendez-vous prévu.</p>'}</div>
  <div class="card"><h3>Démos les plus montrées</h3>${views.length?views.map(([id,n])=>`<div class="bar"><span>${esc((DEMO_BY_ID[id]||{}).name||id)}</span><b>${n}</b><i style="width:${Math.max(4,n/mx*100)}%;grid-column:1/-1"></i></div>`).join(''):'<p class="hint" style="margin-top:8px">Aucune démo ouverte pour l\'instant.</p>'}</div>
  <div class="card"><h3>Derniers prospects</h3>${S.prospects.length?`<div class="list">${S.prospects.slice(0,5).map(p=>`<button class="item" style="text-align:left" data-op="${p.id}"><div class="top"><div><h4>${esc(prospectLabel(p))}</h4><div class="meta">${esc(p.name||'')}${p.phone?' · '+esc(p.phone):''}</div></div>${statusBadge(p.status)}</div></button>`).join('')}</div>`:'<p class="hint" style="margin-top:8px">Aucun prospect enregistré.</p>'}</div>`;
  box.onclick=e=>{const o=e.target.closest('[data-op]');if(o)openProspect(o.dataset.op,redraw)};
}
/* --- prospects --- */
function tProspects(box,redraw){
  const q=admQ.trim().toLowerCase();
  const list=S.prospects.filter(p=>(admStatus==='all'||p.status===admStatus)&&(!q||[p.business,p.name,p.phone,p.metier,p.address].join(' ').toLowerCase().includes(q)));
  box.innerHTML=`<div class="row" style="margin-top:10px"><div class="search" style="flex:1;margin-top:0;min-width:200px">${ic('search',20)}<input class="inp" id="aq" type="search" placeholder="Rechercher un prospect…" value="${esc(admQ)}" style="padding-left:44px"></div><button class="btn" data-newp>${ic('plus',18)} Ajouter</button></div>
  <div class="chips"><button class="chip" data-st="all" aria-pressed="${admStatus==='all'}">Tous</button>${Object.entries(STATUS).map(([k,v])=>`<button class="chip" data-st="${k}" aria-pressed="${admStatus===k}">${esc(v[0])}</button>`).join('')}</div>
  <div class="list" id="plist">${prospectItems(list)}</div>`;
  box.onclick=e=>{
    const st=e.target.closest('[data-st]');if(st){admStatus=st.dataset.st;tProspects(box,redraw);return}
    const o=e.target.closest('[data-op]');if(o){openProspect(o.dataset.op,redraw);return}
    if(e.target.closest('[data-newp]'))openProspect('',redraw)};
  $('#aq',box).addEventListener('input',e=>{admQ=e.target.value;const qq=admQ.trim().toLowerCase();$('#plist',box).innerHTML=prospectItems(S.prospects.filter(p=>(admStatus==='all'||p.status===admStatus)&&(!qq||[p.business,p.name,p.phone,p.metier,p.address].join(' ').toLowerCase().includes(qq))))});
}
function prospectItems(list){
  if(!list.length)return '<div class="empty">Aucun prospect ici. Démarrez une visite depuis l\'accueil, ou touchez Ajouter.</div>';
  return list.map(p=>{const nr=S.appts.filter(a=>a.prospectId===p.id&&a.status==='prevu').length,nq=S.quotes.filter(q=>q.prospectId===p.id).length;
    return `<button class="item" style="text-align:left" data-op="${p.id}"><div class="top"><div><h4>${heatDot(p.heat)} ${esc(prospectLabel(p))}</h4><div class="meta">${esc(p.name||'')}${p.phone?' · '+esc(p.phone):''}${p.metier?' · '+esc(p.metier):''}</div></div>${statusBadge(p.status)}</div><div class="meta">${(p.viewed||[]).length} démo${(p.viewed||[]).length>1?'s':''} vue${(p.viewed||[]).length>1?'s':''}${nr?' · '+nr+' RDV':''}${nq?' · '+nq+' devis':''} · ${fmtDT(p.updatedAt||p.createdAt)}</div>${(p.notes||[])[0]?`<div class="meta" style="color:var(--ink)">« ${esc(p.notes[0].x.slice(0,90))}${p.notes[0].x.length>90?'…':''} »</div>`:''}</button>`}).join('');
}
function openProspect(id,after){
  const p=id?prospectById(id):null,d=p?Object.assign({},p):{business:'',name:'',phone:'',email:'',address:'',metier:'',status:'nouveau',heat:'tiede'};
  const rd=p?S.appts.filter(a=>a.prospectId===p.id).sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time)):[],qs=p?S.quotes.filter(q=>q.prospectId===p.id):[];
  const m=openModal(`<h3>${p?esc(prospectLabel(p)):'Nouveau prospect'}</h3>
  <div class="grid2"><label class="fld"><span>Nom du commerce</span><input class="inp" data-k="business" value="${esc(d.business)}"></label><label class="fld"><span>Contact</span><input class="inp" data-k="name" value="${esc(d.name)}"></label><label class="fld"><span>Téléphone</span><input class="inp" data-k="phone" type="tel" value="${esc(d.phone)}"></label><label class="fld"><span>E-mail</span><input class="inp" data-k="email" type="email" value="${esc(d.email)}"></label><label class="fld"><span>Adresse</span><input class="inp" data-k="address" value="${esc(d.address)}"></label><label class="fld"><span>Métier</span><select class="sel" data-k="metier"><option value="">—</option>${METIERS.map(x=>`<option${x===d.metier?' selected':''}>${esc(x)}</option>`).join('')}</select></label>
  <label class="fld"><span>Statut</span><select class="sel" data-k="status">${Object.entries(STATUS).map(([k,v])=>`<option value="${k}"${k===d.status?' selected':''}>${esc(v[0])}</option>`).join('')}</select></label><div class="fld"><span>Intérêt</span><div class="seg" style="margin-top:0" id="heat">${Object.entries(HEAT).map(([k,v])=>`<button data-h="${k}" aria-pressed="${d.heat===k}">${esc(v[0])}</button>`).join('')}</div></div></div>
  ${p?`<div class="fld"><span>Ajouter une note</span><textarea class="txa" id="nn" placeholder="Ce qu'il a dit, ce qu'il veut, ses objections…"></textarea><button class="btn sm line" data-addn style="justify-self:start">${ic('plus',16)} Ajouter la note</button></div>
  ${(p.notes||[]).length?`<div class="list">${p.notes.map(n=>`<div class="item" style="padding:10px 12px"><div class="meta">${fmtDT(n.t)}</div><div>${esc(n.x)}</div></div>`).join('')}</div>`:''}
  ${(p.viewed||[]).length?`<div class="fld"><span>Démos vues</span><div class="row">${p.viewed.map(id=>`<span class="badge blue">${esc((DEMO_BY_ID[id]||{}).name||id)}</span>`).join('')}</div></div>`:''}
  ${rd.length?`<div class="fld"><span>Rendez-vous</span><div class="list" style="margin-top:0">${rd.map(a=>`<div class="item" style="padding:10px 12px"><b>${fmtDateS(a.date)} · ${fmtT(a.time)}</b> ${badge((APPT_ST[a.status]||[a.status])[0],(APPT_ST[a.status]||['',''])[1])}<div class="meta">${esc(a.goal||'')} · ${esc(a.place||'')}</div></div>`).join('')}</div></div>`:''}
  ${qs.length?`<div class="fld"><span>Devis</span><div class="list" style="margin-top:0">${qs.map(q=>`<div class="item" style="padding:10px 12px"><b>${esc(q.num)} · ${eur(calcQuote(q).total)}</b> ${badge((QUOTE_ST[q.status]||[q.status])[0],(QUOTE_ST[q.status]||['',''])[1])}</div>`).join('')}</div></div>`:''}`:''}
  <div class="row" style="margin-top:18px"><button class="btn" data-save>Enregistrer</button>${p?`${p.phone?`<a class="btn line" href="${telHref(p.phone)}">${ic('phone',18)} Appeler</a><a class="btn line" target="_blank" rel="noopener" href="${waHref(p.phone)}">${ic('whats',18)} WhatsApp</a>`:''}<button class="btn line" data-rdv>${ic('calendar',18)} RDV</button><button class="btn line" data-dv>${ic('file',18)} Devis</button><button class="btn line" data-cp>${ic('copy',18)} Copier la fiche</button><button class="btn line" data-del style="color:var(--bad)">${ic('trash',18)} Supprimer</button>`:''}</div>`);
  m.addEventListener('click',e=>{const h=e.target.closest('[data-h]');if(h){d.heat=h.dataset.h;$$('#heat button',m).forEach(b=>b.setAttribute('aria-pressed',b===h))}});
  $$('[data-k]',m).forEach(el=>el.addEventListener('input',()=>{d[el.dataset.k]=el.value}));
  $('[data-save]',m).onclick=()=>{if(!(d.business||'').trim()&&!(d.name||'').trim()){toast('Indiquez le commerce ou le contact');return}
    const data={business:d.business.trim(),name:d.name.trim(),phone:d.phone.trim(),email:d.email.trim(),address:d.address.trim(),metier:d.metier,status:d.status,heat:d.heat};
    if(p)patchProspect(p.id,data);else addProspect(data);closeModal();toast('Fiche enregistrée');after&&after()};
  if(p){
    $('[data-addn]',m).onclick=()=>{const v=$('#nn',m).value;if(!v.trim())return;addNote(p.id,v);closeModal();openProspect(p.id,after);after&&after()};
    $('[data-rdv]',m).onclick=()=>{closeModal();go('/rdv?prospect='+p.id)};
    $('[data-dv]',m).onclick=()=>{closeModal();go('/devis?prospect='+p.id)};
    $('[data-cp]',m).onclick=()=>copyText(prospectText(prospectById(p.id)),'Fiche copiée');
    $('[data-del]',m).onclick=async()=>{if(await confirmBox('Supprimer ce prospect, ses rendez-vous et ses devis ?','Supprimer')){S.prospects=S.prospects.filter(x=>x.id!==p.id);S.appts=S.appts.filter(a=>a.prospectId!==p.id);S.quotes=S.quotes.filter(q=>q.prospectId!==p.id);if(S.visit===p.id)S.visit=null;save();toast('Prospect supprimé');after&&after()}};
  }
}
/* --- rendez-vous --- */
function tRdv(box,redraw){
  const t=todayStr(),all=S.appts.slice().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  const list=rdvFilter==='avenir'?all.filter(a=>a.date>=t&&a.status==='prevu'):rdvFilter==='passes'?all.filter(a=>a.date<t||a.status!=='prevu').reverse():all;
  box.innerHTML=`<div class="row" style="margin-top:10px"><div class="seg" id="rf" style="margin-top:0">${[['avenir','À venir'],['passes','Passés / clos'],['tous','Tous']].map(x=>`<button data-r="${x[0]}" aria-pressed="${rdvFilter===x[0]}">${x[1]}</button>`).join('')}</div><button class="btn sm" data-newr>${ic('plus',16)} Nouveau RDV</button></div>
  <div class="list">${list.length?list.map(a=>{const p=prospectById(a.prospectId)||{};return `<div class="item"><div class="top"><div><h4>${fmtDateS(a.date)} · ${fmtT(a.time)}</h4><div class="meta">${esc(prospectLabel(p))}${p.phone?' · '+esc(p.phone):''}</div></div><select class="sel" data-as="${a.id}" style="width:auto;min-height:40px;font-size:14px">${Object.entries(APPT_ST).map(([k,v])=>`<option value="${k}"${a.status===k?' selected':''}>${v[0]}</option>`).join('')}</select></div><div class="meta">${esc(a.goal||'')} · ${esc(a.place||'')}</div>${a.notes?`<div class="meta" style="color:var(--ink)">${esc(a.notes)}</div>`:''}<div class="row"><button class="btn sm line" data-ae="${a.id}">Modifier</button><button class="btn sm line" data-ac="${a.id}">${ic('copy',16)} Copier</button><button class="btn sm line" data-ad="${a.id}" style="color:var(--bad)">${ic('trash',16)}</button></div></div>`}).join(''):'<div class="empty">Aucun rendez-vous dans cette liste.</div>'}</div>`;
  box.onclick=async e=>{
    const r=e.target.closest('[data-r]');if(r){rdvFilter=r.dataset.r;tRdv(box,redraw);return}
    if(e.target.closest('[data-newr]')){go('/rdv');return}
    const c=e.target.closest('[data-ac]');if(c){copyText(apptText(S.appts.find(a=>a.id===c.dataset.ac)),'Rendez-vous copié');return}
    const d=e.target.closest('[data-ad]');if(d){if(await confirmBox('Supprimer ce rendez-vous ?','Supprimer')){S.appts=S.appts.filter(a=>a.id!==d.dataset.ad);save();redraw()}return}
    const ed=e.target.closest('[data-ae]');if(ed)editAppt(ed.dataset.ae,redraw)};
  box.onchange=e=>{const s=e.target.closest('[data-as]');if(s){const a=S.appts.find(x=>x.id===s.dataset.as);a.status=s.value;a.updatedAt=Date.now();save();toast('Statut mis à jour');redraw()}};
}
function editAppt(id,after){
  const a=S.appts.find(x=>x.id===id);if(!a)return;
  const m=openModal(`<h3>Modifier le rendez-vous</h3><div class="grid2"><label class="fld"><span>Date</span><input class="inp" type="date" data-k="date" value="${esc(a.date)}"></label><label class="fld"><span>Heure</span><input class="inp" type="time" data-k="time" value="${esc(a.time)}"></label></div><label class="fld"><span>Lieu</span><input class="inp" data-k="place" value="${esc(a.place||'')}"></label><label class="fld"><span>Objet</span><input class="inp" data-k="goal" value="${esc(a.goal||'')}"></label><label class="fld"><span>Notes</span><textarea class="txa" data-k="notes">${esc(a.notes||'')}</textarea></label><div class="row" style="margin-top:16px"><button class="btn" data-ok>Enregistrer</button></div>`);
  $('[data-ok]',m).onclick=()=>{$$('[data-k]',m).forEach(el=>{a[el.dataset.k]=el.value});a.updatedAt=Date.now();save();closeModal();toast('Rendez-vous modifié');after()};
}
/* --- devis --- */
function tDevis(box,redraw){
  box.innerHTML=`<div class="row" style="margin-top:10px"><button class="btn sm" data-newq>${ic('plus',16)} Nouveau devis</button></div><div class="list">${S.quotes.length?S.quotes.map(q=>{const p=prospectById(q.prospectId)||{},c=calcQuote(q);return `<div class="item"><div class="top"><div><h4>${esc(q.num)} · ${eur(c.total)}</h4><div class="meta">${esc(prospectLabel(p))} · ${fmtDT(q.createdAt)}${q.demo&&DEMO_BY_ID[q.demo]?' · démo : '+esc(DEMO_BY_ID[q.demo].name):''}</div></div><select class="sel" data-qs="${q.id}" style="width:auto;min-height:40px;font-size:14px">${Object.entries(QUOTE_ST).map(([k,v])=>`<option value="${k}"${q.status===k?' selected':''}>${v[0]}</option>`).join('')}</select></div>${q.notes?`<div class="meta" style="color:var(--ink)">${esc(q.notes)}</div>`:''}<div class="row"><button class="btn sm line" data-qv="${q.id}">Détail</button><button class="btn sm line" data-qc="${q.id}">${ic('copy',16)} Copier</button><button class="btn sm line" data-qd="${q.id}" style="color:var(--bad)">${ic('trash',16)}</button></div></div>`}).join(''):'<div class="empty">Aucun devis pour l\'instant.</div>'}</div>`;
  box.onclick=async e=>{
    if(e.target.closest('[data-newq]')){go('/devis');return}
    const v=e.target.closest('[data-qv]');if(v){const q=quoteById(v.dataset.qv);openModal(`<h3>${esc(q.num)}</h3><pre style="white-space:pre-wrap;font:inherit;margin-top:10px">${esc(quoteText(q))}</pre><div class="row" style="margin-top:14px"><button class="btn" id="qc">${ic('copy',18)} Copier</button><button class="btn line" id="qs">${ic('share',18)} Envoyer</button></div>`);$('#qc').onclick=()=>copyText(quoteText(q),'Devis copié');$('#qs').onclick=()=>shareText('Devis '+q.num,quoteText(q));return}
    const c=e.target.closest('[data-qc]');if(c){copyText(quoteText(quoteById(c.dataset.qc)),'Devis copié');return}
    const d=e.target.closest('[data-qd]');if(d){if(await confirmBox('Supprimer ce devis ?','Supprimer')){S.quotes=S.quotes.filter(q=>q.id!==d.dataset.qd);save();redraw()}}};
  box.onchange=e=>{const s=e.target.closest('[data-qs]');if(s){const q=quoteById(s.dataset.qs);q.status=s.value;q.updatedAt=Date.now();const p=prospectById(q.prospectId);if(p&&s.value==='accepte')patchProspect(p.id,{status:'signe'});if(p&&s.value==='refuse')patchProspect(p.id,{status:'perdu'});save();toast('Statut mis à jour');redraw()}};
}
/* --- réglages --- */
function tReglages(box,redraw){
  const s=S.settings,fld=(l,k,v,t)=>`<label class="fld"><span>${l}</span><input class="inp" data-s="${k}" ${t?`type="${t}" inputmode="decimal"`:''} value="${esc(v)}"></label>`;
  box.innerHTML=`<div class="card" style="margin-top:12px"><h3>Votre agence</h3><p class="hint">Ces informations apparaissent sur l'accueil, l'offre et les devis.</p><div class="grid2">${fld('Nom de l\'agence','agency',s.agency)}${fld('Slogan','tagline',s.tagline)}${fld('Nom du commercial','commercial',s.commercial)}${fld('Téléphone','phone',s.phone,'tel')}${fld('E-mail','email',s.email,'email')}${fld('Ville','city',s.city)}</div></div>
  <div class="card"><h3>Tarifs</h3><div class="grid2">${fld('Prix tout compris, 1re année (€)','price',s.price,'number')}${fld('Mensuel dès la 2e année : minimum (€)','monthlyMin',s.monthlyMin,'number')}${fld('Mensuel dès la 2e année : maximum (€)','monthlyMax',s.monthlyMax,'number')}${fld('Délai de livraison','delay',s.delay)}</div>
  <h3 style="margin-top:18px">Prix des options</h3>${s.options.map(o=>`<label class="fld"><span>${esc(o.n)}${o.unit?' (par page)':''}</span><input class="inp" type="number" inputmode="decimal" data-o="${o.id}" value="${o.p}"></label>`).join('')}</div>
  <div class="card"><h3>Disponibilités pour les rendez-vous</h3><div class="lbl" style="margin-top:10px">Jours</div><div class="seg" id="wd">${[1,2,3,4,5,6,0].map(k=>`<button data-wd="${k}" aria-pressed="${s.rdv.days.includes(k)}">${DAYS_S[k]}</button>`).join('')}</div><div class="grid2"><label class="fld"><span>De</span><input class="inp" type="time" data-r="start" value="${s.rdv.start}"></label><label class="fld"><span>À</span><input class="inp" type="time" data-r="end" value="${s.rdv.end}"></label><label class="fld"><span>Durée d'un créneau</span><select class="sel" data-r="step">${[15,30,45,60].map(n=>`<option value="${n}"${+s.rdv.step===n?' selected':''}>${n} min</option>`).join('')}</select></label></div></div>
  <div class="card"><h3>Code de l'espace admin</h3><div class="grid2"><label class="fld"><span>Nouveau code (4 chiffres ou plus)</span><input class="inp" id="np" type="password" inputmode="numeric" maxlength="12" autocomplete="off"></label><div style="align-self:end"><button class="btn line" data-pin style="margin-top:14px">Changer le code</button></div></div></div>`;
  box.oninput=e=>{const k=e.target.dataset;
    if(k.s){const t=e.target.type==='number';s[k.s]=t?(+e.target.value||0):e.target.value;save()}
    if(k.o){const o=s.options.find(x=>x.id===k.o);o.p=+e.target.value||0;save()}
    if(k.r){s.rdv[k.r]=e.target.value;save()}};
  box.onchange=e=>{if(e.target.dataset.r==='step'){s.rdv.step=+e.target.value;save()}};
  box.onclick=e=>{
    const w=e.target.closest('[data-wd]');if(w){const k=+w.dataset.wd,a=s.rdv.days;a.includes(k)?a.splice(a.indexOf(k),1):a.push(k);save();w.setAttribute('aria-pressed',a.includes(k));return}
    if(e.target.closest('[data-pin]')){const v=$('#np',box).value;if(!/^\d{4,12}$/.test(v)){toast('Le code doit contenir 4 chiffres au minimum');return}s.pin=v;s.pinChanged=true;save();$('#np',box).value='';toast('Code modifié')}};
}
/* --- données --- */
function tDonnees(box,redraw){
  const size=Math.round(JSON.stringify(S).length/1024);
  box.innerHTML=`<div class="card" style="margin-top:12px"><h3>Récupérer les notes du commercial</h3><p class="hint">Les données sont stockées sur le téléphone du commercial. Pour les voir sur votre téléphone : le commercial touche <b>Envoyer la sauvegarde</b> (WhatsApp, message, e-mail), puis vous la collez ici dans <b>Importer</b>.</p>
  <div class="row" style="margin-top:12px"><button class="btn" data-sendj>${ic('share',18)} Envoyer la sauvegarde</button><button class="btn line" data-sendr>${ic('share',18)} Envoyer le résumé du jour</button></div></div>
  <div class="card"><h3>Importer</h3><p class="hint">Collez la sauvegarde reçue, ou choisissez le fichier. Les fiches déjà présentes sont mises à jour si elles sont plus récentes.</p><textarea class="txa" id="imp" placeholder='{"app":"vitrines-pro", …}'></textarea><div class="row" style="margin-top:10px"><button class="btn" data-imp>Importer</button><label class="btn line" style="cursor:pointer">Choisir un fichier<input type="file" id="impf" accept=".json,application/json,text/plain" hidden></label></div></div>
  <div class="card"><h3>Exporter</h3><div class="row" style="margin-top:10px"><button class="btn line" data-ej>${ic('download',18)} Sauvegarde (.json)</button><button class="btn line" data-cj>${ic('copy',18)} Copier la sauvegarde</button></div><div class="row" style="margin-top:10px"><button class="btn line" data-ecp>Prospects (.csv)</button><button class="btn line" data-ecr>RDV (.csv)</button><button class="btn line" data-ecq>Devis (.csv)</button></div></div>
  <div class="card"><h3>Utiliser sans internet</h3><p class="hint">Ouvrez l'application une première fois avec une connexion, puis ajoutez-la à l'écran d'accueil (menu du navigateur : « Ajouter à l'écran d'accueil » ou « Installer l'application »). Ensuite, elle fonctionne partout sans réseau : démos, devis, rendez-vous et prospects restent enregistrés sur le téléphone.</p></div>
  <div class="card"><h3>Stockage</h3><p class="hint">${S.prospects.length} prospects · ${S.appts.length} rendez-vous · ${S.quotes.length} devis · environ ${size} Ko sur ce téléphone.${storageOK?'':' <b style="color:var(--bad)">Stockage indisponible dans ce navigateur.</b>'}</p>
  <div class="row" style="margin-top:12px"><button class="btn line" data-reset style="color:var(--bad)">${ic('trash',18)} Tout effacer</button></div></div>`;
  const j=()=>JSON.stringify(exportObj(),null,1),stamp=ymd(new Date());
  const doImport=txt=>{try{const o=JSON.parse(txt);if(o.app!=='vitrines-pro')throw 0;const r=mergeIn(o);toast(`Importé : ${r.add} nouvelle${r.add>1?'s':''} fiche${r.add>1?'s':''}, ${r.upd} mise${r.upd>1?'s':''} à jour`);redraw()}catch(e){toast('Ce texte n\'est pas une sauvegarde valide')}};
  box.onclick=async e=>{
    if(e.target.closest('[data-sendj]'))shareText('Sauvegarde Vitrines Pro',j());
    if(e.target.closest('[data-sendr]'))shareText('Résumé du jour',summaryText());
    if(e.target.closest('[data-ej]'))downloadFile('vitrines-pro-'+stamp+'.json','application/json',j());
    if(e.target.closest('[data-cj]'))copyText(j(),'Sauvegarde copiée');
    if(e.target.closest('[data-ecp]'))downloadFile('prospects-'+stamp+'.csv','text/csv',csvProspects());
    if(e.target.closest('[data-ecr]'))downloadFile('rdv-'+stamp+'.csv','text/csv',csvAppts());
    if(e.target.closest('[data-ecq]'))downloadFile('devis-'+stamp+'.csv','text/csv',csvQuotes());
    if(e.target.closest('[data-imp]'))doImport($('#imp',box).value);
    if(e.target.closest('[data-reset]')&&await confirmBox('Effacer tous les prospects, rendez-vous et devis de ce téléphone ? Pensez à exporter avant.','Tout effacer')){const keep=S.settings;S=defaults();S.settings=keep;save();toast('Données effacées');redraw()}};
  $('#impf',box).addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>doImport(String(r.result));r.readAsText(f)});
}
