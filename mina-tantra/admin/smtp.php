<?php
/* ---------------------------------------------------------------------------
   Chez Eva — l'envoi du courrier
   ---------------------------------------------------------------------------
   Beaucoup d'hebergeurs, Infomaniak compris, desactivent la fonction mail()
   de PHP : le courrier doit passer par un serveur d'envoi, avec un identifiant
   et un mot de passe, comme le ferait un logiciel de messagerie.

   Ce fichier parle ce langage-la (SMTP) sans rien installer : une poignee de
   lignes echangees avec le serveur, de quoi s'annoncer, se presenter, puis
   remettre le message.
--------------------------------------------------------------------------- */
declare(strict_types=1);

const SMTP_DELAI = 20;   // secondes avant d'abandonner

/**
 * Remet un message au serveur d'envoi.
 *
 * $reglages attend : serveur, port, securite ('starttls', 'ssl' ou ''),
 * utilisateur, motdepasse. Rend null si le message est parti, sinon la
 * phrase a montrer au salon.
 */
function envoyer_par_smtp(array $reglages, string $de, string $nomDe, string $a,
                          string $objet, string $corps): ?string
{
    $serveur = trim((string) ($reglages['serveur'] ?? ''));
    $port    = (int) ($reglages['port'] ?? 587);
    $securite = (string) ($reglages['securite'] ?? 'starttls');
    $utilisateur = (string) ($reglages['utilisateur'] ?? '');
    $motdepasse  = (string) ($reglages['motdepasse'] ?? '');

    if ($serveur === '') {
        return 'Aucun serveur d’envoi n’est réglé.';
    }

    $adresse = ($securite === 'ssl' ? 'ssl://' : '') . $serveur . ':' . $port;
    $contexte = stream_context_create(['ssl' => [
        'verify_peer' => true, 'verify_peer_name' => true, 'SNI_enabled' => true,
    ]]);

    $flux = @stream_socket_client($adresse, $code, $erreur, SMTP_DELAI,
        STREAM_CLIENT_CONNECT, $contexte);
    if (!$flux) {
        return 'Impossible de joindre ' . $serveur . ' : ' . ($erreur ?: 'pas de réponse');
    }
    stream_set_timeout($flux, SMTP_DELAI);

    /* Chaque reponse commence par un nombre : 2xx et 3xx vont bien. */
    $lire = static function () use ($flux): string {
        $tout = '';
        while (($ligne = fgets($flux, 1024)) !== false) {
            $tout .= $ligne;
            if (strlen($ligne) < 4 || $ligne[3] !== '-') {
                break;
            }
        }
        return $tout;
    };
    $dire = static function (string $ordre) use ($flux, $lire): string {
        fwrite($flux, $ordre . "\r\n");
        return $lire();
    };
    $bon = static function (string $reponse, string $attendu): bool {
        return strncmp(ltrim($reponse), $attendu, strlen($attendu)) === 0;
    };

    $accueil = $lire();
    if (!$bon($accueil, '220')) {
        fclose($flux);
        return 'Le serveur d’envoi a refusé la connexion : ' . trim($accueil);
    }

    $hote = preg_replace('/[^A-Za-z0-9.\-]/', '', (string) ($_SERVER['HTTP_HOST'] ?? 'chez-eva.ch'));
    $reponse = $dire('EHLO ' . ($hote ?: 'chez-eva.ch'));
    if (!$bon($reponse, '250')) {
        fclose($flux);
        return 'Présentation refusée : ' . trim($reponse);
    }

    if ($securite === 'starttls') {
        $reponse = $dire('STARTTLS');
        if (!$bon($reponse, '220')) {
            fclose($flux);
            return 'Le serveur refuse la liaison chiffrée : ' . trim($reponse);
        }
        if (!@stream_socket_enable_crypto($flux, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            fclose($flux);
            return 'La liaison chiffrée n’a pas pu s’établir.';
        }
        $reponse = $dire('EHLO ' . ($hote ?: 'chez-eva.ch'));
        if (!$bon($reponse, '250')) {
            fclose($flux);
            return 'Présentation refusée après chiffrement : ' . trim($reponse);
        }
    }

    if ($utilisateur !== '') {
        $reponse = $dire('AUTH LOGIN');
        if (!$bon($reponse, '334')) {
            fclose($flux);
            return 'Le serveur n’accepte pas ce mode d’identification : ' . trim($reponse);
        }
        $reponse = $dire(base64_encode($utilisateur));
        if (!$bon($reponse, '334')) {
            fclose($flux);
            return 'Identifiant refusé : ' . trim($reponse);
        }
        $reponse = $dire(base64_encode($motdepasse));
        if (!$bon($reponse, '235')) {
            fclose($flux);
            return 'Mot de passe refusé par le serveur d’envoi.';
        }
    }

    $reponse = $dire('MAIL FROM:<' . $de . '>');
    if (!$bon($reponse, '250')) {
        fclose($flux);
        return 'Expéditeur refusé (' . $de . ') : ' . trim($reponse);
    }
    $reponse = $dire('RCPT TO:<' . $a . '>');
    if (!$bon($reponse, '250') && !$bon($reponse, '251')) {
        fclose($flux);
        return 'Destinataire refusé (' . $a . ') : ' . trim($reponse);
    }
    $reponse = $dire('DATA');
    if (!$bon($reponse, '354')) {
        fclose($flux);
        return 'Le serveur n’accepte pas le message : ' . trim($reponse);
    }

    $entetes = [
        'From: ' . encoder_entete($nomDe) . ' <' . $de . '>',
        'To: <' . $a . '>',
        'Subject: ' . encoder_entete($objet),
        'Date: ' . date('r'),
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        'Auto-Submitted: auto-generated',
    ];
    /* Un point seul en debut de ligne terminerait le message : on le double. */
    $texte = preg_replace('/^\./m', '..', str_replace("\r\n", "\n", $corps)) ?? $corps;
    $texte = str_replace("\n", "\r\n", $texte);

    fwrite($flux, implode("\r\n", $entetes) . "\r\n\r\n" . $texte . "\r\n.\r\n");
    $reponse = $lire();
    $dire('QUIT');
    fclose($flux);

    return $bon($reponse, '250') ? null : 'Le serveur a refusé le message : ' . trim($reponse);
}
