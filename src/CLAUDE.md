# src/ — CLAUDE.md

All application source code lives here. Nothing outside `src/` runs in production (compiled to `dist/`).

## Structure

| Folder | Purpose |
|--------|---------|
| `config/` | DB connection + Joi-validated env config |
| `features/` | Feature modules — each is self-contained (controller, service, model, routes, types, validation) |
| `shared/` | Cross-cutting concerns: middlewares and utilities used by all features |
| `app.ts` | Express app setup — middleware chain, route mounting |
| `server.ts` | Process entry point — starts server, handles uncaught exceptions + SIGTERM |

## Conventions

- Import aliases: `@config/*`, `@features/*`, `@shared/*` — never use `../../` across feature boundaries
- All controller methods are wrapped in `asyncHandler` from `@shared/utils/asyncHandler`
- All API responses go through `ResponseHandler` from `@shared/utils/response` — never raw `res.json()`
- All thrown errors must be subclasses of `AppError` from `@shared/utils/error`
- Validation schemas live in the feature's own `*.validation.ts` file, applied via `validate()` middleware

## Adding a New Feature

1. Create `src/features/<name>/` with: `<name>.controller.ts`, `<name>.service.ts`, `<name>.model.ts`, `<name>.routes.ts`, `<name>.types.ts`, `<name>.validation.ts`
2. Mount the router in `src/app.ts` under `/api/v1/<name>`
