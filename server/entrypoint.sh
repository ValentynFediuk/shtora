#!/usr/bin/env sh
set -e

if [ -n "$PGHOST" ]; then
  export DB_CLIENT=pg
  export DB_HOST="$PGHOST"
  export DB_PORT="${PGPORT:-5432}"
  export DB_DATABASE="$PGDATABASE"
  export DB_USER="$PGUSER"
  export DB_PASSWORD="$PGPASSWORD"

  # Private network → SSL не потрібен
  export DB_SSL=false
  export DB_SCHEMA=public
fi

# Старі KEY/SECRET від твоєї CMS
export KEY="shtora-secret-key-minimum-32-chars"
export SECRET="shtora-another-secret-32-chars-x"

# UI / фронтенд
export ADMIN_EMAIL="admin@shtora.ua"
export ADMIN_PASSWORD="admin123"
export CORS_ENABLED=true
export CORS_ORIGIN=*
export PUBLIC_URL="https://shtora-production-up.railway.app"

# Старт Directus
exec node /directus/cli.js start
