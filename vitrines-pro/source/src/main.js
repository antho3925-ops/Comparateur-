/* ===== Routeur et démarrage ===== */
let route=(location.hash&&location.hash.indexOf('#/')===0)?location.hash.slice(1):'/';
function go(p,replace){route=p;try{history[replace?'replaceState':'pushState']({r:p},'','#'+p)}catch(e){}render();window.scrollTo(0,0)}
window.addEventListener('popstate',e=>{route=(e.state&&e.state.r)||'/';render()});
function topbarHTML(){
  const vp=S.visit&&prospectById(S.visit);
  return `<div class="topbar"><div class="page gut"><button class="brand" data-go="/" aria-label="Accueil"><span class="mk">${markSVG}</span><span class="t">${esc(S.settings.agency)}</span></button>${vp?`<span class="visit"><b>Visite : ${esc(prospectLabel(vp))}</b><button data-endvisit aria-label="Terminer la visite">${ic('x',14)}</button></span>`:''}</div></div>`;
}
function tabbarHTML(key){
  const T=[['','Démos','grid','/'],['offre','Offre','tag','/offre'],['devis','Devis','file','/devis'],['rdv','RDV','calendar','/rdv'],['admin','Admin','lock','/admin']];
  return `<nav class="tabbar" aria-label="Navigation"><div class="in">${T.map(t=>`<button class="tab" data-go="${t[3]}" ${key===t[0]?'aria-current="page"':''}>${ic(t[2],22)}<span>${t[1]}</span></button>`).join('')}</div></nav>`;
}
function renderDemoPage(id){
  const D=DEMO_BY_ID[id],app=$('#app');if(!D){go('/',true);return}
  document.body.classList.remove('has-tabs');document.body.style.background=D.theme.vars.bg;
  logView(id);
  const i=DEMOS.indexOf(D),pv=DEMOS[(i+DEMOS.length-1)%DEMOS.length],nx=DEMOS[(i+1)%DEMOS.length],s=S.settings;
  app.innerHTML=`<div class="dbar"><div class="in gut"><button data-go="/">${ic('left',16)} Démos</button><span class="tg">DÉMO</span><span class="nm">${esc(D.metier)}</span><button class="nv" data-go="/demo/${pv.id}" aria-label="Démo précédente : ${esc(pv.name)}">${ic('left',16)}</button><button class="nv" data-go="/demo/${nx.id}" aria-label="Démo suivante : ${esc(nx.name)}">${ic('right',16)}</button></div></div>`
   +renderSite(D)
   +`<section class="demo-end"><div class="page gut"><h3>Ce site peut être le vôtre.</h3><p>Zéro euro avant d'avoir vu votre site fini. Ensuite ${eur(s.price)} en paiement unique${s.firstYear?', première année d\'hébergement incluse':''}, puis ${eur(s.monthly)} par mois.</p><div class="row"><button class="btn sun" data-go="/devis?demo=${D.id}">Devis sur mesure</button><button class="btn ghost" data-go="/rdv?demo=${D.id}">Prendre un 2e RDV</button><button class="btn ghost" data-go="/offre">Notre offre</button></div></div></section>
   <div class="dfab"><button class="a" data-go="/devis?demo=${D.id}">Je veux ce site ${ic('arrow',18)}</button></div>`;
  initSite($('.site',app),D);
}
function render(){
  closeModal();$$('.lb').forEach(x=>x.remove());
  const [path,qs]=route.split('?'),parts=path.split('/').filter(Boolean),key=parts[0]||'',app=$('#app');
  document.body.style.background='';
  if(key==='demo'){renderDemoPage(parts[1]);return}
  document.body.classList.add('has-tabs');
  const pg=({'':pageHome,offre:pageOffre,devis:pageDevis,rdv:pageRdv,admin:pageAdmin}[key]||pageHome)(qs);
  app.innerHTML=topbarHTML()+(storageOK?'':'<div class="warnbar">Le stockage du navigateur est indisponible : les notes seront perdues à la fermeture de la page.</div>')+`<main>${pg.html}</main>`+tabbarHTML(key);
  if(pg.init)pg.init($('main',app));
}
document.addEventListener('click',e=>{
  const g=e.target.closest('[data-go]');
  if(g){e.preventDefault();go(g.dataset.go);return}
  const sc=e.target.closest('[data-scrollto]');
  if(sc){const t=$(sc.dataset.scrollto);if(t)t.scrollIntoView({behavior:'smooth',block:'start'});return}
  if(e.target.closest('[data-endvisit]')){S.visit=null;save();toast('Visite terminée');render();return}
  if(e.target.closest('[data-startvisit]')){startVisitModal()}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();$$('.lb').forEach(x=>x.remove())}});
function boot(){
  render();
  try{if(STANDALONE&&'serviceWorker' in navigator&&location.protocol.indexOf('http')===0)navigator.serviceWorker.register('sw.js').catch(()=>{})}catch(e){}
}
boot();
