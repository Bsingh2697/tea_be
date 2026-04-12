# tea_be — CLAUDE.md

This file is the reference guide for Claude Code when working in this repository. Keep it updated after every significant change or git push.

---

## Project Overview

**Name:** tea_be
**Purpose:** Backend REST API for the TeaLeaf tea ordering application
**Language:** TypeScript (strict mode)
**Runtime:** Node.js 20 (Alpine)
**Framework:** Express.js 4.18.2
**Database:** MongoDB 6 via Mongoose 8
**Cache / Rate Limiting:** Redis 5
**Auth:** JWT (access + refresh tokens) via jsonwebtoken
**Secrets:** Doppler (project: tea_be)
**Containerization:** Docker (multi-stage) + Docker Compose

---

## Repository

- **GitHub repo:** separate from tea_fe (update this field once the remote URL is confirmed)
- **Default branch:** main (verify with `git branch`)
- **CI/CD:** `.github/` workflows

---

## Directory Structure

```
tea_be/
├── src/
│   ├── config/
│   │   ├── db.ts               # MongoDB connection
│   │   └── env.ts              # Joi-validated env vars
│   ├── features/
│   │   ├── auth/               # register, login, logout, refresh-token
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.types.ts
│   │   │   ├── auth.validation.ts
│   │   │   └── auth.routes.ts
│   │   ├── user/               # CRUD + admin functions
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.model.ts
│   │   │   ├── user.types.ts
│   │   │   ├── user.validation.ts
│   │   │   └── user.routes.ts
│   │   └── tea/                # PENDING — schema + module not implemented yet
│   ├── shared/
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts      # protect (JWT) + authorize (RBAC)
│   │   │   ├── error.middleware.ts     # centralized error handler
│   │   │   └── validation.middleware.ts
│   │   └── utils/
│   │       ├── asyncHandler.ts         # async/await wrapper
│   │       ├── error.ts                # AppError, AuthenticationError, etc.
│   │       ├── logger.ts               # Winston (console + file)
│   │       ├── redis.ts                # Redis client
│   │       └── response.ts             # standardized API response formatter
│   ├── app.ts                  # Express setup, middleware chain, route mounting
│   └── server.ts               # Entry point — starts server, handles signals
├── dist/                       # Compiled JS output (tsc)
├── logs/                       # error.log, all.log
├── docs/                       # Markdown documentation
├── terraform/                  # AWS IaC
├── Dockerfile                  # Multi-stage build
├── docker-compose.yml          # api + redis services
├── doppler.yaml                # Doppler project config
└── package.json
```

---

## Import Aliases

Configured in `tsconfig.json` and `package.json`:

| Alias | Resolves to |
|-------|-------------|
| `@config/*` | `src/config/*` |
| `@features/*` | `src/features/*` |
| `@shared/*` | `src/shared/*` |

Always use aliases, never relative `../../` imports across feature boundaries.

---

## API Endpoints

**Base:** `/api/v1/`

### Auth (`/auth`)
| Method | Path | Access | Notes |
|--------|------|--------|-------|
| POST | `/register` | Public | Joi validation |
| POST | `/login` | Public | Redis rate limit: 10 req/5 min |
| POST | `/refresh-token` | Public | TODO: secure later |
| GET | `/me` | Protected | Returns current user |
| POST | `/logout` | Protected | Clears refresh token in DB |

### User (`/user`)
| Method | Path | Access |
|--------|------|--------|
| GET | `/profile` | Protected |
| PUT | `/profile` | Protected |
| GET | `/all` | Admin only |
| GET | `/:id` | Admin only |
| PUT | `/:id` | Admin only |
| DELETE | `/:id` | Admin only (soft delete) |

### Health
| Method | Path | Access |
|--------|------|--------|
| GET | `/health` | Public |

### Tea (`/tea`)
**Not yet implemented** — pending controller, service, and routes.

---

## Architecture Patterns

- **Layered:** Controller → Service → Model
- **Feature-based modules:** each feature is self-contained
- **Middleware chain:** Security → Parsing → Rate limiting → Validation → Route handler → Error handler
- **Custom errors:** `AppError`, `ValidationError`, `AuthenticationError`, `AuthorizationError`, `NotFoundError` — all in `src/shared/utils/error.ts`
- **Async handling:** all controller functions wrapped in `asyncHandler`
- **Response format:** always use `src/shared/utils/response.ts` helpers, never raw `res.json()`

---

## Authentication & Authorization

- **Access token:** JWT signed with `JWT_SECRET`, default expiry 7d
- **Refresh token:** JWT signed with `JWT_REFRESH_SECRET`, default expiry 30d, stored in DB
- **Password hashing:** bcrypt pre-save hook on User model
- **Login:** supports email OR phone
- **RBAC roles:** `admin`, `user`, `vendor`
- **Middlewares:** `protect` (verifies JWT) → `authorize(...roles)` (checks role)

---

## User Model

```typescript
{
  name: string          // max 50 chars
  email: string         // unique
  password: string      // hashed, min 6 chars
  role: 'admin' | 'user' | 'vendor'   // default: user
  phone: string         // unique, 10-digit
  address: { street, city, state, zipCode, country }
  isActive: boolean     // soft delete flag
  isEmailVerified: boolean
  refreshToken: string  // stored for validation
  timestamps: true
}
```

---

## Environment Variables

| Variable | Required | Default |
|----------|----------|---------|
| `NODE_ENV` | No | `development` |
| `PORT` | No | `5000` |
| `MONGODB_URI` | **Yes** | — |
| `JWT_SECRET` | **Yes** | — |
| `JWT_REFRESH_SECRET` | **Yes** | — |
| `JWT_EXPIRE` | No | `7d` |
| `JWT_REFRESH_EXPIRE` | No | `30d` |
| `BCRYPT_ROUNDS` | No | `10` |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | No | `100` |
| `CORS_ORIGIN` | No | `*` |
| `REDIS_URL` | No | `redis://redis:6379` |
| `LOG_LEVEL` | No | `info` |

Use Doppler: `npm run doppler:dev` to pull secrets to `.env`.

---

## NPM Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Nodemon + ts-node watch mode |
| `npm run build` | Compile TS → `dist/` |
| `npm run start` | Run compiled `dist/server.js` |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run test` | Jest with coverage |
| `npm run test:watch` | Jest watch mode |
| `npm run doppler:dev` | Pull dev secrets to `.env` |
| `npm run doppler:stg` | Pull staging secrets to `.env` |

---

## What's Still Pending

- [ ] Tea module (`src/features/tea/`) — schema, service, controller, routes
- [ ] Unit and integration tests (Jest infrastructure is configured)
- [ ] Swagger/OpenAPI documentation
- [ ] Email verification flow
- [ ] Seed script (`seed.ts`)

---

## Docker

```bash
# Local dev with Redis
docker-compose up

# Production build
docker build -t tea_be .
```

Docker Compose exposes the API on port `8080` (mapped from internal `3002`).

---

## Logging

Winston writes to:
- `logs/error.log` — errors only
- `logs/all.log` — all levels
- Console — colored output in dev

---

_Last updated: 2026-03-30_
