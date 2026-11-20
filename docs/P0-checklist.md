# P0 checklist

## Done
- [x] Monorepo skeleton, pnpm workspace, .gitignore (blocks dumps/secrets)
- [x] infra/docker-compose.yml (Postgres 17, Redis 7)

## Blocked on you (Appendix B)
- [ ] Rotate the Gmail app password for info@glowmakeover.co.in (it is in the shared dump)
- [ ] Is glowmakeover.co.in still live? Does it redirect to herrglow.com?
- [ ] Business WhatsApp number
- [ ] Confirm backend: .NET 9 (default) vs NestJS. The .NET SDK is NOT installed on this machine yet.
- [ ] Run Appendix A in the Laravel project and provide audit-pack.zip

## Next (once the above is in)
- [ ] Install .NET 9 SDK; scaffold api/ solution with module projects
- [ ] Scaffold apps/web and apps/admin (Next.js, Tailwind)
- [ ] Design tokens in packages/ui (ivory/blush base, plum accent, Fraunces + Inter)
- [ ] Import script MySQL -> Postgres (no password hashes, PII handled)
- [ ] URL inventory + 301/410 redirect map
