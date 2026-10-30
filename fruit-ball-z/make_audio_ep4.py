"""Synthèse de la bande-son de Fruit Ball Z ép.4 : musique + bruitages + mixage des voix.

Mêmes instruments de synthèse que make_audio.py. Sortie : fbz/public/audio/ep4/mix.wav
Usage : python3 make_audio_ep4.py <dossier qui contient fbz/>
"""
import json, sys, wave
import numpy as np

S = sys.argv[1]
FBZ = S + '/fbz'
SR = 44100
FPS = 30
TL = json.load(open(FBZ + '/src/timeline4.json'))
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


def hum(d, f0=42, wob=0.6):
    """Vrombissement grave du vaisseau (sub + harmoniques qui battent)."""
    tt = t(d)
    s = np.sin(2 * np.pi * f0 * tt) + 0.6 * np.sin(2 * np.pi * f0 * 2.01 * tt) + 0.3 * np.sin(2 * np.pi * f0 * 3.02 * tt)
    s *= 1 + 0.25 * np.sin(2 * np.pi * wob * tt)
    s += 0.4 * fft_filter(rng.standard_normal(len(tt)), lo=40, hi=220)
    return s / np.abs(s).max()


def ice(d, notes, gain_each=1.0):
    """Nappe glaciale : clochettes aiguës désaccordées qui scintillent."""
    out = np.zeros(int(d * SR))
    for k in range(int(d * 3)):
        m = notes[rng.integers(0, len(notes))]
        x = note(mtof(m) * (1 + rng.uniform(-0.004, 0.004)), 2.0, 'bell')
        i = int(rng.uniform(0, d - 0.5) * SR)
        x = x[: len(out) - i]
        out[i:i + len(x)] += x * gain_each * rng.uniform(0.4, 1.0)
    return out


music = np.zeros(N)
sfx = np.zeros(N)
voice = np.zeros(N)
SCN = {k: (sec(a), sec(b)) for k, (a, b) in TL['scenes'].items()}

# ---- Carton d'ouverture : coup + cymbale + motif (même signature que les autres épisodes)
add(music, drum(1.2, 70, 35, 0.4), 0.05, 0.9)
add(music, noise_burst(2.0, 2000, 12000, 1.6), 0.05, 0.16)
for i, m in enumerate([62, 69, 74, 78]):
    add(music, note(mtof(m), 0.7, 'brass', vib=0.3), 0.3 + i * 0.14, 0.08)
for m in [50, 57, 62, 66]:
    add(music, note(mtof(m), 1.3, 'brass', vib=0.4), 0.9, 0.06)

# ---- Précédemment : avance rapide + ostinato tendu
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

