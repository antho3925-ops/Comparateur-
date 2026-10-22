import re, json, base64, os, sys
from PIL import Image, ImageDraw
SRC='src/'
js_files=['core.js','engine.js','demos1.js','demos2.js','demos3.js','pages.js','admin.js','main.js']
js=''.join(open(SRC+f).read()+'\n' for f in js_files)
demos_src=''.join(open(SRC+f).read() for f in ['demos1.js','demos2.js','demos3.js'])
ids=set(re.findall(r"(?:img|id|cover|before|after):\s*'?(\d+[ab]?)'?",demos_src))
missing=[i for i in ids if not os.path.exists(f'img/{i}.webp')]
if missing: print('MISSING images',missing)
IMG={}
for i in sorted(ids):
    p=f'img/{i}.webp'
    if os.path.exists(p): IMG[i]='data:image/webp;base64,'+base64.b64encode(open(p,'rb').read()).decode()
fonts=open('fonts.css').read()
css=open(SRC+'shell.css').read()+open(SRC+'site.css').read()
imgjs='const IMG='+json.dumps(IMG,separators=(',',':'))+';\n'
print('images used',len(IMG),'size',sum(len(v) for v in IMG.values())//1024,'KB b64')

def standalone():
    return f"""<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#12141c"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="Vitrines Pro">
<title>Vitrines Pro</title><link rel="manifest" href="manifest.webmanifest"><link rel="apple-touch-icon" href="icon-192.png"><link rel="icon" href="icon-192.png">
<style>:root{{padding-top:env(safe-area-inset-top,0px)}}
{fonts}
{css}</style></head><body><div id="app"></div>
<script>const STANDALONE=true;
{imgjs}{js}</script></body></html>"""
def artifact():
    return f"""<title>Vitrines Pro</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
{fonts}
{css}</style>
<div id="app"></div>
<script>const STANDALONE=false;
{imgjs}{js}</script>"""
os.makedirs('dist',exist_ok=True)
open('dist/index.html','w').write(standalone())
open('dist/artifact.html','w').write(artifact())
open('dist/manifest.webmanifest','w').write(json.dumps({"name":"Vitrines Pro","short_name":"Vitrines","description":"Portfolio de démos de sites pour commerces","start_url":"./index.html","scope":"./","display":"standalone","orientation":"portrait","background_color":"#12141c","theme_color":"#12141c","lang":"fr","icons":[{"src":"icon-192.png","sizes":"192x192","type":"image/png"},{"src":"icon-512.png","sizes":"512x512","type":"image/png","purpose":"any maskable"}]},ensure_ascii=False,indent=1))
open('dist/sw.js','w').write("""const CACHE='vitrines-pro-v%s';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(caches.open(CACHE).then(cache=>cache.match(e.request,{ignoreSearch:true}).then(cached=>{
    const net=fetch(e.request).then(res=>{if(res&&res.status===200)cache.put(e.request,res.clone());return res}).catch(()=>cached||cache.match('./index.html'));
    return cached||net;})));
});
""" % __import__('time').strftime('%Y%m%d%H%M%S'))
def icon(n):
    im=Image.new('RGB',(n,n),(18,20,28)); d=ImageDraw.Draw(im)
    for y in range(n):
        for x in range(0,n,1):
            pass
    g=Image.new('RGB',(n,n))
    px=g.load()
    for y in range(n):
        for x in range(n):
            t=(x+y)/(2*n); px[x,y]=(int(53+(138-53)*t),int(82+(92-82)*t),int(255+(255-255)*t))
    m=Image.new('L',(n,n),0); ImageDraw.Draw(m).rounded_rectangle((0,0,n-1,n-1),radius=int(n*.22),fill=255)
    im.paste(g,(0,0),m); d=ImageDraw.Draw(im)
    s=n/100; d.line([(30*s,72*s),(50*s,30*s),(70*s,72*s)],fill='white',width=max(2,int(7*s)),joint='curve'); d.line([(40*s,58*s),(60*s,58*s)],fill='white',width=max(2,int(7*s)))
    return im
icon(192).save('dist/icon-192.png'); icon(512).save('dist/icon-512.png')
print('standalone',os.path.getsize('dist/index.html')//1024,'KB; artifact',os.path.getsize('dist/artifact.html')//1024,'KB')
