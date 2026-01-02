#!/usr/bin/env sh
set -e

# If PGHOST is set (external DB like Railway)
if [ -n "$PGHOST" ]; then
  export DB_CLIENT=pg
  export DB_HOST="$PGHOST"
  export DB_PORT="${PGPORT:-5432}"
  export DB_DATABASE="$PGDATABASE"
  export DB_USER="$PGUSER"
  export DB_PASSWORD="$PGPASSWORD"
  export DB_SSL="true"
  export DB_SCHEMA=public
fi

# CMS secrets
export KEY="shtora-secret-key-minimum-32-chars"
export SECRET="shtora-another-secret-32-chars-x"

# Admin & frontend
export ADMIN_EMAIL="${ADMIN_EMAIL}"
export ADMIN_PASSWORD="${ADMIN_PASSWORD}"
export CORS_ENABLED="${CORS_ENABLED}"
export CORS_ORIGIN="${CORS_ORIGIN}"
export PUBLIC_URL="${PUBLIC_URL}"

# Start Directus
exec node /directus/cli.js start
