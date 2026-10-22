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
    <div class="card"><label class="fld" style="margin-top:0"><span>Identifiant <small>(commercial · laissez vide pour le patron)</small></span><input class="inp" id="uid" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ex. COM-4821" value="${esc(S.lastId||'')}"></label><label class="fld"><span>Code</span><input class="inp" id="pin" type="password" inputmode="numeric" autocomplete="off" maxlength="12" placeholder="••••"></label><p id="pinerr" class="hint" style="color:var(--bad);margin-top:8px" hidden>Identifiant ou code incorrect.</p><button class="btn block" style="margin-top:14px" data-unlock>${ic('lock',18)} Déverrouiller</button>${!S.settings.pinChanged?'<p class="hint" style="margin-top:12px">Première utilisation : le code par défaut est <b>1234</b>. Changez-le dans Réglages.</p>':''}</div>
    <p class="hint" style="margin-top:14px;text-align:center">Ce code évite les regards curieux. Il ne chiffre pas les données du téléphone.</p></div></div>`;
    return{html,init(root){
      const go1=()=>{const u=($('#uid',root).value||'').trim().toUpperCase(),c=$('#pin',root).value,com=u&&(S.settings.coms||[]).find(x=>String(x.id).toUpperCase()===u),ok=u?(com&&String(com.code)===c):c===String(S.settings.pin);if(ok){adminOK=true;S.me=u?com.id:'';S.lastId=u?com.id:'';saveQuiet();try{sessionStorage.setItem('vp-admin','1')}catch(e){}render()}else{$('#pinerr',root).hidden=false;$('#pin',root).value='';$('#pin',root).focus()}};
      $('[data-unlock]',root).onclick=go1;$('#pin',root).addEventListener('keydown',e=>{if(e.key==='Enter')go1()});}};
  }
  const tabs=[['apercu','Aperçu'],['tournee','Tournée'],['prospects','Prospects ('+S.prospects.length+')'],['rdv','RDV ('+upcoming().length+')'],['devis','Devis ('+S.quotes.length+')'],['ventes','Ventes ('+sales().length+')'],['reglages','Réglages'],['donnees','Données']];
  const html=`<div class="page gut"><div class="pagehead"><h1>Espace administrateur</h1><p>Tout ce qui a été noté, enregistré sur ce téléphone. <span class="badge" data-syncst>${esc(syncLabel())}</span></p></div><div class="subtabs" role="tablist" id="atabs">${tabs.map(t=>`<button role="tab" data-a="${t[0]}" aria-selected="${adminTab===t[0]}">${esc(t[1])}</button>`).join('')}</div><div id="adm"></div><div style="margin-top:22px"><button class="btn sm line" data-lockadm>${ic('lock',16)} Verrouiller</button></div></div>`;
  return{html,init(root){
    const box=$('#adm',root);
    const draw=()=>{$$('#atabs button',root).forEach(b=>b.setAttribute('aria-selected',b.dataset.a===adminTab));({apercu:tApercu,tournee:tTournee,prospects:tProspects,rdv:tRdv,devis:tDevis,ventes:tVentes,reglages:tReglages,donnees:tDonnees}[adminTab])(box,draw)};
    $('#atabs',root).addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b){adminTab=b.dataset.a;draw()}});
    $('[data-lockadm]',root).onclick=()=>{adminOK=false;try{sessionStorage.removeItem('vp-admin')}catch(e){}render()};
    draw();}};
}
/* --- feuille de tournée --- */
let tourDate='';
const comById=id=>(S.settings.coms||[]).find(c=>c.id===id);
const comName=id=>{const c=comById(id);return c?c.name:(id?id:'')};
const RES={A:['A · 2e RDV fixé','ok'],B:['B · à relancer','warn'],C:['C · refus poli','bad']};
function tourText(d){
  const L=S.tours.filter(t=>t.date===d).sort((a,b)=>a.time.localeCompare(b.time)),me=S.me&&comById(S.me);
  let x=`FEUILLE DE TOURNÉE · ${fmtDate(d)}\n${me?me.name+' · ID '+me.id:(S.settings.commercial||'')}\n\n`;
  L.forEach(t=>{x+=`${t.time} · ${t.business}${t.name?' ('+t.name+')':''} · ${(DEMO_BY_ID[t.demo]||{}).name||'—'} · ${t.res||'—'}${t.next?' · '+t.next:''}${t.by&&!me?' · '+comName(t.by):''}\n`});
  const n=r=>L.filter(t=>t.res===r).length;x+=`\n${L.length} visites · A : ${n('A')} · B : ${n('B')} · C : ${n('C')}`;return x;
}
function printTour(d){
  const L=S.tours.filter(t=>t.date===d).sort((a,b)=>a.time.localeCompare(b.time)),me=S.me&&comById(S.me),rows=L.concat(Array(Math.max(0,14-L.length)).fill(null));
  const h=`<!doctype html><meta charset="utf-8"><title>Feuille de tournée</title><style>body{font:12px Arial,sans-serif;margin:14mm}h1{font-size:18px;margin:0 0 4px}p{margin:0 0 10px;color:#555}table{border-collapse:collapse;width:100%}th,td{border:1px solid #999;padding:6px;text-align:left;height:22px;vertical-align:top}th{background:#eee;font-size:11px}small{color:#666}</style><h1>Feuille de tournée · ${esc(fmtDate(d))}</h1><p>${esc(me?me.name+' · ID '+me.id:(S.settings.commercial||''))} · ${esc(S.settings.agency)}</p><table><tr><th>Heure</th><th>Commerce</th><th>Gérant vu</th><th>Démo montrée</th><th>Résultat</th><th>Prochaine action</th></tr>${rows.map(t=>t?`<tr><td>${esc(t.time)}</td><td>${esc(t.business)}</td><td>${esc(t.name||'')}</td><td>${esc((DEMO_BY_ID[t.demo]||{}).name||'')}</td><td>${esc(t.res||'')}</td><td>${esc(t.next||'')}</td></tr>`:'<tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>').join('')}</table><p style="margin-top:8px"><small>A : démo vue et 2e rendez-vous fixé · B : intéressé, à relancer · C : refus poli</small></p>`;
  const f=document.createElement('iframe');f.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0';document.body.appendChild(f);
  f.contentDocument.open();f.contentDocument.write(h);f.contentDocument.close();
  setTimeout(()=>{try{f.contentWindow.focus();f.contentWindow.print()}catch(e){toast('Impression indisponible')}setTimeout(()=>f.remove(),4000)},300);
}
function editTour(id,date,after){
  const t=id?S.tours.find(x=>x.id===id):null,now=new Date(),d=t?Object.assign({},t):{date,time:String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0'),business:'',name:'',demo:'',res:'',next:'',notes:''};
  const m=openModal(`<h3>${t?'Modifier la visite':'Nouvelle visite'}</h3>
  <div class="grid2"><label class="fld"><span>Heure</span><input class="inp" type="time" data-k="time" value="${esc(d.time)}"></label><label class="fld"><span>Commerce</span><input class="inp" data-k="business" value="${esc(d.business)}" placeholder="Nom du commerce"></label><label class="fld"><span>Gérant vu</span><input class="inp" data-k="name" value="${esc(d.name)}"></label><label class="fld"><span>Démo montrée</span><select class="sel" data-k="demo"><option value="">—</option>${DEMOS.map(x=>`<option value="${x.id}"${x.id===d.demo?' selected':''}>${esc(x.name)}</option>`).join('')}</select></label></div>
  <div class="fld"><span>Résultat</span><div class="seg" style="margin-top:0" id="rs">${Object.entries(RES).map(([k,v])=>`<button data-r="${k}" aria-pressed="${d.res===k}">${esc(v[0])}</button>`).join('')}</div></div>
  <label class="fld"><span>Prochaine action</span><input class="inp" data-k="next" value="${esc(d.next)}" placeholder="ex. Repasser jeudi 15 h"></label>
  ${t?'':`<label class="fld" style="grid-auto-flow:column;justify-content:start;gap:8px;align-items:center"><input type="checkbox" id="mkp" checked> <span>Créer aussi la fiche prospect</span></label>`}
  <div class="row" style="margin-top:18px"><button class="btn" data-save>Enregistrer</button>${t?`<button class="btn line" data-del>${ic('trash',18)} Supprimer</button>`:''}</div>`);
  m.addEventListener('click',e=>{const r=e.target.closest('[data-r]');if(r){d.res=d.res===r.dataset.r?'':r.dataset.r;$$('#rs button',m).forEach(b=>b.setAttribute('aria-pressed',b.dataset.r===d.res))}});
  $$('[data-k]',m).forEach(el=>el.addEventListener('input',()=>{d[el.dataset.k]=el.value}));
  $('[data-save]',m).onclick=()=>{
    if(!(d.business||'').trim()){toast('Indiquez le commerce');return}
    d.business=d.business.trim();
    if(t){Object.assign(t,d,{updatedAt:Date.now()})}
    else{
      const o=Object.assign({id:uid(),by:S.me||'',createdAt:Date.now(),updatedAt:Date.now()},d);S.tours.unshift(o);
      if($('#mkp',m)&&$('#mkp',m).checked&&!S.prospects.some(p=>(p.business||'').toLowerCase()===d.business.toLowerCase())){
        const p=addProspect({business:d.business,name:(d.name||'').trim(),status:d.res==='A'?'rdv2':'contacte',heat:d.res==='A'?'chaud':d.res==='C'?'froid':'tiede',viewed:d.demo?[d.demo]:[]});
        if(d.next)addNote(p.id,'Tournée : '+d.next);o.prospectId=p.id}
    }
    save();closeModal();toast('Visite enregistrée');after()};
  if(t)$('[data-del]',m).onclick=async()=>{if(await confirmBox('Supprimer cette visite ?','Supprimer')){tombstone('t',t.id);S.tours=S.tours.filter(x=>x.id!==t.id);save();closeModal();after()}};
}
function tTournee(box,redraw){
  if(!tourDate)tourDate=todayStr();
  const L=S.tours.filter(t=>t.date===tourDate).sort((a,b)=>a.time.localeCompare(b.time)),n=r=>L.filter(t=>t.res===r).length,me=S.me&&comById(S.me);
  box.innerHTML=`<div class="card" style="margin-top:12px"><div class="top"><div><h3>${me?esc(me.name):esc(S.settings.commercial||'Espace commercial')}</h3><p class="hint">${me?'Identifiant : <b>'+esc(me.id)+'</b>':'Connecté en tant que patron'}</p></div></div>
  <div class="row" style="margin-top:10px"><label class="fld" style="margin:0"><span>Jour</span><input class="inp" type="date" id="td" value="${esc(tourDate)}"></label><button class="btn" data-newt style="align-self:end">${ic('plus',18)} Visite</button></div></div>
  <div class="kpis"><div class="kpi"><b>${L.length}</b><span>Visites</span></div><div class="kpi"><b>${n('A')}</b><span>A · 2e RDV</span></div><div class="kpi"><b>${n('B')}</b><span>B · relance</span></div><div class="kpi"><b>${n('C')}</b><span>C · refus</span></div></div>
  <div class="list" style="margin-top:12px">${L.length?L.map(t=>`<button class="item" style="text-align:left" data-et="${t.id}"><div class="top"><div><h4>${esc(t.time)} · ${esc(t.business)}</h4><div class="meta">${esc(t.name||'')}${t.demo?' · '+esc((DEMO_BY_ID[t.demo]||{}).name||''):''}${t.next?' · '+esc(t.next):''}${t.by&&!me?' · '+esc(comName(t.by)):''}</div></div>${t.res?badge(RES[t.res][0],RES[t.res][1]):''}</div></button>`).join(''):'<p class="hint" style="margin-top:8px">Aucune visite notée ce jour-là. Touchez « Visite » après chaque commerce.</p>'}</div>
  <div class="row" style="margin-top:14px"><button class="btn line" data-tcp>${ic('copy',18)} Copier</button><button class="btn line" data-tsh>${ic('share',18)} Envoyer</button><button class="btn line" data-tpr>${ic('file',18)} Imprimer</button></div>`;
  $('#td',box).onchange=e=>{tourDate=e.target.value||todayStr();redraw()};
  box.onclick=e=>{
    if(e.target.closest('[data-newt]')){editTour('',tourDate,redraw);return}
    const o=e.target.closest('[data-et]');if(o){editTour(o.dataset.et,tourDate,redraw);return}
    if(e.target.closest('[data-tcp]'))copyText(tourText(tourDate),'Feuille copiée');
    if(e.target.closest('[data-tsh]'))shareText('Feuille de tournée',tourText(tourDate));
    if(e.target.closest('[data-tpr]'))printTour(tourDate)};
}
/* --- aperçu --- */
function tApercu(box,redraw){
  const up=upcoming(),open=S.quotes.filter(q=>['brouillon','envoye'].includes(q.status)),won=S.quotes.filter(q=>q.status==='accepte');
  const sum=a=>a.reduce((t,q)=>t+calcQuote(q).total,0),hot=S.prospects.filter(p=>p.heat==='chaud'&&!['signe','perdu'].includes(p.status)).length;
  const va=viewsAll(),views=Object.entries(va).sort((a,b)=>b[1]-a[1]).slice(0,6),mx=views.length?views[0][1]:1;
  box.innerHTML=`<div class="kpis"><div class="kpi"><b>${S.prospects.length}</b><span>Prospects</span></div><div class="kpi"><b>${hot}</b><span>Prospects chauds</span></div><div class="kpi"><b>${up.length}</b><span>RDV à venir</span></div><div class="kpi"><b>${open.length}</b><span>Devis en cours · ${eur(sum(open))}</span></div></div>
  <div class="kpis" style="margin-top:10px"><div class="kpi"><b>${won.length}</b><span>Sites signés · ${eur(sum(won))}</span></div><div class="kpi"><b>${Object.values(va).reduce((a,b)=>a+b,0)}</b><span>Démos montrées</span></div><div class="kpi"><b>${eur(sales().filter(q=>q.paid).reduce((t,q)=>t+calcQuote(q).total,0))}</b><span>Encaissé</span></div><div class="kpi"><b>${eur(sales().filter(q=>!q.paid).reduce((t,q)=>t+calcQuote(q).total,0))}</b><span>À encaisser</span></div></div>
  <div class="card" style="margin-top:14px"><h3>Prochains rendez-vous</h3>${up.length?`<div class="list">${up.slice(0,5).map(a=>{const p=prospectById(a.prospectId)||{};return `<div class="item"><div class="top"><div><h4>${fmtDateS(a.date)} · ${fmtT(a.time)}</h4><div class="meta">${esc(prospectLabel(p))}${p.phone?' · '+esc(p.phone):''}</div></div>${badge(a.place||'','')}</div></div>`}).join('')}</div>`:'<p class="hint" style="margin-top:8px">Aucun rendez-vous prévu.</p>'}</div>
  <div class="card"><h3>Démos les plus montrées</h3>${views.length?views.map(([id,n])=>`<div class="bar"><span>${esc((DEMO_BY_ID[id]||{}).name||id)}</span><b>${n}</b><i style="width:${Math.max(4,n/mx*100)}%;grid-column:1/-1"></i></div>`).join(''):'<p class="hint" style="margin-top:8px">Aucune démo ouverte pour l\'instant.</p>'}</div>
  <div class="card"><h3>Quels métiers répondent le mieux ?</h3>${metierRank()}</div>
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
    $('[data-del]',m).onclick=async()=>{if(await confirmBox('Supprimer ce prospect, ses rendez-vous et ses devis ?','Supprimer')){S.appts.filter(a=>a.prospectId===p.id).forEach(a=>tombstone('a',a.id));S.quotes.filter(q=>q.prospectId===p.id).forEach(q=>tombstone('q',q.id));tombstone('p',p.id);S.prospects=S.prospects.filter(x=>x.id!==p.id);S.appts=S.appts.filter(a=>a.prospectId!==p.id);S.quotes=S.quotes.filter(q=>q.prospectId!==p.id);if(S.visit===p.id)S.visit=null;save();toast('Prospect supprimé');after&&after()}};
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
    const d=e.target.closest('[data-ad]');if(d){if(await confirmBox('Supprimer ce rendez-vous ?','Supprimer')){tombstone('a',d.dataset.ad);S.appts=S.appts.filter(a=>a.id!==d.dataset.ad);save();redraw()}return}
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
    const d=e.target.closest('[data-qd]');if(d){if(await confirmBox('Supprimer ce devis ?','Supprimer')){tombstone('q',d.dataset.qd);S.quotes=S.quotes.filter(q=>q.id!==d.dataset.qd);save();redraw()}}};
  box.onchange=e=>{const s=e.target.closest('[data-qs]');if(s){const q=quoteById(s.dataset.qs);q.status=s.value;q.updatedAt=Date.now();if(s.value==='accepte'&&!q.signedAt){q.signedAt=Date.now();q.commission=S.settings.commission;q.plan=S.settings.monthlyMin;q.paid=false;q.commissionPaid=false}const p=prospectById(q.prospectId);if(p&&s.value==='accepte')patchProspect(p.id,{status:'signe'});if(p&&s.value==='refuse')patchProspect(p.id,{status:'perdu'});save();toast('Statut mis à jour');redraw()}};
}
/* --- réglages --- */
function tReglages(box,redraw){
  const s=S.settings,fld=(l,k,v,t)=>`<label class="fld"><span>${l}</span><input class="inp" data-s="${k}" ${t?`type="${t}" inputmode="decimal"`:''} value="${esc(v)}"></label>`;
  box.innerHTML=`<div class="card" style="margin-top:12px"><h3>Votre agence</h3><p class="hint">Ces informations apparaissent sur l'accueil, l'offre et les devis.</p><div class="grid2">${fld('Nom de l\'agence','agency',s.agency)}${fld('Slogan','tagline',s.tagline)}${fld('Nom du commercial','commercial',s.commercial)}${fld('Téléphone','phone',s.phone,'tel')}${fld('E-mail','email',s.email,'email')}${fld('Ville','city',s.city)}</div></div>
  <div class="card"><h3>Tarifs</h3><div class="grid2">${fld('Prix tout compris, 1re année (€)','price',s.price,'number')}${fld('Mensuel dès la 2e année : minimum (€)','monthlyMin',s.monthlyMin,'number')}${fld('Mensuel dès la 2e année : maximum (€)','monthlyMax',s.monthlyMax,'number')}${fld('Commission du commercial par vente (€)','commission',s.commission,'number')}${fld('Délai de livraison','delay',s.delay)}</div>
  <h3 style="margin-top:18px">Prix des options</h3>${s.options.map(o=>`<label class="fld"><span>${esc(o.n)}${o.unit?' (par page)':''}</span><input class="inp" type="number" inputmode="decimal" data-o="${o.id}" value="${o.p}"></label>`).join('')}</div>
  <div class="card"><h3>Disponibilités pour les rendez-vous</h3><div class="lbl" style="margin-top:10px">Jours</div><div class="seg" id="wd">${[1,2,3,4,5,6,0].map(k=>`<button data-wd="${k}" aria-pressed="${s.rdv.days.includes(k)}">${DAYS_S[k]}</button>`).join('')}</div><div class="grid2"><label class="fld"><span>De</span><input class="inp" type="time" data-r="start" value="${s.rdv.start}"></label><label class="fld"><span>À</span><input class="inp" type="time" data-r="end" value="${s.rdv.end}"></label><label class="fld"><span>Durée d'un créneau</span><select class="sel" data-r="step">${[15,30,45,60].map(n=>`<option value="${n}"${+s.rdv.step===n?' selected':''}>${n} min</option>`).join('')}</select></label></div></div>
  <div class="card"><h3>Commerciaux (identifiants)</h3><p class="hint">Chaque commercial a un identifiant et un code personnels. Il se connecte dans Admin avec les deux. Ses visites, prospects et devis sont à son nom.</p><div id="coms">${(s.coms||[]).map(c=>`<div class="item" style="margin-top:8px"><div class="top"><div><h4>${esc(c.name)}</h4><div class="meta">ID <b>${esc(c.id)}</b> · code <b>${esc(c.code)}</b></div></div><button class="btn sm line" data-dc="${esc(c.id)}">${ic('trash',16)}</button></div></div>`).join('')||'<p class="hint">Aucun commercial pour l\'instant.</p>'}</div><div class="grid2"><label class="fld"><span>Prénom du commercial</span><input class="inp" id="cn" placeholder="ex. Nadir"></label><div style="align-self:end"><button class="btn line" data-addc style="margin-top:14px">${ic('plus',16)} Créer son identifiant</button></div></div></div>
  <div class="card"><h3>Code de l'espace admin</h3><div class="grid2"><label class="fld"><span>Nouveau code (4 chiffres ou plus)</span><input class="inp" id="np" type="password" inputmode="numeric" maxlength="12" autocomplete="off"></label><div style="align-self:end"><button class="btn line" data-pin style="margin-top:14px">Changer le code</button></div></div></div>`;
  box.oninput=e=>{const k=e.target.dataset;
    if(k.s){const t=e.target.type==='number';s[k.s]=t?(+e.target.value||0):e.target.value;s.updatedAt=Date.now();save()}
    if(k.o){const o=s.options.find(x=>x.id===k.o);o.p=+e.target.value||0;s.updatedAt=Date.now();save()}
    if(k.r){s.rdv[k.r]=e.target.value;s.updatedAt=Date.now();save()}};
  box.onchange=e=>{if(e.target.dataset.r==='step'){s.rdv.step=+e.target.value;s.updatedAt=Date.now();save()}};
  box.onclick=e=>{
    const w=e.target.closest('[data-wd]');if(w){const k=+w.dataset.wd,a=s.rdv.days;a.includes(k)?a.splice(a.indexOf(k),1):a.push(k);s.updatedAt=Date.now();save();w.setAttribute('aria-pressed',a.includes(k));return}
    const dc=e.target.closest('[data-dc]');if(dc){confirmBox('Supprimer cet identifiant ?','Supprimer').then(ok=>{if(ok){s.coms=s.coms.filter(c=>c.id!==dc.dataset.dc);s.updatedAt=Date.now();save();redraw()}});return}
    if(e.target.closest('[data-addc]')){const nm=($('#cn',box).value||'').trim();if(!nm){toast('Indiquez un prénom');return}
      const rnd=n=>String(Math.floor(Math.random()*Math.pow(10,n))).padStart(n,'0');let id;do{id='COM-'+rnd(4)}while((s.coms||[]).some(c=>c.id===id));
      s.coms=(s.coms||[]).concat([{id,name:nm,code:rnd(4)}]);s.updatedAt=Date.now();save();toast('Identifiant créé : '+id);redraw();return}
    if(e.target.closest('[data-pin]')){const v=$('#np',box).value;if(!/^\d{4,12}$/.test(v)){toast('Le code doit contenir 4 chiffres au minimum');return}s.pin=v;s.pinChanged=true;save();$('#np',box).value='';toast('Code modifié')}};
}
/* --- données --- */
function tDonnees(box,redraw){
  const size=Math.round(JSON.stringify(S).length/1024);
  box.innerHTML=syncCardHTML()+`<div class="card" style="margin-top:12px"><h3>Sauvegarde manuelle (secours)</h3><p class="hint">Sans synchronisation, les données restent sur le téléphone du commercial. Il touche <b>Envoyer la sauvegarde</b> (WhatsApp, message, e-mail), puis vous la collez ici dans <b>Importer</b>.</p>
  <div class="row" style="margin-top:12px"><button class="btn" data-sendj>${ic('share',18)} Envoyer la sauvegarde</button><button class="btn line" data-sendr>${ic('share',18)} Envoyer le résumé du jour</button></div></div>
  <div class="card"><h3>Importer</h3><p class="hint">Collez la sauvegarde reçue, ou choisissez le fichier. Les fiches déjà présentes sont mises à jour si elles sont plus récentes.</p><textarea class="txa" id="imp" placeholder='{"app":"vitrines-pro", …}'></textarea><div class="row" style="margin-top:10px"><button class="btn" data-imp>Importer</button><label class="btn line" style="cursor:pointer">Choisir un fichier<input type="file" id="impf" accept=".json,application/json,text/plain" hidden></label></div></div>
  <div class="card"><h3>Exporter</h3><div class="row" style="margin-top:10px"><button class="btn line" data-ej>${ic('download',18)} Sauvegarde (.json)</button><button class="btn line" data-cj>${ic('copy',18)} Copier la sauvegarde</button></div><div class="row" style="margin-top:10px"><button class="btn line" data-ecp>Prospects (.csv)</button><button class="btn line" data-ecr>RDV (.csv)</button><button class="btn line" data-ecq>Devis (.csv)</button></div></div>
  <div class="card"><h3>Utiliser sans internet</h3><p class="hint">Ouvrez l'application une première fois avec une connexion, puis ajoutez-la à l'écran d'accueil (menu du navigateur : « Ajouter à l'écran d'accueil » ou « Installer l'application »). Ensuite, elle fonctionne partout sans réseau : démos, devis, rendez-vous et prospects restent enregistrés sur le téléphone.</p></div>
  <div class="card"><h3>Stockage</h3><p class="hint">${S.prospects.length} prospects · ${S.appts.length} rendez-vous · ${S.quotes.length} devis · environ ${size} Ko sur ce téléphone.${storageOK?'':' <b style="color:var(--bad)">Stockage indisponible dans ce navigateur.</b>'}</p>
  <div class="row" style="margin-top:12px"><button class="btn line" data-reset style="color:var(--bad)">${ic('trash',18)} Tout effacer</button></div></div>`;
  const j=()=>JSON.stringify(exportObj(),null,1),stamp=ymd(new Date());
  const doImport=txt=>{try{const o=JSON.parse(txt);if(o.app!=='vitrines-pro')throw 0;const r=mergeIn(o);toast(`Importé : ${r.add} nouvelle${r.add>1?'s':''} fiche${r.add>1?'s':''}, ${r.upd} mise${r.upd>1?'s':''} à jour`);redraw()}catch(e){toast('Ce texte n\'est pas une sauvegarde valide')}};
  box.onclick=async e=>{
    if(syncClick(e,redraw))return;
    if(e.target.closest('[data-sendj]'))shareText('Sauvegarde Vitrines Pro',j());
    if(e.target.closest('[data-sendr]'))shareText('Résumé du jour',summaryText());
    if(e.target.closest('[data-ej]'))downloadFile('vitrines-pro-'+stamp+'.json','application/json',j());
    if(e.target.closest('[data-cj]'))copyText(j(),'Sauvegarde copiée');
    if(e.target.closest('[data-ecp]'))downloadFile('prospects-'+stamp+'.csv','text/csv',csvProspects());
    if(e.target.closest('[data-ecr]'))downloadFile('rdv-'+stamp+'.csv','text/csv',csvAppts());
    if(e.target.closest('[data-ecq]'))downloadFile('devis-'+stamp+'.csv','text/csv',csvQuotes());
    if(e.target.closest('[data-imp]'))doImport($('#imp',box).value);
    if(e.target.closest('[data-reset]')&&await confirmBox('Effacer tous les prospects, rendez-vous et devis de ce téléphone ? Si la synchronisation est active, ils reviendront à la prochaine synchronisation. Pensez à exporter avant.','Tout effacer')){const keep={settings:S.settings,sync:S.sync,deviceId:S.deviceId};S=defaults();Object.assign(S,keep);S.sync.pushed={};S.sync.last='1970-01-01T00:00:00Z';S.sync.tomb=[];save();toast('Données effacées');redraw()}};
  $('#impf',box).addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>doImport(String(r.result));r.readAsText(f)});
}

