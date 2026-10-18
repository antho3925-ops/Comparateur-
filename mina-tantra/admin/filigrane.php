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

/* La banniere : un ruban rouge en travers du coin bas-droit, le nom du
   salon ecrit dessus en blanc. */
const RUBAN_ROUGE = [176, 24, 32];

/**
 * Pose la banniere sur une image deja ouverte. Rend false si le serveur
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
    $cote  = min($large, $haut);
    if ($cote < 120) {
        return false;          /* trop petite pour porter une banniere */
    }

    /* La taille du texte suit la photo ; la banniere suit le texte. */
    $corps = max(11, (int) round($cote / 26));
    $boite = @imagettfbbox($corps, 0, POLICE_FILIGRANE, $texte);
    if ($boite === false) {
        return false;
    }
    $largeurTexte = abs($boite[2] - $boite[0]);
    $epaisseur = (int) round($corps * 2.1);          /* hauteur du ruban */

    /* Le ruban joint deux points des bords, a egale distance du coin : sa
       corde doit laisser de l'air autour du texte. */
    $corde = $largeurTexte + $corps * 2.4;
    $milieu = (int) round($corde / M_SQRT2);
    $milieu = min($milieu, (int) round($cote * 0.62));

    $demi = (int) round($epaisseur * M_SQRT2 / 2);
    $interieur = max(8, $milieu - $demi);            /* cote du coin */
    $exterieur = $milieu + $demi;

    /* Les quatre coins du ruban, en partant du bord bas. */
    $points = [
        $large - $exterieur, $haut,
        $large,              $haut - $exterieur,
        $large,              $haut - $interieur,
        $large - $interieur, $haut,
    ];

    $rouge = imagecolorallocate($image, RUBAN_ROUGE[0], RUBAN_ROUGE[1], RUBAN_ROUGE[2]);
    $ombre = imagecolorallocatealpha($image, 0, 0, 0, 100);
    imagefilledpolygon($image, array_map('intval', $points), $ombre);
    imagefilledpolygon($image, array_map('intval', $points), $rouge);

    /* Le texte est centre dans le ruban : on demande a GD l'encombrement
       du texte deja tourne, et on le recale sur le milieu du ruban. */
    $cx = $large - (int) round($milieu / 2);
    $cy = $haut  - (int) round($milieu / 2);

    $tourne = @imagettfbbox($corps, 45, POLICE_FILIGRANE, $texte);
    if ($tourne === false) {
        return true;                                  /* le ruban seul fera l'affaire */
    }
    $xs = [$tourne[0], $tourne[2], $tourne[4], $tourne[6]];
    $ys = [$tourne[1], $tourne[3], $tourne[5], $tourne[7]];
    $x = (int) round($cx - (min($xs) + max($xs)) / 2);
    $y = (int) round($cy - (min($ys) + max($ys)) / 2);

    $blanc = imagecolorallocate($image, 255, 255, 255);
    @imagettftext($image, $corps, 45, $x, $y, $blanc, POLICE_FILIGRANE, $texte);

    return true;
}

/* ------------------- Les photos deja en ligne ---------------------------- */

/* Le jour ou la marque change de forme, les photos doivent toutes y
   repasser : le journal porte donc le nom de la marque en cours. */
const FORME_FILIGRANE = 'ruban-rouge-1';

function journal_filigrane(): array
{
    if (!is_readable(JOURNAL_FILIGRANE)) {
        return [];
    }
    $lu = json_decode((string) file_get_contents(JOURNAL_FILIGRANE), true);
    if (!is_array($lu) || ($lu['forme'] ?? '') !== FORME_FILIGRANE) {
        return [];          /* une autre marque : tout est a refaire */
    }
    return is_array($lu['faites'] ?? null) ? $lu['faites'] : [];
}

function ecrire_journal_filigrane(array $faits): bool
{
    return (bool) @file_put_contents(
        JOURNAL_FILIGRANE,
        json_encode(['forme' => FORME_FILIGRANE, 'faites' => array_values(array_unique($faits))],
            JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT),
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
