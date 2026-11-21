# Monorepo Implementation Playbook

Detailed patterns, configurations, and reference implementations for Turborepo + pnpm workspaces.

---

## 1. Directory Structure

A standard, production-ready monorepo layout:

```
├── apps/
│   ├── web/               # Next.js customer-facing application
│   └── worker/            # Asynchronous background BullMQ / Redis worker
├── packages/
│   ├── core/              # Shared business logic, domain models, validation schemas
│   ├── db/                # Drizzle ORM schema, migrations, database client
│   └── config/            # Shared ESLint, Prettier, Tailwind, and TSConfigs
├── package.json           # Root workspace scripts and devDependencies
├── pnpm-workspace.yaml    # Monorepo workspace definition
├── turbo.json             # Turborepo task pipeline and caching rules
└── tsconfig.base.json     # Root base TypeScript settings
```

---

## 2. Workspace Configuration (`pnpm-workspace.yaml`)

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

---

## 3. Turborepo Configuration (`turbo.json`)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

---

## 4. Shared Package Pattern (Example: `@herrglow/core`)

### `packages/core/package.json`
```json
{
  "name": "@herrglow/core",
  "version": "0.1.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./*": "./src/*.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@herrglow/tsconfig": "workspace:*",
    "typescript": "^5.7.0"
  }
}
```

---

## 5. Clean Commands Reference

- Add dependency to a specific package:
  `pnpm --filter @herrglow/web add framer-motion`
- Add devDependency to workspace root:
  `pnpm add -Dw prettier`
- Run typecheck across all workspaces:
  `pnpm turbo run typecheck`
- Clean all build outputs and node_modules:
  `git clean -xdf -e .env*`
