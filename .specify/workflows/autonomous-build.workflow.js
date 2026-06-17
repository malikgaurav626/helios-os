export const meta = {
  name: 'autonomous-build',
  description: 'Build the Portal Field Portfolio spec-driven: implement each phase, run quality-gate loops, auto-fix to green.',
  whenToUse: 'After the clarify pass is answered. Runs the full hands-off build of spec 001.',
  phases: [
    { title: 'Phase 0: Setup', detail: 'scaffold, deps, tailwind, alias' },
    { title: 'Phase 1: Renderer', detail: 'WebGPU + WebGL2 fallback, TSL smoke' },
    { title: 'Phase 2: Shell/Routing', detail: 'persistent canvas, router, store' },
    { title: 'Phase 3: Hub Field', detail: 'TSL particle field + portals' },
    { title: 'Phase 4: Project System', detail: 'registry + lazy scene/content' },
    { title: 'Phase 5: Transitions', detail: 'camera fly + field warp' },
    { title: 'Phase 6: Motion/UI', detail: 'Motion transitions, responsive' },
    { title: 'Phase 7: Postprocess/Polish', detail: 'bloom, scaling, badges' },
    { title: 'Phase 8: Scale/Deploy (release)', detail: 'more projects, build, full-gate' },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTE: This is the orchestration scaffold. It assumes the clarify questions in
// spec.md are already answered (workflow sub-agents cannot prompt the user). It
// implements each phase, runs the applicable quality gates in parallel, and
// fix-loops on blocking findings up to maxRounds. Tune prompts/gate commands to
// your installed tool versions before relying on it unattended.
// ─────────────────────────────────────────────────────────────────────────────

const MAX_ROUNDS = 3

const FINDINGS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['gate', 'pass', 'findings'],
  properties: {
    gate: { type: 'string' },
    pass: { type: 'boolean', description: 'true if no blocking findings' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['severity', 'title', 'fix'],
        properties: {
          severity: { type: 'string', enum: ['blocking', 'warn', 'info'] },
          file: { type: 'string' },
          title: { type: 'string' },
          evidence: { type: 'string' },
          fix: { type: 'string' },
        },
      },
    },
  },
}

// Gate prompts keyed by id — each agent reads .specify/quality-gates.md for full criteria.
const GATE = {
  performance: 'PERFORMANCE gate (quality-gates.md §1). Check fps budgets (≥55 WebGPU / ≥30 WebGL2), no per-frame allocations in useFrame, GPU disposal on unmount, hub JS <250KB gzip, lazy chunks, DPR clamp. Build and inspect; report blocking findings.',
  efficiency: 'EFFICIENCY/CODE-QUALITY gate (§2). Run tsc --noEmit + eslint; check DRY/reuse, one-canvas + registry abstraction intact, no any across boundaries, no dead code/unused deps. Report blocking findings.',
  security: 'SECURITY gate (§3). Run npm audit; grep for secrets, dangerouslySetInnerHTML w/ untrusted input, eval/new Function, unsandboxed embeds; review dep diff. No high/critical. Report blocking findings.',
  correctness: 'CORRECTNESS gate (§4). Run tsc + vite build; boot dev/preview headless; load / and /project/<id> on BOTH WebGPU and ?webgl; assert canvas present + zero console errors; verify the phase FRs work. Report blocking findings.',
  parity: 'CROSS-BACKEND PARITY gate (§5). Load / and /?webgl headless; confirm equivalent render (no black screen / missing material on either), screenshot-diff structural differences, no backend-only crash, backend correctly reported. Report blocking findings.',
  a11y: 'ACCESSIBILITY/RESPONSIVE gate (§6). Viewport matrix 360/768/1280/1920 + portrait; emulate prefers-reduced-motion (verify 2D+3D calm); axe-core; keyboard nav + focus; contrast AA; touch hit-areas ≥44px; non-WebGL fallback present. Report blocking findings.',
  spec: 'SPEC-ALIGNMENT gate (§7). Cross-read spec.md FRs ↔ code ↔ tasks.md; build FR→file→status coverage matrix; flag any constitution violation or weakened gate. Report blocking findings.',
}

