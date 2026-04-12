# src/config/ — CLAUDE.md

Configuration layer. Loaded once at startup.

## Files

### `env.ts`
Validates all environment variables using Joi at startup — throws if required vars are missing.
Exports a single `config` object used throughout the app:

```ts
config.env           // NODE_ENV
config.port          // PORT
config.mongoose.uri  // MONGODB_URI
config.jwt.secret / .expire / .refreshSecret / .refreshExpire
config.bcrypt.rounds
config.rateLimit.windowMs / .max
config.cors.origin
config.log.level
config.redis.url
```

**Required env vars (no default):** `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`

### `db.ts`
Establishes the Mongoose connection using `config.mongoose.uri`.
Logs connection success/failure. Handles graceful disconnect on `SIGINT`.

## Rules
- Never access `process.env` directly anywhere else in the codebase — always import `config` from `@config/env`
- Never add business logic here — config only
