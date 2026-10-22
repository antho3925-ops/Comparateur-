'use strict';
/* ===== Helpers ===== */
const LS_KEY='vitrines-pro-v1';
const $=(s,r)=>(r||document).querySelector(s);
const $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const pad=n=>String(n).padStart(2,'0');
const ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const DAYS=['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
const DAYS_S=['dim','lun','mar','mer','jeu','ven','sam'];
const MONTHS=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const cap=s=>s?s.charAt(0).toUpperCase()+s.slice(1):'';
const nf=new Intl.NumberFormat('fr-FR',{maximumFractionDigits:2});
const eur=n=>nf.format(Math.round((+n||0)*100)/100)+' €';
const fmtDate=iso=>{const d=new Date(iso+'T12:00');return cap(DAYS[d.getDay()])+' '+d.getDate()+' '+MONTHS[d.getMonth()]};
const fmtDateS=iso=>{const d=new Date(iso+'T12:00');return DAYS_S[d.getDay()]+' '+d.getDate()+'/'+pad(d.getMonth()+1)};
const fmtT=t=>{const [h,m]=t.split(':');return (+h)+'h'+(m==='00'?'':m)};
const fmtDT=ts=>{const d=new Date(ts);return pad(d.getDate())+'/'+pad(d.getMonth()+1)+' '+pad(d.getHours())+':'+pad(d.getMinutes())};
const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const toMin=t=>{const [h,m]=t.split(':').map(Number);return h*60+m};
const minT=m=>pad(Math.floor(m/60)%24)+':'+pad(m%60);
const R=(o,c)=>[[o,c]];
const telHref=p=>'tel:'+String(p||'').replace(/[^\d+]/g,'');
const mapsHref=q=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q);

