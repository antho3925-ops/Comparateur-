"""Synthèse de la bande-son de Fruit Ball Z ép.6 : musique + bruitages + mixage des voix.

Mêmes instruments de synthèse que make_audio.py. Sortie : fbz/public/audio/ep6/mix.wav
Usage : python3 make_audio_ep6.py <dossier qui contient fbz/>
"""
import json, sys, wave
import numpy as np

S = sys.argv[1]
FBZ = S + '/fbz'
SR = 44100
FPS = 30
TL = json.load(open(FBZ + '/src/timeline6.json'))
TOTAL = TL['total'] / FPS
N = int(TOTAL * SR)
rng = np.random.default_rng(16)


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

def shell_crack(d=0.5):
    """Craquement de coque : claquements secs + grincement grave."""
    out = np.zeros(int(d * SR))
    for _ in range(rng.integers(4, 8)):
        i = rng.integers(0, int(d * SR * 0.7))
        b = noise_burst(0.05, 1500, 9000, 70)
        out[i:i + len(b)] += b[: len(out) - i] * rng.uniform(0.4, 1)
    tt = t(d)
    creak = np.sin(2 * np.pi * np.cumsum(70 + 40 * np.sin(2 * np.pi * 3 * tt) + 30 * rng.standard_normal(len(tt)).cumsum() / SR * 0) / SR)
    creak *= fft_filter(rng.standard_normal(len(tt)), lo=60, hi=400) * 2
    return out + 0.4 * creak * np.exp(-tt * 3)


def heartbeat():
    return over(drum(0.25, 70, 40, 0.0), np.pad(drum(0.25, 60, 35, 0.0) * 0.7, (int(0.22 * SR), 0)))


# ---- Scène 1 : transformation, la musique monte (do mineur), craquements de coque, vent qui pousse
a, b = SCN['s1']
sh = [sec(x) for x in TL['s1shots']]
g0, g1 = [sec(x) for x in TL['grow']]
tt = t(b - a)
p = tt / (b - a)
drone = (np.sin(2 * np.pi * mtof(24) * tt) + 0.6 * np.sin(2 * np.pi * mtof(31) * tt * 1.002) + 0.35 * np.sin(2 * np.pi * mtof(30) * tt)) * np.clip(tt / 1.5, 0, 1)
add(music, drone * (0.4 + 0.8 * p), a, 0.12)
# ostinato qui accélère et monte d'un demi-ton à chaque tour
ost = [48, 51, 50, 48, 47, 48, 51, 53]
tb, k = a + 0.3, 0
while tb < b - 0.2:
    q = (tb - a) / (b - a)
    add(music, note(mtof(ost[k % 8] - 12 + int(q * 4)), 0.2, 'saw'), tb, 0.03 + 0.05 * q)
    if k % 4 == 0: add(music, drum(0.6, 90, 40, 0.1), tb, 0.25 + 0.35 * q)
    tb += 0.32 - 0.16 * q; k += 1
for i, (m, d0) in enumerate([(36, 0), (39, 3), (43, 6), (46, 8.5)]):          # cuivres qui s'empilent
    add(music, note(mtof(m), b - a - d0 + 0.4, 'brass', vib=0.4), a + d0, 0.05 + i * 0.01)
add(music, whoosh(b - a, 100, 4000, 0.97), a, 0.08)
for tb in np.arange(a + 0.2, sh[1] + 1.0, 0.55):                              # coque qui s'épaissit
    add(sfx, shell_crack(rng.uniform(0.3, 0.6)), tb + rng.uniform(0, 0.25), 0.35)
for tb in np.arange(sh[1], sh[2], 0.7):                                         # épines qui percent
    add(sfx, shell_crack(0.6), tb, 0.45); add(sfx, slide(0.5, 300, 1400) * 0.3, tb + 0.1, 0.08)
add(sfx, noise_burst(0.8, 300, 3000, 4), sh[1], 0.3)
add(sfx, wind(b - a) * np.clip((tt - (sh[2] - a)) * 2 + 0.3, 0.3, 1.6), a, 0.12)  # souffle qui fait reculer les héros
add(sfx, whoosh(2.0, 200, 1500, 0.3), sh[2], 0.45)
add(sfx, crackle(b - sh[3], rise=True), sh[3], 0.16)                            # énergie qui grésille
add(sfx, rumble(b - g0 + 0.5, rise=0.9), g0, 0.4)
for tb in np.arange(sh[3], b - 0.4, 60 / 70):
    add(sfx, thud() * 0.5, tb, 0.3)                                             # chaque poussée de croissance
