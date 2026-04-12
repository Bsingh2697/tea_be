# src/features/ — CLAUDE.md

Each subdirectory is a self-contained feature module. No feature should import directly from another feature's internals — cross-feature communication goes through services only.

## Modules

| Module | Status | Description |
|--------|--------|-------------|
| `auth/` | Done | Register, login, logout, refresh-token, get current user |
| `user/` | Done | User CRUD, profile management, admin operations |
| `tea/` | **Pending** | Tea catalog — schema, service, controller, routes not yet implemented |

## File Pattern (per feature)

```
<name>.controller.ts   — Express route handlers, calls service, uses ResponseHandler
<name>.service.ts      — Business logic, DB queries, throws AppError subclasses
<name>.model.ts        — Mongoose schema + hooks (auth features use user.model)
<name>.routes.ts       — Express Router, applies middlewares (protect, authorize, validate)
<name>.types.ts        — TypeScript interfaces and enums
<name>.validation.ts   — Joi schemas passed to validate() middleware
```

## Rules
- Controllers only call service methods — no direct DB access
- Services throw named error subclasses (`NotFoundError`, `ConflictError`, etc.) — never throw plain `Error`
- Routes are the only place to apply `protect`, `authorize`, and `validate` middlewares
- Services export a singleton instance (`export default new XxxService()`)
