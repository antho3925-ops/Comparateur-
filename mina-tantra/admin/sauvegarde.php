<?php
/* ---------------------------------------------------------------------------
   Chez Eva — la sauvegarde
   ---------------------------------------------------------------------------
   Tout le salon tient dans deux dossiers : data/ pour les fiches, les
   rendez-vous et les reglages, photos/ pour les images. Ces fonctions les
   mettent dans une archive que le salon telecharge d'un bouton, et savent
   la remettre en place le jour ou il le faut.

   La restauration est l'operation la plus dangereuse du site : elle ecrase
   le present. Elle commence donc par mettre l'etat actuel de cote, et
   n'accepte que des fichiers qu'elle reconnait.
--------------------------------------------------------------------------- */
declare(strict_types=1);

const DOSSIER_SAUVEGARDES = RACINE . '/data/sauvegardes';
const SAUVEGARDE_POIDS_MAX = 209715200;   // 200 Mo : au-dela, ce n'est plus le salon
const SAUVEGARDE_FICHIERS_MAX = 2000;

/** Ce qu'une archive a le droit de contenir, et rien d'autre. */
function entree_admise(string $nom): bool
{
    if (strpos($nom, '..') !== false || strpos($nom, "\0") !== false || $nom[0] === '/') {
        return false;
    }
    return (bool) preg_match(
        '#^(data/[A-Za-z0-9._-]+\.json|photos/(masseuses|salon)/[A-Za-z0-9._-]+\.(jpe?g|png|webp|gif))$#i',
        $nom
    );
}

/** La liste des fichiers du salon, chemins relatifs a la racine. */
function fichiers_a_sauvegarder(): array
{
    $liste = [];
    foreach (glob(RACINE . '/data/*.json') ?: [] as $chemin) {
        $liste[] = 'data/' . basename($chemin);
    }
    foreach (['photos/masseuses', 'photos/salon'] as $dossier) {
        foreach (glob(RACINE . '/' . $dossier . '/*') ?: [] as $chemin) {
            if (is_file($chemin) && entree_admise($dossier . '/' . basename($chemin))) {
                $liste[] = $dossier . '/' . basename($chemin);
            }
        }
    }
    sort($liste);
    return $liste;
}

/**
 * Fabrique l'archive et rend son chemin, ou null si le serveur ne sait pas
 * faire de zip. Le fichier est temporaire : a l'appelant de l'effacer.
 */
