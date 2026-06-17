# Plan 001 — Portal Field Portfolio (technical)

**Spec:** [spec.md](./spec.md) · **Constitution:** [../../memory/constitution.md](../../memory/constitution.md)
**Detailed how-to:** the [`docs/`](../../../docs/README.md) phase guides are the authoritative
implementation reference; this plan is the bridge from spec → tasks.

## Technical context

- **Language/Runtime:** TypeScript (strict), React 19, Vite, Node 23.
- **3D:** `@react-three/fiber@^9`, `@react-three/drei`, `three` via `three/webgpu`, TSL (`three/tsl`).
- **UI:** Tailwind CSS v4, **Motion** (`motion/react`).
- **State/Routing:** `zustand`, `react-router-dom@7`.
- **Helpers:** `maath` (3D easing), optional `leva` (dev).
- **Renderer:** `WebGPURenderer` + auto WebGL2 fallback; `?webgl` forces fallback.
- **Postprocessing:** three node `PostProcessing` + TSL `bloom` (NOT the WebGL-only `postprocessing`
  libs).

## Constitution check (pre-build)

| Principle | How the plan satisfies it |
|---|---|
| I. Cross-backend parity | Single `WebGPURenderer`; TSL everywhere; `?webgl`; parity gate |
| II. One persistent canvas | Canvas is sibling of `<Outlet/>` in `App`, never in a route |
| III. Registry extensibility | `projects/registry.ts` drives portals + routes; lazy Scene/Content |
| IV. Performance budget | DPR clamp, backend-scaled counts, no per-frame alloc, dispose on unmount |
| V. Security | Static content, `npm audit` gate, no unsafe HTML, pinned deps |
| VI. A11y/responsive | Tailwind breakpoints, `useReducedMotion` (2D+3D), keyboard nav, fallback |
| VII. Spec-driven/verifying | Phase gates: tsc + build + boot + both backends render |
| VIII. Beautiful UI | Motion transitions synced to camera fly; transform/opacity only |

→ No violations. Proceed.

## Project structure

See [docs/00-architecture.md](../../../docs/README.md) for the full `src/` tree. Key dirs: `three/`
(renderer), `scenes/` (hub + SceneRouter + Effects + CameraRig), `projects/` (registry + per-project
Scene/Content), `routes/`, `store/`, `ui/`, `lib/`, `styles/`.

## Phased approach (maps to docs/ and to tasks.md)

| Phase | Doc | Outcome | Primary gates after phase |
|---|---|---|---|
| 0 Setup | [01-setup.md](../../../docs/01-setup.md) | App boots, deps, Tailwind, alias | correctness |
| 1 Renderer | [02-renderer-webgpu.md](../../../docs/02-renderer-webgpu.md) | WebGPU+WebGL2 mesh | parity, correctness, perf |
| 2 Shell/routing | [03-app-shell-routing.md](../../../docs/03-app-shell-routing.md) | Canvas+router+store | correctness, efficiency |
| 3 Hub field | [04-hub-portal-field.md](../../../docs/04-hub-portal-field.md) | Field + portals | perf, parity |
| 4 Project system | [05-project-system.md](../../../docs/05-project-system.md) | Registry + demo | efficiency, correctness |
| 5 Transitions | [06-transitions.md](../../../docs/06-transitions.md) | Camera fly + warp | perf, a11y |
| 6 Motion/UI | [09-ui-motion.md](../../../docs/09-ui-motion.md) | 2D transitions, responsive | a11y, efficiency |
| 7 Postprocess/polish | [07-postprocessing-polish.md](../../../docs/07-postprocessing-polish.md) | Bloom, scaling, badges | perf, parity, a11y |
| 8 Scale/deploy | [08-scale-deploy.md](../../../docs/08-scale-deploy.md) | More projects, build, deploy | security, all gates |

After **every** phase: run the applicable gates (see [quality-gates.md](../../quality-gates.md));
fix-loop until green before advancing.

## Risks & mitigations

- **TSL/three API drift** (export names, BloomNode path) → research agent verifies against the
  installed version before coding; gates catch breakage.
- **R3F v9 `gl` async typing** → `@ts-expect-error` documented; remove when types catch up.
- **Node postprocessing + R3F render-loop ownership** → isolate in `Effects.tsx`, verify single
  render owner (perf/correctness gates).
- **WebGL2 perf of particle field** → backend-scaled counts; parity + perf gates enforce both paths.