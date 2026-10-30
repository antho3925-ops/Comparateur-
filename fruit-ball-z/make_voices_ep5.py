"""Voix edge-tts de Fruit Ball Z ép.5 (Pomgoku comme l'ép.1, Kiwikolo comme l'ép.2, Litcheezer comme l'ép.4).

Sortie : fbz/public/audio/ep5/lN.wav (mono 44,1 kHz) et fbz/src/voices5.json (text, frames, mouth, cuts).
Besoin : pip install edge-tts, ffmpeg, accès à speech.platform.bing.com.
Usage : python3 make_voices_ep5.py <dossier qui contient fbz/> [clés à régénérer]
"""
import asyncio, json, os, subprocess, sys, wave
import numpy as np
import edge_tts
import edge_tts.communicate

# edge-tts n'utilise que certifi : derrière un proxy TLS, on ajoute le CA de SSL_CERT_FILE
if os.environ.get('SSL_CERT_FILE'):
    edge_tts.communicate._SSL_CTX.load_verify_locations(os.environ['SSL_CERT_FILE'])

S = sys.argv[1]; OUT = S + '/fbz/public/audio/ep5'; SR = 44100; FPS = 30
os.makedirs(OUT, exist_ok=True)
POM = 'fr-FR-HenriNeural'            # Pomgoku (Goku VF) : même voix que l'ép.1
KIWI = 'fr-BE-GerardNeural'          # Kiwikolo : même voix que l'ép.2
LTZ = 'fr-CA-ThierryNeural'          # Litcheezer : même voix et réglages que l'ép.4
NAR = 'fr-CH-FabriceNeural'          # narrateur
# souffle : la voix est mélangée à sa version chuchotée (phases aléatoires), comme l'ép.4
WHISPER = "afftfilt=real='hypot(re,im)*cos((random(0)*2-1)*2*3.14)':imag='hypot(re,im)*sin((random(1)*2-1)*2*3.14)':win_size=512:overlap=0.75"
FX_LTZ = 'highpass=f=110,equalizer=f=250:t=q:w=1:g=-3,equalizer=f=4500:t=q:w=1:g=4,aecho=0.8:0.5:35:0.12'
FX_POM = 'highpass=f=90,equalizer=f=2800:t=q:w=1:g=3'
# colère : plus de corps dans le grave, un peu de mordant
FX_POM_COLERE = 'highpass=f=70,equalizer=f=160:t=q:w=1:g=3,equalizer=f=2600:t=q:w=1:g=3'
# cri : voyelle étirée (atempo garde la hauteur) et écho qui résonne dans les ruines
FX_POM_CRI = 'atempo=0.6,highpass=f=90,equalizer=f=2400:t=q:w=1:g=4,aecho=0.8:0.6:80|160:0.25|0.12'
FX_KIWI = 'highpass=f=70,equalizer=f=200:t=q:w=1:g=3,equalizer=f=2500:t=q:w=1:g=2'
FX_NAR = 'highpass=f=70,equalizer=f=120:t=q:w=1:g=3,aecho=0.8:0.4:70:0.12'
LAUGH = 'Ho ho ho...'
# clé, voix, morceaux, débit, hauteur, pause entre morceaux (s), effets, part chuchotée, durée max (images)
# un morceau (texte, gain) est joué plus doucement (petit rire) ; durée max : cf. make_timeline_ep5.py
lines = [
 ('n1', NAR, ["Précédemment dans Fruit Ball Z...", "Litcheezer a réduit en ruines le village des Namekiens."], 4, -4, 0.5, FX_NAR, 0, 172),
 ('c1', POM, ["Raaaaaaah !"], -30, 12, 0, FX_POM_CRI, 0, 40),
 ('l1', POM, ["Qu'est-ce qui s'est passé ici...", "qui a fait ça ?"], -4, 6, 0.7, FX_POM_COLERE, 0, 90),
 ('l2', KIWI, ["Litcheezer.", "Et ce que tu vois n'est qu'un début."], -8, -10, 0.9, FX_KIWI, 0, 125),
 # amusé : petit rire après la réplique
 ('l3', LTZ, ["Oh, une petite pomme qui vient jouer les héros.", "Comme c'est mignon.", (LAUGH, 0.45)], -14, 6, 0.6, FX_LTZ, 0.4, 195),
 ('l4', POM, ["Je me fiche de ta puissance.", "Je vais t'arrêter."], -2, 4, 0.7, FX_POM_COLERE, 0, 110),
 # riant doucement
 ('l5', LTZ, [(LAUGH, 0.45), "Tu n'as encore rien vu", "de ce dont je suis capable."], -12, 6, 0.5, FX_LTZ, 0.4, 170),
 ('n2', NAR, ["Dans le prochain épisode...", "Les formes de Litcheezer !"], 0, -4, 0.6, FX_NAR, 0, 175),
]


