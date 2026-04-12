# src/features/auth/ — CLAUDE.md

Handles user registration, login, logout, token refresh, and current-user retrieval.

## Routes (`/api/v1/auth`)

| Method | Path | Middleware | Handler |
|--------|------|-----------|---------|
| POST | `/register` | `validate(registerSchema)` | `authController.register` |
| POST | `/login` | `loginRateLimiter`, `validate(loginSchema)` | `authController.login` |
| POST | `/refresh-token` | `validate(refreshTokenSchema)` | `authController.refreshToken` |
| GET | `/me` | `protect` | `authController.getCurrentUser` |
| POST | `/logout` | `protect` | `authController.logout` |

**Login rate limit:** 10 requests per 5 minutes per IP, backed by Redis (`RedisStore`).

## Types (`auth.types.ts`)

```ts
ILoginCredentials  { email?, phone?, password }   // at least one of email/phone required
IRegisterData      { name, email, password, phone }
IAuthTokens        { accessToken, refreshToken }
IAuthResponse      { user: { _id, name, email, role }, tokens: IAuthTokens }
ITokenPayload      { id, email, role }             // JWT payload
```

## Service (`auth.service.ts`)

| Method | What it does |
|--------|-------------|
| `register(data)` | Creates user via `userService.createUser`, generates tokens, stores refresh token |
| `login(data)` | Finds user by email or phone, verifies password, checks `isActive`, generates tokens |
| `refreshToken(token)` | Verifies refresh JWT, checks stored token matches DB, issues new tokens |
| `logout(userId)` | Sets `refreshToken = null` in DB via `userService.updateRefreshToken` |
| `generateTokens(payload)` | Signs access (JWT_SECRET) + refresh (JWT_REFRESH_SECRET) tokens — private |

## Validation (`auth.validation.ts`)

- `registerSchema`: name (max 50), email, password (min 6), phone (10 digits), role (optional)
- `loginSchema`: password required + `.or("email","phone")` — must have at least one
- `refreshTokenSchema`: refreshToken string required

## Notes
- Auth service delegates all user DB operations to `userService` — it does not touch the User model directly
- `req.user` is set by `protect` middleware (from `auth.middleware.ts`), not here
- TODO: `/refresh-token` route has a comment "Remove this later" — may be secured or moved
