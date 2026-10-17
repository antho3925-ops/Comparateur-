#!/usr/bin/env python3
"""Fabrique dist/installateur.php : un fichier unique qui installe tout le site.

Le gestionnaire de fichiers d'Infomaniak ne sait ni decompresser une archive
ni creer facilement une arborescence depuis un telephone. Ce script embarque
donc chaque fichier du site dans un seul PHP : une fois depose a la racine et
ouvert dans le navigateur avec sa cle, il recree les dossiers, ecrit les
fichiers, puis s'efface.

Il preserve ce que l'administration a produit : les fiches (data/masseuses.json),
le mot de passe (data/config.json) et les photos deja envoyees.

Usage :  python3 tools/paquet.py     (depuis le dossier du site)
"""
import base64
import json
import pathlib
import re
import secrets

RACINE = pathlib.Path(__file__).resolve().parent.parent
SORTIE = RACINE / 'dist' / 'installateur.php'

# Ce qui part sur le serveur. Le reste (tools, dist, README) n'y a rien a faire.
A_DEPLOYER = [
    'index.php', 'modele.html', 'robots.txt', 'sitemap.xml', '.htaccess',
    'reserver.php', 'agenda.php',
    'admin/index.php', 'admin/noyau.php',
    'assets/styles.css', 'assets/favicon.ico', 'assets/favicon.png',
    'assets/favicon-180.png', 'assets/partage.jpg',
    'assets/polices/italiana.woff2', 'assets/polices/cormorant-300.woff2',
    'assets/polices/cormorant-300-italique.woff2',
    'js/site.js', 'js/contenu.js',
    'data/masseuses.json', 'data/parametres.json',
    'data/reservations.json', 'data/.htaccess',
]
A_DEPLOYER += sorted(
    p.relative_to(RACINE).as_posix()
    for p in (RACINE / 'photos').rglob('*')
    if p.is_file() and p.name != '.gitkeep'
)

# Ces fichiers ne sont ecrits que s'ils n'existent pas deja sur le serveur :
# ils appartiennent a l'administration, pas au paquet.
PRESERVES = ['data/masseuses.json', 'data/reservations.json', 'data/config.json']


JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']


