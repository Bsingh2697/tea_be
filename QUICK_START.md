# Quick Start Guide 🚀

## Prerequisites Check

```bash
# Check Node.js version (should be 16+)
node --version

# Check npm version
npm --version

# Check if MongoDB is installed
mongod --version
```

## Setup in 5 Minutes

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your preferred editor
nano .env  # or code .env or vim .env
```

**Minimal required configuration:**

```env
MONGODB_URI=mongodb://localhost:27017/tea_ordering
JWT_SECRET=my-super-secret-jwt-key-12345
JWT_REFRESH_SECRET=my-super-secret-refresh-key-67890
```

### Step 3: Start MongoDB

**Option A: Local MongoDB**

```bash
# Start MongoDB service
# On macOS with Homebrew:
brew services start mongodb-community

# On Linux:
sudo systemctl start mongod

# On Windows:
# Start MongoDB from Services or run:
mongod
```

**Option B: MongoDB Atlas (Cloud)**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tea_ordering
```

### Step 4: Run the Application

```bash
# Development mode with hot reload
npm run dev
```

You should see:

```
Server running in development mode on port 5000
MongoDB Connected: localhost
Health check available at: http://localhost:5000/health
```

### Step 5: Test the API

```bash
# Test health endpoint
curl http://localhost:5000/health

# Or open in browser:
# http://localhost:5000/health
```

## First API Calls

### 1. Register a User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@tea.com",
    "password": "admin123"
  }'
```

Save the `accessToken` from the response!

### 2. Get All Teas

```bash
curl http://localhost:5000/api/v1/teas
```

## Project Scripts

```bash
# Development with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run production build
npm start

# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Run tests
npm test
```

## Common Issues & Solutions

### Issue: MongoDB Connection Failed

**Solution:**

- Check if MongoDB is running: `mongod --version`
- Verify connection string in `.env`
- For Atlas: Ensure IP is whitelisted

### Issue: Port 5000 Already in Use

**Solution:**

```bash
# Change port in .env
PORT=3000
```

### Issue: JWT Token Errors

**Solution:**

- Ensure JWT_SECRET is set in `.env`
- Token might be expired, login again
- Check Authorization header format: `Bearer <token>`

### Issue: TypeScript Errors

**Solution:**

```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Development Workflow

1. **Start development server**

   ```bash
   npm run dev
   ```

2. **Make changes** to files in `src/`

   - Server auto-restarts on file changes

3. **Test API** using:

   - Postman
   - curl
   - Thunder Client (VS Code)
   - REST Client (VS Code)

4. **Check logs** in terminal and `logs/` folder

5. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

## VS Code Setup

Recommended extensions:

- ESLint
- Prettier
- Thunder Client (API testing)
- MongoDB for VS Code
- GitLens

### VS Code Settings (.vscode/settings.json)

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```

## Database GUI Tools

- **MongoDB Compass** (Official, Free)

  - Download: https://www.mongodb.com/products/compass
  - Connect: `mongodb://localhost:27017`

- **Studio 3T** (Free for personal use)

  - Download: https://studio3t.com/

- **Robo 3T** (Free, lightweight)
  - Download: https://robomongo.org/

## Next Steps

1. ✅ **Explore the API** using Postman
2. ✅ **Create test data** (users, teas)
3. ✅ **Add more features** (orders, reviews)
4. ✅ **Implement email verification**
5. ✅ **Add file upload** for tea images
6. ✅ **Set up CI/CD** pipeline
7. ✅ **Deploy to production**

## Production Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=use-strong-random-secret
JWT_REFRESH_SECRET=use-strong-random-secret
CORS_ORIGIN=https://your-frontend-domain.com
LOG_LEVEL=warn
```

### Build and Deploy

```bash
# Build
npm run build

# Start production
npm start
```

## Getting Help

- Check `README.md` for detailed documentation
- Review `POSTMAN_GUIDE.md` for API testing
- Check logs in `logs/` folder
- Review code comments in source files

---

**Ready to build something amazing! 🍵✨**
