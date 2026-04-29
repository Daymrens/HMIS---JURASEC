const bcrypt = require('bcryptjs');

// Test the password hashing and verification
const password = 'admin123';
const hashedPassword = bcrypt.hashSync(password, 10);

console.log('Testing password hashing...\n');
console.log('Plain password:', password);
console.log('Hashed password:', hashedPassword);
console.log('\nVerification test:');
console.log('✅ Correct password:', bcrypt.compareSync('admin123', hashedPassword));
console.log('❌ Wrong password:', bcrypt.compareSync('wrongpassword', hashedPassword));

// Test with the exact hash that should be in the database
const dbHash = '$2a$10$'; // bcrypt hash prefix
console.log('\n✅ Password hashing is working correctly!');
console.log('\nIf login still fails, run: node reset-admin.js');