/* ===== Icons ===== */
const ICONS={
pin:'<path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.6"/>',
phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
star:'<path fill="currentColor" stroke="none" d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z"/>',
check:'<path d="M5 12.5l4.5 4.5L19 7"/>',
x:'<path d="M6 6l12 12M18 6L6 18"/>',
plus:'<path d="M12 5v14M5 12h14"/>',
minus:'<path d="M5 12h14"/>',
left:'<path d="M15 5l-7 7 7 7"/>',right:'<path d="M9 5l7 7-7 7"/>',
arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
grid:'<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
tag:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.2"/>',
file:'<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5M9 13h7M9 17h7"/>',
calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
share:'<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 11l7.6-4M8.2 13l7.6 4"/>',
copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
download:'<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
box:'<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
euro:'<path d="M17 6.5A6.5 6.5 0 1 0 17 17.5"/><path d="M4 10.5h9M4 13.5h9"/>',
stamp:'<path d="M5 3h14v18H5z"/><path d="M8 14l3-4 2 3 2-2 2 3"/><circle cx="9" cy="7.5" r="1.3"/>',
news:'<path d="M4 4h13v16H6a2 2 0 0 1-2-2z"/><path d="M17 8h3v10a2 2 0 0 1-2 2M7 8h7M7 12h7M7 16h5"/>',
ticket:'<path d="M3 8a2 2 0 0 0 0 4v4h18v-4a2 2 0 0 1 0-4V4H3z"/><path d="M15 4v12"/>',
card:'<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6 15h4"/>',
key:'<circle cx="8" cy="12" r="4"/><path d="M12 12h9M17 12v3M20 12v2"/>',
mobile:'<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M10 18h4"/>',
shirt:'<path d="M8 3l-5 3 2 4 3-1v12h8V9l3 1 2-4-5-3a4 4 0 0 1-8 0z"/>',
heart:'<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/>',
leaf:'<path d="M5 19C5 10 10 5 20 4c0 10-5 15-14 15z"/><path d="M5 19l8-8"/>',
bread:'<path d="M4 12a4 4 0 0 1 3-6h10a4 4 0 0 1 3 6v6H4z"/><path d="M9 9l-1 3M13 9l-1 3M17 9l-1 3"/>',
cake:'<path d="M4 12h16v8H4zM4 16h16M12 12V8M12 4c1 1.2 1 2.4 0 3.2-1-.8-1-2 0-3.2z"/>',
coffee:'<path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 10h2a2 2 0 0 1 0 4h-2M7 3v2M11 3v2M14 3v2"/>',
wine:'<path d="M8 3h8l-1 7a3 3 0 0 1-6 0z"/><path d="M12 13v8M8 21h8"/>',
wrench:'<path d="M14 6a4 4 0 0 0 5 5l-8 9a2.5 2.5 0 0 1-4-4l8-9z"/><path d="M14 6l3-3 2 2"/>',
car:'<path d="M3 14l2-6h14l2 6v4h-3v-2H6v2H3z"/><circle cx="7.5" cy="13.5" r="1"/><circle cx="16.5" cy="13.5" r="1"/>',
drop:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
bolt:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
hammer:'<path d="M3 21l9-9M12 12l-3-3 5-5 6 6-5 5-3-3z"/>',
lotus:'<path d="M12 20c-5 0-8-3-9-7 4 0 6 1 7.5 3C9 11 10 7 12 4c2 3 3 7 1.5 12 1.5-2 3.5-3 7.5-3-1 4-4 7-9 7z"/>',
flower:'<circle cx="12" cy="12" r="2.5"/><path d="M12 9.5C10 6 11 3 12 3s2 3 0 6.5zM14.5 12C18 10 21 11 21 12s-3 2-6.5 0zM12 14.5C14 18 13 21 12 21s-2-3 0-6.5zM9.5 12C6 14 3 13 3 12s3-2 6.5 0z"/>',
needle:'<path d="M5 19L19 5M16 4l4 4M4 20l2-5"/>',
hanger:'<path d="M12 7a2 2 0 1 1 2 2c0 1-2 1.5-2 3L3 18h18l-9-6"/>',
gift:'<rect x="3" y="9" width="18" height="12" rx="1"/><path d="M3 13h18M12 9v12M12 9c-3 0-5-1-5-3s3-2 5 3c2-5 5-5 5-3s-2 3-5 3"/>',
truck:'<path d="M2 6h11v10H2zM13 10h5l3 3v3h-8z"/><circle cx="6" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
fork:'<path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v6M9 3v6M17 3c-2 2-3 5-3 8h3v10"/>',
pizza:'<path d="M3 6a18 18 0 0 1 18 0L12 21z"/><circle cx="10" cy="9" r="1"/><circle cx="14" cy="10" r="1"/>',
pen:'<path d="M4 20l1-4L17 4l3 3L8 19z"/>',
spark:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
pulse:'<path d="M3 12h4l2-5 4 10 2-5h6"/>',
home:'<path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-6h4v6"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
scissors:'<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.5 8l11 9M8.5 16l11-9"/>',
razor:'<path d="M4 15l9-9 4 4-9 9H4zM13 6l3-3 4 4-3 3"/>',
drive:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/><path d="M12 9.5V3M9.8 13.2L4 16M14.2 13.2L20 16"/>',
snow:'<path d="M12 2v20M4 6l16 12M20 6L4 18"/>',
tool:'<path d="M14 6a4 4 0 0 0 5 5l-8 9a2.5 2.5 0 0 1-4-4l8-9z"/>',
globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
whats:'<path d="M4 20l1.3-4.2A8 8 0 1 1 8.2 18.7z"/>',
mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
chart:'<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
};
const ic=(n,s)=>`<svg class="ic" viewBox="0 0 24 24" width="${s||20}" height="${s||20}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]||ICONS.spark}</svg>`;
const img=(id,cls,alt)=>IMG[id]?`<img${cls?` class="${cls}"`:''} alt="${esc(alt||'')}" src="${IMG[id]}" decoding="async">`:'';

/* ===== Horaires ===== */
function fmtM(m){m=m%1440;return fmtT(minT(m))}
function statusOf(H,now){
  now=now||new Date();const d=now.getDay(),m=now.getHours()*60+now.getMinutes(),y=(d+6)%7;
  for(const [o,c] of H[y]){if(toMin(c)>1440&&m<toMin(c)-1440)return{open:true,text:'Ouvert · ferme à '+fmtM(toMin(c))}}
  for(const [o,c] of H[d]){if(m>=toMin(o)&&m<toMin(c))return{open:true,text:'Ouvert · ferme à '+fmtM(toMin(c))}}
  for(const [o] of H[d]){if(m<toMin(o))return{open:false,text:'Fermé · ouvre à '+fmtM(toMin(o))}}
  for(let i=1;i<=7;i++){const k=(d+i)%7;if(H[k].length)return{open:false,text:'Fermé · ouvre '+(i===1?'demain':DAYS[k])+' à '+fmtM(toMin(H[k][0][0]))}}
  return{open:false,text:'Fermé'};
}
function hoursRows(H){
  const today=new Date().getDay();
  return [1,2,3,4,5,6,0].map(k=>`<tr class="${k===today?'today':''}"><th>${cap(DAYS[k])}</th><td>${H[k].length?H[k].map(([o,c])=>fmtM(toMin(o))+' – '+fmtM(toMin(c))).join(' · '):'Fermé'}</td></tr>`).join('');
}

