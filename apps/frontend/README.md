# Frontend

React + Vite frontend for the Password Manager application with zero-knowledge architecture.

## Setup

### 1. Install Dependencies

```bash
# From root directory
pnpm install
```

### 2. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local and set your values
```

### 3. Start Development Server

```bash
# From root directory
pnpm --filter frontend dev

# Or from this directory
pnpm dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/       # Reusable React components
├── pages/           # Page components
├── services/        # API service functions
├── store/           # Zustand state management
│   ├── auth.store.ts
│   ├── vault.store.ts
│   └── ui.store.ts
├── lib/             # Utility libraries
│   ├── api-client.ts    # Axios API client
│   └── indexed-db.ts    # IndexedDB wrapper
├── config/          # Configuration
│   └── index.ts
├── App.tsx          # Root component with routing
└── main.tsx         # Application entry point
```

## Features

- **React Router**: SPA routing with protected routes
- **Zustand**: Lightweight state management
- **Axios**: HTTP client with interceptors
- **IndexedDB**: Secure local storage for encrypted keys
- **Zod**: Client-side validation
- **DOMPurify**: XSS protection
- **Crypto Utils**: Browser-side encryption (RSA-4096, AES-256-GCM)

## Scripts

```bash
# Development
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint
pnpm lint

# Type checking
pnpm check-types

# Run tests
pnpm test
```

## Security Considerations

### Client-Side Encryption
All sensitive data is encrypted on the client before being sent to the server:
- Master password never leaves the client in plaintext
- Private keys are stored encrypted in IndexedDB
- All password data is encrypted with vault keys

### Content Security Policy
The app enforces strict CSP headers to prevent XSS attacks.

### Auto-Lock
The app automatically locks after 15 minutes of inactivity (configurable).

## Development Guidelines

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `App.tsx`
3. Add navigation links as needed

### State Management
- Use Zustand stores for global state
- Keep store logic minimal and focused
- Use React hooks for local component state

### API Calls
- Use `apiClient` from `lib/api-client.ts`
- Handle errors with try-catch
- Update UI store for loading/error states

### Cryptography
- Import functions from `@repo/crypto-utils`
- Never store unencrypted sensitive data
- Clear sensitive data from memory after use

## Learn More

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [React Router](https://reactrouter.com)
- [Zustand](https://zustand-demo.pmnd.rs/)
