# src/features/user/ — CLAUDE.md

Manages the User resource. Owns the Mongoose model, all DB queries, and CRUD endpoints.

## Routes (`/api/v1/user`)

All routes require `protect` (applied at router level).

| Method | Path | Extra middleware | Handler |
|--------|------|-----------------|---------|
| GET | `/profile` | — | `getProfile` |
| PUT | `/profile` | — | `updateProfile` |
| GET | `/all` | `authorize(ADMIN)`, `validate(getAllUsersSchema)` | `getAllUsers` |
| GET | `/:id` | `authorize(ADMIN)`, `validate(getUserSchema)` | `getUserById` |
| PUT | `/:id` | `authorize(ADMIN)`, `validate(updateUserSchema)` | `updateUser` |
| DELETE | `/:id` | `authorize(ADMIN)`, `validate(getUserSchema)` | `deleteUser` |

`getAllUsers` supports query params: `?page=`, `?limit=`, `?role=`, `?isActive=`

## Model (`user.model.ts`)

```ts
{
  name: String           // required, max 50, trimmed
  email: String          // required, unique, lowercase
  password: String       // required, min 6, select: false (excluded by default)
  role: UserRole         // enum: admin|user|vendor, default: user
  phone: String          // required, unique, 10-digit
  address: { street, city, state, zipCode, country }  // all optional
  isActive: Boolean      // default: true — soft delete flag
  isEmailVerified: Boolean  // default: false
  refreshToken: String   // select: false (excluded by default)
  timestamps: true
}
```

**Hooks:**
- `pre('save')`: hashes password with bcrypt if modified
- `methods.comparePassword(candidate)`: bcrypt compare — used by auth.service login

**Indexes:** unique on email + phone (schema-level), role (1) for admin queries

**Important:** `password` and `refreshToken` have `select: false` — to include them, use `.select('+password +refreshToken')` explicitly (only done in auth service).

## Types (`user.types.ts`)

```ts
enum UserRole { ADMIN = 'admin', USER = 'user', VENDOR = 'vendor' }

IUser          // Mongoose Document — full model interface, includes comparePassword()
IUserCreate    { name, email, password, phone, role? }
IUserUpdate    { name, phone, address }
IUserResponse  // sanitized — no password, no refreshToken; _id mapped to userId
```

## Service (`user.service.ts`)

| Method | Notes |
|--------|-------|
| `createUser(data)` | Checks email + phone uniqueness, throws `ConflictError` if taken |
| `getUserById(id)` | Throws `NotFoundError` if missing |
| `getUserByEmail(email)` | Returns full `IUser` with `+password +refreshToken` — for auth use only |
| `getUserByEmailOrPhone(email?, phone?)` | Login lookup — returns with sensitive fields selected |
| `updateUser(id, data)` | `findByIdAndUpdate` with `runValidators: true` |
| `deleteUser(id)` | Soft delete — sets `isActive: false` |
| `getAllUsers(page, limit, filter)` | Paginated, sorted by `createdAt desc` |
| `updateRefreshToken(id, token\|null)` | Called by auth service on login/logout |
| `sanitizeUser(user)` — private | Strips `_id`, `password`, `refreshToken`, `__v`; renames `_id` → `userId` |

## Notes
- `deleteUser` is a soft delete — it sets `isActive: false`, never removes the document
- Admin cannot delete their own account (`deleteUser` controller guard: throws `AuthorizationError`)
- `sanitizeUser` strips sensitive fields and renames `_id` to `userId` in responses
