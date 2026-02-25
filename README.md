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

## 🐳 Docker Setup

The app is containerized using a multi-stage Docker build. Doppler is used to inject secrets into the container — no `.env` file is needed on the server.

### How it works

1. Docker builds the app in a builder stage, then copies only the compiled output into a lean production image
2. Doppler CLI is installed inside the container
3. On startup, Doppler uses a service token (`DOPPLER_TOKEN`) to fetch all secrets and inject them as environment variables before the app starts

### Files

| File | Purpose |
|---|---|
| `Dockerfile` | Multi-stage build — compiles TypeScript and creates production image |
| `docker-compose.yml` | Defines the service, port mapping, and passes `DOPPLER_TOKEN` |
| `.dockerignore` | Excludes `node_modules`, `dist`, `.env`, etc. from the build context |

### Local Docker (for testing)

1. Get a `dev` service token from Doppler (see Doppler section below)
2. Set the token in your terminal:
   ```bash
   export DOPPLER_TOKEN=dp.st.xxxxxxxx
   ```
3. Run:
   ```bash
   docker-compose up
   ```

### Deploying to a server

1. SSH into your server
2. Install Docker and Docker Compose
3. Clone the repository
4. Get a service token for the appropriate config (e.g. `prd`) from Doppler
5. Set the token permanently on the server:
   ```bash
   # Add to /etc/environment for persistence across reboots
   echo "DOPPLER_TOKEN=dp.st.xxxxxxxx" >> /etc/environment
   source /etc/environment
   ```
6. Run:
   ```bash
   docker-compose up -d
   ```

The `-d` flag runs the container in the background.

---

## 🔑 Doppler Setup (Secrets Management)

Doppler is used to manage environment variables across different environments (`dev`, `stg`, `prd`). No secrets are stored in `.env` files on servers.

### How tokens work

Each Doppler service token is scoped to a specific **project + config**. The token itself tells Doppler which environment to pull secrets from — you don't need to specify it anywhere else.

| Environment | Token config to use |
|---|---|
| Local development | `dev` |
| Staging server | `stg` |
| Production server | `prd` |

### One-time local setup

1. Install Doppler CLI:
   ```bash
   brew install dopplerhq/cli/doppler   # macOS
   ```
2. Login:
   ```bash
   doppler login
   ```
3. Link the project to your local directory:
   ```bash
   doppler setup   # selects tea_be / dev by default (from doppler.yaml)
   ```

### Pulling secrets locally (generates .env)

```bash
npm run doppler:dev   # pulls dev secrets → writes to .env
npm run doppler:stg   # pulls stg secrets → writes to .env
```

Use the generated `.env` for local development with `npm run dev`.

### Generating a service token (for Docker / servers)

1. Go to [Doppler Dashboard](https://dashboard.doppler.com)
2. Select project: `tea_be`
3. Select the config (e.g. `dev`, `stg`, or `prd`)
4. Go to **Access** tab → **Service Tokens**
5. Click **Generate** → copy the token (starts with `dp.st.`)
6. Set it as `DOPPLER_TOKEN` in your environment or server

### Required secrets

Make sure the following secrets exist in each Doppler config:

```
NODE_ENV
PORT
MONGODB_URI
JWT_SECRET
JWT_REFRESH_SECRET
```

---

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
