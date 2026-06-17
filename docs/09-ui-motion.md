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