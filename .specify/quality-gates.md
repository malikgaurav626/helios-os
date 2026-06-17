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