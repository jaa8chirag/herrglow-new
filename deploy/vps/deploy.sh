#!/usr/bin/env bash
# Production deployment script for HerrGlow (https://herrglow.com)
# Designed for automated execution via GitHub Actions SSH or manual terminal execution.
set -euo pipefail

TARGET_REF="${1:-main}"
APP_DIR="${HERRGLOW_DIR:-/opt/herrglow}"

echo "=========================================================="
echo "🚀 HerrGlow Production Deployment"
echo "Target Ref / Commit: ${TARGET_REF}"
echo "Directory:           ${APP_DIR}"
echo "Timestamp:           $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "=========================================================="

if [ ! -d "${APP_DIR}" ]; then
  echo "❌ Error: Application directory '${APP_DIR}' does not exist."
  exit 1
fi

cd "${APP_DIR}"

# 1. Fetch latest commits and checkout the target commit
echo "📥 Fetching latest changes from origin..."
git fetch origin "${TARGET_REF}" || git fetch origin

echo "🔄 Checking out ${TARGET_REF}..."
git checkout "${TARGET_REF}"
if git show-ref --verify --quiet "refs/remotes/origin/${TARGET_REF}"; then
  git reset --hard "origin/${TARGET_REF}"
else
  git reset --hard "${TARGET_REF}"
fi

# 2. Resolve Compose and Environment files
ENV_FILE=""
if [ -f ".env" ]; then
  ENV_FILE=".env"
elif [ -f "deploy/vps/.env" ]; then
  ENV_FILE="deploy/vps/.env"
fi

COMPOSE_CMD="docker compose"
if [ -n "${ENV_FILE}" ]; then
  COMPOSE_CMD="${COMPOSE_CMD} --env-file ${ENV_FILE}"
fi

if [ -f "deploy/vps/docker-compose.yml" ]; then
  COMPOSE_CMD="${COMPOSE_CMD} -f deploy/vps/docker-compose.yml"
elif [ -f "docker-compose.yml" ]; then
  COMPOSE_CMD="${COMPOSE_CMD} -f docker-compose.yml"
fi

echo "Using compose command: ${COMPOSE_CMD}"

# 3. Apply Prisma database migrations
echo "🗄️ Running database migrations..."
${COMPOSE_CMD} run --rm migrate

# 4. Rebuild and launch web, worker, and caddy services with zero-downtime
echo "🔨 Building and launching updated containers..."
${COMPOSE_CMD} up -d --build --remove-orphans web worker caddy

# 5. Health Check Verification
echo "🩺 Verifying container health..."
MAX_RETRIES=15
RETRY_DELAY=4
HEALTHY=false

for i in $(seq 1 "${MAX_RETRIES}"); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api/v1/health || true)
  if [ "${STATUS}" = "200" ]; then
    echo "✓ Local health check passed (HTTP 200) on attempt ${i}!"
    HEALTHY=true
    break
  fi
  echo "Waiting for web service to respond (attempt ${i}/${MAX_RETRIES}, HTTP ${STATUS})..."
  sleep "${RETRY_DELAY}"
done

if [ "${HEALTHY}" != "true" ]; then
  echo "❌ Error: Health check timed out or failed."
  ${COMPOSE_CMD} logs --tail=50 web
  exit 1
fi

# 6. Cleanup dangling Docker build caches
echo "🧹 Pruning old Docker images..."
docker image prune -f --filter "until=48h" || true

echo "=========================================================="
echo "✅ Deployment succeeded and verified healthy!"
${COMPOSE_CMD} ps
echo "=========================================================="
