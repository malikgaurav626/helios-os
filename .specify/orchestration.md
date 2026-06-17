# Autonomous Build Orchestration

How this project gets built **hands-off**: you kick it off once, answer a short batch of questions
up front, and the system implements phase-by-phase, running the [quality gates](./quality-gates.md)
as feedback loops and fixing its own findings — pausing only if a blocker truly needs your decision.

## Design goals (your requirements)

- **You don't drive.** Start it, then only answer occasional agent questions.
- **Feedback loops:** performance, efficiency, security, + correctness, cross-backend parity,
  accessibility/responsive, spec-alignment (see [quality-gates.md](./quality-gates.md)).
- **Self-correcting:** gate findings feed back into fixes automatically (loop until green).

## The two-tier model

```
            ┌──────────────────────────────────────────────────────────┐
            │  ORCHESTRATOR (main agent)                                 │
            │  • walks tasks.md phase by phase                           │
            │  • the ONLY thing that asks you questions (AskUserQuestion)│
            └───────────────┬──────────────────────────────────────────┘
                            │ per phase
        ┌───────────────────┼───────────────────────────────┐
        ▼                   ▼                                ▼
  IMPLEMENTER agent   →   GATE agents (parallel)   →   FIX agent (if blockers)
  writes the phase's      perf · efficiency · sec ·     applies gate fixes,
  code per docs/          correctness · parity ·         re-runs gates
                          a11y · spec-alignment          (loop ≤ maxRounds=3)
```

- **Implementer** does one phase from [tasks.md](./specs/001-portal-portfolio/tasks.md), following the
  matching [`docs/`](../docs/README.md) guide and the [constitution](./memory/constitution.md).
- **Gate agents** run the loops for that phase (per the matrix in
  [quality-gates.md](./quality-gates.md)), each returning structured findings.
- **Fix agent** consumes blocking findings, edits code, and the gates re-run. Up to 3 rounds; an
  unresolved blocker escalates to a user question.

## When the build asks you something (the only inputs you give)

1. **Clarify pass (up front, once).** Before any code, the orchestrator resolves the open questions
   in [spec.md](./specs/001-portal-portfolio/spec.md) → *Open questions* via a single `AskUserQuestion`
   batch. This front-loading is what lets the rest run unattended. Each has a sane default, so you can
   accept defaults fast.
2. **Escalation (rare).** Only if a gate blocker can't be auto-fixed in 3 rounds, or a genuinely
   ambiguous design decision appears. Always a focused multiple-choice question with a recommended
   default.

Everything else — scaffolding, deps, code, profiling, audits, fixes — happens on its own.

## Autonomy rules

- Never weaken a gate to pass it (constitution governance). Fix the code or escalate.
- Prefer reversible actions; the build runs locally (no deploy, no push) unless you ask.
- Destructive/outward actions (publishing, deleting non-generated files) always require confirmation.
- Each phase ends green (gates pass) before the next begins; the release phase runs the full suite.

---

## Kickoff

You have two ways to run it. Both start with the same clarify pass.

### Option A — Orchestrator-driven (recommended for "answer questions as it goes")
Say:
> **"Start the autonomous build of spec 001."**

The orchestrator will: (1) ask the clarify batch, (2) implement Phase 0, (3) run its gates, (4)
fix-loop to green, (5) advance — repeating through Phase 8, surfacing a question only on escalation.
This path keeps the human-in-the-loop question UX you asked for.

### Option B — Workflow script (max parallelism, fewer interactive questions)
A ready script lives at
[workflows/autonomous-build.workflow.js](./workflows/autonomous-build.workflow.js). It runs the
implement→gate→fix pipeline with parallel gate agents. Note: workflow sub-agents **can't** prompt you
mid-run, so answer the clarify batch first; any escalation surfaces when the workflow returns. Start
with:
> **"Run the autonomous-build workflow."**

> Heads-up: a full hands-off build spawns many agents and uses significant tokens. That's expected
> for this scale — just confirming so it's intentional when you say go.

## State & resumability

- Progress is the truth in the repo: `tasks.md` checkboxes + git status + which files exist.
- If interrupted, re-running the kickoff resumes from the first phase whose gates aren't green.
- The workflow script supports resume (see its header) so a stopped run continues from cache.

## What you get at the end

A running app (`npm run dev`), green on all 7 gates, code-split per project, responsive 360px→4K,
WebGPU with WebGL2 fallback, and a one-entry path to add more projects.