# Troubleshooting Guide

## Login Issues

### Problem: Admin credentials not working

**Default Credentials:**
- Username: `admin`
- Password: `admin123`

### Solution 1: Reset Admin Password

Run the reset script:

```bash
cd jurasec-pos
node reset-admin.js
```

This will:
- Find your database location
- Reset the admin password to `admin123`
- Show all users in the database

### Solution 2: Delete Database and Start Fresh

**Linux:**
```bash
rm -rf ~/.config/jurasec-pos/jurasec.db*
```

**macOS:**
```bash
rm -rf ~/Library/Application\ Support/jurasec-pos/jurasec.db*
```

**Windows:**
```cmd
del %APPDATA%\jurasec-pos\jurasec.db*
```

Then restart the application. It will create a fresh database with the default admin user.

### Solution 3: Check Database Location

The database is stored in:
- **Linux:** `~/.config/jurasec-pos/jurasec.db`
- **macOS:** `~/Library/Application Support/jurasec-pos/jurasec.db`
- **Windows:** `%APPDATA%\jurasec-pos\jurasec.db`

### Solution 4: Rebuild the Application

```bash
cd jurasec-pos
npm install
npx vite build
node build-electron.js
npx electron .
```

### Solution 5: Fix Native Module Issues

If you see "NODE_MODULE_VERSION" errors:

```bash
cd jurasec-pos
npm install electron-rebuild --save-dev
npx electron-rebuild -f -w better-sqlite3
npx electron .
```

This rebuilds `better-sqlite3` for Electron's Node.js version.

## Common Issues

### Issue: Application won't start

**Check:**
1. Node.js is installed (v16 or higher)
2. Dependencies are installed: `npm install`
3. Build is complete: `npx vite build`

### Issue: Blank screen on startup

**Solution:**
1. Open DevTools (Ctrl+Shift+I or Cmd+Option+I)
2. Check console for errors
3. Rebuild: `npx vite build && node build-electron.js`

### Issue: Database errors

**Solution:**
Delete the database and let it recreate:
```bash
# Linux/macOS
rm -rf ~/.config/jurasec-pos/jurasec.db*

# Then restart the app
npx electron .
```

### Issue: Products not showing

**Check:**
1. Database is initialized
2. Add some products first
3. Check console for errors

## Development Mode

To run in development mode with DevTools:

```bash
NODE_ENV=development npx electron .
```

## Getting Help

If issues persist:
1. Check the console logs
2. Verify database exists and has data
3. Try the reset-admin.js script
4. Delete database and start fresh
5. Rebuild the entire application

## Verification Steps

After fixing login issues:

1. ✅ Login with admin/admin123
2. ✅ Navigate to Users page
3. ✅ Create a test user
4. ✅ Logout and login with test user
5. ✅ Verify permissions work correctly

## Database Schema Check

To verify your database is correct:

```bash
cd jurasec-pos
node -e "const db = require('better-sqlite3')(require('path').join(require('os').homedir(), '.config/jurasec-pos/jurasec.db')); console.log(db.prepare('SELECT * FROM users').all()); db.close();"
```

This will show all users in the database.
