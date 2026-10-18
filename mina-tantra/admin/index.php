<?php
/* ---------------------------------------------------------------------------
   Chez Eva — administration
   ---------------------------------------------------------------------------
   Une page unique, pensee pour le telephone : ajouter une masseuse, modifier
   sa fiche, envoyer ou supprimer ses photos, la masquer ou la remettre.
   Tout est enregistre dans data/masseuses.json, que la page publique relit.
--------------------------------------------------------------------------- */
declare(strict_types=1);
require __DIR__ . '/noyau.php';

$message = null;   // confirmation affichee en vert
$erreur  = null;   // probleme affiche en rouge

/* ============================== LES ACTIONS ============================== */

$action = (string) ($_POST['action'] ?? '');

if ($action === 'creer_motdepasse' && !mot_de_passe_defini()) {
    $clair = (string) ($_POST['motdepasse'] ?? '');
    $nom = (string) ($_POST['utilisateur'] ?? '');
    if ($clair !== (string) ($_POST['confirmation'] ?? '')) {
        $erreur = 'Les deux mots de passe ne sont pas identiques.';
    } else {
        $erreur = definir_utilisateur($nom) ?? definir_mot_de_passe($clair);
        if ($erreur === null) {
            connexion($nom, $clair);
            header('Location: index.php');
            exit;
        }
    }
}

if ($action === 'connexion') {
    $erreur = connexion((string) ($_POST['utilisateur'] ?? ''), (string) ($_POST['motdepasse'] ?? ''));
    if ($erreur === null) {
        header('Location: index.php');
        exit;
    }
}

if ($action === 'deconnexion') {
    deconnexion();
    header('Location: index.php?p=connexion');
    exit;
}

if ($action !== '' && !in_array($action, ['connexion', 'creer_motdepasse', 'deconnexion'], true)) {
    exiger_connexion();
    verifier_jeton();

    $liste = fiches();
    $id = (string) ($_POST['id'] ?? '');
    $position = null;
    foreach ($liste as $i => $f) {
        if (($f['id'] ?? '') === $id) {
            $position = $i;
        }
    }

    if ($action === 'reservation_etat' || $action === 'reservation_supprimer') {
        $rid = (string) ($_POST['rid'] ?? '');
        $resas = reservations();
        foreach ($resas as $k => $r) {
            if (($r['id'] ?? '') !== $rid) {
                continue;
            }
            if ($action === 'reservation_supprimer') {
                array_splice($resas, $k, 1);
            } else {
                $etat = (string) ($_POST['etat'] ?? '');
                if (in_array($etat, ['attente', 'confirme', 'annule'], true)) {
                    $resas[$k]['etat'] = $etat;
                }
            }
            break;
        }
        ecrire_reservations($resas);
        header('Location: index.php?p=reservations');
        exit;
    }

    if ($action === 'encaisser' || $action === 'encaissement_annuler') {
        $rid = (string) ($_POST['rid'] ?? '');
        if ($action === 'encaissement_annuler') {
            annuler_encaissement($rid);
            $avis = 'Encaissement effacé.';
            $souci = null;
        } else {
            $souci = encaisser($rid, (string) ($_POST['montant'] ?? ''),
                               (string) ($_POST['moyen'] ?? 'especes'));
            $avis = $souci ?? 'Encaissement noté.';
        }
        header('Location: index.php?p=reservations' . ($souci ? '&e=1' : '')
            . '&m=' . urlencode($avis) . '#passes');
        exit;
    }

    if ($action === 'attente_retirer') {
        retirer_de_lattente((string) ($_POST['aid'] ?? ''));
        header('Location: index.php?p=reservations&m=' . urlencode('Retiré de la liste d’attente.'));
        exit;
    }

    if ($action === 'poser_rdv') {
        $resultat = poser_rendez_vous([
            'masseuse'   => (string) ($_POST['masseuse'] ?? ''),
            'date'       => (string) ($_POST['date'] ?? ''),
            'heure'      => (string) ($_POST['heure'] ?? ''),
            'duree'      => (string) ($_POST['duree'] ?? ''),
            'prestation' => (string) ($_POST['prestation'] ?? ''),
            'prenom'     => (string) ($_POST['prenom_client'] ?? ''),
            'telephone'  => (string) ($_POST['telephone_client'] ?? ''),
        ]);
        $souci = $resultat['erreur'] ?? null;
        header('Location: index.php?p=reservations'
            . (($souci || !empty($resultat['avertissement'])) ? '&e=1' : '')
            . '&m=' . urlencode($souci ?? ($resultat['avertissement'] ?? 'Rendez-vous posé.')));
        exit;
    }

    if ($action === 'sauvegarde' || $action === 'sauvegarde_secours') {
        $chemin = $action === 'sauvegarde' ? creer_sauvegarde() : sauvegarde_de_secours();
        if ($chemin === null || !is_file($chemin)) {
            header('Location: index.php?p=reservations&e=1&m='
                . urlencode('Sauvegarde impossible sur ce serveur.'));
            exit;
        }
        $nom = $action === 'sauvegarde' ? nom_sauvegarde() : basename($chemin);
        header('Content-Type: application/zip');
        header('Content-Disposition: attachment; filename="' . $nom . '"');
        header('Content-Length: ' . (string) filesize($chemin));
        header('X-Content-Type-Options: nosniff');
        readfile($chemin);
        if ($action === 'sauvegarde') {
            @unlink($chemin);   /* l'archive du bouton ne vit que le temps du telechargement */
        }
        exit;
    }

    if ($action === 'restaurer') {
        $souci = restaurer_sauvegarde($_FILES['archive'] ?? []);
        header('Location: index.php?p=reservations' . ($souci ? '&e=1' : '') . '&m=' . urlencode(
            $souci ?? 'Sauvegarde remise en place. Vérifiez vos fiches et vos photos.'
        ));
        exit;
    }

    if ($action === 'fermer') {
        $date = (string) ($_POST['date'] ?? '');
        $moment = (string) ($_POST['moment'] ?? 'journee');
        if (!fermer_jour($date, $moment)) {
            header('Location: index.php?p=reservations&e=1&m='
                . urlencode('Date invalide.'));
            exit;
        }
        $pris = count(rendez_vous_du_jour($date));
        header('Location: index.php?p=reservations' . ($pris ? '&e=1' : '') . '&m=' . urlencode(
            $pris
                ? 'Jour fermé. Attention : ' . $pris . ' rendez-vous déjà pris ce jour-là, '
                  . 'ils sont conservés — prévenez les clients.'
                : 'Jour fermé.'
        ));
        exit;
    }

    if ($action === 'rouvrir') {
        rouvrir_jour((string) ($_POST['date'] ?? ''));
        header('Location: index.php?p=reservations&m=' . urlencode('Jour rouvert.'));
        exit;
    }

    if ($action === 'suspendre') {
        $suspendue = !reservation_suspendue();
        suspendre_reservation($suspendue);
        header('Location: index.php?p=reservations&m=' . urlencode($suspendue
            ? 'Réservation en ligne suspendue. Le site invite à vous appeler.'
            : 'Réservation en ligne rouverte.'));
        exit;
    }

    if ($action === 'alertes') {
        $adresse = trim((string) ($_POST['adresse'] ?? ''));
        if ($adresse !== '' && !filter_var($adresse, FILTER_VALIDATE_EMAIL)) {
            header('Location: index.php?p=reservations&e=1&m='
                . urlencode('Cette adresse e-mail ne semble pas valable.'));
            exit;
        }
        ecrire_alertes([
            'adresse'       => $adresse,
            'nouvelle'      => isset($_POST['nouvelle']),
            'annulation'    => isset($_POST['annulation']),
            'recapitulatif' => isset($_POST['recapitulatif']),
            'relance'       => isset($_POST['relance']),
        ]);
        header('Location: index.php?p=reservations&m=' . urlencode('Alertes enregistrées.'));
        exit;
    }

    if ($action === 'alertes_essai') {
        $envoye = envoyer_courriel(
            (string) (parametres()['nom'] ?? 'Chez Eva') . ' — essai d’alerte',
            "Si vous lisez ce message, les alertes du site fonctionnent.\n"
            . "Vous serez prévenu à chaque nouvelle demande." . pied_courriel()
        );
        header('Location: index.php?p=reservations' . ($envoye ? '' : '&e=1') . '&m=' . urlencode($envoye
            ? 'Essai envoyé. Regardez votre boîte, et le dossier indésirables.'
            : 'Le serveur a refusé l’envoi. Vérifiez l’adresse.'));
        exit;
    }

    if ($action === 'cle_agenda') {
        renouveler_cle_agenda();
        header('Location: index.php?p=reservations&m='
            . urlencode('Nouvelle adresse de calendrier. Pensez à réabonner votre téléphone.'));
        exit;
    }

    if ($action === 'enregistrer') {
        $prenom = trim((string) ($_POST['prenom'] ?? ''));
        if ($prenom === '') {
            $erreur = 'Le prénom est obligatoire.';
        } else {
            /* Les prestations viennent des cases cochees, plus d'eventuels
               ajouts libres saisis a cote. */
            /* Les langues : celles cochees, plus d'eventuels ajouts libres. */
            $langues = [];
            foreach (array_merge(
                array_map('strval', (array) ($_POST['langues'] ?? [])),
                explode(',', (string) ($_POST['langues_autres'] ?? ''))
            ) as $l) {
                $l = mb_substr(trim($l), 0, 30);
                if ($l !== '' && !in_array($l, $langues, true)) {
                    $langues[] = $l;
                }
            }

            $cochees = array_map('strval', (array) ($_POST['specialites'] ?? []));
            $libres = explode(',', (string) ($_POST['specialites_autres'] ?? ''));
            $specialites = [];
            foreach (array_merge($cochees, $libres) as $p) {
                $p = mb_substr(trim($p), 0, 40);
                if ($p !== '' && !in_array($p, $specialites, true)) {
                    $specialites[] = $p;
                }
            }

            $age = trim((string) ($_POST['age'] ?? ''));

            /* Les dates arrivent du navigateur au format AAAA-MM-JJ. */
            $date = static function (string $champ): ?string {
                $v = trim((string) ($_POST[$champ] ?? ''));
                return preg_match('/^\d{4}-\d{2}-\d{2}$/', $v) ? $v : null;
            };
            $debut = $date('debut');
            $fin   = $date('fin');
            if ($debut !== null && $fin !== null && $fin < $debut) {
                [$debut, $fin] = [$fin, $debut];
            }

            $nouvelle = [
                'prenom'       => $prenom,
                'age'          => ctype_digit($age) ? (int) $age : null,
                'origine'      => trim((string) ($_POST['origine'] ?? '')),
                'langues'      => $langues,
                'specialites'  => $specialites,
                'presentation' => trim((string) ($_POST['presentation'] ?? '')),
                /* La presentation dans les autres langues du site. Un champ
                   laisse vide fait simplement retomber la fiche sur le francais. */
                'presentation_de' => trim((string) ($_POST['presentation_de'] ?? '')),
                'presentation_en' => trim((string) ($_POST['presentation_en'] ?? '')),
                'presentation_es' => trim((string) ($_POST['presentation_es'] ?? '')),
                'telephone'    => trim((string) ($_POST['telephone'] ?? '')),
                'part'         => max(0, min(100, (int) ($_POST['part'] ?? PART_PAR_DEFAUT))),
                'disponible'   => !empty($_POST['disponible']),
                'debut'        => $debut,
                'fin'          => $fin,
            ];

            if ($position === null) {
                $pris = array_map(static fn ($f) => (string) ($f['id'] ?? ''), $liste);
                $nouvelle['id'] = identifiant($prenom, $pris);
                $nouvelle['photos'] = [];
                $liste[] = $nouvelle;
                $position = count($liste) - 1;
                $id = $nouvelle['id'];
            } else {
                $liste[$position] = array_merge($liste[$position], $nouvelle);
            }

            /* Les photos envoyees avec le formulaire. */
            $envois = $_FILES['photos'] ?? null;
            if (is_array($envois) && is_array($envois['name'])) {
                foreach (array_keys($envois['name']) as $k) {
                    $resultat = enregistrer_photo([
                        'name'     => $envois['name'][$k],
                        'type'     => $envois['type'][$k],
                        'tmp_name' => $envois['tmp_name'][$k],
                        'error'    => $envois['error'][$k],
                        'size'     => $envois['size'][$k],
                    ], $id);
                    if ($resultat['erreur'] !== null) {
                        $erreur = $resultat['erreur'];
                    } elseif ($resultat['chemin'] !== null) {
                        $liste[$position]['photos'][] = $resultat['chemin'];
                    }
                }
            }

            if (ecrire_fiches($liste)) {
                $message = 'Fiche enregistrée.';
            } else {
                $erreur = "Impossible d'écrire data/masseuses.json (droits du dossier).";
            }
            header('Location: index.php?p=fiche&id=' . urlencode($id)
                . '&m=' . urlencode((string) ($erreur ?? $message)) . '&e=' . ($erreur ? 1 : 0));
            exit;
        }
    }

    if ($action === 'supprimer' && $position !== null) {
        $partie = (string) ($liste[$position]['prenom'] ?? '');
        $reste = effacer_masseuse((string) ($liste[$position]['id'] ?? ''));
        array_splice($liste, $position, 1);
        ecrire_fiches($liste);

        $avis = 'Fiche de ' . $partie . ' supprimée, '
            . ($reste['photos'] ? $reste['photos'] . ' photo'
                . ($reste['photos'] > 1 ? 's' : '') . ' effacée'
                . ($reste['photos'] > 1 ? 's' : '') . ' du serveur'
               : 'aucune photo à effacer')
            . '. Ses rendez-vous passés restent pour le décompte.';
        if ($reste['a_venir']) {
            $avis .= $reste['a_venir'] > 1
                ? ' Attention : ' . $reste['a_venir'] . ' rendez-vous à venir étaient prévus '
                  . 'avec elle — pensez à appeler ces clients.'
                : ' Attention : un rendez-vous à venir était prévu avec elle — '
                  . 'pensez à appeler ce client.';
        }
        header('Location: index.php?' . ($reste['a_venir'] ? 'e=1&' : '') . 'm=' . urlencode($avis));
        exit;
    }

    if ($action === 'deplacer' && $position !== null) {
        $cible = $position + ((string) ($_POST['sens'] ?? '') === 'haut' ? -1 : 1);
        if ($cible >= 0 && $cible < count($liste)) {
            [$liste[$position], $liste[$cible]] = [$liste[$cible], $liste[$position]];
            ecrire_fiches($liste);
        }
        header('Location: index.php');
        exit;
    }

    if (($action === 'photo_supprimer' || $action === 'photo_principale') && $position !== null) {
        $chemin = (string) ($_POST['chemin'] ?? '');
        $photos = array_values($liste[$position]['photos'] ?? []);
        $index = array_search($chemin, $photos, true);
        if ($index !== false) {
            if ($action === 'photo_supprimer') {
                supprimer_photo($chemin);
                array_splice($photos, (int) $index, 1);
            } else {
                array_splice($photos, (int) $index, 1);
                array_unshift($photos, $chemin);
            }
            $liste[$position]['photos'] = $photos;
            ecrire_fiches($liste);
        }
        header('Location: index.php?p=fiche&id=' . urlencode($id));
        exit;
    }

    if ($action === 'changer_motdepasse') {
        $clair = (string) ($_POST['motdepasse'] ?? '');
        $nom = trim((string) ($_POST['utilisateur'] ?? ''));

        if ($nom !== '' && $nom !== utilisateur()) {
            $erreur = definir_utilisateur($nom);
            $message = $erreur === null ? "Nom d'utilisateur modifié." : null;
        }
        if ($erreur === null && $clair !== '') {
            if ($clair !== (string) ($_POST['confirmation'] ?? '')) {
                $erreur = 'Les deux mots de passe ne sont pas identiques.';
            } else {
                $erreur = definir_mot_de_passe($clair);
                $message = $erreur === null ? 'Identifiants modifiés.' : null;
            }
        }
    }
}