add(sfx, over(drum(1.6, 60, 25, 0.5), noise_burst(2.0, 40, 2000, 2)), b - 0.45, 0.9)

# ---- Scène 2 : thème tendu (cuivres graves, timbales lentes)
a, b = SCN['s2']
tt = t(b - a)
add(music, (np.sin(2 * np.pi * mtof(24) * tt) + 0.5 * np.sin(2 * np.pi * mtof(31) * tt)) * np.clip(tt, 0, 1), a, 0.1)
theme = [(48, 1.0), (51, 0.5), (50, 0.5), (48, 1.0), (47, 0.5), (42, 1.5), (48, 1.0), (44, 2.0)]
tb = a + 0.2
for m, d in theme:
    add(music, note(mtof(m - 12), d * 1.1, 'brass', vib=0.25), tb, 0.07); tb += d
for tb in np.arange(a + 0.2, b, 60 / 60):
    add(music, drum(1.0, 75, 32, 0.05), tb, 0.3)
add(sfx, rumble(b - a), a, 0.12)
l1 = TL['voices']['l1']
add(sfx, heartbeat(), sec(l1['end']) + 0.15, 0.6)
add(sfx, heartbeat(), sec(l1['end']) + 0.85, 0.5)

# ---- Scène 3 : rage, charge, pichenette, ralenti, chute dans la poussière, moquerie
a, b = SCN['s3']
fl, la, bo, ch = sec(TL['flick']), sec(TL['land']), sec(TL['bounce']), sec(TL['charge'])
tt = t(b - a)
add(music, (np.sin(2 * np.pi * mtof(26) * tt) + 0.5 * np.sin(2 * np.pi * mtof(32) * tt)) * np.clip(tt, 0, 1), a, 0.08)
add(sfx, crackle(ch - a, rise=True), a, 0.2)                                    # pépins qui grésillent
tb, k = a + 0.2, 0                                                               # rythme d'action jusqu'à la pichenette
while tb < fl:
    if k % 2 == 0: add(music, kick(), tb, 0.35)
    if k % 4 == 2: add(music, snare(), tb, 0.22)
    add(music, note(mtof([38, 38, 41, 43][(k // 4) % 4]), 0.2, 'saw'), tb, 0.04)
    tb += 0.25; k += 1
add(sfx, whoosh(fl - ch + 0.1, 400, 5000, 0.9), ch, 0.6)                        # charge
add(sfx, punch(), fl, 0.6)                                                       # pichenette
add(sfx, over(drum(1.2, 110, 30, 0.6), noise_burst(1.0, 60, 3000, 4)), fl, 0.9)  # choc lourd
add(sfx, note(mtof(86), 0.4, 'bell'), fl, 0.08)
add(sfx, whoosh(la - fl, 120, 500, 0.5), fl + 0.05, 0.45)                        # vol au ralenti (grave, étiré)
tts = t(la - fl)
add(music, np.sin(2 * np.pi * (mtof(50) - 30 * tts / tts[-1]) * tts) * env_adsr(len(tts), 0.1, 0.4), fl, 0.05)
add(sfx, thud(), la, 1.0)                                                        # chute dans la poussière
add(sfx, noise_burst(1.6, 150, 2500, 2.0), la, 0.5)
add(sfx, thud() * 0.6, bo, 0.7)
add(sfx, noise_burst(1.0, 150, 2500, 3.0), bo, 0.35)
add(music, slide(0.5, 700, 350), sec(TL['voices']['l3']['end']) + 0.05, 0.03)   # petite note moqueuse

# ---- Scène 4 : bourdonnement électrique qui monte, battements de cœur, nappe tendue
a, b = SCN['s4']
v0, v1 = [sec(x) for x in TL['veins']]
tt = t(b - a)
pad = sum(np.sin(2 * np.pi * mtof(m) * tt + i) for i, m in enumerate([48, 51, 55, 54])) * np.clip(tt / 2, 0, 1)
add(music, pad * (0.4 + 0.6 * tt / tt[-1]), a, 0.03)
add(sfx, crackle(b - v0, rise=True), v0, 0.22)
tth = t(b - v0)
add(sfx, (np.sin(2 * np.pi * 100 * tth) + 0.5 * np.sin(2 * np.pi * 200 * tth)) * (1 + 0.5 * np.sin(2 * np.pi * 11 * tth)) * np.clip(tth / (b - v0), 0, 1), v0, 0.05)
tb = a + 0.3
while tb < b - 0.3:
    add(sfx, heartbeat(), tb, 0.45)
    tb += 1.0 - 0.45 * (tb - a) / (b - a)
add(sfx, wind(b - a) * np.linspace(0.3, 0.8, int((b - a) * SR)), a, 0.08)
add(music, note(mtof(36), 2.5, 'brass', vib=0.5), sec(TL['voices']['l4']['start']) - 0.3, 0.06)

# ---- Scène 5 : aura dorée, vent de plus en plus fort, grondement sourd qui grandit, flash
a, b = SCN['s5']
fx = sec(TL['flash'])
tt = t(fx - a)
p = tt / tt[-1]
add(sfx, wind(fx - a) * (0.4 + 1.6 * p ** 1.5), a, 0.18)
add(sfx, rumble(fx - a, rise=1.0) * (0.3 + p), a, 0.45)
add(sfx, crackle(fx - a, rise=True), a, 0.2)
for m in [36, 43, 48, 52, 55]:                                                   # montée héroïque (do majeur qui s'ouvre)
    add(music, note(mtof(m), fx - a + 0.2, 'brass', vib=0.5) * np.pad(0.2 + 0.8 * p, (0, int(0.2 * SR))), a, 0.05)
add(music, whoosh(fx - a, 100, 6000, 0.98), a, 0.1)
for tb in np.arange(a + 0.4, fx - 0.2, 0.9):
    add(sfx, shell_crack(0.25) * 0.5, tb + rng.uniform(0, 0.4), 0.15)            # cailloux qui se détachent
add(sfx, over(drum(2.0, 55, 22, 0.8), noise_burst(2.5, 40, 6000, 1.5)), fx, 1.0)
add(music, noise_burst(2.5, 2000, 12000, 1.4), fx, 0.2)
# « À suivre » : accord suspendu + grondement sourd qui grandit
su, se = SCN['suivre']
for m in [48, 53, 55, 60]:
    add(music, note(mtof(m), 2.8, 'pad'), su + 0.2, 0.04)
add(sfx, rumble(se - su, rise=1.0), su, 0.3)

# ---- Teaser : montée, tonnerre, coup final sur le titre
a, b = SCN['teaser']
t0, t1, t2 = [sec(x) for x in TL['teaserShots']]
tt = t(b - a)
rise = np.clip(tt / (b - a), 0, 1)
dr = (np.sin(2 * np.pi * mtof(36) * tt) + 0.5 * np.sin(2 * np.pi * mtof(43) * tt) + 0.3 * np.sin(2 * np.pi * mtof(48) * tt * (1 + 0.02 * rise)))
add(music, dr * (0.3 + rise), a, 0.08)
add(music, whoosh(b - a, 150, 3000, 0.95), a, 0.07)
for st in [t0 + 12 / FPS, t0 + 44 / FPS, t1 + 14 / FPS, t1 + 46 / FPS, t2 + 8 / FPS]:
    add(sfx, noise_burst(2.2, 25, 500, 1.4, attack=0.01), st, 0.7)
    add(sfx, noise_burst(0.3, 2000, 9000, 14), st, 0.25)
add(sfx, crackle(t2 - t1, rise=True), t1, 0.15)
tb = t1
while tb < t2 + 20 / FPS:
    add(music, drum(0.3, 90, 50, 0.1), tb, 0.2 + 0.35 * (tb - t1) / (t2 - t1 + 1))
    tb += 0.11
ttl = t2 + 20 / FPS
add(music, drum(1.4, 65, 30, 0.4), ttl, 0.9)
add(music, noise_burst(2.5, 2000, 12000, 1.4), ttl, 0.18)
for m in [48, 55, 60, 64, 67]:
    add(music, note(mtof(m), 2.4, 'brass', vib=0.5), ttl, 0.06)
tend = int((TOTAL - 0.6) * SR)
music[tend:] *= np.linspace(1, 0, len(music) - tend)

# ---- Voix
for k, v in TL['voices'].items():
    w = wave.open(f'{FBZ}/public/audio/ep6/{k}.wav')
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
with wave.open(FBZ + '/public/audio/ep6/mix.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(stereo.tobytes())
print('mix ok', TOTAL, 's', 'peak', peak)
