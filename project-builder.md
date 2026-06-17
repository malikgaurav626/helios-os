# Portal Field Portfolio — Single-Document Project Bundle

This is a **self-contained bundle** of the entire planning/spec set for the Portal Field Portfolio
(React + Vite + R3F, WebGPU/WebGL2, TSL, Tailwind v4, Motion). Hand this one file to an agent and ask
it to **unpack** it — it will recreate the full file tree, then you can run the autonomous build.

---

## HOW TO UNPACK THIS BUNDLE (instructions for the agent)

This document contains many files concatenated together. Reconstruct them exactly:

1. **Find every delimiter line.** A delimiter is a line that begins with `===FILE===` followed by a
   single space and a repo-relative path, e.g. `===FILE=== docs/README.md`.
2. **A file's content** is every line *after* its delimiter, up to (but not including) the next
   `===FILE===` line — or the end of the document for the last file.
3. **Write each file verbatim** at the given relative path (create directories as needed). Do **not**
   reformat, re-wrap, escape, or alter content — including code fences inside the content. Trim only a
   single trailing newline that this bundle adds between files if present.
4. **Ignore everything before the first `===FILE===` line** (this header is instructions, not a file).
5. After unpacking, the project root should match the **manifest** below. Then follow
   `docs/README.md` and `.specify/orchestration.md` to start the build.

> The delimiter token `===FILE===` was verified not to occur inside any bundled file, so it is safe
> to split on. Paths use forward slashes; create them relative to the project root.

### Manifest (18 files)

```
docs/README.md
docs/00-architecture.md
docs/01-setup.md
docs/02-renderer-webgpu.md
docs/03-app-shell-routing.md
docs/04-hub-portal-field.md
docs/05-project-system.md
docs/06-transitions.md
docs/07-postprocessing-polish.md
docs/08-scale-deploy.md
docs/09-ui-motion.md
.specify/memory/constitution.md
.specify/specs/001-portal-portfolio/spec.md
.specify/specs/001-portal-portfolio/plan.md
.specify/specs/001-portal-portfolio/tasks.md
.specify/quality-gates.md
.specify/orchestration.md
.specify/workflows/autonomous-build.workflow.js
```

### Quick start after unpacking
1. Read `docs/README.md` (overview) and `.specify/memory/constitution.md` (rules).
2. Answer the clarify questions in `.specify/specs/001-portal-portfolio/spec.md` → *Open questions*.
3. Run the autonomous build per `.specify/orchestration.md` → *Kickoff*.

---

<!-- BUNDLED FILES BEGIN BELOW THIS LINE -->

===FILE=== docs/README.md
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

===FILE=== docs/00-architecture.md
# 00 — Architecture

## Tech stack

| Concern | Choice | Notes |
|---|---|---|
| Build | Vite + `@vitejs/plugin-react` | `react-ts` template |
| UI | React 19 + TypeScript (strict) | |
| 3D | `@react-three/fiber@^9`, `@react-three/drei` | v9 required for async `gl` |
| Renderer | `three` via **`three/webgpu`** entry | `WebGPURenderer`, auto WebGL2 fallback |
| Shaders | **TSL** (`three/tsl`) | one source → WGSL (WebGPU) or GLSL (WebGL2) |
| Routing | `react-router-dom@7` | drives the "active project" |
| State | `zustand` | `activeProjectId`, transition `phase`, detected `backend` |
| Styling | **Tailwind CSS v4** + `@tailwindcss/vite` | 2D overlays / project pages |
| UI motion | **`motion`** (Framer Motion) | `motion/react` — route/element transitions, gestures, layout, `useReducedMotion` |
| Easing | `maath` | camera/transition easing in `useFrame` (3D); `motion` handles 2D/DOM |
| Debug (opt) | `leva` | dev-only tweak panel |

## The 5 key decisions

### 1. One persistent `<Canvas>` for the whole app
A single full-screen Canvas lives **above** the router outlet and never unmounts. WebGPU context
init is expensive and we want continuous camera transitions between hub ↔ project. The route changes
only *what the scene shows*, never remounts the Canvas.

### 2. Two layers, both driven by the router
- **3D layer** = the persistent Canvas (hub portal field + lazy-mounted project scenes).
- **2D layer** = DOM overlay via react-router `<Outlet>` (nav, back, backend badge, each project's
  2D content). Use drei `<Html>` only for labels that must track a 3D position.

### 3. `extend(THREE)` from `three/webgpu`
R3F's JSX reconciler must point at the WebGPU namespace so node-material elements resolve. Import
everything 3D from **`three/webgpu`**, not `three`. See [02-renderer-webgpu.md](./02-renderer-webgpu.md).

### 4. Async `gl` factory + capability detection
Create `WebGPURenderer`, `await renderer.init()`, read the backend, store `"webgpu" | "webgl"`.
A `?webgl` URL flag sets `forceWebGL: true` to test the fallback on capable machines.

### 5. Project = 1 registry entry + 2 lazy components
`projects/registry.ts` is the single source of truth. The portal field **and** the routes are both
generated from it. Adding a project = one registry entry + a folder with `Scene.tsx` (3D) and
`Content.tsx` (2D), both `React.lazy`.

## Folder layout

```
src/
  main.tsx                     # React root + RouterProvider + Tailwind import
  App.tsx                      # Layout: persistent <Renderer/> (3D) + <Outlet/> (2D)
  three/
    extend.ts                  # extend(THREE) from 'three/webgpu' (side-effect import)
    rendererFactory.ts         # async gl factory -> WebGPURenderer + init + backend detect
    Renderer.tsx               # <Canvas gl={factory}> wrapper, Suspense, frameloop, dpr
  store/
    useAppStore.ts             # zustand: activeProjectId, phase, backend, setters
  projects/
    registry.ts                # PROJECTS: ProjectMeta[]  (single source of truth)
    portal-demo/
      Scene.tsx                # 3D content (lazy)
      Content.tsx              # 2D content (lazy)
  scenes/
    hub/
      HubScene.tsx             # PortalField + maps registry -> <Portal/>
      PortalField.tsx          # GPU particle field (TSL)
      Portal.tsx               # one clickable/hoverable portal node
      tsl/portalField.ts       # TSL node shaders / compute for the field
    SceneRouter.tsx            # inside Canvas: hub vs active project's lazy Scene
    Effects.tsx                # node PostProcessing + TSL bloom (both backends)
    CameraRig.tsx              # camera fly/transition logic (reads store phase)
  routes/
    router.tsx                 # createBrowserRouter: '/', '/project/:id'
    HubRoute.tsx               # 2D layer for hub
    ProjectRoute.tsx           # 2D layer: sync :id -> store, render lazy Content
  ui/
    Nav.tsx  BackButton.tsx  BackendBadge.tsx  Loader.tsx
  lib/
    capabilities.ts            # WebGPU probe, ?webgl flag, dpr helpers
    transitions.ts             # easing constants / phase timing
  styles/index.css             # Tailwind v4 entry (@import "tailwindcss")
vite.config.ts
tsconfig*.json
```

## Transition phases (store `phase`)

```
idle ──click──▶ entering ──(camera arrives)──▶ inProject
  ▲                                                │
  └──────────── exiting ◀────── back nav ──────────┘
```

- `idle` — hub interactive, portal field full strength.
- `entering` — camera flying to portal, field warping/fading, project scene mounting (Suspense).
- `inProject` — project 3D + 2D content active.
- `exiting` — reverse; camera returns, project unmounts, field restores.

See [06-transitions.md](./06-transitions.md).

===FILE=== docs/01-setup.md
# 01 — Setup (scaffold, deps, Tailwind, alias)

Goal: a running Vite + React + TS app with all dependencies, Tailwind v4, and a `@` path alias.

## 1. Scaffold

The dir already contains `.claude/` and `.vscode/`, so the Vite scaffolder will warn that it's not
empty — choose **"Ignore files and continue"**.

```bash
npm create vite@latest . -- --template react-ts
npm install
```

## 2. Dependencies

```bash
# runtime
npm install three @react-three/fiber @react-three/drei zustand react-router-dom maath

# types
npm install -D @types/three

# styling (Tailwind v4)
npm install tailwindcss @tailwindcss/vite

# optional dev-only debug panel
npm install -D leva
```

Pin expectations: `@react-three/fiber` must be **v9+** (async `gl`). `three` should be **r171+**
(WebGPURenderer auto-fallback). `react-router-dom` **v7**.