// Phase plan — mirrors tasks.md + the gate matrix in quality-gates.md.
const PHASES = [
  { key: 'Phase 0: Setup',           doc: 'docs/01-setup.md',               tasks: 'T001-T004', gates: ['efficiency', 'security', 'correctness'] },
  { key: 'Phase 1: Renderer',        doc: 'docs/02-renderer-webgpu.md',     tasks: 'T010-T014', gates: ['performance', 'efficiency', 'correctness', 'parity'] },
  { key: 'Phase 2: Shell/Routing',   doc: 'docs/03-app-shell-routing.md',   tasks: 'T020-T025', gates: ['efficiency', 'correctness'] },
  { key: 'Phase 3: Hub Field',       doc: 'docs/04-hub-portal-field.md',    tasks: 'T030-T033', gates: ['performance', 'efficiency', 'correctness', 'parity'] },
  { key: 'Phase 4: Project System',  doc: 'docs/05-project-system.md',      tasks: 'T040-T044', gates: ['efficiency', 'security', 'correctness', 'spec'] },
  { key: 'Phase 5: Transitions',     doc: 'docs/06-transitions.md',         tasks: 'T050-T053', gates: ['performance', 'efficiency', 'correctness', 'a11y'] },
  { key: 'Phase 6: Motion/UI',       doc: 'docs/09-ui-motion.md',           tasks: 'T060-T063', gates: ['efficiency', 'correctness', 'a11y'] },
  { key: 'Phase 7: Postprocess/Polish', doc: 'docs/07-postprocessing-polish.md', tasks: 'T070-T072', gates: ['performance', 'efficiency', 'correctness', 'parity', 'a11y'] },
  { key: 'Phase 8: Scale/Deploy (release)', doc: 'docs/08-scale-deploy.md', tasks: 'T080-T083', gates: ['performance', 'efficiency', 'security', 'correctness', 'parity', 'a11y', 'spec'] },
]

const CONTEXT = `Project: Portal Field Portfolio (R3F + WebGPU/WebGL2, TS, Tailwind v4, Motion).
Authoritative refs in repo: .specify/memory/constitution.md, .specify/specs/001-portal-portfolio/{spec,plan,tasks}.md,
.specify/quality-gates.md, and the docs/ phase guides. Follow the constitution; do not weaken any gate.`

const report = []

for (const p of PHASES) {
  phase(p.key)

  // 1) Implement the phase.
  await agent(
    `${CONTEXT}\n\nIMPLEMENT ${p.key} (tasks ${p.tasks}). Follow ${p.doc} exactly. ` +
    `Write/scaffold all files for this phase, install needed deps, and make it build. ` +
    `Match the architecture in docs/00-architecture.md. Return a short summary of files created/changed.`,
    { label: `implement:${p.key}`, phase: p.key }
  )

  // 2) Gate + fix loop.
  let round = 0
  let blockers = []
  do {
    const results = await parallel(
      p.gates.map((g) => () =>
        agent(`${CONTEXT}\n\nRun the ${GATE[g]}`, { label: `gate:${g}`, phase: p.key, schema: FINDINGS_SCHEMA })
      )
    )
    blockers = results
      .filter(Boolean)
      .flatMap((r) => (r.findings || []).filter((f) => f.severity === 'blocking').map((f) => ({ ...f, gate: r.gate })))

    log(`${p.key}: round ${round + 1} → ${blockers.length} blocking finding(s)`)

    if (blockers.length === 0) break

    if (round < MAX_ROUNDS) {
      await agent(
        `${CONTEXT}\n\nFIX these blocking gate findings for ${p.key} without weakening any gate:\n` +
        blockers.map((b, i) => `${i + 1}. [${b.gate}] ${b.title} — ${b.file || ''}\n   evidence: ${b.evidence || ''}\n   fix: ${b.fix}`).join('\n') +
        `\n\nApply the fixes, keep it building, return a summary.`,
        { label: `fix:${p.key}:r${round + 1}`, phase: p.key }
      )
    }
    round++
  } while (round <= MAX_ROUNDS)

  report.push({ phase: p.key, rounds: round, unresolvedBlockers: blockers })

  if (blockers.length > 0) {
    log(`⚠ ${p.key}: ${blockers.length} blocker(s) survived ${MAX_ROUNDS} rounds — ESCALATE to user before continuing.`)
    // Stop the run so the orchestrator can ask the user a focused question.
    break
  }
}

return { report }
