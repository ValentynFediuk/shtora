#!/usr/bin/env sh
set -e

if [ "$ALLOW_SELF_SIGNED" = "true" ]; then
  export NODE_TLS_REJECT_UNAUTHORIZED=0
fi

if [ -n "$PGHOST" ] && [ -z "$DB_HOST" ]; then
  export DB_CLIENT=pg
  export DB_HOST="$PGHOST"
  export DB_PORT="${PGPORT:-5432}"
  export DB_DATABASE="$PGDATABASE"
  export DB_USER="$PGUSER"
  export DB_PASSWORD="$PGPASSWORD"
  export DB_SSL=true
  export DB_SSL_REJECT_UNAUTHORIZED=false
fi

if [ -n "$DATABASE_URL" ] && [ -z "$DB_HOST" ]; then
  export DB_CLIENT=pg
  export DB_SSL=true
  export DB_SSL_REJECT_UNAUTHORIZED=false
fi

exec node /directus/cli.js start
