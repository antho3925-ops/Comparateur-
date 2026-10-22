/* ===== Moteur des sites de démo ===== */
const MOD={};
const sec=(c,i,inner)=>`<section class="s-sec${c.alt?' alt':''}${c.dk?' dk':''}${c.cls?' '+c.cls:''}" data-mod="${i}"${c.id?` id="${c.id}"`:''}><div class="s-wrap">${(c.eyebrow||c.title||c.lead)?`<div class="s-hd">${c.eyebrow?`<span class="s-eyebrow">${esc(c.eyebrow)}</span>`:''}${c.title?`<h2 class="s-h2">${c.title}</h2>`:''}${c.lead?`<p class="s-lead">${esc(c.lead)}</p>`:''}</div>`:''}<div class="s-body">${inner}</div></div></section>`;
const stars=n=>`<div class="stars" aria-label="${n} sur 5">${Array.from({length:n},()=>ic('star',17)).join('')}</div>`;
const priceTxt=p=>typeof p==='number'?eur(p):(p||'');
function tabsInit(el){
  el.addEventListener('click',e=>{const b=e.target.closest('.s-tab');if(!b)return;
    $$('.s-tab',el).forEach(t=>t.setAttribute('aria-selected',t===b));
    $$('[data-pane]',el).forEach(p=>{p.hidden=p.dataset.pane!==b.dataset.k});});
}
const tabsHTML=g=>g.length>1?`<div class="s-tabs" role="tablist">${g.map((x,k)=>`<button class="s-tab" role="tab" aria-selected="${k===0}" data-k="${k}">${esc(x.n)}</button>`).join('')}</div>`:'';

/* --- structure commune --- */
function heroHTML(D){
  const h=D.hero,v=D.theme.hero;
  const cta=(h.cta||[]).map(b=>`<button class="s-btn${b.g?' ghost':''}" data-scroll="${b.t}">${esc(b.l)}</button>`).join('');
  const head=`<header class="s-head"><div class="s-wrap"><span class="logo">${esc(D.name)}</span>${h.nav?`<button class="s-btn sm" data-scroll="${h.nav.t}">${esc(h.nav.l)}</button>`:''}</div></header>`;
  const chips=(h.chips||[]).length?`<div class="chips-row">${h.chips.map(c=>`<span>${esc(c)}</span>`).join('')}</div>`:'';
  const body=`<span class="kicker">${esc(h.kicker)}</span><h1 class="s-h1">${h.title}</h1><p class="hero-sub">${esc(h.sub)}</p><div class="ctas">${cta}</div>${chips}`;
  const pos=`--pos:${h.pos||'50% 50%'}`;
  if(v==='split'||v==='arch')return `<div class="hero ${v}" style="${pos}">${head}<div class="s-wrap hero-body"><div>${body}</div><figure class="hero-fig">${img(h.img,'',D.name)}</figure></div></div>`;
  return `<div class="hero ${v}" style="${pos}">${img(h.img,'bg','')}${head}<div class="s-wrap hero-body">${body}</div></div>`;
}
function stripHTML(D){
  const st=statusOf(D.hours);
  return `<div class="s-strip"><div class="s-wrap"><div class="si${st.open?' open':''}"><i class="dot"></i><span><b>${esc(st.text)}</b></span></div><div class="si">${ic('pin')}<span>${esc(D.address)}</span></div><a class="si" href="${telHref(D.phone)}" style="text-decoration:none;color:inherit">${ic('phone')}<span>${esc(D.phone)}</span></a><div class="si">${ic('star')}<span><b>${String(D.rating[0]).replace('.',',')}</b> · ${D.rating[1]} avis (exemple)</span></div></div></div>`;
}
const mapSVG=()=>`<div class="s-map"><svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="320" height="180" style="fill:var(--bg2)"/><g style="stroke:var(--line)" stroke-width="12" fill="none" stroke-linecap="round"><path d="M-10 58H330M-10 132H330M72 -10V190M182 -10V190M262 -10V190"/></g><g style="stroke:var(--bg)" stroke-width="6" fill="none" stroke-linecap="round"><path d="M-10 58H330M-10 132H330M72 -10V190M182 -10V190M262 -10V190"/></g><rect x="88" y="72" width="82" height="48" rx="6" style="fill:var(--line)" opacity=".7"/><rect x="196" y="70" width="52" height="50" rx="6" style="fill:var(--line)" opacity=".5"/><circle cx="182" cy="96" r="28" style="fill:var(--accent)" opacity=".16"/><path d="M182 114s15-13 15-26a15 15 0 1 0-30 0c0 13 15 26 15 26z" style="fill:var(--accent)"/><circle cx="182" cy="88" r="5.5" style="fill:var(--accent-ink)"/></svg></div>`;
function hoursHTML(D){
  return `<section class="s-sec alt" id="infos"><div class="s-wrap"><div class="s-hd"><span class="s-eyebrow">Infos pratiques</span><h2 class="s-h2">Nous trouver</h2></div><div class="s-body s-info"><div class="s-box"><h3>Horaires</h3><table class="s-hours"><tbody>${hoursRows(D.hours)}</tbody></table>${D.hoursNote?`<p class="s-hint">${esc(D.hoursNote)}</p>`:''}</div><div class="s-box"><h3>Adresse et contact</h3>${mapSVG()}<div class="s-lines"><div>${ic('pin')}<span>${esc(D.address)}${D.city?', '+esc(D.city):''}</span></div><div>${ic('phone')}<a href="${telHref(D.phone)}">${esc(D.phone)}</a></div>${D.insta?`<div>${ic('globe')}<span>${esc(D.insta)}</span></div>`:''}</div><div><a class="s-btn sm" target="_blank" rel="noopener" href="${mapsHref(D.address+' '+(D.city||''))}">Itinéraire</a></div></div></div></div></section>`;
}
const footHTML=D=>`<footer class="s-foot"><div class="s-wrap"><b>${esc(D.name)}</b>${D.legal?`<small>${esc(D.legal)}</small>`:''}<small>Site de démonstration réalisé par ${esc(S.settings.agency)}. Noms, photos, prix et avis sont des exemples.</small></div></footer>`;
function renderSite(D){
  const vars=Object.entries(D.theme.vars).map(([k,v])=>`--${k}:${v}`).join(';');
  let h=`<div class="site" data-demo="${D.id}" style="${vars}">`+heroHTML(D)+stripHTML(D);
  D.sections.forEach((c,i)=>{h+=MOD[c.type].render(c,D,i)});
  return h+hoursHTML(D)+footHTML(D)+'</div>';
}
function initSite(root,D){
  D.sections.forEach((c,i)=>{const m=MOD[c.type];if(m.init){const el=$(`[data-mod="${i}"]`,root);if(el)m.init(el,c,D,i)}});
  root.addEventListener('click',e=>{
    const sc=e.target.closest('[data-scroll]');
    if(sc){const t=$(sc.dataset.scroll,root)||$(sc.dataset.scroll);if(t)t.scrollIntoView({behavior:'smooth',block:'start'})}
    const lb=e.target.closest('[data-lb]');
    if(lb){const g=lb.closest('.s-gal');const list=$$('.gi',g).map(x=>({id:x.dataset.id,cap:x.dataset.cap}));openLightbox(list,+lb.dataset.lb)}
  });
}

