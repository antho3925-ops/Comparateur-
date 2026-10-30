"""Synthèse de la bande-son de Fruit Ball Z ép.5 : musique + bruitages + mixage des voix.

Mêmes instruments de synthèse que make_audio.py. Sortie : fbz/public/audio/ep5/mix.wav
Usage : python3 make_audio_ep5.py <dossier qui contient fbz/>
"""
import json, sys, wave
import numpy as np

S = sys.argv[1]
FBZ = S + '/fbz'
SR = 44100
FPS = 30
TL = json.load(open(FBZ + '/src/timeline5.json'))
TOTAL = TL['total'] / FPS
N = int(TOTAL * SR)
rng = np.random.default_rng(15)


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


def steam(d):
    """Jet de vapeur : souffle aigu qui retombe."""
    tt = t(d)
    s = fft_filter(rng.standard_normal(len(tt)), lo=1500, hi=9000)
    s /= np.abs(s).max() + 1e-9
    return s * np.exp(-tt * 1.6) * env_adsr(len(tt), 0.01, 0.3)


def fire_crackle(d, density=14):
    """Crépitement de feu : grondement sourd + petits craquements aléatoires."""
    tt = t(d)
    base = fft_filter(rng.standard_normal(len(tt)), lo=60, hi=500)
    base /= np.abs(base).max() + 1e-9
    out = base * 0.35
    for _ in range(int(d * density)):
        i = rng.integers(0, len(tt))
        w = noise_burst(rng.uniform(0.01, 0.04), 1200, 8000, 160)[: len(tt) - i]
        out[i:i + len(w)] += w * rng.uniform(0.3, 1.0)
    return out


def joint_crack():
    """Craquement d'articulation : deux ou trois clics secs et graves."""
    out = np.zeros(int(0.25 * SR))
    for k in range(rng.integers(2, 4)):
        w = over(noise_burst(0.03, 400, 5000, 200), 0.5 * drum(0.05, 300, 120, 0.0))
        i = int(k * rng.uniform(0.03, 0.06) * SR)
        out[i:i + len(w)] += w[: len(out) - i]
    return out


music = np.zeros(N)
sfx = np.zeros(N)
voice = np.zeros(N)
SCN = {k: (sec(a), sec(b)) for k, (a, b) in TL['scenes'].items()}

# ---- Carton d'ouverture : coup + cymbale + motif héroïque (comme les épisodes précédents)
add(music, drum(1.2, 70, 35, 0.4), 0.05, 0.9)
add(music, noise_burst(2.0, 2000, 12000, 1.6), 0.05, 0.16)
for i, m in enumerate([62, 69, 74, 78]):
    add(music, note(mtof(m), 0.7, 'brass', vib=0.3), 0.3 + i * 0.14, 0.08)
for m in [50, 57, 62, 66]:
    add(music, note(mtof(m), 1.3, 'brass', vib=0.4), 0.9, 0.06)

# ---- Précédemment : avance rapide + ostinato glacial accéléré, flash et explosion sourde
r0, r1 = SCN['recap']
add(sfx, whoosh(0.5, 3000, 600, 0.3), r0 - 0.1, 0.3)
for k in range(4):
    add(sfx, whoosh(0.35, 800, 6000, 0.6), r0 + k * 1.5 - 0.15, 0.25)
add(music, fft_filter(rng.standard_normal(int((r1 - r0) * SR)), lo=2000, hi=6000) * 0.04, r0)
ost = [62, 61, 62, 65, 62, 61, 58, 57]
tb, k = r0, 0
while tb < r1 - 0.1:
    add(music, note(mtof(ost[k % 8] - 12), 0.18, 'saw'), tb, 0.05)
    if k % 4 == 0: add(music, drum(0.5, 110, 48, 0.15), tb, 0.3)
    tb += 60 / 150 / 2; k += 1
add(sfx, over(drum(1.6, 60, 25, 0.0), 0.8 * noise_burst(2.0, 30, 600, 1.8)), r0 + 1.5 + 1.0, 0.7)
add(music, note(mtof(86), 1.4, 'bell'), r0 + 1.5 + 0.9, 0.06)

