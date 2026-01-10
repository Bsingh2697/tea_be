# Tea Ordering Backend API 🍵

Enterprise-grade RESTful API for a Tea Ordering Application built with Node.js, Express, TypeScript, and MongoDB.

## 🚀 Features

- **Authentication & Authorization**: JWT-based with refresh tokens
- **User Management**: CRUD operations
- **Tea Management**: Complete tea catalog with filtering and search
- **Security**: Helmet, rate limiting, data sanitization, CORS
- **Validation**: Joi-based request validation
- **Error Handling**: Centralized error handling with custom error classes
- **Logging**: Winston-based logging system
- **TypeScript**: Full type safety
- **Scalable Architecture**: Feature-based structure ready for microservices

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd tea_be
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tea_ordering
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
```

4. **Start MongoDB**

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env with your Atlas connection string
```

5. **Run the application**

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
src/
├── config/           # Configuration files
│   ├── db.ts        # Database connection
│   └── env.ts       # Environment variables validation
├── features/         # Feature modules
│   ├── auth/        # Authentication
│   ├── tea/         # Tea management
│   └── user/        # User management
├── shared/          # Shared resources
│   ├── middlewares/ # Express middlewares
│   └── utils/       # Utility functions
├── app.ts           # Express app setup
└── server.ts        # Server entry point
```

## 🔐 API Endpoints

### Authentication

| Method | Endpoint                     | Description          | Access  |
| ------ | ---------------------------- | -------------------- | ------- |
| POST   | `/api/v1/auth/register`      | Register new user    | Public  |
| POST   | `/api/v1/auth/login`         | Login user           | Public  |
| POST   | `/api/v1/auth/refresh-token` | Refresh access token | Public  |
| POST   | `/api/v1/auth/logout`        | Logout user          | Private |
| GET    | `/api/v1/auth/me`            | Get current user     | Private |

### Users

| Method | Endpoint                | Description      | Access  |
| ------ | ----------------------- | ---------------- | ------- |
| GET    | `/api/v1/users/profile` | Get user profile | Private |
| PUT    | `/api/v1/users/profile` | Update profile   | Private |
| DELETE | `/api/v1/users/profile` | Delete user      | Private |

### Teas

| Method | Endpoint                          | Description     | Access |
| ------ | --------------------------------- | --------------- | ------ |
| GET    | `/api/v1/teas`                    | Get all teas    | Public |
| GET    | `/api/v1/teas/search?q=term`      | Search teas     | Public |
| GET    | `/api/v1/teas/category/:category` | Get by category | Public |
| GET    | `/api/v1/teas/:id`                | Get tea by ID   | Public |

## 📝 API Examples

### Register User

```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

### Login

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

### Get All Teas with Filters

```bash
GET /api/v1/teas?page=1&limit=10&category=black&minPrice=5&maxPrice=15&isAvailable=true
```

## 🔒 User Roles

- **user**: Regular customer (default)

## 🧪 Testing

```bash
npm test
```

## 🎨 Code Style

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🏗️ Architecture Patterns

- **Layered Architecture**: Controller → Service → Model
- **Dependency Injection**: Services are injected into controllers
- **Repository Pattern**: Data access abstraction
- **Error Handling**: Centralized with custom error classes
- **Validation**: Schema-based with Joi
- **Async/Await**: Consistent async handling with error wrapper

## 🔄 Migration to Microservices

This monolith is designed to be easily split into microservices:

1. Each feature (`auth`, `user`, `tea`) can become a separate service
2. Shared utilities can be published as internal packages
3. API Gateway can be added for routing
4. Service-to-service communication via REST or message queues

## 📊 Database Schema

### User

- name, email, password (hashed)
- phone, address
- isActive, isEmailVerified
- timestamps

### Tea

- name, description, category
- price, image, ingredients
- isAvailable, preparationTime
- caffeine level, temperature, steepingTime
- rating, reviewCount
- createdBy (User reference)
- timestamps

## 🛡️ Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting
- Helmet security headers
- NoSQL injection prevention
- CORS configuration
- Request validation
- Error message sanitization

## 📈 Performance

- Database indexing on frequently queried fields
- Pagination for large datasets
- Response compression
- Connection pooling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License

## 👤 Author

Bharat Singh

## 🙏 Acknowledgments

- Express.js
- MongoDB & Mongoose
- TypeScript
- All other amazing open-source libraries used

---

**Happy Coding! ☕️**
