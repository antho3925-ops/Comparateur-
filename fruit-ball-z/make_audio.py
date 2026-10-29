"""Synthèse de la bande-son de Fruit Ball Z ép.1 : musique + bruitages + mixage des voix."""
import json, sys, wave
import numpy as np

S = sys.argv[1]
FBZ = S + '/fbz'
SR = 44100
FPS = 30
TL = json.load(open(FBZ + '/src/timeline.json'))
TOTAL = TL['total'] / FPS
N = int(TOTAL * SR)
rng = np.random.default_rng(7)


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


# ---------------------------------------------------------------- bus
music = np.zeros(N)
sfx = np.zeros(N)
voice = np.zeros(N)
s2 = TL['scenes']['s2'][0] / FPS
s3 = TL['scenes']['s3'][0] / FPS
s4 = TL['scenes']['s4'][0] / FPS
s5 = TL['scenes']['s5'][0] / FPS
freeze = TL['freeze'] / FPS
title = TL['title'] / FPS
crash = TL['crash'] / FPS
grab = TL['grab'] / FPS
fly = TL['fly'] / FPS

# ---- Musique calme (scène 1) : arpège majeur sautillant + nappe
bpm = 112
beat = 60 / bpm
prog = [(60, [60, 64, 67, 72]), (57, [57, 60, 64, 69]), (65, [65, 69, 72, 77]), (67, [67, 71, 74, 79])]
tt0 = 0.0
bar = 0
while tt0 < s2:
    root, arp = prog[bar % 4]
    add(music, note(mtof(root - 12), beat * 4, 'pad'), tt0, 0.10)
    add(music, note(mtof(root - 24), beat * 2, 'pluck'), tt0, 0.22)
    for i in range(8):
        add(music, note(mtof(arp[[0, 2, 1, 3, 2, 1, 3, 2][i]] + 12), beat * 0.6, 'pluck'), tt0 + i * beat / 2, 0.11)
    tt0 += beat * 4
    bar += 1
# fondu de sortie sous l'ombre
fade_n = int(0.8 * SR)
i2 = int(s2 * SR)
music[i2 - fade_n // 2:i2 + fade_n // 2] *= np.linspace(1, 0, fade_n)
music[i2 + fade_n // 2:] = 0

# ---- Musique tendue (scène 2 -> arrêt sur image)
tense_end = freeze
d_tense = tense_end - s2
tt = t(d_tense)
drone = (np.sin(2 * np.pi * mtof(38) * tt) + 0.6 * np.sin(2 * np.pi * mtof(45) * tt + 1)
         + 0.3 * np.sin(2 * np.pi * mtof(50) * tt * 1.002)) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.25 * tt))
drone *= np.clip(tt / 1.5, 0, 1)
add(music, drone, s2, 0.13)
# battements de taiko à partir de la scène 3, s'accélèrent en scène 4
bpm2 = 96
tb = s3
while tb < tense_end - 0.1:
    sp = 60 / bpm2 if tb < s4 else (60 / bpm2) / 2
    add(music, drum(0.7, 110, 48, 0.15), tb, 0.42 if tb < s4 else 0.32)
    tb += sp
# ostinato mineur inquiétant (scènes 3-4)
ost = [62, 65, 64, 62, 61, 62, 65, 67]
tb, k = s3 + 0.6, 0
while tb < s5:
    add(music, note(mtof(ost[k % 8] - 12), 0.28, 'saw'), tb, 0.05)
    tb += 60 / bpm2 / 2
    k += 1
# accords cuivres dramatiques à l'arrivée de Raditz et au rapt
for at, ch in [(s3 + 2.2, [50, 53, 57]), (grab, [49, 52, 56]), (grab + 1.2, [50, 53, 58])]:
    for m in ch:
        add(music, note(mtof(m), 1.6, 'brass', vib=0.3), at, 0.07)
# scène 5 : montée héroïque D mineur -> Bb -> C -> D majeur (coupée net au gel)
chords = [[50, 57, 62, 65], [46, 53, 58, 62], [48, 55, 60, 64], [50, 57, 62, 66]]
seg = (freeze - s5) / 4
for i, ch in enumerate(chords):
    for m in ch:
        add(music, note(mtof(m), seg + 0.3, 'brass', vib=0.4), s5 + i * seg, 0.05 + 0.015 * i)
    add(music, drum(0.9, 80, 40, 0.1), s5 + i * seg, 0.5)
add(music, whoosh(freeze - s5, 200, 4000, peak=0.97), s5, 0.06)
# SILENCE NET au gel
music[int(freeze * SR):] = 0

