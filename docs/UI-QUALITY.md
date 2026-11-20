# UI quality gates (UI-8)

Measured on a **production build** (`next build` + standalone server, indexing on, as in production), Lighthouse **mobile**
(simulated slow 4G, 4x CPU slowdown). Script: `pnpm tsx scripts/lighthouse.ts http://localhost:3300 / /services/hd-bridal-makeup /makeup-artist-in-noida`.

| Page | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| Home | 86 / 87 / 92 (3 warm runs) | 100 | 100 | 100 | 0.8–1.0 s | 0 | 350–550 ms |
| Service (HD Bridal Makeup) | 87 | 100 | 100 | 100 | 0.8 s | 0 | 510 ms |
| City hub (Noida) | 92 | 100 | 100 | 100 | 1.8 s | 0 | 300 ms |

Caveats, stated plainly
- The **first request after a server restart is slower** (cold Next + database connection): the very first run scored 60 to 73. In production Cloudflare caches public HTML (`s-maxage=300`), so visitors rarely hit a cold render. Warm the origin after each deploy (`curl` the 3 key pages) before measuring.
- Run-to-run variance on one machine is ±5 points. The headline numbers above are warm, repeated runs.
- Measured on `http://localhost`; on the HTTPS production domain "uses HTTPS" also passes.
- Images: there are no real photos yet, so these runs use the designed fallbacks. Real photos add weight; they go through Cloudflare Image Resizing (WebP/AVIF, sized `srcset`), and above-the-fold images use `priority` + correct `sizes`. Re-measure after the media import.

Other gates (checked by script, all passing)
- No horizontal overflow on 13 page types at 360, 390, 768, 1024 and 1440 px.
- `prefers-reduced-motion`: no hidden reveals, no running animations, no 3D canvas, no smooth-scroll library.
- 3D hero element: loads only on desktop (≥ 1024px, fine pointer, no data-saver) after the page is idle; absent on mobile; paused when off-screen.
- Server-rendered HTML for every page (h1, links and JSON-LD present in the raw response). SEO tests: 19/19. Real 404 / 410 status codes preserved.

What made the difference (so it stays fixed)
1. Above-the-fold reveals are **CSS-only** (`Rise`), so the headline is never hidden waiting for JavaScript.
2. The grain overlay is a **0.8 KB PNG tile**; the earlier SVG-filter version was slow and was even picked as the LCP element.
3. Scroll reveals use **one shared IntersectionObserver** (no animation component per element), and the animation library loads lazily (`LazyMotion`).
4. Smooth scroll (Lenis) and the 3D scene are **dynamic imports** that only run when useful.
5. A route-level `loading.tsx` was rejected: it turned real 404s into HTTP 200 (soft 404s). Skeletons live inside listing pages only.
