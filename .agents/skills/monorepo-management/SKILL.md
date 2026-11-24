---
name: monorepo-management
description: Master monorepo management with Turborepo, Nx, and pnpm workspaces to build efficient, scalable multi-package repositories with optimized builds and dependency management. Use when setting up monorepos, optimizing builds, or managing shared dependencies.
metadata:
  model: inherit
---

# Monorepo Management

Build efficient, scalable monorepos that enable code sharing, consistent tooling, and atomic changes across multiple packages and applications.

## Use this skill when

- Managing or structuring Turborepo and pnpm workspace projects
- Adding new shared packages (e.g., `@herrglow/core`, `@herrglow/db`, `@herrglow/config`)
- Optimizing build, lint, and test caching performance (`turbo.json`)
- Managing shared dependencies and workspace protocols (`workspace:*`)
- Implementing code sharing strategies across apps and services
- Setting up CI/CD pipelines and Docker container builds for monorepos
- Debugging dependency resolution, hoisting conflicts, or version mismatches

## Do not use this skill when

- The task is strictly isolated to single-component UI styling without cross-package impact
- The task is unrelated to multi-package repository architecture

## Instructions

1. Clarify goals, constraints, and affected apps/packages.
2. Maintain strict package boundaries and single sources of truth.
3. Use the `workspace:*` protocol for internal package dependencies.
4. Verify task pipelines, cache hashes, and execution via `turbo` and `pnpm`.
5. For in-depth patterns, refer to `resources/implementation-playbook.md`.

## Core Best Practices

### 1. Workspace Dependency Management

- Internal packages should always reference each other via `workspace:*`:
  ```json
  "dependencies": {
    "@herrglow/core": "workspace:*",
    "@herrglow/db": "workspace:*"
  }
  ```
- Keep third-party dependency versions synchronized across workspace packages to avoid duplicate instances (especially React, Next.js, and TypeScript).
- Run package installs and dependency updates from the repository root (`pnpm add <pkg> --filter <target>`).

### 2. Turborepo Pipeline Architecture (`turbo.json`)

- Explicitly define `dependsOn`:
  - `^build` for packages that depend on their dependencies being built first.
- Clearly specify `inputs` and `outputs` for build artifacts to maximize cache hits.
- Define `env` variables that affect task outputs (e.g. `NODE_ENV`, `DATABASE_URL`) to invalidate stale caches safely.

### 3. Shared TypeScript and Linting Configurations

- Export base configs from a shared package (e.g. `packages/config/tsconfig` or `@herrglow/tsconfig`).
- Consumer packages extend the base config:
  ```json
  {
    "extends": "@herrglow/tsconfig/base.json"
  }
  ```

### 4. Verification

- Always test whole-repo integrity using:
  - `pnpm turbo run build` or `pnpm build`
  - `pnpm turbo run typecheck` or `pnpm typecheck`
  - `pnpm turbo run lint` or `pnpm lint`

## Resources

- [Implementation Playbook](file://./resources/implementation-playbook.md) for detailed configuration templates, Docker multistage patterns, and CI scripts.
