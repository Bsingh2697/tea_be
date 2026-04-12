# src/shared/ — CLAUDE.md

Cross-cutting utilities and middlewares used by all features. Nothing here is feature-specific.

## Structure

| Folder | Contents |
|--------|---------|
| `middlewares/` | Express middlewares: auth guard, error handler, request validation |
| `utils/` | Pure utilities: async wrapper, error classes, logger, Redis client, response formatter |

## Rules
- Never import from `@features/*` inside `shared/` — shared code must not depend on feature modules
- Always add new utility functions here (not inside a feature) if they will be reused by 2+ features
