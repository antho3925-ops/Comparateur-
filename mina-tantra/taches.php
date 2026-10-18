<?php
/* ---------------------------------------------------------------------------
   Chez Eva — les taches du soir
   ---------------------------------------------------------------------------
   Envoie le recapitulatif du lendemain et les relances des demandes restees
   sans reponse. La page se visite avec sa cle, et l'hebergeur peut l'appeler
   tout seul une fois par heure (tache planifiee).

   Elle n'est pas indispensable : la page publique passe de toute facon par
   ces memes verifications quelques fois par heure. La tache planifiee rend
   simplement l'horaire du recapitulatif plus fidele.
--------------------------------------------------------------------------- */
declare(strict_types=1);
require __DIR__ . '/admin/noyau.php';
fuseau();

if (!isset($_GET['cle']) || !hash_equals(cle_taches(), (string) $_GET['cle'])) {
    http_response_code(403);
    header('Content-Type: text/plain; charset=utf-8');
    exit('Accès refusé.');
}

$faits = taches_courriel();

header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: no-store');
echo $faits ? implode("\n", $faits) . "\n" : "Rien à faire pour l'instant.\n";
