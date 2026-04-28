#!/bin/sh
set -eu

role="${RUNTIME_ROLE:-api}"

case "$role" in
  api)
    exec npm run start:api
    ;;
  worker)
    exec npm run start:worker
    ;;
  scheduler)
    exec npm run start:scheduler
    ;;
  migrate)
    exec npm run db:migrate
    ;;
  pm2)
    exec npm run start:pm2
    ;;
  *)
    echo "Unknown RUNTIME_ROLE: $role" >&2
    exit 1
    ;;
esac
