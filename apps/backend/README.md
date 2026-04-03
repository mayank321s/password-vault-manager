# Backend API

NestJS backend for the Password Manager application with zero-knowledge architecture.

## Setup

### 1. Install Dependencies

```bash
# From root directory
pnpm install
```

### 2. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and set your values
```

**Important:** Make sure to set strong, random values for:
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `ARGON2_SERVER_SALT`
- `DATABASE_PASSWORD`

### 3. Set up PostgreSQL Database

Create a PostgreSQL database:

```sql
CREATE DATABASE password_manager;
```

Update the database configuration in your `.env` file.

### 4. Run Migrations

```bash
# Create the database (if not created manually)
pnpm db:create

# Run all migrations
pnpm db:migrate
```

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed database setup instructions.

## Development

```bash
# Run in development mode
pnpm dev

# Run with watch mode
pnpm start:dev

# Run in debug mode
pnpm start:debug
```

The API will be available at `http://localhost:3001/api`

## Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

## Build

```bash
# Build for production
pnpm build

# Run production build
pnpm start:prod
```

## Project Structure

```
src/
├── common/           # Shared utilities
│   ├── logger/       # Winston logger with PII redaction
│   ├── pipes/        # Validation pipes (Zod)
│   └── health/       # Health check endpoints
├── config/           # Configuration files
│   ├── app.config.ts
│   ├── database.config.ts
│   ├── jwt.config.ts
│   ├── security.config.ts
│   └── throttle.config.ts
├── database/         # Database related files
│   ├── migrations/   # Sequelize migrations
│   ├── seeders/      # Database seeders
│   └── database.module.ts
├── app.module.ts     # Root module
└── main.ts           # Application entry point
```

## Database Commands

```bash
# Create database
pnpm db:create

# Run migrations
pnpm db:migrate

# Rollback last migration
pnpm db:migrate:undo

# Generate new migration
pnpm migration:generate create-users-table

# Run seeders
pnpm db:seed

# Drop database (WARNING: destroys all data)
pnpm db:drop
```

## Health Check Endpoints

```bash
# Check application health
curl http://localhost:3001/api/health

# Check database connection
curl http://localhost:3001/api/health/db

# Check readiness
curl http://localhost:3001/api/health/ready
```

## Security Features

- **Helmet**: Secure HTTP headers
- **CORS**: Strict origin control
- **Rate Limiting**: Throttling on all endpoints
- **Winston Logger**: PII redaction for sensitive data
- **Validation**: Global validation with whitelist and transform
- **Argon2**: Double-hashing for password authentication

## API Documentation

API documentation will be available via Swagger at `/api/docs` (to be implemented in later phases).

## Learn More

- [NestJS Documentation](https://docs.nestjs.com)
- [NestJS Courses](https://courses.nestjs.com)
