<?php
/* ---------------------------------------------------------------------------
   Chez Eva — les alertes par courriel
   ---------------------------------------------------------------------------
   Un agenda par abonnement ne se rafraichit que toutes les heures : le salon
   apprenait parfois une demande bien apres le client. Ces fonctions envoient
   un courriel des qu'il se passe quelque chose, et une fois par soir le
   programme du lendemain.

   Quatre occasions, chacune debrayable depuis l'administration :
     - une nouvelle demande arrive ;
     - un client annule lui-meme ;
     - le recapitulatif du soir, pour prevenir les filles la veille ;
     - la relance, si une demande attend une reponse depuis deux heures.

   Rien ici n'interrompt le site : si le serveur de courrier refuse, la
   demande du client est quand meme enregistree.
--------------------------------------------------------------------------- */
declare(strict_types=1);

require_once __DIR__ . '/smtp.php';

const FICHIER_JOURNAL_ALERTES = RACINE . '/data/alertes.json';
const RELANCE_HEURES          = 2;       // au-dela, la demande est relancee
const HEURE_RECAPITULATIF     = '21:00'; // le programme du lendemain part le soir
const TACHES_MINUTES          = 5;       // on ne repasse pas plus souvent que ca

/* ----------------------------- Les reglages ------------------------------ */

/**
 * Les reglages livres avec le paquet (data/parametres.json) servent de base ;
 * ceux saisis dans l'administration (data/config.json) l'emportent.
 */
function alertes(): array
{
    $livres = parametres()['alertes'] ?? [];
    $saisis = config()['alertes'] ?? [];
    if (!is_array($livres)) { $livres = []; }
    if (!is_array($saisis)) { $saisis = []; }

    $vrai = static function ($a, $b): bool {
        return (bool) ($a ?? $b ?? true);
    };

    $envoi = is_array($saisis['envoi'] ?? null) ? $saisis['envoi'] : [];

    return [
        'adresse'       => trim((string) ($saisis['adresse'] ?? $livres['adresse'] ?? '')),
        'nouvelle'      => $vrai($saisis['nouvelle'] ?? null, $livres['nouvelle'] ?? null),
        'annulation'    => $vrai($saisis['annulation'] ?? null, $livres['annulation'] ?? null),
        'recapitulatif' => $vrai($saisis['recapitulatif'] ?? null, $livres['recapitulatif'] ?? null),
        'relance'       => $vrai($saisis['relance'] ?? null, $livres['relance'] ?? null),
        /* Le serveur d'envoi : beaucoup d'hebergeurs n'ont pas de mail(). */
        'envoi' => [
            'serveur'     => trim((string) ($envoi['serveur'] ?? '')),
            'port'        => (int) ($envoi['port'] ?? 587),
            'securite'    => (string) ($envoi['securite'] ?? 'starttls'),
            'utilisateur' => trim((string) ($envoi['utilisateur'] ?? '')),
            'motdepasse'  => (string) ($envoi['motdepasse'] ?? ''),
        ],
    ];
}

/** Enregistre les reglages saisis dans l'administration. */
function ecrire_alertes(array $reglages): bool
{
    $c = config();
    $ancien = is_array($c['alertes']['envoi'] ?? null) ? $c['alertes']['envoi'] : [];
    $envoi = is_array($reglages['envoi'] ?? null) ? $reglages['envoi'] : [];

    /* Un mot de passe laisse vide veut dire « garde celui d'avant » : on ne
       fait pas retaper un mot de passe de messagerie a chaque reglage. */
    $motdepasse = (string) ($envoi['motdepasse'] ?? '');
    if ($motdepasse === '') {
        $motdepasse = (string) ($ancien['motdepasse'] ?? '');
    }

    $c['alertes'] = [
        'adresse'       => trim((string) ($reglages['adresse'] ?? '')),
        'nouvelle'      => !empty($reglages['nouvelle']),
        'annulation'    => !empty($reglages['annulation']),
        'recapitulatif' => !empty($reglages['recapitulatif']),
        'relance'       => !empty($reglages['relance']),
        'envoi' => [
            'serveur'     => trim((string) ($envoi['serveur'] ?? '')),
            'port'        => max(1, (int) ($envoi['port'] ?? 587)),
            'securite'    => in_array((string) ($envoi['securite'] ?? ''), ['starttls', 'ssl', ''], true)
                                ? (string) $envoi['securite'] : 'starttls',
            'utilisateur' => trim((string) ($envoi['utilisateur'] ?? '')),
            'motdepasse'  => $motdepasse,
        ],
    ];
    return ecrire_config($c);
}

