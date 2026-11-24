# Deployment Pipeline Implementation Playbook

Production CI/CD workflows for Turborepo, pnpm workspaces, Next.js 16, and background workers.

---

## 1. GitHub Actions CI Workflow (`.github/workflows/ci.yml`)

Runs on every Pull Request and push to development/main branches to validate code quality before merging.

```yaml
name: CI Quality Gate

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  validate:
    name: Lint, Typecheck & SEO Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 12.6.0

      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Prisma Client
        run: pnpm db:generate

      - name: Monorepo Typecheck
        run: pnpm -r run typecheck

      - name: Run SEO Guard Tests
        run: pnpm --filter @herrglow/web test:seo

      - name: Build Web Application
        run: pnpm --filter @herrglow/web build
        env:
          ALLOW_INDEXING: "false"
          NEXT_PUBLIC_SITE_URL: "https://staging.herrglow.com"
```

---

## 2. GitHub Actions Production Deployment (`.github/workflows/deploy.yml`)

Triggered on push to `main` with an environment approval gate.

```yaml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  ci-check:
    name: Run Pre-Flight Validation
    uses: ./.github/workflows/ci.yml

  deploy-production:
    name: Deploy to Production
    needs: [ci-check]
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://herrglow.com
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Trigger Production Deployment
        run: |
          echo "Deploying release ${{ github.sha }} to production..."
          # Deploy via Webhook / Cloudflare / Vercel / SSH / Docker

      - name: Post-Deployment Health Check
        run: |
          for i in {1..12}; do
            STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://herrglow.com/api/v1/health || true)
            if [ "$STATUS" = "200" ]; then
              echo "Health check passed!"
              exit 0
            fi
            echo "Waiting for service to become healthy... attempt $i/12"
            sleep 5
          done
          echo "Health check failed with status $STATUS"
          exit 1
```

---

## 3. Production Environment Secrets Checklist

Ensure the following secrets are configured in GitHub Settings $\rightarrow$ Secrets and Variables $\rightarrow$ Actions:

| Secret Name          | Description                                       | Example / Target                            |
| :------------------- | :------------------------------------------------ | :------------------------------------------ |
| `DATABASE_URL`       | Production PostgreSQL connection string           | `postgresql://user:pass@host:5432/herrglow` |
| `REDIS_URL`          | Production Redis connection string                | `redis://default:pass@host:6379`            |
| `ALLOW_INDEXING`     | Mandatory `true` for production indexing          | `true`                                      |
| `NEXTAUTH_SECRET`    | 32-character random string for Auth cookies       | `openssl rand -base64 32`                   |
| `DEPLOY_WEBHOOK_URL` | Hosting trigger hook (Vercel / Coolify / Railway) | `https://...`                               |
