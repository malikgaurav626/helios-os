# 01 — Setup (scaffold, deps, Tailwind, alias)

Goal: a running Vite + React + TS app with all dependencies, Tailwind v4, and a `@` path alias.

## 1. Scaffold

The dir already contains `.claude/` and `.vscode/`, so the Vite scaffolder will warn that it's not
empty — choose **"Ignore files and continue"**.

```bash
npm create vite@latest . -- --template react-ts
npm install
```

## 2. Dependencies

```bash
# runtime
npm install three @react-three/fiber @react-three/drei zustand react-router-dom maath

# types
npm install -D @types/three

# styling (Tailwind v4)
npm install tailwindcss @tailwindcss/vite

# optional dev-only debug panel
npm install -D leva
```

Pin expectations: `@react-three/fiber` must be **v9+** (async `gl`). `three` should be **r171+**
(WebGPURenderer auto-fallback). `react-router-dom` **v7**.

## 3. Tailwind v4 wiring

`vite.config.ts` — add the Tailwind plugin and the `@` alias:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

`src/styles/index.css`:

```css
@import "tailwindcss";

html, body, #root { height: 100%; margin: 0; background: #05060a; color: #e8eaf0; }
```

Import it once in `src/main.tsx`: `import '@/styles/index.css'`.

## 4. TypeScript path alias

In `tsconfig.json` (or `tsconfig.app.json`, wherever `compilerOptions` lives) add:

```jsonc
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

Keep `"strict": true`.

## 5. Clean the template

- Delete `src/App.css`, the Vite/React boilerplate in `src/App.tsx`, and the demo SVG assets.
- Leave `src/main.tsx` (you'll rewrite it in [03-app-shell-routing.md](./03-app-shell-routing.md)).

## Checklist

- [ ] `npm run dev` serves a blank dark page with no console errors
- [ ] `@/...` imports resolve in both Vite and the TS language server
- [ ] A Tailwind class (e.g. `className="text-red-500"`) visibly applies
- [ ] `three`, `@react-three/fiber@9`, `react-router-dom@7` present in `package.json`

## Gotchas

- If `@/` resolves at runtime but the editor shows red squiggles, the alias is in `vite.config.ts`
  but missing from `tsconfig`. Both are required.
- `path` import needs Node types — they ship with `@types/node` (often already present via Vite). If
  TS complains about `__dirname`/`node:path`, `npm install -D @types/node`.