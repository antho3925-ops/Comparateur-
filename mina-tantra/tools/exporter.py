#!/usr/bin/env python3
"""Replie tout le site dans un seul fichier HTML.

Le CSS, le JavaScript, les photos et l'icone sont incorpores directement dans
la page (en base64). Le fichier obtenu, dist/index.html, se depose seul sur
n'importe quel hebergement : ni dossier a creer, ni archive a decompresser.

Usage :  python3 tools/exporter.py     (depuis le dossier mina-tantra/)
"""
import base64, mimetypes, pathlib, re, sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
SORTIE = RACINE / 'dist' / 'index.html'


def donnees(chemin: pathlib.Path) -> str:
    """Renvoie le fichier sous forme d'URI data:."""
    type_mime = mimetypes.guess_type(chemin.name)[0] or 'application/octet-stream'
    return 'data:%s;base64,%s' % (type_mime, base64.b64encode(chemin.read_bytes()).decode())


def lire(rel: str) -> str:
    return (RACINE / rel).read_text(encoding='utf-8')


def main() -> int:
    html = lire('index.html')
    css = lire('assets/styles.css')
    js = lire('data/contenu.js') + '\n' + lire('js/site.js')

    # 1. Les feuilles de style et les scripts deviennent des blocs en ligne.
    html = html.replace('<link rel="stylesheet" href="assets/styles.css">',
                        '<style>\n%s\n</style>' % css)
    html = re.sub(r'\n?\s*<script src="data/contenu\.js"></script>\s*\n?\s*'
                  r'<script src="js/site\.js"></script>',
                  lambda _: '\n<script>\n%s\n</script>' % js, html)
    if '<script src=' in html:
        print('Un script externe n\'a pas ete replie.', file=sys.stderr)
        return 1

    # 2. L'icone de l'onglet.
    for balise, fichier in (
        ('<link rel="icon" href="assets/favicon.ico" sizes="any">', 'assets/favicon.ico'),
        ('<link rel="icon" type="image/png" href="assets/favicon.png">', 'assets/favicon.png'),
        ('<link rel="apple-touch-icon" href="assets/favicon-180.png">', 'assets/favicon-180.png'),
    ):
        html = html.replace(balise, balise.replace(fichier, donnees(RACINE / fichier)))

    # 3. L'apercu de partage est depose a la racine, a cote du fichier unique.
    html = html.replace('https://mina-tantra.ch/assets/partage.jpg',
                        'https://mina-tantra.ch/partage.jpg')

    # 4. Toutes les photos, ou qu'elles soient citees (CSS, donnees, HTML).
    photos = sorted((RACINE / 'photos').rglob('*.jpg')) + sorted((RACINE / 'photos').rglob('*.png'))
    for photo in photos:
        rel = photo.relative_to(RACINE).as_posix()
        uri = donnees(photo)
        html = html.replace("'../%s'" % rel, "'%s'" % uri)   # chemins vus depuis le CSS
        html = html.replace(rel, uri)                        # chemins vus depuis la page
    reste = re.findall(r'photos/[\w/.-]+\.(?:jpg|png)', html)
    if reste:
        print('Attention, chemins non replies : %s' % sorted(set(reste)), file=sys.stderr)
        return 1

    SORTIE.parent.mkdir(exist_ok=True)
    SORTIE.write_text(html, encoding='utf-8')
    print('%s  (%.1f Mo)' % (SORTIE, SORTIE.stat().st_size / 1048576))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
