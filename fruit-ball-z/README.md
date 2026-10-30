# Fruit Ball Z — Épisode 1

Dessin animé TikTok (1080×1920, 30 i/s, 39 s) fait avec Remotion. Page vidéo publiée :
https://claude.ai/artifact/1tQhAtR4Xrh67eAhapuHbS

## Arborescence

- `fbz/` : projet Remotion (personnages SVG dans `src/characters.tsx`, décors dans `src/scenery.tsx`, scènes dans `src/Episode.tsx`).
- `fbz/src/timeline.json` : timing des scènes et des répliques (généré par `make_timeline.py`).
- `fbz/src/voices.json` : amplitude de bouche image par image (généré par le script de voix).
- `fbz/public/audio/l1..l5.wav` : répliques ; `mix.wav` (voix + musique + bruitages) est régénéré par `make_audio.py`.
- `make_voices3.py` : voix edge-tts actuelles (Henri pour Pomgoku, Remy pour Raditz), façon VF de Dragon Ball Z.
- `make_voices2.py` : anciennes voix Piper (Tom pour Pomgoku, Pierre pour Raditz).
- `site/` : page du lecteur vidéo.

Les scripts Python prennent en argument le dossier qui contient `fbz/` (ici `fruit-ball-z`).

## Refaire la vidéo

```bash
cd fruit-ball-z/fbz && npm ci
cd .. && python3 make_timeline.py . && python3 make_audio.py .
cd fbz && npx remotion render src/index.ts Episode1 out/render.mp4 --concurrency=4 --crf=14 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
# compression < 15 Mo (2 passes, audio repris de mix.wav)
cd out && ffmpeg -y -i render.mp4 -c:v libx264 -preset slow -tune animation -b:v 2500k -pass 1 -an -f mp4 /dev/null && \
  ffmpeg -y -i render.mp4 -i ../public/audio/mix.wav -map 0:v -map 1:a -c:v libx264 -preset slow -tune animation \
  -b:v 2500k -pass 2 -pix_fmt yuv420p -c:a aac -b:a 160k -shortest -movflags +faststart episode1_fruitballz.mp4
```

`stills.mjs` sort des images fixes pour vérifier : `OUT=dossier node stills.mjs 60 300 650`.

## Voix edge-tts

`make_voices3.py` remplace les voix Piper par edge-tts, réglées pour rappeler la VF de Dragon Ball Z :
Pomgoku = `fr-FR-HenriNeural` plus rapide et plus aigu (réplique finale plus grave et lente), Raditz =
`fr-FR-RemyMultilingualNeural` plus lent et plus grave (hauteur réglée par edge-tts, petit écho). Même sortie que
`make_voices2.py` ; une réplique trop longue pour sa scène est accélérée automatiquement.

Il faut que l'environnement autorise `speech.platform.bing.com` (`edge-tts --list-voices` doit répondre), puis :

```bash
pip install edge-tts && python3 make_voices3.py . && python3 make_timeline.py . && python3 make_audio.py .
```

puis rendu, compression, et republier la page à la même URL. Derrière un proxy TLS, le script ajoute le
certificat de `SSL_CERT_FILE` au contexte SSL d'edge-tts (qui n'utilise sinon que certifi).

# Épisode 2 — Sacrifice au verger

75 s (2265 images), mêmes personnages et voix que l'épisode 1, plus Kiwikolo (kiwi façon Piccolo, voix
`fr-BE-GerardNeural`), Petit-Poirsan (`fr-FR-EloiseNeural`) et un narrateur (`fr-CH-FabriceNeural`).
Composition Remotion `Episode2` : `fbz/src/Episode2.tsx` (plans), `characters2.tsx` (Kiwikolo, fissures
d'armure), `scenery2.tsx` (traits de vitesse, étoiles d'impact). Le « Précédemment » rejoue des plans de
l'épisode 1 en accéléré (`<Episode recap />` dans un `<Freeze>`).

```bash
pip install edge-tts && python3 make_voices_ep2.py .   # fbz/public/audio/ep2/lN.wav + fbz/src/voices2.json
python3 make_timeline_ep2.py . && python3 make_audio_ep2.py .
cd fbz && npx remotion render src/index.ts Episode2 out/ep2_render.mp4 --concurrency=4 --crf=14 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
COMP=Episode2 OUT=dossier node stills.mjs 300 990 1530   # images de contrôle
```

`make_voices_ep2.py . l4 l7` ne régénère que les répliques citées. Compression comme l'épisode 1 (H.264 Main 4.0,
2 passes, audio repris de `fbz/public/audio/ep2/mix.wav`), vers `site/episode2_fruitballz.mp4` ; la page
`site/index.html` présente les deux épisodes.

# Épisode 3 — Voyage vers Namek

73 s (2190 images). Nouveaux personnages dans `fbz/src/characters3.tsx` : Végénade (grenade façon Vegeta, fissures
dorées, pépins qui brillent avec `rage`), Namekiens (`Namekian`, `elder` pour l'ancien), la gousse `PeaShip`, la
capsule `VegPod`, les boules orange `OrangeBall`. Composition `Episode3` : `fbz/src/Episode3.tsx` ; le « Précédemment »
rejoue des plans de l'ép.2 (`<Episode2 recap />`). Voix : Végénade `fr-FR-RemyMultilingualNeural` (sec, compressé,
sans écho), Namekien `fr-CA-JeanNeural` (lent, chevrotant), Kiwikolo, Petit-Poirsan et narrateur comme l'ép.2.

