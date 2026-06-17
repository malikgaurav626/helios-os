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