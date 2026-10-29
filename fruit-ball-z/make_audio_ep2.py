"""Synthèse de la bande-son de Fruit Ball Z ép.2 : musique + bruitages + mixage des voix.

Mêmes instruments de synthèse que make_audio.py. Sortie : fbz/public/audio/ep2/mix.wav
Usage : python3 make_audio_ep2.py <dossier qui contient fbz/>
"""
import json, sys, wave
import numpy as np

S = sys.argv[1]
FBZ = S + '/fbz'
SR = 44100
FPS = 30
TL = json.load(open(FBZ + '/src/timeline2.json'))
TOTAL = TL['total'] / FPS
N = int(TOTAL * SR)
rng = np.random.default_rng(12)


def f2s(frame):
    return int(frame / FPS * SR)


def t(d):
    return np.arange(int(d * SR)) / SR


def env_adsr(n, a=0.01, r=0.2, curve=1.0):
    e = np.ones(n)
    na, nr = min(n, int(a * SR)), min(n, int(r * SR))
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr) ** curve
    return e


def fft_filter(x, lo=None, hi=None):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    g = np.ones_like(f)
    if hi: g *= 1 / np.sqrt(1 + (f / hi) ** 4)
    if lo: g *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1e-3)) ** 4)
    return np.fft.irfft(X * g, len(x))


def add(buf, sig, start_s, gain=1.0):
    i = int(start_s * SR)
    if i >= len(buf): return
    sig = sig[: len(buf) - i]
    buf[i:i + len(sig)] += sig * gain


def note(freq, d, kind='pluck', vib=0.0):
    tt = t(d)
    ph = 2 * np.pi * freq * tt + (vib * np.sin(2 * np.pi * 5 * tt) if vib else 0)
    if kind == 'pluck':
        s = sum(np.sin(ph * k) / k ** 1.6 for k in range(1, 6)) * np.exp(-tt * 4.5)
        return s * env_adsr(len(tt), 0.004, 0.05)
    if kind == 'pad':
        s = sum(np.sin(ph * k + k) / k ** 2 for k in range(1, 5))
        s += 0.5 * np.sin(2 * np.pi * freq * 1.003 * tt)
        return s * env_adsr(len(tt), d * 0.35, d * 0.4)
    if kind == 'saw':
        s = sum(np.sin(ph * k) / k for k in range(1, 12))
        return s * env_adsr(len(tt), 0.01, 0.08)
    if kind == 'brass':
        s = sum(np.sin(ph * k) / k ** 1.1 * (1 - 0.06 * k) for k in range(1, 10))
        return s * env_adsr(len(tt), 0.08, 0.3)
    if kind == 'piano':
        s = sum(np.sin(ph * k + 0.3 * k) / k ** 1.8 * np.exp(-tt * (1.2 + 0.7 * k)) for k in range(1, 7))
        return s * env_adsr(len(tt), 0.005, 0.25)
    if kind == 'bell':
        s = np.sin(ph) + 0.4 * np.sin(ph * 2.76) + 0.2 * np.sin(ph * 5.4)
        return s * np.exp(-tt * 2.2)


def mtof(m):
    return 440 * 2 ** ((m - 69) / 12)


def drum(d=0.6, f0=90, f1=45, noise=0.25):
    tt = t(d)
    f = f1 + (f0 - f1) * np.exp(-tt * 18)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 6)
    s += noise * fft_filter(rng.standard_normal(len(tt)), hi=1500) * np.exp(-tt * 25)
    return s


def noise_burst(d, lo, hi, decay, attack=0.002):
    tt = t(d)
    s = fft_filter(rng.standard_normal(len(tt)), lo=lo, hi=hi)
    s /= np.abs(s).max() + 1e-9
    return s * np.exp(-tt * decay) * env_adsr(len(tt), attack, 0.05)


