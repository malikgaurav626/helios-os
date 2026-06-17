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