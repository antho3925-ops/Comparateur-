"""Voix edge-tts de Fruit Ball Z ép.6 (Litcheezer deuxième forme, Végénade, Pomgoku, narrateur).

Sortie : fbz/public/audio/ep6/lN.wav (mono 44,1 kHz) et fbz/src/voices6.json (text, frames, mouth, cuts).
Besoin : pip install edge-tts, ffmpeg, accès à speech.platform.bing.com.
Usage : python3 make_voices_ep6.py <dossier qui contient fbz/>
"""
import asyncio, json, os, subprocess, sys, wave
import numpy as np
import edge_tts
import edge_tts.communicate

# edge-tts n'utilise que certifi : derrière un proxy TLS, on ajoute le CA de SSL_CERT_FILE
if os.environ.get('SSL_CERT_FILE'):
    edge_tts.communicate._SSL_CTX.load_verify_locations(os.environ['SSL_CERT_FILE'])

S = sys.argv[1]; OUT = S + '/fbz/public/audio/ep6'; SR = 44100; FPS = 30
os.makedirs(OUT, exist_ok=True)
POM = 'fr-FR-HenriNeural'            # Pomgoku : même voix que l'ép.1
VEG = 'fr-FR-RemyMultilingualNeural'  # Végénade : même voix que l'ép.3
LIT = 'fr-CA-ThierryNeural'          # Litcheezer : même voix que les ép.4-5 (débit -14 %, 40 % chuchoté), hauteur baissée pour la deuxième forme
WHISPER = "afftfilt=real='hypot(re,im)*cos((random(0)*2-1)*2*3.14)':imag='hypot(re,im)*sin((random(1)*2-1)*2*3.14)':win_size=512:overlap=0.75"
NAR = 'fr-CH-FabriceNeural'          # narrateur
FX_POM = 'highpass=f=90,equalizer=f=2800:t=q:w=1:g=3'
FX_VEG = 'highpass=f=70,equalizer=f=140:t=q:w=1:g=4,equalizer=f=2200:t=q:w=1.2:g=5,acompressor=threshold=-22dB:ratio=6:attack=3:release=60'
# deuxième forme : filtre de l'ép.4 (FX_LTZ) avec la hauteur baissée (+6 Hz -> -16 Hz) et plus de corps dans les basses
FX_LIT2 = 'highpass=f=60,equalizer=f=140:t=q:w=1:g=5,equalizer=f=4500:t=q:w=1:g=3,aecho=0.8:0.5:45:0.15'
FX_NAR = 'highpass=f=70,equalizer=f=120:t=q:w=1:g=3,aecho=0.8:0.4:70:0.12'
# clé, voix, morceaux, débit, hauteur, pause entre morceaux (s), effets, part chuchotée, durée max (images)
# durée max : place disponible avant la réplique ou le plan suivant (cf. make_timeline_ep6.py)
lines = [
 ('n1', NAR, ["Précédemment dans Fruit Ball Z...", "Pomgoku a enfin débarqué sur Namek, mais Litcheezer a esquivé tous ses coups en souriant."], 6, -4, 0.5, FX_NAR, 0, 172),
 ('l1', LIT, ["Voici ma deuxième forme.", "J'espère que ton cœur tiendra le choc."], -14, -16, 0.7, FX_LIT2, 0.4, 170),
 ('l2', VEG, ["Je n'ai pas fait tout ce chemin pour reculer devant toi !"], 2, -8, 0, FX_VEG, 0, 100),
 ('l3', LIT, ["Tu es fort...", "pour un fruit ordinaire."], -14, -16, 0.6, FX_LIT2, 0.4, 100),
 ('l4', POM, ["Arrête ça...", "arrête ça tout de suite !"], 10, 14, 0.7, FX_POM, 0, 110),
 ('l5', NAR, ["Et dans cette rage,", "quelque chose d'ancien se réveillait enfin."], -6, -6, 0.5, FX_NAR, 0, 150),
 ('n2', NAR, ["Dans le prochain épisode...", "Super Pomgoku !"], 0, -4, 0.6, FX_NAR, 0, 150),
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
        mp3 = f'{OUT}/{k}_p{j}.mp3'
        asyncio.run(tts(seg, voice, rate, pitch, mp3))
        x = load(mp3, fx)
        if wh:  # mélange chuchoté, comme make_voices_ep5.py
            w = load(mp3, WHISPER + ',' + fx)[:len(x)]
            w = np.pad(w, (0, len(x) - len(w)))
            x = (1 - wh) * x / np.abs(x).max() + wh * w / np.abs(w).max()
        segs.append(trim(x)); os.remove(mp3)
    seq = []
    for j, s in enumerate(segs): seq += ([np.zeros(int(gap * SR))] if j else []) + [s]
    x = np.concatenate(seq)
    return x / np.abs(x).max() * 10 ** (-1 / 20), [len(s) / SR for s in segs]


meta = {}
only = sys.argv[2:]  # clés à régénérer (toutes par défaut)
if only and os.path.exists(S + '/fbz/src/voices6.json'):
    meta = json.load(open(S + '/fbz/src/voices6.json'))
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
    meta[k] = {'text': ' '.join(parts), 'frames': len(env), 'mouth': env, 'cuts': cuts}
    print(k, voice, f'rate {rate:+d}% pitch {pitch:+d}Hz', round(len(x) / SR, 2), 's', len(env), 'images')
json.dump(meta, open(S + '/fbz/src/voices6.json', 'w'))