/* --- modules simples --- */
MOD.services={render:(c,D,i)=>sec(c,i,`<div class="s-grid g${c.cols||3}">${c.items.map(it=>`<article class="s-card svc">${it.i?`<span class="ico">${ic(it.i,26)}</span>`:''}${it.tag?`<span class="tag">${esc(it.tag)}</span>`:''}<h3>${esc(it.t)}</h3><p>${esc(it.d)}</p>${it.p?`<span class="pr">${esc(it.p)}</span>`:''}</article>`).join('')}</div>`)};
MOD.prices={
  render:(c,D,i)=>sec(c,i,tabsHTML(c.groups)+c.groups.map((x,k)=>`<div class="s-plist" data-pane="${k}"${k?' hidden':''}>${x.items.map(r=>`<div class="s-prow"><div><h3>${esc(r[0])}</h3>${r[1]?`<small>${esc(r[1])}</small>`:''}</div><span class="lead"></span><b>${esc(r[2])}</b></div>`).join('')}</div>`).join('')+(c.note?`<p class="s-note">${esc(c.note)}</p>`:'')),
  init:el=>tabsInit(el)};
MOD.menu={
  render:(c,D,i)=>sec(c,i,tabsHTML(c.groups)+c.groups.map((g,k)=>`<div class="s-grid g${c.cols||3}" data-pane="${k}"${k?' hidden':''}>${g.items.map(it=>`<article class="s-card mcard${it.img?'':' noimg'}">${it.img?`<figure>${img(it.img,'',it.n)}${it.tag?`<span class="tg">${esc(it.tag)}</span>`:''}</figure>`:''}<div class="tx"><h3>${esc(it.n)}</h3>${it.d?`<p>${esc(it.d)}</p>`:''}<span class="pr">${esc(it.p)}</span></div></article>`).join('')}</div>`).join('')),
  init:el=>tabsInit(el)};
MOD.gallery={render:(c,D,i)=>{
  const n=c.imgs.length;
  return sec(c,i,`<div class="s-gal" style="grid-auto-flow:dense">${c.imgs.map((g,k)=>`<button class="gi${(n%2===1&&k===0)?' w':''}${g.t?' t':''}" data-lb="${k}" data-id="${g.id}" data-cap="${esc(g.cap||'')}" aria-label="Agrandir : ${esc(g.cap||'photo')}">${img(g.id,'',g.cap)}${g.cap?`<span>${esc(g.cap)}</span>`:''}</button>`).join('')}</div>`);}};
MOD.ba={
  render:(c,D,i)=>sec(c,i,`<div class="s-ba" data-ba>${img(c.after,'','Après')}${img(c.before,'top','Avant')}<span class="lb2 a">${esc(c.la||'Avant')}</span><span class="lb2 b">${esc(c.lb||'Après')}</span><i class="hd"></i><input type="range" min="0" max="100" value="50" aria-label="Comparer avant et après"></div>${c.note?`<p class="s-note" style="text-align:center">${esc(c.note)}</p>`:''}`),
  init:el=>{const b=$('[data-ba]',el),r=$('input',b);r.addEventListener('input',()=>b.style.setProperty('--p',r.value+'%'))}};