async def tts(text, voice, rate, pitch, path):
    await edge_tts.Communicate(text, voice, rate=f'{rate:+d}%', pitch=f'{pitch:+d}Hz').save(path)


def load(path, fx=None):
    """Décode en mono 44,1 kHz float32, avec un filtre ffmpeg optionnel."""
    cmd = ['ffmpeg', '-v', 'error', '-i', path] + (['-af', fx] if fx else []) + ['-ac', '1', '-ar', str(SR), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(cmd, check=True, capture_output=True).stdout, np.float32).astype(float)


def trim(x, th=0.01):
    """Retire le silence au début et à la fin (seuil relatif au pic), garde 20 ms de marge."""
    idx = np.nonzero(np.abs(x) > th * np.abs(x).max())[0]
    m = int(0.02 * SR)
    return x[max(0, idx[0] - m):idx[-1] + m]


def synth(k, voice, parts, rate, pitch, gap, fx, wh):
    segs = []
    for j, seg in enumerate(parts):
        text, gain = seg if isinstance(seg, tuple) else (seg, 1.0)
        mp3 = f'{OUT}/{k}_p{j}.mp3'
        asyncio.run(tts(text, voice, rate, pitch, mp3))
        x = load(mp3, fx)
        if wh:
            w = load(mp3, WHISPER + ',' + fx)[:len(x)]
            w = np.pad(w, (0, len(x) - len(w)))
            x = (1 - wh) * x / np.abs(x).max() + wh * w / np.abs(w).max()
        x = trim(x); segs.append(x / np.abs(x).max() * gain); os.remove(mp3)
    seq = []
    for j, s in enumerate(segs): seq += ([np.zeros(int(gap * SR))] if j else []) + [s]
    x = np.concatenate(seq)
    return x / np.abs(x).max() * 10 ** (-1 / 20), [len(s) / SR for s in segs]


meta = {}
only = sys.argv[2:]
if only and os.path.exists(S + '/fbz/src/voices5.json'):
    meta = json.load(open(S + '/fbz/src/voices5.json'))
for k, voice, parts, rate, pitch, gap, fx, wh, maxf in lines:
    if only and k not in only: continue
    # si la réplique déborde, on accélère par pas de 4 % jusqu'à ce qu'elle tienne
    while True:
        x, durs = synth(k, voice, parts, rate, pitch, gap, fx, wh)
        if len(x) / SR * FPS <= maxf or rate >= 40: break
        rate += 4
    w = wave.open(f'{OUT}/{k}.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()
    hop = SR // FPS; env = [float(np.sqrt((x[i:i + hop] ** 2).mean())) for i in range(0, len(x), hop)]
    mx = max(env); env = [round(min(1, (e / mx) ** 0.7 * 1.15), 3) if e > 0.02 * mx else 0 for e in env]
    cuts = []; acc = 0
    for d in durs[:-1]: acc += d; cuts.append(round((acc + gap / 2) * FPS)); acc += gap
    text = ' '.join(p for p in parts if not isinstance(p, tuple))
    meta[k] = {'text': text, 'frames': len(env), 'mouth': env, 'cuts': cuts}
    print(k, voice, f'rate {rate:+d}% pitch {pitch:+d}Hz', round(len(x) / SR, 2), 's', len(env), 'images')
json.dump(meta, open(S + '/fbz/src/voices5.json', 'w'))
