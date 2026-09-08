#!/usr/bin/env bash
# Rejoue les migrations sur un PostgreSQL jetable et verifie le comportement
# du schema : quotas de photos, verrou du palier, classements.
#
#   ./supabase/tests/lancer.sh
#
# Ne demande pas Supabase : 00_bouchons_supabase.sql recree le minimum
# (auth.users, auth.uid(), storage) dont dependent les migrations.

set -euo pipefail

RACINE="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PGBIN="$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | tail -1)"
PGDATA="${PGDATA:-/var/lib/postgresql/verif-fitness}"

if [ -z "$PGBIN" ]; then
  echo "PostgreSQL introuvable (attendu dans /usr/lib/postgresql/*/bin)." >&2
  exit 1
fi

# PostgreSQL refuse de tourner en root : tout passe par l'utilisateur postgres.
executer() { su postgres -c "$PGBIN/psql -h $PGDATA -U postgres -v ON_ERROR_STOP=1 $*"; }

if ! su postgres -c "$PGBIN/pg_ctl -D $PGDATA status" >/dev/null 2>&1; then
  rm -rf "$PGDATA"
  su postgres -c "$PGBIN/initdb -D $PGDATA -A trust -U postgres" >/dev/null
  su postgres -c "$PGBIN/pg_ctl -D $PGDATA -o '-k $PGDATA -c listen_addresses=' -l $PGDATA/log start -w" >/dev/null
fi

# Base repartie de zero a chaque execution.
su postgres -c "$PGBIN/psql -h $PGDATA -U postgres -q -c \
  'drop schema if exists public cascade; create schema public;
   drop schema if exists auth cascade; drop schema if exists storage cascade;
   drop type if exists objectif_type; drop type if exists palier_type;'" >/dev/null 2>&1

TEMPO="$(mktemp -d)"
cp "$RACINE"/supabase/tests/00_bouchons_supabase.sql "$TEMPO/"
cp "$RACINE"/supabase/migrations/*.sql "$TEMPO/"
cp "$RACINE"/supabase/tests/01_verifications.sql "$TEMPO/"
chmod -R a+rX "$TEMPO"

executer -q -f "$TEMPO/00_bouchons_supabase.sql" 2>&1 | grep -vi "already exists" || true
for migration in "$TEMPO"/2*.sql; do
  echo "-- $(basename "$migration")"
  executer -q -f "$migration" 2>&1 | grep -vi "already exists" || true
done

executer -f "$TEMPO/01_verifications.sql" 2>&1 | grep -E "NOTICE|ERROR|TOUTES|ECHEC"
rm -rf "$TEMPO"