# ---- Jingle titre : coup + cloche + motif héroïque
add(music, drum(1.2, 70, 35, 0.4), title, 0.9)
add(music, noise_burst(2.5, 2000, 12000, 1.5), title, 0.18)  # cymbale
for i, m in enumerate([62, 69, 74, 78, 81]):
    add(music, note(mtof(m), 0.9, 'brass', vib=0.3), title + 0.35 + i * 0.16, 0.08)
for m in [50, 57, 62, 66, 69]:
    add(music, note(mtof(m), 2.6, 'brass', vib=0.5), title + 1.2, 0.06)
add(music, note(mtof(86), 2.5, 'bell'), title + 1.2, 0.12)
tend = int((TOTAL - 0.4) * SR)
music[tend:] *= np.linspace(1, 0, len(music) - tend)

# ---- SFX scène 1 : oiseaux + vent léger + petits sauts
for b in np.arange(0.3, s2 - 0.5, 0.75):
    bird(b + rng.uniform(0, 0.4), sfx, 0.05)
add(sfx, fft_filter(rng.standard_normal(int(s2 * SR)), lo=300, hi=1200) * 0.02, 0)
for j in TL['hops']:
    add(sfx, note(380, 0.18, 'pluck') * np.exp(-t(0.18) * 10), j / FPS, 0.12)

# ---- SFX scène 2 : ombre, arrivée, impact, explosion, débris
add(sfx, whoosh(1.6, 150, 600, 0.6), s2 + 0.1, 0.25)               # ombre qui passe
add(sfx, whoosh(crash - s2 - 0.6, 300, 3000, 0.95), s2 + 0.8, 0.35)  # vaisseau qui pique
add(sfx, drum(1.5, 60, 25, 0.0), crash, 1.0)                         # impact sub
add(sfx, noise_burst(2.8, 30, 900, 1.6), crash, 0.9)                # explosion grave
add(sfx, noise_burst(1.2, 800, 8000, 4), crash, 0.4)                # craquement
for k in range(14):                                                  # débris / branches
    add(sfx, noise_burst(0.12, 1500, 6000, 30), crash + 0.3 + rng.uniform(0, 1.6), rng.uniform(0.08, 0.2))
add(sfx, noise_burst(s3 - crash + 1.5, 60, 500, 0.8, attack=0.05), crash + 0.2, 0.25)  # grondement

# ---- SFX scène 3 : fumée qui siffle, pas lourds
add(sfx, whoosh(2.0, 2000, 400, 0.2), s3, 0.08)
for k, ft in enumerate(TL['steps']):
    add(sfx, drum(0.4, 70, 40, 0.3), ft / FPS, 0.35)

# ---- SFX scène 4 : dash, rapt, envol (souffle de vent)
add(sfx, whoosh(0.35, 500, 5000, 0.4), grab - 0.25, 0.5)
add(sfx, drum(0.3, 200, 100, 0.5), grab, 0.3)
add(sfx, whoosh(2.4, 200, 2500, 0.25), fly, 0.7)
add(sfx, whoosh(4.5, 300, 900, 0.3), fly + 1.0, 0.25)

# ---- SFX scène 5 : brise sur les tiges, coupée au gel
d5 = freeze - s5
add(sfx, whoosh(d5, 400, 900, 0.5), s5, 0.15)
sfx[int(freeze * SR):int(title * SR)] = 0

# ---- Voix
for k, v in TL['voices'].items():
    w = wave.open(f'{FBZ}/public/audio/{k}.wav')
    x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
    add(voice, x, v['start'] / FPS, 0.95)

# ---- Ducking de la musique et des sfx pendant les voix
venv = np.abs(voice)
k = int(0.05 * SR)
venv = np.convolve(venv, np.ones(k) / k, 'same')
duck = 1 - 0.55 * np.clip(venv / 0.05, 0, 1)
duck = np.convolve(duck, np.ones(int(0.15 * SR)) / int(0.15 * SR), 'same')

mix = (music * duck) * 0.9 + sfx * (0.4 + 0.6 * duck) + voice
mix[int(freeze * SR):int(title * SR)] = 0  # garantie du silence net
peak = np.abs(mix).max()
mix = np.tanh(mix / peak * 1.3) / np.tanh(1.3) * 0.95
pcm = (mix * 32767).astype(np.int16)
stereo = np.repeat(pcm[:, None], 2, axis=1)
with wave.open(FBZ + '/public/audio/mix.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(stereo.tobytes())
print('mix ok', TOTAL, 's', 'peak', peak)