/* ------------------------------- Le journal ------------------------------ */

/** Ce que les alertes ont deja fait : derniers envois, dernier recapitulatif. */
function journal_alertes(): array
{
    if (!is_readable(FICHIER_JOURNAL_ALERTES)) {
        return ['envois' => [], 'recapitulatif' => ''];
    }
    $lu = json_decode((string) file_get_contents(FICHIER_JOURNAL_ALERTES), true);
    if (!is_array($lu)) {
        return ['envois' => [], 'recapitulatif' => ''];
    }
    $lu['envois'] = is_array($lu['envois'] ?? null) ? $lu['envois'] : [];
    $lu['recapitulatif'] = (string) ($lu['recapitulatif'] ?? '');
    return $lu;
}

function ecrire_journal_alertes(array $journal): bool
{
    /* On ne garde que les vingt derniers envois : ce journal sert a voir si
       le courrier part, pas a conserver une histoire. */
    $journal['envois'] = array_slice($journal['envois'] ?? [], -20);
    return (bool) @file_put_contents(
        FICHIER_JOURNAL_ALERTES,
        json_encode($journal, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT),
        LOCK_EX
    );
}

/* ----------------------------- L'envoi lui-meme -------------------------- */

/**
 * L'adresse d'expedition. Quand le courrier part par un serveur d'envoi,
 * celui-ci n'accepte en general que l'adresse de la boite qui s'est
 * identifiee : c'est donc elle qui sert d'expediteur.
 */
function expediteur(): string
{
    $boite = trim((string) (alertes()['envoi']['utilisateur'] ?? ''));
    if ($boite !== '' && filter_var($boite, FILTER_VALIDATE_EMAIL)) {
        return $boite;
    }

    $site = (string) (parametres()['site'] ?? 'https://chez-eva.ch');
    $hote = preg_replace('#^https?://#', '', $site);
    $hote = trim((string) $hote, '/');
    if (!preg_match('/^[a-z0-9.-]+\.[a-z]{2,}$/i', $hote)) {
        $hote = 'chez-eva.ch';
    }
    return 'ne-pas-repondre@' . $hote;
}

/**
 * Envoie un courriel au salon. Rend true si le serveur l'a accepte.
 *
 * En developpement, la variable d'environnement CHEZEVA_COURRIEL ecrit le
 * message dans un fichier au lieu de le poster : on peut ainsi verifier le
 * contenu sans serveur de courrier.
 */
function envoyer_courriel(string $objet, string $corps): bool
{
    $a = alertes()['adresse'];
    if ($a === '' || !filter_var($a, FILTER_VALIDATE_EMAIL)) {
        return false;
    }

    $salon = (string) (parametres()['nom'] ?? 'Chez Eva');
    $entetes = implode("\r\n", [
        'From: ' . encoder_entete($salon) . ' <' . expediteur() . '>',
        'Reply-To: ' . $a,
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        'MIME-Version: 1.0',
        'Auto-Submitted: auto-generated',
    ]);

    $sujet = encoder_entete($objet);
    $corps = str_replace("\r\n", "\n", $corps);

    $souci = null;
    $fichier = getenv('CHEZEVA_COURRIEL');
    $reglages = alertes()['envoi'] ?? [];

    if (is_string($fichier) && $fichier !== '') {
        /* En developpement, le message est ecrit dans un fichier. */
        $envoye = (bool) @file_put_contents(
            $fichier,
            "=== $a | $objet ===\n$corps\n\n",
            FILE_APPEND | LOCK_EX
        );
    } elseif (($reglages['serveur'] ?? '') !== '') {
        $souci = envoyer_par_smtp($reglages, expediteur(), $salon, $a, $objet, $corps);
        $envoye = $souci === null;
    } elseif (function_exists('mail')) {
        $envoye = @mail($a, $sujet, $corps, $entetes, '-f' . expediteur());
        $souci = $envoye ? null : 'Le serveur a refusé l’envoi direct.';
    } else {
        /* Beaucoup d'hebergeurs, Infomaniak compris, desactivent mail(). */
        $envoye = false;
        $souci = 'Cet hébergement n’envoie pas de courrier directement : '
               . 'réglez le serveur d’envoi plus bas.';
    }

    $journal = journal_alertes();
    $journal['envois'][] = ['date' => date('c'), 'objet' => $objet, 'ok' => $envoye,
                            'souci' => $souci];
    $journal['dernier_souci'] = $souci;
    ecrire_journal_alertes($journal);

    return $envoye;
}

