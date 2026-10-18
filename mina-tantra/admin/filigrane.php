<?php
/* ---------------------------------------------------------------------------
   Chez Eva — le filigrane des photos
   ---------------------------------------------------------------------------
   Dans ce metier les photos se font voler et reapparaissent sur d'autres
   annonces. Le nom du salon est donc pose en bas a droite de chaque photo,
   assez discret pour ne pas l'abimer, assez lisible pour decourager la
   copie.

   Les photos deja en ligne sont marquees une fois pour toutes ; un journal
   evite de repasser deux fois sur la meme, ce qui empilerait les marques.
--------------------------------------------------------------------------- */
declare(strict_types=1);

const POLICE_FILIGRANE  = RACINE . '/assets/polices/italiana.ttf';
const JOURNAL_FILIGRANE = RACINE . '/data/filigrane.json';

/** Le texte pose sur les photos : le nom du salon, tel quel. */
function texte_filigrane(): string
{
    $nom = trim((string) (parametres()['nom'] ?? ''));
    return $nom !== '' ? $nom : 'Chez Eva';
}

/**
 * Pose le filigrane sur une image deja ouverte. Rend false si le serveur
 * n'a pas de quoi ecrire du texte : la photo part alors sans marque,
 * ce qui vaut mieux que pas de photo du tout.
 */
function poser_filigrane($image): bool
{
    if (!function_exists('imagettftext') || !is_readable(POLICE_FILIGRANE)) {
        return false;
    }
    $texte = texte_filigrane();
    $large = imagesx($image);
    $haut  = imagesy($image);

    /* La marque suit la taille de la photo : un trentieme de sa largeur. */
    $corps = max(11, (int) round($large / 30));
    $marge = max(10, (int) round($large / 48));

    $boite = @imagettfbbox($corps, 0, POLICE_FILIGRANE, $texte);
    if ($boite === false) {
        return false;
    }
    $largeurTexte = abs($boite[2] - $boite[0]);
    $hauteurTexte = abs($boite[7] - $boite[1]);

    $x = $large - $largeurTexte - $marge;
    $y = $haut - $marge;

    /* Une ombre portee garde la marque lisible sur un fond clair. */
    $ombre = imagecolorallocatealpha($image, 0, 0, 0, 85);
    $blanc = imagecolorallocatealpha($image, 255, 255, 255, 55);
    @imagettftext($image, $corps, 0, $x + 1, $y + 1, $ombre, POLICE_FILIGRANE, $texte);
    @imagettftext($image, $corps, 0, $x, $y, $blanc, POLICE_FILIGRANE, $texte);

    /* Sans cette hauteur, la marque sortirait de la photo sur une image
       minuscule : on verifie qu'elle tient. */
    return $hauteurTexte < $haut;
}

/* ------------------- Les photos deja en ligne ---------------------------- */

function journal_filigrane(): array
{
    if (!is_readable(JOURNAL_FILIGRANE)) {
        return [];
    }
    $lu = json_decode((string) file_get_contents(JOURNAL_FILIGRANE), true);
    return is_array($lu) ? $lu : [];
}

function ecrire_journal_filigrane(array $faits): bool
{
    return (bool) @file_put_contents(
        JOURNAL_FILIGRANE,
        json_encode(array_values(array_unique($faits)), JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT),
        LOCK_EX
    );
}

/** Les photos du salon et des masseuses, chemins relatifs a la racine. */
function toutes_les_photos(): array
{
    $liste = [];
    foreach (['photos/masseuses', 'photos/salon'] as $dossier) {
        foreach (glob(RACINE . '/' . $dossier . '/*.{jpg,jpeg,JPG,JPEG}', GLOB_BRACE) ?: [] as $chemin) {
            $liste[] = $dossier . '/' . basename($chemin);
        }
    }
    sort($liste);
    return $liste;
}

/** Celles qui n'ont pas encore recu la marque. */
function photos_sans_filigrane(): array
{
    $faites = journal_filigrane();
    return array_values(array_diff(toutes_les_photos(), $faites));
}

/**
 * Marque les photos qui ne le sont pas encore, quelques-unes a la fois pour
 * ne pas faire attendre la page. Rend le nombre de photos traitees.
 */
function marquer_photos(int $combien = 8): int
{
    if (!function_exists('imagecreatefromstring') || !is_readable(POLICE_FILIGRANE)) {
        return 0;
    }
    $faites = journal_filigrane();
    $faits = 0;

    foreach (array_slice(photos_sans_filigrane(), 0, $combien) as $rel) {
        $chemin = RACINE . '/' . $rel;
        $image = @imagecreatefromstring((string) @file_get_contents($chemin));
        if ($image === false) {
            $faites[] = $rel;       /* illisible : inutile d'y revenir */
            continue;
        }
        if (poser_filigrane($image)) {
            @imagejpeg($image, $chemin, 88);
            $faits++;
        }
        imagedestroy($image);
        $faites[] = $rel;
    }

    ecrire_journal_filigrane($faites);
    return $faits;
}

/** Une photo fraichement ecrite est notee comme deja marquee. */
function noter_photo_marquee(string $rel): void
{
    $faites = journal_filigrane();
    $faites[] = $rel;
    ecrire_journal_filigrane($faites);
}
