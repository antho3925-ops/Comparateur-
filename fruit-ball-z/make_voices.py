import subprocess, json, wave, numpy as np, os, sys
S=sys.argv[1]; V=S+'/voices'; OUT=S+'/fbz/public/audio'
POM=V+'/voice-fr-gilles-low/fr-gilles-low.onnx'; RAD=V+'/voice-fr-mls_1840-low/fr-mls_1840-low.onnx'
lines=[
 ('l1',POM,"Encore une pomme bien juteuse aujourd'hui, hein Petit-Poirsan !",0.88,'pitch 300 tempo 1.0 gain -1',''),
 ('l2',RAD,"Tu ne sais même pas ce que tu es vraiment... pathétique.",1.08,'pitch -330 gain -1','reverb 25 50 60'),
 ('l3',POM,"Rends-moi mon fils, tout de suite !",0.85,'pitch 380 gain -1',''),
 ('l4',RAD,"Deviens plus fort, petit frère... ou regarde-le disparaître.",1.0,'pitch -330 gain -1','reverb 30 50 70'),
 ('l5',POM,"Je te jure... que je vais te faire payer ça.",1.12,'pitch -120 gain -1','reverb 15 50 40'),
]
meta={}
for k,m,t,ls,fx,rv in lines:
    raw=f'{OUT}/{k}_raw.wav'
    subprocess.run(['python3','-m','piper','-m',m,'--length-scale',str(ls),'--sentence-silence','0','-f',raw],input=t.encode(),check=True,stderr=subprocess.DEVNULL)
    wav=f'{OUT}/{k}.wav'
    cmd=f"sox {raw} -r 44100 -c 1 {wav} {fx} {rv} silence 1 0.02 0.5% reverse silence 1 0.02 0.5% reverse norm -1"
    subprocess.run(cmd,shell=True,check=True)
    os.remove(raw)
    w=wave.open(wav); sr=w.getframerate(); x=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(float)/32768
    hop=sr//30; env=[float(np.sqrt((x[i:i+hop]**2).mean())) for i in range(0,len(x),hop)]
    mx=max(env); env=[round(min(1,(e/mx)**0.7*1.15),3) if e>0.02*mx else 0 for e in env]
    meta[k]={'text':t,'frames':len(env),'mouth':env}
    print(k, len(x)/sr)
json.dump(meta,open(S+'/fbz/src/voices.json','w'))
