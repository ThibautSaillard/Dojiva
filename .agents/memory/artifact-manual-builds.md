---
name: Manual vite builds need workflow env vars
description: Running an artifact's vite build/preview from the shell fails without PORT and BASE_PATH.
---

The artifact vite.config.ts files in this monorepo throw at config-load time unless `PORT` and `BASE_PATH` are set. Workflows inject them automatically; a manual shell build does not get them.

**Why:** Validating a production build with `pnpm --filter <pkg> run build` failed twice (PORT, then BASE_PATH) before passing.

**How to apply:** For manual build validation use e.g. `PORT=5000 BASE_PATH=/ pnpm --filter @workspace/dojiva run build` (BASE_PATH matches the artifact's previewPath, `/` for dojiva).
