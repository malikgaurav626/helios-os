# Tasks 001 — Portal Field Portfolio

**Spec:** [spec.md](./spec.md) · **Plan:** [plan.md](./plan.md) · **Gates:** [../../quality-gates.md](../../quality-gates.md)

Legend: `[P]` = parallelizable with siblings · **Gates** = loops that must pass before the task's
phase is "done" · IDs are stable references for the orchestrator.

> Each task is "done" only when its code exists **and** the listed gates pass for its phase
> (Constitution VII). The autonomous build runs gates at phase boundaries and fix-loops to green.

## Phase 0 — Setup  → gate: Correctness
- **T001** Scaffold Vite `react-ts` into the repo (ignore existing `.claude/.vscode`).
- **T002** Install deps: three, @react-three/fiber@9, @react-three/drei, zustand, react-router-dom@7,
  maath, motion; dev: @types/three, tailwindcss, @tailwindcss/vite, leva.
- **T003** Wire Tailwind v4 (`@tailwindcss/vite`, `@import "tailwindcss"`) + `@` alias (vite + tsconfig).
- **T004** Clean template boilerplate; base dark styles in `styles/index.css`.

## Phase 1 — Renderer (de-risk)  → gates: Cross-backend parity, Correctness, Performance
- **T010** `three/extend.ts` — `extend(THREE)` from `three/webgpu`.
- **T011** `three/rendererFactory.ts` — async `WebGPURenderer` + `init()` + backend detect + `?webgl`.
- **T012** `three/Renderer.tsx` — persistent `<Canvas gl={factory}>`, Suspense, DPR clamp.
- **T013** Smoke-test TSL mesh; verify WebGPU + `?webgl` render equivalently.
- **T014** `lib/capabilities.ts` — WebGPU probe, `?webgl` flag, reduced-motion read.

## Phase 2 — App shell, routing, store  → gates: Correctness, Efficiency
- **T020** `store/useAppStore.ts` — backend, activeProjectId, phase + setters.
- **T021** `routes/router.tsx` — `createBrowserRouter` (`/`, `/project/:id`).
- **T022** `App.tsx` — persistent `<Renderer/>` + 2D overlay `<Outlet/>` (pointer-events strategy).
- **T023** `main.tsx` — `RouterProvider` + Tailwind import.
- **T024** `scenes/SceneRouter.tsx` (hub-only stub). `HubRoute.tsx` / `ProjectRoute.tsx` shells.
- **T025** `[P]` UI stubs: `Nav`, `BackButton`, `BackendBadge`, `Loader`.

## Phase 3 — Hub portal field  → gates: Performance, Cross-backend parity
- **T030** `scenes/hub/tsl/portalField.ts` — TSL field node graph (position + color).
- **T031** `scenes/hub/PortalField.tsx` — instanced field, backend-scaled count.
- **T032** `scenes/hub/Portal.tsx` — hover scale + click→navigate (maath easing).
- **T033** `scenes/hub/HubScene.tsx` — lights + field + `registry.map(Portal)`.

## Phase 4 — Project system  → gates: Efficiency, Correctness
- **T040** `projects/registry.ts` — `ProjectMeta` + `PROJECTS` + `getProject`.
- **T041** `projects/portal-demo/Scene.tsx` (3D, default export, lazy).
- **T042** `projects/portal-demo/Content.tsx` (2D, default export, lazy).
- **T043** Extend `SceneRouter` to mount active project's lazy `Scene` by phase.
- **T044** `ProjectRoute` syncs `:id`→store, renders lazy `Content`; bad-id fallback.

## Phase 5 — Transitions  → gates: Performance, Accessibility
- **T050** `scenes/CameraRig.tsx` — phase-driven camera fly (maath), arrival → `inProject`.
- **T051** Field warp/fade uniform driven by phase.
- **T052** `BackButton` → `exitProject()` + navigate; reverse animation to `idle`.
- **T053** Browser back/forward sync; reduced-motion jump-cut path.

## Phase 6 — Motion / UI  → gates: Accessibility, Efficiency
- **T060** `AnimatePresence` route transitions in `App` synced to camera fly.
- **T061** Staggered content reveal variants; micro-interactions on nav/buttons.
- **T062** Responsive layout (360px→4K, portrait, touch hit-areas); container queries where useful.
- **T063** `useReducedMotion` propagated to 2D + 3D.

## Phase 7 — Postprocessing & polish  → gates: Performance, Parity, Accessibility
- **T070** `scenes/Effects.tsx` — node `PostProcessing` + TSL `bloom`; single render owner.
- **T071** Backend-aware scaling table (count/DPR/bloom) wired to store.
- **T072** `BackendBadge` live; loaders; non-WebGL static fallback (FR-014).

## Phase 8 — Scale & deploy  → gates: Security, ALL gates (final)
- **T080** Add 2 more sample projects (proves registry; programmatic portal layout).
- **T081** Build config; verify code-splitting; source maps toggle.
- **T082** SPA fallback for chosen host; `npm run build` + `preview` green.
- **T083** Final full-gate pass; `npm audit` clean; cross-browser + forced-WebGL check.

## Dependency notes
- Phases are sequential (each builds on the last). Within a phase, `[P]` tasks may run together.
- Gates run **after** each phase; a failing gate blocks the next phase until fixed (fix-loop).
- Phase 8 runs the **entire** gate suite as the release gate.