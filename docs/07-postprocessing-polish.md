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