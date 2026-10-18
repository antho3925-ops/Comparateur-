<?php
/* ---------------------------------------------------------------------------
   Chez Eva — la liste d'attente
   ---------------------------------------------------------------------------
   Quand un jour est complet, le client se heurtait a un cul-de-sac. Il peut
   desormais laisser son prenom et son numero : le salon l'appellera si une
   place se libere.

   Rien de plus n'est demande, et ces coordonnees s'effacent toutes seules
   comme celles des rendez-vous.
--------------------------------------------------------------------------- */
declare(strict_types=1);

const FICHIER_ATTENTE = RACINE . '/data/attente.json';

function attente(): array
{
    if (!is_readable(FICHIER_ATTENTE)) {
        return [];
    }
    $lu = json_decode((string) file_get_contents(FICHIER_ATTENTE), true);
    return is_array($lu) ? array_values(array_filter($lu, 'is_array')) : [];
}

/** Ecrit la liste, en oubliant au passage les demandes trop anciennes. */
function ecrire_attente(array $liste): bool
{
    fuseau();
    $limite = date('Y-m-d', strtotime('-' . RETENTION_JOURS . ' days'));
    $gardees = array_values(array_filter($liste, static function (array $a) use ($limite): bool {
        return substr((string) ($a['cree'] ?? ''), 0, 10) >= $limite;
    }));
    return (bool) @file_put_contents(
        FICHIER_ATTENTE,
        json_encode($gardees, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . "\n",
        LOCK_EX
    );
}

/** Inscrit quelqu'un. Rend null si c'est fait, sinon la phrase a afficher. */
function inscrire_en_attente(array $saisie): ?string
{
    fuseau();

    $prenom    = mb_substr(trim((string) ($saisie['prenom'] ?? '')), 0, 40);
    $telephone = mb_substr(trim((string) ($saisie['telephone'] ?? '')), 0, 25);
    $masseuse  = (string) ($saisie['masseuse'] ?? '');
    $date      = (string) ($saisie['date'] ?? '');

    if (mb_strlen($prenom) < 2) {
        return 'prenom';
    }
    if (strlen(preg_replace('/\D/', '', $telephone) ?? '') < 9) {
        return 'telephone';
    }

    $fiche = fiche($masseuse);
    $liste = attente();

    /* Deux fois le meme numero pour le meme jour n'apprend rien de plus. */
    $numero = preg_replace('/\D/', '', $telephone);
    foreach ($liste as $a) {
        if (preg_replace('/\D/', '', (string) ($a['telephone'] ?? '')) === $numero
            && (string) ($a['date'] ?? '') === $date) {
            return null;   /* deja inscrit : on ne dit rien, c'est sans importance */
        }
    }

    $liste[] = [
        'id'           => 'a' . bin2hex(random_bytes(5)),
        'cree'         => date('c'),
        'masseuse'     => $masseuse,
        'masseuse_nom' => (string) ($fiche['prenom'] ?? ''),
        'date'         => preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) ? $date : '',
        'prenom'       => $prenom,
        'telephone'    => $telephone,
    ];

    if (!ecrire_attente($liste)) {
        return 'enregistrement';
    }

    try {
        alerte_attente(end($liste));
    } catch (Throwable $e) {
        /* la demande est enregistree : un courriel qui ne part pas n'y change rien */
    }
    return null;
}

function retirer_de_lattente(string $id): bool
{
    $liste = array_values(array_filter(attente(), static function (array $a) use ($id): bool {
        return (string) ($a['id'] ?? '') !== $id;
    }));
    return ecrire_attente($liste);
}

/** Le salon est prevenu : quelqu'un attend une place. */
function alerte_attente(array $a): void
{
    if (!alertes()['nouvelle']) {
        return;
    }
    $quand = ($a['date'] ?? '') !== '' ? date_francaise((string) $a['date'], false) : 'n’importe quand';
    $objet = sprintf(
        '%s — liste d’attente : %s, %s',
        (string) (parametres()['nom'] ?? 'Chez Eva'),
        (string) ($a['prenom'] ?? ''),
        $quand
    );
    $corps = "Quelqu’un attend qu’une place se libère.\n\n"
        . 'Client      : ' . (string) ($a['prenom'] ?? '') . "\n"
        . 'Téléphone   : ' . (string) ($a['telephone'] ?? '') . "\n"
        . 'Jour voulu  : ' . $quand . "\n"
        . 'Masseuse    : ' . ((string) ($a['masseuse_nom'] ?? '') ?: 'peu importe')
        . pied_courriel();
    envoyer_courriel($objet, $corps);
}
