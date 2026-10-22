/* ===== Pages : accueil, offre, devis, rendez-vous ===== */
const METIERS=DEMOS.map(d=>d.metier).concat(['Autre']);
const waHref=p=>{let d=String(p||'').replace(/\D/g,'');if(d.startsWith('0'))d='33'+d.slice(1);return 'https://wa.me/'+d};
const badge=(label,cls)=>`<span class="badge ${cls||''}">${esc(label)}</span>`;
const statusBadge=s=>{const x=STATUS[s]||[s,''];return badge(x[0],x[1])};
const heatDot=h=>`<span class="dotc" style="background:${(HEAT[h]||['','#999'])[1]}" title="${esc((HEAT[h]||[h])[0])}"></span>`;
const markSVG=`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18L12 5l8 13M8 13h8"/></svg>`;

/* --- sélecteur de prospect partagé (devis, rdv) --- */
const ppBlank=()=>({id:'',business:'',name:'',phone:'',email:'',address:'',metier:''});
function ppInit(id){const P=ppBlank();const p=id&&prospectById(id);if(p)Object.assign(P,{id:p.id,business:p.business||'',name:p.name||'',phone:p.phone||'',email:p.email||'',address:p.address||'',metier:p.metier||''});return P}
function ppHTML(P){
  return `<label class="fld" style="margin-top:0"><span>Prospect enregistré</span><select class="sel" data-pp="sel"><option value="">+ Nouveau prospect</option>${S.prospects.map(p=>`<option value="${p.id}"${p.id===P.id?' selected':''}>${esc(prospectLabel(p))}</option>`).join('')}</select></label>
  <div class="grid2"><label class="fld req"><span>Nom du commerce</span><input class="inp" data-pp="business" value="${esc(P.business)}" placeholder="Ex. Boulangerie Martin" autocomplete="off"></label>
  <label class="fld"><span>Contact (gérant)</span><input class="inp" data-pp="name" value="${esc(P.name)}" placeholder="Prénom Nom" autocomplete="off"></label>
  <label class="fld"><span>Téléphone</span><input class="inp" data-pp="phone" type="tel" inputmode="tel" value="${esc(P.phone)}" placeholder="06 00 00 00 00"></label>
  <label class="fld"><span>E-mail</span><input class="inp" data-pp="email" type="email" inputmode="email" value="${esc(P.email)}" placeholder="contact@commerce.fr"></label>
  <label class="fld"><span>Adresse ou ville</span><input class="inp" data-pp="address" value="${esc(P.address)}" placeholder="12 rue des Lilas"></label>
  <label class="fld"><span>Métier</span><select class="sel" data-pp="metier"><option value="">—</option>${METIERS.map(m=>`<option${m===P.metier?' selected':''}>${esc(m)}</option>`).join('')}</select></label></div>`;
}
function ppBind(root,P,redraw){
  root.addEventListener('input',e=>{const k=e.target.dataset&&e.target.dataset.pp;if(!k||k==='sel')return;P[k]=e.target.value});
  root.addEventListener('change',e=>{const k=e.target.dataset&&e.target.dataset.pp;if(k!=='sel')return;
    const p=prospectById(e.target.value);Object.assign(P,p?{id:p.id,business:p.business||'',name:p.name||'',phone:p.phone||'',email:p.email||'',address:p.address||'',metier:p.metier||''}:ppBlank());redraw()});
}
function ppValid(P){return !!(P.business.trim()||P.name.trim())}
function ppCommit(P){
  const data={business:P.business.trim(),name:P.name.trim(),phone:P.phone.trim(),email:P.email.trim(),address:P.address.trim(),metier:P.metier};
  if(P.id&&prospectById(P.id)){patchProspect(P.id,data);return prospectById(P.id)}
  const p=addProspect(data);P.id=p.id;return p;
}
function bumpStatus(p,to){const order=['nouveau','contacte','rdv2','devis','signe'];if(STATUS[p.status]&&order.indexOf(p.status)<order.indexOf(to)&&p.status!=='perdu')patchProspect(p.id,{status:to})}