/** Un objet de courriel accentue doit etre encode, sinon il arrive en bouillie. */
function encoder_entete(string $texte): string
{
    if (preg_match('/^[\x20-\x7E]*$/', $texte)) {
        return $texte;
    }
    return '=?UTF-8?B?' . base64_encode($texte) . '?=';
}

/* ----------------------------- Les mises en forme ------------------------ */

const JOURS_FR = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const MOIS_FR  = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet',
                  'août', 'septembre', 'octobre', 'novembre', 'décembre'];

/** « samedi 18 octobre, 20h45 » — lisible d'un coup d'oeil. */
function date_francaise(string $quand, bool $avecHeure = true): string
{
    fuseau();
    $t = strtotime($quand);
    if ($t === false) {
        return $quand;
    }
    $texte = JOURS_FR[(int) date('N', $t) - 1] . ' ' . (int) date('j', $t)
           . ' ' . MOIS_FR[(int) date('n', $t) - 1];
    return $avecHeure ? $texte . ', ' . date('H\hi', $t) : $texte;
}

/** Le detail d'un rendez-vous, tel qu'il apparait dans le courriel. */
function detail_rdv(array $r): string
{
    $lignes = [
        'Masseuse    : ' . (string) ($r['masseuse_nom'] ?? $r['masseuse'] ?? ''),
        'Prestation  : ' . (string) ($r['prestation'] ?? '')
            . (($r['prix'] ?? '') !== '' ? ' — ' . (string) $r['prix'] : ''),
        'Quand       : ' . date_francaise((string) ($r['debut'] ?? ''))
            . ' – ' . date('H\hi', (int) strtotime((string) ($r['fin'] ?? ''))),
        'Client      : ' . (string) ($r['prenom'] ?? ''),
        'Téléphone   : ' . (string) ($r['telephone'] ?? ''),
    ];
    return implode("\n", $lignes);
}

/** Le resume d'un rendez-vous sur une seule ligne, pour le recapitulatif. */
function ligne_rdv(array $r): string
{
    $etat = ($r['etat'] ?? '') === 'confirme' ? '' : '  (à confirmer)';
    return '  ' . date('H\hi', (int) strtotime((string) ($r['debut'] ?? '')))
         . ' — ' . (string) ($r['masseuse_nom'] ?? '')
         . ' · ' . (string) ($r['prestation'] ?? '')
         . ' · ' . (string) ($r['prenom'] ?? '') . ' ' . (string) ($r['telephone'] ?? '')
         . $etat;
}

function pied_courriel(): string
{
    return "\n\n—\nAdministration : " . adresse_site() . "/admin/\n";
}

/* ------------------------------ Les occasions ---------------------------- */

/** Une demande vient d'arriver. */
function alerte_nouvelle_demande(array $r): void
{
    if (!alertes()['nouvelle']) {
        return;
    }
    $objet = sprintf(
        '%s — nouvelle demande : %s, %s',
        (string) (parametres()['nom'] ?? 'Chez Eva'),
        (string) ($r['masseuse_nom'] ?? ''),
        date_francaise((string) ($r['debut'] ?? ''))
    );
    envoyer_courriel($objet, "Nouvelle demande de rendez-vous.\n\n" . detail_rdv($r) . pied_courriel());
}

/** Un client a annule lui-meme son rendez-vous. */
function alerte_annulation(array $r): void
{
    if (!alertes()['annulation']) {
        return;
    }
    $objet = sprintf(
        '%s — annulation : %s, %s',
        (string) (parametres()['nom'] ?? 'Chez Eva'),
        (string) ($r['masseuse_nom'] ?? ''),
        date_francaise((string) ($r['debut'] ?? ''))
    );
    envoyer_courriel($objet, "Un client vient d'annuler. Le créneau est à nouveau libre.\n\n"
        . detail_rdv($r) . pied_courriel());
}

