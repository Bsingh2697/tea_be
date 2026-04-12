# src/shared/middlewares/ — CLAUDE.md

Express middlewares applied in the route chain.

## `auth.middleware.ts`

Two named exports used on routes:

**`protect`** — JWT authentication guard
- Extracts Bearer token from `Authorization` header
- Verifies against `config.jwt.secret`
- Fetches user from DB, checks `isActive`
- Sets `req.user` — available in all downstream handlers
- Throws `AuthenticationError` (401) on any failure

**`authorize(...roles)`** — Role-based authorization
- Must come after `protect` (needs `req.user`)
- Accepts one or more `UserRole` values
- Throws `AuthorizationError` (403) if user's role not in allowed list

Usage pattern:
```ts
router.get('/admin-only', protect, authorize(UserRole.ADMIN), handler)
// or in user.routes.ts where protect is applied at router level:
router.get('/all', authorize(UserRole.ADMIN), validate(schema), handler)
```

## `error.middleware.ts`

Central error handler — registered last in `app.ts` (`app.use(errorHandler)`).

Handles and maps:
| Error type | HTTP status |
|-----------|-------------|
| `AppError` subclasses | Uses their `statusCode` |
| Mongoose `CastError` | 404 |
| Mongoose duplicate key (11000) | 400 |
| Mongoose `ValidationError` | 400 |
| `JsonWebTokenError` | 401 |
| `TokenExpiredError` | 401 |
| Unhandled | 500 |

In development, response includes `stack` field.

## `validation.middleware.ts`

Wraps a Joi schema and validates `req.body` / `req.params` / `req.query`.

```ts
validate(joiSchema)  // returns Express middleware
```

Schemas are structured as `{ body: Joi.object({...}), params: ..., query: ... }`.
Throws `ValidationError` (400) with Joi's error message on failure.
