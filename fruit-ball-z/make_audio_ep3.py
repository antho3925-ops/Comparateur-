"""Synthèse de la bande-son de Fruit Ball Z ép.3 : musique + bruitages + mixage des voix.

Mêmes instruments de synthèse que make_audio.py. Sortie : fbz/public/audio/ep3/mix.wav
Usage : python3 make_audio_ep3.py <dossier qui contient fbz/>
"""
import json, sys, wave
import numpy as np

S = sys.argv[1]
FBZ = S + '/fbz'
SR = 44100
FPS = 30
TL = json.load(open(FBZ + '/src/timeline3.json'))
TOTAL = TL['total'] / FPS
N = int(TOTAL * SR)
rng = np.random.default_rng(13)


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



def beep(freq=1800, d=0.08):
    tt = t(d)
    return np.sin(2 * np.pi * freq * tt) * env_adsr(len(tt), 0.003, 0.02)


def flute(freq, d):
    tt = t(d)
    s = np.sin(2 * np.pi * freq * tt + 0.02 * np.sin(2 * np.pi * 5.2 * tt) * 2 * np.pi) + 0.15 * np.sin(4 * np.pi * freq * tt)
    s += 0.05 * fft_filter(rng.standard_normal(len(tt)), lo=freq, hi=freq * 3)
    return s * env_adsr(len(tt), 0.12, d * 0.5)


def rumble(d, rise=0.0):
    """Grondement de moteurs : bruit grave + bourdonnement, qui enfle de `rise`."""
    tt = t(d)
    n = fft_filter(rng.standard_normal(len(tt)), lo=25, hi=260)
    n /= np.abs(n).max() + 1e-9
    hum = np.sin(2 * np.pi * 55 * tt) + 0.5 * np.sin(2 * np.pi * 110 * tt + 0.3 * np.sin(2 * np.pi * 7 * tt))
    return (n * 0.8 + hum * 0.25) * (1 - rise + rise * tt / tt[-1])


def odd_bird(start, buf, gain):
    """Oiseau étrange de Namek : glissando ondulé, plus grave et plus « liquide »."""
    for k in range(rng.integers(2, 4)):
        d = rng.uniform(0.18, 0.32)
        tt = t(d)
        f = rng.uniform(900, 1500) * (1 + 0.6 * np.sin(np.pi * tt / d * rng.uniform(1, 3))) + 120 * np.sin(2 * np.pi * 18 * tt)
        sig = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / d) ** 2
        add(buf, sig, start + k * rng.uniform(0.25, 0.4), gain)


music = np.zeros(N)
sfx = np.zeros(N)
voice = np.zeros(N)
SCN = {k: (sec(a), sec(b)) for k, (a, b) in TL['scenes'].items()}

# ---- Carton d'ouverture : coup + cymbale + motif héroïque (comme l'ép.2)
add(music, drum(1.2, 70, 35, 0.4), 0.05, 0.9)
add(music, noise_burst(2.0, 2000, 12000, 1.6), 0.05, 0.16)
for i, m in enumerate([62, 69, 74, 78]):
    add(music, note(mtof(m), 0.7, 'brass', vib=0.3), 0.3 + i * 0.14, 0.08)
for m in [50, 57, 62, 66]:
    add(music, note(mtof(m), 1.3, 'brass', vib=0.4), 0.9, 0.06)

# ---- Précédemment : avance rapide + ostinato tendu accéléré
r0, r1 = SCN['recap']
add(sfx, whoosh(0.5, 3000, 600, 0.3), r0 - 0.1, 0.3)
for k in range(4):
    add(sfx, whoosh(0.35, 800, 6000, 0.6), r0 + k * 1.5 - 0.15, 0.25)
add(music, fft_filter(rng.standard_normal(int((r1 - r0) * SR)), lo=2000, hi=6000) * 0.04, r0)
ost = [62, 65, 64, 62, 61, 62, 65, 67]
tb, k = r0, 0
while tb < r1 - 0.1:
    add(music, note(mtof(ost[k % 8] - 12), 0.18, 'saw'), tb, 0.05)
    if k % 4 == 0: add(music, drum(0.5, 110, 48, 0.15), tb, 0.3)
    tb += 60 / 150 / 2; k += 1
tt = t(r1 - r0)
add(music, (np.sin(2 * np.pi * mtof(38) * tt) + 0.5 * np.sin(2 * np.pi * mtof(45) * tt)) * np.clip(tt, 0, 1), r0, 0.08)

