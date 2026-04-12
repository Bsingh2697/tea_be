# src/shared/utils/ — CLAUDE.md

Pure utility modules. Import these anywhere via `@shared/utils/<name>`.

## `asyncHandler.ts`
Wraps an async controller function so Express catches thrown errors automatically.
Every controller method must be wrapped:
```ts
myMethod = asyncHandler(async (req, res, next) => { ... })
```

## `error.ts`
Custom error class hierarchy — always throw these, never plain `new Error()`:

| Class | HTTP Status | Default message |
|-------|-------------|----------------|
| `AppError` | (set by caller) | — |
| `ValidationError` | 400 | "Validation Failed" |
| `AuthenticationError` | 401 | "Authentication Error" |
| `AuthorizationError` | 403 | "Access denied" |
| `NotFoundError` | 404 | "Resource not found" |
| `ConflictError` | 409 | "Resource already exists" |
| `InternalServerError` | 500 | "Internal server error" |

The `errorHandler` middleware in `shared/middlewares/error.middleware.ts` catches all of these and maps them to correct HTTP responses.

## `response.ts`
Standardized API response formatter. **Always use this — never `res.json()` directly.**

| Method | Status | Use when |
|--------|--------|---------|
| `ResponseHandler.success(res, data, message?)` | 200 | Normal success |
| `ResponseHandler.created(res, data, message?)` | 201 | Resource created |
| `ResponseHandler.error(res, message, status?, errors?)` | varies | Manual error response |
| `ResponseHandler.paginated(res, data[], page, limit, total, message?)` | 200 | List endpoints |

Response shape:
```json
{ "success": true, "message": "...", "data": {...} }
{ "success": true, "data": [...], "pagination": { "page", "limit", "total", "pages" } }
{ "success": false, "error": "..." }
```

## `logger.ts`
Winston logger. Import and use:
```ts
import logger from '@shared/utils/logger'
logger.info('...')
logger.error('...')
```
Writes to `logs/error.log` (errors only) and `logs/all.log` (all levels). Console output in dev.

## `redis.ts`
Exports the Redis client instance. Used by rate limiter in `auth.routes.ts` and available for caching.
```ts
import redisClient from '@shared/utils/redis'
```
Connects to `config.redis.url` (default: `redis://redis:6379`).
