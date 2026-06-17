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