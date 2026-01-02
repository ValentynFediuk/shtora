#!/usr/bin/env sh
set -e

if [ -n "$PGHOST" ]; then
  export DB_CLIENT=pg
  export DB_HOST="$PGHOST"
  export DB_PORT="$PGPORT"
  export DB_DATABASE="$PGDATABASE"
  export DB_USER="$PGUSER"
  export DB_PASSWORD="$PGPASSWORD"

  # IMPORTANT: private network → SSL не потрібен
  export DB_SSL=false
fi

exec node /directus/cli.js start