# ---- Scène 1 : silence pesant sur les ruines (vent, crépitement), vapeur, cri
a, b = SCN['s1']
op = sec(TL['open'])
pov, cry, talk = [sec(x) for x in TL['s1shots'][1:]]
add(sfx, wind(b - a + 0.5, 0.1), a, 0.07)
add(sfx, fire_crackle(b - a + 0.5), a, 0.12)
add(sfx, thud() * 0.5, op - 0.02, 0.5)                          # le loquet saute
add(sfx, steam(2.4), op, 0.45)
add(sfx, noise_burst(0.12, 2000, 9000, 30), op, 0.3)
tt = t(b - pov)                                                  # bourdon grave, presque inaudible
add(music, (np.sin(2 * np.pi * mtof(31) * tt) + 0.4 * np.sin(2 * np.pi * mtof(38) * tt)) * np.clip(tt / 2, 0, 1), pov, 0.06)
add(sfx, drum(0.8, 90, 40, 0.0), pov, 0.25)                     # battement de coeur sur la vue subjective
add(sfx, drum(0.8, 90, 40, 0.0), pov + 0.45, 0.18)
add(sfx, drum(0.8, 90, 40, 0.0), pov + 1.6, 0.25)
add(sfx, drum(0.8, 90, 40, 0.0), pov + 2.05, 0.18)
for m in [38, 45, 50]:                                           # colère : cuivres qui frappent sur le cri
    add(music, note(mtof(m), 2.2, 'brass', vib=0.5), cry, 0.08)
add(music, drum(1.2, 70, 30, 0.4), cry, 0.7)
add(music, noise_burst(1.6, 2000, 12000, 1.6), cry, 0.12)

# ---- Scène 2 : vent et braises, arrivée en vol (whoosh), atterrissage lourd, nappe tendue
a, b = SCN['s2']
fly = sec(TL['s2shots'][1]); land = sec(TL['land'])
add(sfx, wind(b - a, 0.12), a, 0.07)
add(sfx, fire_crackle(b - a, 10), a, 0.08)
add(sfx, whoosh(land - fly + 0.1, 600, 3500, 0.8), fly, 0.45)
add(sfx, whoosh(land - fly + 0.2, 500, 3000, 0.85), fly + 0.25, 0.35)
add(sfx, thud(), land, 0.85)
tt = t(b - land)
pad = sum(np.sin(2 * np.pi * mtof(m) * tt + i) for i, m in enumerate([38, 45, 48, 53])) * np.clip(tt / 1.5, 0, 1)
add(music, pad * (0.7 + 0.3 * np.sin(2 * np.pi * 0.2 * tt)), land, 0.03)
for tb in np.arange(land + 0.5, b, 60 / 60):
    add(music, drum(0.9, 75, 35, 0.05), tb, 0.22)

# ---- Scène 3 : Litcheezer, nappe glaciale (célesta grave dissonant), son aigu qui siffle
a, b = SCN['s3']
rev = sec(TL['s3shots'][1])
add(sfx, wind(b - a, 0.08), a, 0.06)
add(sfx, note(mtof(96), 1.6, 'bell'), sec(TL['s3shots'][0]) + 1.2, 0.05)      # éclat dans le ciel
tt = t(b - rev)
ice = sum(np.sin(2 * np.pi * mtof(m) * tt * (1 + 0.002 * i)) / (1 + i * 0.4) for i, m in enumerate([49, 56, 61, 62]))
add(music, ice * np.clip(tt / 1.2, 0, 1), rev, 0.035)
add(music, drum(1.4, 60, 28, 0.2), rev, 0.6)
for i, m in enumerate([73, 72, 68, 67, 73, 72, 66]):
    add(music, note(mtof(m), 1.4, 'bell'), rev + 0.6 + i * 0.85, 0.035)

# ---- Scène 4 : réplique sur bourdon, puis musique d'action rapide (168 bpm), whoosh d'esquives, coups dans le vide
a, b = SCN['s4']
prep, rush, slow, after = [sec(x) for x in TL['s4shots'][1:]]
tt = t(prep - a)
add(music, (np.sin(2 * np.pi * mtof(38) * tt) + 0.5 * np.sin(2 * np.pi * mtof(45) * tt)) * np.clip(tt, 0, 1), a, 0.05)
add(sfx, crackle(rush - prep + 0.2, rise=True), prep, 0.14)
add(sfx, rumble(rush - prep, rise=0.9), prep, 0.25)
beat = 60 / 168
riff = [50, 50, 53, 50, 55, 50, 53, 52]
tb, k = rush - beat * 2, 0
while tb < slow:
    if k % 2 == 0: add(music, kick(), tb, 0.45)
    if k % 4 == 2: add(music, snare(), tb, 0.32)
    add(music, note(mtof(riff[k % 8] - 12), beat * 0.45, 'saw'), tb, 0.06)
    if k % 8 == 0:
        for m in [62, 65, 69]: add(music, note(mtof(m), beat * 4, 'brass', vib=0.3), tb, 0.03)
    tb += beat / 2; k += 1
