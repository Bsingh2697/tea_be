# Postman Collection Guide

## Setup

1. Create a new environment in Postman with these variables:
   - `baseUrl`: `http://localhost:5000/api/v1`
   - `accessToken`: (will be set automatically after login)
   - `refreshToken`: (will be set automatically after login)

## Test Scripts

### For Login/Register Requests

Add this to the "Tests" tab to automatically save tokens:

```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
  const jsonData = pm.response.json();
  if (jsonData.data && jsonData.data.tokens) {
    pm.environment.set("accessToken", jsonData.data.tokens.accessToken);
    pm.environment.set("refreshToken", jsonData.data.tokens.refreshToken);
  }
}
```

### For Protected Routes

Add this header:

- Key: `Authorization`
- Value: `Bearer {{accessToken}}`

## Sample Requests

### 1. Register User

**POST** `{{baseUrl}}/auth/register`

Body:

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

### 2. Login

**POST** `{{baseUrl}}/auth/login`

Body:

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

### 3. Get Current User

**GET** `{{baseUrl}}/user/profile`

Headers:

- Authorization: `Bearer {{accessToken}}`

### 4. Create Tea (Admin/Vendor)

**POST** `{{baseUrl}}/teas`

Headers:

- Authorization: `Bearer {{accessToken}}`

Body:

```json
{
  "name": "Green Tea Sencha",
  "description": "Premium Japanese green tea",
  "category": "green",
  "price": 12.99,
  "ingredients": ["Green tea leaves"],
  "preparationTime": 3,
  "caffeine": "medium",
  "temperature": 80,
  "steepingTime": 2
}
```

### 5. Get All Teas

**GET** `{{baseUrl}}/teas?page=1&limit=10`

### 6. Search Teas

**GET** `{{baseUrl}}/teas/search?q=green`

### 7. Get Teas by Category

**GET** `{{baseUrl}}/teas/category/black`

### 8. Update Tea

**PUT** `{{baseUrl}}/teas/:teaId`

Headers:

- Authorization: `Bearer {{accessToken}}`

Body:

```json
{
  "price": 14.99,
  "isAvailable": true
}
```

### 9. Delete Tea

**DELETE** `{{baseUrl}}/teas/:teaId`

Headers:

- Authorization: `Bearer {{accessToken}}`

### 10. Update Profile

**PUT** `{{baseUrl}}/users/profile`

Headers:

- Authorization: `Bearer {{accessToken}}`

Body:

```json
{
  "name": "Updated Name",
  "phone": "9876543210",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

### 11. Refresh Token

**POST** `{{baseUrl}}/auth/refresh-token`

Body:

```json
{
  "refreshToken": "{{refreshToken}}"
}
```

### 12. Logout

**POST** `{{baseUrl}}/auth/logout`

Headers:

- Authorization: `Bearer {{accessToken}}`

## Testing Flow

1. **Register a new user** (saves tokens automatically)
2. **Login** (updates tokens)
3. **Get current user** (verifies authentication)
4. **Create tea** (if user is admin/vendor)
5. **Get all teas** (public access)
6. **Update profile** (authenticated)
7. **Logout** (clears session)

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request / Validation Error
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict (duplicate resource)
- `500`: Internal Server Error
