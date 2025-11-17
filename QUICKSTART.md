# Quick Start Guide - 5 Minutes to Running App

## Prerequisites Check

Do you have these installed?
- [ ] Node.js v18+ (`node --version`)
- [ ] MongoDB (`mongod --version`)
- [ ] npm (`npm --version`)

## Steps

### 1. Install (2 minutes)

```bash
cd "c:\Users\Riyan\Desktop\animated e comm"
npm run install-all
```

### 2. Start MongoDB (30 seconds)

```bash
# Windows (as Administrator)
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

### 3. Seed Database (30 seconds)

```bash
npm run seed
```

### 4. Run App (30 seconds)

```bash
npm run dev
```

### 5. Open Browser

- Frontend: http://localhost:5173
- Backend: http://localhost:5000/api/health

## Done! 🎉

### Test Login

**Admin Account**
- Email: `admin@ecommerce.com`
- Password: `Admin@123`

**Demo User**
- Email: `john@example.com`
- Password: `password123`

### What Works

✅ Backend API (100%)
✅ Frontend infrastructure (70%)
✅ Dark/light theme toggle
✅ Cart state management
✅ Basic navigation

### What's Pending

🚧 Full UI components
🚧 Product pages
🚧 3D hero section
🚧 Admin dashboard UI
🚧 Checkout flow UI

See [PROJECT_STATUS.md](PROJECT_STATUS.md) for details.

## Troubleshooting

**MongoDB won't start?**
- Install from https://www.mongodb.com/try/download/community
- Or use MongoDB Atlas (cloud) and update `MONGODB_URI` in `server/.env`

**Port 5000 in use?**
- Change `PORT=5001` in `server/.env`

**Dependencies fail?**
```bash
# Clear and reinstall
rm -rf node_modules server/node_modules client/node_modules
npm run install-all
```

## Next Steps

1. **Test Backend API**: See [README.md](README.md) for endpoints
2. **Build UI**: See [PROJECT_STATUS.md](PROJECT_STATUS.md) for component list
3. **Read Docs**: Full documentation in README.md

---

**Need detailed setup?** See [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)