/* Les photos deja en ligne recoivent leur filigrane a la premiere visite
   de l'administration, quelques-unes par page pour ne pas faire attendre. */
if (est_connecte()) {
    $marquees = marquer_photos();
    if ($marquees > 0) {
        $reste = count(photos_sans_filigrane());
        $message = $marquees . ' photo' . ($marquees > 1 ? 's' : '') . ' marquée'
            . ($marquees > 1 ? 's' : '') . ' au nom du salon'
            . ($reste ? ' — ' . $reste . ' encore à faire, rechargez la page.' : '.');
    }
}

/* Messages transmis apres une redirection. */
if (isset($_GET['m']) && $_GET['m'] !== '') {
    if (!empty($_GET['e'])) {
        $erreur = (string) $_GET['m'];
    } else {
        $message = (string) $_GET['m'];
    }
}

/* ============================== L'AFFICHAGE ============================== */

$page = (string) ($_GET['p'] ?? 'liste');
if (!est_connecte()) {
    $page = 'connexion';
}

function entete(string $titre): void
{
    header('Content-Type: text/html; charset=utf-8');
    header('X-Robots-Tag: noindex, nofollow');
    ?><!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title><?= proteger($titre) ?> — Chez Eva</title>
<link rel="icon" href="../assets/favicon.ico" sizes="any">
<style>
:root{ --nuit:#120b12; --nuit-2:#1b1018; --nuit-3:#241621; --or:#c9a227;
       --or-clair:#e6c766; --texte:#efe6e2; --doux:#b9a9a6; --bord:rgba(201,162,39,.24);
       --rouge:#e07a7a; --vert:#7ec08c; }
*{ box-sizing:border-box; }
body{ margin:0; background:var(--nuit); color:var(--texte); line-height:1.6;
      font:16px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; }
a{ color:var(--or-clair); }
.barre{ display:flex; align-items:center; justify-content:space-between; gap:12px;
        padding:14px 18px; background:var(--nuit-2); border-bottom:1px solid var(--bord); }
.barre b{ font-weight:600; letter-spacing:.14em; text-transform:uppercase; font-size:.76rem; color:var(--or); }
.barre a, .barre button{ font-size:.78rem; }
/* La barre reste sur une seule ligne : elle glisse si elle est trop longue. */
.barre b{ white-space:nowrap; }
.barre > span{ display:flex; align-items:center; gap:14px; flex-wrap:nowrap;
               overflow-x:auto; -webkit-overflow-scrolling:touch; }
.barre > span > a{ white-space:nowrap; }
@media (max-width:430px){
  .barre{ padding:12px 14px; gap:10px; }
  .barre b{ font-size:.68rem; }
  .barre a, .barre button{ font-size:.72rem; }
  .barre > span{ gap:11px; }
  .barre .btn.mini{ padding:6px 11px; }
}
.pastille{ display:inline-block; min-width:18px; padding:1px 6px; border-radius:999px;
           background:var(--or); color:#1a1208; font-weight:700; font-size:.7rem; text-align:center; }
main{ max-width:720px; margin:0 auto; padding:22px 18px 70px; }
h1{ font-size:1.5rem; margin:0 0 6px; font-weight:500; }
h2{ font-size:1.05rem; margin:30px 0 12px; font-weight:600; color:var(--or-clair); }
p.aide{ color:var(--doux); font-size:.9rem; margin:0 0 22px; }
label{ display:block; margin:16px 0 6px; font-size:.78rem; letter-spacing:.1em;
       text-transform:uppercase; color:var(--doux); }
input[type=text], input[type=number], input[type=password], input[type=date],
input[type=tel], input[type=email], input[type=time], select, textarea{
  width:100%; padding:12px 14px; border-radius:10px; border:1px solid var(--bord);
  background:var(--nuit-3); color:var(--texte); font:inherit; }
textarea{ min-height:140px; resize:vertical; }
select{ appearance:none; -webkit-appearance:none; cursor:pointer;
        background-image:linear-gradient(45deg, transparent 50%, var(--or) 50%),
                         linear-gradient(135deg, var(--or) 50%, transparent 50%);
        background-position:calc(100% - 20px) 50%, calc(100% - 14px) 50%;
        background-size:6px 6px, 6px 6px; background-repeat:no-repeat;
        padding-right:40px; }
input[type=file]{ width:100%; color:var(--doux); font-size:.9rem; padding:12px 0; }
.coche{ display:flex; align-items:center; gap:10px; margin-top:18px; }
.choix{ border:1px solid var(--bord); border-radius:10px; background:var(--nuit-3); margin-bottom:10px; }
.choix summary{ padding:13px 16px; cursor:pointer; color:var(--texte); font-size:.95rem; }
.choix summary::marker{ color:var(--or); }
.choix-liste{ padding:4px 16px 14px; display:grid; gap:2px; }
.choix-ligne{ display:flex; align-items:center; gap:12px; padding:9px 0;
              margin:0; text-transform:none; letter-spacing:0; font-size:.98rem; color:var(--texte); }
.choix-ligne input{ width:20px; height:20px; accent-color:var(--or); flex:0 0 auto; }
.choix-ligne .drapeau{ font-size:1.25rem; line-height:1; }
.coche label{ margin:0; text-transform:none; letter-spacing:0; font-size:.95rem; color:var(--texte); }
.btn{ display:inline-block; padding:13px 22px; border-radius:999px; border:1px solid var(--or);
      background:var(--or); color:#1a1208; font-weight:600; font-size:.85rem; cursor:pointer;
      text-decoration:none; text-align:center; }
.btn.vide{ background:transparent; color:var(--or-clair); font-weight:500; }
.btn.danger{ background:transparent; border-color:rgba(224,122,122,.5); color:var(--rouge); }
.btn.mini{ padding:7px 14px; font-size:.74rem; }
.actions{ display:flex; gap:10px; flex-wrap:wrap; margin-top:26px; }
.carte{ border:1px solid var(--bord); border-radius:14px; background:var(--nuit-2);
        padding:16px; margin-bottom:14px; display:flex; gap:14px; align-items:flex-start; }
.carte img{ width:68px; height:88px; object-fit:cover; border-radius:8px; flex:0 0 auto; }
.carte .sans-photo{ width:68px; height:88px; border-radius:8px; flex:0 0 auto;
              background:var(--nuit-3); display:flex; align-items:center; justify-content:center;
              color:var(--or); font-size:1.6rem; }
.carte h3{ margin:0 0 2px; font-size:1.15rem; font-weight:500; }
.carte .etat{ font-size:.72rem; letter-spacing:.12em; text-transform:uppercase; color:var(--or); }
.carte .etat.absente{ color:var(--doux); }
.carte .periode{ font-size:.8rem; color:var(--doux); margin-top:2px; }
.carte .detail{ margin:8px 0 0; font-size:.92rem; }
.carte.rdv{ display:block; }

/* ------------------------------ Le décompte ------------------------------ */
.compte{ width:100%; border-collapse:collapse; margin-top:10px; font-size:.92rem; }
.compte td{ padding:6px 0; border-bottom:1px solid var(--bord); color:var(--doux); }
.compte td:last-child{ text-align:right; white-space:nowrap; color:var(--texte); }
.compte tr.fort td{ color:var(--texte); font-weight:600; }
.compte tr.fort td:last-child{ color:var(--or-clair); }
.carte.total{ border-color:var(--or); }

/* ------------------------------- La caisse ------------------------------- */
.caisse{ display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin:10px 0 0; }
.caisse input[type=text]{ flex:1 1 90px; margin:0; }
.caisse select{ flex:1 1 110px; margin:0; }
.caisse button{ flex:0 0 auto; }
.detail.encaisse{ color:var(--vert); }

/* ----------------------------- La journée ------------------------------- */
.jour-barre{ display:flex; align-items:center; justify-content:space-between;
             gap:12px; margin:0 0 6px; }
.jour-barre strong{ font-size:1.05rem; font-weight:500; }
.planning{ display:flex; gap:8px; margin:18px 0 10px; overflow-x:auto; padding-bottom:6px; }
.planning-heures{ flex:0 0 52px; }
.planning-colonne{ flex:1 1 150px; min-width:130px; }
.planning-tete{
  height:30px; display:flex; align-items:center; justify-content:center;
  font-size:.72rem; letter-spacing:.12em; text-transform:uppercase; color:var(--or);
}
.planning-heure{
  border-top:1px solid var(--bord); position:relative;
}
.planning-heure span{
  position:absolute; top:-8px; right:6px; font-size:.68rem; color:var(--doux);
  background:var(--nuit); padding:0 3px;
}
.planning-piste{
  position:relative; border:1px solid var(--bord); border-radius:10px;
  background:var(--nuit-2); overflow:hidden;
}
.planning-rdv{
  position:absolute; left:4px; right:4px; border-radius:8px; padding:4px 7px;
  font-size:.74rem; line-height:1.25; overflow:hidden;
  background:rgba(201,162,39,.16); border:1px solid var(--or);
}
.planning-rdv.attente{ background:rgba(201,162,39,.07); border-style:dashed; }
.planning-rdv b{ display:block; color:var(--or-clair); font-size:.7rem; }
.planning-quoi{ display:block; color:var(--doux); font-size:.68rem; }
.puce{ display:inline-block; width:10px; height:10px; border-radius:3px;
       border:1px solid var(--or); background:rgba(201,162,39,.16); vertical-align:-1px; }
.puce.attente{ background:rgba(201,162,39,.07); border-style:dashed; }
.carte.rdv.attention{ border-color:var(--rouge); }
.ligne-fermeture{ display:flex; flex-wrap:wrap; gap:10px; align-items:center; margin-bottom:14px; }
.ligne-fermeture input[type=date]{ flex:1 1 150px; margin:0; }
.ligne-fermeture select{ flex:1 1 170px; margin:0; }
.ligne-fermeture button{ flex:0 0 auto; }
.carte.rdv.attente{ border-color:var(--or); }
.carte.rdv.annule h3, .carte.rdv.passe h3{ color:var(--doux); }
.carte.rdv h3{ font-size:1rem; }
.carte .liens{ display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
.avis{ padding:12px 16px; border-radius:10px; margin-bottom:18px; font-size:.92rem; }
.avis.ok{ background:rgba(126,192,140,.12); border:1px solid rgba(126,192,140,.4); color:var(--vert); }
.avis.ko{ background:rgba(224,122,122,.12); border:1px solid rgba(224,122,122,.4); color:var(--rouge); }
.photos{ display:grid; grid-template-columns:repeat(auto-fill,minmax(110px,1fr)); gap:12px; }
.photo{ border:1px solid var(--bord); border-radius:10px; overflow:hidden; background:var(--nuit-3); }
.photo img{ width:100%; aspect-ratio:3/4; object-fit:cover; display:block; }
.photo .sous{ display:flex; gap:6px; padding:8px; justify-content:center; flex-wrap:wrap; }
.photo .marque{ font-size:.66rem; letter-spacing:.1em; text-transform:uppercase; color:var(--or);
                text-align:center; padding:6px 0 0; }
.pied{ margin-top:40px; padding-top:20px; border-top:1px solid var(--bord);
       color:var(--doux); font-size:.84rem; }
form.ligne{ display:inline; }
</style>
</head>
<body>
<div class="barre">
  <b>Chez Eva</b>
  <?php if (est_connecte()): ?>
    <span>
      <a href="index.php">Masseuses</a> &nbsp;
      <a href="index.php?p=planning">Journée</a> &nbsp;
      <a href="index.php?p=decompte">Décompte</a> &nbsp;
      <a href="index.php?p=reservations">Rendez-vous<?php
          $attente = demandes_en_attente();
          echo $attente ? ' <span class="pastille">' . $attente . '</span>' : ''; ?></a> &nbsp;
      <a href="../" target="_blank">Le site</a> &nbsp;
      <form method="post" class="ligne">
        <input type="hidden" name="action" value="deconnexion">
        <button type="submit" class="btn vide mini">Quitter</button>
      </form>
    </span>
  <?php endif; ?>
</div>
<main>
<?php
}

function pied(): void
{
    echo '</main></body></html>';
}

function avis(?string $message, ?string $erreur): void
{
    if ($erreur) {
        echo '<div class="avis ko">' . proteger($erreur) . '</div>';
    } elseif ($message) {
        echo '<div class="avis ok">' . proteger($message) . '</div>';
    }
}

/* ------------------------------- Connexion -------------------------------- */

if ($page === 'connexion') {
    entete('Connexion');
    avis($message, $erreur);
    if (!mot_de_passe_defini()) { ?>
        <h1>Première visite</h1>
        <p class="aide">Choisissez le mot de passe qui protégera cette page.
           Huit caractères au minimum. Notez-le quelque part : il n'y a pas
           de « mot de passe oublié ».</p>
        <form method="post">
          <input type="hidden" name="action" value="creer_motdepasse">
          <label for="util">Nom d'utilisateur</label>
          <input type="text" id="util" name="utilisateur" required autocomplete="username">
          <label for="mdp">Mot de passe</label>
          <input type="password" id="mdp" name="motdepasse" required autocomplete="new-password">
          <label for="conf">Confirmation</label>
          <input type="password" id="conf" name="confirmation" required autocomplete="new-password">
          <div class="actions"><button class="btn" type="submit">Enregistrer</button></div>
        </form>
    <?php } else { ?>
        <h1>Connexion</h1>
        <p class="aide">Cette page permet de gérer les masseuses affichées sur le site.</p>
        <form method="post">
          <input type="hidden" name="action" value="connexion">
          <label for="util">Nom d'utilisateur</label>
          <input type="text" id="util" name="utilisateur" required autocomplete="username">
          <label for="mdp">Mot de passe</label>
          <input type="password" id="mdp" name="motdepasse" required autocomplete="current-password">
          <div class="actions"><button class="btn" type="submit">Entrer</button></div>
        </form>
    <?php }
    pied();
    exit;
}

/* --------------------------------- Liste ---------------------------------- */

exiger_connexion();

if ($page === 'liste') {
    entete('Les masseuses');
    avis($message, $erreur);
    $liste = fiches();
    ?>
    <h1>Les masseuses</h1>
    <p class="aide">Ce qui est ici s'affiche sur le site, dans cet ordre.</p>

    <?php if (!$liste): ?>
      <p class="aide">Aucune fiche pour l'instant.</p>
    <?php endif; ?>

    <?php foreach ($liste as $i => $f):
        $photo = $f['photos'][0] ?? null; ?>
      <div class="carte">
        <?php if ($photo): ?>
          <img src="../<?= proteger((string) $photo) ?>" alt="">
        <?php else: ?>
          <div class="sans-photo"><?= proteger(mb_substr((string) ($f['prenom'] ?? '?'), 0, 1)) ?></div>
        <?php endif; ?>
        <div style="flex:1">
          <h3><?= proteger((string) ($f['prenom'] ?? '')) ?></h3>
          <div class="etat <?= empty($f['disponible']) ? 'absente' : '' ?>">
            <?= empty($f['disponible']) ? 'Masquée du site' : 'Disponible' ?>
            · <?= count($f['photos'] ?? []) ?> photo<?= count($f['photos'] ?? []) > 1 ? 's' : '' ?>
          </div>
          <?php if (!empty($f['telephone'])): ?>
            <div class="periode"><?= proteger((string) $f['telephone']) ?></div>
          <?php endif; ?>
          <?php if (!empty($f['debut']) || !empty($f['fin'])): ?>
            <div class="periode">
              <?= !empty($f['debut']) ? 'du ' . proteger(date('j/n/Y', strtotime((string) $f['debut']))) : '' ?>
              <?= !empty($f['fin']) ? 'au ' . proteger(date('j/n/Y', strtotime((string) $f['fin']))) : '' ?>
            </div>
          <?php endif; ?>
          <div class="liens">
            <a class="btn vide mini" href="index.php?p=fiche&amp;id=<?= urlencode((string) $f['id']) ?>">Modifier</a>
            <?php foreach ([['haut', '↑', $i > 0], ['bas', '↓', $i < count($liste) - 1]] as [$sens, $signe, $possible]):
                if ($possible): ?>
              <form method="post" class="ligne">
                <input type="hidden" name="jeton" value="<?= jeton() ?>">
                <input type="hidden" name="action" value="deplacer">
                <input type="hidden" name="id" value="<?= proteger((string) $f['id']) ?>">
                <input type="hidden" name="sens" value="<?= $sens ?>">
                <button class="btn vide mini" type="submit"><?= $signe ?></button>
              </form>
            <?php endif; endforeach; ?>
          </div>
        </div>
      </div>
    <?php endforeach; ?>

    <div class="actions">
      <a class="btn" href="index.php?p=fiche">Ajouter une masseuse</a>
    </div>

    <div class="pied">
      <p>Place occupée par le site : <strong><?= number_format(espace_utilise() / 1048576, 1, ',', ' ') ?> Mo</strong>
         (l'hébergement Starter en autorise 10).</p>
      <h2>Vos identifiants</h2>
      <form method="post">
        <input type="hidden" name="jeton" value="<?= jeton() ?>">
        <input type="hidden" name="action" value="changer_motdepasse">
        <label for="nu">Nom d'utilisateur</label>
        <input type="text" id="nu" name="utilisateur" value="<?= proteger(utilisateur()) ?>" autocomplete="username">
        <label for="n1">Nouveau mot de passe <span style="text-transform:none;letter-spacing:0">(laisser vide pour le garder)</span></label>
        <input type="password" id="n1" name="motdepasse" autocomplete="new-password">
        <label for="n2">Confirmation</label>
        <input type="password" id="n2" name="confirmation" autocomplete="new-password">
        <div class="actions"><button class="btn vide" type="submit">Modifier</button></div>
      </form>
    </div>
    <?php
    pied();
    exit;
}

/* ----------------------------- Les rendez-vous ---------------------------- */

function en_francais(string $local): string
{
    $jours = ['', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
    $mois = ['', 'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet',
             'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    $t = (int) strtotime($local);
    return $jours[(int) date('N', $t)] . ' ' . date('j', $t) . ' ' . $mois[(int) date('n', $t)];
}

if ($page === 'decompte') {
    fuseau();

    $semaine = (string) ($_GET['semaine'] ?? '');
    $morceaux = explode('-', $semaine);
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $semaine)
        || !checkdate((int) $morceaux[1], (int) $morceaux[2], (int) $morceaux[0])) {
        $semaine = date('Y-m-d');
    }
    $du = lundi_de($semaine);
    $au = date('Y-m-d', strtotime($du . ' +6 days'));
    $precedente = date('Y-m-d', strtotime($du . ' -7 days'));
    $suivante   = date('Y-m-d', strtotime($du . ' +7 days'));

    $lignes = decompte($du, $au);
    $total = ['rdv' => 0, 'prevu' => 0.0, 'encaisse' => 0.0, 'especes' => 0.0,
              'twint' => 0.0, 'pour_elle' => 0.0, 'pour_le_salon' => 0.0, 'sans_saisie' => 0];
    foreach ($lignes as $l) {
        foreach (array_keys($total) as $cle) {
            $total[$cle] += $l[$cle];
        }
    }

    entete('Le décompte');
    avis($message, $erreur);
    ?>
    <h1>Le décompte</h1>

    <div class="jour-barre">
      <a class="btn vide mini" href="index.php?p=decompte&amp;semaine=<?= $precedente ?>">←</a>
      <strong>Du <?= proteger(date_francaise($du, false)) ?><br>au <?= proteger(date_francaise($au, false)) ?></strong>
      <a class="btn vide mini" href="index.php?p=decompte&amp;semaine=<?= $suivante ?>">→</a>
    </div>
    <p class="aide"><a href="index.php?p=decompte">Cette semaine</a>
       · seuls les rendez-vous confirmés sont comptés</p>

    <?php if (!$lignes): ?>
      <p class="aide">Aucun rendez-vous confirmé cette semaine-là.</p>
    <?php else: ?>
      <?php foreach ($lignes as $l): ?>
        <div class="carte rdv">
          <h3><?= proteger($l['prenom']) ?></h3>
          <div class="etat"><?= $l['rdv'] ?> rendez-vous · sa part : <?= $l['part'] ?> %</div>
          <table class="compte">
            <tr><td>Prévu d'après les tarifs</td><td><?= proteger(francs($l['prevu'])) ?></td></tr>
            <tr class="fort"><td>Encaissé</td><td><?= proteger(francs($l['encaisse'])) ?></td></tr>
            <tr><td>dont espèces</td><td><?= proteger(francs($l['especes'])) ?></td></tr>
            <tr><td>dont Twint</td><td><?= proteger(francs($l['twint'])) ?></td></tr>
            <tr class="fort"><td>Pour elle</td><td><?= proteger(francs($l['pour_elle'])) ?></td></tr>
            <tr><td>Pour le salon</td><td><?= proteger(francs($l['pour_le_salon'])) ?></td></tr>
          </table>
          <?php if ($l['sans_saisie']): ?>
            <p class="detail"><?= $l['sans_saisie'] ?> rendez-vous sans montant saisi :
               ils comptent dans « prévu », pas dans « encaissé ».</p>
          <?php endif; ?>
        </div>
      <?php endforeach; ?>

      <div class="carte rdv total">
        <h3>Toute la semaine</h3>
        <div class="etat"><?= $total['rdv'] ?> rendez-vous</div>
        <table class="compte">
          <tr><td>Prévu</td><td><?= proteger(francs($total['prevu'])) ?></td></tr>
          <tr class="fort"><td>Encaissé</td><td><?= proteger(francs($total['encaisse'])) ?></td></tr>
          <tr><td>dont espèces</td><td><?= proteger(francs($total['especes'])) ?></td></tr>
          <tr><td>dont Twint</td><td><?= proteger(francs($total['twint'])) ?></td></tr>
          <tr><td>Part des masseuses</td><td><?= proteger(francs($total['pour_elle'])) ?></td></tr>
          <tr class="fort"><td>Reste au salon</td><td><?= proteger(francs($total['pour_le_salon'])) ?></td></tr>
        </table>
      </div>
    <?php endif; ?>

    <p class="aide"><a href="index.php?p=reservations#passes">← Noter un encaissement</a></p>
    <?php
    pied();
    exit;
}

if ($page === 'planning') {
    fuseau();

    /* Une date doit exister vraiment : « 2026-13-45 » a la bonne forme mais
       n'est pas un jour, et tout ce qui suit s'en trouverait fausse. */
    $jour = (string) ($_GET['date'] ?? '');
    $morceaux = explode('-', $jour);
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $jour)
        || !checkdate((int) $morceaux[1], (int) $morceaux[2], (int) $morceaux[0])) {
        $jour = date('Y-m-d');
    }
    $veille   = date('Y-m-d', strtotime($jour . ' -1 day'));
    $lendemain = date('Y-m-d', strtotime($jour . ' +1 day'));
    $plage = horaires_du_jour($jour);

    /* Les rendez-vous du jour, et les masseuses qui y figurent. */
    $duJour = array_values(array_filter(reservations_triees(), static function (array $r) use ($jour): bool {
        return substr((string) ($r['debut'] ?? ''), 0, 10) === $jour
            && (string) ($r['etat'] ?? '') !== 'annule';
    }));

    /* Une colonne par masseuse presente ce jour-la ; celles qui ont un
       rendez-vous y figurent de toute facon. */
    $colonnes = [];
    foreach (fiches() as $f) {
        if (masseuse_presente($f, $jour)) {
            $colonnes[(string) ($f['id'] ?? '')] = (string) ($f['prenom'] ?? '');
        }
    }
    foreach ($duJour as $r) {
        $id = (string) ($r['masseuse'] ?? '');
        if ($id !== '' && !isset($colonnes[$id])) {
            $colonnes[$id] = (string) ($r['masseuse_nom'] ?? $id);
        }
    }

    /* L'echelle : une minute vaut 0,9 pixel, ce qui tient sur un telephone. */
    $debutJour = $plage ? (int) strtotime($jour . ' ' . $plage[0]) : (int) strtotime($jour . ' 09:00');
    $finJour   = $plage ? (int) strtotime($jour . ' ' . $plage[1]) : (int) strtotime($jour . ' 22:00');
    /* Un rendez-vous pose jusqu'a la fermeture deborde : la grille le suit. */
    foreach ($duJour as $r) {
        $finJour = max($finJour, (int) strtotime((string) ($r['fin'] ?? '')));
    }
    $minutes = max(60, (int) (($finJour - $debutJour) / 60));
    $echelle = 1.1;

    entete('La journée');
    avis($message, $erreur);
    ?>
    <h1>La journée</h1>

    <div class="jour-barre">
      <a class="btn vide mini" href="index.php?p=planning&amp;date=<?= $veille ?>">←</a>
      <strong><?= proteger(date_francaise($jour, false)) ?></strong>
      <a class="btn vide mini" href="index.php?p=planning&amp;date=<?= $lendemain ?>">→</a>
    </div>
    <p class="aide">
      <a href="index.php?p=planning">Aujourd'hui</a>
      <?= $plage ? ' · ouvert ' . proteger($plage[0]) . ' – ' . proteger($plage[1])
                 : ' · <strong>salon fermé ce jour-là</strong>' ?>
    </p>

    <?php if (!$colonnes): ?>
      <p class="aide">Aucune masseuse ce jour-là.</p>
    <?php else: ?>
      <div class="planning" style="--minutes:<?= $minutes ?>; --echelle:<?= $echelle ?>">
        <div class="planning-heures">
          <div class="planning-tete"></div>
          <?php for ($t = $debutJour; $t < $finJour; $t += 3600):
              $hauteur = min(60, (int) (($finJour - $t) / 60)); ?>
            <div class="planning-heure" style="height:<?= $hauteur * $echelle ?>px">
              <span><?= date('H\hi', $t) ?></span>
            </div>
          <?php endfor; ?>
        </div>

        <?php foreach ($colonnes as $id => $prenom): ?>
          <div class="planning-colonne">
            <div class="planning-tete"><?= proteger($prenom) ?></div>
            <div class="planning-piste" style="height:<?= $minutes * $echelle ?>px">
              <?php foreach ($duJour as $r):
                  if ((string) ($r['masseuse'] ?? '') !== $id) { continue; }
                  $d = (int) strtotime((string) $r['debut']);
                  $f = (int) strtotime((string) $r['fin']);
                  $haut = (int) (($d - $debutJour) / 60) * $echelle;
                  $haute = max(22, (int) (($f - $d) / 60) * $echelle);
                  $etat = (string) ($r['etat'] ?? 'attente'); ?>
                <div class="planning-rdv <?= proteger($etat) ?>"
                     style="top:<?= $haut ?>px; height:<?= $haute ?>px">
                  <b><?= date('H\hi', $d) ?></b>
                  <?= proteger((string) ($r['prenom'] ?? '')) ?>
                  <?php if (!empty($r['prestation']) && $haute >= 50): ?>
                    <span class="planning-quoi"><?= proteger((string) $r['prestation']) ?></span>
                  <?php endif; ?>
                </div>
              <?php endforeach; ?>
            </div>
          </div>
        <?php endforeach; ?>
      </div>

      <p class="aide">
        <span class="puce confirme"></span> confirmé &nbsp;
        <span class="puce attente"></span> à confirmer &nbsp;
        · <?= count($duJour) ?> rendez-vous ce jour-là
      </p>
    <?php endif; ?>

    <p class="aide"><a href="index.php?p=reservations">← Les rendez-vous en détail</a></p>
    <?php
    pied();
    exit;
}

if ($page === 'reservations') {
    fuseau();
    entete('Rendez-vous');
    avis($message, $erreur);

    $toutes = reservations_triees();
    $maintenant = date('Y-m-d H:i');
    $avenir = array_filter($toutes, static fn (array $r): bool => (string) ($r['debut'] ?? '') >= $maintenant);
    $passes = array_reverse(array_filter($toutes, static fn (array $r): bool => (string) ($r['debut'] ?? '') < $maintenant));
    $etats = ['attente' => 'À confirmer', 'confirme' => 'Confirmé', 'annule' => 'Annulé'];
    ?>
    <h1>Rendez-vous</h1>
    <p class="aide">Les demandes prises sur le site. Rappelez le client, puis
       confirmez ou annulez : votre agenda suit.</p>

    <?php if (!$avenir): ?>
      <p class="aide">Aucun rendez-vous à venir.</p>
    <?php endif; ?>

    <?php foreach ($avenir as $r):
        $etat = (string) ($r['etat'] ?? 'attente'); ?>
      <div class="carte rdv <?= proteger($etat) ?>">
        <div style="flex:1">
          <h3><?= proteger(en_francais((string) $r['debut'])) ?> ·
              <?= proteger(date('H\hi', (int) strtotime((string) $r['debut']))) ?>
              – <?= proteger(date('H\hi', (int) strtotime((string) $r['fin']))) ?></h3>
          <div class="etat <?= $etat === 'attente' ? '' : 'absente' ?>">
            <?= proteger($etats[$etat] ?? $etat) ?> ·
            <?= proteger((string) ($r['masseuse_nom'] ?? '')) ?>
          </div>
          <p class="detail">
            <strong><?= proteger((string) ($r['prenom'] ?? '')) ?></strong><?php
              if (!empty($r['telephone'])): ?> —
            <a href="tel:<?= proteger(preg_replace('/[^\d+]/', '', (string) $r['telephone']) ?? '') ?>">
              <?= proteger((string) $r['telephone']) ?></a><?php endif; ?><br>
            <?= proteger((string) ($r['prestation'] ?? '')) ?>
            <?= !empty($r['prix']) ? ' — ' . proteger((string) $r['prix']) : '' ?>
          </p>
          <div class="liens">
            <?php foreach ([['confirme', 'Confirmer'], ['annule', 'Annuler']] as [$cible, $libelle]):
                if ($etat !== $cible): ?>
              <form method="post" class="ligne">
                <input type="hidden" name="jeton" value="<?= jeton() ?>">
                <input type="hidden" name="action" value="reservation_etat">
                <input type="hidden" name="rid" value="<?= proteger((string) $r['id']) ?>">
                <input type="hidden" name="etat" value="<?= $cible ?>">
                <button class="btn <?= $cible === 'annule' ? 'danger' : 'vide' ?> mini" type="submit">
                  <?= $libelle ?></button>
              </form>
            <?php endif; endforeach; ?>
          </div>
        </div>
      </div>
    <?php endforeach; ?>

    <?php if ($passes): ?>
      <h2 id="passes">Passés</h2>
      <p class="aide">Notez ce qui est entré en caisse : le décompte de la semaine
         s'en sert, et vous n'avez plus rien à recalculer le dimanche soir.</p>
      <?php foreach (array_slice($passes, 0, 20) as $r): ?>
        <div class="carte rdv passe">
          <div style="flex:1">
            <h3><?= proteger(en_francais((string) $r['debut'])) ?> ·
                <?= proteger(date('H\hi', (int) strtotime((string) $r['debut']))) ?></h3>
            <div class="etat absente">
              <?= proteger($etats[(string) ($r['etat'] ?? '')] ?? '') ?> ·
              <?= proteger((string) ($r['masseuse_nom'] ?? '')) ?> ·
              <?= proteger((string) ($r['prenom'] ?? '')) ?>
            </div>
            <?php if (isset($r['encaisse']['montant'])): ?>
              <p class="detail encaisse">Encaissé :
                <strong><?= proteger(francs((float) $r['encaisse']['montant'])) ?></strong>
                · <?= proteger(MOYENS[(string) ($r['encaisse']['moyen'] ?? 'autre')] ?? '') ?></p>
            <?php elseif ((string) ($r['etat'] ?? '') !== 'annule'): ?>
              <form method="post" class="caisse">
                <input type="hidden" name="jeton" value="<?= jeton() ?>">
                <input type="hidden" name="action" value="encaisser">
                <input type="hidden" name="rid" value="<?= proteger((string) $r['id']) ?>">
                <input type="text" name="montant" inputmode="decimal"
                       value="<?= proteger(montant_prix((string) ($r['prix'] ?? '')) > 0
                                 ? (string) montant_prix((string) $r['prix']) : '') ?>"
                       placeholder="Montant" aria-label="Montant encaissé">
                <select name="moyen" aria-label="Moyen de paiement">
                  <?php foreach (MOYENS as $cle => $nom): ?>
                    <option value="<?= $cle ?>"><?= proteger($nom) ?></option>
                  <?php endforeach; ?>
                </select>
                <button class="btn mini" type="submit">Encaisser</button>
              </form>
            <?php endif; ?>

            <div class="liens">
              <?php if (isset($r['encaisse']['montant'])): ?>
                <form method="post" class="ligne">
                  <input type="hidden" name="jeton" value="<?= jeton() ?>">
                  <input type="hidden" name="action" value="encaissement_annuler">
                  <input type="hidden" name="rid" value="<?= proteger((string) $r['id']) ?>">
                  <button class="btn vide mini" type="submit">Corriger</button>
                </form>
              <?php endif; ?>
              <form method="post" class="ligne" onsubmit="return confirm('Supprimer ce rendez-vous ?');">
                <input type="hidden" name="jeton" value="<?= jeton() ?>">
                <input type="hidden" name="action" value="reservation_supprimer">
                <input type="hidden" name="rid" value="<?= proteger((string) $r['id']) ?>">
                <button class="btn danger mini" type="submit">Supprimer</button>
              </form>
            </div>
          </div>
        </div>
      <?php endforeach; ?>
      <p class="aide">Les rendez-vous de plus de trente jours s'effacent tout seuls,
         coordonnées du client comprises.</p>
    <?php endif; ?>

    <?php $enAttente = attente(); if ($enAttente): ?>
    <div class="pied">
      <h2>Liste d'attente</h2>
      <p class="aide">Ils attendent qu'une place se libère. Un appel, et vous retirez
         la ligne.</p>
      <?php foreach (array_reverse($enAttente) as $a): ?>
        <div class="carte rdv">
          <h3><?= proteger((string) ($a['prenom'] ?? '')) ?>
            <?php if (!empty($a['telephone'])): ?>
              — <a href="tel:<?= proteger(preg_replace('/[^\d+]/', '', (string) $a['telephone']) ?? '') ?>"><?=
                   proteger((string) $a['telephone']) ?></a>
            <?php endif; ?>
          </h3>
          <div class="etat">
            <?= !empty($a['date'])
                  ? proteger(date_francaise((string) $a['date'], false))
                  : 'n’importe quand' ?>
            <?= !empty($a['masseuse_nom']) ? ' · ' . proteger((string) $a['masseuse_nom']) : '' ?>
          </div>
          <div class="liens">
            <form method="post" class="ligne">
              <input type="hidden" name="jeton" value="<?= jeton() ?>">
              <input type="hidden" name="action" value="attente_retirer">
              <input type="hidden" name="aid" value="<?= proteger((string) ($a['id'] ?? '')) ?>">
              <button class="btn vide mini" type="submit">Retirer</button>
            </form>
          </div>
        </div>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>

    <div class="pied">
      <h2>Poser un rendez-vous</h2>
      <p class="aide">Pour un client qui a téléphoné — ou simplement pour bloquer
         une plage : laissez le prénom vide et le créneau s'affiche comme occupé.
         Dans les deux cas, le site cesse de le proposer.</p>
      <form method="post" class="pose-rdv">
        <input type="hidden" name="jeton" value="<?= jeton() ?>">
        <input type="hidden" name="action" value="poser_rdv">

        <label for="pose-masseuse">Masseuse</label>
        <select id="pose-masseuse" name="masseuse" required>
          <?php foreach (fiches() as $m): ?>
            <option value="<?= proteger((string) ($m['id'] ?? '')) ?>">
              <?= proteger((string) ($m['prenom'] ?? '')) ?></option>
          <?php endforeach; ?>
        </select>

        <div class="ligne-fermeture">
          <input type="date" name="date" required value="<?= date('Y-m-d') ?>" aria-label="Jour">
          <input type="time" name="heure" required step="900" aria-label="Heure">
          <select name="duree" aria-label="Durée">
            <?php foreach (DUREES_ADMISES as $d): ?>
              <option value="<?= $d ?>"<?= $d === 60 ? ' selected' : '' ?>>
                <?= $d < 60 ? $d . ' min' : ($d / 60) . ' h' ?></option>
            <?php endforeach; ?>
          </select>
        </div>

        <details class="choix">
          <summary>Le client (facultatif)</summary>
          <div class="choix-liste">
            <label for="pose-prestation">Prestation</label>
            <select id="pose-prestation" name="prestation">
              <option value="">— aucune (simple blocage) —</option>
              <?php foreach ((array) (parametres()['prestations'] ?? []) as $pr): ?>
                <option value="<?= proteger((string) $pr) ?>"><?= proteger((string) $pr) ?></option>
              <?php endforeach; ?>
            </select>
            <label for="pose-prenom">Prénom du client</label>
            <input type="text" id="pose-prenom" name="prenom_client" maxlength="40"
                   placeholder="Vide = « Occupée »">
            <label for="pose-tel">Son téléphone</label>
            <input type="tel" id="pose-tel" name="telephone_client" maxlength="25">
          </div>
        </details>

        <button class="btn" type="submit">Poser ce rendez-vous</button>
      </form>
    </div>

    <div class="pied">
      <h2>Votre agenda</h2>
      <p class="aide">Abonnez votre téléphone une seule fois à cette adresse :
         les rendez-vous s'y ajouteront ensuite tout seuls.</p>
      <?php $lien = adresse_site() . '/agenda.php?cle=' . cle_agenda(); ?>
      <p><a class="btn" href="<?= proteger(str_replace(['https://', 'http://'], 'webcal://', $lien)) ?>">
         Ajouter à l'agenda de ce téléphone</a></p>
      <p class="aide">Si le bouton ne fait rien : copiez l'adresse ci-dessous, puis
         sur iPhone, Réglages → Applications → Calendrier → Comptes → Ajouter un compte
         → Autre → Ajouter un abonnement à un calendrier.</p>
      <input type="text" readonly onclick="this.select()" value="<?= proteger($lien) ?>">
      <p class="aide">Cette adresse est secrète : qui l'a voit tous vos rendez-vous.
         En cas de doute, renouvelez-la — il faudra alors se réabonner.</p>
      <form method="post" onsubmit="return confirm('Renouveler l\'adresse du calendrier ?');">
        <input type="hidden" name="jeton" value="<?= jeton() ?>">
        <input type="hidden" name="action" value="cle_agenda">
        <button class="btn vide mini" type="submit">Renouveler l'adresse</button>
      </form>
    </div>
    <div class="pied">
      <h2>Sauvegarde</h2>
      <p class="aide">Tout le salon — fiches, photos, rendez-vous, réglages — dans
         un seul fichier, à garder sur votre téléphone ou votre ordinateur.</p>
      <form method="post">
        <input type="hidden" name="jeton" value="<?= jeton() ?>">
        <input type="hidden" name="action" value="sauvegarde">
        <button class="btn" type="submit">Télécharger la sauvegarde</button>
      </form>

      <h2>Restaurer</h2>
      <p class="aide">Remet le site dans l'état de la sauvegarde choisie. Les fiches
         et les photos d'aujourd'hui seront remplacées.</p>
      <form method="post" enctype="multipart/form-data"
            onsubmit="return confirm('Remplacer les fiches et les photos actuelles par celles de cette sauvegarde ?');">
        <input type="hidden" name="jeton" value="<?= jeton() ?>">
        <input type="hidden" name="action" value="restaurer">
        <input type="file" name="archive" accept=".zip,application/zip" required>
        <button class="btn danger mini" type="submit">Restaurer cette sauvegarde</button>
      </form>
      <?php $secours = sauvegarde_de_secours(); if ($secours !== null): ?>
        <p class="aide">Avant la dernière restauration, l'état précédent a été mis de côté
           (<?= proteger(date('d/m/Y à H:i', (int) filemtime($secours))) ?>).</p>
        <form method="post">
          <input type="hidden" name="jeton" value="<?= jeton() ?>">
          <input type="hidden" name="action" value="sauvegarde_secours">
          <button class="btn vide mini" type="submit">Télécharger cet état précédent</button>
        </form>
      <?php endif; ?>
    </div>

    <div class="pied">
      <h2>Fermetures</h2>
      <?php $f = fermetures(); ?>

      <p class="aide">Un jour fermé ne propose plus aucune heure, et le site
         l'annonce dans ses horaires.</p>
      <form method="post" class="ligne-fermeture">
        <input type="hidden" name="jeton" value="<?= jeton() ?>">
        <input type="hidden" name="action" value="fermer">
        <input type="date" name="date" required min="<?= date('Y-m-d') ?>">
        <select name="moment">
          <option value="journee">Toute la journée</option>
          <option value="matin">Le matin seulement</option>
          <option value="apresmidi">L'après-midi seulement</option>
        </select>
        <button class="btn mini" type="submit">Fermer</button>
      </form>

      <?php
      $aVenir = array_filter($f['jours'], static fn ($m, $d): bool => $d >= date('Y-m-d'),
                             ARRAY_FILTER_USE_BOTH);
      if ($aVenir):
      ?>
        <?php foreach ($aVenir as $date => $moment):
          $pris = rendez_vous_du_jour((string) $date); ?>
          <div class="carte rdv<?= $pris ? ' attention' : '' ?>">
            <h3><?= proteger(date_francaise((string) $date, false)) ?><?=
                proteger(MOMENTS_DITS[$moment] ?? '') ?></h3>
            <?php if ($pris): ?>
              <div class="etat">⚠ <?= count($pris) ?> rendez-vous déjà pris</div>
              <p class="detail">
                <?php foreach ($pris as $r): ?>
                  <?= proteger(date('H\hi', (int) strtotime((string) $r['debut']))) ?> —
                  <?= proteger((string) ($r['prenom'] ?? '')) ?>
                  <a href="tel:<?= proteger(preg_replace('/[^\d+]/', '', (string) ($r['telephone'] ?? '')) ?? '') ?>"><?=
                     proteger((string) ($r['telephone'] ?? '')) ?></a><br>
                <?php endforeach; ?>
              </p>
            <?php endif; ?>
            <div class="liens">
              <form method="post" class="ligne">
                <input type="hidden" name="jeton" value="<?= jeton() ?>">
                <input type="hidden" name="action" value="rouvrir">
                <input type="hidden" name="date" value="<?= proteger((string) $date) ?>">
                <button class="btn vide mini" type="submit">Rouvrir ce jour</button>
              </form>
            </div>
          </div>
        <?php endforeach; ?>
      <?php else: ?>
        <p class="aide">Aucune fermeture prévue.</p>
      <?php endif; ?>

      <h2>Réservation en ligne</h2>
      <p class="aide">
        <?= $f['suspendue']
            ? 'Suspendue : le site invite les clients à vous appeler.'
            : 'Ouverte : les clients peuvent réserver eux-mêmes.' ?>
      </p>
      <form method="post">
        <input type="hidden" name="jeton" value="<?= jeton() ?>">
        <input type="hidden" name="action" value="suspendre">
        <button class="btn<?= $f['suspendue'] ? '' : ' vide' ?> mini" type="submit">
          <?= $f['suspendue'] ? 'Rouvrir la réservation en ligne' : 'Suspendre la réservation en ligne' ?>
        </button>
      </form>
    </div>

    <div class="pied">
      <h2>Alertes par e-mail</h2>
      <p class="aide">Un agenda par abonnement ne se rafraîchit qu'une fois par heure.
         L'e-mail, lui, arrive tout de suite.</p>
      <?php $al = alertes(); ?>
      <form method="post">
        <input type="hidden" name="jeton" value="<?= jeton() ?>">
        <input type="hidden" name="action" value="alertes">
        <label for="al-adresse">Adresse qui reçoit les alertes</label>
        <input type="email" id="al-adresse" name="adresse" placeholder="vous@exemple.ch"
               value="<?= proteger($al['adresse']) ?>">
        <p class="aide">Laissez vide pour ne plus rien recevoir.</p>

        <div class="choix-liste">
          <?php foreach ([
            'nouvelle'      => 'Une nouvelle demande arrive',
            'annulation'    => 'Un client annule lui-même',
            'recapitulatif' => 'Le programme du lendemain, chaque soir',
            'relance'       => 'Une demande attend depuis deux heures',
          ] as $cle => $libelle): ?>
            <label class="choix-ligne">
              <input type="checkbox" name="<?= proteger($cle) ?>"<?= $al[$cle] ? ' checked' : '' ?>>
              <span><?= proteger($libelle) ?></span>
            </label>
          <?php endforeach; ?>
        </div>
        <button class="btn" type="submit">Enregistrer les alertes</button>
      </form>

      <form method="post">
        <input type="hidden" name="jeton" value="<?= jeton() ?>">
        <input type="hidden" name="action" value="alertes_essai">
        <button class="btn vide mini" type="submit">Envoyer un essai</button>
      </form>

      <?php
      $envois = array_slice(journal_alertes()['envois'], -3);
      if ($envois):
      ?>
        <p class="aide">Derniers envois :</p>
        <ul class="aide">
          <?php foreach (array_reverse($envois) as $e): ?>
            <li><?= proteger(date_francaise((string) ($e['date'] ?? ''))) ?> —
                <?= proteger((string) ($e['objet'] ?? '')) ?>
                <?= !empty($e['ok']) ? '✓' : '✗' ?></li>
          <?php endforeach; ?>
        </ul>
      <?php endif; ?>
    </div>

    <?php
    pied();
    exit;
}

/* ------------------------------- Une fiche -------------------------------- */

$id = (string) ($_GET['id'] ?? '');
$f = $id !== '' ? fiche($id) : null;
$nouvelle = $f === null;

entete($nouvelle ? 'Nouvelle fiche' : 'Fiche de ' . (string) $f['prenom']);
avis($message, $erreur);
?>
<h1><?= $nouvelle ? 'Nouvelle masseuse' : proteger((string) $f['prenom']) ?></h1>
<p class="aide"><a href="index.php">← Retour à la liste</a></p>

<form method="post" enctype="multipart/form-data">
  <input type="hidden" name="jeton" value="<?= jeton() ?>">
  <input type="hidden" name="action" value="enregistrer">
  <input type="hidden" name="id" value="<?= proteger((string) ($f['id'] ?? '')) ?>">

  <label for="prenom">Prénom</label>
  <input type="text" id="prenom" name="prenom" required value="<?= proteger((string) ($f['prenom'] ?? '')) ?>">

  <label for="age">Âge (laisser vide pour ne pas l'afficher)</label>
  <input type="number" id="age" name="age" min="18" max="99" value="<?= proteger((string) ($f['age'] ?? '')) ?>">

  <label for="origine">Origine</label>
  <input type="text" id="origine" name="origine" placeholder="Française, Brésil…"
         value="<?= proteger((string) ($f['origine'] ?? '')) ?>">

  <?php
    $catalogueLangues = parametres()['langues'] ?? [];
    $siennesLangues = is_array($f['langues'] ?? null)
      ? array_values(array_filter($f['langues'], 'is_string'))
      : array_values(array_filter(array_map('trim', explode(',', (string) ($f['langues'] ?? '')))));
    /* Les anciennes saisies libres sont rapprochees du catalogue, sans tenir
       compte des majuscules : « anglais » coche bien « Anglais ». */
    $nomsLangues = array_column($catalogueLangues, 'nom');
    $cocheesLangues = [];
    $horsLangues = [];
    foreach ($siennesLangues as $l) {
      $trouve = null;
      foreach ($nomsLangues as $n) {
        if (mb_strtolower($n) === mb_strtolower($l)) { $trouve = $n; }
      }
      if ($trouve !== null) { $cocheesLangues[] = $trouve; } elseif ($l !== '') { $horsLangues[] = $l; }
    }
  ?>
  <label>Langues parlées</label>
  <?php if ($catalogueLangues): ?>
    <details class="choix"<?= $cocheesLangues ? '' : ' open' ?>>
      <summary><?php
        if ($cocheesLangues) {
          $resume = [];
          foreach ($catalogueLangues as $l) {
            if (in_array($l['nom'], $cocheesLangues, true)) { $resume[] = $l['drapeau'] . ' ' . $l['nom']; }
          }
          echo proteger(implode('   ', $resume));
        } else { echo 'Choisir les langues'; }
      ?></summary>
      <div class="choix-liste">
        <?php foreach ($catalogueLangues as $l): ?>
          <label class="choix-ligne">
            <input type="checkbox" name="langues[]" value="<?= proteger($l['nom']) ?>"
                   <?= in_array($l['nom'], $cocheesLangues, true) ? 'checked' : '' ?>>
            <span class="drapeau"><?= proteger($l['drapeau']) ?></span>
            <span><?= proteger($l['nom']) ?></span>
          </label>
        <?php endforeach; ?>
      </div>
    </details>
  <?php endif; ?>
  <input type="text" id="langues_autres" name="langues_autres"
         placeholder="<?= $catalogueLangues ? 'Autre langue (séparées par des virgules)' : 'Français, anglais' ?>"
         value="<?= proteger(implode(', ', $catalogueLangues ? $horsLangues : $siennesLangues)) ?>">

  <?php
    $catalogue = parametres()['prestations'] ?? [];
    $siennes = array_values(array_filter((array) ($f['specialites'] ?? []), 'is_string'));
    $hors = array_values(array_diff($siennes, $catalogue));
  ?>
  <label>Prestations proposées</label>
  <?php if ($catalogue): ?>
    <details class="choix"<?= $siennes ? '' : ' open' ?>>
      <summary><?= $siennes ? proteger(implode(' · ', $siennes)) : 'Choisir les prestations' ?></summary>
      <div class="choix-liste">
        <?php foreach ($catalogue as $p): ?>
          <label class="choix-ligne">
            <input type="checkbox" name="specialites[]" value="<?= proteger($p) ?>"
                   <?= in_array($p, $siennes, true) ? 'checked' : '' ?>>
            <span><?= proteger($p) ?></span>
          </label>
        <?php endforeach; ?>
      </div>
    </details>
  <?php endif; ?>
  <input type="text" id="specialites_autres" name="specialites_autres"
         placeholder="<?= $catalogue ? 'Autre prestation (séparées par des virgules)' : 'Tantra, Body body, Érotique' ?>"
         value="<?= proteger(implode(', ', $catalogue ? $hors : $siennes)) ?>">
  <p class="aide">Ce qui est coché s'affiche en pastilles sur sa fiche.</p>

  <label for="presentation">Présentation</label>
  <textarea id="presentation" name="presentation" placeholder="Deux ou trois phrases."><?= proteger((string) ($f['presentation'] ?? '')) ?></textarea>

  <details class="choix">
    <summary>Présentation dans les autres langues (facultatif)</summary>
    <div class="choix-liste">
      <p class="aide">Laissez vide et c'est le texte français qui s'affichera.</p>
      <?php foreach (['de' => '🇩🇪 Allemand', 'en' => '🇬🇧 Anglais', 'es' => '🇪🇸 Espagnol'] as $code => $libelle): ?>
        <label for="presentation_<?= $code ?>"><?= proteger($libelle) ?></label>
        <textarea id="presentation_<?= $code ?>" name="presentation_<?= $code ?>"
                  placeholder="Même texte, dans cette langue."><?=
          proteger((string) ($f['presentation_' . $code] ?? '')) ?></textarea>
      <?php endforeach; ?>
    </div>
  </details>

  <label for="telephone">Son numéro de téléphone</label>
  <input type="tel" id="telephone" name="telephone" placeholder="+41 79 000 00 00"
         value="<?= proteger((string) ($f['telephone'] ?? '')) ?>">
  <p class="aide">À laisser vide pour que les clients appellent le numéro du salon.
     Rempli, un bouton « Appeler » apparaît sur sa fiche.</p>

  <?php if (!$nouvelle): ?>
    <details class="choix">
      <summary>Son planning à elle</summary>
      <div class="choix-liste">
        <p class="aide">Une adresse personnelle qui n'affiche que ses heures :
           ni prénom de client, ni numéro. À lui envoyer une fois.</p>
        <?php $lienP = adresse_site() . '/planning.php?m=' . urlencode((string) $f['id'])
                     . '&cle=' . cle_planning((string) $f['id']); ?>
        <input type="text" readonly onclick="this.select()" value="<?= proteger($lienP) ?>">
        <p class="aide">Et pour que ses rendez-vous arrivent dans son agenda :</p>
        <?php $lienA = adresse_site() . '/agenda.php?m=' . urlencode((string) $f['id'])
                     . '&cle=' . cle_planning((string) $f['id']); ?>
        <input type="text" readonly onclick="this.select()"
               value="<?= proteger(str_replace(['https://', 'http://'], 'webcal://', $lienA)) ?>">
      </div>
    </details>
  <?php endif; ?>

  <label for="part">Sa part sur chaque massage</label>
  <input type="number" id="part" name="part" min="0" max="100" step="5"
         value="<?= (int) ($f['part'] ?? PART_PAR_DEFAUT) ?>">
  <p class="aide">En pourcentage. Le reste revient au salon. C'est ce chiffre
     qui sert au décompte de fin de semaine.</p>

  <label for="debut">Présente à partir du</label>
  <input type="date" id="debut" name="debut" value="<?= proteger((string) ($f['debut'] ?? '')) ?>">

  <label for="fin">Jusqu'au</label>
  <input type="date" id="fin" name="fin" value="<?= proteger((string) ($f['fin'] ?? '')) ?>">
  <p class="aide">À laisser vides si elle est là en permanence. Avec une date
     de fin passée, sa fiche reste visible mais affiche « Bientôt de retour ».</p>

  <div class="coche">
    <input type="checkbox" id="dispo" name="disponible" value="1"
           <?= ($nouvelle || !empty($f['disponible'])) ? 'checked' : '' ?>>
    <label for="dispo">Disponible en ce moment</label>
  </div>

  <label for="photos">Ajouter des photos</label>
  <input type="file" id="photos" name="photos[]" accept="image/*" multiple>
  <p class="aide">Elles sont automatiquement réduites et allégées. La première
     de la liste ci-dessous est la grande photo de la fiche.</p>

  <div class="actions">
    <button class="btn" type="submit">Enregistrer</button>
    <a class="btn vide" href="index.php">Annuler</a>
  </div>
</form>

<?php if (!$nouvelle && !empty($f['photos'])): ?>
  <h2>Ses photos</h2>
  <div class="photos">
    <?php foreach ($f['photos'] as $k => $photo): ?>
      <div class="photo">
        <img src="../<?= proteger((string) $photo) ?>" alt="">
        <?php if ($k === 0): ?><div class="marque">Photo principale</div><?php endif; ?>
        <div class="sous">
          <?php if ($k > 0): ?>
            <form method="post" class="ligne">
              <input type="hidden" name="jeton" value="<?= jeton() ?>">
              <input type="hidden" name="action" value="photo_principale">
              <input type="hidden" name="id" value="<?= proteger((string) $f['id']) ?>">
              <input type="hidden" name="chemin" value="<?= proteger((string) $photo) ?>">
              <button class="btn vide mini" type="submit">En principale</button>
            </form>
          <?php endif; ?>
          <form method="post" class="ligne" onsubmit="return confirm('Supprimer cette photo ?');">
            <input type="hidden" name="jeton" value="<?= jeton() ?>">
            <input type="hidden" name="action" value="photo_supprimer">
            <input type="hidden" name="id" value="<?= proteger((string) $f['id']) ?>">
            <input type="hidden" name="chemin" value="<?= proteger((string) $photo) ?>">
            <button class="btn danger mini" type="submit">Supprimer</button>
          </form>
        </div>
      </div>
    <?php endforeach; ?>
  </div>
<?php endif; ?>

<?php if (!$nouvelle): ?>
  <div class="pied">
    <p class="aide">Supprimer sa fiche efface aussi toutes ses photos du serveur,
       définitivement, et retire son lien de planning. Ses rendez-vous passés
       restent dans le décompte, à son prénom.</p>
    <form method="post" onsubmit="return confirm('Supprimer définitivement cette fiche et effacer toutes ses photos du serveur ?');">
      <input type="hidden" name="jeton" value="<?= jeton() ?>">
      <input type="hidden" name="action" value="supprimer">
      <input type="hidden" name="id" value="<?= proteger((string) $f['id']) ?>">
      <button class="btn danger" type="submit">Supprimer cette fiche</button>
    </form>
  </div>
<?php endif; ?>
<?php pied(); ?>
