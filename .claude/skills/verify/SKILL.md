---
name: verify
description: Lint and build the project to validate changes. Use after making code changes to catch type errors and lint violations before committing. No tests exist yet, so this is the primary verification loop.
---

Run the following commands in sequence and report any errors:

1. `npm run lint` — ESLint with auto-fix. If it fails, show the remaining errors.
2. `npm run build` — TypeScript compilation. If it fails, show the type errors and fix them.

If both pass, confirm the changes are clean. If either fails, fix the issues before reporting success.
