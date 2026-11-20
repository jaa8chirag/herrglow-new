#!/bin/sh
# Daily Postgres backup → Cloudflare R2 (bucket BACKUP_BUCKET), 30-day retention.
# Needs: PG* env (set by compose), R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, BACKUP_BUCKET.
set -eu

: "${R2_ACCOUNT_ID:?}" "${R2_ACCESS_KEY_ID:?}" "${R2_SECRET_ACCESS_KEY:?}" "${BACKUP_BUCKET:?}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
PREFIX="${BACKUP_PREFIX:-postgres}"

export RCLONE_CONFIG_R2_TYPE=s3 RCLONE_CONFIG_R2_PROVIDER=Cloudflare \
  RCLONE_CONFIG_R2_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID" RCLONE_CONFIG_R2_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY" \
  RCLONE_CONFIG_R2_ENDPOINT="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com" RCLONE_CONFIG_R2_NO_CHECK_BUCKET=true

STAMP="$(date -u +%Y-%m-%dT%H%M%SZ)"
FILE="/tmp/herrglow-${STAMP}.sql.gz"

echo "[backup] dumping $PGDATABASE → $FILE"
pg_dump --no-owner --no-privileges --format=plain | gzip -9 > "$FILE"
SIZE="$(wc -c < "$FILE")"
[ "$SIZE" -gt 10000 ] || { echo "[backup] dump suspiciously small ($SIZE bytes), aborting"; exit 1; }

echo "[backup] uploading ($SIZE bytes)"
rclone copyto "$FILE" "R2:${BACKUP_BUCKET}/${PREFIX}/$(date -u +%Y/%m)/herrglow-${STAMP}.sql.gz"
rm -f "$FILE"

echo "[backup] pruning > ${RETENTION_DAYS} days"
rclone delete "R2:${BACKUP_BUCKET}/${PREFIX}" --min-age "${RETENTION_DAYS}d" || true
echo "[backup] done"
