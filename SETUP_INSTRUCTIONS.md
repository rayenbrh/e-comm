# Setup Instructions

## Current Project Status

### ✅ Completed (Ready to Run)
- **Backend API** - 100% complete and functional
- **Frontend Infrastructure** - All setup complete
- **State Management** - Cart, Auth, Theme stores ready
- **API Hooks** - React Query hooks ready
- **Basic UI** - Minimal working interface

### 🚧 Pending
- Full UI component library
- Product pages with animations
- 3D hero section
- Admin dashboard UI
- Checkout flow UI

## Prerequisites

Before you begin, ensure you have:
- **Node.js** v18 or higher
- **MongoDB** installed locally OR MongoDB Atlas account
- **npm** or **pnpm** package manager

## Step-by-Step Setup

### 1. Install Dependencies

Open your terminal in the project root directory:

```bash
# Navigate to project directory
cd "c:\Users\Riyan\Desktop\animated e comm"

# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Return to root
cd ..
```

Or use the convenience script:
```bash
npm run install-all
```

### 2. Setup MongoDB

#### Option A: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # Windows (run as Administrator)
   net start MongoDB

   # macOS/Linux
   sudo systemctl start mongod
   ```
3. MongoDB will run on `mongodb://localhost:27017`

#### Option B: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string
4. Whitelist your IP address

### 3. Configure Environment Variables

Create `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB - CHANGE THIS if using Atlas
MONGODB_URI=mongodb://localhost:27017/ecommerce

# JWT Secrets - CHANGE THESE!
JWT_ACCESS_SECRET=mySecretAccessKey12345
JWT_REFRESH_SECRET=mySecretRefreshKey67890
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Client
CLIENT_URL=http://localhost:5173

# Admin
ADMIN_EMAIL=admin@ecommerce.com
ADMIN_PASSWORD=Admin@123
```

**Important**: Change the JWT secrets to random strings in production!

### 4. Seed the Database

This creates sample data:

```bash
# From project root
npm run seed
```

This will create:
- ✅ 1 Admin user
- ✅ 1 Demo user
- ✅ 5 Categories
- ✅ 14+ Products
- ✅ 1 Sample order

You should see output like:
```
✅ Database seeded successfully!

📋 Seed Summary:
   Admin Email: admin@ecommerce.com
   Admin Password: Admin@123
   Demo User Email: john@example.com
   Demo User Password: password123
   Categories: 5
   Products: 14
   Orders: 1
```

### 5. Start Development Servers

#### Option A: Run Both Together (Recommended)
```bash
# From project root
npm run dev
```

This starts:
- Backend on http://localhost:5000
- Frontend on http://localhost:5173

#### Option B: Run Separately
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

### 6. Access the Application

Open your browser:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## Verify Installation

### Test Backend API

Open a new terminal and run:

```bash
# Health check
curl http://localhost:5000/api/health

# Get all products
curl http://localhost:5000/api/products

# Get categories
curl http://localhost:5000/api/categories
```

You should see JSON responses with data.

### Test Frontend

1. Open http://localhost:5173
2. You should see the homepage
3. Click "Products" in navigation
4. Toggle dark/light mode (moon/sun icon)

### Login Test

Use these credentials:

**Admin Account**:
- Email: `admin@ecommerce.com`
- Password: `Admin@123`

**Demo User**:
- Email: `john@example.com`
- Password: `password123`

## Troubleshooting

### Error: MongoDB connection failed

**Solution**:
1. Ensure MongoDB is running
2. Check `MONGODB_URI` in `.env`
3. For Atlas: Verify IP whitelist and credentials

```bash
# Check if MongoDB is running (Linux/Mac)
sudo systemctl status mongod

# Windows
sc query MongoDB
```

### Error: Port 5000 already in use

**Solution**:
Change `PORT` in `server/.env`:
```env
PORT=5001
```

### Error: Cannot find module

**Solution**:
```bash
# Re-install dependencies
cd server
rm -rf node_modules package-lock.json
npm install

cd ../client
rm -rf node_modules package-lock.json
npm install
```

### Frontend not loading

**Solution**:
1. Check console for errors
2. Verify both servers are running
3. Clear browser cache
4. Check port 5173 is not blocked

### API requests failing (CORS errors)

**Solution**:
Verify `CLIENT_URL` in `server/.env` matches your frontend URL:
```env
CLIENT_URL=http://localhost:5173
```

## Development Workflow

### Making Changes

**Backend**:
- Edit files in `server/src/`
- Server auto-restarts with nodemon

**Frontend**:
- Edit files in `client/src/`
- Hot Module Replacement (HMR) auto-updates

### View Logs

Backend logs appear in the terminal running `npm run server`
Frontend logs appear in browser console (F12)

### Database Management

**View data**:
```bash
# Connect to MongoDB shell
mongosh ecommerce

# View collections
show collections

# View products
db.products.find().pretty()

# View users
db.users.find().pretty()
```

**Reset database**:
```bash
npm run seed
```
(This clears and re-seeds all data)

## Next Steps

The project is now running! Here's what you can do next:

### 1. Test the Backend API
Use Postman or Thunder Client (VS Code extension) to test all endpoints:
- See `README.md` for complete API documentation

### 2. Build Frontend Components
See `PROJECT_STATUS.md` for the list of components to build:
- Start with simple components (Button, Input, Card)
- Then build page layouts
- Finally add animations

### 3. Customize
- Update branding and colors in `client/tailwind.config.js`
- Modify product categories and data in `server/src/utils/seed.js`
- Add your own images

## Getting Help

### Check Documentation
- `README.md` - Full project documentation
- `PROJECT_STATUS.md` - What's built and what's pending
- This file - Setup instructions

### Common Issues
- CORS errors → Check CLIENT_URL in .env
- Auth errors → Clear browser cookies
- MongoDB errors → Verify connection string

## Production Deployment

Not ready for production yet. Complete these first:
1. Build all frontend UI components
2. Add proper error handling
3. Implement rate limiting
4. Add input sanitization
5. Set up monitoring
6. Use environment-specific configs
7. Enable HTTPS
8. Secure JWT secrets

## Quick Reference

```bash
# Install all
npm run install-all

# Seed database
npm run seed

# Development
npm run dev

# Server only
npm run server

# Client only
npm run client

# Production build (client)
cd client && npm run build
```

## File Structure Quick Reference

```
Root/
├── server/          ✅ Complete backend
│   ├── src/
│   │   ├── models/       ✅ Database schemas
│   │   ├── controllers/  ✅ Business logic
│   │   ├── routes/       ✅ API endpoints
│   │   ├── middleware/   ✅ Auth & validation
│   │   └── utils/        ✅ Helpers & seed
│   └── .env         ⚠️ YOU MUST CREATE THIS
│
├── client/          🚧 Infrastructure complete, UI pending
│   ├── src/
│   │   ├── stores/       ✅ State management
│   │   ├── hooks/        ✅ API hooks
│   │   ├── types/        ✅ TypeScript types
│   │   ├── components/   🚧 TO BE BUILT
│   │   ├── pages/        🚧 TO BE BUILT
│   │   └── App.tsx       ✅ Basic routing
│   └── package.json
│
├── README.md              ✅ Full documentation
├── PROJECT_STATUS.md      ✅ Build status
└── SETUP_INSTRUCTIONS.md  ✅ This file
```

---

**Ready to start!** Run `npm run dev` and visit http://localhost:5173