/* --- accueil --- */
let homeCat='all',homeQ='';
function demoCards(){
  const vp=S.visit&&prospectById(S.visit),seen=new Set(vp?vp.viewed||[]:[]);
  const q=homeQ.trim().toLowerCase();
  const list=DEMOS.filter(d=>(homeCat==='all'||d.cat===homeCat)&&(!q||(d.name+' '+d.metier).toLowerCase().includes(q)));
  if(!list.length)return `<div class="empty" style="grid-column:1/-1">Aucune démo ne correspond. Essayez un autre mot.</div>`;
  return list.map(d=>`<button class="dcard" data-go="/demo/${d.id}" aria-label="${esc(d.name)}, ${esc(d.metier)}">${img(d.cover,'',d.name)}<span class="sw"><i style="background:${d.theme.vars.accent}"></i><i style="background:${d.theme.vars.accent2}"></i></span>${seen.has(d.id)?'<span class="seen">Vue</span>':''}<span class="tx"><b>${esc(d.name)}</b><small>${esc(d.metier)}</small></span></button>`).join('');
}
function pageHome(){
  const s=S.settings,vp=S.visit&&prospectById(S.visit);
  const html=`<section class="hero-home"><div class="page gut"><div class="eyebrow">Portfolio · ${DEMOS.length} démos</div>
  <h1>Votre commerce, <em>en ligne,</em> sans rien payer d'avance.</h1>
  <p class="sub">${esc(s.tagline||'')} Parcourez des exemples de sites prêts à être adaptés à votre commerce : vos photos, vos horaires, vos prix.</p>
  <div class="row" style="margin-top:22px"><button class="btn sun" data-scrollto="#demos">Parcourir les démos ${ic('arrow',18)}</button><button class="btn ghost" data-go="/offre">Notre offre</button></div>
  <div class="stats-line"><span>0 € avant de voir votre site</span><span>${eur(s.price)} paiement unique</span><span>Prêt en ${esc(s.delay)}</span></div></div></section>
  <div class="page gut"><div class="sec">${vp?`<div class="card" style="border-color:#f1d98b;background:#fff9e6"><h3>Visite en cours : ${esc(prospectLabel(vp))}</h3><p class="hint">${(vp.viewed||[]).length} démo${(vp.viewed||[]).length>1?'s':''} montrée${(vp.viewed||[]).length>1?'s':''} à ce prospect. Elles sont enregistrées dans sa fiche.</p><div class="row" style="margin-top:12px"><button class="btn sm" data-go="/rdv?prospect=${vp.id}">Fixer un 2e RDV</button><button class="btn sm line" data-go="/devis?prospect=${vp.id}">Devis sur mesure</button><button class="btn sm line" data-endvisit>Terminer la visite</button></div></div>`
   :`<div class="card"><h3>Vous êtes chez un commerçant ?</h3><p class="hint">Démarrez une visite : les démos que vous lui montrez sont automatiquement notées dans sa fiche.</p><div style="margin-top:12px"><button class="btn sm" data-startvisit>${ic('plus',16)} Démarrer une visite</button></div></div>`}</div>
  <div class="sec" id="demos"><h2>Choisissez une démo</h2><p class="lead">Touchez un commerce pour parcourir son site comme le ferait un client.</p>
  <div class="search">${ic('search',20)}<input class="inp" id="hq" type="search" placeholder="Boulangerie, coiffeur, garage…" value="${esc(homeQ)}" style="padding-left:44px" aria-label="Rechercher un métier"></div>
  <div class="chips" id="hcats">${CATS.map(c=>`<button class="chip" data-cat="${c[0]}" aria-pressed="${homeCat===c[0]}">${esc(c[1])}</button>`).join('')}</div>
  <div class="cards" id="hgrid">${demoCards()}</div></div>
  <div class="promo"><h3>Et si c'était votre site ?</h3><p>On crée votre site avant que vous ne payiez quoi que ce soit. Vous le découvrez, et vous ne réglez ${eur(s.price)} que s'il vous plaît.</p><div class="row"><button class="btn sun" data-go="/devis">Devis sur mesure</button><button class="btn ghost" data-go="/rdv">Prendre un 2e RDV</button></div></div>
  <p class="legal-note">Les noms, photos, prix et avis des démos sont des exemples fictifs.</p></div>`;
  return{html,init(root){
    $('#hq',root).addEventListener('input',e=>{homeQ=e.target.value;$('#hgrid',root).innerHTML=demoCards()});
    $('#hcats',root).addEventListener('click',e=>{const b=e.target.closest('[data-cat]');if(!b)return;homeCat=b.dataset.cat;$$('#hcats .chip',root).forEach(c=>c.setAttribute('aria-pressed',c===b));$('#hgrid',root).innerHTML=demoCards()});
  }};
}
function startVisitModal(){
  const P=ppBlank(),m=openModal(`<h3>Démarrer une visite</h3><p class="hint" style="margin-top:6px">Notez le commerce : vous pourrez compléter la fiche plus tard.</p><div id="vf" style="margin-top:6px"></div><div class="row" style="margin-top:18px"><button class="btn" data-ok>Commencer</button><button class="btn line" data-x>Annuler</button></div>`);
  const box=$('#vf',m),draw=()=>{box.innerHTML=ppHTML(P)};draw();ppBind(box,P,draw);
  $('[data-ok]',m).onclick=()=>{if(!ppValid(P)){toast('Indiquez au moins le nom du commerce');return}const p=ppCommit(P);S.visit=p.id;save();closeModal();toast('Visite démarrée : '+prospectLabel(p));render()};
}

