#!/usr/bin/env python3
"""Chaine d'ingestion des documents assureurs.

    python3 tools/sources.py telecharger <manifeste.json>   # recupere les PDF
    python3 tools/sources.py extraire                       # PDF -> texte lisible

Les PDF atterrissent dans sources-pdf/<assureur_id>/ et le texte extrait dans
sources-texte/<assureur_id>/. Les deux dossiers sont hors versionnement : ce
sont des documents des assureurs, seules les donnees structurees que j'en tire
sont commitees.
"""
import json
import subprocess
import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
PDF = RACINE / "sources-pdf"
TXT = RACINE / "sources-texte"


def telecharger(chemin_manifeste: str) -> int:
    manifeste = json.loads(Path(chemin_manifeste).read_text(encoding="utf-8"))
    dossier = PDF / manifeste["assureur_id"]
    dossier.mkdir(parents=True, exist_ok=True)

    docs = [d for d in manifeste["documents"] if d.get("type") != "page_web"]
    docs.sort(key=lambda d: d.get("priorite", 99))
    echecs = 0

    for doc in docs:
        cible = dossier / f"{doc['id']}.pdf"
        if cible.exists() and cible.stat().st_size > 0:
            print(f"  = {doc['id']} (deja present)")
            continue
        print(f"  > {doc['id']} ...", end=" ", flush=True)
        res = subprocess.run(
            ["curl", "-sSL", "--max-time", "90", "--fail", "-o", str(cible), doc["url"]],
            capture_output=True, text=True,
        )
        if res.returncode != 0 or not cible.exists() or cible.stat().st_size == 0:
            cible.unlink(missing_ok=True)
            print(f"ECHEC ({res.stderr.strip()[:80] or 'fichier vide'})")
            echecs += 1
        else:
            print(f"OK ({cible.stat().st_size // 1024} Ko)")

    if echecs:
        print(
            f"\n{echecs} echec(s). Si le message parle de 'CONNECT tunnel failed, response 403',\n"
            "l'environnement bloque l'acces sortant : autoriser le domaine dans la politique\n"
            "reseau de l'environnement, ou deposer les PDF a la main dans "
            f"{dossier.relative_to(RACINE)}/ puis lancer 'extraire'."
        )
    return 1 if echecs else 0


def extraire() -> int:
    try:
        from pypdf import PdfReader
    except ImportError:
        print("pypdf manquant : pip install pypdf")
        return 1

    fichiers = sorted(PDF.rglob("*.pdf"))
    if not fichiers:
        print(f"Aucun PDF dans {PDF.relative_to(RACINE)}/ - rien a extraire.")
        return 0

    for pdf in fichiers:
        rel = pdf.relative_to(PDF)
        cible = (TXT / rel).with_suffix(".txt")
        cible.parent.mkdir(parents=True, exist_ok=True)
        try:
            pages = PdfReader(str(pdf)).pages
            texte = "\n\n".join(
                f"--- page {i} ---\n{(p.extract_text() or '').strip()}"
                for i, p in enumerate(pages, 1)
            )
        except Exception as e:  # PDF protege, corrompu ou purement graphique
            print(f"  ! {rel} : {e}")
            continue
        cible.write_text(texte, encoding="utf-8")
        utiles = sum(1 for p in texte.split("--- page ") if len(p) > 120)
        print(f"  OK {rel} -> {len(pages)} pages, {utiles} avec du texte exploitable")
        if utiles == 0:
            print("     (aucun texte : PDF probablement scanne, il faudra une capture d'ecran)")
    return 0


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args or args[0] not in {"telecharger", "extraire"}:
        print(__doc__)
        sys.exit(2)
    if args[0] == "telecharger":
        if len(args) < 2:
            print("Manque le chemin du manifeste.")
            sys.exit(2)
        sys.exit(telecharger(args[1]))
    sys.exit(extraire())