def ecrire_parametres() -> None:
    """Extrait de js/contenu.js ce dont le serveur a besoin.

    Le site garde ainsi un seul fichier de contenu : les horaires et les
    coordonnees saisis pour la page publique servent aussi au calcul des
    creneaux et au calendrier.
    """
    contenu = (RACINE / 'js' / 'contenu.js').read_text(encoding='utf-8')

    def champ(nom: str) -> str:
        m = re.search(r"\b%s:\s*'((?:[^'\\]|\\.)*)'" % nom, contenu)
        return m.group(1).replace("\\'", "'") if m else ''

    horaires: dict[str, list[str] | None] = {}
    bloc = re.search(r'const HORAIRES\s*=\s*\[(.*?)\];', contenu, re.S)
    if bloc:
        for jour, heures in re.findall(r"jour:\s*'([^']+)'\s*,\s*heures:\s*'([^']+)'", bloc.group(1)):
            plage = re.search(r'(\d{1,2})h(\d{2}).*?(\d{1,2})h(\d{2})', heures)
            horaires[jour.lower()] = (
                ['%02d:%s' % (int(plage.group(1)), plage.group(2)),
                 '%02d:%s' % (int(plage.group(3)), plage.group(4))]
                if plage else None
            )
    for jour in JOURS:
        horaires.setdefault(jour, ['09:00', '21:00'])

    # La liste des prestations proposees par le salon, telle que
    # l'administration la propose a cocher pour chaque masseuse.
    prestations: list[str] = []

    def ajouter(nom: str) -> None:
        nom = re.sub(r'^(Massage|Supplement|Supplément)\s+', '', nom).strip()
        if nom:
            nom = nom[0].upper() + nom[1:]
            if nom not in prestations:
                prestations.append(nom)

    for bloc_nom in ('TARIFS', 'SUPPLEMENTS'):
        bloc_liste = re.search(r'const %s\s*=\s*\[(.*?)\n\];' % bloc_nom, contenu, re.S)
        if bloc_liste:
            for nom in re.findall(r"nom:\s*'((?:[^'\\]|\\.)*)'", bloc_liste.group(1)):
                ajouter(nom.replace("\\'", "'"))

    quatre = re.search(r"const QUATRE_MAINS\s*=\s*\{(.*?)\n\};", contenu, re.S)
    if quatre:
        nom = re.search(r"nom:\s*'((?:[^'\\]|\\.)*)'", quatre.group(1))
        if nom:
            ajouter(nom.group(1))

    parametres = {
        'nom': champ('nom'),
        'prestations': prestations,
        'site': champ('site'),
        'adresse': champ('adresse'),
        'codePostal': champ('codePostal'),
        'telephone': champ('telephone'),
        'horaires': horaires,
    }
    (RACINE / 'data' / 'parametres.json').write_text(
        json.dumps(parametres, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    vide = RACINE / 'data' / 'reservations.json'
    if not vide.is_file():
        vide.write_text('[]\n', encoding='utf-8')


# La redirection vers le domaine principal n'est utile qu'une fois son
# certificat SSL emis : activee trop tot, elle enverrait les visiteurs sur
# une adresse en https sans certificat. On la met en service ensuite.
REDIRIGER_VERS_DOMAINE = True

HTACCESS = """# Chez Eva — configuration du serveur web
#
# Des redirections, et rien d'autre. En cas de probleme, supprimer ce
# fichier par FTP suffit a revenir a l'etat precedent : le site fonctionne
# tres bien sans.

Options -Indexes

<IfModule mod_rewrite.c>
    RewriteEngine On

    # 1. Toujours passer par https.
    #    La double condition evite une boucle sur les hebergements ou le
    #    certificat est gere par un serveur place devant celui-ci.
    RewriteCond %%{HTTPS} !=on
    RewriteCond %%{HTTP:X-Forwarded-Proto} !=https
    RewriteRule ^ https://%%{HTTP_HOST}%%{REQUEST_URI} [R=301,L]

%(redirection)s</IfModule>
"""

REDIRECTION = """
    # 2. Un seul nom de domaine fait foi : %(hote)s.
    #    Les autres (ancien domaine, prefixe www) y renvoient.
    RewriteCond %%{HTTP_HOST} !^%(hote_regex)s$ [NC]
    RewriteRule ^ https://%(hote)s%%{REQUEST_URI} [R=301,L]
"""


def ecrire_htaccess() -> None:
    """Fabrique le .htaccess a partir du domaine declare dans contenu.js."""
    parametres = json.loads((RACINE / 'data' / 'parametres.json').read_text(encoding='utf-8'))
    hote = re.sub(r'^https?://', '', parametres.get('site', 'chez-eva.ch')).rstrip('/')
    valeurs = {'hote': hote, 'hote_regex': hote.replace('.', r'\.')}
    valeurs['redirection'] = (REDIRECTION % valeurs) if REDIRIGER_VERS_DOMAINE else ''
    (RACINE / '.htaccess').write_text(HTACCESS % valeurs, encoding='utf-8')
    if not REDIRIGER_VERS_DOMAINE:
        print('Redirection vers %s desactivee pour l\'instant.' % hote)


def main() -> int:
    ecrire_parametres()
    ecrire_htaccess()

    # Les identifiants de l'administration voyagent avec le paquet, pour que
    # la page soit protegee des la premiere seconde. Le fichier ne contient
    # que l'empreinte du mot de passe, jamais le mot de passe lui-meme, et il
    # n'est jamais ecrase sur un serveur qui en a deja un.
    fichiers = list(A_DEPLOYER)
    if (RACINE / 'data' / 'config.json').is_file():
        fichiers.insert(0, 'data/config.json')
    else:
        print("Pas de data/config.json : l'administration demandera de creer "
              'un mot de passe a la premiere visite.')

    cle = secrets.token_urlsafe(12)

    morceaux = []
    for rel in fichiers:
        chemin = RACINE / rel
        if not chemin.is_file():
            print('Fichier manquant : %s' % rel)
            return 1
        contenu = base64.b64encode(chemin.read_bytes()).decode()
        morceaux.append("  '%s' => '%s'," % (rel, contenu))

    php = PHP_INSTALLATEUR % {
        'cle': cle,
        'fichiers': '\n'.join(morceaux),
        'preserves': ', '.join("'%s'" % p for p in PRESERVES),
    }
    SORTIE.parent.mkdir(exist_ok=True)
    SORTIE.write_text(php, encoding='utf-8')

    print('%s  (%.1f Mo)' % (SORTIE, SORTIE.stat().st_size / 1048576))
    print('Adresse a ouvrir :  https://chez-eva.ch/installateur.php?cle=%s' % cle)
    return 0


PHP_INSTALLATEUR = r'''<?php
/* ---------------------------------------------------------------------------
   Chez Eva — installateur
   ---------------------------------------------------------------------------
   Depose ce fichier a la racine du site, puis ouvre-le dans le navigateur avec
   la cle fournie. Il recree les dossiers, ecrit tous les fichiers du site,
   puis se supprime lui-meme.

   Il ne touche ni aux fiches enregistrees depuis l'administration, ni au mot
   de passe, ni aux photos ajoutees apres coup.
--------------------------------------------------------------------------- */
declare(strict_types=1);

$cle = '%(cle)s';
if (!isset($_GET['cle']) || !hash_equals($cle, (string) $_GET['cle'])) {
    http_response_code(403);
    exit('Acces refuse.');
}

$racine = __DIR__;
$preserves = [%(preserves)s];

$fichiers = [
%(fichiers)s
];

header('Content-Type: text/html; charset=utf-8');
echo '<!DOCTYPE html><meta charset="utf-8"><title>Installation</title>';
echo '<style>body{font:16px/1.6 system-ui,sans-serif;background:#120b12;color:#efe6e2;'
   . 'margin:0;padding:28px}h1{font-weight:500}code{color:#e6c766}'
   . '.ok{color:#7ec08c}.ko{color:#e07a7a}a{color:#e6c766}</style>';
echo '<h1>Installation du site</h1>';

$ecrits = 0;
$gardes = 0;
$rates = [];

foreach ($fichiers as $rel => $base64) {
    $destination = $racine . '/' . $rel;

    if (in_array($rel, $preserves, true) && is_file($destination)) {
        $gardes++;
        continue;
    }

    $dossier = dirname($destination);
    if (!is_dir($dossier) && !@mkdir($dossier, 0775, true) && !is_dir($dossier)) {
        $rates[] = $rel . ' (dossier impossible a creer)';
        continue;
    }

    $donnees = base64_decode($base64, true);
    if ($donnees === false || @file_put_contents($destination, $donnees) === false) {
        $rates[] = $rel;
        continue;
    }
    @chmod($destination, 0664);
    $ecrits++;
}

/* Les dossiers ou l'administration ecrit doivent le rester. */
foreach (['data', 'photos', 'photos/masseuses', 'photos/salon'] as $d) {
    if (is_dir($racine . '/' . $d)) {
        @chmod($racine . '/' . $d, 0775);
    }
}

/* L'ancienne page en un seul fichier laisserait Apache servir la mauvaise page. */
$ancienne = $racine . '/index.html';
$ancienneSupprimee = is_file($ancienne) ? @unlink($ancienne) : null;

echo '<p class="ok">' . $ecrits . ' fichiers installes.</p>';
if ($gardes) {
    echo '<p>' . $gardes . ' fichier(s) de donnees deja present(s) : conserve(s) tel(s) quel(s).</p>';
}
if ($ancienneSupprimee) {
    echo '<p>Ancienne page <code>index.html</code> supprimee.</p>';
}
if ($rates) {
    echo '<p class="ko">Echecs : ' . htmlspecialchars(implode(', ', $rates)) . '</p>';
    echo '<p>Verifie les droits d\'ecriture du dossier, puis recharge cette page.</p>';
} else {
    echo '<p>Tout est en place.</p>';
    echo '<p><a href="./">Voir le site</a> &nbsp;·&nbsp; <a href="admin/">Ouvrir l\'administration</a></p>';
    if (@unlink(__FILE__)) {
        echo '<p class="ok">Installateur supprime du serveur.</p>';
    } else {
        echo '<p class="ko">Pense a supprimer <code>installateur.php</code> a la main.</p>';
    }
}
'''

if __name__ == '__main__':
    raise SystemExit(main())