/* ===== Stockage local ===== */
let storageOK=true;
function defaults(){return{
 settings:{agency:'Votre Agence',tagline:'Sites internet pour commerces de proximité',commercial:'',phone:'',email:'',city:'',pin:'1234',pinChanged:false,
  price:590,delay:'7 jours ouvrés',
  rdv:{days:[1,2,3,4,5,6],start:'09:00',end:'18:00',step:30},
  options:[
   {id:'resa',n:'Réservation en ligne',p:150},{id:'shop',n:'Commande en ligne et retrait en boutique',p:250},
   {id:'page',n:'Page supplémentaire',p:60,unit:1},{id:'gal',n:'Galerie photos / réalisations',p:50},
   {id:'gmb',n:'Fiche Google optimisée',p:80},{id:'logo',n:'Logo et identité visuelle',p:120},
   {id:'shoot',n:'Shooting photo professionnel',p:150},{id:'en',n:'Version anglaise',p:100},
   {id:'insta',n:'Flux Instagram intégré',p:40},{id:'seo',n:'Référencement local renforcé',p:90}]},
 prospects:[],quotes:[],appts:[],views:{},visit:null,savedAt:0};}
function lsGet(){try{const r=localStorage.getItem(LS_KEY);return r?JSON.parse(r):null}catch(e){storageOK=false;return null}}
function lsSet(o){try{localStorage.setItem(LS_KEY,JSON.stringify(o));return true}catch(e){storageOK=false;return false}}
function load(){
  const d=defaults(),s=lsGet();if(!s)return d;
  const st=s.settings||{};
  return Object.assign(d,s,{settings:Object.assign(d.settings,st,{rdv:Object.assign(d.settings.rdv,st.rdv||{}),options:st.options||d.settings.options})});
}
let S=load();
function save(){S.savedAt=Date.now();lsSet(S)}
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}

const STATUS={nouveau:['Nouveau','blue'],contacte:['Contacté',''],rdv2:['2e RDV fixé','warn'],devis:['Devis envoyé','warn'],signe:['Signé','ok'],perdu:['Perdu','bad']};
const HEAT={froid:['Froid','#7a8cff'],tiede:['Tiède','#e89a0c'],chaud:['Chaud','#d6334a']};
const prospectById=id=>S.prospects.find(p=>p.id===id);
const quoteById=id=>S.quotes.find(p=>p.id===id);
function addProspect(p){const o=Object.assign({id:uid(),createdAt:Date.now(),updatedAt:Date.now(),status:'nouveau',heat:'tiede',notes:[],viewed:[]},p);S.prospects.unshift(o);save();return o}
function patchProspect(id,patch){const p=prospectById(id);if(!p)return;Object.assign(p,patch,{updatedAt:Date.now()});save();return p}
function addNote(id,text){const p=prospectById(id);if(!p||!text.trim())return;p.notes.unshift({t:Date.now(),x:text.trim()});p.updatedAt=Date.now();save()}
function logView(demoId){
  S.views[demoId]=(S.views[demoId]||0)+1;
  if(S.visit){const p=prospectById(S.visit);if(p){p.viewed=p.viewed||[];if(!p.viewed.includes(demoId))p.viewed.push(demoId);p.updatedAt=Date.now()}}
  save();
}
function optPrice(id){const o=S.settings.options.find(x=>x.id===id);return o?o.p:0}
function calcQuote(q){
  const s=S.settings;let total=+s.price||0;const lines=[['Site vitrine (jusqu\'à 5 pages)',total]];
  (q.opts||[]).forEach(id=>{const o=s.options.find(x=>x.id===id);if(!o)return;const n=o.unit?(+q.pages||0):1;if(n>0){const a=o.p*n;total+=a;lines.push([o.n+(o.unit?' × '+n:''),a])}});
  const disc=+q.discount||0;if(disc>0){total-=disc;lines.push(['Remise',-disc])}
  if(q.custom!==''&&q.custom!=null&&!isNaN(+q.custom)){total=+q.custom}
  return{total:Math.max(0,total),lines};
}
function nextQuoteNum(){const y=new Date().getFullYear();const n=S.quotes.filter(q=>String(q.num||'').includes('-'+y+'-')).length+1;return 'D-'+y+'-'+String(n).padStart(3,'0')}

