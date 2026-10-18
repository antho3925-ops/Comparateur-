#!/usr/bin/env python3
"""Chez Eva — le controle du paquet, avant toute livraison.

Deux pannes ont deja atteint le site en production : un fichier reclame par
le code mais absent du paquet, et un fichier range dans data/, que le
serveur refuse de servir. Ce controle cherche ces deux defauts-la, et
quelques autres, sur le contenu exact de la liste a deployer.

Il ne remplace pas l'essai dans un navigateur : il attrape ce qu'un essai
pourrait ne pas montrer, et il le fait en une seconde.
"""
from __future__ import annotations
import re, sys, pathlib, importlib.util

RACINE = pathlib.Path(__file__).resolve().parent.parent

spec = importlib.util.spec_from_file_location('paquet', RACINE / 'tools' / 'paquet.py')
paquet = importlib.util.module_from_spec(spec)
spec.loader.exec_module(paquet)
DEPLOYES = set(paquet.A_DEPLOYER)

soucis: list[str] = []


def dit(ligne: str) -> None:
    soucis.append(ligne)


# 1. Tout ce que le paquet annonce doit exister.
for rel in sorted(DEPLOYES):
    if not (RACINE / rel).is_file():
        dit(f'annonce mais absent du disque : {rel}')

# 2. Tout fichier PHP reclame par un autre doit partir avec le paquet.
for rel in sorted(DEPLOYES):
    if not rel.endswith('.php'):
        continue
    texte = (RACINE / rel).read_text(encoding='utf-8', errors='replace')
    dossier = pathlib.PurePosixPath(rel).parent
    # La page d'etat cite ces memes lignes comme temoins, entre guillemets :
    # ce ne sont pas des chargements, on les laisse de cote.
    lignes = [l for l in texte.splitlines() if 'contient(' not in l]
    for appel in re.findall(r"require(?:_once)?\s+__DIR__\s*\.\s*'/([^']+)'", '\n'.join(lignes)):
        cible = (dossier / appel).as_posix().replace('/./', '/')
        cible = re.sub(r'[^/]+/\.\./', '', cible)
        if cible not in DEPLOYES:
            dit(f'{rel} reclame {cible}, qui ne part pas avec le paquet')

# 3. Rien de ce que la page publique charge ne doit vivre dans data/ :
#    le serveur a pour consigne de ne jamais servir ce dossier.
page = (RACINE / 'modele.html').read_text(encoding='utf-8')
charges = re.findall(r'(?:src|href)="(?!https?:|#|mailto:|tel:)([^"]+)"', page)
for chemin in charges:
    propre = chemin.split('?')[0]
    if propre.startswith('data/'):
        dit(f'la page charge {propre}, que le serveur refuse de servir')
    if propre not in DEPLOYES and not propre.startswith('photos/'):
        dit(f'la page charge {propre}, absent du paquet')

# 4. Les fichiers cites par la feuille de style.
css = (RACINE / 'assets' / 'styles.css').read_text(encoding='utf-8')
for url in re.findall(r"url\('([^']+)'\)", css):
    if url.startswith('data:'):
        continue
    cible = (pathlib.PurePosixPath('assets') / url).as_posix()
    cible = re.sub(r'[^/]+/\.\./', '', cible)
    if cible not in DEPLOYES:
        dit(f'la feuille de style cite {cible}, absent du paquet')

# 5. Les scripts du site et leurs fichiers de contenu.
for rel in ('js/site.js', 'js/contenu.js', 'js/traductions.js'):
    if rel not in DEPLOYES:
        dit(f'{rel} ne part pas avec le paquet')

# 6. Les fichiers de donnees crees par l'administration doivent etre
#    preserves : une mise a jour ne doit jamais effacer le travail du salon.
for rel in sorted(DEPLOYES):
    if rel.startswith('data/') and rel.endswith('.json') and rel not in paquet.PRESERVES:
        if rel != 'data/parametres.json':        # celui-la est regenere exprès
            dit(f'{rel} part avec le paquet sans etre preserve : une mise a '
                f'jour ecraserait ce que le salon a saisi')

print(f'{len(DEPLOYES)} fichiers dans le paquet.')
if soucis:
    print('\nCE QUI CLOCHE :')
    for s in soucis:
        print('  ✗', s)
    sys.exit(1)
print('Rien a signaler : chaque fichier reclame par le code part avec le paquet.')