/* --- offre / plaquette --- */
function pageOffre(){
  const s=S.settings;
  const html=`<div class="page gut"><div class="pagehead"><div class="eyebrow" style="color:var(--blue)">Notre offre</div><h1>Votre site internet, prêt avant que vous payiez.</h1><p>Nous créons votre site avec vos photos, vos horaires et vos prix. Vous le découvrez, vous demandez des ajustements, et vous ne payez que s'il vous plaît.</p></div>
  <div class="offer-hero"><div class="big">${eur(s.price)}<small>paiement unique, une fois votre site validé</small></div><div class="row" style="margin-top:18px"><span class="badge" style="background:var(--sun);color:#1b1500;font-size:14px;padding:6px 14px">0 € avant d'avoir vu votre site</span></div>
  <p style="margin-top:16px;opacity:.92">${s.firstYear?'Première année d\'hébergement et de nom de domaine incluse. ':''}Ensuite ${eur(s.monthly)} par mois pour l'hébergement, la sécurité et les petites modifications.</p>
  <div class="row" style="margin-top:18px"><button class="btn sun" data-go="/devis">Devis sur mesure</button><button class="btn ghost" data-go="/rdv">Prendre un 2e RDV</button></div></div>
  <div class="sec"><h2>Comment ça se passe</h2><div class="steps3"><div class="st"><b class="n">1</b><h3>On crée votre site</h3><p class="hint">À partir de vos infos et de vos photos. Cela ne vous coûte rien.</p></div><div class="st"><b class="n">2</b><h3>Vous le découvrez</h3><p class="hint">Nous vous le présentons sur votre téléphone. On ajuste ce que vous voulez changer.</p></div><div class="st"><b class="n">3</b><h3>Il vous plaît, il est à vous</h3><p class="hint">Paiement unique, mise en ligne en ${esc(s.delay)}, et vous recevez votre accès pour le modifier.</p></div></div></div>
  <div class="sec"><h2>Ce qui est inclus</h2><div class="card"><ul class="check">${['Site sur mesure, adapté au téléphone, à la tablette et à l\'ordinateur','Vos photos, vos horaires, vos prix et vos coordonnées','Horaires « ouvert maintenant » mis à jour en direct','Boutons appeler, itinéraire et réseaux sociaux en un clic','Mentions légales et page de confidentialité','Mise en ligne, nom de domaine en .fr et certificat de sécurité','Un espace administrateur pour modifier textes, photos et prix','Une retouche gratuite après la mise en ligne'].map(t=>`<li>${ic('check',20)}<span>${esc(t)}</span></li>`).join('')}</ul></div></div>
  <div class="sec"><h2>Options à la carte</h2><p class="lead">Ajoutez seulement ce dont vous avez besoin.</p><div class="card"><table class="tb"><tbody>${s.options.map(o=>`<tr><td>${esc(o.n)}</td><td style="text-align:right;font-weight:700;white-space:nowrap">${o.unit?'':'+ '}${eur(o.p)}${o.unit?' / page':''}</td></tr>`).join('')}</tbody></table></div></div>
  <div class="sec"><h2>Ce que ça change pour vous</h2><div class="card"><ul class="check">${['Vos clients vous trouvent sur Google, de jour comme de nuit','Ils voient vos horaires, vos prix et vos photos avant de venir','Ils réservent ou commandent sans vous déranger','Vous avez un site propre à montrer, sur vos cartes et vos réseaux'].map(t=>`<li>${ic('check',20)}<span>${esc(t)}</span></li>`).join('')}</ul></div></div>
  <div class="sec faqs"><h2>Questions fréquentes</h2>
   <details><summary>Dois-je payer pour voir mon site ?</summary><p>Non. Nous préparons votre site avant tout paiement. Vous ne réglez qu'une fois satisfait.</p></details>
   <details><summary>Le site m'appartient-il ?</summary><p>Oui. Une fois le paiement unique effectué, le site et son contenu sont à vous. Le nom de domaine est enregistré à votre nom.</p></details>
   <details><summary>Que comprend l'abonnement mensuel ?</summary><p>L'hébergement, la sécurité, les sauvegardes et les petites modifications (horaires, prix, photos). Il est sans engagement de durée.</p></details>
   <details><summary>Combien de temps pour mettre le site en ligne ?</summary><p>${esc(s.delay)} après validation du site et réception de vos photos et informations.</p></details>
   <details><summary>Puis-je modifier mon site moi-même ?</summary><p>Oui, grâce à votre espace administrateur. Et si vous préférez, vous nous envoyez un message et on s'en occupe.</p></details></div>
  <div class="promo"><h3>On en parle ?</h3><p>${s.commercial?esc(s.commercial)+' est votre interlocuteur. ':''}${s.phone?'Appelez-nous au '+esc(s.phone)+' ou ':''}fixez un rendez-vous pour découvrir votre site sur mesure.</p><div class="row"><button class="btn sun" data-go="/rdv">Prendre un 2e RDV</button><button class="btn ghost" data-go="/devis">Devis sur mesure</button></div></div></div>`;
  return{html};
}

