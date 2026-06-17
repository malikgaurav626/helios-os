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