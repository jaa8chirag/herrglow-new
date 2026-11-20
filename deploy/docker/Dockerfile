# syntax=docker/dockerfile:1
# Build from the repo root:
#   docker build -f deploy/docker/Dockerfile --target web    -t herrglow-web .
#   docker build -f deploy/docker/Dockerfile --target worker -t herrglow-worker .
# The worker image also runs migrations and maintenance scripts (it contains the full workspace).

FROM node:22-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g pnpm@12.6.0
# build and tools run as the unprivileged "node" user so pnpm can always write its own tree
RUN mkdir -p /app && chown node:node /app
WORKDIR /app
USER node
ENV NEXT_TELEMETRY_DISABLED=1 npm_config_verify_deps_before_run=false

# ───── dependencies (cached until a manifest changes) ─────
FROM base AS deps
COPY --chown=node:node pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY --chown=node:node apps/web/package.json apps/web/
COPY --chown=node:node apps/worker/package.json apps/worker/
COPY --chown=node:node packages/db/package.json packages/db/
COPY --chown=node:node packages/core/package.json packages/core/
COPY --chown=node:node packages/ui/package.json packages/ui/
RUN pnpm install --frozen-lockfile

# ───── sources + generated Prisma client ─────
FROM deps AS source
COPY --chown=node:node . .
RUN pnpm --filter @herrglow/db generate

# ───── web build (needs NO database: all site routes render per request) ─────
FROM source AS build-web
# NEXT_PUBLIC_* values are baked into the client bundle: build one image per environment.
ARG NEXT_PUBLIC_CF_RESIZING=false
# DEPLOY_ENV / ALLOW_INDEXING are only used here, by the build-time SEO guard test: a production build with
# ALLOW_INDEXING != true FAILS, so a misconfigured deploy can never ship a site-wide noindex. (Runtime reads them again.)
ARG DEPLOY_ENV=
ARG ALLOW_INDEXING=
ENV NEXT_PUBLIC_CF_RESIZING=$NEXT_PUBLIC_CF_RESIZING DEPLOY_ENV=$DEPLOY_ENV ALLOW_INDEXING=$ALLOW_INDEXING
RUN pnpm --filter @herrglow/web build

# ───── runtime: web (Next standalone) ─────
FROM node:22-slim AS web
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY --from=build-web --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=build-web --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build-web --chown=node:node /app/apps/web/public ./apps/web/public
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "apps/web/server.js"]

# ───── runtime: worker / tools (migrations, create-admin, sync-pages …) ─────
FROM source AS worker
ENV NODE_ENV=production
CMD ["pnpm", "--filter", "@herrglow/worker", "start"]
