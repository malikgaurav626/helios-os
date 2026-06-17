# 08 — Scale & deploy

Goal: prove the registry pattern with a few real projects, then ship a static build.

## Add more projects

For each new project:
1. Add an entry to `PROJECTS` in `src/projects/registry.ts` (id, title, blurb, accent,
   `portalPosition`, lazy `Scene`, lazy `Content`).
2. Create `src/projects/<id>/Scene.tsx` (default export, 3D) and `Content.tsx` (default export, 2D).
3. That's it — the hub renders a new portal and `/project/<id>` works automatically.

**Portal layout:** as the count grows, generate `portalPosition` programmatically (ring, sphere,
Fibonacci sphere, or grid) instead of hand-placing. Keep a helper in `lib/` if you go this route.

Ideas to showcase varied work (each is just a project):
- A pure shader/TSL piece (3D-heavy, minimal 2D).
- A case study (2D-heavy: text, images, links; simple 3D backdrop).
- An interactive demo with `leva` controls wired to TSL uniforms.

## Build config

```bash
npm run build      # vite build -> dist/
npm run preview    # serve dist/ locally to sanity-check the production bundle
```

- Confirm **code-splitting**: each project should be its own chunk in `dist/assets/` (from
  `React.lazy`). The hub bundle stays small.
- If a CDN/subpath host is used, set Vite `base` accordingly.
- Source maps: enable `build.sourcemap` while stabilizing, disable for final.

## Routing on static hosts (SPA fallback)

`react-router` `createBrowserRouter` uses real paths, so deep links like `/project/foo` need the
host to serve `index.html` for unknown routes:

- **Netlify**: `public/_redirects` → `/*  /index.html  200`
- **Vercel**: `vercel.json` rewrite all to `/index.html` (or use the SPA preset)
- **GitHub Pages**: set Vite `base: '/<repo>/'` and add a `404.html` SPA shim, or use hash routing
- **Cloudflare Pages / static S3**: configure the SPA/200 fallback to `index.html`

## Pre-ship checklist

- [ ] `npm run build` succeeds with no type errors (`tsc` clean)
- [ ] `npm run preview` works; WebGPU **and** `?webgl` both render
- [ ] Deep-linking `/project/<id>` directly loads correctly (SPA fallback configured)
- [ ] Each project loads as a separate chunk (Network tab)
- [ ] Lighthouse/manual check: first paint fast, no console errors, no memory growth on repeated
      hub ↔ project navigation (watch for leaked geometries/materials — dispose in effect cleanups)
- [ ] Tested in: Chrome/Edge (WebGPU), Safari 26+ (WebGPU), and a forced WebGL2 pass

## Nice-to-haves (backlog)

- Deep-link to a specific camera framing per project.
- URL-driven quality flag (`?webgl`, maybe `?quality=low`) for demos on weak hardware.
- Preload the next likely project's chunk on portal hover (`import()` warm-up).
- Analytics on which portals get clicked.
- Shared `dispose()` audit util to catch leaked GPU resources during dev.