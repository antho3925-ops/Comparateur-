import subprocess, json, wave, numpy as np, os, sys
S=sys.argv[1]; V=S+'/voices2'; OUT=S+'/fbz/public/audio'
TOM=V+'/vits-piper-fr_FR-tom-medium/fr_FR-tom-medium.onnx'
UPMC=V+'/vits-piper-fr_FR-upmc-medium/fr_FR-upmc-medium.onnx'
# clé, modèle, locuteur, texte, length, noise, noise_w, effets sox
lines=[
 ('l1',TOM,0,["Encore une pomme bien juteuse aujourd'hui, hein, Petit-Poirsan !"],0.9,0.75,0.95,'pitch 100 treble +2'),
 ('l2',UPMC,1,["Tu ne sais même pas ce que tu es vraiment.","Pathétique."],1.3,0.6,0.7,'pitch -280 bass +5 120 reverb 12 40 30'),
 ('l3',TOM,0,["Rends-moi mon fils, tout de suite !"],0.86,0.8,1.0,'pitch 140 treble +3'),
 ('l4',UPMC,1,["Deviens plus fort, petit frère.","Ou regarde-le disparaître."],1.2,0.6,0.7,'pitch -280 bass +5 120 reverb 18 40 40'),
 ('l5',TOM,0,["Je te jure,","que je vais te faire payer ça."],1.12,0.6,0.8,'pitch -110 bass +4 100'),
]
meta={}
for k,m,spk,t,ls,ns,nw,fx in lines:
    parts=[]
    for j,seg in enumerate(t):
        pr=f'{OUT}/{k}_p{j}.wav'
        subprocess.run(['python3','-m','piper','-m',m,'-s',str(spk),'--length-scale',str(ls),'--noise-scale',str(ns),'--noise-w-scale',str(nw),'-f',pr],input=seg.encode(),check=True,stderr=subprocess.DEVNULL)
        subprocess.run(f"sox {pr} {pr}.t.wav silence 1 0.02 0.5% reverse silence 1 0.02 0.5% reverse",shell=True,check=True); os.replace(pr+'.t.wav',pr)
        parts.append(pr)
    durs=[float(subprocess.check_output(['soxi','-D',pp]).decode()) for pp in parts]
    sr0=int(subprocess.check_output(['soxi','-r',parts[0]]).decode())
    gap=f'{OUT}/{k}_gap.wav'; subprocess.run(f"sox -n -r {sr0} -c 1 {gap} trim 0 0.5",shell=True,check=True)
    seq=[]
    for j,pp in enumerate(parts): seq += ([gap] if j else []) + [pp]
    raw=f'{OUT}/{k}_raw.wav'; subprocess.run(['sox',*seq,raw],check=True)
    for pp in parts+[gap]: os.remove(pp)
    t=' '.join(t)
    wav=f'{OUT}/{k}.wav'
    subprocess.run(f"sox {raw} -r 44100 -c 1 {wav} gain -6 {fx} silence 1 0.02 0.5% reverse silence 1 0.02 0.5% reverse norm -1",shell=True,check=True)
    os.remove(raw)
    w=wave.open(wav); sr=w.getframerate(); x=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(float)/32768
    hop=sr//30; env=[float(np.sqrt((x[i:i+hop]**2).mean())) for i in range(0,len(x),hop)]
    mx=max(env); env=[round(min(1,(e/mx)**0.7*1.15),3) if e>0.02*mx else 0 for e in env]
    cuts=[]; acc=0
    for d in durs[:-1]: acc+=d; cuts.append(round((acc+0.25)*30)); acc+=0.5
    meta[k]={'text':t,'frames':len(env),'mouth':env,'cuts':cuts}
    print(k, round(len(x)/sr,2))
json.dump(meta,open(S+'/fbz/src/voices.json','w'))
