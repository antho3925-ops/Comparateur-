import sys, wave, numpy as np
for p in sys.argv[1:]:
    w=wave.open(p); sr=w.getframerate(); x=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(float)
    f0s=[]
    N=int(sr*0.04)
    for i in range(0,len(x)-N,N//2):
        s=x[i:i+N]; 
        if np.sqrt((s**2).mean())<1500: continue
        s=s-s.mean(); ac=np.correlate(s,s,'full')[N-1:]
        lo,hi=int(sr/400),int(sr/60); k=lo+np.argmax(ac[lo:hi])
        if ac[k]>0.4*ac[0]: f0s.append(sr/k)
    print(p, 'median F0 %.0f Hz'%np.median(f0s), len(f0s))