def whoosh(d, f_from, f_to, peak=0.5):
    """Bruit filtré dont la bande passante glisse de f_from à f_to (par blocs fondus)."""
    n = int(d * SR)
    out = np.zeros(n)
    blk = 2048
    base = rng.standard_normal(n + blk)
    win = np.hanning(blk * 2)
    for i in range(0, n, blk):
        p = i / n
        fc = f_from * (f_to / f_from) ** p
        seg = base[i:i + blk * 2]
        if len(seg) < blk * 2: seg = np.pad(seg, (0, blk * 2 - len(seg)))
        seg = fft_filter(seg, lo=fc * 0.5, hi=fc * 1.6) * win
        j = min(n, i + blk * 2)
        out[i:j] += seg[: j - i]
    tt = np.linspace(0, 1, n)
    shape = np.where(tt < peak, tt / peak, (1 - tt) / (1 - peak)) ** 1.5
    out *= shape
    return out / (np.abs(out).max() + 1e-9)


def bird(start, buf, gain):
    for k in range(rng.integers(2, 5)):
        d = rng.uniform(0.05, 0.11)
        tt = t(d)
        f = rng.uniform(2800, 4200) + rng.uniform(800, 1800) * np.sin(np.pi * tt / d) * rng.choice([-1, 1])
        s = np.sin(2 * np.pi * np.cumsum(f) / SR + 3 * np.sin(2 * np.pi * 60 * tt))
        add(buf, s * np.sin(np.pi * tt / d) ** 2, start + k * rng.uniform(0.09, 0.16), gain)



def sec(frame):
    return frame / FPS


def kick(d=0.35):
    return drum(d, 120, 45, 0.1)


def snare(d=0.25):
    tt = t(d)
    return over(0.6 * noise_burst(d, 900, 7000, 18), 0.4 * np.sin(2 * np.pi * 190 * tt) * np.exp(-tt * 25))


def over(*sigs):
    """Superpose des signaux de longueurs différentes."""
    out = np.zeros(max(len(x) for x in sigs))
    for x in sigs: out[:len(x)] += x
    return out


def punch():
    return over(drum(0.3, 160, 60, 0.6), 0.5 * noise_burst(0.15, 300, 4000, 30))


def thud():
    """Atterrissage lourd : sub + craquement."""
    return over(drum(1.4, 70, 28, 0.0) * 1.2, 0.7 * noise_burst(1.6, 30, 700, 2.2))


def slide(d, f0, f1):
    """Sifflet à coulisse (effet comique)."""
    tt = t(d)
    f = f0 * (f1 / f0) ** (tt / d)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR + 0.4 * np.sin(2 * np.pi * 6 * tt))
    return s * env_adsr(len(tt), 0.02, 0.06)


def crackle(d, rise=True):
    """Énergie qui grésille : bourdonnement qui monte + étincelles."""
    tt = t(d)
    p = tt / d
    f = 80 + (420 if rise else 0) * p ** 1.6
    hum = sum(np.sin(2 * np.pi * np.cumsum(f * k) / SR) / k for k in (1, 2, 3))
    hum *= (0.25 + 0.75 * p) * (1 + 0.3 * np.sin(2 * np.pi * 9 * tt))
    sp = np.zeros(len(tt))
    for _ in range(int(d * 30)):
        i = rng.integers(0, len(tt))
        w = noise_burst(0.03, 2500, 10000, 120)[: len(tt) - i]
        sp[i:i + len(w)] += w * (0.3 + p[i])
    return hum * 0.5 + sp * 0.35


def wind(d, gain_lfo=0.15):
    tt = t(d)
    w = fft_filter(rng.standard_normal(len(tt)), lo=200, hi=900)
    w /= np.abs(w).max()
    return w * (0.6 + 0.4 * np.sin(2 * np.pi * gain_lfo * tt + 1.3) * np.sin(2 * np.pi * 0.07 * tt))


music = np.zeros(N)
sfx = np.zeros(N)
voice = np.zeros(N)
SCN = {k: (sec(a), sec(b)) for k, (a, b) in TL['scenes'].items()}

# ---- Carton d'ouverture : coup + cymbale + motif héroïque
add(music, drum(1.2, 70, 35, 0.4), 0.05, 0.9)
add(music, noise_burst(2.0, 2000, 12000, 1.6), 0.05, 0.16)
for i, m in enumerate([62, 69, 74, 78]):
    add(music, note(mtof(m), 0.7, 'brass', vib=0.3), 0.3 + i * 0.14, 0.08)
