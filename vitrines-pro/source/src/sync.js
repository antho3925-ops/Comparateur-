/* ===== Synchronisation en direct (Firebase Firestore, API REST) =====
   Les données restent d'abord sur le téléphone. Dès qu'il y a du réseau, elles sont envoyées et reçues.
   Un seul regroupement "items" : p-<id> prospects, q- devis, a- rendez-vous, s-main réglages, v-<appareil> démos vues. */
const SYNC={busy:false,soonT:null,onChange:null,started:false};
const syncOn=()=>!!(S.sync&&S.sync.on&&S.sync.cfg.pid&&S.sync.cfg.key&&S.sync.cfg.team);
const fsRoot=c=>(c.host||'https://firestore.googleapis.com')+'/v1/projects/'+encodeURIComponent(c.pid)+'/databases/(default)/documents';
const fsName=(c,k)=>'projects/'+c.pid+'/databases/(default)/documents/teams/'+c.team+'/items/'+k;
async function fsPost(url,body){
  const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(!r.ok){let m='';try{const j=await r.json();m=(j.error&&j.error.message)||''}catch(e){}
    throw new Error(r.status===403?'Accès refusé : vérifiez les règles Firestore et le code d\'équipe':r.status===400&&/API key/i.test(m)?'Clé API invalide':r.status===404?'Projet ou base Firestore introuvable':('Erreur '+r.status+(m?' · '+m:'')))}
  return r.json();
}
const sharedSettings=()=>{const s=Object.assign({},S.settings);delete s.pin;delete s.pinChanged;return s};
function collectDirty(){
  const out=[],P=S.sync.pushed;
  const add=(type,r)=>{const k=type+'-'+r.id,u=r.updatedAt||r.createdAt||0;if((P[k]||0)<u)out.push({k,u,d:false,rec:r})};
  S.prospects.forEach(r=>add('p',r));S.quotes.forEach(r=>add('q',r));S.appts.forEach(r=>add('a',r));
  S.sync.tomb.forEach(t=>{if((P[t.k]||0)<t.u)out.push({k:t.k,u:t.u,d:true,rec:{id:t.k.slice(2)}})});
  const su=S.settings.updatedAt||0;if(su&&(P['s-main']||0)<su)out.push({k:'s-main',u:su,d:false,rec:sharedSettings()});
  const vk='v-'+S.deviceId;if((S.viewsU||0)&&(P[vk]||0)<S.viewsU)out.push({k:vk,u:S.viewsU,d:false,rec:{views:S.views}});
  return out;
}
async function pushDirty(list){
  const c=S.sync.cfg,url=fsRoot(c)+':commit?key='+encodeURIComponent(c.key);
  for(let i=0;i<list.length;i+=100){
    const part=list.slice(i,i+100);
    await fsPost(url,{writes:part.map(x=>({update:{name:fsName(c,x.k),fields:{j:{stringValue:JSON.stringify(x.rec)},u:{integerValue:String(x.u)},d:{booleanValue:!!x.d}}},updateTransforms:[{fieldPath:'s',setToServerValue:'REQUEST_TIME'}]}))});
    part.forEach(x=>{S.sync.pushed[x.k]=x.u});
  }
  S.sync.tomb=S.sync.tomb.filter(t=>(S.sync.pushed[t.k]||0)<t.u);
}
const unionBy=(a,b,key)=>{const m=new Map();(a||[]).concat(b||[]).forEach(x=>{m.set(key(x),x)});return Array.from(m.values())};
function applyRemote(doc){
  const f=doc.fields||{},k=doc.name.split('/').pop(),type=k.charAt(0),u=+((f.u||{}).integerValue||0),del=!!(f.d&&f.d.booleanValue);
  let rec;try{rec=JSON.parse(f.j.stringValue)}catch(e){return 0}
  const P=S.sync.pushed;
  if(type==='s'){if(u>(S.settings.updatedAt||0)){const keep={pin:S.settings.pin,pinChanged:S.settings.pinChanged};S.settings=Object.assign({},S.settings,rec,keep,{updatedAt:u});P[k]=u;return 1}P[k]=Math.max(P[k]||0,u);return 0}
  if(type==='v'){const id=k.slice(2);if(id!==S.deviceId){S.viewsRemote[id]=rec.views||{};return 1}return 0}
  const arr={p:S.prospects,q:S.quotes,a:S.appts}[type];if(!arr)return 0;
  const id=k.slice(2),i=arr.findIndex(x=>x.id===id),lu=i>=0?(arr[i].updatedAt||arr[i].createdAt||0):0;
  if(del){if(i>=0&&lu<=u){arr.splice(i,1);P[k]=u;return 1}P[k]=Math.max(P[k]||0,u);return 0}
  if(i<0){if(S.sync.tomb.some(t=>t.k===k))return 0;arr.push(rec);P[k]=u;return 1}
  if(u>lu){
    if(type==='p'){const loc=arr[i];const notes=unionBy(rec.notes,loc.notes,n=>n.t+'|'+n.x).sort((a,b)=>b.t-a.t),viewed=Array.from(new Set((rec.viewed||[]).concat(loc.viewed||[])));
      const extra=notes.length!==(rec.notes||[]).length||viewed.length!==(rec.viewed||[]).length;rec.notes=notes;rec.viewed=viewed;if(extra)rec.updatedAt=Date.now()}
    arr[i]=rec;P[k]=Math.max(u,rec.updatedAt||0)===u?u:P[k];return 1}
  if(u===lu)P[k]=u;
  return 0;
}
const tsMs=s=>Date.parse(s)||0;
async function pullChanges(){
  const c=S.sync.cfg,url=fsRoot(c)+'/teams/'+encodeURIComponent(c.team)+':runQuery?key='+encodeURIComponent(c.key);
  let changed=0;
  for(let g=0;g<20;g++){
    const res=await fsPost(url,{structuredQuery:{from:[{collectionId:'items'}],where:{fieldFilter:{field:{fieldPath:'s'},op:'GREATER_THAN_OR_EQUAL',value:{timestampValue:S.sync.last}}},orderBy:[{field:{fieldPath:'s'}}],limit:500}});
    const docs=(Array.isArray(res)?res:[]).filter(x=>x.document).map(x=>x.document);
    docs.forEach(d=>{changed+=applyRemote(d)});
    if(docs.length){const ls=docs[docs.length-1].fields.s.timestampValue;if(tsMs(ls)>tsMs(S.sync.last))S.sync.last=ls}
    if(docs.length<500)break;
  }
  return changed;
}
async function syncNow(){
  if(!syncOn()||SYNC.busy)return;
  if(typeof navigator!=='undefined'&&navigator.onLine===false){S.sync.err='';SYNC.notify&&SYNC.notify(0);return}
  SYNC.busy=true;let changed=0,ok=false;
  try{changed=await pullChanges();const dirty=collectDirty();if(dirty.length)await pushDirty(dirty);S.sync.lastOk=Date.now();S.sync.err='';ok=true}
  catch(e){S.sync.err=String(e&&e.message||e)}
  finally{SYNC.busy=false;saveQuiet();if(SYNC.onChange)SYNC.onChange(changed,ok)}
}
function syncSoon(){if(!syncOn())return;clearTimeout(SYNC.soonT);SYNC.soonT=setTimeout(syncNow,1500)}
function syncStart(){
  if(SYNC.started)return;SYNC.started=true;
  setInterval(()=>{if(typeof document==='undefined'||document.visibilityState==='visible')syncNow()},30000);
  window.addEventListener('online',syncNow);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')syncNow()});
  setTimeout(syncNow,800);
}
function syncLabel(){
  if(!syncOn())return 'Synchronisation désactivée';
  if(SYNC.busy)return 'Synchronisation en cours…';
  if(S.sync.err)return 'Erreur : '+S.sync.err;
  if(typeof navigator!=='undefined'&&navigator.onLine===false)return 'Hors ligne : les notes partiront dès que le réseau revient';
  if(!S.sync.lastOk)return 'En attente de la première synchronisation';
  const s=Math.round((Date.now()-S.sync.lastOk)/1000);
  return 'Synchronisé '+(s<60?'à l\'instant':'il y a '+Math.round(s/60)+' min');
}
function syncPending(){return syncOn()?collectDirty().length:0}
const joinCode=()=>{const c=S.sync.cfg;return btoa(unescape(encodeURIComponent(JSON.stringify({p:c.pid,k:c.key,t:c.team,h:c.host||''})))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
function parseJoin(code){try{let b=String(code).trim().replace(/-/g,'+').replace(/_/g,'/');while(b.length%4)b+='=';const o=JSON.parse(decodeURIComponent(escape(atob(b))));if(o.p&&o.k&&o.t)return{pid:o.p,key:o.k,team:o.t,host:o.h||''}}catch(e){}return null}
const newTeamCode=()=>{const a=new Uint8Array(18);try{crypto.getRandomValues(a)}catch(e){for(let i=0;i<18;i++)a[i]=Math.floor(Math.random()*256)}return Array.from(a).map(x=>'abcdefghjkmnpqrstuvwxyz23456789'[x%31]).join('')};
function syncConnect(cfg){
  S.sync.cfg=Object.assign({pid:'',key:'',team:'',host:''},cfg);S.sync.on=true;S.sync.last='1970-01-01T00:00:00Z';S.sync.pushed={};S.sync.err='';S.sync.lastOk=0;saveQuiet();
  return syncNow();
}
const FIRESTORE_RULES="rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /teams/{team}/items/{item} {\n      allow read, write: if true;\n    }\n  }\n}";
