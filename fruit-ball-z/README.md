# Fruit Ball Z — Épisode 1

Dessin animé TikTok (1080×1920, 30 i/s, 39 s) fait avec Remotion. Page vidéo publiée :
https://claude.ai/artifact/1tQhAtR4Xrh67eAhapuHbS

## Arborescence

- `fbz/` : projet Remotion (personnages SVG dans `src/characters.tsx`, décors dans `src/scenery.tsx`, scènes dans `src/Episode.tsx`).
- `fbz/src/timeline.json` : timing des scènes et des répliques (généré par `make_timeline.py`).
- `fbz/src/voices.json` : amplitude de bouche image par image (généré par le script de voix).
- `fbz/public/audio/l1..l5.wav` : répliques ; `mix.wav` (voix + musique + bruitages) est régénéré par `make_audio.py`.
- `make_voices2.py` : voix Piper actuelles (Tom pour Pomgoku, Pierre pour Raditz).
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

## Prochaine étape : voix edge-tts

`make_voices3.py` remplace les voix Piper par edge-tts, réglées pour rappeler la VF de Dragon Ball Z :
Pomgoku = `fr-FR-HenriNeural` plus rapide et plus aigu (réplique finale plus grave et lente), Raditz =
`fr-FR-RemyMultilingualNeural` plus lent et plus grave (hauteur réglée par edge-tts, petit écho). Même sortie que
`make_voices2.py` ; une réplique trop longue pour sa scène est accélérée automatiquement.

Il faut que l'environnement autorise `speech.platform.bing.com` (`edge-tts --list-voices` doit répondre), puis :

```bash
pip install edge-tts && python3 make_voices3.py . && python3 make_timeline.py . && python3 make_audio.py .
```

puis rendu, compression, et republier la page à la même URL.
