#!/usr/bin/env bash
# Lance la plateforme et le tunnel Cloudflare ensemble, et les arrête ensemble.
# macOS et Linux ; voir demarrer.ps1 pour Windows.
#
#   ./suivi/demarrer.sh                      tunnel d'essai, adresse au hasard
#   ./suivi/demarrer.sh suivi                tunnel nommé « suivi », adresse stable
#
# Ctrl+C arrête les deux.

set -euo pipefail

cd "$(dirname "$0")"

PORT="${PORT:-8080}"
NOM_TUNNEL="${1:-}"

if ! command -v node >/dev/null 2>&1; then
  echo "Node n'est pas installé, ou pas dans le PATH." >&2
  exit 1
fi
if ! command -v cloudflared >/dev/null 2>&1; then
  echo "cloudflared n'est pas installé. Voir suivi/TUNNEL-CLOUDFLARE.md, étape 1." >&2
  exit 1
fi

# Le tunnel apporte le chiffrement : le cookie de session doit prendre Secure.
export SUIVI_HTTPS="${SUIVI_HTTPS:-1}"
export PORT

echo "Démarrage de la plateforme sur le port $PORT…"
node serveur.mjs &
PID_SERVEUR=$!

# Quoi qu'il arrive ensuite, on ne laisse pas un serveur orphelin derrière soi.
nettoyer() {
  trap - INT TERM HUP EXIT
  kill "$PID_SERVEUR" 2>/dev/null || true
  wait "$PID_SERVEUR" 2>/dev/null || true
  echo
  echo "Plateforme et tunnel arrêtés."
}
# HUP compris : fermer la fenêtre du terminal ne doit pas laisser la plateforme
# tourner sans personne pour la surveiller.
trap nettoyer INT TERM HUP EXIT

# Laisser le serveur s'installer avant d'y brancher le tunnel.
for _ in $(seq 1 20); do
  if curl -sf -o /dev/null "http://localhost:$PORT/"; then break; fi
  sleep 0.25
done

if ! kill -0 "$PID_SERVEUR" 2>/dev/null; then
  echo "La plateforme n'a pas démarré. Relancez « node serveur.mjs » pour voir l'erreur." >&2
  exit 1
fi

echo "Ouverture du tunnel…"
echo
if [ -n "$NOM_TUNNEL" ]; then
  cloudflared tunnel run "$NOM_TUNNEL"
else
  echo "Adresse d'essai : elle change à chaque lancement."
  echo "Pour une adresse stable, voir TUNNEL-CLOUDFLARE.md, étape 3."
  echo
  cloudflared tunnel --url "http://localhost:$PORT"
fi
