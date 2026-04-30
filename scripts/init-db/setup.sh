#!/bin/bash
set -e

# Це локальний скрипт. Ми дозволяємо реплікацію для cms_user з будь-якого IP (в межах докер мережі)
if ! grep -qxF "host replication cms_user 0.0.0.0/0 md5" "$PGDATA/pg_hba.conf"; then
  echo "host replication cms_user 0.0.0.0/0 md5" >> "$PGDATA/pg_hba.conf"
fi