MOD.about={render:(c,D,i)=>sec({...c,title:null,lead:null,eyebrow:null},i,`<div class="s-split${c.rev?' rev':''}"><div>${c.eyebrow?`<span class="s-eyebrow">${esc(c.eyebrow)}</span>`:''}<h2 class="s-h2">${c.title}</h2>${c.text?`<p class="s-lead">${esc(c.text)}</p>`:''}${c.pts?`<ul class="s-pts">${c.pts.map(p=>`<li>${ic('check',20)}<span>${esc(p)}</span></li>`).join('')}</ul>`:''}${c.cta?`<div style="margin-top:22px"><button class="s-btn" data-scroll="${c.cta.t}">${esc(c.cta.l)}</button></div>`:''}</div><figure class="fig${c.tall?' tall':''}">${img(c.img,'',c.alt||'')}</figure></div>`)};
MOD.banner={render:(c,D,i)=>sec({...c,title:null,lead:null,eyebrow:null},i,`<div class="s-banner${c.img?'':' plain'}">${c.img?img(c.img,'',''):''}<div class="tx"><h3>${c.title}</h3>${c.text?`<p>${esc(c.text)}</p>`:''}${c.cta?`<div><button class="s-btn alt" data-scroll="${c.cta.t}">${esc(c.cta.l)}</button></div>`:''}</div></div>`)};
MOD.steps={render:(c,D,i)=>sec(c,i,`<div class="s-steps">${c.items.map(s=>`<article class="s-card s-step"><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></article>`).join('')}</div>`)};
MOD.reviews={render:(c,D,i)=>sec({title:'Ils nous font confiance',eyebrow:'Avis',...c},i,`<div class="s-grid g3">${(c.items||D.reviews).map(r=>`<article class="s-card s-rev">${stars(r.s||5)}<q>${esc(r.t)}</q><b>${esc(r.n)}</b><span class="ex">Avis d'exemple</span></article>`).join('')}</div>`)};
MOD.faq={render:(c,D,i)=>sec({title:'Questions fréquentes',eyebrow:'FAQ',...c},i,`<div class="s-faq">${c.items.map(q=>`<details><summary>${esc(q[0])}</summary><p>${esc(q[1])}</p></details>`).join('')}</div>`)};
MOD.team={render:(c,D,i)=>sec(c,i,`<div class="s-grid g3">${c.items.map(m=>`<article class="s-card svc">${m.img?`<div style="border-radius:calc(var(--radius)*.8);overflow:hidden;aspect-ratio:4/3">${img(m.img,'',m.n)}</div>`:`<span class="ico" style="width:64px;height:64px;font:700 26px var(--f-d)">${esc(m.n.charAt(0))}</span>`}<h3>${esc(m.n)}</h3><span class="tag">${esc(m.r)}</span><p>${esc(m.t)}</p></article>`).join('')}</div>`)};

/* --- suivi (colis / réparation / pressing) --- */
MOD.tracker={
  render:(c,D,i)=>sec(c,i,`<div class="s-box s-track"><form data-f><label class="s-fld" style="margin-top:0"><span>${esc(c.label)}</span><input class="s-in" inputmode="text" autocomplete="off" placeholder="${esc(c.ph)}" data-code></label><button class="s-btn" style="margin-top:14px" type="submit">${esc(c.cta||'Vérifier')}</button></form><div data-out></div></div>`),
  init:(el,c)=>{
    const f=$('[data-f]',el),out=$('[data-out]',el);
    f.addEventListener('submit',e=>{e.preventDefault();
      const code=$('[data-code]',el).value.trim();
      if(code.length<4){out.innerHTML='<p class="s-hint" style="color:#d6334a">Saisissez au moins 4 caractères pour la démonstration.</p>';return}
      const k=hash(code.toLowerCase())%c.steps.length;
      out.innerHTML=`<div class="s-prog"><i style="width:${(k+1)/c.steps.length*100}%"></i></div><div class="s-ststeps">${c.steps.map((s,j)=>`<span class="${j<=k?'on':''}">${esc(s)}</span>`).join('')}</div><p style="margin-top:14px"><b>${esc(c.steps[k])}</b> · ${esc(c.msgs[k])}</p><p class="s-hint">Démonstration : le statut est simulé. Sur votre site, il vient de votre outil de gestion.</p>`;
    });}};

/* --- quiz code de la route --- */
const SIGNS={
 stop:'<polygon points="30,4 70,4 96,30 96,70 70,96 30,96 4,70 4,30" fill="#d6001c" stroke="#fff" stroke-width="3"/><text x="50" y="58" text-anchor="middle" font-family="Arial Black,Arial" font-weight="900" font-size="24" fill="#fff">STOP</text>',
 yield:'<polygon points="50,92 6,12 94,12" fill="#fff" stroke="#d6001c" stroke-width="9" stroke-linejoin="round"/>',
 speed:'<circle cx="50" cy="50" r="44" fill="#fff" stroke="#d6001c" stroke-width="10"/><text x="50" y="62" text-anchor="middle" font-family="Arial Black,Arial" font-weight="900" font-size="34" fill="#111">50</text>',
 noentry:'<circle cx="50" cy="50" r="44" fill="#d6001c"/><rect x="18" y="42" width="64" height="16" rx="3" fill="#fff"/>',
 danger:'<polygon points="50,8 94,88 6,88" fill="#fff" stroke="#d6001c" stroke-width="9" stroke-linejoin="round"/><rect x="46" y="38" width="8" height="26" rx="3" fill="#111"/><circle cx="50" cy="74" r="5" fill="#111"/>'
};
MOD.quiz={
  render:(c,D,i)=>sec(c,i,`<div class="s-box" style="max-width:640px" data-q></div>`),
  init:(el,c)=>{
    const box=$('[data-q]',el);let k=0,score=0,ans=null;
    function draw(){
      if(k>=c.qs.length){box.innerHTML=`<h3>${score}/${c.qs.length} bonnes réponses</h3><p>${score===c.qs.length?'Sans faute. Vous êtes prêt pour une séance d\'essai.':'Pas mal. Nos cours de code permettent de tout revoir, à votre rythme.'}</p><div class="wz-nav"><button class="s-btn ghost" data-r>Recommencer</button><button class="s-btn" data-scroll="#${c.to||'inscription'}">M'inscrire</button></div>`;return}
      const q=c.qs[k];
      box.innerHTML=`<div class="wz-prog">${c.qs.map((x,j)=>`<i class="${j<=k?'on':''}"></i>`).join('')}</div><div class="quiz-sign"><svg viewBox="0 0 100 100" width="96" height="96" aria-hidden="true">${SIGNS[q.sign]}</svg></div><p class="quiz-q">${esc(q.q)}</p><div class="s-opts">${q.o.map((t,j)=>`<button class="s-opt${ans!==null?(j===q.a?' good':(j===ans?' bad':'')):''}" data-j="${j}" ${ans!==null?'disabled':''}>${esc(t)}</button>`).join('')}</div>${ans!==null?`<p class="s-hint"><b>${ans===q.a?'Bravo.':'Raté.'}</b> ${esc(q.e)}</p><div class="wz-nav"><span></span><button class="s-btn" data-n>${k+1<c.qs.length?'Question suivante':'Voir mon résultat'}</button></div>`:''}`;
    }
    box.addEventListener('click',e=>{
      const o=e.target.closest('[data-j]');if(o&&ans===null){ans=+o.dataset.j;if(ans===c.qs[k].a)score++;draw()}
      else if(e.target.closest('[data-n]')){k++;ans=null;draw()}
      else if(e.target.closest('[data-r]')){k=0;score=0;ans=null;draw()}
    });draw();}};

/* --- fournées (boulangerie) --- */
MOD.ovens={
  render:(c,D,i)=>sec(c,i,`<div class="s-split"><div><div class="s-ovens" data-ov></div><p class="s-hint" data-next></p></div><div class="s-box"><span class="s-pill">${ic('bread',16)} Le pain du ${DAYS[new Date().getDay()]}</span><h3 style="margin-top:12px" data-bread></h3><p class="s-hint" style="margin-top:0" data-bd></p></div></div>`),
  init:(el,c)=>{
    const now=new Date(),m=now.getHours()*60+now.getMinutes();let ni=c.batches.findIndex(b=>toMin(b[0])>m);
    $('[data-ov]',el).innerHTML=c.batches.map((b,j)=>`<div class="${j===ni?'next':(ni===-1||j<ni)?'past':''}"><span>${fmtT(b[0])}</span><span>${esc(b[1])}</span></div>`).join('');
    $('[data-next]',el).textContent=ni===-1?'Prochaine fournée demain matin à '+fmtT(c.batches[0][0])+'.':'Prochaine fournée à '+fmtT(c.batches[ni][0])+' : '+c.batches[ni][1]+'.';
    const d=c.daily[now.getDay()];$('[data-bread]',el).textContent=d[0];$('[data-bd]',el).textContent=d[1];}};

/* --- assistant en étapes (réservation, demande de devis, inscription) --- */
MOD.wizard={
  render:(c,D,i)=>sec(c,i,'<div class="wz" data-wz></div>'),
  init:(el,c,D)=>{
    const box=$('[data-wz]',el),steps=c.steps,H=D.hours,st={i:0,v:{},done:false};
    const days=()=>{const t=new Date(),o=[];for(let k=0;k<14;k++)o.push(new Date(t.getFullYear(),t.getMonth(),t.getDate()+k));return o};
    const hasH=d=>(H[d.getDay()]||[]).length>0;
    const slotsFor=d=>{
      const out=[],iv=H[d.getDay()]||[],step=c.step||30,now=new Date(),today=ymd(d)===ymd(now),lim=today?now.getHours()*60+now.getMinutes()+45:-1;
      iv.forEach(([o,cl])=>{for(let m=toMin(o);m<=toMin(cl)-(c.dur||step);m+=step){const t=minT(m);out.push({t,off:m<lim||hash(ymd(d)+t+(st.v.srv!==undefined?st.v.srv:'')+(st.v.pro!==undefined?st.v.pro:''))%5===0})}});
      return out;};
    const optLabel=(s,j)=>{const o=s.opts[j];return o.n+(o.p!=null&&o.p!==''?' · '+priceTxt(o.p):'')};
    const valid=s=>{
      if(s.type==='choice')return st.v[s.k]!==undefined;
      if(s.type==='date'||s.type==='time')return !!st.v[s.k];
      if(s.type==='contact')return s.fields.every(f=>!f.req||String(st.v[f.k]||'').trim().length>=(f.type==='tel'?6:1));
      return true;};
    function draw(){
      if(st.done){ticket();return}
      const s=steps[st.i],last=st.i===steps.length-1;
      let h=`<div class="wz-prog">${steps.map((x,k)=>`<i class="${k<=st.i?'on':''}"></i>`).join('')}</div><h3>${esc(s.title||s.label)}</h3>`;
      if(s.type==='choice'){h+=`<div class="s-opts">${s.opts.map((o,j)=>`<button class="s-opt" data-j="${j}" aria-pressed="${st.v[s.k]===j}"><span>${esc(o.n)}${o.s?`<small>${esc(o.s)}</small>`:''}</span>${o.p!=null&&o.p!==''?`<b>${esc(priceTxt(o.p))}</b>`:''}</button>`).join('')}</div>`}
      if(s.type==='party'){const v=st.v[s.k]||s.def||2;st.v[s.k]=v;h+=`<div class="s-stepper"><button data-d="-1" aria-label="Moins">−</button><b>${v}</b><button data-d="1" aria-label="Plus">+</button></div><p class="s-hint">${esc(s.unit||'personnes')}${s.max?' · '+s.max+' maximum':''}</p>`}
      if(s.type==='date'){h+=`<div class="s-days">${days().map(d=>`<button class="s-day" data-date="${ymd(d)}" aria-pressed="${st.v[s.k]===ymd(d)}" ${hasH(d)?'':'disabled'}>${DAYS_S[d.getDay()]}<b>${d.getDate()}</b>${MONTHS[d.getMonth()].slice(0,3)}</button>`).join('')}</div><p class="s-hint">${c.closedNote||'Les jours grisés sont fermés.'}</p>`}
      if(s.type==='time'){const dk=steps.find(x=>x.type==='date'),dv=dk&&st.v[dk.k];if(!dv)h+='<p>Choisissez d\'abord un jour.</p>';else{const sl=slotsFor(new Date(dv+'T12:00'));h+=sl.length?`<div class="s-slots">${sl.map(x=>`<button class="s-slot" data-t="${x.t}" aria-pressed="${st.v[s.k]===x.t}" ${x.off?'disabled':''}>${fmtT(x.t)}</button>`).join('')}</div>`:'<p>Aucun créneau ce jour-là.</p>'}}
      if(s.type==='contact'){h+=`<div class="s-field-row">${s.fields.map(f=>`<label class="s-fld" ${f.type==='textarea'||f.wide?'style="grid-column:1/-1"':''}><span>${esc(f.l)}${f.req?' *':''}</span>${f.type==='select'?`<select class="s-in" data-f="${f.k}"><option value="">Choisir…</option>${f.opts.map(o=>`<option${st.v[f.k]===o?' selected':''}>${esc(o)}</option>`).join('')}</select>`:f.type==='textarea'?`<textarea class="s-in" data-f="${f.k}" placeholder="${esc(f.ph||'')}">${esc(st.v[f.k]||'')}</textarea>`:`<input class="s-in" data-f="${f.k}" type="${f.type||'text'}" ${f.type==='tel'?'inputmode="tel" autocomplete="tel"':''} placeholder="${esc(f.ph||'')}" value="${esc(st.v[f.k]||'')}">`}</label>`).join('')}</div>`}
      h+=`<div class="wz-nav">${st.i?'<button class="s-btn ghost sm" data-back>Retour</button>':'<span></span>'}<button class="s-btn" data-next ${valid(s)?'':'disabled'}>${last?esc(c.cta||'Confirmer'):'Continuer'}</button></div>`;
      box.innerHTML=h;
    }
    function ticket(){
      const lines=[];let total=0,hasP=false;
      steps.forEach(s=>{const v=st.v[s.k];
        if(s.type==='choice'&&v!==undefined){lines.push([s.label,optLabel(s,v)]);const p=s.opts[v].p;if(typeof p==='number'){total+=p;hasP=true}}
        if(s.type==='party')lines.push([s.label,v+' '+(s.unit||'personnes')]);
        if(s.type==='date'&&v)lines.push([s.label,fmtDate(v)]);
        if(s.type==='time'&&v)lines.push([s.label,fmtT(v)]);
        if(s.type==='contact')s.fields.forEach(f=>{if(st.v[f.k])lines.push([f.l,st.v[f.k]])});});
      const dk=steps.find(x=>x.type==='date'),tk=steps.find(x=>x.type==='time'),title=(dk&&tk&&st.v[dk.k])?fmtDate(st.v[dk.k])+' · '+fmtT(st.v[tk.k]):(c.ticketTitle||'Demande envoyée');
      box.innerHTML=`<div class="s-ticket"><span class="okk">${ic('check',18)} ${esc(c.okLabel||'Demande enregistrée')}</span><h3>${esc(title)}</h3><dl>${lines.map(l=>`<div><dt>${esc(l[0])}</dt><dd>${esc(l[1])}</dd></div>`).join('')}${hasP&&c.total!==false?`<div><dt>${esc(c.totalLabel||'Total estimé')}</dt><dd>${eur(total)}</dd></div>`:''}</dl><p>${esc(c.after||'Vous recevez une confirmation par SMS.')}</p><small>Démonstration : rien n'a été envoyé. Sur votre site, la demande arrive directement sur votre téléphone.</small></div><div class="wz-nav"><button class="s-btn ghost" data-again>Nouvelle demande</button></div>`;
    }
    box.addEventListener('click',e=>{
      const s=steps[st.i];
      const o=e.target.closest('.s-opt[data-j]');
      if(o&&s.type==='choice'){st.v[s.k]=+o.dataset.j;if(s.k==='pro'||s.k==='srv')delete st.v[(steps.find(x=>x.type==='time')||{}).k];draw();if(c.auto!==false&&st.i<steps.length-1)setTimeout(()=>{st.i++;draw()},220);return}
      const d=e.target.closest('[data-d]');if(d){st.v[s.k]=Math.min(s.max||99,Math.max(s.min||1,(st.v[s.k]||s.def||2)+(+d.dataset.d)));draw();return}
      const adv=()=>{if(c.auto!==false&&st.i<steps.length-1)setTimeout(()=>{st.i++;draw()},220)};
      const dt=e.target.closest('[data-date]');if(dt){st.v[s.k]=dt.dataset.date;const tk=steps.find(x=>x.type==='time');if(tk)delete st.v[tk.k];draw();adv();return}
      const t=e.target.closest('[data-t]');if(t){st.v[s.k]=t.dataset.t;draw();adv();return}
      if(e.target.closest('[data-back]')){st.i=Math.max(0,st.i-1);draw();return}
      if(e.target.closest('[data-next]')){if(!valid(s))return;if(st.i<steps.length-1){st.i++;draw()}else{st.done=true;draw();box.scrollIntoView({behavior:'smooth',block:'nearest'})}return}
      if(e.target.closest('[data-again]')){st.i=0;st.v={};st.done=false;draw()}
    });
    box.addEventListener('input',e=>{
      const f=e.target.closest('[data-f]');if(!f)return;const s=steps[st.i];st.v[f.dataset.f]=f.value;
      const nx=$('[data-next]',box);if(nx)nx.disabled=!valid(s);});
    draw();}};

/* --- panier / commande --- */
function slotOptions(D,max){
  const out=[],now=new Date();
  for(let k=0;k<3&&out.length<max;k++){
    const d=new Date(now.getFullYear(),now.getMonth(),now.getDate()+k),iv=D.hours[d.getDay()]||[];
    iv.forEach(([o,cl])=>{for(let m=toMin(o)+30;m<=toMin(cl)-30;m+=60){
      if(k===0&&m<now.getHours()*60+now.getMinutes()+60)continue;
      if(out.length<max)out.push((k===0?'Aujourd\'hui':k===1?'Demain':cap(DAYS[d.getDay()]))+' · '+fmtT(minT(m)))}});
  }
  return out.length?out:['Demain · 10h'];
}
MOD.cart={
  render:(c,D,i)=>sec(c,i,`${tabsHTML(c.groups)}<div class="s-cart"><div class="cl" data-list></div><aside class="s-box sum" data-sum></aside></div>`),
  init:(el,c,D)=>{
    const L=c.labels||{},items=[];c.groups.forEach(g=>g.items.forEach(it=>{it._k=items.length;items.push(it)}));
    const q={};let cur=0,done=null;const f={mode:0,slot:'',name:'',extra:{}};
    const list=$('[data-list]',el),sum=$('[data-sum]',el),slots=slotOptions(D,10);f.slot=slots[0];
    const modes=c.modes||[{n:'Retrait en boutique',f:0}];
    function drawList(){
      list.innerHTML=c.groups[cur].items.map(it=>`<article class="cp"><div class="th">${it.img?img(it.img,'',it.n):ic(it.i||'gift',28)}</div><div style="min-width:0"><h3>${esc(it.n)}</h3>${it.d?`<small>${esc(it.d)}</small>`:''}<span class="pr">${eur(it.p)}${it.u?' <small style="display:inline;font-weight:400">'+esc(it.u)+'</small>':''}</span></div><div class="qt">${q[it._k]?`<button data-k="${it._k}" data-d="-1" aria-label="Retirer">−</button><b>${q[it._k]}</b>`:''}<button class="add" data-k="${it._k}" data-d="1" aria-label="Ajouter ${esc(it.n)}">+</button></div></article>`).join('');
    }
    function totals(){const ids=Object.keys(q);const sub=ids.reduce((s,k)=>s+q[k]*items[k].p,0),n=ids.reduce((s,k)=>s+q[k],0),fee=n?(modes[f.mode].f||0):0;return{ids,sub,n,fee,tot:sub+fee}}
    function drawSum(){
      const t=totals();
      if(done){sum.innerHTML=`<span class="okk" style="display:inline-flex;gap:8px;align-items:center;color:var(--accent);font:700 13px var(--f-b);letter-spacing:.1em;text-transform:uppercase">${ic('check',18)} ${esc(L.ok||'Commande confirmée')}</span><h3 style="font-size:28px;margin:0">N° ${done.num}</h3><ul>${done.lines.map(l=>`<li><span>${esc(l[0])}</span><span>${esc(l[1])}</span></li>`).join('')}</ul><div class="tot"><span>Total</span><span>${eur(done.tot)}</span></div><p class="s-hint" style="margin:0">${esc(c.pay||'À régler sur place.')}</p><p class="s-hint" style="margin:0">Démonstration : la commande n'a pas été envoyée. Sur votre site, elle arrive sur votre téléphone.</p><button class="s-btn ghost" data-new>Nouvelle commande</button>`;return}
      sum.innerHTML=`<h3>${esc(L.title||'Votre commande')}</h3>${t.n?`<ul>${t.ids.map(k=>`<li><span>${q[k]} × ${esc(items[k].n)}</span><span>${eur(q[k]*items[k].p)}</span></li>`).join('')}${t.fee?`<li><span>${esc(modes[f.mode].n)}</span><span>${eur(t.fee)}</span></li>`:''}</ul>`:`<p class="none">${esc(L.empty||'Ajoutez des produits avec le bouton +.')}</p>`}<div class="tot"><span>Total</span><span>${eur(t.tot)}</span></div>
      ${modes.length>1?`<div><span class="s-hint" style="margin:0">Mode</span><div class="s-opts" style="grid-template-columns:1fr 1fr;margin-top:6px">${modes.map((m,j)=>`<button class="s-opt" data-mode="${j}" aria-pressed="${f.mode===j}" style="min-height:52px;padding:10px 12px;font-size:14px"><span>${esc(m.n)}${m.f?`<small>+ ${eur(m.f)}</small>`:''}</span></button>`).join('')}</div></div>`:''}
      <label class="s-fld" style="margin-top:0"><span>${esc(L.when||'Créneau')}</span><select class="s-in" data-slot>${slots.map(s=>`<option${s===f.slot?' selected':''}>${esc(s)}</option>`).join('')}</select></label>
      ${(c.extras||[]).map(x=>`<label class="s-fld" style="margin-top:0"><span>${esc(x.l)}</span><input class="s-in" data-ex="${x.k}" placeholder="${esc(x.ph||'')}" value="${esc(f.extra[x.k]||'')}"></label>`).join('')}
      <label class="s-fld" style="margin-top:0"><span>Votre prénom</span><input class="s-in" data-name placeholder="Ex. Inès" autocomplete="given-name" value="${esc(f.name)}"></label>
      <button class="s-btn" data-order ${t.n?'':'disabled'}>${esc(L.cta||'Valider la commande')}</button>`;
    }
    tabsInit(el);
    el.addEventListener('click',e=>{
      const tb=e.target.closest('.s-tab');if(tb){cur=+tb.dataset.k;drawList();return}
      const b=e.target.closest('[data-k][data-d]');if(b){const k=b.dataset.k;q[k]=Math.max(0,(q[k]||0)+(+b.dataset.d));if(!q[k])delete q[k];drawList();drawSum();return}
      const m=e.target.closest('[data-mode]');if(m){f.mode=+m.dataset.mode;drawSum();return}
      if(e.target.closest('[data-new]')){done=null;drawSum();return}
      if(e.target.closest('[data-order]')){const t=totals();if(!t.n)return;
        const lines=[[(modes[f.mode].n),f.slot]];if(f.name)lines.push(['Au nom de',f.name]);Object.entries(f.extra).forEach(([k,v])=>{const x=(c.extras||[]).find(y=>y.k===k);if(v&&x)lines.push([x.l,v])});lines.push([t.n+' article'+(t.n>1?'s':''),eur(t.sub)]);
        done={num:String(100+hash(Date.now()+'x')%900),lines,tot:t.tot};Object.keys(q).forEach(k=>delete q[k]);drawList();drawSum();}
    });
    el.addEventListener('input',e=>{if(e.target.matches('[data-slot]'))f.slot=e.target.value;if(e.target.matches('[data-name]'))f.name=e.target.value;const x=e.target.closest('[data-ex]');if(x)f.extra[x.dataset.ex]=x.value});
    drawList();drawSum();}};

/* --- simulateur de devis --- */
MOD.sim={
  render:(c,D,i)=>sec(c,i,`<div class="s-box" data-sim><div data-fields></div><div class="s-estimate" data-est></div><div data-after style="margin-top:18px"></div></div>`),
  init:(el,c,D)=>{
    const fb=$('[data-fields]',el),est=$('[data-est]',el),af=$('[data-after]',el),v={};
    c.fields.forEach(x=>{v[x.k]=x.t==='multi'?[]:x.t==='range'?x.def:(x.def!==undefined?x.def:0)});
    const calc=()=>c.calc(v);
    function paint(){const r=calc();est.innerHTML=`<small>${esc(c.estLabel||'Estimation')}</small><b>${r.total>0?esc(r.totalTxt||eur(r.total)):'Sur devis'}</b>${r.sub?`<small>${esc(r.sub)}</small>`:''}${r.lines&&r.lines.length?`<small style="margin-top:6px">${r.lines.map(l=>esc(l[0])+' '+esc(l[1])).join(' · ')}</small>`:''}`}
    function fields(){
      fb.innerHTML=c.fields.map(x=>{
        if(x.t==='choice')return `<div class="s-fld" style="margin-top:6px"><span>${esc(x.l)}</span><div class="s-opts">${x.opts.map((o,j)=>`<button class="s-opt" data-f="${x.k}" data-j="${j}" aria-pressed="${v[x.k]===j}"><span>${esc(o.n)}${o.s?`<small>${esc(o.s)}</small>`:''}</span></button>`).join('')}</div></div>`;
        if(x.t==='multi')return `<div class="s-fld" style="margin-top:14px"><span>${esc(x.l)}</span><div class="s-opts">${x.opts.map((o,j)=>`<button class="s-opt" data-f="${x.k}" data-m="${j}" aria-pressed="${v[x.k].includes(j)}"><span>${esc(o.n)}${o.s?`<small>${esc(o.s)}</small>`:''}</span></button>`).join('')}</div></div>`;
        if(x.t==='range')return `<label class="s-fld" style="margin-top:14px"><span>${esc(x.l)} : <b data-rv="${x.k}">${v[x.k]}</b> ${esc(x.u||'')}</span><input class="s-range" type="range" min="${x.min}" max="${x.max}" step="${x.step||1}" value="${v[x.k]}" data-r="${x.k}"></label>`;
        if(x.t==='select')return `<label class="s-fld" style="margin-top:14px"><span>${esc(x.l)}</span><select class="s-in" data-s="${x.k}">${x.opts.map((o,j)=>`<option value="${j}"${v[x.k]===j?' selected':''}>${esc(o.n)}</option>`).join('')}</select></label>`;
        return '';}).join('');
    }
    function after(){
      af.innerHTML=`<form data-form><div class="s-field-row"><label class="s-fld" style="margin-top:0"><span>Votre prénom *</span><input class="s-in" name="n" required autocomplete="given-name"></label><label class="s-fld" style="margin-top:0"><span>Téléphone *</span><input class="s-in" name="t" required type="tel" inputmode="tel" autocomplete="tel"></label></div><button class="s-btn" style="margin-top:16px" type="submit">${esc(c.cta||'Recevoir mon devis détaillé')}</button></form>`;
    }
    el.addEventListener('click',e=>{
      const b=e.target.closest('.s-opt[data-f]');if(!b)return;const k=b.dataset.f;
      if(b.dataset.j!==undefined)v[k]=+b.dataset.j;else{const j=+b.dataset.m,a=v[k],p=a.indexOf(j);p<0?a.push(j):a.splice(p,1)}
      fields();paint();});
    el.addEventListener('input',e=>{
      const r=e.target.closest('[data-r]');if(r){v[r.dataset.r]=+r.value;$(`[data-rv="${r.dataset.r}"]`,el).textContent=r.value;paint()}
      const s=e.target.closest('[data-s]');if(s){v[s.dataset.s]=+s.value;paint()}});
    el.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.target),r=calc();
      af.innerHTML=`<div class="s-ticket"><span class="okk">${ic('check',18)} Devis envoyé</span><h3>${esc(r.totalTxt||eur(r.total))}</h3><dl>${(r.lines||[]).map(l=>`<div><dt>${esc(l[0])}</dt><dd>${esc(l[1])}</dd></div>`).join('')}<div><dt>Pour</dt><dd>${esc(fd.get('n'))}</dd></div></dl><p>${esc(c.after||'Vous recevez le détail par SMS et nous vous rappelons sous 24 h.')}</p><small>Démonstration : aucun message n'a été envoyé.</small></div>`;});
    fields();paint();after();}};