for m in [50, 57, 62, 66]:
    add(music, note(mtof(m), 1.3, 'brass', vib=0.4), 0.9, 0.06)

# ---- Précédemment : avance rapide (souffles aigus) + ostinato tendu accéléré
r0, r1 = SCN['recap']
add(sfx, whoosh(0.5, 3000, 600, 0.3), r0 - 0.1, 0.3)
for k in range(4):
    add(sfx, whoosh(0.35, 800, 6000, 0.6), r0 + k * 1.5 - 0.15, 0.25)
add(music, fft_filter(rng.standard_normal(int((r1 - r0) * SR)), lo=2000, hi=6000) * 0.04, r0)  # souffle de bande
ost = [62, 65, 64, 62, 61, 62, 65, 67]
tb, k = r0, 0
while tb < r1 - 0.1:
    add(music, note(mtof(ost[k % 8] - 12), 0.18, 'saw'), tb, 0.05)
    if k % 4 == 0: add(music, drum(0.5, 110, 48, 0.15), tb, 0.3)
    tb += 60 / 150 / 2; k += 1
tt = t(r1 - r0)
add(music, (np.sin(2 * np.pi * mtof(38) * tt) + 0.5 * np.sin(2 * np.pi * mtof(45) * tt)) * np.clip(tt, 0, 1), r0, 0.08)

# ---- Vent sur tout le verger (scène 1 -> fin), plus présent à la fin
s1 = SCN['s1'][0]
add(sfx, wind(TOTAL - s1), s1, 0.07)

# ---- Scène 1 : nappe sombre + taiko lents, atterrissage lourd de Kiwikolo
a, b = SCN['s1']
tt = t(b - a)
pad = sum(np.sin(2 * np.pi * mtof(m) * tt + i) for i, m in enumerate([45, 52, 57])) * np.clip(tt / 2, 0, 1)
add(music, pad * (0.7 + 0.3 * np.sin(2 * np.pi * 0.2 * tt)), a, 0.04)
for tb in np.arange(a + 0.5, b, 60 / 70):
    add(music, drum(0.8, 100, 45, 0.1), tb, 0.22)
land = sec(TL['kiwiLand'])
add(sfx, whoosh(0.6, 400, 3000, 0.9), land - 0.55, 0.5)
add(sfx, thud(), land, 1.0)
for k in range(10):
    add(sfx, noise_burst(0.1, 1500, 6000, 30), land + 0.1 + rng.uniform(0, 1.0), rng.uniform(0.05, 0.15))
# cordes qui montent pendant la réponse de Pomgoku
l2 = TL['voices']['l2']
for i, m in enumerate([57, 60, 64]):
    add(music, note(mtof(m), sec(l2['end'] - l2['start']) + 1.0, 'brass', vib=0.3), sec(l2['start']), 0.035)

