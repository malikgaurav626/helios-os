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