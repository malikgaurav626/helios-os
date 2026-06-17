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