# ---- Scène 2 : musique de combat rythmée (140 bpm)
a, b = SCN['s2']
e = sec(TL['s2shots'][4])
bpm = 140; beat = 60 / bpm
bass = [45, 45, 48, 45, 43, 43, 44, 44]
tb, k = a, 0
while tb < b - 0.05:
    loud = 1.0 if tb < e else 0.5
    if k % 2 == 0: add(music, kick(), tb, 0.45 * loud)
    if k % 4 == 2: add(music, snare(), tb, 0.3 * loud)
    add(music, note(mtof(bass[(k // 2) % 8]), beat * 0.45, 'saw'), tb, 0.07 * loud)
    add(music, note(mtof([69, 72, 71, 69, 67, 69, 72, 74][k % 8]), beat * 0.4, 'pluck'), tb, 0.06 * loud)
    tb += beat / 2; k += 1
for at in [a, sec(TL['s2shots'][3]), e]:
    for m in [45, 52, 57]:
        add(music, note(mtof(m), 1.0, 'brass', vib=0.3), at, 0.06)
for sh in TL['s2shots'][1:4]:
    add(sfx, whoosh(0.4, 600, 5000, 0.5), sec(sh) - 0.2, 0.45)
for h in TL['s2hits']:
    add(sfx, whoosh(0.22, 1500, 6000, 0.7), sec(h) - 0.2, 0.35)
    add(sfx, punch(), sec(h), 0.55)
add(sfx, whoosh(1.0, 300, 3000, 0.3), sec(TL['s2hits'][4]), 0.4)  # Raditz s'envole

# ---- Scène 3 : petite reprise, puis COUPURE NETTE à la morsure
a, b = SCN['s3']
bite = sec(TL['bite']); back = sec(TL['musicBack']); off = sec(TL['shakeOff'])
tb, k = a, 0
while tb < bite:
    add(music, note(mtof([72, 76, 79, 76][k % 4]), 0.15, 'pluck'), tb, 0.07)
    if k % 2 == 0: add(music, kick(0.2), tb, 0.25)
    tb += 60 / 160 / 2; k += 1
music[int(bite * SR):int(back * SR)] = 0
add(sfx, drum(0.25, 220, 120, 0.8), bite, 0.6)                     # CHOMP
add(sfx, noise_burst(0.25, 1500, 6000, 12), bite + 0.02, 0.35)
add(sfx, slide(0.35, 1400, 300), bite + 0.05, 0.12)               # disque rayé
add(sfx, slide(0.9, 500, 1800), sec(TL['voices']['l4']['start']) + 0.1, 0.08)  # sifflet comique
add(sfx, whoosh(0.6, 500, 4000, 0.4), off, 0.4)
add(sfx, slide(0.9, 1800, 400), off + 0.05, 0.09)
add(sfx, note(mtof(96), 1.2, 'bell'), off + 0.55, 0.15)          # petite étoile
# la musique repart
tb, k = back, 0
while tb < b:
    if k % 2 == 0: add(music, kick(), tb, 0.4)
    if k % 4 == 2: add(music, snare(), tb, 0.25)
    add(music, note(mtof(bass[(k // 2) % 8]), beat * 0.45, 'saw'), tb, 0.06)
    tb += beat / 2; k += 1
add(music, note(mtof(57), 0.8, 'brass'), back, 0.08)

# ---- Scène 4 : tension, prise, charge du rayon, déflagration
a, b = SCN['s4']
grab = sec(TL['grabbed']); close = sec(TL['closeup']); fire = sec(TL['fire']); hit = sec(TL['hit'])
tt = t(fire - a)
dr = (np.sin(2 * np.pi * mtof(36) * tt) + 0.6 * np.sin(2 * np.pi * mtof(43) * tt * 1.003)) * np.clip(tt / 2, 0, 1) * (0.5 + 0.5 * tt / tt[-1])
add(music, dr, a, 0.12)
tb = a
while tb < fire - 0.1:  # battements de cœur qui accélèrent
    sp = 0.85 - 0.4 * (tb - a) / (fire - a)
    add(music, drum(0.4, 70, 40, 0.0), tb, 0.35); add(music, drum(0.4, 70, 40, 0.0), tb + 0.2, 0.22)
    tb += sp
add(sfx, whoosh(0.5, 500, 4000, 0.6), grab - 0.45, 0.4)
add(sfx, thud(), grab, 0.5)
add(sfx, crackle(fire - close), close, 0.35)
for i, m in enumerate([50, 53, 57, 62]):
    add(music, note(mtof(m), fire - close, 'pad'), close, 0.03)
add(sfx, drum(1.0, 90, 30, 0.5), fire, 0.8)                       # départ du tir
add(sfx, whoosh(hit - fire + 0.3, 150, 900, 0.8), fire, 0.8)       # rayon au ralenti (grave)
add(sfx, crackle(hit - fire, rise=False), fire, 0.25)
add(sfx, drum(2.5, 55, 22, 0.0), hit, 1.0)                        # déflagration
add(sfx, noise_burst(3.0, 30, 1200, 1.3), hit, 1.0)
add(sfx, noise_burst(1.5, 800, 9000, 3), hit, 0.4)
music[int(hit * SR):int(b * SR)] = 0

# ---- Scène 5 : thème triste au piano (la mineur), coupé avant le fondu -> il ne reste que le vent
a, b = SCN['s5']
fade0 = sec(TL['fade'][0])
pb = 60 / 66
prog = [(57, [57, 64, 69, 72]), (53, [53, 60, 65, 69]), (48, [48, 55, 60, 64]), (55, [55, 62, 67, 71])]
mel = [76, 74, 72, 71, 72, 69, 67, 69]
tb, bar = a + 0.8, 0
while tb < fade0 - 0.5:
    root, arp = prog[bar % 4]
    add(music, note(mtof(root - 12), pb * 4, 'piano'), tb, 0.16)
    for i in range(4):
        add(music, note(mtof(arp[i]), pb * 2, 'piano'), tb + i * pb, 0.09)
    add(music, note(mtof(mel[(bar * 2) % 8]), pb * 2, 'piano'), tb, 0.11)
    add(music, note(mtof(mel[(bar * 2 + 1) % 8]), pb * 2, 'piano'), tb + 2 * pb, 0.1)
    add(music, note(mtof(root), pb * 4, 'pad'), tb, 0.025)
    tb += pb * 4; bar += 1
i0 = int((fade0 - 1.5) * SR); i1 = int(fade0 * SR)
music[i0:i1] *= np.linspace(1, 0, i1 - i0); music[i1:int(b * SR)] = 0
add(sfx, wind(b - a + 3), a, 0.08)   # rafales plus fortes à la fin

# ---- Teaser : montée mystérieuse, tonnerre, coup final sur le titre
a, b = SCN['teaser']
t0, t1, t2 = [sec(x) for x in TL['teaserShots']]
tt = t(b - a)
rise = np.clip(tt / (b - a), 0, 1)
dr = (np.sin(2 * np.pi * mtof(33) * tt) + 0.5 * np.sin(2 * np.pi * mtof(40) * tt) + 0.3 * np.sin(2 * np.pi * mtof(45) * tt * (1 + 0.02 * rise)))
add(music, dr * (0.3 + rise), a, 0.07)
add(music, whoosh(b - a, 150, 3000, 0.95), a, 0.06)
for st in [t0 + 18 / FPS, t0 + 44 / FPS, t1 + 12 / FPS, t1 + 40 / FPS, t2 + 30 / FPS]:
    add(sfx, noise_burst(2.2, 25, 500, 1.4, attack=0.01), st, 0.7)   # tonnerre
    add(sfx, noise_burst(0.3, 2000, 9000, 14), st, 0.25)
tb = t1
while tb < t2 + 24 / FPS:
    add(music, drum(0.3, 90, 50, 0.1), tb, 0.2 + 0.3 * (tb - t1) / (t2 - t1 + 1))
    tb += 0.12
ttl = t2 + 24 / FPS
add(music, drum(1.4, 65, 30, 0.4), ttl, 0.9)
add(music, noise_burst(2.5, 2000, 12000, 1.4), ttl, 0.18)
for m in [45, 52, 57, 61, 64]:
    add(music, note(mtof(m), 2.4, 'brass', vib=0.5), ttl, 0.06)
tend = int((TOTAL - 0.7) * SR)
music[tend:] *= np.linspace(1, 0, len(music) - tend)

# ---- Voix
for k, v in TL['voices'].items():
    w = wave.open(f'{FBZ}/public/audio/ep2/{k}.wav')
    x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
    add(voice, x, v['start'] / FPS, 0.95)

# ---- Ducking de la musique et des sfx pendant les voix (musique bien en dessous)
venv = np.abs(voice)
k = int(0.05 * SR)
venv = np.convolve(venv, np.ones(k) / k, 'same')
duck = 1 - 0.6 * np.clip(venv / 0.05, 0, 1)
duck = np.convolve(duck, np.ones(int(0.15 * SR)) / int(0.15 * SR), 'same')

mix = (music * duck) * 0.85 + sfx * (0.4 + 0.6 * duck) + voice * 1.1
peak = np.abs(mix).max()
mix = np.tanh(mix / peak * 1.3) / np.tanh(1.3) * 0.95
pcm = (mix * 32767).astype(np.int16)
stereo = np.repeat(pcm[:, None], 2, axis=1)
with wave.open(FBZ + '/public/audio/ep2/mix.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(stereo.tobytes())
print('mix ok', TOTAL, 's', 'peak', peak)
