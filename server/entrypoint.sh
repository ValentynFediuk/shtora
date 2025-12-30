#!/usr/bin/env sh
set -e

# Опційно: дозволити self-signed сертифікати для вихідних TLS-з'єднань Node.js
# Використовуйте лише у non-prod середовищах або коли це справді необхідно
# Увімкнеться, якщо ALLOW_SELF_SIGNED=true
if [ "${ALLOW_SELF_SIGNED:-false}" = "true" ]; then
  export NODE_TLS_REJECT_UNAUTHORIZED=0
fi

# Якщо Railway надав PG* — замапимо їх у DB_*
if [ -n "$PGHOST" ] && [ -z "$DB_HOST" ]; then
  export DB_CLIENT="${DB_CLIENT:-pg}"
  export DB_HOST="$PGHOST"
  export DB_PORT="${PGPORT:-5432}"
  export DB_DATABASE="$PGDATABASE"
  export DB_USER="$PGUSER"
  export DB_PASSWORD="$PGPASSWORD"
  # Багато хостингів вимагають SSL
  export DB_SSL="${DB_SSL:-true}"
  export DB_SSL_REJECT_UNAUTHORIZED="${DB_SSL_REJECT_UNAUTHORIZED:-false}"
fi

# Якщо є DATABASE_URL і немає DB_HOST — використаймо його
# Directus підтримує DATABASE_URL напряму
if [ -n "$DATABASE_URL" ] && [ -z "$DB_HOST" ]; then
  export DB_CLIENT="${DB_CLIENT:-pg}"
  # DB_SSL для DATABASE_URL
  export DB_SSL="${DB_SSL:-true}"
  export DB_SSL_REJECT_UNAUTHORIZED="${DB_SSL_REJECT_UNAUTHORIZED:-false}"
fi

# Запускаємо Directus
exec node /directus/cli.js start
