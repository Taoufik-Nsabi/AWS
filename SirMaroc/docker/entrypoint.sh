#!/bin/sh
set -eu

cd /var/www/html

current_lock_hash="$(sha256sum composer.lock | awk '{print $1}')"
stored_lock_hash=""

if [ -f vendor/.composer.lock.sha256 ]; then
  stored_lock_hash="$(cat vendor/.composer.lock.sha256)"
fi

if [ ! -f vendor/autoload.php ] || [ "$stored_lock_hash" != "$current_lock_hash" ]; then
  echo "Bootstrapping Symfony vendor directory..."
  mkdir -p vendor
  find vendor -mindepth 1 -maxdepth 1 -exec rm -rf {} +

  if [ -d /opt/vendor-cache ] && [ -n "$(ls -A /opt/vendor-cache 2>/dev/null)" ]; then
    cp -a /opt/vendor-cache/. vendor/
  else
    composer install --no-interaction --prefer-dist
  fi
fi

attempt=0
max_attempts=30

until php bin/console doctrine:database:create --if-not-exists --no-interaction >/dev/null 2>&1; do
  attempt=$((attempt + 1))

  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "Database connection is still unavailable after $max_attempts attempts."
    php bin/console doctrine:database:create --if-not-exists --no-interaction
    exit 1
  fi

  echo "Waiting for SQL Server... ($attempt/$max_attempts)"
  sleep 3
done

php bin/console doctrine:migrations:migrate --no-interaction

exec "$@"