/* --- classement des métiers --- */
function metierRank(){
  const m={},get=k=>m[k]=m[k]||{n:0,dev:0,sig:0};
  S.prospects.forEach(p=>{get(p.metier||'Non précisé').n++});
  S.quotes.forEach(q=>{const p=prospectById(q.prospectId),r=get((p&&p.metier)||'Non précisé');r.dev++;if(q.status==='accepte')r.sig++});
  const rows=Object.entries(m).sort((a,b)=>b[1].sig-a[1].sig||b[1].dev-a[1].dev||b[1].n-a[1].n).slice(0,8);
  if(!rows.length)return '<p class="hint" style="margin-top:8px">Le classement apparaît dès que des prospects ont un métier renseigné.</p>';
  const mx=Math.max(1,...rows.map(r=>r[1].n));
  return rows.map(([k,r])=>`<div class="bar" style="grid-template-columns:minmax(0,1fr) auto"><span><b>${esc(k)}</b><br><small style="color:var(--muted)">${r.n} prospect${r.n>1?'s':''} · ${r.dev} devis · ${r.sig} signé${r.sig>1?'s':''}${r.n?' · '+Math.round(r.sig/r.n*100)+' % de conversion':''}</small></span><i style="width:${Math.max(6,r.n/mx*100)}px;grid-column:auto"></i></div>`).join('');
}
/* --- ventes : paiements, commissions, renouvellements --- */
const sales=()=>S.quotes.filter(q=>q.status==='accepte').sort((a,b)=>(b.signedAt||0)-(a.signedAt||0));
const renewalOf=q=>{const d=new Date(q.signedAt||q.createdAt);d.setFullYear(d.getFullYear()+1);return d};
const daysTo=d=>Math.round((d.getTime()-Date.now())/86400000);
function relanceText(q){
  const p=prospectById(q.prospectId)||{},s=S.settings;
  return `Bonjour${p.name?' '+p.name.split(' ')[0]:''}, c'est ${s.commercial||s.agency}${s.commercial?' de '+s.agency:''}. Votre site est prêt : il reste à régler ${eur(calcQuote(q).total)} (tout compris la première année : hébergement, maintenance et modifications). Je peux passer quand vous voulez. Merci !`;
}
function tVentes(box,redraw){
  const L=sales(),tot=q=>calcQuote(q).total;
  const due=L.filter(q=>!q.paid),got=L.filter(q=>q.paid);
  const cDue=L.filter(q=>!q.commissionPaid).reduce((t,q)=>t+(+q.commission||0),0),cPaid=L.filter(q=>q.commissionPaid).reduce((t,q)=>t+(+q.commission||0),0);
  const mrr=L.reduce((t,q)=>t+(+q.plan||0),0);
  const nm=q=>prospectLabel(prospectById(q.prospectId));
  if(!L.length){box.innerHTML=`<div class="empty" style="margin-top:12px">Aucune vente pour l'instant. Passez un devis en « Accepté » dans l'onglet Devis : il apparaît ici avec le paiement, la commission et le renouvellement.</div>`;return}
  const ren=L.slice().sort((a,b)=>renewalOf(a)-renewalOf(b));
  box.innerHTML=`<div class="kpis"><div class="kpi"><b>${eur(got.reduce((t,q)=>t+tot(q),0))}</b><span>Encaissé</span></div><div class="kpi"><b>${eur(due.reduce((t,q)=>t+tot(q),0))}</b><span>À encaisser</span></div><div class="kpi"><b>${eur(cDue)}</b><span>Commissions à payer</span></div><div class="kpi"><b>${eur(mrr)}</b><span>Revenu mensuel prévu dès l'an 2</span></div></div>
  <div class="card" style="margin-top:14px"><h3>Paiements</h3><p class="hint">590 € reçu ou non, et relances.</p><div class="list">${L.map(q=>`<div class="item"><div class="top"><div><h4>${esc(nm(q))} · ${eur(tot(q))}</h4><div class="meta">Signé le ${fmtDT(q.signedAt||q.createdAt).slice(0,5)}${q.paid?' · payé le '+fmtDT(q.paidAt).slice(0,5):''}${q.relances?' · relancé '+q.relances+' fois (dernière le '+fmtDT(q.lastRelance).slice(0,5)+')':''}</div></div>${q.paid?badge('Payé','ok'):badge('À encaisser','warn')}</div><div class="row">${q.paid?`<button class="btn sm line" data-unpay="${q.id}">Annuler le paiement</button>`:`<button class="btn sm" data-pay="${q.id}">${ic('check',16)} Marquer payé</button><button class="btn sm line" data-rel="${q.id}">${ic('share',16)} Relancer</button>`}</div></div>`).join('')}</div></div>
  <div class="card"><h3>Commissions du commercial</h3><p class="hint">${eur(cDue)} à payer · ${eur(cPaid)} déjà payé.</p><div class="list">${L.map(q=>`<div class="item"><div class="top"><div><h4>${esc(nm(q))}</h4><div class="meta">Vente de ${eur(tot(q))}</div></div>${q.commissionPaid?badge('Payée','ok'):badge('À payer','warn')}</div><div class="row" style="align-items:center"><label class="fld" style="margin:0;flex:1;min-width:120px"><span>Commission (€)</span><input class="inp" type="number" inputmode="decimal" data-com="${q.id}" value="${+q.commission||0}"></label><button class="btn sm ${q.commissionPaid?'line':''}" data-cp="${q.id}" style="margin-top:20px">${q.commissionPaid?'Marquer à payer':'Marquer payée'}</button></div></div>`).join('')}</div><div class="row" style="margin-top:12px"><button class="btn sm line" data-ccopy>${ic('copy',16)} Copier le récapitulatif</button></div></div>
  <div class="card"><h3>Renouvellements de 2e année</h3><p class="hint">Un an après la signature, passage au forfait mensuel de ${eur(S.settings.monthlyMin)} à ${eur(S.settings.monthlyMax)}.</p><div class="list">${ren.map(q=>{const d=renewalOf(q),n=daysTo(d);return `<div class="item"><div class="top"><div><h4>${esc(nm(q))}</h4><div class="meta">Renouvellement le ${fmtDate(ymd(d))}</div></div>${n<0?badge('Dépassé','bad'):n<=60?badge('Dans '+n+' j','warn'):badge('Dans '+n+' j','')}</div><div class="row" style="align-items:center"><label class="fld" style="margin:0;flex:1;min-width:120px"><span>Forfait mensuel (€)</span><input class="inp" type="number" inputmode="decimal" data-plan="${q.id}" value="${+q.plan||S.settings.monthlyMin}"></label><button class="btn sm line" data-pl="${q.id}" data-v="${S.settings.monthlyMin}" style="margin-top:20px">Essentiel ${eur(S.settings.monthlyMin)}</button><button class="btn sm line" data-pl="${q.id}" data-v="${S.settings.monthlyMax}" style="margin-top:20px">Évolution ${eur(S.settings.monthlyMax)}</button></div></div>`}).join('')}</div></div>`;
  const touch=q=>{q.updatedAt=Date.now();save()};
  box.onclick=e=>{
    const pay=e.target.closest('[data-pay]');if(pay){const q=quoteById(pay.dataset.pay);q.paid=true;q.paidAt=Date.now();touch(q);const p=prospectById(q.prospectId);if(p)patchProspect(p.id,{status:'signe'});toast('Paiement enregistré');redraw();return}
    const un=e.target.closest('[data-unpay]');if(un){const q=quoteById(un.dataset.unpay);q.paid=false;touch(q);redraw();return}
    const rel=e.target.closest('[data-rel]');if(rel){const q=quoteById(rel.dataset.rel);q.relances=(q.relances||0)+1;q.lastRelance=Date.now();touch(q);addNote(q.prospectId,'Relance de paiement n°'+q.relances);shareText('Relance de paiement',relanceText(q));redraw();return}
    const cp=e.target.closest('[data-cp]');if(cp){const q=quoteById(cp.dataset.cp);q.commissionPaid=!q.commissionPaid;touch(q);redraw();return}
    const pl=e.target.closest('[data-pl]');if(pl){const q=quoteById(pl.dataset.pl);q.plan=+pl.dataset.v;touch(q);redraw();return}
    if(e.target.closest('[data-ccopy]')){copyText('COMMISSIONS · '+S.settings.agency+'\n'+L.map(q=>'• '+nm(q)+' : '+eur(+q.commission||0)+(q.commissionPaid?' (payée)':' (à payer)')).join('\n')+'\n\nÀ payer : '+eur(cDue)+'\nDéjà payé : '+eur(cPaid),'Récapitulatif copié')}};
  box.onchange=e=>{
    const c=e.target.closest('[data-com]');if(c){const q=quoteById(c.dataset.com);q.commission=+c.value||0;touch(q);redraw();return}
    const p=e.target.closest('[data-plan]');if(p){const q=quoteById(p.dataset.plan);q.plan=+p.value||0;touch(q);redraw()}};
}

