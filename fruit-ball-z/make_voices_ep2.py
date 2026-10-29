"""Voix edge-tts de Fruit Ball Z ép.2 (mêmes voix et réglages que make_voices3.py pour Pomgoku et Raditz).

Sortie : fbz/public/audio/ep2/lN.wav (mono 44,1 kHz) et fbz/src/voices2.json (text, frames, mouth, cuts).
Besoin : pip install edge-tts, ffmpeg, accès à speech.platform.bing.com.
Usage : python3 make_voices_ep2.py <dossier qui contient fbz/>
"""
import asyncio, json, os, subprocess, sys, wave
import numpy as np
import edge_tts
import edge_tts.communicate

# edge-tts n'utilise que certifi : derrière un proxy TLS, on ajoute le CA de SSL_CERT_FILE
if os.environ.get('SSL_CERT_FILE'):
    edge_tts.communicate._SSL_CTX.load_verify_locations(os.environ['SSL_CERT_FILE'])

S = sys.argv[1]; OUT = S + '/fbz/public/audio/ep2'; SR = 44100; FPS = 30
os.makedirs(OUT, exist_ok=True)
POM = 'fr-FR-HenriNeural'            # Goku VF : jeune, aigu, plein d'énergie
RAD = 'fr-FR-RemyMultilingualNeural'  # Raditz VF : grave, posé, menaçant
KIWI = 'fr-BE-GerardNeural'          # Kiwikolo (Piccolo VF) : masculine, posée et sèche
PP = 'fr-FR-EloiseNeural'            # Petit-Poirsan : voix aiguë d'enfant
NAR = 'fr-CH-FabriceNeural'          # narrateur (« Précédemment dans... »)
FX_POM = 'highpass=f=90,equalizer=f=2800:t=q:w=1:g=3'
# dernière réplique : plus basse, étouffée, comme un souffle
FX_POM_SOUFFLE = 'highpass=f=70,lowpass=f=5000,equalizer=f=160:t=q:w=1:g=3'
FX_RAD = 'highpass=f=50,equalizer=f=110:t=q:w=1:g=5,equalizer=f=3500:t=q:w=1:g=-2,aecho=0.8:0.6:45|90:0.18|0.10'
FX_KIWI = 'highpass=f=70,equalizer=f=200:t=q:w=1:g=3,equalizer=f=2500:t=q:w=1:g=2'
FX_KIWI_CRI = 'highpass=f=70,equalizer=f=200:t=q:w=1:g=3,equalizer=f=2400:t=q:w=1:g=4,aecho=0.8:0.5:60:0.15'
FX_PP = 'highpass=f=150,equalizer=f=3000:t=q:w=1:g=3'
FX_NAR = 'highpass=f=70,equalizer=f=120:t=q:w=1:g=3,aecho=0.8:0.4:70:0.12'
# clé, voix, morceaux, débit, hauteur, pause entre morceaux (s), effets, durée max (images)
# durée max : place disponible avant la réplique ou le plan suivant (cf. make_timeline_ep2.py)
lines = [
 ('n1', NAR, ["Précédemment dans Fruit Ball Z...", "Raditz, un guerrier venu de l'espace, a enlevé Petit-Poirsan, le fils de Pomgoku !"], 6, -4, 0.5, FX_NAR, 172),
 ('l1', KIWI, ["On oublie nos différends.", "Aujourd'hui, on se bat ensemble."], -8, -10, 0.7, FX_KIWI, 150),
 ('l2', POM, ["Je ne le laisserai pas repartir avec mon fils."], 10, 14, 0, FX_POM, 92),
 ('l3', RAD, ["Vous croyez vraiment", "pouvoir m'arrêter à deux ?"], -12, -12, 0.35, FX_RAD, 110),
 ('p1', PP, ["Laisse mon papa tranquille !"], 8, 14, 0, FX_PP, 50),
 ('l4', RAD, ["Aïïïïe !", "Lâche ma jambe, sale pépin !"], -2, 8, 0.3, FX_RAD, 100),
 ('l5', KIWI, ["Pomgoku, tiens-le !", "Je n'ai qu'un seul tir !"], 4, -6, 0.4, FX_KIWI_CRI, 110),
 ('l6', RAD, ["Lâche-moi, idiot !", "Tu vas y passer, toi aussi !"], -6, -10, 0.4, FX_RAD, 100),
 ('l7', POM, ["Protège-le...", "protège tout le monde..."], -40, -16, 1.4, FX_POM_SOUFFLE, 175),
 ('n2', NAR, ["Dans le prochain épisode...", "Voyage vers Namek !"], 0, -4, 0.6, FX_NAR, 120),
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
if only and os.path.exists(S + '/fbz/src/voices2.json'):
    meta = json.load(open(S + '/fbz/src/voices2.json'))
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
json.dump(meta, open(S + '/fbz/src/voices2.json', 'w'))