function creer_sauvegarde(?string $destination = null): ?string
{
    if (!class_exists('ZipArchive')) {
        return null;
    }
    $chemin = $destination ?? (sys_get_temp_dir() . '/chez-eva-' . bin2hex(random_bytes(6)) . '.zip');
    $zip = new ZipArchive();
    if ($zip->open($chemin, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
        return null;
    }

    foreach (fichiers_a_sauvegarder() as $rel) {
        $zip->addFile(RACINE . '/' . $rel, $rel);
    }

    /* Une note lisible, pour qui ouvrirait l'archive dans six mois. */
    $zip->addFromString('sauvegarde.txt', implode("\n", [
        'Sauvegarde du site ' . (string) (parametres()['nom'] ?? 'Chez Eva'),
        'Faite le ' . date('d/m/Y à H:i'),
        '',
        'data/    : fiches des masseuses, rendez-vous, réglages, mot de passe.',
        'photos/  : photos des masseuses et du salon.',
        '',
        'Pour la remettre en place : administration → Sauvegarde → Restaurer.',
    ]) . "\n");

    $zip->close();
    return is_file($chemin) ? $chemin : null;
}

/** Le nom du fichier propose au telechargement. */
function nom_sauvegarde(): string
{
    fuseau();
    return 'chez-eva-' . date('Y-m-d-Hi') . '.zip';
}

/* ----------------------------- La restauration --------------------------- */

/**
 * Remet en place une archive envoyee depuis l'administration.
 * Rend null si tout s'est bien passe, sinon la phrase a afficher.
 */
function restaurer_sauvegarde(array $envoi): ?string
{
    if (!class_exists('ZipArchive')) {
        return 'Ce serveur ne sait pas ouvrir les archives zip.';
    }
    if (($envoi['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        return 'Aucun fichier reçu, ou fichier trop lourd pour le serveur.';
    }
    if (!is_uploaded_file((string) $envoi['tmp_name'])) {
        return 'Envoi invalide.';
    }
    if ((int) ($envoi['size'] ?? 0) > SAUVEGARDE_POIDS_MAX) {
        return 'Cette archive dépasse 200 Mo : ce n’est pas une sauvegarde du salon.';
    }

    $zip = new ZipArchive();
    if ($zip->open((string) $envoi['tmp_name']) !== true) {
        return 'Ce fichier n’est pas une archive lisible.';
    }
    if ($zip->numFiles > SAUVEGARDE_FICHIERS_MAX) {
        $zip->close();
        return 'Cette archive contient beaucoup trop de fichiers.';
    }

    /* On regarde tout avant de toucher a quoi que ce soit. */
    $aRemettre = [];
    for ($i = 0; $i < $zip->numFiles; $i++) {
        $nom = (string) $zip->getNameIndex($i);
        if ($nom === '' || substr($nom, -1) === '/') {
            continue;
        }
        if ($nom === 'sauvegarde.txt') {
            continue;
        }
        if (!entree_admise($nom)) {
            $zip->close();
            return 'Cette archive contient un fichier inattendu (' . htmlspecialchars($nom) . ').';
        }
        $aRemettre[] = $nom;
    }
    if (!$aRemettre) {
        $zip->close();
        return 'Cette archive ne contient aucun fichier du salon.';
    }

    /* Les fichiers de donnees doivent etre du JSON valide : une sauvegarde
       abimee ne doit pas remplacer un site qui marche. */
    foreach ($aRemettre as $nom) {
        if (substr($nom, 0, 5) !== 'data/') {
            continue;
        }
        $contenu = $zip->getFromName($nom);
        if (!is_string($contenu) || json_decode($contenu, true) === null) {
            $zip->close();
            return 'Le fichier ' . htmlspecialchars($nom) . ' est abîmé : rien n’a été touché.';
        }
    }

    /* Filet de securite : l'etat actuel est mis de cote avant d'etre ecrase. */
    @mkdir(DOSSIER_SAUVEGARDES, 0775, true);
    foreach (glob(DOSSIER_SAUVEGARDES . '/avant-restauration-*.zip') ?: [] as $vieux) {
        @unlink($vieux);
    }
    creer_sauvegarde(DOSSIER_SAUVEGARDES . '/avant-restauration-' . date('Y-m-d-Hi') . '.zip');

    foreach (['data', 'photos/masseuses', 'photos/salon'] as $d) {
        @mkdir(RACINE . '/' . $d, 0775, true);
    }

    $remis = 0;
    foreach ($aRemettre as $nom) {
        $contenu = $zip->getFromName($nom);
        if (!is_string($contenu)) {
            continue;
        }
        if (@file_put_contents(RACINE . '/' . $nom, $contenu, LOCK_EX) !== false) {
            @chmod(RACINE . '/' . $nom, 0664);
            $remis++;
        }
    }
    $zip->close();

    /* Une photo doit etre une photo : ce qui n'en est pas une repart. */
    foreach (['photos/masseuses', 'photos/salon'] as $dossier) {
        foreach (glob(RACINE . '/' . $dossier . '/*') ?: [] as $chemin) {
            if (is_file($chemin) && @getimagesize($chemin) === false) {
                @unlink($chemin);
            }
        }
    }

    return $remis ? null : 'Rien n’a pu être écrit : vérifiez les droits du dossier.';
}

/** La copie de securite faite juste avant la derniere restauration. */
function sauvegarde_de_secours(): ?string
{
    $trouvees = glob(DOSSIER_SAUVEGARDES . '/avant-restauration-*.zip') ?: [];
    return $trouvees ? (string) end($trouvees) : null;
}