/* --- simulateur de pose (onglerie) --- */
MOD.nailsim={
  render:(c,D,i)=>sec(c,i,`<div class="s-box" data-ns><div style="display:grid;gap:22px" class="s-split"><div style="background:var(--bg2);border-radius:var(--radius);padding:14px;display:grid;place-items:center;position:relative;min-height:280px"><svg data-hand viewBox="0 0 440 300" style="width:100%;max-width:420px" aria-label="Aperçu de la pose"></svg><div style="position:absolute;left:14px;bottom:14px;background:var(--ink);color:var(--bg);border-radius:999px;padding:8px 16px;font:700 20px var(--f-d)" data-price></div></div><div data-ctl></div></div></div>`),
  init:(el,c,D)=>{
    const PRE=[['Semi-permanent',30],['Gel',40],['Capsules',50],['Remplissage',35]],SHAPES=['Amande','Carré','Coffin','Rond','Stiletto'],COLS=['#b3123f','#e8566f','#ff8fb1','#f6c9cf','#f3e6dc','#c08a6a','#7a2e3a','#2b0f1a','#3b5bdb','#6fbf9b'],FIN=[['Brillant',0],['Mat',0],['Chrome',8]],OPT=[['French',5],['Nail art 2 ongles',10],['Paillettes',6]],SKIN=['#f3d2bd','#d9a582','#a86f4c','#6b4330'];
    const st={pre:0,shape:0,col:0,fin:0,opt:new Set(),skin:1},hand=$('[data-hand]',el),ctl=$('[data-ctl]',el),pr=$('[data-price]',el);
    const nail=(x,y,w,h,s)=>{switch(SHAPES[s]){
      case'Rond':return`M${x} ${y+h}V${y+w/2}A${w/2} ${w/2} 0 0 1 ${x+w} ${y+w/2}V${y+h}Z`;
      case'Carré':return`M${x} ${y+h}V${y+4}Q${x} ${y} ${x+4} ${y}H${x+w-4}Q${x+w} ${y} ${x+w} ${y+4}V${y+h}Z`;
      case'Coffin':return`M${x} ${y+h}V${y+h*.38}L${x+w*.24} ${y}H${x+w*.76}L${x+w} ${y+h*.38}V${y+h}Z`;
      case'Stiletto':return`M${x} ${y+h}V${y+h*.5}Q${x+w*.3} ${y+h*.12} ${x+w/2} ${y}Q${x+w*.7} ${y+h*.12} ${x+w} ${y+h*.5}V${y+h}Z`;
      default:return`M${x} ${y+h}V${y+h*.45}Q${x} ${y+h*.06} ${x+w/2} ${y}Q${x+w} ${y+h*.06} ${x+w} ${y+h*.45}V${y+h}Z`}};
    function draw(){
      const col=COLS[st.col],skin=SKIN[st.skin],fin=FIN[st.fin][0];
      const F=[[40,110,58],[120,60,62],[205,40,62],[290,62,60],[372,120,52]];
      let g=`<defs><linearGradient id="nschr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".35" stop-color="${col}"/><stop offset=".7" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="${col}"/></linearGradient></defs>`;
      F.forEach(([x,y,w],i)=>{const nw=w-18,nh=st.pre>=2?nw*1.75:nw*1.3,nx=x+9,ny=y-(st.pre>=2?nh*.35:nh*.12),d=nail(nx,ny,nw,nh,st.shape);
        g+=`<rect x="${x}" y="${y}" width="${w}" height="${320-y}" rx="${w/2}" fill="${skin}"/><path d="${d}" fill="${fin==='Chrome'?'url(#nschr)':col}"/>`;
        if(st.opt.has(0))g+=`<clipPath id="nscl${i}"><path d="${d}"/></clipPath><rect x="${nx}" y="${ny}" width="${nw}" height="${nh*.28}" fill="#fffaf7" clip-path="url(#nscl${i})"/>`;
        if(st.opt.has(2))for(let k=0;k<7;k++)g+=`<circle cx="${nx+6+((k*13+i*7)%(nw-12))}" cy="${ny+nh*.3+((k*17+i*5)%(nh*.6))}" r="${1.4+(k%3)*.6}" fill="#fff" opacity=".85"/>`;
        if(st.opt.has(1)&&(i===1||i===3))g+=`<circle cx="${nx+nw/2}" cy="${ny+nh*.55}" r="${nw*.16}" fill="#fff"/><circle cx="${nx+nw/2}" cy="${ny+nh*.55}" r="${nw*.07}" fill="${col}"/><circle cx="${nx+nw/2}" cy="${ny+nh*.3}" r="2.5" fill="#fff"/><circle cx="${nx+nw/2}" cy="${ny+nh*.8}" r="2.5" fill="#fff"/>`;
        if(fin==='Brillant')g+=`<path d="M${nx+nw*.22} ${ny+nh*.75}V${ny+nh*.35}" stroke="#fff" stroke-opacity=".55" stroke-width="4" stroke-linecap="round"/>`;});
      hand.innerHTML=g;
      pr.textContent=eur(PRE[st.pre][1]+FIN[st.fin][1]+[...st.opt].reduce((s,i)=>s+OPT[i][1],0));
    }
    function ctls(){
      const pills=(t,arr,key,multi)=>`<div class="s-fld" style="margin-top:0"><span>${t}</span><div class="s-opts" style="grid-template-columns:repeat(auto-fill,minmax(130px,1fr))">${arr.map((a,i)=>{const lab=Array.isArray(a)?a[0]:a,ex=Array.isArray(a)&&a[1]&&key!=='pre'?` +${a[1]} €`:'';return `<button class="s-opt" style="min-height:48px;padding:8px 12px;font-size:14px" data-key="${key}" data-i="${i}" aria-pressed="${multi?st[key].has(i):st[key]===i}"><span>${lab}${ex}</span></button>`}).join('')}</div></div>`;
      const sw=(t,arr,key)=>`<div class="s-fld" style="margin-top:0"><span>${t}</span><div style="display:flex;gap:10px;flex-wrap:wrap">${arr.map((x,i)=>`<button data-key="${key}" data-i="${i}" aria-label="${t} ${i+1}" style="width:38px;height:38px;border-radius:50%;border:3px solid var(--bg);box-shadow:0 0 0 ${st[key]===i?'3px var(--ink)':'1.5px var(--line)'};background:${x};padding:0"></button>`).join('')}</div></div>`;
      ctl.innerHTML=`<div style="display:grid;gap:14px">${pills('Prestation',PRE,'pre')}${pills('Forme',SHAPES,'shape')}${sw('Couleur',COLS,'col')}${pills('Finition',FIN,'fin')}${pills('Options',OPT,'opt',true)}${sw('Teint de peau de l\'aperçu',SKIN,'skin')}<button class="s-btn" data-scroll="#${c.to||'reserver'}">Réserver ce look</button></div>`;
    }
    ctl.addEventListener('click',e=>{const b=e.target.closest('[data-key]');if(!b)return;const k=b.dataset.key,i=+b.dataset.i;if(k==='opt'){st.opt.has(i)?st.opt.delete(i):st.opt.add(i)}else st[k]=i;ctls();draw()});
    ctls();draw();}};