/* --- synchronisation : carte, réglage, guide --- */
function syncCardHTML(){
  if(!syncOn())return `<div class="card" style="margin-top:12px"><h3>Synchronisation en direct</h3><p class="hint">Les notes du commercial arrivent sur ton téléphone dès qu'il y a du réseau. Sans réseau, tout est gardé et envoyé plus tard. Il faut un projet Firebase gratuit (5 minutes).</p><div class="row" style="margin-top:12px"><button class="btn" data-sync-setup>${ic('share',18)} Configurer</button><button class="btn line" data-sync-guide>Voir le guide</button></div>${S.sync.cfg.pid?`<p class="hint" style="margin-top:10px">Configuration enregistrée mais désactivée.</p>`:''}</div>`;
  const pend=syncPending();
  return `<div class="card" style="margin-top:12px"><h3>Synchronisation en direct</h3><p style="margin-top:6px"><span class="badge ${S.sync.err?'bad':'ok'}" data-syncst>${esc(syncLabel())}</span></p><p class="hint" style="margin-top:8px">${pend?pend+' modification'+(pend>1?'s':'')+' en attente d\'envoi.':'Tout est à jour.'} Projet : ${esc(S.sync.cfg.pid)}.</p>
  <div class="row" style="margin-top:12px"><button class="btn" data-sync-now>Synchroniser maintenant</button><button class="btn line" data-sync-setup>Modifier</button><button class="btn line" data-sync-off>Désactiver</button></div>
  <h3 style="margin-top:20px;font-size:15px">Connecter le téléphone du commercial</h3><p class="hint">Sur son téléphone, ouvrez l'appli, collez le lien ou le code ci-dessous, et tout se règle tout seul.</p>
  <div class="row" style="margin-top:10px"><button class="btn line" data-sync-link>${ic('copy',18)} Copier le lien</button><button class="btn line" data-sync-code>${ic('copy',18)} Copier le code</button></div></div>`;
}
function syncClick(e,redraw){
  if(e.target.closest('[data-sync-setup]')){syncSetupModal(redraw);return true}
  if(e.target.closest('[data-sync-guide]')){syncGuideModal();return true}
  if(e.target.closest('[data-sync-now]')){toast('Synchronisation…');syncNow().then(()=>{toast(S.sync.err?'Échec : '+S.sync.err:'Synchronisé');redraw()});return true}
  if(e.target.closest('[data-sync-off]')){S.sync.on=false;saveQuiet();toast('Synchronisation désactivée');redraw();return true}
  if(e.target.closest('[data-sync-code]')){copyText(joinCode(),'Code copié');return true}
  if(e.target.closest('[data-sync-link]')){const base=location.href.split('#')[0];copyText(base+'#/join/'+joinCode(),'Lien copié : à envoyer au commercial');return true}
  return false;
}
function syncGuideModal(){
  const m=openModal(`<h3>Guide Firebase en 5 étapes</h3><ol style="padding-left:20px;line-height:1.6">
  <li>Allez sur <b>console.firebase.google.com</b> avec un compte Google, puis « Ajouter un projet » (nom libre, sans Google Analytics).</li>
  <li>Menu « Build », puis <b>Firestore Database</b>, « Créer une base de données ». Choisissez le <b>mode production</b> et une région en Europe.</li>
  <li>Onglet <b>Règles</b> : remplacez tout par le texte ci-dessous, puis « Publier ».</li>
  <li>Roue dentée, <b>Paramètres du projet</b>, onglet Général, « Vos applications », icône <b>&lt;/&gt;</b> (Web). Donnez un nom, puis relevez <b>apiKey</b> et <b>projectId</b>.</li>
  <li>Dans l'appli : Admin, Données, <b>Configurer</b>. Collez ces deux valeurs et gardez le code d'équipe proposé.</li></ol>
  <pre style="background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px;white-space:pre-wrap;font-size:13px">${esc(FIRESTORE_RULES)}</pre>
  <div class="row" style="margin-top:12px"><button class="btn" data-cr>${ic('copy',18)} Copier les règles</button></div>
  <p class="hint" style="margin-top:12px">Ne choisissez pas le « mode test » : il expire au bout de 30 jours. Le code d'équipe sert de mot de passe : ne le partagez qu'avec le commercial.</p>`);
  $('[data-cr]',m).onclick=()=>copyText(FIRESTORE_RULES,'Règles copiées');
}
function syncSetupModal(after){
  const c=S.sync.cfg,f={pid:c.pid||'',key:c.key||'',team:c.team||newTeamCode()};
  const m=openModal(`<h3>Synchronisation en direct</h3><p class="hint" style="margin-top:6px">Collez les deux valeurs de votre projet Firebase.</p><button class="btn sm line" data-guide style="margin-top:10px">Voir le guide en 5 étapes</button>
  <label class="fld"><span>Identifiant du projet (projectId)</span><input class="inp" data-f="pid" value="${esc(f.pid)}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="mon-projet-1a2b3"></label>
  <label class="fld"><span>Clé API (apiKey)</span><input class="inp" data-f="key" value="${esc(f.key)}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="AIza…"></label>
  <label class="fld"><span>Code d'équipe (secret partagé)</span><input class="inp" data-f="team" value="${esc(f.team)}" autocomplete="off" autocapitalize="off" spellcheck="false"></label>
  <p class="hint" style="margin-top:6px">Ce code ouvre l'accès aux notes : gardez-le confidentiel.</p>
  <div class="row" style="margin-top:16px"><button class="btn" data-go2>Connecter</button></div><p class="hint" id="sst" style="margin-top:10px"></p>`);
  $$('[data-f]',m).forEach(el=>el.addEventListener('input',()=>{f[el.dataset.f]=el.value.trim()}));
  $('[data-guide]',m).onclick=()=>{closeModal();syncGuideModal()};
  $('[data-go2]',m).onclick=async()=>{
    if(!f.pid||!f.key||f.team.length<8){$('#sst',m).textContent='Renseignez les trois champs (code d\'équipe : 8 caractères minimum).';return}
    $('#sst',m).textContent='Connexion…';await syncConnect({pid:f.pid,key:f.key,team:f.team,host:c.host||''});
    if(S.sync.err){$('#sst',m).textContent='Échec : '+S.sync.err;return}
    closeModal();toast('Connecté : synchronisation active');after&&after()};
}
