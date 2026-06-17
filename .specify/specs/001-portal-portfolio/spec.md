# Spec 001 — Portal Field Portfolio

**Status:** Draft → ready for autonomous build
**Owner:** Priyank
**Constitution:** [../../memory/constitution.md](../../memory/constitution.md)

## Summary

A WebGPU/WebGL2 portfolio web app. The landing experience is an interactive 3D **portal field** — an
abstract GPU particle/shader field with glowing portal nodes. Each portal represents a project.
Selecting a portal flies the camera in and reveals that project's dedicated **3D scene plus an
overlaid, animated 2D content panel**. The UI is beautiful, fluid (Motion-driven), and fully
responsive.

## Goals

- Showcase varied projects/features/components, each as an immersive "view."
- Demonstrate modern web graphics: WebGPU with automatic WebGL2 fallback, TSL shaders.
- Make adding a project trivial (registry-driven).
- Hands-off, gated, spec-driven build.

## Non-goals (out of scope v1)

- CMS/backend, auth, or a database (content is static/in-repo).
- Multiplayer/real-time collaboration.
- Native/mobile app packaging.
- SEO-critical SSR (SPA is acceptable; revisit if needed).

## Users & stories

- **US-1 (Visitor):** As a visitor I land on the portal field and immediately understand I can click
  glowing portals to explore projects.
- **US-2 (Visitor):** As a visitor, clicking a portal smoothly flies me into the project with its 3D
  scene and readable 2D info; I can go back to the hub.
- **US-3 (Visitor on weak hardware / old browser):** The site still works (WebGL2) or tells me clearly
  if it can't render.
- **US-4 (Mobile visitor):** The experience is usable and beautiful on a phone (touch, responsive).
- **US-5 (Owner / Priyank):** I can add a new project with one registry entry + a folder, no core
  edits.
- **US-6 (Reduced-motion user):** Motion is minimized per my OS preference, in both 2D and 3D.

## Functional requirements

- **FR-001** Single persistent `<Canvas>` using `WebGPURenderer` with automatic WebGL2 fallback.
- **FR-002** Detect and expose the active backend (`webgpu`/`webgl`) in UI (badge) and store.
- **FR-003** `?webgl` URL flag forces the WebGL2 path for testing.
- **FR-004** Hub renders an animated TSL particle field + one glowing portal per registry project.
- **FR-005** Portals respond to hover (highlight/scale) and click/tap (navigate to `/project/:id`).
- **FR-006** Routing: `/` (hub) and `/project/:id`; deep links work; browser back/forward sync.
- **FR-007** Selecting a project flies the camera in, warps/fades the field, and mounts the project's
  lazy 3D scene; reversing returns to the hub.
- **FR-008** Each project renders its own 3D `Scene` (in Canvas) and 2D `Content` (DOM overlay),
  both code-split (`React.lazy`).
- **FR-009** 2D layer uses Motion for route/element transitions, synchronized with the camera fly.
- **FR-010** Portal glow via three's **node-based** PostProcessing + TSL bloom (both backends).
- **FR-011** Registry (`projects/registry.ts`) is the single source of truth for portals + routes.
- **FR-012** Invalid project id shows a graceful "not found" without crashing.
- **FR-013** Backend-aware quality scaling (particle count, DPR, bloom) between WebGPU and WebGL2.
- **FR-014** Non-WebGL fallback: a static message if neither backend initializes.

## Non-functional requirements

- **NFR-Perf:** see Constitution IV (fps, bundle, no leaks/allocations).
- **NFR-Sec:** see Constitution V (`npm audit` clean, no unsafe HTML, no secrets).
- **NFR-A11y/Responsive:** see Constitution VI (360px→4K, reduced-motion, keyboard, contrast).
- **NFR-Quality:** TS strict, no `any` leaks across module boundaries, DRY, registry abstraction holds.
- **NFR-Parity:** WebGPU and WebGL2 both render an equivalent experience.

## Acceptance criteria (definition of done)

1. `npm run dev` boots; hub shows animated field + portals; backend badge correct.
2. `?webgl` renders an equivalent scene on WebGL2.
3. Clicking a portal flies in, loads 3D + animated 2D content; back returns to hub; URLs sync.
4. Deep-linking `/project/<id>` works; bad id handled gracefully.
5. Adding a sample project = 1 registry entry + folder; new portal appears automatically.
6. `npm run build` + `tsc` clean; project chunks are code-split.
7. All 7 quality gates pass (perf, efficiency, security, correctness, parity, a11y, spec-alignment).
8. Responsive 360px→4K + portrait; reduced-motion honored in 2D and 3D.

## Open questions (resolve in clarify pass — see orchestration.md)

- Q1: Real project list & content, or proceed with 3 placeholder demos? (default: placeholders)
- Q2: Portal layout for N projects — ring / sphere / Fibonacci-sphere? (default: Fibonacci sphere)
- Q3: Deploy target (Vercel / Netlify / GitHub Pages / other)? (affects SPA-fallback config)
- Q4: Color/brand direction (accent palette, dark only or light mode too)? (default: dark, cyan/violet)
- Q5: Include a dev-only `leva` debug panel? (default: yes, dev-only)