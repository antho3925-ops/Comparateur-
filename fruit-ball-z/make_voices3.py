"""Voix edge-tts de Fruit Ball Z ép.1, réglées pour rappeler la VF de Dragon Ball Z.

Même sortie que make_voices2.py : fbz/public/audio/lN.wav (mono 44,1 kHz) et fbz/src/voices.json
(text, frames, mouth, cuts). Besoin : pip install edge-tts, ffmpeg, accès à speech.platform.bing.com.
Usage : python3 make_voices3.py <dossier qui contient fbz/>
"""
import asyncio, json, os, subprocess, sys, wave
import numpy as np
import edge_tts
import edge_tts.communicate

# edge-tts n'utilise que certifi : derrière un proxy TLS, on ajoute le CA de SSL_CERT_FILE
if os.environ.get('SSL_CERT_FILE'):
    edge_tts.communicate._SSL_CTX.load_verify_locations(os.environ['SSL_CERT_FILE'])

S = sys.argv[1]; OUT = S + '/fbz/public/audio'; SR = 44100; FPS = 30
POM = 'fr-FR-HenriNeural'            # Goku VF : jeune, aigu, nasal, plein d'énergie
RAD = 'fr-FR-RemyMultilingualNeural'  # Raditz VF : grave, posé, menaçant
# effets ffmpeg légers (la hauteur est réglée par edge-tts, pas par pitch-shift)
FX_POM = 'highpass=f=90,equalizer=f=2800:t=q:w=1:g=3'
FX_POM_GRAVE = 'highpass=f=60,equalizer=f=140:t=q:w=1:g=3'
FX_RAD = 'highpass=f=50,equalizer=f=110:t=q:w=1:g=5,equalizer=f=3500:t=q:w=1:g=-2,aecho=0.8:0.6:45|90:0.18|0.10'
# clé, voix, morceaux, débit, hauteur, pause entre morceaux (s), effets, durée max (images)
# durée max : place disponible avant la fin de la scène ou la réplique suivante (cf. make_timeline.py)
lines = [
 ('l1', POM, ["Encore une pomme bien juteuse aujourd'hui, hein, Petit-Poirsan !"], 12, 14, 0, FX_POM, 140),
 ('l2', RAD, ["Tu ne sais même pas ce que tu es vraiment...", "Pathétique."], -14, -12, 0.6, FX_RAD, 120),
 ('l3', POM, ["Rends-moi mon fils, tout de suite !"], 16, 18, 0, FX_POM, 72),
 ('l4', RAD, ["Deviens plus fort, petit frère...", "Ou regarde-le disparaître."], -12, -12, 0.6, FX_RAD, 138),
 # réplique finale : Goku en colère, plus grave et plus lent
 ('l5', POM, ["Je te jure...", "que je vais te faire payer ça."], -10, -6, 0.55, FX_POM_GRAVE, 153),
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


def synth(k, voice, parts, rate, pitch, gap, fx):
    segs = []
    for j, seg in enumerate(parts):
        mp3 = f'{OUT}/{k}_p{j}.mp3'
        asyncio.run(tts(seg, voice, rate, pitch, mp3))
        segs.append(trim(load(mp3, fx))); os.remove(mp3)
    seq = []
    for j, s in enumerate(segs): seq += ([np.zeros(int(gap * SR))] if j else []) + [s]
    x = np.concatenate(seq)
    return x / np.abs(x).max() * 10 ** (-1 / 20), [len(s) / SR for s in segs]


meta = {}
for k, voice, parts, rate, pitch, gap, fx, maxf in lines:
    # si la réplique déborde, on accélère par pas de 4 % jusqu'à ce qu'elle tienne
    while True:
        x, durs = synth(k, voice, parts, rate, pitch, gap, fx)
        if len(x) / SR * FPS <= maxf or rate >= 40: break
        rate += 4
    w = wave.open(f'{OUT}/{k}.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()
    hop = SR // FPS; env = [float(np.sqrt((x[i:i + hop] ** 2).mean())) for i in range(0, len(x), hop)]
    mx = max(env); env = [round(min(1, (e / mx) ** 0.7 * 1.15), 3) if e > 0.02 * mx else 0 for e in env]
    cuts = []; acc = 0
    for d in durs[:-1]: acc += d; cuts.append(round((acc + gap / 2) * FPS)); acc += gap
    meta[k] = {'text': ' '.join(parts), 'frames': len(env), 'mouth': env, 'cuts': cuts}
    print(k, voice, f'rate {rate:+d}% pitch {pitch:+d}Hz', round(len(x) / SR, 2), 's', len(env), 'images')
json.dump(meta, open(S + '/fbz/src/voices.json', 'w'))
