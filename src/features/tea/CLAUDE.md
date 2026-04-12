# src/features/tea/ — CLAUDE.md

**Status: NOT YET IMPLEMENTED**

This module is a placeholder. No files exist here yet.

## What Needs to Be Built

Follow the same file pattern as `auth/` and `user/`:

```
tea.model.ts        — Mongoose schema for the Tea document
tea.types.ts        — ITea, ITeaCreate, ITeaUpdate, ITeaResponse interfaces
tea.service.ts      — DB queries: CRUD, search/filter, pagination
tea.controller.ts   — Route handlers using asyncHandler + ResponseHandler
tea.validation.ts   — Joi schemas for create/update/query
tea.routes.ts       — Router mounted at /api/v1/tea, with protect/authorize as needed
```

## Likely Route Shape

```
GET    /api/v1/tea           — list teas (public, paginated, filterable)
GET    /api/v1/tea/:id       — get single tea (public)
POST   /api/v1/tea           — create tea (admin/vendor only)
PUT    /api/v1/tea/:id       — update tea (admin/vendor only)
DELETE /api/v1/tea/:id       — delete tea (admin only)
```

## Mount Point

Once routes are created, add to `src/app.ts`:

```ts
import teaRouter from '@features/tea/tea.routes';
app.use('/api/v1/tea', teaRouter);
```
