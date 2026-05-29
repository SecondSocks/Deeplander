# Repository Guidelines

## Project Structure & Module Organization

This is a Bun + TypeScript Telegram bot backed by Prisma. The runtime entry is `index.ts`; application bootstrapping lives in `src/app/bootstrap.ts`.

- `src/bot/`: Telegram handlers, commands, callbacks, and middlewares.
- `src/modules/`: domain services and repositories such as `ai`, `dialog`, and `user`.
- `src/features/`: feature-level orchestration, currently chat logic and prompts.
- `src/entities/`: lower-level persistence repositories.
- `src/infra/`: external integrations: Telegram, logger, Redis, Supabase.
- `src/shared/`: common configs, constants, errors, types, and utilities.
- `prisma/` contains `schema.prisma` and migrations. `src/generated/prisma/` is generated Prisma output; do not hand-edit it.

## Build, Test, and Development Commands

Prefer Bun commands in this repository.

```bash
bun install
```

Install dependencies from `bun.lock`.

```bash
bun run index.ts
```

Run the bot locally. Ensure required `.env` values are present before starting.

```bash
bun test
```

Run Bun tests. No tests are currently committed; add tests with new behavior.

```bash
bunx prisma generate
bunx prisma migrate dev
```

Regenerate Prisma client and apply local migrations.

## Coding Style & Naming Conventions

Use strict TypeScript and keep code simple, explicit, and testable. Follow `.prettierrc`: tabs, 2-space tab width, no semicolons, single quotes, no trailing commas.

Use `import type` for type-only imports. Prefix interfaces with `I` and type aliases with `T`. Use PascalCase for classes/types, camelCase for variables/functions, and ALL_CAPS for constants. Prefer union constants over TypeScript `enum`.

Keep responsibilities narrow: handlers should delegate business logic to services; services should not own transport details; repositories should isolate persistence.

## Testing Guidelines

Use `bun:test`. Place tests near the code they verify using `*.test.ts`, for example `src/modules/user/user.service.test.ts`.

Prioritize tests for pure logic, prompt construction, repository contracts, and error paths in handlers/middlewares. Mock external APIs such as Telegram, DeepSeek/OpenAI, Redis, and Postgres unless the test is explicitly integration-level.

## Commit & Pull Request Guidelines

This checkout has no Git history available, so use a consistent convention going forward. Prefer Conventional Commits: `feat: add dialog rate limiting`, `fix: handle missing Telegram user`.

Pull requests should include a concise summary, linked issue if applicable, Prisma migration notes, and test results (`bun test`, plus manual bot checks when relevant).

## Security & Configuration

Do not commit `.env`, tokens, chat IDs, API keys, or database URLs. Validate configuration through `src/app/env.ts` and shared config helpers. Treat generated Prisma files and migrations carefully: review schema changes before applying them to shared environments.
