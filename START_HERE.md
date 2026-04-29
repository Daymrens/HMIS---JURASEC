# 🚀 START HERE - Quick Setup Guide

## First Time Setup (5 minutes)

### Step 1: Install Dependencies

```bash
cd jurasec-pos
npm install
```

This will automatically rebuild native modules for Electron.

### Step 2: Build the Application

```bash
npx vite build
node build-electron.js
```

### Step 3: Start the Application

**Option A: Simple Start**
```bash
npx electron .
```

**Option B: Use Startup Script**
```bash
./start.sh
```

### Step 4: Login

- **Username:** `admin`
- **Password:** `admin123`

### Step 5: Add Sample Data (Optional)

```bash
node seed-products.js
```

This adds 73 construction supplies products worth ₱2.7M.

---

## Daily Usage

### Start the App

```bash
cd jurasec-pos
npx electron .
```

Or use the startup script:
```bash
./start.sh
```

### Login

- Username: `admin`
- Password: `admin123`

---

## Common Issues & Quick Fixes

### ❌ "NODE_MODULE_VERSION" Error

**Fix:**
```bash
npx electron-rebuild -f -w better-sqlite3
npx electron .
```

### ❌ Can't Login

**Fix:**
```bash
node reset-admin.js
npx electron .
```

### ❌ Blank Screen

**Fix:**
```bash
npx vite build
node build-electron.js
npx electron .
```

### ❌ Database Errors

**Fix (Linux):**
```bash
rm -rf ~/.config/jurasec-pos/jurasec.db*
npx electron .
```

---

## What's Included

### ✅ Core Features
- Dashboard with analytics
- Point of Sale (POS)
- Inventory management
- Supplier management
- Customer management
- Sales reports
- User management
- Settings

### ✅ Advanced Features
- Purchase orders
- Quotations & invoicing
- Credit sales
- Loyalty points
- BIR compliance reports
- Multi-location support
- Audit trail
- Auto backup

### ✅ Sample Data
- 73 construction supplies products
- 5 Philippine suppliers
- 8 product categories
- ₱2.7M inventory value

---

## Quick Commands

### Start Application
```bash
npx electron .
```

### Add Sample Data
```bash
node seed-products.js
```

### Reset Admin Password
```bash
node reset-admin.js
```

### Rebuild for Electron
```bash
npx electron-rebuild -f -w better-sqlite3
```

### Full Rebuild
```bash
npm install
npx vite build
node build-electron.js
npx electron .
```

---

## File Locations

### Database
- **Linux:** `~/.config/jurasec-pos/jurasec.db`
- **macOS:** `~/Library/Application Support/jurasec-pos/jurasec.db`
- **Windows:** `%APPDATA%\jurasec-pos\jurasec.db`

### Backups
Created from Settings page, saved to your chosen location.

---

## Documentation

- **README.md** - Project overview
- **QUICK_START.md** - Detailed getting started guide
- **TROUBLESHOOTING.md** - Fix common issues
- **SEED_DATA_GUIDE.md** - Sample data information
- **FIX_LOGIN.md** - Login problem solutions
- **WHATS_NEW.md** - Latest features
- **FINAL_PROJECT_SUMMARY.md** - Complete feature list

---

## Support

### Can't Login?
See [FIX_LOGIN.md](./FIX_LOGIN.md)

### Other Issues?
See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

### Need Sample Data?
See [SEED_DATA_GUIDE.md](./SEED_DATA_GUIDE.md)

---

## Next Steps

After successful login:

1. ✅ Change admin password (Users page)
2. ✅ Add business info (Settings page)
3. ✅ Load sample data: `node seed-products.js`
4. ✅ Create user accounts for staff
5. ✅ Configure receipt settings
6. ✅ Start making sales!

---

## Tips

### For Development
```bash
NODE_ENV=development npx electron .
```
This opens DevTools automatically.

### For Production
```bash
npx electron .
```
Normal mode without DevTools.

### For Building Installer
```bash
npm run build
```
Creates installer in `release/` folder.

---

## System Requirements

- **Node.js:** 18+ (check with `node --version`)
- **npm:** 8+ (check with `npm --version`)
- **OS:** Linux, macOS, or Windows
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 500MB for app, 1GB+ for data

---

## Quick Test

After starting the app:

1. ✅ Login with admin/admin123
2. ✅ Go to Dashboard - see overview
3. ✅ Go to Inventory - see products (if seeded)
4. ✅ Go to POS - try adding items to cart
5. ✅ Go to Reports - generate a report
6. ✅ Go to Settings - update business info

---

## Keyboard Shortcuts

- **Ctrl+N** - Quick add product
- **Ctrl+I** - Import CSV
- **F1-F12** - Quick sale shortcuts (configurable)
- **Ctrl+Shift+I** - Open DevTools (development mode)

---

## Default Users

After first run, only admin user exists:
- Username: `admin`
- Password: `admin123`
- Role: Administrator (full access)

Create additional users from the Users page.

---

## Ready to Go! 🎉

Your Jurasec POS system is ready to use!

**Start now:**
```bash
npx electron .
```

**Login:** admin / admin123

**Add data:** `node seed-products.js`

**Start selling!** 🏗️

---

*For detailed information, see the other documentation files.*
