# HerrGlow

Monorepo: website, admin, customer/partner apps, and the .NET 9 API. See the master plan for scope.

```
api/        .NET 9 modular monolith (Catalog, Locations, Leads, Bookings, Pros, Payments, Content, Media, Notifications, Identity)
apps/       web (Next.js), admin (Next.js), customer-app, partner-app (Expo)
packages/   api-client (generated from OpenAPI), ui (design tokens)
infra/      docker-compose (Postgres, Redis), import scripts, redirect map
docs/       P0 checklist, URL inventory, decisions
```

## Dev

```
pnpm infra:up      # Postgres :5432, Redis :6379
```

## Rules

- Never commit SQL dumps or exports (`.gitignore` blocks them). The legacy dump contains an SMTP password, password hashes and customer PII.
- Passwords are not migrated; users re-login via OTP.
