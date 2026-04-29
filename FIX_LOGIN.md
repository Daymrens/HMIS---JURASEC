# Fix Login Issue - Step by Step

## Problem
Admin credentials (admin/admin123) not working.

## Solution

### Step 1: Stop the Application
Close the Jurasec POS application if it's running.

### Step 2: Reset Admin Password

Run this command:
```bash
cd jurasec-pos
node reset-admin.js
```

You should see:
```
Database path: /home/username/.config/jurasec-pos/jurasec.db
✅ Admin password reset to: admin123

All users in database:
┌─────────┬────┬──────────┬─────────┐
│ (index) │ id │ username │  role   │
├─────────┼────┼──────────┼─────────┤
│    0    │ 1  │ 'admin'  │ 'admin' │
└─────────┴────┴──────────┴─────────┘
```

### Step 3: Restart the Application

```bash
npx electron .
```

### Step 4: Login

- Username: `admin`
- Password: `admin123`

## Alternative: Fresh Start

If the reset doesn't work, delete the database and start fresh:

### Linux:
```bash
rm -rf ~/.config/jurasec-pos/jurasec.db*
npx electron .
```

### macOS:
```bash
rm -rf ~/Library/Application\ Support/jurasec-pos/jurasec.db*
npx electron .
```

### Windows:
```cmd
del %APPDATA%\jurasec-pos\jurasec.db*
npx electron .
```

The app will create a new database with the default admin user.

## Verify the Fix

After logging in successfully:

1. ✅ Go to Users page
2. ✅ Change admin password to something secure
3. ✅ Create a test user
4. ✅ Logout and test the new user

## Still Not Working?

1. Check if the database file exists:
   ```bash
   # Linux
   ls -la ~/.config/jurasec-pos/
   
   # macOS
   ls -la ~/Library/Application\ Support/jurasec-pos/
   
   # Windows
   dir %APPDATA%\jurasec-pos\
   ```

2. Check console for errors:
   - Run with: `NODE_ENV=development npx electron .`
   - Press Ctrl+Shift+I (or Cmd+Option+I on Mac) to open DevTools
   - Check Console tab for errors

3. Rebuild the application:
   ```bash
   cd jurasec-pos
   npm install
   npx vite build
   node build-electron.js
   npx electron .
   ```

## What Was Fixed

1. ✅ Added console logging to database initialization
2. ✅ Created `reset-admin.js` script to reset password
3. ✅ Created `TROUBLESHOOTING.md` guide
4. ✅ Rebuilt the application with fixes

## Need More Help?

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for comprehensive troubleshooting guide.