/* ===== Textes partageables ===== */
function prospectLabel(p){return p?(p.business||p.name||'Prospect'):'—'}
function quoteText(q){
  const p=prospectById(q.prospectId),s=S.settings,c=calcQuote(q);
  let t=`DEVIS ${q.num}\n${s.agency}${s.commercial?' · '+s.commercial:''}${s.phone?' · '+s.phone:''}\n\nClient : ${prospectLabel(p)}${p&&p.name&&p.business?' ('+p.name+')':''}\n`;
  t+=c.lines.map(l=>'• '+l[0]+' : '+eur(l[1])).join('\n');
  t+=`\n\nTOTAL TOUT COMPRIS (paiement unique) : ${eur(c.total)}\nTout compris : création du site, hébergement, nom de domaine, maintenance et modifications.\nDélai de livraison : ${q.delay||s.delay}\n\n0 € à payer avant d'avoir vu votre site.`;
  return t;
}
function apptText(a){
  const p=prospectById(a.prospectId),s=S.settings;
  return `RENDEZ-VOUS CONFIRMÉ\n${fmtDate(a.date)} à ${fmtT(a.time)}\n${a.place||''}\nObjet : ${a.goal||'Présentation de votre site'}\nAvec : ${s.commercial||s.agency}${s.phone?' · '+s.phone:''}\nClient : ${prospectLabel(p)}`;
}
function prospectText(p){
  let t=`${prospectLabel(p)}\n${p.name||''}${p.phone?' · '+p.phone:''}${p.email?' · '+p.email:''}\n${p.address||''}\nMétier : ${p.metier||'—'} · ${STATUS[p.status]?STATUS[p.status][0]:p.status} · ${HEAT[p.heat]?HEAT[p.heat][0]:''}`;
  if(p.viewed&&p.viewed.length)t+='\nDémos vues : '+p.viewed.map(id=>(DEMO_BY_ID[id]||{}).name||id).join(', ');
  (p.notes||[]).slice().reverse().forEach(n=>{t+='\n['+fmtDT(n.t)+'] '+n.x});
  return t;
}

/* ===== Export / import ===== */
function exportObj(){
  const s=Object.assign({},S.settings);delete s.pin;
  return{app:'vitrines-pro',v:1,exportedAt:new Date().toISOString(),settings:s,prospects:S.prospects,quotes:S.quotes,appts:S.appts,views:S.views};
}
function mergeIn(o){
  let add=0,upd=0;
  const mergeArr=(dst,src)=>{(src||[]).forEach(r=>{const i=dst.findIndex(x=>x.id===r.id);if(i<0){dst.push(r);add++}else if((r.updatedAt||r.createdAt||0)>(dst[i].updatedAt||dst[i].createdAt||0)){dst[i]=r;upd++}})};
  mergeArr(S.prospects,o.prospects);mergeArr(S.quotes,o.quotes);mergeArr(S.appts,o.appts);
  Object.entries(o.views||{}).forEach(([k,v])=>{S.views[k]=Math.max(S.views[k]||0,v)});
  save();return{add,upd};
}
const csvCell=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';
function toCSV(rows){return '﻿'+rows.map(r=>r.map(csvCell).join(';')).join('\n')}
function csvProspects(){
  const head=['Commerce','Contact','Téléphone','Email','Adresse','Métier','Statut','Intérêt','Démos vues','Notes','Créé le'];
  return toCSV([head].concat(S.prospects.map(p=>[p.business,p.name,p.phone,p.email,p.address,p.metier,(STATUS[p.status]||[p.status])[0],(HEAT[p.heat]||[p.heat])[0],(p.viewed||[]).map(id=>(DEMO_BY_ID[id]||{}).name||id).join(', '),(p.notes||[]).map(n=>n.x).join(' | '),fmtDT(p.createdAt)])));
}
function csvAppts(){return toCSV([['Date','Heure','Commerce','Contact','Téléphone','Lieu','Objet','Statut','Notes']].concat(S.appts.slice().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).map(a=>{const p=prospectById(a.prospectId)||{};return[a.date,a.time,p.business,p.name,p.phone,a.place,a.goal,a.status,a.notes]})))}
function csvQuotes(){return toCSV([['N°','Date','Commerce','Total','Statut','Options','Notes']].concat(S.quotes.map(q=>{const p=prospectById(q.prospectId)||{},c=calcQuote(q);return[q.num,fmtDT(q.createdAt),p.business||p.name,c.total,q.status,(q.opts||[]).join(', '),q.notes]})))}

