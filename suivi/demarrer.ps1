# Lance la plateforme et le tunnel Cloudflare ensemble, et les arrête ensemble.
# Windows ; voir demarrer.sh pour macOS et Linux.
#
#   .\suivi\demarrer.ps1                 tunnel d'essai, adresse au hasard
#   .\suivi\demarrer.ps1 -Tunnel suivi   tunnel nommé « suivi », adresse stable
#
# Ctrl+C arrête les deux.
#
# Si Windows refuse d'exécuter le script, autorisez-le pour cette session :
#   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

param(
  [string]$Tunnel = "",
  [int]$Port = 8080
)

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

foreach ($outil in @("node", "cloudflared")) {
  if (-not (Get-Command $outil -ErrorAction SilentlyContinue)) {
    Write-Error "$outil n'est pas installé, ou pas dans le PATH. Voir TUNNEL-CLOUDFLARE.md, étape 1."
    exit 1
  }
}

# Le tunnel apporte le chiffrement : le cookie de session doit prendre Secure.
if (-not $env:SUIVI_HTTPS) { $env:SUIVI_HTTPS = "1" }
$env:PORT = "$Port"

Write-Host "Démarrage de la plateforme sur le port $Port…"
$serveur = Start-Process -FilePath "node" -ArgumentList "serveur.mjs" `
  -WorkingDirectory $PSScriptRoot -PassThru -NoNewWindow

try {
  # Laisser le serveur s'installer avant d'y brancher le tunnel.
  $pret = $false
  foreach ($essai in 1..20) {
    Start-Sleep -Milliseconds 250
    try {
      Invoke-WebRequest -Uri "http://localhost:$Port/" -UseBasicParsing -TimeoutSec 2 | Out-Null
      $pret = $true
      break
    } catch { }
  }
  if (-not $pret) {
    Write-Error "La plateforme n'a pas démarré. Lancez « node serveur.mjs » pour voir l'erreur."
    exit 1
  }

  Write-Host "Ouverture du tunnel…"
  Write-Host ""
  if ($Tunnel) {
    & cloudflared tunnel run $Tunnel
  } else {
    Write-Host "Adresse d'essai : elle change à chaque lancement."
    Write-Host "Pour une adresse stable, voir TUNNEL-CLOUDFLARE.md, étape 3."
    Write-Host ""
    & cloudflared tunnel --url "http://localhost:$Port"
  }
}
finally {
  # Quoi qu'il arrive, on ne laisse pas un serveur orphelin derrière soi.
  if ($serveur -and -not $serveur.HasExited) {
    Stop-Process -Id $serveur.Id -Force -ErrorAction SilentlyContinue
  }
  Write-Host ""
  Write-Host "Plateforme et tunnel arrêtés."
}
