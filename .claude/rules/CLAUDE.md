# CLAUDE.md

Instructions for Claude when working in this repository.

## Project Overview

This is a monorepo (`pnpm` workspaces + `turbo`) containing:
- `apps/backend` — NestJS REST API
- `apps/frontend` — React + Vite SPA
- `packages/shared` — Zod schemas and TypeScript types shared across apps
- `packages/crypto-utils` — Cryptographic utilities
- `packages/eslint-config` — Shared ESLint/Prettier configs

App-specific rules live in `.claude/rules/`.

## Commands

```bash
pnpm install        # Install all dependencies
pnpm dev            # Start all dev servers
pnpm build          # Production build
pnpm test           # Run unit tests
pnpm test:e2e       # Run E2E tests
pnpm lint           # Lint all packages
pnpm format         # Format all packages
```

## Shared Package (`packages/shared`)

Import schemas and types from `@repo/shared`. The entry point is `packages/shared/src/index.ts`.

```typescript
// Frontend usage
import { TUser } from '@repo/shared';

// Backend DTO usage
import { CreateUserSchema } from '@repo/shared';
```

## TypeScript

- Strict mode. **Never use `any`.**
- If a type override is unavoidable, use `as unknown as T` with a comment justifying it.

## Security

- Always flag potential vulnerabilities (SQL injection, XSS, auth issues, sensitive data exposure).
- Suggest a concrete fix whenever a vulnerability is identified.
- If a user's instruction introduces a security risk or architectural problem, say so clearly and propose a better approach.

---
---
paths:
  - "apps/frontend/**"
---

# Frontend Rules

## Stack

- React functional components only, TypeScript + `.tsx` for JSX.
- All filenames: `kebab-case`.

## Component Structure

Each component is a directory with exactly four files:

- `types.ts` — component types
- `hooks.ts` — custom hooks and TanStack Query API calls
- `[component-name].tsx` — the component
- `css.ts` — `vanilla-extract` styles

## Data Fetching

TanStack React Query only. API calls go in a separate `hooks/**` folder, not inline in components.

## Styling

`vanilla-extract` only. Import all colors and style fragments from the central palette file:

```ts
import { colors, fragments } from '../../common/css/vars';
```

No hardcoded color values anywhere in `*.css.ts` files.

## Shared Types

Import types from `@repo/shared`:

```ts
import { TUser } from '@repo/shared';
```

---
---
paths:
  - "apps/backend/**"
---

# Backend Rules

## Stack

- NestJS + TypeScript. Use decorators: `@Module`, `@Controller`, `@Injectable`, `@Get`, `@Post`, etc.
- All async methods must return `Promise`.

## Database

Sequelize ORM only. No raw SQL ever.

## DTOs

Always create DTOs from shared Zod schemas using `createZodDto`. `ZodValidationPipe` is registered globally — never add `@UsePipes` locally.

```typescript
// dto/create-user.dto.ts
import { createZodDto } from 'nestjs-zod';
import { CreateUserSchema } from '@repo/shared';
export class CreateUserDto extends createZodDto(CreateUserSchema) {}

// users.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
@Controller('users')
export class UsersController {
  @Post()
  async createUser(@Body() user: CreateUserDto) { /* validated automatically */ }
}
```

## Shared Schemas

Import schemas from `@repo/shared`:

```typescript
import { CreateUserSchema } from '@repo/shared';
```