/* --- devis sur mesure --- */
function pageDevis(qs){
  const params=new URLSearchParams(qs||''),P=ppInit(params.get('prospect')||S.visit||'');
  const f={demo:params.get('demo')||'',type:0,opts:new Set(),pages:0,discount:'',custom:'',delay:S.settings.delay,budget:'',notes:'',saved:null};
  const TYPES=[['Site vitrine',[]],['Vitrine + réservation',['resa']],['Boutique et commande',['shop']],['Sur mesure',[]]];
  const html='<div class="page gut"><div class="narrow" id="dv"></div></div>';
  return{html,init(root){
    const box=$('#dv',root);
    const cq=()=>calcQuote({opts:[...f.opts],pages:f.pages,discount:+f.discount||0,custom:f.custom});
    const optsSel=()=>S.settings.options.filter(o=>!o.unit);
    function totalsBar(){const c=cq();return `<div class="sticky-total"><div><small>Total · paiement unique</small><b>${eur(c.total)}</b><small>puis ${eur(c.monthly)}/mois</small></div><button class="btn sun" data-save>Enregistrer le devis</button></div>`}
    function draw(){
      if(f.saved){done();return}
      const c=cq();
      box.innerHTML=`<div class="pagehead"><button class="back" data-go="${f.demo?'/demo/'+f.demo:'/'}">${ic('left',16)} Retour</button><h1>Devis sur mesure</h1><p>Prenez les infos du prospect et composez son site. Le prix se calcule tout seul.</p></div>
      <div class="card"><h3>1. Le prospect</h3><div id="pp" style="margin-top:8px">${ppHTML(P)}</div></div>
      <div class="card"><h3>2. Le type de site</h3><div class="seg" id="ty">${TYPES.map((t,i)=>`<button data-t="${i}" aria-pressed="${f.type===i}">${esc(t[0])}</button>`).join('')}</div>
        <label class="fld"><span>Démo qui lui a plu</span><select class="sel" data-f="demo"><option value="">—</option>${DEMOS.map(d=>`<option value="${d.id}"${d.id===f.demo?' selected':''}>${esc(d.name)} · ${esc(d.metier)}</option>`).join('')}</select></label></div>
      <div class="card"><h3>3. Les options</h3><div>${optsSel().map(o=>`<button class="opt" data-o="${o.id}" aria-pressed="${f.opts.has(o.id)}"><span class="box">${ic('check',14)}</span><b>${esc(o.n)}</b><span class="pp">+ ${eur(o.p)}</span></button>`).join('')}</div>
        <div class="opt" style="cursor:default"><span style="flex:1"><b>Pages supplémentaires</b><small>${eur(optPrice('page'))} par page au-delà de 5</small></span><span class="row" style="flex-wrap:nowrap;align-items:center;gap:8px"><button class="btn sm line" data-pg="-1" aria-label="Moins">−</button><b style="min-width:20px;text-align:center">${f.pages}</b><button class="btn sm line" data-pg="1" aria-label="Plus">+</button></span></div></div>
      <div class="card"><h3>4. Délai, budget, notes</h3><div class="grid2"><label class="fld"><span>Délai de livraison</span><input class="inp" data-f="delay" value="${esc(f.delay)}"></label><label class="fld"><span>Budget évoqué par le client</span><input class="inp" data-f="budget" value="${esc(f.budget)}" placeholder="Ex. 300 à 400 €"></label></div>
        <label class="fld"><span>Notes</span><textarea class="txa" data-f="notes" placeholder="Ce qu'il veut, ce qui l'a convaincu, ses objections…">${esc(f.notes)}</textarea></label></div>
      <div class="card"><h3>5. Le tarif</h3><table class="tb" style="margin-top:8px"><tbody>${c.lines.map(l=>`<tr><td>${esc(l[0])}</td><td style="text-align:right;white-space:nowrap">${eur(l[1])}</td></tr>`).join('')}</tbody></table>
        <div class="grid2"><label class="fld"><span>Remise (€)</span><input class="inp" data-f="discount" type="number" inputmode="decimal" min="0" value="${esc(f.discount)}" placeholder="0"></label><label class="fld"><span>Ou tarif imposé (€)</span><input class="inp" data-f="custom" type="number" inputmode="decimal" min="0" value="${esc(f.custom)}" placeholder="Laisser vide"></label></div></div>
      <div id="tb">${totalsBar()}</div>`;
      ppBind($('#pp',box),P,()=>{$('#pp',box).innerHTML=ppHTML(P)});
    }
    function done(){
      const q=f.saved,p=prospectById(q.prospectId),txt=quoteText(q);
      box.innerHTML=`<div class="pagehead"><h1>Devis enregistré</h1><p>${esc(prospectLabel(p))} · ${esc(q.num)}. Retrouvez-le dans l'espace admin.</p></div>
      <div class="ticket"><span class="ok">${ic('check',18)} Enregistré sur ce téléphone</span><h3>${eur(calcQuote(q).total)}</h3><pre style="white-space:pre-wrap;font:inherit;margin:0;color:var(--muted)">${esc(txt)}</pre></div>
      <div class="row" style="margin-top:16px"><button class="btn" data-copy>${ic('copy',18)} Copier</button><button class="btn line" data-share>${ic('share',18)} Envoyer au client</button></div>
      <div class="row" style="margin-top:10px"><button class="btn sun" data-go="/rdv?prospect=${q.prospectId}&quote=${q.id}">Fixer le 2e RDV</button><button class="btn line" data-new>Nouveau devis</button></div>`;
      $('[data-copy]',box).onclick=()=>copyText(txt,'Devis copié');
      $('[data-share]',box).onclick=()=>shareText('Devis '+q.num,txt);
      $('[data-new]',box).onclick=()=>go('/devis',true);
    }
    box.addEventListener('click',e=>{
      const t=e.target.closest('[data-t]');if(t){f.type=+t.dataset.t;['resa','shop'].forEach(id=>f.opts.delete(id));TYPES[f.type][1].forEach(id=>f.opts.add(id));draw();return}
      const o=e.target.closest('[data-o]');if(o){const id=o.dataset.o;f.opts.has(id)?f.opts.delete(id):f.opts.add(id);draw();return}
      const pg=e.target.closest('[data-pg]');if(pg){f.pages=Math.max(0,f.pages+(+pg.dataset.pg));f.pages>0?f.opts.add('page'):f.opts.delete('page');draw();return}
      if(e.target.closest('[data-save]')){
        if(!ppValid(P)){toast('Indiquez au moins le nom du commerce ou du contact');$('[data-pp="business"]',box).focus();return}
        const p=ppCommit(P),c=cq(),q={id:uid(),num:nextQuoteNum(),prospectId:p.id,createdAt:Date.now(),updatedAt:Date.now(),status:'envoye',opts:[...f.opts],pages:f.pages,discount:+f.discount||0,custom:f.custom,delay:f.delay,budget:f.budget,notes:f.notes,demo:f.demo,total:c.total};
        S.quotes.unshift(q);bumpStatus(p,'devis');if(f.demo){const pp=prospectById(p.id);pp.viewed=pp.viewed||[];if(!pp.viewed.includes(f.demo))pp.viewed.push(f.demo)}if(f.notes)addNote(p.id,'Devis '+q.num+' : '+f.notes);save();f.saved=q;toast('Devis '+q.num+' enregistré');draw();window.scrollTo(0,0)}
    });
    box.addEventListener('input',e=>{const k=e.target.dataset&&e.target.dataset.f;if(!k)return;f[k]=e.target.value;if(['discount','custom'].includes(k))$('#tb',box).innerHTML=totalsBar()});
    box.addEventListener('change',e=>{if(e.target.dataset&&e.target.dataset.f==='demo')f.demo=e.target.value});
    draw();}};
}

