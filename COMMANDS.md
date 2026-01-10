# Command Reference & Troubleshooting

## 📋 NPM Commands

### Development

```bash
# Start development server with hot reload
npm run dev

# Start development server (alternative)
npm start

# Seed database with test data
npm run seed
```

### Production

```bash
# Build TypeScript to JavaScript
npm run build

# Run production build
npm start

# Build and start
npm run build && npm start
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint:fix

# Run tests
npm test

# Run tests in watch mode
npm test:watch
```

## 🗄️ MongoDB Commands

### Local MongoDB

```bash
# Start MongoDB service
mongod

# Start MongoDB with specific data directory
mongod --dbpath /path/to/data

# Connect to MongoDB shell
mongosh

# Connect to specific database
mongosh tea_ordering
```

### MongoDB Shell Commands

```javascript
// Show all databases
show dbs

// Use database
use tea_ordering

// Show collections
show collections

// Find all users
db.users.find()

// Find all teas
db.teas.find()

// Pretty print
db.users.find().pretty()

// Count documents
db.users.countDocuments()

// Update user role to admin
db.users.updateOne(
  { email: "user@tea.com" },
  { $set: { role: "admin" } }
)

// Delete all teas
db.teas.deleteMany({})

// Drop database
db.dropDatabase()
```

## 🧪 Testing API with curl

### Health Check

```bash
curl http://localhost:5000/health
```

### Register User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get All Teas

```bash
curl http://localhost:5000/api/v1/teas
```

### Get Tea by ID (replace with actual ID)

```bash
curl http://localhost:5000/api/v1/teas/507f1f77bcf86cd799439011
```

### Create Tea (requires authentication)

```bash
curl -X POST http://localhost:5000/api/v1/teas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Chamomile",
    "description": "Relaxing herbal tea",
    "category": "herbal",
    "price": 6.99,
    "caffeine": "none"
  }'
```

### Search Teas

```bash
curl "http://localhost:5000/api/v1/teas/search?q=green"
```

### Get Teas by Category

```bash
curl http://localhost:5000/api/v1/teas/category/black
```

### Get Profile (requires authentication)

```bash
curl http://localhost:5000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🔧 Git Commands

### Initial Setup

```bash
# Initialize git repository
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit: Tea ordering backend"

# Add remote repository
git remote add origin <your-repo-url>

# Push to remote
git push -u origin main
```

### Daily Workflow

```bash
# Check status
git status

# Create new branch
git checkout -b feature/order-management

# Add changes
git add .

# Commit with message
git commit -m "feat: add order management"

# Push branch
git push origin feature/order-management

# Switch to main branch
git checkout main

# Pull latest changes
git pull origin main

# Merge feature branch
git merge feature/order-management
```

## 🐛 Troubleshooting

### Issue: MongoDB Connection Failed

**Symptoms:**

```
Error connecting to MongoDB: MongoServerError: ...
```

**Solutions:**

```bash
# 1. Check if MongoDB is running
mongod --version

# 2. Start MongoDB
mongod

# 3. Check connection string in .env
MONGODB_URI=mongodb://localhost:27017/tea_ordering

# 4. For Atlas, ensure IP is whitelisted
# Go to MongoDB Atlas → Network Access → Add IP Address

# 5. Test connection with mongosh
mongosh "mongodb://localhost:27017/tea_ordering"
```

### Issue: Port Already in Use

**Symptoms:**

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**

```bash
# 1. Find process using port 5000
lsof -i :5000

# 2. Kill the process
kill -9 <PID>

# 3. Or change port in .env
PORT=3000

# 4. On Windows, find process
netstat -ano | findstr :5000

# 5. Kill process on Windows
taskkill /PID <PID> /F
```

### Issue: TypeScript Errors

**Symptoms:**

```
Cannot find module '@config/env'
```

**Solutions:**

```bash
# 1. Clean and reinstall
rm -rf node_modules package-lock.json
npm install

# 2. Check tsconfig.json paths
# Ensure baseUrl and paths are correctly set

# 3. Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

### Issue: JWT Token Errors

**Symptoms:**

```
JsonWebTokenError: invalid token
```

**Solutions:**

```bash
# 1. Ensure JWT_SECRET is set in .env
JWT_SECRET=your-secret-key

# 2. Check Authorization header format
# Should be: Bearer <token>

# 3. Token might be expired, login again

# 4. Verify token is being sent correctly
# Check in Postman: Headers → Authorization → Bearer Token
```

### Issue: Validation Errors

**Symptoms:**

```
ValidationError: "email" is required
```

**Solutions:**

```bash
# 1. Check request body format
# Must be valid JSON

# 2. Ensure Content-Type header
Content-Type: application/json

# 3. Check validation schema in validation files
# src/features/*/validation.ts

# 4. Review API documentation for required fields
```

### Issue: Access Denied (403)

**Symptoms:**

```
AuthorizationError: Access denied
```

**Solutions:**

```bash
# 1. Check user role in database
mongosh tea_ordering
db.users.find({ email: "your@email.com" })

# 2. Update user role if needed
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)

# 3. Verify route requires correct role
# Check routes file for authorize() middleware

# 4. Re-login to get updated token
```

### Issue: Database Seeding Fails

**Symptoms:**

```
Error seeding database
```

**Solutions:**

```bash
# 1. Ensure MongoDB is running
mongod

# 2. Drop existing database
mongosh tea_ordering
db.dropDatabase()

# 3. Run seed script again
npm run seed

# 4. Check connection string
# Verify MONGODB_URI in .env
```

## 🔍 Debugging Tips

### Enable Debug Logging

```bash
# In .env
LOG_LEVEL=debug
```

### Check Logs

```bash
# View error logs
cat logs/error.log

# View all logs
cat logs/all.log

# Tail logs in real-time
tail -f logs/all.log
```

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "runtimeArgs": ["-r", "ts-node/register"],
      "args": ["${workspaceFolder}/src/server.ts"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

### MongoDB Compass Connection

```
Connection String: mongodb://localhost:27017/tea_ordering
```

## 📊 Performance Testing

### Using Apache Bench (ab)

```bash
# Install ab (usually comes with Apache)
# Test health endpoint
ab -n 1000 -c 10 http://localhost:5000/health

# -n: Number of requests
# -c: Concurrent requests
```

### Using Artillery

```bash
# Install Artillery
npm install -g artillery

# Create test.yml
# Run test
artillery run test.yml
```

## 🔐 Security Checks

### Check Dependencies for Vulnerabilities

```bash
npm audit

# Fix vulnerabilities
npm audit fix

# Force fix
npm audit fix --force
```

### Update Dependencies

```bash
# Check outdated packages
npm outdated

# Update all packages
npm update

# Update specific package
npm update express
```

## 📝 Quick Reference

### Tea Categories

- black
- green
- oolong
- white
- herbal
- chai
- matcha

### User Roles

- user (default)
- vendor
- admin

### Default Ports

- Application: 5000
- MongoDB: 27017

### Log Locations

- Error logs: `logs/error.log`
- All logs: `logs/all.log`

---

**Keep this file handy for quick reference! 📚**