## 3. Tailwind v4 wiring

`vite.config.ts` — add the Tailwind plugin and the `@` alias:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

`src/styles/index.css`:

```css
@import "tailwindcss";

html, body, #root { height: 100%; margin: 0; background: #05060a; color: #e8eaf0; }
```

Import it once in `src/main.tsx`: `import '@/styles/index.css'`.

## 4. TypeScript path alias

In `tsconfig.json` (or `tsconfig.app.json`, wherever `compilerOptions` lives) add:

```jsonc
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

Keep `"strict": true`.

## 5. Clean the template

- Delete `src/App.css`, the Vite/React boilerplate in `src/App.tsx`, and the demo SVG assets.
- Leave `src/main.tsx` (you'll rewrite it in [03-app-shell-routing.md](./03-app-shell-routing.md)).

## Checklist

- [ ] `npm run dev` serves a blank dark page with no console errors
- [ ] `@/...` imports resolve in both Vite and the TS language server
- [ ] A Tailwind class (e.g. `className="text-red-500"`) visibly applies
- [ ] `three`, `@react-three/fiber@9`, `react-router-dom@7` present in `package.json`

## Gotchas

- If `@/` resolves at runtime but the editor shows red squiggles, the alias is in `vite.config.ts`
  but missing from `tsconfig`. Both are required.
- `path` import needs Node types — they ship with `@types/node` (often already present via Vite). If
  TS complains about `__dirname`/`node:path`, `npm install -D @types/node`.

===FILE=== docs/02-renderer-webgpu.md
# 02 — Renderer foundation (WebGPU + WebGL2 fallback)

**De-risk this first.** Get a single TSL-material mesh rendering on WebGPU, and confirm `?webgl`
falls back to WebGL2 rendering the same thing. Everything else builds on this.

## Files

### `src/three/extend.ts`
Point R3F's reconciler at the WebGPU namespace. Side-effect import — must run before any Canvas.

```ts
import { extend } from '@react-three/fiber'
import * as THREE from 'three/webgpu'

extend(THREE as any) // registers node-material JSX elements (e.g. <meshStandardNodeMaterial/>)
```

### `src/three/rendererFactory.ts`
Async factory passed to `<Canvas gl={...}>`. Creates the renderer, awaits init, records the backend.

```ts
import * as THREE from 'three/webgpu'
import { useAppStore } from '@/store/useAppStore'

export const glFactory = async (props: any) => {
  const forceWebGL = new URLSearchParams(location.search).has('webgl')
  const renderer = new THREE.WebGPURenderer({ ...props, forceWebGL, antialias: true })
  await renderer.init()

  const isWebGPU = Boolean((renderer.backend as any)?.isWebGPUBackend)
  useAppStore.getState().setBackend(isWebGPU ? 'webgpu' : 'webgl')
  console.info(`[renderer] backend = ${isWebGPU ? 'webgpu' : 'webgl'}`)

  return renderer
}
```

> The store import here is a forward reference — `useAppStore` is created in
> [03-app-shell-routing.md](./03-app-shell-routing.md). For a Phase-1 smoke test you can temporarily
> just `console.info` the backend and add the store call later.

### `src/three/Renderer.tsx`
The persistent Canvas wrapper.

```tsx
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import '@/three/extend'
import { glFactory } from '@/three/rendererFactory'
import { SceneRouter } from '@/scenes/SceneRouter'

export function Renderer() {
  return (
    <Canvas
      // @ts-expect-error R3F v9 async gl factory returning WebGPURenderer
      gl={glFactory}
      frameloop="always"
      dpr={[1, 2]}
      camera={{ position: [0, 0, 8], fov: 50 }}
      className="fixed inset-0 -z-10"
    >
      <Suspense fallback={null}>
        <SceneRouter />
      </Suspense>
    </Canvas>
  )
}
```

## Phase-1 smoke test scene

Before the SceneRouter exists, drop a temporary spinning mesh with a **TSL** material to prove
cross-backend shading:

```tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three/webgpu'
import { Fn, positionLocal, sin, time, vec3 } from 'three/tsl'

export function SmokeTest() {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((_, dt) => { ref.current.rotation.y += dt * 0.4 })

  const colorNode = Fn(() => vec3(0.4, 0.7, 1.0).mul(sin(time).mul(0.5).add(0.5)))()

  return (
    <>
      <mesh ref={ref}>
        <icosahedronGeometry args={[2, 4]} />
        {/* node material from three/webgpu, registered via extend */}
        <meshBasicNodeMaterial colorNode={colorNode} />
      </mesh>
    </>
  )
}
```

## Capability helper — `src/lib/capabilities.ts`

```ts
export const forceWebGLFromUrl = () =>
  typeof location !== 'undefined' && new URLSearchParams(location.search).has('webgl')

export const supportsWebGPU = () =>
  typeof navigator !== 'undefined' && 'gpu' in navigator
```

## Checklist

- [ ] Chrome (or Edge/Safari 26+): console logs `backend = webgpu`, mesh renders + animates
- [ ] `http://localhost:5173/?webgl` logs `backend = webgl`, **identical** visual output
- [ ] No "unknown JSX element `meshBasicNodeMaterial`" — means `extend` ran (import order correct)
- [ ] Resizing the window keeps the scene crisp (DPR clamp working)

## Gotchas

- **Import from `three/webgpu`, never `three`.** Mixing the two namespaces causes node materials to
  be unregistered or instanceof checks to fail.
- **TSL functions come from `three/tsl`** (`Fn`, `vec3`, `uv`, `time`, `positionLocal`, `mix`, …).
- The `// @ts-expect-error` on `gl` is currently needed because R3F's `gl` prop type doesn't yet
  model an async factory returning `WebGPURenderer`. If a future R3F types release fixes this, remove
  it (TS will tell you the directive is unused).
- WebGPU needs a **secure context**: `localhost` is fine; on a LAN IP you may only get WebGL2.
- First WebGPU frame is async — keep a `<Suspense fallback>` so there's no flash.

===FILE=== docs/03-app-shell-routing.md
# 03 — App shell, routing & store

Goal: the persistent Canvas + DOM overlay, the router (`/` and `/project/:id`), and the Zustand
store that ties URL → 3D state.

## Store — `src/store/useAppStore.ts`

```ts
import { create } from 'zustand'

export type Backend = 'unknown' | 'webgpu' | 'webgl'
export type Phase = 'idle' | 'entering' | 'inProject' | 'exiting'

interface AppState {
  backend: Backend
  activeProjectId: string | null
  phase: Phase
  setBackend: (b: Backend) => void
  enterProject: (id: string) => void
  exitProject: () => void
  setPhase: (p: Phase) => void
}

export const useAppStore = create<AppState>((set) => ({
  backend: 'unknown',
  activeProjectId: null,
  phase: 'idle',
  setBackend: (backend) => set({ backend }),
  enterProject: (id) => set({ activeProjectId: id, phase: 'entering' }),
  exitProject: () => set({ phase: 'exiting' }),
  setPhase: (phase) => set({ phase }),
}))
```

## Router — `src/routes/router.tsx`

```tsx
import { createBrowserRouter } from 'react-router-dom'
import { App } from '@/App'
import { HubRoute } from '@/routes/HubRoute'
import { ProjectRoute } from '@/routes/ProjectRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,           // renders persistent Canvas + <Outlet/>
    children: [
      { index: true, element: <HubRoute /> },
      { path: 'project/:id', element: <ProjectRoute /> },
    ],
  },
])
```

## Root — `src/main.tsx`

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/routes/router'
import '@/styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
```

> **StrictMode note:** double-invokes effects in dev. The Canvas itself is fine, but guard any
> renderer/postprocessing setup against running twice (init flags / cleanup in effect returns).

## Layout — `src/App.tsx`

The Canvas is a sibling of the outlet and stays mounted for every child route.

```tsx
import { Outlet } from 'react-router-dom'
import { Renderer } from '@/three/Renderer'
import { Nav } from '@/ui/Nav'
import { BackendBadge } from '@/ui/BackendBadge'

