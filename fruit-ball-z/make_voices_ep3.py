"""Voix edge-tts de Fruit Ball Z ép.3 (Kiwikolo, Petit-Poirsan et narrateur comme l'ép.2).

Sortie : fbz/public/audio/ep3/lN.wav (mono 44,1 kHz) et fbz/src/voices3.json (text, frames, mouth, cuts).
Besoin : pip install edge-tts, ffmpeg, accès à speech.platform.bing.com.
Usage : python3 make_voices_ep3.py <dossier qui contient fbz/>
"""
import asyncio, json, os, subprocess, sys, wave
import numpy as np
import edge_tts
import edge_tts.communicate

# edge-tts n'utilise que certifi : derrière un proxy TLS, on ajoute le CA de SSL_CERT_FILE
if os.environ.get('SSL_CERT_FILE'):
    edge_tts.communicate._SSL_CTX.load_verify_locations(os.environ['SSL_CERT_FILE'])

S = sys.argv[1]; OUT = S + '/fbz/public/audio/ep3'; SR = 44100; FPS = 30
os.makedirs(OUT, exist_ok=True)
VEG = 'fr-FR-RemyMultilingualNeural'  # Végénade (Vegeta VF) : grave, sec, cassant (plus rapide et plus serré que Raditz)
KIWI = 'fr-BE-GerardNeural'          # Kiwikolo : même voix que l'ép.2
PP = 'fr-FR-EloiseNeural'            # Petit-Poirsan : voix aiguë d'enfant
NAM = 'fr-CA-JeanNeural'             # Namekien : voix âgée et prudente
NAR = 'fr-CH-FabriceNeural'          # narrateur
# sec et cassant : pas d'écho, médiums mordants, compression serrée
FX_VEG = 'highpass=f=70,equalizer=f=140:t=q:w=1:g=4,equalizer=f=2200:t=q:w=1.2:g=5,acompressor=threshold=-22dB:ratio=6:attack=3:release=60'
FX_KIWI = 'highpass=f=70,equalizer=f=200:t=q:w=1:g=3,equalizer=f=2500:t=q:w=1:g=2'
FX_PP = 'highpass=f=150,equalizer=f=3000:t=q:w=1:g=3'
# voix âgée : léger chevrotement, aigus adoucis
FX_NAM = 'highpass=f=90,lowpass=f=7000,vibrato=f=5.5:d=0.12,equalizer=f=900:t=q:w=1:g=2,aecho=0.8:0.3:40:0.08'
FX_NAR = 'highpass=f=70,equalizer=f=120:t=q:w=1:g=3,aecho=0.8:0.4:70:0.12'
# clé, voix, morceaux, débit, hauteur, pause entre morceaux (s), effets, durée max (images)
# durée max : place disponible avant la réplique ou le plan suivant (cf. make_timeline_ep3.py)
lines = [
 ('n1', NAR, ["Précédemment dans Fruit Ball Z...", "Pour vaincre Raditz, Pomgoku s'est sacrifié aux côtés de Kiwikolo."], 6, -4, 0.5, FX_NAR, 172),
 ('l1', VEG, ["Sept boules...", "et l'immortalité pour celui qui les réunit.", "Cette fois, c'est moi qui gagnerai."], -2, -8, 0.6, FX_VEG, 182),
 ('l2', KIWI, ["On y va ensemble,", "mais je ne te fais pas confiance une seconde."], -6, -10, 0.45, FX_KIWI, 125),
 ('l3', PP, ["Et si on n'arrive pas à temps pour Papa ?"], 4, 14, 0, FX_PP, 100),
 ('l4', NAM, ["Qui êtes-vous ?", "Pourquoi venez-vous chercher nos boules sacrées ?"], -14, -8, 0.6, FX_NAM, 128),
 ('l5', KIWI, ["Nous ne voulons pas de mal.", "Nous voulons ramener un ami à la vie."], -10, -10, 0.6, FX_KIWI, 112),
 ('n2', NAR, ["Dans le prochain épisode...", "Litcheezer entre en scène !"], 0, -4, 0.6, FX_NAR, 175),
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
only = sys.argv[2:]  # clés à régénérer (toutes par défaut)
if only and os.path.exists(S + '/fbz/src/voices3.json'):
    meta = json.load(open(S + '/fbz/src/voices3.json'))
for k, voice, parts, rate, pitch, gap, fx, maxf in lines:
    if only and k not in only: continue
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
json.dump(meta, open(S + '/fbz/src/voices3.json', 'w'))
