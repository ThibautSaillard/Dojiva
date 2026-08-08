---
name: Design subagent contract drift
description: Checks to run after any design-subagent pass on existing pages
---

Rule: after a design subagent restyles existing pages, always (1) run the package typecheck, (2) diff the `data-testid` inventory (`grep -o 'data-testid="[^"]*"' | sort -u`) against the pre-pass state — even when the brief explicitly says to keep them — and (3) screenshot the actual rendered UI: a subagent's "it works" covers types, not rendering (e.g. percentage-positioned children inside a height-auto absolute parent collapse to invisible).

**Why:** On a past design pass (août 2026), the subagent dropped testids despite a hard constraint to keep them, and its framer-motion transitions failed typecheck (ease arrays infer `number[]`, not assignable to `Easing`).

**How to apply:** Budget a fix-up edit after every design pass. For framer-motion ease arrays, cast to a tuple: `ease: [...] as [number, number, number, number]`.