```bash
pip install edge-tts && python3 make_voices_ep3.py .   # fbz/public/audio/ep3/lN.wav + fbz/src/voices3.json
python3 make_timeline_ep3.py . && python3 make_audio_ep3.py .
cd fbz && npx remotion render src/index.ts Episode3 out/ep3_render.mp4 --concurrency=4 --crf=14 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
```

Compression comme les épisodes précédents (H.264 Main 4.0, 2 passes) mais à 1250 kb/s pour rester sous 15 Mo, audio
AAC 128 kb/s repris de `fbz/public/audio/ep3/mix.wav`, vers `site/episode3_fruitballz.mp4`.

# Épisode 4 — Litcheezer entre en scène

73 s (2190 images). Nouveaux personnages dans `fbz/src/characters4.tsx` : `Litcheezer` (litchi nacré façon Freezer,
assis dans sa capsule flottante, `finger` lève l'index), `DriedSoldier` (sbires raisins secs et dattes en armure),
`NamekElder` (le vieux Namekien barbu), `SaucerShip` (vaisseau rond) et `PomShip` (vaisseau de Pomgoku, hublot).
Décors de Namek de l'ép.3 avec variantes grise et détruite dans `scenery4.tsx`. Voix : Litcheezer =
`fr-CA-ThierryNeural` doux, mélangé à sa version chuchotée, petit rire entre les phrases ; vieux Namekien =
`fr-CA-JeanNeural` ; Végénade et narrateur comme l'ép.3.

```bash
pip install edge-tts && python3 make_voices_ep4.py .   # fbz/public/audio/ep4/*.wav + fbz/src/voices4.json
python3 make_timeline_ep4.py . && python3 make_audio_ep4.py .
cd fbz && npx remotion render src/index.ts Episode4 out/ep4_render.mp4 --concurrency=4 --crf=14 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
```

Compression comme l'ép.3 (H.264 Main 4.0, 2 passes, 1250 kb/s, AAC 128 kb/s depuis `fbz/public/audio/ep4/mix.wav`),
vers `site/episode4_fruitballz.mp4`.

# Épisode 5 — Pomgoku débarque

75 s (2250 images). Composition `Episode5` : `fbz/src/Episode5.tsx` (village en ruines, fumée, feux, vaisseau de
Pomgoku qui s'ouvre, combat). `fbz/src/characters5.tsx` : Litcheezer hors de sa capsule, même dessin que l'ép.4 avec
des jambes, les bras croisés (`crossed`), un sourire qui s'élargit (`grin`) et le haut du corps qui se plie (`tilt`).
Le « Précédemment » rejoue des plans de l'ép.4 (`<Episode4 recap />`) ; `<Episode5 recap />` coupe son et sous-titres.
Voix : Pomgoku comme l'ép.1, Kiwikolo comme l'ép.2, Litcheezer comme l'ép.4 (Thierry chuchoté, petit rire
« Ho ho ho... » sans sous-titre), cri de Pomgoku étiré avec `atempo`.

```bash
pip install edge-tts && python3 make_voices_ep5.py .   # fbz/public/audio/ep5/lN.wav + fbz/src/voices5.json
python3 make_timeline_ep5.py . && python3 make_audio_ep5.py .
cd fbz && npx remotion render src/index.ts Episode5 out/ep5_render.mp4 --concurrency=4 --crf=14 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
```

Compression comme l'ép.3 (H.264 Main 4.0, 2 passes, audio AAC 128 kb/s repris de `fbz/public/audio/ep5/mix.wav`),
vers `site/episode5_fruitballz.mp4`.

# Épisode 6 — Les formes de Litcheezer

74 s (2220 images). Composition `Episode6` : `fbz/src/Episode6.tsx` (transformation, pichenette au ralenti, veines
et aura dorées). `fbz/src/characters6.tsx` : Litcheezer avec `form` 0..1 (0 = dessin de l'ép.4/5, 1 = deuxième
forme : plus large, peau de litchi rugueuse, épines aux épaules et sur la tête, `crack`, `flick` = pichenette),
`PomVeins` et `GoldAura` pour Pomgoku. Le « Précédemment » (`Recap6.tsx`) rejoue des plans de l'ép.5
(`<Episode5 recap />`). Voix : Litcheezer deuxième forme = voix de l'ép.4 (Thierry, 40 % chuchoté) avec la hauteur
baissée à -16 Hz ; Végénade comme l'ép.3, Pomgoku comme l'ép.1, narrateur.

```bash
pip install edge-tts && python3 make_voices_ep6.py .   # fbz/public/audio/ep6/lN.wav + fbz/src/voices6.json
python3 make_timeline_ep6.py . && python3 make_audio_ep6.py .
cd fbz && npx remotion render src/index.ts Episode6 out/ep6_render.mp4 --concurrency=4 --crf=14 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
```

Compression comme l'ép.3 (H.264 Main 4.0, 2 passes, 1250 kb/s, AAC 128 kb/s depuis `fbz/public/audio/ep6/mix.wav`),
vers `site/episode6_fruitballz.mp4`.