/* -------------------------- Ce qui tourne tout seul ---------------------- */

/**
 * Le recapitulatif du soir et les relances. Rend la liste de ce qui a ete
 * fait, pour que la page des taches puisse le dire.
 */
function taches_courriel(): array
{
    fuseau();
    $reglages = alertes();
    $journal  = journal_alertes();
    $faits    = [];

    /* --- Les demandes qui attendent une reponse depuis deux heures --- */
    if ($reglages['relance']) {
        $liste = reservations();
        $limite = time() - RELANCE_HEURES * 3600;
        $change = false;
        foreach ($liste as $i => $r) {
            if (($r['etat'] ?? '') !== 'attente' || !empty($r['relance'])) {
                continue;
            }
            $cree = strtotime((string) ($r['cree'] ?? ''));
            if ($cree === false || $cree > $limite) {
                continue;
            }
            /* Un rendez-vous deja passe n'a plus besoin d'etre relance. */
            if (strtotime((string) ($r['debut'] ?? '')) < time()) {
                continue;
            }
            $objet = sprintf(
                '%s — demande toujours à confirmer : %s, %s',
                (string) (parametres()['nom'] ?? 'Chez Eva'),
                (string) ($r['masseuse_nom'] ?? ''),
                date_francaise((string) ($r['debut'] ?? ''))
            );
            envoyer_courriel($objet, "Cette demande attend votre réponse depuis "
                . RELANCE_HEURES . " heures.\n\n" . detail_rdv($r) . pied_courriel());
            $liste[$i]['relance'] = true;
            $change = true;
            $faits[] = 'relance ' . (string) ($r['id'] ?? '');
        }
        if ($change) {
            ecrire_reservations($liste);
        }
    }

    /* --- Le programme du lendemain, une fois par soir --- */
    if ($reglages['recapitulatif']
        && date('H:i') >= HEURE_RECAPITULATIF
        && ($journal['recapitulatif'] ?? '') !== date('Y-m-d')) {

        $demain = date('Y-m-d', strtotime('+1 day'));
        $duJour = array_values(array_filter(reservations_triees(), static function (array $r) use ($demain): bool {
            return substr((string) ($r['debut'] ?? ''), 0, 10) === $demain
                && in_array((string) ($r['etat'] ?? ''), ['attente', 'confirme'], true);
        }));

        $objet = sprintf(
            '%s — demain : %s',
            (string) (parametres()['nom'] ?? 'Chez Eva'),
            count($duJour) === 0 ? 'aucun rendez-vous'
                : (count($duJour) . ' rendez-vous')
        );
        $corps = 'Programme du ' . date_francaise($demain, false) . " :\n\n"
            . ($duJour
                ? implode("\n", array_map('ligne_rdv', $duJour))
                : '  Rien de prévu pour l’instant.')
            . pied_courriel();

        envoyer_courriel($objet, $corps);
        $journal = journal_alertes();
        $journal['recapitulatif'] = date('Y-m-d');
        ecrire_journal_alertes($journal);
        $faits[] = 'récapitulatif';
    }

    return $faits;
}

/**
 * Appelee a chaque visite de la page publique, elle ne fait rien la plupart
 * du temps : un horodatage empeche de repasser plus d'une fois par tranche de
 * quelques minutes. C'est ce qui permet au recapitulatif de partir meme sans
 * tache planifiee chez l'hebergeur.
 */
function taches_si_besoin(): void
{
    $temoin = RACINE . '/data/taches.txt';
    $dernier = (int) @file_get_contents($temoin);
    if (time() - $dernier < TACHES_MINUTES * 60) {
        return;
    }
    if (@file_put_contents($temoin, (string) time(), LOCK_EX) === false) {
        return;
    }
    try {
        taches_courriel();
    } catch (Throwable $e) {
        /* Une alerte qui echoue ne doit jamais empecher le site de s'afficher. */
    }
}

/** La cle qui protege la page des taches, si l'hebergeur l'appelle lui-meme. */
function cle_taches(): string
{
    $c = config();
    if (empty($c['cle_taches'])) {
        $c['cle_taches'] = bin2hex(random_bytes(16));
        ecrire_config($c);
    }
    return (string) $c['cle_taches'];
}
