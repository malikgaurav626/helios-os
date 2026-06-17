# WebGPU/WebGL Portfolio Showcase — Planning Docs

A 3D **portal field** portfolio. The landing scene is an abstract GPU particle/shader field with
glowing portal nodes; each portal is a project. Clicking a portal flies the camera in and loads that
project's **own 3D scene + overlaid 2D content**. Runs on **WebGPU where available, falls back to
WebGL2** automatically, with shaders written once in **TSL**.

> These are planning/spec docs for **manual implementation**. Each numbered file is a phase with
> concrete steps, key snippets, gotchas, and a checklist. Work them in order.

## Index

| # | Doc | What it covers |
|---|---|---|
| — | [00-architecture.md](./00-architecture.md) | Stack, folder layout, the 5 key architectural decisions |
| 1 | [01-setup.md](./01-setup.md) | Scaffold Vite + React + TS, deps, Tailwind v4, path alias |
| 2 | [02-renderer-webgpu.md](./02-renderer-webgpu.md) | WebGPURenderer + WebGL2 fallback, `extend`, async `gl`, capability detect |
| 3 | [03-app-shell-routing.md](./03-app-shell-routing.md) | Persistent Canvas, router, Zustand store, two-layer layout |
| 4 | [04-hub-portal-field.md](./04-hub-portal-field.md) | TSL particle field, portal nodes, hover/click → navigate |
| 5 | [05-project-system.md](./05-project-system.md) | Project registry, lazy 3D scene + 2D content, one demo end-to-end |
| 6 | [06-transitions.md](./06-transitions.md) | Camera fly, field warp/fade, scene swap, back nav |
| 7 | [07-postprocessing-polish.md](./07-postprocessing-polish.md) | Node-based bloom (both backends), DPR, perf scaling, badges |
| 8 | [08-scale-deploy.md](./08-scale-deploy.md) | More projects, build config, static deploy |
| 9 | [09-ui-motion.md](./09-ui-motion.md) | Motion (Framer Motion): route/element transitions, responsive, dynamic UI |

## Spec-Driven Development layer (`.specify/`)

This project is built **Spec Kit style** with autonomous, gated implementation. The `docs/` files
above are the human-readable *how*; the `.specify/` files are the machine-followable *spec, tasks,
and quality gates* that drive a hands-off build.

| File | Role |
|---|---|
| [.specify/memory/constitution.md](../.specify/memory/constitution.md) | Non-negotiable principles + the quality gates every task must pass |
| [.specify/specs/001-portal-portfolio/spec.md](../.specify/specs/001-portal-portfolio/spec.md) | Functional spec: user stories, requirements, acceptance criteria |
| [.specify/specs/001-portal-portfolio/plan.md](../.specify/specs/001-portal-portfolio/plan.md) | Technical plan (links into `docs/`) + constitution check |
| [.specify/specs/001-portal-portfolio/tasks.md](../.specify/specs/001-portal-portfolio/tasks.md) | Ordered, dependency-tagged tasks; each names its gating loops |
| [.specify/quality-gates.md](../.specify/quality-gates.md) | The 7 feedback loops (performance, efficiency, security, correctness, parity, a11y, spec-alignment) |
| [.specify/orchestration.md](../.specify/orchestration.md) | How the autonomous build runs hands-off + how to start it |
| [.specify/workflows/autonomous-build.workflow.js](../.specify/workflows/autonomous-build.workflow.js) | Runnable orchestration script (implement → gate → fix loops) |

**To start the hands-off build:** see [orchestration.md](../.specify/orchestration.md) → *Kickoff*.
All decisions are front-loaded into a clarify pass, so once it starts you only answer the occasional
agent question.

## How navigation works (the core idea)

```
Browser URL  ──▶  React Router  ──▶  Zustand store (activeProjectId, phase)
                                          │
                 ┌────────────────────────┴───────────────────────┐
                 ▼                                                  ▼
   3D layer (ONE persistent <Canvas>)                 2D layer (DOM <Outlet>)
   - hub portal field                                 - nav / back / backend badge
   - camera flies to active portal                    - active project's 2D content
   - lazy-mounts active project's 3D scene            (overlays the canvas)
```

The Canvas **never unmounts** between routes — re-initializing a WebGPU context is expensive and we
want continuous camera transitions. The route only changes *what the persistent scene shows*.

## Status / decisions locked

- Hub concept: **abstract portal field** (GPU particles + glowing portals)
- Project view: **mixed 3D + 2D content**
- Language: **TypeScript**
- Styling: **Tailwind CSS v4**

## Verified-current note (June 2026)

Approach validated against R3F **v9** (async `gl` factory) and three **r171+** `WebGPURenderer`
(auto WebGL2 fallback, TSL → WGSL/GLSL). Safari 26 shipped WebGPU (Sept 2025), so all major browsers
support the WebGPU path; WebGL2 covers the rest.

References:
- R3F v9 migration: https://r3f.docs.pmnd.rs/tutorials/v9-migration-guide
- R3F + WebGPU + TSL: https://blog.pragmattic.dev/react-three-fiber-webgpu-typescript
- three WebGPURenderer: https://threejs.org/manual/en/webgpurenderer.html
- WebGPU migration checklist: https://www.utsubo.com/blog/webgpu-threejs-migration-guide