# ---- Scène 1 : Namek paisible (petite mélodie légère), puis l'ombre : plus que le vent
a, b = SCN['s1']
sh0, sh1 = sec(TL['shadow'][0]), sec(TL['shadow'][1])
land = sec(TL['shipLand']); tilt = sec(TL['tiltUp'])
mel = [72, 76, 79, 76, 74, 77, 81, 77]
tb, k = a, 0
while tb < sh0 + 0.6:
    add(music, note(mtof(mel[k % 8]), 0.5, 'pluck'), tb, 0.06 * (1 if tb < sh0 else 0.5))
    if k % 4 == 0: add(music, note(mtof([60, 65][(k // 4) % 2]), 1.6, 'pad'), tb, 0.03)
    tb += 0.32; k += 1
for bt in [a + 0.3, a + 1.4, a + 2.2]:
    bird(bt, sfx, 0.06)
tt = t(b - a)
add(sfx, wind(b - a) * np.clip((tt - (sh0 - a)) / 2, 0.35, 1.0), a, 0.13)   # le vent monte quand l'ombre arrive
add(sfx, hum(land - sh0 + 1) * np.linspace(0, 1, int((land - sh0 + 1) * SR)) ** 1.5, sh0, 0.22)  # vrombissement qui approche
add(sfx, whoosh(land - tilt, 120, 600, 0.9), tilt, 0.25)
add(sfx, thud(), land, 0.7)
add(sfx, noise_burst(1.0, 1500, 7000, 3.5, attack=0.05), land + 0.15, 0.12)   # sas qui s'ouvre (souffle)
m0, m1 = sec(TL['march'][0]), sec(TL['march'][1])
tb = m0
while tb < m1:
    add(sfx, drum(0.12, 180, 90, 0.4), tb, 0.12)    # pas des sbires
    tb += 0.17
add(sfx, drum(0.3, 140, 60, 0.5), m1 - 0.2, 0.25)    # ils se figent ensemble

# ---- Musique glaciale et inquiétante : du vaisseau jusqu'au flash
fl = sec(TL['flash']); up = sec(TL['fingerUp'])
g0 = tilt + 0.8
tt = t(fl - g0)
drone = (np.sin(2 * np.pi * mtof(37) * tt) + 0.5 * np.sin(2 * np.pi * mtof(44) * tt * 1.002) + 0.35 * np.sin(2 * np.pi * mtof(49) * tt * 0.998))
add(music, drone * np.clip(tt / 3, 0, 1), g0, 0.07)
add(music, ice(fl - g0, [85, 86, 92, 93, 97], 0.5), g0, 0.05)
for i, m in enumerate([61, 64, 68, 67]):          # nappe mineure qui glisse d'un demi-ton
    for j in range(int((fl - g0) // 4)):
        add(music, note(mtof(m - (j % 2)), 4.4, 'pad'), g0 + j * 4, 0.012)
add(sfx, hum(up - land) * 0.6, land, 0.08)          # le vaisseau tourne au ralenti derrière
c3 = sec(TL['s2shots'][3])
add(music, note(mtof(97), 2.0, 'bell'), c3, 0.08)   # sourire de Litcheezer
add(music, note(mtof(98), 2.0, 'bell'), c3 + 0.05, 0.06)
# le doigt se lève : sifflement qui monte, puis explosion sourde
tt = t(fl - up)
f = 300 + 2400 * (tt / tt[-1]) ** 2
add(sfx, np.sin(2 * np.pi * np.cumsum(f) / SR) * (tt / tt[-1]) ** 1.5, up, 0.12)
add(sfx, whoosh(fl - up + 0.1, 800, 8000, 0.95), up, 0.2)
music[int(fl * SR):] = 0
add(sfx, drum(3.0, 50, 20, 0.0), fl, 1.0)
add(sfx, noise_burst(3.5, 20, 400, 1.1), fl, 1.0)
# silence total après l'explosion (jusqu'à la scène 4)
ru = sec(TL['ruins']); s4 = SCN['s4'][0]
i0 = int((ru + 0.8) * SR); i1 = int((ru + 2.2) * SR)
sfx[i0:i1] *= np.linspace(1, 0, i1 - i0); sfx[i1:int(s4 * SR)] = 0

# ---- Scène 4 : vent sur les ruines, feu qui crépite au loin, drone bas, colère de Végénade
a, b = SCN['s4']
add(sfx, wind(b - a), a, 0.08)
for _ in range(60):
    add(sfx, noise_burst(0.04, 2000, 8000, 80), rng.uniform(a, b), rng.uniform(0.02, 0.06))
tt = t(b - a)
add(music, (np.sin(2 * np.pi * mtof(36) * tt) + 0.4 * np.sin(2 * np.pi * mtof(43) * tt)) * np.clip(tt / 2, 0, 1), a, 0.06)
fs = sec(TL['fists'])
add(sfx, crackle(b - fs), fs, 0.3)
add(sfx, drum(0.6, 90, 40, 0.3), fs, 0.5)
for i, m in enumerate([48, 51, 55]):
    add(music, note(mtof(m), b - fs, 'brass', vib=0.4), fs, 0.04)

# ---- Scène 5 : ciel gris, grondement de rentrée atmosphérique, thème d'espoir
a, b = SCN['s5']
sb, sc = sec(TL['s5shots'][1]), sec(TL['s5shots'][2])
f0 = sec(TL['fade'][0])
add(sfx, wind(b - a), a, 0.07)
add(sfx, whoosh(sc - sb + 0.6, 200, 2500, 0.55), sb - 0.3, 0.6)
add(sfx, noise_burst(sc - sb + 1.5, 20, 300, 0.6, attack=0.4), sb, 0.6)   # grondement
add(sfx, hum(f0 - sc, f0=55, wob=4) * 0.5, sc, 0.12)                     # moteur dans le cockpit
hope = [(60, [72, 76, 79]), (65, [72, 77, 81]), (67, [74, 79, 83]), (72, [76, 79, 84])]
melody = [76, 79, 81, 79, 84, 83, 79, 84]
pb = 60 / 76
tb, bar = sb, 0
while tb < f0:
    root, ch = hope[bar % 4]
    for m in ch: add(music, note(mtof(m), pb * 4, 'pad'), tb, 0.025)
    add(music, note(mtof(root - 12), pb * 4, 'brass'), tb, 0.06)
    add(music, note(mtof(melody[(bar * 2) % 8]), pb * 2, 'brass', vib=0.3), tb, 0.06)
    add(music, note(mtof(melody[(bar * 2 + 1) % 8]), pb * 2, 'brass', vib=0.3), tb + 2 * pb, 0.06)
    add(music, drum(0.6, 100, 45, 0.1), tb, 0.2)
    tb += pb * 4; bar += 1
i0 = int((f0 - 0.3) * SR); i1 = int(sec(TL['fade'][1]) * SR)
music[i0:i1] *= np.linspace(1, 0, i1 - i0); music[i1:int(b * SR)] = 0
sfx[i0:i1] *= np.linspace(1, 0.2, i1 - i0); sfx[i1:int(SCN['teaser'][0] * SR)] *= 0.2

# ---- Teaser : montée, tonnerre, coup final sur le titre
a, b = SCN['teaser']
t0, t1, t2 = [sec(x) for x in TL['teaserShots']]
tt = t(b - a)
rise = np.clip(tt / (b - a), 0, 1)
dr = (np.sin(2 * np.pi * mtof(33) * tt) + 0.5 * np.sin(2 * np.pi * mtof(40) * tt) + 0.3 * np.sin(2 * np.pi * mtof(45) * tt * (1 + 0.02 * rise)))
add(music, dr * (0.3 + rise), a, 0.07)
add(music, whoosh(b - a, 150, 3000, 0.95), a, 0.06)
add(sfx, whoosh(1.8, 3000, 300, 0.8), t0, 0.4)          # boule de feu qui tombe
add(sfx, drum(1.5, 60, 25, 0.5), t1 - 0.05, 0.8)        # impact
for st in [t0 + 20 / FPS, t0 + 46 / FPS, t1 + 10 / FPS, t1 + 40 / FPS, t2 + 6 / FPS]:
    add(sfx, noise_burst(2.2, 25, 500, 1.4, attack=0.01), st, 0.7)
    add(sfx, noise_burst(0.3, 2000, 9000, 14), st, 0.25)
tb = t1
while tb < t2 + 20 / FPS:
    add(music, drum(0.3, 90, 50, 0.1), tb, 0.2 + 0.3 * (tb - t1) / (t2 - t1 + 1))
    tb += 0.12
ttl = t2 + 20 / FPS
add(music, drum(1.4, 65, 30, 0.4), ttl, 0.9)
add(music, noise_burst(2.5, 2000, 12000, 1.4), ttl, 0.18)
for m in [48, 55, 60, 64, 67]:
    add(music, note(mtof(m), 2.4, 'brass', vib=0.5), ttl, 0.06)
tend = int((TOTAL - 0.7) * SR)
music[tend:] *= np.linspace(1, 0, len(music) - tend)

# ---- Voix
for k, v in TL['voices'].items():
    w = wave.open(f'{FBZ}/public/audio/ep4/{k}.wav')
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
with wave.open(FBZ + '/public/audio/ep4/mix.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(stereo.tobytes())
print('mix ok', TOTAL, 's', 'peak', peak)
