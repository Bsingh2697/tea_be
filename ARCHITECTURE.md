# System Architecture Documentation

## Overview

This is an enterprise-grade monolithic backend application designed with microservices architecture in mind. The system follows industry best practices and can be easily split into microservices when needed.

## Architecture Layers

### 1. Presentation Layer (Controllers)

- Handles HTTP requests and responses
- Input validation (delegated to middleware)
- Response formatting
- No business logic

```typescript
// Example: TeaController
class TeaController {
  async getTea(req, res) {
    const tea = await teaService.getTeaById(req.params.id);
    return ResponseHandler.success(res, tea);
  }
}
```

### 2. Business Logic Layer (Services)

- Contains all business rules
- Orchestrates data flow
- Performs computations
- Independent of HTTP/database specifics

```typescript
// Example: TeaService
class TeaService {
  async getTeaById(id: string) {
    const tea = await Tea.findById(id);
    if (!tea) throw new NotFoundError();
    return tea;
  }
}
```

### 3. Data Access Layer (Models)

- MongoDB schema definitions
- Database queries
- Data validation rules
- Relationships

```typescript
// Example: Tea Model
const TeaSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  // ...
});
```

## Design Patterns

### 1. Repository Pattern

- Abstracts data access logic
- Makes testing easier
- Can be easily swapped (e.g., SQL to NoSQL)

### 2. Dependency Injection

- Services are loosely coupled
- Easy to test with mocks
- Better maintainability

### 3. Factory Pattern

- Used in error creation
- Standardized object creation

### 4. Singleton Pattern

- Used for database connection
- Logger instance
- Service instances

### 5. Strategy Pattern

- Authentication strategies
- Validation strategies

## Feature-Based Structure

```
src/
├── features/
│   ├── auth/           # Authentication feature
│   │   ├── auth.types.ts
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.routes.ts
│   │   └── auth.validation.ts
│   ├── tea/            # Tea management feature
│   └── user/           # User management feature
```

**Benefits:**

- High cohesion within features
- Low coupling between features
- Easy to extract as microservices
- Clear boundaries

## Request Flow

```
Client Request
    ↓
Middleware (Rate Limit, CORS, Body Parser)
    ↓
Route Handler
    ↓
Validation Middleware (Joi)
    ↓
Authentication Middleware (JWT)
    ↓
Authorization Middleware (Role Check)
    ↓
Controller (Request Handling)
    ↓
Service (Business Logic)
    ↓
Model (Database Access)
    ↓
Service (Data Processing)
    ↓
Controller (Response Formatting)
    ↓
Client Response
```

## Error Handling Strategy

### Custom Error Classes

```typescript
AppError (Base)
├── ValidationError (400)
├── AuthenticationError (401)
├── AuthorizationError (403)
├── NotFoundError (404)
├── ConflictError (409)
└── InternalServerError (500)
```

### Error Flow

```
Error Thrown
    ↓
Async Handler Catches
    ↓
Error Middleware
    ↓
Error Classification
    ↓
Appropriate Response
```

## Security Architecture

### Authentication

- **JWT Access Tokens**: Short-lived (7 days default)
- **Refresh Tokens**: Long-lived (30 days default)
- **Token Storage**: Refresh tokens in database
- **Password Hashing**: bcrypt with 10 rounds

### Authorization

- **Role-Based Access Control (RBAC)**
- Roles: Admin, Vendor, User
- Middleware checks user roles

### Security Middleware Stack

1. **Helmet**: Sets security headers
2. **CORS**: Cross-origin resource sharing
3. **Rate Limiting**: Prevents abuse
4. **Mongo Sanitize**: Prevents NoSQL injection
5. **Input Validation**: Joi schemas

## Database Design

### Schema Design Principles

- **Normalization**: Minimal data duplication
- **Indexing**: On frequently queried fields
- **Referencing**: Users referenced in teas
- **Validation**: Schema-level validation

### Indexes

```typescript
// Tea Model Indexes
- name: 1 (unique)
- category: 1
- price: 1
- isAvailable: 1
- rating: -1
- text: (name, description) // For search
```

## Scalability Considerations

### Horizontal Scaling

- **Stateless Design**: No session state in memory
- **JWT Tokens**: No session store needed
- **Load Balancer Ready**: Can run multiple instances

### Vertical Scaling

- **Database Connection Pooling**: Mongoose default
- **Response Compression**: gzip enabled
- **Efficient Queries**: Indexed fields

### Caching Strategy (Future)

