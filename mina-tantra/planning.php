<?php
/* ---------------------------------------------------------------------------
   Chez Eva — le planning d'une masseuse
   ---------------------------------------------------------------------------
   Chaque masseuse recoit une adresse secrete qui n'affiche que ses heures :
   quand elle travaille, combien de temps, et quelle prestation. Rien du
   client, pas meme son prenom — si elle perd l'adresse, personne n'apprend
   quoi que ce soit sur la clientele du salon.
--------------------------------------------------------------------------- */
declare(strict_types=1);
require __DIR__ . '/admin/noyau.php';
fuseau();

$id  = (string) ($_GET['m'] ?? '');
$cle = (string) ($_GET['cle'] ?? '');
$f = fiche($id);

if ($f === null || !cle_planning_valide($id, $cle)) {
    http_response_code(403);
    header('Content-Type: text/plain; charset=utf-8');
    exit('Accès refusé.');
}

$jours = journees_masseuse($id);
$salon = parametres();

header('Content-Type: text/html; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');
?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="referrer" content="no-referrer">
<meta name="apple-mobile-web-app-capable" content="yes">
<title>Planning de <?= htmlspecialchars((string) $f['prenom'], ENT_QUOTES) ?></title>
<link rel="icon" href="assets/favicon.ico" sizes="any">
<style>
 :root{ --nuit:#120b12; --nuit-2:#1b1018; --or:#c9a227; --or-clair:#e6c766;
        --texte:#efe6e2; --doux:#b9a9a6; --bord:rgba(201,162,39,.24); }
 *{ box-sizing:border-box; }
 body{ margin:0; background:var(--nuit); color:var(--texte); line-height:1.6; padding:22px 18px 40px;
       font:16px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; }
 header{ margin-bottom:22px; }
 h1{ font-size:1.35rem; font-weight:500; margin:0 0 4px; }
 .salon{ font-size:.7rem; letter-spacing:.24em; text-transform:uppercase; color:var(--or); }
 .jour{ margin:0 0 18px; border:1px solid var(--bord); border-radius:14px;
        background:var(--nuit-2); padding:16px 18px; }
 .jour h2{ margin:0 0 10px; font-size:.95rem; font-weight:500; color:var(--or-clair); }
 .creneau{ display:flex; gap:12px; padding:8px 0; border-top:1px solid var(--bord); }
 .creneau:first-of-type{ border-top:0; }
 .creneau b{ flex:0 0 94px; font-weight:600; }
 .creneau span{ color:var(--doux); font-size:.92rem; }
 .attente{ color:var(--or); font-size:.72rem; letter-spacing:.1em; text-transform:uppercase; }
 .vide{ color:var(--doux); }
 footer{ margin-top:26px; color:var(--doux); font-size:.84rem; }
</style>
</head>
<body>
<header>
  <p class="salon"><?= htmlspecialchars((string) ($salon['nom'] ?? 'Chez Eva'), ENT_QUOTES) ?></p>
  <h1>Planning de <?= htmlspecialchars((string) $f['prenom'], ENT_QUOTES) ?></h1>
</header>

<?php if (!$jours): ?>
  <p class="vide">Rien de prévu pour l'instant. Cette page se met à jour toute seule.</p>
<?php else: ?>
  <?php foreach ($jours as $jour => $creneaux): ?>
    <section class="jour">
      <h2><?= htmlspecialchars(date_francaise($jour, false), ENT_QUOTES) ?></h2>
      <?php foreach ($creneaux as $c): ?>
        <div class="creneau">
          <b><?= htmlspecialchars(str_replace(':', 'h', $c['debut']), ENT_QUOTES) ?>
             – <?= htmlspecialchars(str_replace(':', 'h', $c['fin']), ENT_QUOTES) ?></b>
          <span>
            <?= htmlspecialchars($c['prestation'] !== '' ? $c['prestation'] : 'À préciser', ENT_QUOTES) ?>
            <?php if ($c['attente']): ?><br><span class="attente">à confirmer</span><?php endif; ?>
          </span>
        </div>
      <?php endforeach; ?>
    </section>
  <?php endforeach; ?>
<?php endif; ?>

<footer>
  Les trois prochaines semaines. Cette adresse est personnelle : ne la transmettez pas.
</footer>
</body>
</html>
