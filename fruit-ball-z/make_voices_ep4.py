"""Voix edge-tts de Fruit Ball Z ép.4 (Végénade et narrateur : mêmes voix et réglages que l'ép.3).

Sortie : fbz/public/audio/ep4/lN.wav (mono 44,1 kHz) et fbz/src/voices4.json (text, frames, mouth, cuts).
Besoin : pip install edge-tts, ffmpeg, accès à speech.platform.bing.com.
Usage : python3 make_voices_ep4.py <dossier qui contient fbz/> [clés à régénérer]
"""
import asyncio, json, os, subprocess, sys, wave
import numpy as np
import edge_tts
import edge_tts.communicate

# edge-tts n'utilise que certifi : derrière un proxy TLS, on ajoute le CA de SSL_CERT_FILE
if os.environ.get('SSL_CERT_FILE'):
    edge_tts.communicate._SSL_CTX.load_verify_locations(os.environ['SSL_CERT_FILE'])

S = sys.argv[1]; OUT = S + '/fbz/public/audio/ep4'; SR = 44100; FPS = 30
os.makedirs(OUT, exist_ok=True)
LTZ = 'fr-CA-ThierryNeural'           # Litcheezer (Freezer VF) : doux, calme, presque chuchoté
VEG = 'fr-FR-RemyMultilingualNeural'  # Végénade : même voix que l'ép.3
NAM = 'fr-CA-JeanNeural'              # vieux Namekien : même voix que l'ancien de l'ép.3, plus ferme
NAR = 'fr-CH-FabriceNeural'           # narrateur
# souffle : la voix est mélangée à sa version chuchotée (phases aléatoires)
WHISPER = "afftfilt=real='hypot(re,im)*cos((random(0)*2-1)*2*3.14)':imag='hypot(re,im)*sin((random(1)*2-1)*2*3.14)':win_size=512:overlap=0.75"
FX_LTZ = 'highpass=f=110,equalizer=f=250:t=q:w=1:g=-3,equalizer=f=4500:t=q:w=1:g=4,aecho=0.8:0.5:35:0.12'
FX_VEG = 'highpass=f=70,equalizer=f=140:t=q:w=1:g=4,equalizer=f=2200:t=q:w=1.2:g=5,acompressor=threshold=-22dB:ratio=6:attack=3:release=60'
FX_NAM = 'highpass=f=80,lowpass=f=7000,vibrato=f=5:d=0.07,equalizer=f=160:t=q:w=1:g=3,equalizer=f=1000:t=q:w=1:g=2,aecho=0.8:0.3:40:0.08'
FX_NAR = 'highpass=f=70,equalizer=f=120:t=q:w=1:g=3,aecho=0.8:0.4:70:0.12'
LAUGH = 'Ho ho ho...'
# clé, voix, morceaux, débit, hauteur, pause entre morceaux (s), effets, part chuchotée, durée max (images)
# un morceau (texte, gain) est joué plus doucement (petit rire) ; durée max : cf. make_timeline_ep4.py
lines = [
 ('n1', NAR, ["Précédemment dans Fruit Ball Z...", "Kiwikolo et Petit-Poirsan ont atteint Namek... mais Végénade arrive, lui aussi !"], 6, -4, 0.5, FX_NAR, 0, 172),
 ('l1', LTZ, ["Soyez raisonnables...", (LAUGH, 0.45), "donnez-moi simplement ce que je veux."], -14, 6, 0.45, FX_LTZ, 0.4, 145),
 ('l2', NAM, ["Jamais.", "Ces boules ne sont pas faites pour des mains comme les tiennes."], -6, -10, 0.7, FX_NAM, 0, 135),
 ('l3', LTZ, ["Quel dommage.", ("Ho ho...", 0.45), "J'aurais tellement préféré faire ça dans le calme."], -12, 6, 0.45, FX_LTZ, 0.4, 155),
 ('l4', VEG, ["Ce monstre...", "il va tous nous détruire si personne ne l'arrête."], -2, -8, 0.6, FX_VEG, 0, 130),
 ('n2', NAR, ["Et alors qu'un espoir semblait s'éteindre...", "un nouveau venu approchait."], -2, -4, 0.6, FX_NAR, 0, 165),
 ('n3', NAR, ["À suivre..."], -4, -4, 0, FX_NAR, 0, 60),
 ('n4', NAR, ["Dans le prochain épisode...", "Pomgoku débarque !"], 0, -4, 0.6, FX_NAR, 0, 175),
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
if only and os.path.exists(S + '/fbz/src/voices4.json'):
    meta = json.load(open(S + '/fbz/src/voices4.json'))
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
json.dump(meta, open(S + '/fbz/src/voices4.json', 'w'))