/* --- 2e rendez-vous --- */
function pageRdv(qs){
  const params=new URLSearchParams(qs||''),P=ppInit(params.get('prospect')||S.visit||'');
  const GOALS=['Présentation de votre site','Signature et paiement','Récupération de photos et infos','Autre'],PLACES=['Dans votre commerce','Par téléphone','Dans nos bureaux'];
  const f={goal:0,place:0,date:'',time:'',notes:'',quote:params.get('quote')||'',saved:null};
  const html='<div class="page gut"><div class="narrow" id="rv"></div></div>';
  return{html,init(root){
    const box=$('#rv',root),st=S.settings.rdv;
    const days=()=>{const o=[],t=new Date();for(let k=0;k<28&&o.length<21;k++){const d=new Date(t.getFullYear(),t.getMonth(),t.getDate()+k);o.push(d)}return o};
    const taken=(date,time)=>S.appts.some(a=>a.date===date&&a.time===time&&a.status!=='annule');
    const slots=()=>{const out=[],now=new Date(),isToday=f.date===ymd(now);for(let m=toMin(st.start);m+((+st.step)||30)<=toMin(st.end)+0.1;m+=(+st.step)||30){const t=minT(m);out.push({t,off:taken(f.date,t)||(isToday&&m<now.getHours()*60+now.getMinutes()+30)})}return out};
    const quotesOf=()=>S.quotes.filter(q=>q.prospectId===P.id);
    function draw(){
      if(f.saved){done();return}
      const up=S.appts.filter(a=>a.status==='prevu'&&(a.date+a.time)>=(ymd(new Date())+'00:00')).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(0,4);
      box.innerHTML=`<div class="pagehead"><h1>Prendre un 2e rendez-vous</h1><p>Choisissez un créneau avec le commerçant. Tout est enregistré sur ce téléphone.</p></div>
      <div class="card"><h3>1. Le prospect</h3><div id="pp" style="margin-top:8px">${ppHTML(P)}</div></div>
      <div class="card"><h3>2. L'objet du rendez-vous</h3><div class="seg" id="gl">${GOALS.map((g,i)=>`<button data-g="${i}" aria-pressed="${f.goal===i}">${esc(g)}</button>`).join('')}</div><div class="lbl" style="margin-top:14px">Lieu</div><div class="seg" id="pl">${PLACES.map((g,i)=>`<button data-p="${i}" aria-pressed="${f.place===i}">${esc(g)}</button>`).join('')}</div>
        ${P.id&&quotesOf().length?`<label class="fld"><span>Devis associé</span><select class="sel" data-q><option value="">Aucun</option>${quotesOf().map(q=>`<option value="${q.id}"${q.id===f.quote?' selected':''}>${esc(q.num)} · ${eur(calcQuote(q).total)}</option>`).join('')}</select></label>`:''}</div>
      <div class="card"><h3>3. Le jour</h3><div class="daystrip">${days().map(d=>{const off=!st.days.includes(d.getDay());return `<button class="day" data-d="${ymd(d)}" aria-pressed="${f.date===ymd(d)}" ${off?'disabled':''}>${DAYS_S[d.getDay()]}<b>${d.getDate()}</b>${MONTHS[d.getMonth()].slice(0,3)}</button>`}).join('')}</div>
        <div class="lbl" style="margin-top:8px">L'heure</div>${f.date?`<div class="slots">${slots().map(s=>`<button class="slot" data-s="${s.t}" aria-pressed="${f.time===s.t}" ${s.off?'disabled':''}>${fmtT(s.t)}</button>`).join('')}</div>`:'<p class="hint" style="margin-top:6px">Choisissez d\'abord un jour.</p>'}</div>
      <div class="card"><h3>4. Notes</h3><label class="fld" style="margin-top:6px"><span>À préparer pour le rendez-vous</span><textarea class="txa" data-n placeholder="Ses photos, son logo, ses horaires, ses demandes…">${esc(f.notes)}</textarea></label></div>
      <button class="btn block" style="margin-top:16px" data-ok ${f.date&&f.time?'':'disabled'}>Confirmer le rendez-vous</button>
      ${up.length?`<div class="card" style="margin-top:16px"><h3>Prochains rendez-vous</h3><div class="list">${up.map(a=>`<div class="item"><div class="top"><div><h4>${fmtDateS(a.date)} · ${fmtT(a.time)}</h4><div class="meta">${esc(prospectLabel(prospectById(a.prospectId)))} · ${esc(a.goal||'')}</div></div></div></div>`).join('')}</div></div>`:''}`;
      ppBind($('#pp',box),P,()=>{$('#pp',box).innerHTML=ppHTML(P);draw()});
    }
    function done(){
      const a=f.saved,p=prospectById(a.prospectId),txt=apptText(a);
      box.innerHTML=`<div class="pagehead"><h1>Rendez-vous confirmé</h1><p>${esc(prospectLabel(p))} · enregistré sur ce téléphone.</p></div>
      <div class="ticket"><span class="ok">${ic('check',18)} Confirmé</span><h3>${esc(fmtDate(a.date))}<br>à ${esc(fmtT(a.time))}</h3><dl><div><dt>Commerce</dt><dd>${esc(prospectLabel(p))}</dd></div><div><dt>Objet</dt><dd>${esc(a.goal)}</dd></div><div><dt>Lieu</dt><dd>${esc(a.place)}</dd></div>${a.notes?`<div><dt>Notes</dt><dd>${esc(a.notes)}</dd></div>`:''}</dl></div>
      <div class="row" style="margin-top:16px"><button class="btn" data-copy>${ic('copy',18)} Copier</button><button class="btn line" data-share>${ic('share',18)} Envoyer au client</button><button class="btn line" data-ics>${ic('calendar',18)} Ajouter à l'agenda</button></div>
      <div class="row" style="margin-top:10px"><button class="btn sun" data-go="/devis?prospect=${a.prospectId}">Préparer le devis</button><button class="btn line" data-new>Nouveau rendez-vous</button></div>`;
      $('[data-copy]',box).onclick=()=>copyText(txt,'Rendez-vous copié');
      $('[data-share]',box).onclick=()=>shareText('Rendez-vous',txt);
      $('[data-ics]',box).onclick=()=>downloadFile('rendez-vous.ics','text/calendar',icsFor(a));
      $('[data-new]',box).onclick=()=>go('/rdv',true);
    }
    box.addEventListener('click',e=>{
      const g=e.target.closest('[data-g]');if(g){f.goal=+g.dataset.g;draw();return}
      const p=e.target.closest('[data-p]');if(p){f.place=+p.dataset.p;draw();return}
      const d=e.target.closest('[data-d]');if(d){f.date=d.dataset.d;f.time='';draw();return}
      const s=e.target.closest('[data-s]');if(s){f.time=s.dataset.s;draw();return}
      if(e.target.closest('[data-ok]')){
        if(!ppValid(P)){toast('Indiquez au moins le nom du commerce ou du contact');$('[data-pp="business"]',box).focus();return}
        if(taken(f.date,f.time)){toast('Ce créneau vient d\'être pris');draw();return}
        const pr=ppCommit(P),a={id:uid(),prospectId:pr.id,date:f.date,time:f.time,goal:GOALS[f.goal],place:PLACES[f.place],notes:f.notes,quoteId:f.quote,status:'prevu',createdAt:Date.now(),updatedAt:Date.now()};
        S.appts.unshift(a);bumpStatus(pr,'rdv2');if(f.notes)addNote(pr.id,'RDV '+fmtDateS(a.date)+' : '+f.notes);save();f.saved=a;toast('Rendez-vous enregistré');draw();window.scrollTo(0,0)}
    });
    box.addEventListener('input',e=>{if(e.target.matches('[data-n]'))f.notes=e.target.value});
    box.addEventListener('change',e=>{if(e.target.matches('[data-q]'))f.quote=e.target.value});
    draw();}};
}
function icsFor(a){
  const p=prospectById(a.prospectId)||{},[y,mo,d]=a.date.split('-'),[h,mi]=a.time.split(':'),end=minT(toMin(a.time)+45).split(':');
  const z=n=>String(n).padStart(2,'0'),stamp=new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'Z';
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Vitrines Pro//FR','BEGIN:VEVENT','UID:'+a.id+'@vitrines-pro','DTSTAMP:'+stamp,`DTSTART:${y}${mo}${d}T${h}${mi}00`,`DTEND:${y}${mo}${d}T${z(end[0])}${z(end[1])}00`,'SUMMARY:RDV '+(prospectLabel(p)),'LOCATION:'+(a.place||''),'DESCRIPTION:'+String(a.goal||'').replace(/\n/g,' '),'END:VEVENT','END:VCALENDAR'].join('\r\n');
}
