---
name: Orval zod codegen needs zod/v4 import
description: Why the api-spec codegen script rewrites the zod import in generated api.ts
---

Rule: keep the `sed` step in `lib/api-spec/package.json`'s codegen script that rewrites `from 'zod'` → `from 'zod/v4'` in `lib/api-zod/src/generated/api.ts`.

**Why:** Orval v8 emits zod-v4 API calls (e.g. `zod.int()`), but the workspace catalog pins zod 3.25.x whose top-level export is v3 — typecheck fails with TS2339 `Property 'int' does not exist` right after codegen.

**How to apply:** If codegen suddenly fails with that error, the sed step was probably removed or the generated path changed. If zod is ever upgraded to v4 top-level, the sed becomes unnecessary.
