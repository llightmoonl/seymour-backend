# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

NestJS backend API for neural network research (Hebbian learning, Delta rule, Backpropagation). TypeScript with PostgreSQL via Prisma.

## Commands

```bash
npm run dev          # Start in watch mode (development)
npm run build        # Compile TypeScript
npm run prod         # Run compiled output from dist/
npm run lint         # ESLint with auto-fix
npm run format       # Prettier (src/**/*.ts and test/**/*.ts)
npm run test         # Jest unit tests
npm run test:e2e     # E2E tests
npm run dev:docker   # Docker: migrate + generate prisma client + start watch
```

## Environment Variables

Required in `.env`:

```
DATABASE_URL="postgresql://root:123456@localhost:5433/seymour?schema=public"
JWT_SECRET='secret'
JWT_ACCESS_TOKEN_TTL='2h'
JWT_REFRESH_TOKEN_TTL_SHORT='15m'
JWT_REFRESH_TOKEN_TTL_LONG='7d'
```

Optional: `APP_PORT` (defaults to 4000).

## Prisma (Non-Standard Setup)

The schema is split across multiple files in `prisma/schema/` (not the standard `prisma/schema.prisma`). This is configured via `prisma.config.ts`.

The generated Prisma client is output to `prisma/src/generated/prisma/` — **not** `node_modules/@prisma/client`. Always import from this path:

```ts
import { PrismaClient } from '../../prisma/src/generated/prisma/client.js';
// or use the injected PrismaService from src/prisma/
```

Migration workflow:

```bash
npx prisma migrate dev --name <migration-name>   # Create new migration
npx prisma migrate deploy                         # Apply migrations
npx prisma generate                               # Regenerate client after schema changes
```

## ES Modules

`package.json` has `"type": "module"`. All imports must use file extensions (`.js`) in compiled output. NestJS/ts-jest handle this automatically — don't add `.js` manually to TypeScript source imports.

## Docker

PostgreSQL runs on port **5433** locally (mapped to 5432 inside the container). Start the full stack:

```bash
docker compose up
```

The `db` service must be healthy before the `app` service starts (health check configured in `compose.yaml`).

## Code Style

- Single quotes, trailing commas (`"all"`) — enforced by Prettier
- `@typescript-eslint/no-explicit-any` is disabled — `any` is allowed
- Experimental decorators are enabled (NestJS DI pattern)
- Global `ValidationPipe` with `transform: true` is applied in `main.ts` — all DTOs are auto-transformed

## Testing

No test files exist yet. Use `npm run lint && npm run build` as the verification loop until tests are added.
