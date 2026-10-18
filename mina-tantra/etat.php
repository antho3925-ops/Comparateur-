<?php
/* ---------------------------------------------------------------------------
   Chez Eva — etat de l'installation
   ---------------------------------------------------------------------------
   Page de controle. On l'ouvre quand le site ne montre pas les dernieres
   modifications : elle dit si le dossier ouvert par le visiteur est bien
   celui ou le site est installe, quelle est la date de chaque fichier, et
   si une ancienne page en un seul fichier vient prendre la place.

   Elle ne montre ni mot de passe, ni cle, ni fiche : uniquement des dates.
--------------------------------------------------------------------------- */
declare(strict_types=1);

$racine = __DIR__;

/** Date lisible d'un fichier du site, ou null s'il manque. */
function daterFichier(string $racine, string $rel): ?string
{
    $date = @filemtime($racine . '/' . $rel);
    return $date ? date('d/m/Y H:i', $date) : null;
}

/** Cherche un texte dans un fichier du site : sert de temoin de version. */
function contient(string $racine, string $rel, string $aiguille): bool
{
    $contenu = @file_get_contents($racine . '/' . $rel);
    return is_string($contenu) && strpos($contenu, $aiguille) !== false;
}

$essentiels = [
    'index.php', 'modele.html', 'js/site.js', 'js/contenu.js',
    'assets/styles.css', 'assets/polices/italiana.woff2',
    'admin/index.php', 'admin/alertes.php', 'reserver.php', 'taches.php',
];

/* Les trois temoins des dernieres modifications. */
$temoins = [
    'Le grand C sans animation' => contient($racine, 'js/site.js', "classList.add('compose')"),
    'Les trois façons de prendre rendez-vous' => contient($racine, 'js/contenu.js', 'PRISE_DE_RDV'),
    'Le massage nuru' => contient($racine, 'js/contenu.js', 'uru'),
    'Les flèches dans les photos' => contient($racine, 'modele.html', 'lightbox-suivant'),
    'Le rechargement automatique' => contient($racine, 'index.php', 'filemtime'),
    'Les alertes par e-mail' => contient($racine, 'admin/noyau.php', "require __DIR__ . '/alertes.php'"),
    'Les jours de fermeture' => contient($racine, 'admin/noyau.php', "require __DIR__ . '/fermetures.php'"),
    'La sauvegarde' => contient($racine, 'admin/noyau.php', "require __DIR__ . '/sauvegarde.php'"),
    'Les quatre langues' => contient($racine, 'js/traductions.js', 'LANGUES_SITE'),
    'La liste d’attente' => contient($racine, 'admin/noyau.php', "require __DIR__ . '/attente.php'"),
    'L’annulation par le client' => is_file($racine . '/annuler.php'),
    'La caisse et le décompte' => contient($racine, 'admin/noyau.php', "require __DIR__ . '/comptes.php'"),
    'Le planning des masseuses' => is_file($racine . '/planning.php'),
];

$ancienne = is_file($racine . '/index.html');

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
?>
<!DOCTYPE html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>État de l'installation</title>
<style>
 body{font:16px/1.6 system-ui,-apple-system,sans-serif;background:#120b12;color:#efe6e2;margin:0;padding:24px}
 h1{font-weight:500;font-size:1.3rem;margin:0 0 4px}
 h2{font-weight:500;font-size:1rem;color:#e6c766;margin:26px 0 8px;letter-spacing:.04em}
 p{margin:6px 0}
 table{border-collapse:collapse;width:100%;font-size:.92rem}
 td{padding:6px 8px;border-bottom:1px solid #2a1f2a;vertical-align:top}
 td:last-child{text-align:right;white-space:nowrap;color:#bba9b5}
 .ok{color:#7ec08c}.ko{color:#e07a7a}
 .alerte{background:#3a1414;border:1px solid #e07a7a;border-radius:10px;padding:14px;margin:18px 0}
 code{color:#e6c766;word-break:break-all}
 a{color:#e6c766}
</style>

<h1>État de l'installation</h1>
<p>Adresse ouverte : <code><?= htmlspecialchars(($_SERVER['HTTP_HOST'] ?? '') . ($_SERVER['REQUEST_URI'] ?? ''), ENT_QUOTES) ?></code></p>
<p>Dossier du site : <code><?= htmlspecialchars(basename($racine), ENT_QUOTES) ?></code></p>
<p>PHP : <code><?= htmlspecialchars(PHP_VERSION, ENT_QUOTES) ?></code></p>

<?php if ($ancienne): ?>
<div class="alerte">
  <strong>Une ancienne page <code>index.html</code> occupe la place.</strong>
  <p>Le serveur la montre aux visiteurs au lieu de la vraie page du site.
     Il faut la supprimer, ou la renommer <code>ancien-index.txt</code>.</p>
</div>
<?php endif; ?>

<h2>Fichiers du site</h2>
<table>
<?php foreach ($essentiels as $rel): $d = daterFichier($racine, $rel); ?>
  <tr>
    <td><?= $d ? '<span class="ok">✓</span>' : '<span class="ko">✗</span>' ?>
        <?= htmlspecialchars($rel, ENT_QUOTES) ?></td>
    <td><?= $d ? htmlspecialchars($d, ENT_QUOTES) : 'absent' ?></td>
  </tr>
<?php endforeach; ?>
</table>

<h2>Dernières modifications</h2>
<table>
<?php foreach ($temoins as $nom => $present): ?>
  <tr>
    <td><?= $present ? '<span class="ok">✓</span>' : '<span class="ko">✗</span>' ?>
        <?= htmlspecialchars($nom, ENT_QUOTES) ?></td>
    <td><?= $present ? 'en place' : 'manquant' ?></td>
  </tr>
<?php endforeach; ?>
</table>

<h2>Ce que la page publique envoie au navigateur</h2>
<table>
<?php foreach (['assets/styles.css', 'js/contenu.js', 'js/site.js'] as $rel):
      $v = @filemtime($racine . '/' . $rel); ?>
  <tr><td><code><?= htmlspecialchars($rel . ($v ? '?v=' . $v : ''), ENT_QUOTES) ?></code></td><td></td></tr>
<?php endforeach; ?>
</table>

<p style="margin-top:26px"><a href="./">Voir le site</a> &nbsp;·&nbsp; <a href="admin/">Administration</a></p>
