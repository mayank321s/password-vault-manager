# Password Manager

A zero-knowledge password manager built with security as the top priority. This application uses end-to-end encryption to ensure that passwords are never stored or transmitted in plain text.

## Architecture

- **Frontend**: React (SPA) with Vite
- **Backend**: NestJS (Node.js)
- **Database**: PostgreSQL
- **Monorepo**: Turborepo with pnpm

## Security Features

- **Zero-knowledge architecture**: Server never sees unencrypted data
- **RSA-4096 encryption**: For key exchange and vault access
- **AES-256-GCM encryption**: For password storage
- **PBKDF2**: 600,000+ iterations for key derivation
- **Argon2**: Double-hashing for authentication
- **BIP39 seed phrases**: For account recovery
- **Content Security Policy**: XSS protection
- **Rate limiting**: Brute force protection

## What's inside?

This Turborepo includes the following packages & apps:

### Apps and Packages

```shell
.
├── apps
│   ├── backend                   # NestJS backend API
│   └── frontend                  # React + Vite frontend
└── packages
    ├── @repo/shared              # Shared types and Zod validation schemas
    ├── @repo/crypto-utils        # Cryptographic utility functions
    ├── @repo/api                 # Shared NestJS resources
    ├── @repo/eslint-config       # ESLint configurations
    ├── @repo/jest-config         # Jest configurations
    ├── @repo/typescript-config   # TypeScript configurations
    └── @repo/ui                  # Shared React components
```

Each package and application is written in [TypeScript](https://www.typescriptlang.org/).

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 8.15.5
- PostgreSQL database

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# Configure your database and secrets in .env files
```

### Development

```bash
# Run all apps and packages in development mode
pnpm dev

# Run only the backend
pnpm --filter backend dev

# Run only the frontend
pnpm --filter frontend dev
```

The frontend will be available at `http://localhost:3000` and the backend API at `http://localhost:3001`.

### Build

```bash
# Build all apps and packages
pnpm build

# Build specific app
pnpm --filter backend build
pnpm --filter frontend build
```

### Testing

```bash
# Run all tests
pnpm test

# Run e2e tests
pnpm test:e2e

# Run tests for specific package
pnpm --filter backend test
```

### Linting & Formatting

```bash
# Lint all code
pnpm lint

# Format all code
pnpm format
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```bash
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```bash
npx turbo link
```

## Useful Links

This example take some inspiration the [with-nextjs](https://github.com/vercel/turborepo/tree/main/examples/with-nextjs) `Turbo` example and [01-cats-app](https://github.com/nestjs/nest/tree/master/sample/01-cats-app) `NestJs` sample.

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.dev/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.dev/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.dev/docs/reference/configuration)
- [CLI Usage](https://turborepo.dev/docs/reference/command-line-reference)