```
Client
    ↓
CDN (Static Assets)
    ↓
Redis Cache (Hot Data)
    ↓
API Server
    ↓
MongoDB
```

## Migration to Microservices

### Service Boundaries

#### Auth Service

- User authentication
- Token management
- Password reset
- Email verification

#### User Service

- User profile management
- User preferences
- Address management

#### Tea Service

- Tea catalog management
- Search and filtering
- Availability management

#### Order Service (Future)

- Order creation
- Order tracking
- Payment integration

### Inter-Service Communication

**Option 1: REST APIs**

```
Service A → HTTP Request → Service B
```

**Option 2: Message Queue**

```
Service A → Message → Queue → Service B
```

**Option 3: Event Bus**

```
Service A → Event → Bus → Service B, C, D
```

### Shared Components

Create NPM packages:

- `@tea-app/common-types`
- `@tea-app/error-handling`
- `@tea-app/logger`
- `@tea-app/validation`

## Testing Strategy

### Unit Tests

- Test individual functions
- Mock dependencies
- Fast execution

### Integration Tests

- Test feature modules
- Real database (test DB)
- API endpoint testing

### E2E Tests

- Test complete workflows
- Simulate real user scenarios

```typescript
// Example Unit Test
describe("TeaService", () => {
  it("should get tea by id", async () => {
    const tea = await teaService.getTeaById("123");
    expect(tea.name).toBe("Earl Grey");
  });
});
```

## Logging Strategy

### Log Levels

- **error**: Critical errors
- **warn**: Warning messages
- **info**: General information
- **http**: HTTP requests
- **debug**: Debug information

### Log Outputs

- **Console**: Development
- **Files**: Production
  - `logs/error.log`: Error logs only
  - `logs/all.log`: All logs

### Structured Logging

```typescript
logger.info("User login", {
  userId: "123",
  email: "user@example.com",
  timestamp: new Date(),
});
```

## Environment Management

### Development

- Detailed logging
- Error stack traces
- MongoDB local

### Staging

- Production-like setup
- Test data
- Performance testing

### Production

- Minimal logging
- No stack traces
- MongoDB Atlas
- Environment variables secured

## Performance Optimization

### Database

- ✅ Indexes on frequently queried fields
- ✅ Pagination for large datasets
- ✅ Projection (select specific fields)
- ✅ Connection pooling

### API

- ✅ Response compression
- ✅ Rate limiting
- ✅ Caching headers
- 🔲 Redis caching (future)

### Code

- ✅ Async/await for non-blocking
- ✅ Error handling doesn't block
- ✅ Efficient algorithms
- ✅ Minimal dependencies

## Monitoring & Observability

### Metrics to Track

- Request count
- Response time
- Error rate
- Database query time
- Memory usage
- CPU usage

### Tools (Future Integration)

- **APM**: New Relic, DataDog
- **Logging**: ELK Stack, Loggly
- **Monitoring**: Grafana, Prometheus
- **Tracing**: Jaeger, Zipkin

## Deployment Architecture

### Current (Monolith)

```
Load Balancer
    ↓
Application Server (Node.js)
    ↓
MongoDB
```

### Future (Microservices)

```
API Gateway
    ↓
    ├── Auth Service
    ├── User Service
    ├── Tea Service
    └── Order Service
    ↓
Shared Services
    ├── MongoDB Cluster
    ├── Redis Cache
    └── Message Queue
```

## Best Practices Implemented

✅ **SOLID Principles**

- Single Responsibility
- Open/Closed
- Liskov Substitution
- Interface Segregation
- Dependency Inversion

✅ **Code Organization**

- Feature-based structure
- Clear separation of concerns
- Consistent naming conventions

✅ **Security**

- Input validation
- Authentication & authorization
- SQL/NoSQL injection prevention
- Rate limiting

✅ **Error Handling**

- Centralized error handling
- Custom error classes
- Meaningful error messages

✅ **Documentation**

- Code comments
- API documentation
- Architecture docs
- README files

✅ **Type Safety**

- TypeScript throughout
- Interface definitions
- Type checking

## Future Enhancements

### Short Term

- [ ] Email service integration
- [ ] File upload for tea images
- [ ] Order management
- [ ] Payment integration

### Medium Term

- [ ] Redis caching
- [ ] WebSocket for real-time updates
- [ ] Admin dashboard API
- [ ] Analytics endpoints

### Long Term

- [ ] Split into microservices
- [ ] GraphQL API
- [ ] Event-driven architecture
- [ ] Kubernetes deployment

---

**This architecture is designed to be flexible, scalable, and maintainable for long-term growth.**
