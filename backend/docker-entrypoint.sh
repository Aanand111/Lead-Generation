#!/bin/sh
set -eu

role="${RUNTIME_ROLE:-api}"
auto_run_migrations="${AUTO_RUN_MIGRATIONS:-true}"

should_run_migrations() {
  case "${auto_run_migrations}" in
    1|true|TRUE|yes|YES|on|ON)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

run_migrations_if_enabled() {
  if [ "$role" = "migrate" ]; then
    return 0
  fi

  if should_run_migrations; then
    echo "Running database migrations before starting ${role}..."
    npm run db:migrate
  fi
}

case "$role" in
  api)
    run_migrations_if_enabled
    exec npm run start:api
    ;;
  worker)
    run_migrations_if_enabled
    exec npm run start:worker
    ;;
  scheduler)
    run_migrations_if_enabled
    exec npm run start:scheduler
    ;;
  migrate)
    exec npm run db:migrate
    ;;
  pm2)
    run_migrations_if_enabled
    exec npm run start:pm2
    ;;
  *)
    echo "Unknown RUNTIME_ROLE: $role" >&2
    exit 1
    ;;
esac