export function App() {
  return (
    <div className="relative h-full w-full">
      {/* 3D layer — fixed, behind everything, never unmounts */}
      <Renderer />

      {/* 2D layer — DOM overlay driven by the router */}
      <div className="pointer-events-none relative z-10 h-full w-full">
        <Nav />
        <Outlet />
        <BackendBadge />
      </div>
    </div>
  )
}
```

> Use `pointer-events-none` on the overlay container and `pointer-events-auto` on actual interactive
> bits (buttons, links). That lets pointer/raycast events reach the Canvas for portal hovering while
> still allowing UI clicks.

## Route components (2D layer)

### `src/routes/HubRoute.tsx`
Minimal intro/title; the hub visuals live in the 3D layer. Ensure the store is in `idle`:

```tsx
import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'

export function HubRoute() {
  const setPhase = useAppStore((s) => s.setPhase)
  useEffect(() => { setPhase('idle') }, [setPhase])

  return (
    <header className="p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Portal Field</h1>
      <p className="text-sm opacity-70">Click a portal to enter a project.</p>
    </header>
  )
}
```

### `src/routes/ProjectRoute.tsx`
Syncs the URL param into the store and renders the project's **2D** content (3D content is mounted by
the SceneRouter inside the Canvas — see [05-project-system.md](./05-project-system.md)).

```tsx
import { Suspense, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { getProject } from '@/projects/registry'
import { Loader } from '@/ui/Loader'

export function ProjectRoute() {
  const { id = '' } = useParams()
  const enterProject = useAppStore((s) => s.enterProject)
  const project = getProject(id)

  useEffect(() => { if (project) enterProject(project.id) }, [project, enterProject])

  if (!project) return <div className="p-8">Project not found.</div>
  const Content = project.Content

  return (
    <main className="pointer-events-auto p-8">
      <Suspense fallback={<Loader />}>
        <Content />
      </Suspense>
    </main>
  )
}
```

## SceneRouter stub — `src/scenes/SceneRouter.tsx`

Lives **inside** the Canvas. For now, just the hub; project mounting comes in
[05-project-system.md](./05-project-system.md).

```tsx
import { HubScene } from '@/scenes/hub/HubScene'

export function SceneRouter() {
  return <HubScene />
}
```

## UI stubs — `src/ui/`

- `Nav.tsx` — top bar / home link (`pointer-events-auto`).
- `BackButton.tsx` — calls `navigate('/')` + `exitProject()`.
- `BackendBadge.tsx` — reads `useAppStore(s => s.backend)`, shows `WebGPU` / `WebGL2`.
- `Loader.tsx` — simple spinner / "Loading…" for Suspense fallbacks.

## Checklist

- [ ] `/` shows the hub overlay over the live 3D layer
- [ ] Visiting `/project/portal-demo` (once registry exists) sets `activeProjectId` in the store
- [ ] Canvas does **not** remount on navigation (add a `console.info` in `glFactory`; it should log
      exactly once per page load, never on route change)
- [ ] UI buttons are clickable while the rest of the overlay passes pointer events to the Canvas

## Gotchas

- Don't put the `<Canvas>` inside a route element — it must be a sibling of `<Outlet/>` in `App` so
  it survives route changes.
- React Router v7 data APIs (`createBrowserRouter`) — make sure you're not mixing in the older
  `<BrowserRouter>` component style.

===FILE=== docs/04-hub-portal-field.md
# 04 — Hub: the portal field

Goal: the signature scene — an abstract GPU particle/shader field with glowing **portal** nodes that
hover-highlight and, on click, navigate to a project.

## Pieces

```
HubScene.tsx     orchestrates: <PortalField/> + registry.map(p => <Portal/>)
PortalField.tsx  the ambient particle/shader field (TSL, instanced/compute)
Portal.tsx       one interactive portal node (mesh + glow + hover/click)
tsl/portalField.ts  TSL node graph(s) for the field + portal shaders
```

## Portal field — TSL approach

Two viable implementations; both are TSL so they run on WebGPU **and** WebGL2:

1. **Instanced points/quads with animated position** (simplest, robust on WebGL2). Build an
   `InstancedMesh` or points; drive motion with a `positionNode` from TSL using `time`, hashed
   per-instance offsets, and curl-ish noise.
2. **Compute-driven particles** (`renderer.computeAsync`, storage buffers) — flashier, leans into
   WebGPU. On the WebGL2 fallback, prefer path 1 or a reduced count (see perf scaling in
   [07-postprocessing-polish.md](./07-postprocessing-polish.md)).

Start with path 1; consider compute later.

### `src/scenes/hub/tsl/portalField.ts` (sketch)

```ts
import {
  Fn, vec3, vec4, float, uv, time, positionLocal, instanceIndex,
  hash, mix, sin, length,
} from 'three/tsl'

// Per-instance drift + twinkle. Keep it cheap; this runs for every particle every frame.
export const fieldPositionNode = Fn(() => {
  const seed = hash(instanceIndex.toFloat())
  const t = time.mul(0.2).add(seed.mul(6.28))
  const drift = vec3(sin(t), sin(t.mul(1.3)), sin(t.mul(0.7))).mul(0.15)
  return positionLocal.add(drift)
})

export const fieldColorNode = Fn(() => {
  const d = length(uv().sub(0.5))
  const glow = float(1.0).sub(d.mul(2.0)).max(0.0)
  const base = mix(vec3(0.05, 0.1, 0.3), vec3(0.3, 0.6, 1.0), glow)
  return vec4(base, glow)
})
```

> TSL API names can shift between three releases — if an import (`hash`, `instanceIndex`, …) is
> missing, check the version's `three/tsl` exports. The *pattern* (node graph assigned to
> `positionNode`/`colorNode`) is stable.

### `src/scenes/hub/PortalField.tsx`

```tsx
import { useMemo } from 'react'
import * as THREE from 'three/webgpu'
import { fieldColorNode, fieldPositionNode } from './tsl/portalField'
import { useAppStore } from '@/store/useAppStore'

const COUNT_WEBGPU = 60_000
const COUNT_WEBGL = 12_000

export function PortalField() {
  const backend = useAppStore((s) => s.backend)
  const count = backend === 'webgl' ? COUNT_WEBGL : COUNT_WEBGPU

  const material = useMemo(() => {
    const m = new THREE.SpriteNodeMaterial({ transparent: true, depthWrite: false })
    m.positionNode = fieldPositionNode()
    m.colorNode = fieldColorNode()
    m.blending = THREE.AdditiveBlending
    return m
  }, [])

  // Build an InstancedMesh of `count` tiny quads/points scattered in a volume.
  // (Geometry/instance setup omitted — scatter on a sphere/box, store per-instance seed.)
  return <instancedMesh args={[undefined as any, material, count]} /* ...setup... */ />
}
```

## Portal node — `src/scenes/hub/Portal.tsx`

Each portal: a glowing ring/disc, hover scale-up, click → `navigate`.

```tsx
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three/webgpu'
import { damp3 } from 'maath/easing'
import type { ProjectMeta } from '@/projects/registry'

export function Portal({ project }: { project: ProjectMeta }) {
  const ref = useRef<THREE.Group>(null!)
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()

  useFrame((_, dt) => {
    const s = hovered ? 1.25 : 1
    damp3(ref.current.scale, [s, s, s], 0.15, dt)
  })

  return (
    <group
      ref={ref}
      position={project.portalPosition}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto' }}
      onClick={(e) => { e.stopPropagation(); navigate(`/project/${project.id}`) }}
    >
      <mesh>
        <torusGeometry args={[0.6, 0.12, 24, 64]} />
        <meshStandardNodeMaterial
          color={project.accent}
          emissive={project.accent}
          emissiveIntensity={hovered ? 2.2 : 1.0}
        />
      </mesh>
      {/* optional drei <Html> label that fades in on hover */}
    </group>
  )
}
```

## `src/scenes/hub/HubScene.tsx`

```tsx
import { PortalField } from './PortalField'
import { Portal } from './Portal'
import { PROJECTS } from '@/projects/registry'

export function HubScene() {
  return (
    <group>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={50} />
      <PortalField />
      {PROJECTS.map((p) => <Portal key={p.id} project={p} />)}
    </group>
  )
}
```

## Checklist

- [ ] Field renders and animates on both backends (WebGL count reduced, no stutter)
- [ ] Portals hover-scale and show a pointer cursor
- [ ] Clicking a portal changes the URL to `/project/:id`
- [ ] `e.stopPropagation()` prevents click-through to overlapping portals/field

## Gotchas

- For raycast hover to work, the overlay container must use `pointer-events-none` (see
  [03-app-shell-routing.md](./03-app-shell-routing.md)) so events reach the Canvas.
- `SpriteNodeMaterial` / node materials only exist after `extend(THREE)` from `three/webgpu`.
- Additive blending + `depthWrite: false` avoids ugly sorting artifacts on the particle field.
- Don't navigate inside `useFrame` — only in the `onClick` handler.

===FILE=== docs/05-project-system.md
# 05 — Project system (registry + lazy 3D/2D)

Goal: the extensibility backbone. One registry drives portals **and** routes. Each project ships a
lazy 3D `Scene` (mounted in the Canvas) and a lazy 2D `Content` (rendered in the DOM overlay). Build
one demo project end-to-end.

## Registry — `src/projects/registry.ts`

```ts
import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

export interface ProjectMeta {
  id: string                       // URL slug, e.g. 'portal-demo'
  title: string
  blurb: string
  accent: string                   // hex, used for portal + UI accents
  portalPosition: [number, number, number]
  Scene: LazyExoticComponent<ComponentType>   // 3D, mounted inside Canvas
  Content: LazyExoticComponent<ComponentType> // 2D, rendered in DOM overlay
}

export const PROJECTS: ProjectMeta[] = [
  {
    id: 'portal-demo',
    title: 'Portal Demo',
    blurb: 'Reference project proving the 3D + 2D pattern.',
    accent: '#5ab0ff',
    portalPosition: [0, 0, 0],
    Scene: lazy(() => import('@/projects/portal-demo/Scene')),
    Content: lazy(() => import('@/projects/portal-demo/Content')),
  },
  // add more here — each new project is one entry + a folder
]

export const getProject = (id: string) => PROJECTS.find((p) => p.id === id)
```

> Lazy imports give automatic code-splitting: each project's 3D + 2D bundles load only when entered,
> keeping the hub fast.

## Demo project

### `src/projects/portal-demo/Scene.tsx` (3D, inside Canvas)
Default-export a component that renders only this project's 3D content. It mounts when the project is
active; the CameraRig ([06-transitions.md](./06-transitions.md)) frames it.

```tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three/webgpu'

export default function PortalDemoScene() {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((_, dt) => { ref.current.rotation.x += dt * 0.3; ref.current.rotation.y += dt * 0.5 })
  return (
    <group position={[0, 0, 0]}>
      <mesh ref={ref}>
        <torusKnotGeometry args={[1, 0.3, 220, 32]} />
        <meshStandardNodeMaterial color="#5ab0ff" metalness={0.6} roughness={0.2} />
      </mesh>
      <pointLight position={[3, 3, 3]} intensity={40} />
    </group>
  )
}
```

### `src/projects/portal-demo/Content.tsx` (2D, DOM overlay)

```tsx
export default function PortalDemoContent() {
  return (
    <article className="max-w-prose space-y-4">
      <h2 className="text-3xl font-semibold">Portal Demo</h2>
      <p className="opacity-80">
        This 2D panel overlays the live 3D scene. Replace with the real case study —
        text, images, embedded controls, links.
      </p>
    </article>
  )
}
```

## Mount the active 3D scene — update `src/scenes/SceneRouter.tsx`

```tsx
import { Suspense } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { getProject } from '@/projects/registry'
import { HubScene } from '@/scenes/hub/HubScene'

export function SceneRouter() {
  const { activeProjectId, phase } = useAppStore()
  const project = activeProjectId ? getProject(activeProjectId) : null
  const showProject = project && (phase === 'entering' || phase === 'inProject')

  return (
    <>
      {/* Hub stays mounted but can fade/scale out during transitions (handled in 06). */}
      {(phase === 'idle' || phase === 'entering' || phase === 'exiting') && <HubScene />}

      {showProject && (
        <Suspense fallback={null}>
          {/* project.Scene is a lazy component */}
          <project.Scene />
        </Suspense>
      )}
    </>
  )
}
```

> Keep both mounted briefly during `entering`/`exiting` so the camera move has something to fly
> between; fully gate them once the camera arrives (`inProject`) / returns (`idle`).

## Checklist

- [ ] `/project/portal-demo` shows the demo 3D scene (Canvas) + 2D panel (overlay)
- [ ] Network tab: the project chunk loads **only** on navigation, not at initial page load
- [ ] An invalid id (`/project/nope`) renders the "not found" 2D fallback and no crash
- [ ] Adding a second registry entry instantly adds a portal in the hub

## Gotchas

- `React.lazy` requires a **default export** from `Scene.tsx`/`Content.tsx`.
- 3D `Scene` must be rendered *inside* the Canvas (via SceneRouter), never in the DOM route. 2D
  `Content` is the opposite — DOM only.
- Don't fetch heavy assets at module top-level; load inside the component (drei loaders / `useEffect`)
  so code-splitting actually defers the cost.

===FILE=== docs/06-transitions.md
# 06 — Transitions (camera fly, warp, scene swap)

Goal: smooth hub ↔ project motion. The store `phase` is the single source of truth; the CameraRig
and scene visibility react to it. No Canvas remount, so the camera moves continuously.

## Phase machine (recap)

```
idle ──click portal──▶ entering ──camera arrives──▶ inProject
  ▲                                                     │
  └────────── exiting ◀──── back / home ────────────────┘
```

Set by:
- `enterProject(id)` → `entering` (called from `ProjectRoute` effect on `:id`).
- CameraRig flips `entering → inProject` once the camera reaches the target.
- `BackButton`/home → `exitProject()` → `exiting`, then `navigate('/')`.
- CameraRig flips `exiting → idle` once the camera returns home; clear `activeProjectId`.

## CameraRig — `src/scenes/CameraRig.tsx`

```tsx
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { damp3, damp } from 'maath/easing'
import * as THREE from 'three/webgpu'
import { useAppStore } from '@/store/useAppStore'
import { getProject } from '@/projects/registry'

const HOME_POS: [number, number, number] = [0, 0, 8]
const ARRIVE_EPS = 0.02

export function CameraRig() {
  const { camera } = useThree()
  const target = useRef(new THREE.Vector3())
  const lookAt = useRef(new THREE.Vector3())

  useFrame((_, dt) => {
    const { phase, activeProjectId, setPhase } = useAppStore.getState()
    const project = activeProjectId ? getProject(activeProjectId) : null

    if ((phase === 'entering' || phase === 'inProject') && project) {
      const [x, y, z] = project.portalPosition
      target.current.set(x, y, z + 3.5)   // sit just in front of the portal/scene
      lookAt.current.set(x, y, z)
    } else {
      target.current.set(...HOME_POS)
      lookAt.current.set(0, 0, 0)
    }

    damp3(camera.position, target.current, 0.4, dt)
    // smoothly aim — lerp a held lookAt point, then camera.lookAt(it)
    camera.lookAt(lookAt.current)

    const dist = camera.position.distanceTo(target.current)
    if (phase === 'entering' && dist < ARRIVE_EPS) setPhase('inProject')
    if (phase === 'exiting' && dist < ARRIVE_EPS) {
      useAppStore.setState({ phase: 'idle', activeProjectId: null })
    }
  })

  return null
}
```

Mount it inside the Canvas (e.g. in `Renderer.tsx` alongside `<SceneRouter/>`).

## Field warp / fade

Drive the portal field and hub opacity off `phase`:
- On `entering`: ramp a uniform (e.g. `warpStrength`) up and fade non-target portals out.
- On `idle`: ramp back down.

Expose a uniform node in `tsl/portalField.ts` (a `uniform(float)`), and in `PortalField` lerp its
`.value` toward a target each frame based on `useAppStore.getState().phase`. Keep all easing in
`useFrame` with `maath/easing` `damp`.

## Back navigation — `src/ui/BackButton.tsx`

```tsx
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'

export function BackButton() {
  const navigate = useNavigate()
  const exitProject = useAppStore((s) => s.exitProject)
  return (
    <button
      className="pointer-events-auto rounded px-3 py-1 text-sm bg-white/10 hover:bg-white/20"
      onClick={() => { exitProject(); navigate('/') }}
    >
      ← Back
    </button>
  )
}
```

The route changes immediately, but the 3D `exiting` animation runs until the camera reaches home —
that's why `exitProject()` only sets the phase and lets the CameraRig finish the move.

## Browser back/forward

Because the URL is the source of truth, hitting the browser back button just changes the route;
`ProjectRoute` unmounts and `HubRoute`'s effect sets `idle`. Make sure the `idle` transition (effect
in `HubRoute`) and the CameraRig agree — prefer letting CameraRig settle `exiting → idle` so you
don't snap the camera. Optionally treat "route is `/` but phase still `inProject`" as a trigger to
set `exiting`.

## Checklist

- [ ] Clicking a portal flies the camera in smoothly (no snap), then `inProject`
- [ ] Back button reverses the move and returns to `idle`; `activeProjectId` clears
- [ ] Browser back/forward stays in sync (no stuck camera, no double scene)
- [ ] `prefers-reduced-motion`: shorten/disable the fly (jump-cut) — see polish doc

## Gotchas

- Read volatile store values with `useAppStore.getState()` **inside** `useFrame` (not via selector
  subscription) to avoid re-rendering the rig every frame.
- Keep one easing source for the camera — don't also drive it from drei `OrbitControls` (or disable
  controls during transitions).
- `distanceTo` arrival check needs a small epsilon; with `damp3` it asymptotes, so don't wait for
  exact zero.

===FILE=== docs/07-postprocessing-polish.md
# 07 — Postprocessing & polish

Goal: the portal glow (bloom), backend-aware performance, and the finishing UI.

## Bloom — node-based, works on BOTH backends

⚠️ **Do not use `postprocessing` / `@react-three/postprocessing`** — they're WebGL-only and won't
run on `WebGPURenderer`. Use three's **node `PostProcessing`** + the TSL `bloom` node instead;
because it's TSL it transpiles to WGSL or GLSL.

### `src/scenes/Effects.tsx`

```tsx
import { useEffect, useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three/webgpu'
import { pass } from 'three/tsl'
import { bloom } from 'three/addons/tsl/display/BloomNode.js'

export function Effects() {
  const { gl, scene, camera } = useThree()

  const post = useMemo(() => {
    const p = new THREE.PostProcessing(gl as any)
    const scenePass = pass(scene, camera)
    const bloomPass = bloom(scenePass, /*strength*/ 0.8, /*radius*/ 0.4, /*threshold*/ 0.6)
    p.outputNode = scenePass.add(bloomPass)
    return p
  }, [gl, scene, camera])

  // Take over the render loop: render via post instead of the default.
  useFrame(() => { post.renderAsync() }, 1)

  useEffect(() => () => { post.dispose?.() }, [post])
  return null
}
```

> Mount `<Effects/>` inside the Canvas. `useFrame(fn, 1)` gives it a render priority > 0, which makes
> R3F **stop** its own automatic render and defer to your callback. Verify against your R3F version
> that a positive-priority `useFrame` suppresses the default render; if not, set
> `gl.setAnimationLoop` / `frameloop` handling accordingly.

### Tuning
- `threshold` controls what glows — keep portal emissive materials above it (emissiveIntensity > 1)
  so only portals/particles bloom, not the whole scene.
- Lower bloom `radius`/`strength` on the WebGL2 path if it's heavy.

## Backend-aware performance

Read `backend` from the store and scale:

| Setting | WebGPU | WebGL2 fallback |
|---|---|---|
| Particle count | high (e.g. 60k) | reduced (e.g. 12k) |
| Bloom | full | lighter or off |
| DPR | `[1, 2]` | `[1, 1.5]` |
| Compute particles | yes | use instanced fallback |

- Clamp DPR on the Canvas (`dpr={[1, 2]}`) and consider drei `<PerformanceMonitor>` /
  `<AdaptiveDpr>` to drop quality under load.
- `frameloop="always"` for the animated field; if you ever have a static project view, you could
  switch to `"demand"` there.

## Accessibility & UX polish

- **`prefers-reduced-motion`**: detect via `window.matchMedia('(prefers-reduced-motion: reduce)')`;
  shorten/disable camera fly and field motion. Store it once on load.
- **Loading states**: `Suspense` fallbacks for lazy project scenes/content (`Loader.tsx`); a first-
  paint loader while the WebGPU context initializes.
- **`BackendBadge.tsx`**: small corner pill — `WebGPU` (green) / `WebGL2` (amber). Reads
  `useAppStore(s => s.backend)`. Great for demos and debugging the fallback.
- **No-WebGL safety net**: if both fail (ancient browser), show a static fallback message instead of
  a blank Canvas.
- **Cursor + focus**: pointer cursor on hover (already in Portal); make portals keyboard-navigable if
  you want a11y (optional — overlay anchor links per project as a fallback nav).

## Checklist

- [ ] Portals/particles bloom; the rest of the scene doesn't wash out
- [ ] Bloom renders identically (modulo perf) on `?webgl`
- [ ] WebGL2 path runs smoothly with reduced counts; no dropped frames on a mid laptop
- [ ] Reduced-motion users get a calm experience
- [ ] Backend badge shows the right mode in each path

## Gotchas

- The `three/addons/tsl/display/BloomNode.js` path is correct for recent three; if it moved, search
  the installed `three/examples/jsm/tsl/display/` folder for `Bloom`.
- Only **one** thing should drive the final render. If you both let R3F auto-render *and* call
  `post.renderAsync()`, you'll double-render or flicker.
- `post.renderAsync()` is async — don't `await` it inside `useFrame` in a way that stalls; fire and
  let it resolve.

===FILE=== docs/08-scale-deploy.md
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

===FILE=== docs/09-ui-motion.md
# 09 — UI motion, responsiveness & dynamic UI (Motion / Framer Motion)

Goal: a beautiful, fluid, fully responsive **2D** layer that animates in concert with the 3D camera
transitions. The 3D layer eases via `maath` in `useFrame`; the **DOM layer eases via Motion**.

> **Package note:** "Framer Motion" is now published as **`motion`** (motion.dev). Install `motion`
> and import from **`motion/react`**. The legacy `framer-motion` package still works but `motion` is
> current. `npm install motion`.

## Where Motion is used

| Surface | Animation |
|---|---|
| Route changes (`/` ↔ `/project/:id`) | `AnimatePresence` enter/exit of the 2D content |
| Project content panels | Staggered reveal (heading → body → media) |
| Nav / back button / badge | Hover/tap micro-interactions, mount/unmount |
| Portal hover labels (DOM) | Fade/scale in on hover (or use drei `<Html>` for in-scene) |
| Loaders | Smooth fade between loading ↔ loaded |

## Route transitions — `AnimatePresence` + react-router

Wrap the `<Outlet/>` so the **outgoing** content animates out while the **incoming** animates in.
Sync the timing with the 3D camera fly (06) so 2D and 3D feel like one motion.

```tsx
// src/App.tsx (2D layer section)
import { AnimatePresence, motion } from 'motion/react'
import { Outlet, useLocation } from 'react-router-dom'

export function App() {
  const location = useLocation()
  return (
    <div className="relative h-full w-full">
      <Renderer />
      <div className="pointer-events-none relative z-10 h-full w-full">
        <Nav />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="h-full w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
        <BackendBadge />
      </div>
    </div>
  )
}
```

> `mode="wait"` keeps the camera fly readable (out, then in). If you prefer cross-fade, drop it. Keep
> the DOM transition duration close to the camera arrival time so they resolve together.

## Staggered content reveal

```tsx
import { motion } from 'motion/react'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

export default function PortalDemoContent() {
  return (
    <motion.article variants={container} initial="hidden" animate="show"
      className="pointer-events-auto mx-auto max-w-prose space-y-4 px-4 sm:px-6 lg:px-8">
      <motion.h2 variants={item} className="text-2xl sm:text-3xl font-semibold">Portal Demo</motion.h2>
      <motion.p variants={item} className="opacity-80">…</motion.p>
    </motion.article>
  )
}
```

## Micro-interactions

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.96 }}
  className="pointer-events-auto rounded-full px-4 py-2 bg-white/10 backdrop-blur"
>
  ← Back
</motion.button>
```

## Responsiveness (full dynamic UI)

- **Tailwind breakpoints** (`sm md lg xl 2xl`) for layout; mobile-first. Content panels:
  full-width sheet on mobile, side panel on desktop (`lg:max-w-md lg:absolute lg:right-0`).
- **Canvas** is `fixed inset-0` so it always fills the viewport; only the 2D layer reflows.
- **Safe areas / notches**: use `p-[env(safe-area-inset-*)]` or Tailwind arbitrary values for mobile.
- **Container queries** (Tailwind v4 `@container`) for panels that should respond to their own width,
  not the viewport.
- **Touch**: portals must be tappable; ensure hit areas are large enough on mobile (scale portal
  colliders up below `md`). Pointer events work for both mouse and touch in R3F.
- **Orientation/resize**: R3F handles canvas resize; verify portal layout (06/08) reflows or is
  framed so nothing clips on portrait phones.

## Reduced motion (accessibility — ties into the a11y gate)

```tsx
import { useReducedMotion } from 'motion/react'

const reduce = useReducedMotion()
const transition = reduce ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
```

Propagate the same flag to the 3D side (store it once on load) so the camera fly becomes a
jump-cut and the particle field calms. See [06-transitions.md](./06-transitions.md) and the
accessibility gate in [.specify/quality-gates.md](../.specify/quality-gates.md).

## Checklist

- [ ] Route changes cross-animate (2D out/in) in sync with the 3D camera fly
- [ ] Content reveals with a tasteful stagger; no layout shift / jank
- [ ] Buttons/nav have hover + tap feedback; all interactive bits are `pointer-events-auto`
- [ ] Layout is correct at 360px, 768px, 1280px, 1920px and in portrait
- [ ] `prefers-reduced-motion` removes/ò shortens both 2D and 3D motion
- [ ] No animation drives a non-animatable CSS prop (causes jank) — prefer transform/opacity

## Gotchas

- Animate **transform/opacity**, not `width`/`top`/`left`, to stay on the compositor (60fps).
- `AnimatePresence` needs a stable, unique `key` (use `location.pathname`) and direct children that
  mount/unmount.
- Don't animate the `<Canvas>` element itself with Motion — animate the 2D overlay; the 3D side is
  driven by `useFrame`. Mixing the two render loops on the same node causes fighting.
- Keep 2D transition duration ≈ camera arrival time, or the layers desync and it feels broken.

===FILE=== .specify/memory/constitution.md
# Project Constitution — Portal Field Portfolio

> The non-negotiable principles for this project. Every task in
> [tasks.md](../specs/001-portal-portfolio/tasks.md) must satisfy these, and every quality gate in
> [quality-gates.md](../quality-gates.md) enforces them. Amendments require an explicit decision
> recorded at the bottom of this file.

## Principles

### I. Cross-backend parity is sacred
The app MUST run on **WebGPU** where available and **WebGL2** as fallback, from a single
`WebGPURenderer`. Any feature that works on one backend but not the other is **incomplete**. Shaders
are authored once in **TSL**; no raw WGSL/GLSL unless wrapped to transpile to both. The `?webgl` flag
must always render a visually equivalent (if lower-fidelity) result.

### II. One persistent canvas
There is exactly **one** `<Canvas>` for the app's lifetime. It never unmounts on navigation. The
URL/router drives *what the scene shows*, never whether the renderer exists. Re-initializing the GPU
context on navigation is a defect.

### III. Registry-driven extensibility
Adding a project MUST be: one entry in `projects/registry.ts` + a folder with a lazy `Scene` (3D) and
`Content` (2D). No edits to routing, hub, or core wiring. If adding a project requires touching core
files, the abstraction is wrong.

### IV. Performance is a budget, not an afterthought
Hard budgets (measured, see [quality-gates.md](../quality-gates.md) → Performance):
- **≥ 55 fps** sustained on a mid-tier laptop (WebGPU) and **≥ 30 fps** (WebGL2 fallback).
- Initial JS (hub, gzipped) **< 250 KB**; each project loads as its **own lazy chunk**.
- No per-frame allocations in `useFrame`; no GPU resource leaks across navigation (dispose on unmount).

### V. Secure by default
- No secrets in the client. No `dangerouslySetInnerHTML` with un-sanitized input.
- `npm audit` has **no high/critical** vulnerabilities at gate time.
- Project content is static/trusted; any external embed is sandboxed. CSP-friendly (no inline
  eval-driven code). Dependencies are pinned and reviewed.

### VI. Accessible & responsive
- Correct from **360px → 4K**, portrait and landscape, touch and pointer.
- Respects `prefers-reduced-motion` in **both** the 2D (Motion) and 3D (camera/field) layers.
- Keyboard-navigable primary nav; sufficient contrast; a non-WebGL static fallback message exists.

### VII. Spec-driven & self-verifying
- Code matches the spec and this constitution; divergence is flagged, not silently shipped.
- Every phase ends **green**: `tsc` clean, `vite build` succeeds, dev server boots, both backends
  render. "Done" means gates passed, not "code written."

### VIII. Beautiful, fluid, intentional UI
- Motion is purposeful and synchronized (2D transitions resolve with the 3D camera fly).
- Animate transform/opacity only; 60fps on the compositor; no layout-shift jank.

## Quality gates (summary)

A task/phase is **DONE** only when all applicable gates pass. Full definitions in
[quality-gates.md](../quality-gates.md).

| Gate | Enforces |
|---|---|
| Performance | Principle IV |
| Efficiency / code quality | Principles II, III, VIII (clean, DRY, reuse) |
| Security | Principle V |
| Correctness / verification | Principle VII (builds, boots, renders) |
| Cross-backend parity | Principle I |
| Accessibility & responsiveness | Principle VI |
| Spec-alignment | Principle VII (matches spec + constitution) |

## Governance

- The constitution supersedes convenience. A gate failure blocks "done."
- The autonomous build ([orchestration.md](../orchestration.md)) may not weaken a gate to pass it;
  it must fix the code or escalate a question to the user.
- Genuine trade-offs (e.g. a budget that can't be met) are surfaced to the user as a decision, not
  decided silently.

## Amendments

_None yet. Record as: `YYYY-MM-DD — what changed — why`._

===FILE=== .specify/specs/001-portal-portfolio/spec.md
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

===FILE=== .specify/specs/001-portal-portfolio/plan.md
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

===FILE=== .specify/specs/001-portal-portfolio/tasks.md
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

===FILE=== .specify/quality-gates.md
# Quality Gates — the feedback loops

Seven feedback loops enforce the [constitution](./memory/constitution.md). Each runs as an
independent review agent during the autonomous build ([orchestration.md](./orchestration.md)). A gate
emits structured findings; **blocking** findings trigger an automatic fix-loop (re-implement →
re-check) up to **`maxRounds = 3`**, after which an unresolved blocker is escalated to the user as a
question.

**Finding shape (all gates emit this):**
```jsonc
{ "gate": "performance", "severity": "blocking|warn|info",
  "file": "src/...", "title": "…", "evidence": "measured/observed …",
  "fix": "concrete change to make", "principle": "IV" }
```

A phase is **DONE** when every applicable gate returns **no blocking findings**.

---

## 1. Performance loop  (Constitution IV)
**Trigger:** after phases 1, 3, 5, 7, 8 (any render-loop or asset change).
**Checks:**
- Sustained fps: **≥55 (WebGPU)**, **≥30 (WebGL2)** on the hub and in a project view.
- No per-frame allocations in `useFrame` (inspect for `new`, array/object literals in hot paths).
- No GPU leaks: geometries/materials/textures disposed on unmount; navigating hub↔project repeatedly
  doesn't grow memory.
- Initial hub JS (gzipped) **< 250 KB**; projects are separate lazy chunks.
- DPR clamped; backend-scaled particle counts honored.
**Tools:** `vite build` + bundle report; manual/Playwright fps probe (`requestAnimationFrame` delta);
heap snapshot before/after N navigations; grep hot paths.
**Pass:** all budgets met on both backends. **Fail→fix:** reduce counts/alloc, add disposal, split chunks.

## 2. Efficiency / code-quality loop  (Constitution II, III, VIII)
**Trigger:** after every phase.
**Checks:**
- DRY & reuse: no duplicated logic that an existing util/registry covers.
- Architecture held: one Canvas; adding a project needs only registry+folder; no core edits leaked.
- TS strictness: no `any` crossing module boundaries; types model intent.
- Dead code, unused deps/exports, oversized components split sensibly.
- Idiomatic R3F/React (no re-renders per frame; `useFrame` reads store via `getState()`).
**Tools:** `tsc --noEmit`, ESLint, `knip`/`depcheck` (unused), targeted code review.
**Pass:** clean lint/types, no dup/dead code, abstractions intact.

## 3. Security loop  (Constitution V)
**Trigger:** after phases 0 (deps), 4, 8, and any dependency change.
**Checks:**
- `npm audit` — **no high/critical**.
- No secrets/keys in client code or env committed to repo.
- No `dangerouslySetInnerHTML` with untrusted input; external embeds sandboxed (`iframe sandbox`).
- No `eval`/`new Function`/dynamic remote `import()` of untrusted code; CSP-friendly.
- Dependencies pinned; lockfile committed; no typosquat/abandoned packages introduced.
**Tools:** `npm audit --omit=dev` + full; grep for risky patterns; dependency diff review.
**Pass:** audit clean, no risky patterns, deps reviewed. **Fail→fix:** upgrade/replace dep, sanitize,
sandbox, remove secret.

## 4. Correctness / verification loop  (Constitution VII)
**Trigger:** after every phase.
**Checks:**
- `tsc --noEmit` clean; `vite build` succeeds.
- Dev server boots with **zero console errors/warnings** on `/` and `/project/<id>`.
- The phase's functional requirements actually work (e.g. portals navigate; back returns).
- WebGPU path **and** `?webgl` path both boot and render (smoke).
**Tools:** build + `vite preview`; headless browser (Playwright) to load routes, assert canvas
present + no console errors; click-through script for nav.
**Pass:** builds + boots + the phase's FRs demonstrably work on both backends.

## 5. Cross-backend parity loop  (Constitution I)  ← project-specific, critical
**Trigger:** after phases 1, 3, 7, 8.
**Checks:**
- Same scene renders on WebGPU and `?webgl` (no missing materials/black screen on either).
- Visual equivalence (screenshot compare; allow fidelity diff, flag *structural* diff).
- No backend-only crash; TSL nodes used exist on both backends.
- Backend correctly detected + reported (badge/store).
**Tools:** load both `/` and `/?webgl` headless; screenshot diff; console-error check per backend.
**Pass:** both backends render an equivalent scene with no errors.

## 6. Accessibility & responsiveness loop  (Constitution VI)
**Trigger:** after phases 5, 6, 7, 8.
**Checks:**
- Layout correct at **360 / 768 / 1280 / 1920** px and portrait; no clipping/overflow.
- `prefers-reduced-motion` honored in **both** 2D (Motion) and 3D (camera/field).
- Keyboard: primary nav reachable/operable; visible focus; portals have a keyboard/anchor fallback.
- Contrast ≥ WCAG AA for text over the canvas; touch hit-areas ≥ 44px.
- Non-WebGL static fallback present (FR-014).
**Tools:** Playwright viewport matrix + emulate `prefers-reduced-motion`; axe-core; contrast check.
**Pass:** responsive matrix clean, reduced-motion respected, axe has no serious violations.

## 7. Spec-alignment loop  (Constitution VII) — Spec Kit `/analyze`
**Trigger:** after phases 4, 8 (and on any spec/constitution change).
**Checks:**
- Every **FR** in [spec.md](./specs/001-portal-portfolio/spec.md) is implemented or explicitly deferred.
- No feature contradicts the constitution; no gate was weakened to pass.
- `tasks.md` reflects reality (done = done); no orphan/contradictory artifacts.
- Naming/structure matches [00-architecture.md](../docs/00-architecture.md).
**Tools:** cross-read spec ↔ code ↔ tasks; produce a coverage matrix (FR → file(s) → status).
**Pass:** full FR coverage (or recorded deferrals), no constitution violations.

---

## Gate run matrix (per phase)

| Phase | Perf | Effic | Sec | Correct | Parity | A11y | Spec |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| 0 Setup |  | ✔ | ✔ | ✔ |  |  |  |
| 1 Renderer | ✔ | ✔ |  | ✔ | ✔ |  |  |
| 2 Shell |  | ✔ |  | ✔ |  |  |  |
| 3 Hub field | ✔ | ✔ |  | ✔ | ✔ |  |  |
| 4 Projects |  | ✔ | ✔ | ✔ |  |  | ✔ |
| 5 Transitions | ✔ | ✔ |  | ✔ |  | ✔ |  |
| 6 Motion/UI |  | ✔ |  | ✔ |  | ✔ |  |
| 7 Postprocess | ✔ | ✔ |  | ✔ | ✔ | ✔ |  |
| 8 Deploy (release) | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |

## Escalation rule
If a blocking finding survives `maxRounds` fix attempts, the orchestrator **stops that phase** and
asks the user a focused question (the only time the build pauses for input). It never weakens a gate
to force a pass (Constitution governance).

===FILE=== .specify/orchestration.md
# Autonomous Build Orchestration

How this project gets built **hands-off**: you kick it off once, answer a short batch of questions
up front, and the system implements phase-by-phase, running the [quality gates](./quality-gates.md)
as feedback loops and fixing its own findings — pausing only if a blocker truly needs your decision.

## Design goals (your requirements)

- **You don't drive.** Start it, then only answer occasional agent questions.
- **Feedback loops:** performance, efficiency, security, + correctness, cross-backend parity,
  accessibility/responsive, spec-alignment (see [quality-gates.md](./quality-gates.md)).
- **Self-correcting:** gate findings feed back into fixes automatically (loop until green).

## The two-tier model

```
            ┌──────────────────────────────────────────────────────────┐
            │  ORCHESTRATOR (main agent)                                 │
            │  • walks tasks.md phase by phase                           │
            │  • the ONLY thing that asks you questions (AskUserQuestion)│
            └───────────────┬──────────────────────────────────────────┘
                            │ per phase
        ┌───────────────────┼───────────────────────────────┐
        ▼                   ▼                                ▼
  IMPLEMENTER agent   →   GATE agents (parallel)   →   FIX agent (if blockers)
  writes the phase's      perf · efficiency · sec ·     applies gate fixes,
  code per docs/          correctness · parity ·         re-runs gates
                          a11y · spec-alignment          (loop ≤ maxRounds=3)
```

- **Implementer** does one phase from [tasks.md](./specs/001-portal-portfolio/tasks.md), following the
  matching [`docs/`](../docs/README.md) guide and the [constitution](./memory/constitution.md).
- **Gate agents** run the loops for that phase (per the matrix in
  [quality-gates.md](./quality-gates.md)), each returning structured findings.
- **Fix agent** consumes blocking findings, edits code, and the gates re-run. Up to 3 rounds; an
  unresolved blocker escalates to a user question.

## When the build asks you something (the only inputs you give)

1. **Clarify pass (up front, once).** Before any code, the orchestrator resolves the open questions
   in [spec.md](./specs/001-portal-portfolio/spec.md) → *Open questions* via a single `AskUserQuestion`
   batch. This front-loading is what lets the rest run unattended. Each has a sane default, so you can
   accept defaults fast.
2. **Escalation (rare).** Only if a gate blocker can't be auto-fixed in 3 rounds, or a genuinely
   ambiguous design decision appears. Always a focused multiple-choice question with a recommended
   default.

Everything else — scaffolding, deps, code, profiling, audits, fixes — happens on its own.

## Autonomy rules

- Never weaken a gate to pass it (constitution governance). Fix the code or escalate.
- Prefer reversible actions; the build runs locally (no deploy, no push) unless you ask.
- Destructive/outward actions (publishing, deleting non-generated files) always require confirmation.
- Each phase ends green (gates pass) before the next begins; the release phase runs the full suite.

---

## Kickoff

You have two ways to run it. Both start with the same clarify pass.

### Option A — Orchestrator-driven (recommended for "answer questions as it goes")
Say:
> **"Start the autonomous build of spec 001."**

The orchestrator will: (1) ask the clarify batch, (2) implement Phase 0, (3) run its gates, (4)
fix-loop to green, (5) advance — repeating through Phase 8, surfacing a question only on escalation.
This path keeps the human-in-the-loop question UX you asked for.

### Option B — Workflow script (max parallelism, fewer interactive questions)
A ready script lives at
[workflows/autonomous-build.workflow.js](./workflows/autonomous-build.workflow.js). It runs the
implement→gate→fix pipeline with parallel gate agents. Note: workflow sub-agents **can't** prompt you
mid-run, so answer the clarify batch first; any escalation surfaces when the workflow returns. Start
with:
> **"Run the autonomous-build workflow."**

> Heads-up: a full hands-off build spawns many agents and uses significant tokens. That's expected
> for this scale — just confirming so it's intentional when you say go.

## State & resumability

- Progress is the truth in the repo: `tasks.md` checkboxes + git status + which files exist.
- If interrupted, re-running the kickoff resumes from the first phase whose gates aren't green.
- The workflow script supports resume (see its header) so a stopped run continues from cache.

## What you get at the end

A running app (`npm run dev`), green on all 7 gates, code-split per project, responsive 360px→4K,
WebGPU with WebGL2 fallback, and a one-entry path to add more projects.

===FILE=== .specify/workflows/autonomous-build.workflow.js
export const meta = {
  name: 'autonomous-build',
  description: 'Build the Portal Field Portfolio spec-driven: implement each phase, run quality-gate loops, auto-fix to green.',
  whenToUse: 'After the clarify pass is answered. Runs the full hands-off build of spec 001.',
  phases: [
    { title: 'Phase 0: Setup', detail: 'scaffold, deps, tailwind, alias' },
    { title: 'Phase 1: Renderer', detail: 'WebGPU + WebGL2 fallback, TSL smoke' },
    { title: 'Phase 2: Shell/Routing', detail: 'persistent canvas, router, store' },
    { title: 'Phase 3: Hub Field', detail: 'TSL particle field + portals' },
    { title: 'Phase 4: Project System', detail: 'registry + lazy scene/content' },
    { title: 'Phase 5: Transitions', detail: 'camera fly + field warp' },
    { title: 'Phase 6: Motion/UI', detail: 'Motion transitions, responsive' },
    { title: 'Phase 7: Postprocess/Polish', detail: 'bloom, scaling, badges' },
    { title: 'Phase 8: Scale/Deploy (release)', detail: 'more projects, build, full-gate' },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTE: This is the orchestration scaffold. It assumes the clarify questions in
// spec.md are already answered (workflow sub-agents cannot prompt the user). It
// implements each phase, runs the applicable quality gates in parallel, and
// fix-loops on blocking findings up to maxRounds. Tune prompts/gate commands to
// your installed tool versions before relying on it unattended.
// ─────────────────────────────────────────────────────────────────────────────

const MAX_ROUNDS = 3

const FINDINGS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['gate', 'pass', 'findings'],
  properties: {
    gate: { type: 'string' },
    pass: { type: 'boolean', description: 'true if no blocking findings' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['severity', 'title', 'fix'],
        properties: {
          severity: { type: 'string', enum: ['blocking', 'warn', 'info'] },
          file: { type: 'string' },
          title: { type: 'string' },
          evidence: { type: 'string' },
          fix: { type: 'string' },
        },
      },
    },
  },
}

// Gate prompts keyed by id — each agent reads .specify/quality-gates.md for full criteria.
const GATE = {
  performance: 'PERFORMANCE gate (quality-gates.md §1). Check fps budgets (≥55 WebGPU / ≥30 WebGL2), no per-frame allocations in useFrame, GPU disposal on unmount, hub JS <250KB gzip, lazy chunks, DPR clamp. Build and inspect; report blocking findings.',
  efficiency: 'EFFICIENCY/CODE-QUALITY gate (§2). Run tsc --noEmit + eslint; check DRY/reuse, one-canvas + registry abstraction intact, no any across boundaries, no dead code/unused deps. Report blocking findings.',
  security: 'SECURITY gate (§3). Run npm audit; grep for secrets, dangerouslySetInnerHTML w/ untrusted input, eval/new Function, unsandboxed embeds; review dep diff. No high/critical. Report blocking findings.',
  correctness: 'CORRECTNESS gate (§4). Run tsc + vite build; boot dev/preview headless; load / and /project/<id> on BOTH WebGPU and ?webgl; assert canvas present + zero console errors; verify the phase FRs work. Report blocking findings.',
  parity: 'CROSS-BACKEND PARITY gate (§5). Load / and /?webgl headless; confirm equivalent render (no black screen / missing material on either), screenshot-diff structural differences, no backend-only crash, backend correctly reported. Report blocking findings.',
  a11y: 'ACCESSIBILITY/RESPONSIVE gate (§6). Viewport matrix 360/768/1280/1920 + portrait; emulate prefers-reduced-motion (verify 2D+3D calm); axe-core; keyboard nav + focus; contrast AA; touch hit-areas ≥44px; non-WebGL fallback present. Report blocking findings.',
  spec: 'SPEC-ALIGNMENT gate (§7). Cross-read spec.md FRs ↔ code ↔ tasks.md; build FR→file→status coverage matrix; flag any constitution violation or weakened gate. Report blocking findings.',
}

// Phase plan — mirrors tasks.md + the gate matrix in quality-gates.md.
const PHASES = [
  { key: 'Phase 0: Setup',           doc: 'docs/01-setup.md',               tasks: 'T001-T004', gates: ['efficiency', 'security', 'correctness'] },
  { key: 'Phase 1: Renderer',        doc: 'docs/02-renderer-webgpu.md',     tasks: 'T010-T014', gates: ['performance', 'efficiency', 'correctness', 'parity'] },
  { key: 'Phase 2: Shell/Routing',   doc: 'docs/03-app-shell-routing.md',   tasks: 'T020-T025', gates: ['efficiency', 'correctness'] },
  { key: 'Phase 3: Hub Field',       doc: 'docs/04-hub-portal-field.md',    tasks: 'T030-T033', gates: ['performance', 'efficiency', 'correctness', 'parity'] },
  { key: 'Phase 4: Project System',  doc: 'docs/05-project-system.md',      tasks: 'T040-T044', gates: ['efficiency', 'security', 'correctness', 'spec'] },
  { key: 'Phase 5: Transitions',     doc: 'docs/06-transitions.md',         tasks: 'T050-T053', gates: ['performance', 'efficiency', 'correctness', 'a11y'] },
  { key: 'Phase 6: Motion/UI',       doc: 'docs/09-ui-motion.md',           tasks: 'T060-T063', gates: ['efficiency', 'correctness', 'a11y'] },
  { key: 'Phase 7: Postprocess/Polish', doc: 'docs/07-postprocessing-polish.md', tasks: 'T070-T072', gates: ['performance', 'efficiency', 'correctness', 'parity', 'a11y'] },
  { key: 'Phase 8: Scale/Deploy (release)', doc: 'docs/08-scale-deploy.md', tasks: 'T080-T083', gates: ['performance', 'efficiency', 'security', 'correctness', 'parity', 'a11y', 'spec'] },
]

const CONTEXT = `Project: Portal Field Portfolio (R3F + WebGPU/WebGL2, TS, Tailwind v4, Motion).
Authoritative refs in repo: .specify/memory/constitution.md, .specify/specs/001-portal-portfolio/{spec,plan,tasks}.md,
.specify/quality-gates.md, and the docs/ phase guides. Follow the constitution; do not weaken any gate.`

const report = []

for (const p of PHASES) {
  phase(p.key)

  // 1) Implement the phase.
  await agent(
    `${CONTEXT}\n\nIMPLEMENT ${p.key} (tasks ${p.tasks}). Follow ${p.doc} exactly. ` +
    `Write/scaffold all files for this phase, install needed deps, and make it build. ` +
    `Match the architecture in docs/00-architecture.md. Return a short summary of files created/changed.`,
    { label: `implement:${p.key}`, phase: p.key }
  )

  // 2) Gate + fix loop.
  let round = 0
  let blockers = []
  do {
    const results = await parallel(
      p.gates.map((g) => () =>
        agent(`${CONTEXT}\n\nRun the ${GATE[g]}`, { label: `gate:${g}`, phase: p.key, schema: FINDINGS_SCHEMA })
      )
    )
    blockers = results
      .filter(Boolean)
      .flatMap((r) => (r.findings || []).filter((f) => f.severity === 'blocking').map((f) => ({ ...f, gate: r.gate })))

    log(`${p.key}: round ${round + 1} → ${blockers.length} blocking finding(s)`)

    if (blockers.length === 0) break

    if (round < MAX_ROUNDS) {
      await agent(
        `${CONTEXT}\n\nFIX these blocking gate findings for ${p.key} without weakening any gate:\n` +
        blockers.map((b, i) => `${i + 1}. [${b.gate}] ${b.title} — ${b.file || ''}\n   evidence: ${b.evidence || ''}\n   fix: ${b.fix}`).join('\n') +
        `\n\nApply the fixes, keep it building, return a summary.`,
        { label: `fix:${p.key}:r${round + 1}`, phase: p.key }
      )
    }
    round++
  } while (round <= MAX_ROUNDS)

  report.push({ phase: p.key, rounds: round, unresolvedBlockers: blockers })

  if (blockers.length > 0) {
    log(`⚠ ${p.key}: ${blockers.length} blocker(s) survived ${MAX_ROUNDS} rounds — ESCALATE to user before continuing.`)
    // Stop the run so the orchestrator can ask the user a focused question.
    break
  }
}

return { report }