# ---- Scène 1 : musique sombre de Végénade (ré mineur, bourdon grave, cuivres graves, triton)
a, b = SCN['s1']
holo = sec(TL['holo']); glow = sec(TL['glow'])
tt = t(b - a + 0.5)
drone = (np.sin(2 * np.pi * mtof(26) * tt) + 0.6 * np.sin(2 * np.pi * mtof(33) * tt * 1.002) + 0.3 * np.sin(2 * np.pi * mtof(32) * tt)) * np.clip(tt / 1.5, 0, 1)
add(music, drone * (0.8 + 0.2 * np.sin(2 * np.pi * 0.25 * tt)), a, 0.11)
add(sfx, wind(b - a), a, 0.05)                                   # vent glacé
for tb in np.arange(a + 0.3, b, 60 / 54):                        # pas lents de timbales
    add(music, drum(1.0, 75, 35, 0.05), tb, 0.3)
theme = [(50, 1.2), (53, 0.6), (52, 0.6), (50, 1.2), (49, 0.6), (44, 1.6)]  # ré fa mi ré do# sol# (triton)
tb = a + 0.6
for m, d in theme:
    add(music, note(mtof(m - 12), d * 1.1, 'brass', vib=0.2), tb, 0.07); tb += d
for i in range(3):                                               # bip d'hologramme
    add(sfx, beep(1760 if i < 2 else 2350), holo + i * 0.14, 0.18)
tt2 = t(b - holo)
add(sfx, np.sin(2 * np.pi * 220 * tt2) * (0.5 + 0.5 * np.sin(2 * np.pi * 3 * tt2)) * np.clip(tt2 * 3, 0, 1), holo, 0.025)  # ronronnement
add(sfx, crackle(0.9, rise=True), holo - 0.1, 0.1)
add(music, note(mtof(74), 2.5, 'bell'), holo, 0.05)
for m in [38, 44, 50]:                                           # colère : cuivres qui enflent
    add(music, note(mtof(m), b - glow + 0.6, 'brass', vib=0.4), glow - 0.8, 0.07)
add(sfx, crackle(b - glow, rise=True), glow - 0.5, 0.18)

# ---- Scène 2 : grondement des moteurs puis décollage épique (ré majeur, 120 bpm)
a, b = SCN['s2']
lift = sec(TL['liftoff']); sp = sec(TL['s2shots'][2])
add(sfx, rumble(lift - a, rise=0.8), a, 0.45)
add(sfx, rumble(b - lift + 0.5, rise=0.0) * np.linspace(1, 0.3, int((b - lift + 0.5) * SR)), lift, 0.55)
add(sfx, thud(), lift, 0.9)
add(sfx, whoosh(2.0, 200, 2500, 0.5), lift, 0.5)
add(sfx, noise_burst(2.5, 40, 1500, 1.2), lift, 0.6)
add(sfx, whoosh(1.2, 400, 4000, 0.4), sp + 0.6, 0.35)
for m in [38, 45]:
    add(music, note(mtof(m), lift - a, 'pad'), a, 0.05)
beat = 60 / 120
fan = [(62, 1), (69, 1), (74, 2), (73, 1), (71, 1), (69, 2), (66, 1), (69, 1), (74, 1), (76, 1), (78, 4)]
tb = lift
for m, d in fan:
    if tb > b: break
    add(music, note(mtof(m), d * beat * 1.05, 'brass', vib=0.4), tb, 0.08)
    add(music, note(mtof(m - 12), d * beat * 1.05, 'brass', vib=0.3), tb, 0.04)
    tb += d * beat
