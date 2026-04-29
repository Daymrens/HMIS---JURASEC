const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const os = require('os');

// Get the database path (same as Electron app)
const appName = 'jurasec-pos';
let dbPath;

if (process.platform === 'win32') {
  dbPath = path.join(process.env.APPDATA || '', appName, 'jurasec.db');
} else if (process.platform === 'darwin') {
  dbPath = path.join(os.homedir(), 'Library', 'Application Support', appName, 'jurasec.db');
} else {
  dbPath = path.join(os.homedir(), '.config', appName, 'jurasec.db');
}

console.log('Database path:', dbPath);

try {
  const db = new Database(dbPath);
  
  // Check if admin exists
  const admin = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
  
  if (admin) {
    console.log('Admin user found. Resetting password...');
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE username = ?').run(hashedPassword, 'admin');
    console.log('✅ Admin password reset to: admin123');
  } else {
    console.log('Admin user not found. Creating new admin user...');
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run('admin', hashedPassword, 'admin');
    console.log('✅ Admin user created with password: admin123');
  }
  
  // List all users
  console.log('\nAll users in database:');
  const users = db.prepare('SELECT id, username, role FROM users').all();
  console.table(users);
  
  db.close();
} catch (error) {
  console.error('Error:', error.message);
  console.log('\nIf database does not exist, run the app first to create it.');
}
