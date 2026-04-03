---
name: 'Backend Standards'
description: 'Coding conventions and architecture guidelines for the NestJS backend'
applyTo: 'apps/backend/**'
---

# Backend Instructions

## Code Style

- **Framework**: [NestJS](https://nestjs.com/) with TypeScript.
- **Linting**: ESLint — config at `packages/eslint-config/nest.js`.
- **Formatting**: Prettier with single quotes — config at `packages/eslint-config/prettier-base.js`.
- **Key example**: `apps/backend/src/app.module.ts`.

## Conventions

- Follow NestJS patterns: `@Module`, `@Controller`, `@Injectable`, `@Get`, `@Post`, etc.
- All async operations must return `Promise`.
- Use dependency injection via constructor parameters — never instantiate services manually.
- Group related functionality into feature modules under `apps/backend/src/api/`.

## Database

- **Use Sequelize ORM exclusively** for all database queries.
- Never write raw SQL — use model methods, scopes, and query builders.
- Models live in `apps/backend/src/database/models/`.
- Repositories live in `apps/backend/src/database/repositories/`.

## DTOs and Validation

- **Always create DTOs from shared Zod schemas** using `createZodDto` from `nestjs-zod`.
- Define each DTO in its own file, e.g. `src/users/dto/create-user.dto.ts`.
- `ZodValidationPipe` is applied **globally** — do **not** add `@UsePipes` in controllers.

```typescript
// src/users/dto/create-user.dto.ts
import { createZodDto } from 'nestjs-zod';
import { CreateUserSchema } from '@repo/shared';

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
```

```typescript
// src/users/users.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  @Post()
  async createUser(@Body() user: CreateUserDto) {
    // user is fully validated — no @UsePipes needed
  }
}
```

## TypeScript and Security

- Strict TypeScript — no `any`. Use `as unknown as T` only when absolutely necessary and add a comment explaining why.
- Always check for security vulnerabilities (e.g. injection, improper auth, sensitive data exposure) and suggest fixes.
- If an instruction seems incorrect or risky, warn the user and propose a safer alternative.

---

---
name: 'Frontend Standards'
description: 'Coding conventions and architecture guidelines for the React frontend'
applyTo: 'apps/frontend/**'
---

# Frontend Instructions

## Code Style

- **Framework**: [React](https://react.dev/) with [Vite](https://vitejs.dev/) and TypeScript.
- **Linting**: ESLint — config at `packages/eslint-config/react-internal.js`.
- **Formatting**: Prettier with single quotes.
- **Key example**: `apps/frontend/src/App.tsx`.

## Component Structure

Every component lives in its own directory and contains exactly **four files**:

| File | Purpose |
|------|---------|
| `types.ts` | Component-specific TypeScript types and interfaces |
| `hooks.ts` | Custom hooks, including all TanStack Query API calls |
| `[component-name].tsx` | The React component |
| `css.ts` | Styles using `vanilla-extract` |

- All filenames must be in `kebab-case`.
- Components live in `apps/frontend/src/components/`.
- Pages live in `apps/frontend/src/pages/`.
- react-query query and mutation hooks live in `apps/frontend/src/hooks`
- API call using axios lives in `apps/frontend/src/services`


## Conventions

- Use functional components only. No class components.
- Use `.tsx` for files containing JSX, `.ts` for everything else.
- Reuse existing components and styles wherever possible before creating new ones.
- Use Promises and async/await over promise chains.

## Data Fetching

- Use **TanStack React Query** exclusively for all server state and API calls.
- Define every API call as a separate custom hook inside `apps/frontend/src/hooks/[service-name].hook.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { TUser } from '@repo/shared';
import { apiClient } from '../lib/api-client';

export const useUserProfile = (userId: string) =>
  useQuery<TUser>({
    queryKey: ['user', userId],
    queryFn: () => apiClient.get<TUser>(`/api/v1/user/${userId}`)
  });
```

## Styling

- Use **`vanilla-extract`** for all styles — no plain `.css` files or inline styles.
- Style files use the `.css.ts` extension (named `css.ts` inside the component directory).
- Define a **central color palette** in a constants file with semantically meaningful names.

```typescript
// src/common/styles/colors.ts
export const colors = {
  primaryBackground: '#ffffff',
  surfaceBackground: '#f5f5f5',
  textDefault: '#1a1a1a',
  textSubtle: '#666666',
  accentPrimary: '#0066cc',
  destructive: '#cc0000',
};
```

Import and reuse these tokens in every `css.ts` file instead of hardcoding values.

## TypeScript and Security

- Strict TypeScript — no `any`. Use `as unknown as T` only when absolutely necessary and add a comment explaining why.
- Always check for security vulnerabilities (e.g. XSS, improper input handling, sensitive data in state) and suggest fixes.
- If an instruction seems incorrect or risky, warn the user and propose a safer alternative.