chords = [[50, 57, 62, 66], [55, 59, 62, 67], [57, 61, 64, 69], [50, 57, 62, 66]]
tb, k = lift, 0
while tb < b - 0.05:
    if k % 2 == 0: add(music, kick(), tb, 0.4)
    if k % 4 == 2: add(music, snare(), tb, 0.28)
    if k % 8 == 0:
        for m in chords[(k // 8) % 4]: add(music, note(mtof(m), beat * 4, 'pad'), tb, 0.025)
    add(music, note(mtof(chords[(k // 8) % 4][0] - 12), beat * 0.45, 'saw'), tb, 0.05)
    tb += beat / 2; k += 1
add(music, noise_burst(2.0, 2000, 12000, 1.6), lift, 0.12)

# ---- Scène 3 : cockpit, ronronnement continu, nappe tendue, bips de console, ping radar
a, b = SCN['s3']
add(sfx, rumble(b - a, rise=0.0), a, 0.14)
tt = t(b - a)
pad = sum(np.sin(2 * np.pi * mtof(m) * tt + i) for i, m in enumerate([45, 52, 56])) * np.clip(tt / 2, 0, 1)
add(music, pad * (0.7 + 0.3 * np.sin(2 * np.pi * 0.15 * tt)), a, 0.03)
for tb in np.arange(a + 0.5, b, 1.7):
    add(sfx, beep(rng.choice([1200, 1500, 2000]), 0.05), tb + rng.uniform(0, 0.6), 0.05)
s0, s1_ = [sec(x) for x in TL['s3screen']]
tb = s0
while tb < s1_:
    add(sfx, note(1250, 0.6, 'bell'), tb, 0.08); tb += 20 / FPS
l3 = TL['voices']['l3']
for i, m in enumerate([69, 72, 76]):                             # notes de piano tristes (« Papa »)
    add(music, note(mtof(m), 2.5, 'piano'), sec(l3['end']) + 0.3 + i * 0.5, 0.08)
add(sfx, whoosh(1.4, 300, 2500, 0.7), b - 1.4, 0.3)

# ---- Scènes 4 et 5 : Namek, musique mystérieuse et légère (fa lydien : célesta, flûte, nappe)
a, b = SCN['s4']
v0, v1 = SCN['s5']
pb = 60 / 84
tt = t(v1 - a)
pad = sum(np.sin(2 * np.pi * mtof(m) * tt * (1 + 0.001 * i) + i) / (1 + i * 0.3) for i, m in enumerate([41, 48, 55, 59]))
add(music, pad * np.clip(tt / 2.5, 0, 1), a, 0.035)
arp = [65, 69, 72, 76, 79, 76, 72, 71]
tb, k = a + 0.5, 0
while tb < v1 - 1.5:
    add(music, note(mtof(arp[k % 8] + 12), pb * 1.5, 'bell'), tb, 0.035)
    tb += pb / 2; k += 1
mel = [(77, 2), (76, 1), (72, 1), (71, 3), (69, 1), (72, 2), (74, 2), (76, 4)]
for rep in range(2):
    tb = sec(TL['s4shots'][1]) + 0.3 + rep * 9.5
    for m, d in mel:
        if tb > v1 - 2: break
        add(music, flute(mtof(m), d * pb * 1.05), tb, 0.045); tb += d * pb
add(sfx, whoosh(1.6, 500, 3500, 0.7), sec(TL['s4shots'][1]) - 1.2, 0.35)   # entrée dans l'atmosphère
add(sfx, wind(v1 - sec(TL['s4shots'][1])), sec(TL['s4shots'][1]), 0.07)   # vent doux
for tb in np.arange(sec(TL['s4shots'][1]) + 0.8, v1 - 1, 2.3):
    odd_bird(tb + rng.uniform(0, 0.8), sfx, 0.035)
add(sfx, note(mtof(88), 1.5, 'bell'), v0 + 0.2, 0.05)
# fondu de fin
f0, f1 = [sec(x) for x in TL['fade']]
i0 = int((f0 - 0.3) * SR); i1 = int(f1 * SR)
music[i0:i1] *= np.linspace(1, 0, i1 - i0); music[i1:int((v1 + 0.2) * SR)] = 0
sfx[i0:i1] *= np.linspace(1, 0, i1 - i0); sfx[i1:int((v1 + 0.2) * SR)] = 0
# « À suivre » : petit accord suspendu
su = SCN['suivre'][0]
for m in [57, 62, 64, 69]:
    add(music, note(mtof(m), 2.6, 'pad'), su + 0.3, 0.04)

# ---- Teaser : montée sombre, tonnerre, coup final sur le titre
a, b = SCN['teaser']
t0, t1, t2 = [sec(x) for x in TL['teaserShots']]
tt = t(b - a)
rise = np.clip(tt / (b - a), 0, 1)
dr = (np.sin(2 * np.pi * mtof(31) * tt) + 0.5 * np.sin(2 * np.pi * mtof(37) * tt) + 0.3 * np.sin(2 * np.pi * mtof(43) * tt * (1 + 0.02 * rise)))
add(music, dr * (0.3 + rise), a, 0.08)
add(music, whoosh(b - a, 150, 3000, 0.95), a, 0.07)
for st in [t0 + 14 / FPS, t0 + 42 / FPS, t1 + 10 / FPS, t1 + 38 / FPS, t2 + 6 / FPS]:
    add(sfx, noise_burst(2.2, 25, 500, 1.4, attack=0.01), st, 0.7)
    add(sfx, noise_burst(0.3, 2000, 9000, 14), st, 0.25)
tb = t1
while tb < t2 + 20 / FPS:
    add(music, drum(0.3, 90, 50, 0.1), tb, 0.2 + 0.35 * (tb - t1) / (t2 - t1 + 1))
    tb += 0.11
ttl = t2 + 20 / FPS
add(music, drum(1.4, 65, 30, 0.4), ttl, 0.9)
add(music, noise_burst(2.5, 2000, 12000, 1.4), ttl, 0.18)
for m in [43, 50, 55, 58, 61]:
    add(music, note(mtof(m), 2.4, 'brass', vib=0.5), ttl, 0.06)
tend = int((TOTAL - 0.6) * SR)
music[tend:] *= np.linspace(1, 0, len(music) - tend)

# ---- Voix
for k, v in TL['voices'].items():
    w = wave.open(f'{FBZ}/public/audio/ep3/{k}.wav')
    x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
    add(voice, x, v['start'] / FPS, 0.95)

# ---- Ducking de la musique et des sfx pendant les voix
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
with wave.open(FBZ + '/public/audio/ep3/mix.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(stereo.tobytes())
print('mix ok', TOTAL, 's', 'peak', peak)
