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