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
import pathlib
import secrets

RACINE = pathlib.Path(__file__).resolve().parent.parent
SORTIE = RACINE / 'dist' / 'installateur.php'

# Ce qui part sur le serveur. Le reste (tools, dist, README) n'y a rien a faire.
A_DEPLOYER = [
    'index.php', 'modele.html', 'robots.txt', 'sitemap.xml',
    'admin/index.php', 'admin/noyau.php',
    'assets/styles.css', 'assets/favicon.ico', 'assets/favicon.png',
    'assets/favicon-180.png', 'assets/partage.jpg',
    'js/site.js',
    'data/contenu.js', 'data/masseuses.json', 'data/.htaccess',
]
A_DEPLOYER += sorted(
    p.relative_to(RACINE).as_posix()
    for p in (RACINE / 'photos').rglob('*')
    if p.is_file() and p.name != '.gitkeep'
)

# Ces fichiers ne sont ecrits que s'ils n'existent pas deja sur le serveur :
# ils appartiennent a l'administration, pas au paquet.
PRESERVES = ['data/masseuses.json']


def main() -> int:
    cle = secrets.token_urlsafe(12)

    morceaux = []
    for rel in A_DEPLOYER:
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
    print('Adresse a ouvrir :  https://mina-tantra.ch/installateur.php?cle=%s' % cle)
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