for bl in TL['blows']:
    s0 = sec(bl)
    add(sfx, whoosh(0.22, 900, 5000, 0.5), s0, 0.55)              # le poing fend l'air
    add(sfx, noise_burst(0.12, 300, 3000, 30), s0 + 4 / FPS, 0.35) # coup dans le vide
    add(sfx, whoosh(0.3, 3000, 700, 0.3), s0 + 3 / FPS, 0.4)      # esquive
# ralenti : son étiré et grave, puis retombée
add(sfx, whoosh(after - slow, 200, 900, 0.6), slow, 0.6)
tt = t(after - slow)
add(music, np.sin(2 * np.pi * mtof(26) * tt) * np.clip(tt * 3, 0, 1), slow, 0.12)
add(sfx, drum(0.9, 80, 35, 0.0), slow + 0.4, 0.3)
add(sfx, wind(b - after, 0.1), after, 0.06)
for m in [50, 53, 56]:                                          # accord diminué : rien ne l'atteint
    add(music, note(mtof(m), b - after + 0.3, 'pad'), after, 0.04)

# ---- Scène 5 : craquements d'articulations, note grave et inquiétante
a, b = SCN['s5']
for c in TL['cracks']:
    add(sfx, joint_crack(), sec(c), 0.9)
tt = t(b - a)
dark = (np.sin(2 * np.pi * mtof(25) * tt) + 0.5 * np.sin(2 * np.pi * mtof(31) * tt) + 0.25 * np.sin(2 * np.pi * mtof(37) * tt * 1.003))
add(music, dark * np.clip(tt / 2, 0, 1) * (0.6 + 0.4 * tt / tt[-1]), a, 0.09)
add(music, note(mtof(37), 4.0, 'brass', vib=0.2), sec(TL['voices']['l5']['end']) - 0.2, 0.08)
add(music, note(mtof(31), 4.0, 'brass', vib=0.2), sec(TL['voices']['l5']['end']) - 0.2, 0.08)
add(music, drum(2.0, 50, 22, 0.1), sec(TL['voices']['l5']['end']), 0.7)
f0, f1 = [sec(x) for x in TL['fade']]
i0 = int(f0 * SR); i1 = int(f1 * SR)
music[i0:i1] *= np.linspace(1, 0, i1 - i0); music[i1:int(SCN['suivre'][0] * SR + 0.1 * SR)] = 0
sfx[i0:i1] *= np.linspace(1, 0, i1 - i0); sfx[i1:int(SCN['suivre'][0] * SR + 0.1 * SR)] = 0
su = SCN['suivre'][0]
for m in [49, 56, 61, 62]:                                       # « À suivre » : accord suspendu et inquiet
    add(music, note(mtof(m), 2.6, 'pad'), su + 0.3, 0.04)

# ---- Teaser : montée sombre, tonnerre, coup final sur le titre
a, b = SCN['teaser']
t0, t1, t2 = [sec(x) for x in TL['teaserShots']]
tt = t(b - a)
rise = np.clip(tt / (b - a), 0, 1)
dr = (np.sin(2 * np.pi * mtof(31) * tt) + 0.5 * np.sin(2 * np.pi * mtof(37) * tt) + 0.3 * np.sin(2 * np.pi * mtof(43) * tt * (1 + 0.02 * rise)))
add(music, dr * (0.3 + rise), a, 0.08)
add(music, whoosh(b - a, 150, 3000, 0.95), a, 0.07)
add(sfx, crackle(t1 - t0, rise=True), t0, 0.14)
for st in [t0 + 18 / FPS, t0 + 50 / FPS, t1 + 12 / FPS, t1 + 40 / FPS, t2 + 8 / FPS]:
    add(sfx, noise_burst(2.2, 25, 500, 1.4, attack=0.01), st, 0.7)
    add(sfx, noise_burst(0.3, 2000, 9000, 14), st, 0.25)
tb = t1
while tb < t2 + 20 / FPS:
    add(music, drum(0.3, 90, 50, 0.1), tb, 0.2 + 0.35 * (tb - t1) / (t2 - t1 + 1))
    tb += 0.11
ttl = t2 + 20 / FPS
add(music, drum(1.4, 65, 30, 0.4), ttl, 0.9)
add(music, noise_burst(2.5, 2000, 12000, 1.4), ttl, 0.18)
for m in [37, 44, 49, 52, 55]:
    add(music, note(mtof(m), 2.4, 'brass', vib=0.5), ttl, 0.06)
tend = int((TOTAL - 0.6) * SR)
music[tend:] *= np.linspace(1, 0, len(music) - tend)

# ---- Voix
for k, v in TL['voices'].items():
    w = wave.open(f'{FBZ}/public/audio/ep5/{k}.wav')
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
with wave.open(FBZ + '/public/audio/ep5/mix.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(stereo.tobytes())
print('mix ok', TOTAL, 's', 'peak', peak)
