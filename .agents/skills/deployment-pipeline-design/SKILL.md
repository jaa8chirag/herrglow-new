---
name: deployment-pipeline-design
description: Design multi-stage CI/CD pipelines with approval gates, security checks, and deployment orchestration. Use when architecting deployment workflows, setting up continuous delivery, or implementing GitOps practices.
metadata:
  model: inherit
---

# Deployment Pipeline Design

Architecture patterns for multi-stage CI/CD pipelines with approval gates, automated testing guards, and progressive deployment strategies.

## Do not use this skill when

- The task is unrelated to CI/CD or deployment pipeline design
- You need a different domain or tool outside this scope

## Instructions

- Clarify goals, target environments (Staging, Production), and hosting providers (Vercel, Docker, Coolify, Railway, AWS).
- Apply relevant best practices (fast fail, caching, secret isolation, approval gates, health checks).
- Provide actionable workflows and automated verification.

## Purpose

Design robust, secure deployment pipelines that balance release velocity with safety through proper stage organization, automated guards, and approval workflows.

## Use this skill when

- Designing CI/CD architectures for GitHub Actions or GitLab CI
- Implementing automated quality gates (TypeCheck, SEO test guards, Linters)
- Configuring multi-environment pipelines with manual approval gates
- Establishing zero-downtime deployment strategies (Rolling, Blue-Green, Canary)
- Implementing post-deployment health verification and automated rollback

## Standard Pipeline Flow

```
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐   ┌──────────────┐   ┌──────────────────┐
│  Lint & Check   │ → │   Tests & SEO   │ → │ Staging Deploy  │ → │ Approval Gate│ → │Production Deploy │
└─────────────────┘   └─────────────────┘   └─────────────────┘   └──────────────┘   └──────────────────┘
```

## Detailed Stage Breakdown

1. **Source & Cache**: Fast checkout with pnpm and Turborepo dependency caching.
2. **Type Safety & Schema**: Database client generation (Prisma / Drizzle) and strict monorepo typecheck.
3. **Automated Guard Tests**: Unit tests and SEO automated guard checks (`pnpm test:seo`).
4. **Build & Package**: Next.js production build (`next build`) and container packaging.
5. **Staging Deploy**: Deploy to staging environment with preview URLs.
6. **Approval Gate**: GitHub environment protection rules requiring team review before production.
7. **Production Deploy**: Zero-downtime progressive deployment with `ALLOW_INDEXING=true`.
8. **Post-Deploy Health Check**: Automated HTTP health check verifying `/api/v1/health` and critical routes.
9. **Rollback**: Instant rollback on failure.

## Resources

- [Implementation Playbook](file://./resources/implementation-playbook.md) for complete GitHub Actions workflows, environment configurations, and Docker multi-stage build templates.