/* ===== UI utilitaires ===== */
function toast(msg){
  $$('.toast').forEach(t=>t.remove());
  const t=document.createElement('div');t.className='toast';t.setAttribute('role','status');t.textContent=msg;document.body.appendChild(t);
  setTimeout(()=>t.remove(),2600);
}
function copyText(text,okMsg){
  const done=()=>toast(okMsg||'Copié');
  const fb=()=>{const ta=document.createElement('textarea');ta.value=text;ta.style.cssText='position:fixed;opacity:0;top:0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');done()}catch(e){toast('Copie impossible : sélectionnez le texte à la main')}ta.remove()};
  try{navigator.clipboard.writeText(text).then(done,fb)}catch(e){fb()}
}
function shareText(title,text){
  if(navigator.share){navigator.share({title,text}).catch(()=>{})}else copyText(text,'Texte copié, prêt à coller dans un message');
}
function downloadFile(name,mime,text){
  try{
    const blob=new Blob([text],{type:mime}),a=document.createElement('a');
    a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();
    setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);toast('Fichier préparé : '+name);
  }catch(e){copyText(text,'Téléchargement bloqué : contenu copié')}
}
let modalEl=null;
function openModal(html,onclose){
  closeModal();
  const m=document.createElement('div');m.className='mod';
  m.innerHTML=`<div class="box" role="dialog" aria-modal="true"><button class="x" aria-label="Fermer" data-x>${ic('x',18)}</button>${html}</div>`;
  m.addEventListener('click',e=>{if(e.target===m||e.target.closest('[data-x]'))closeModal()});
  document.body.appendChild(m);modalEl=m;m._onclose=onclose;return m;
}
function closeModal(){if(modalEl){const f=modalEl._onclose;modalEl.remove();modalEl=null;if(f)f()}}
function confirmBox(msg,okLabel){
  return new Promise(res=>{
    const m=openModal(`<h3>Confirmer</h3><p class="hint" style="margin-top:8px">${esc(msg)}</p><div class="row" style="margin-top:18px"><button class="btn bad" data-ok>${esc(okLabel||'Confirmer')}</button><button class="btn line" data-x>Annuler</button></div>`,()=>res(false));
    $('[data-ok]',m).onclick=()=>{m._onclose=null;closeModal();res(true)};
  });
}
function openLightbox(list,i){
  let k=i;const lb=document.createElement('div');lb.className='lb';
  const draw=()=>{const g=list[k];lb.innerHTML=`<div class="imgwrap"><img src="${IMG[g.id]||''}" alt="${esc(g.cap||'')}"></div><div class="cap">${esc(g.cap||'')} · ${k+1}/${list.length}</div><button class="cl" aria-label="Fermer">${ic('x',22)}</button>${list.length>1?`<button class="pv" aria-label="Précédente">${ic('left',22)}</button><button class="nx" aria-label="Suivante">${ic('right',22)}</button>`:''}`};
  const go=d=>{k=(k+d+list.length)%list.length;draw()};
  lb.addEventListener('click',e=>{if(e.target.closest('.cl')||e.target.classList.contains('imgwrap'))lb.remove();else if(e.target.closest('.pv'))go(-1);else if(e.target.closest('.nx'))go(1)});
  let x0=null;lb.addEventListener('touchstart',e=>{x0=e.touches[0].clientX},{passive:true});
  lb.addEventListener('touchend',e=>{if(x0==null)return;const dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>50)go(dx<0?1:-1);x0=null});
  draw();document.body.appendChild(lb);
}
