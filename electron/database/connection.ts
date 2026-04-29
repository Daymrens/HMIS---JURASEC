import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';
import bcrypt from 'bcryptjs';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'jurasec.db');
    
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

export function initDatabase() {
  const database = getDatabase();

  // Create tables
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'cashier')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact_person TEXT,
      phone TEXT,
      email TEXT,
      address TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category_id INTEGER,
      unit TEXT NOT NULL,
      stock_qty INTEGER DEFAULT 0,
      reorder_level INTEGER DEFAULT 0,
      cost_price REAL NOT NULL,
      selling_price REAL NOT NULL,
      supplier_id INTEGER,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_no TEXT UNIQUE NOT NULL,
      customer_id INTEGER,
      user_id INTEGER NOT NULL,
      payment_method TEXT NOT NULL CHECK(payment_method IN ('cash', 'gcash', 'bank_transfer')),
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0,
      tax REAL DEFAULT 0,
      total REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS transaction_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      qty INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      discount REAL DEFAULT 0,
      subtotal REAL NOT NULL,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS stock_adjustments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('in', 'out')),
      qty INTEGER NOT NULL,
      reason TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS purchase_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplier_id INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending', 'completed', 'cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    );

    CREATE TABLE IF NOT EXISTS purchase_order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      po_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      qty INTEGER NOT NULL,
      unit_cost REAL NOT NULL,
      FOREIGN KEY (po_id) REFERENCES purchase_orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(created_at);
    CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction ON transaction_items(transaction_id);
  `);

  // Seed default data
  seedDefaultData(database);
}

function seedDefaultData(database: Database.Database) {
  // Check if admin user exists
  const adminExists = database.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    database.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run('admin', hashedPassword, 'admin');
    console.log('✅ Default admin user created (username: admin, password: admin123)');
  } else {
    console.log('✅ Admin user already exists');
  }

  // Seed categories
  const categories = ['Electrical', 'Plumbing', 'Tools', 'Lumber', 'Cement', 'Hardware', 'Paint', 'Safety Equipment'];
  const categoryExists = database.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  
  if (categoryExists.count === 0) {
    const insertCategory = database.prepare('INSERT INTO categories (name) VALUES (?)');
    categories.forEach(cat => insertCategory.run(cat));
  }

  // Seed default settings
  const settingsExist = database.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
  
  if (settingsExist.count === 0) {
    const insertSetting = database.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
    insertSetting.run('company_name', 'Jurasec Enterprises');
    insertSetting.run('tax_rate', '0.12');
    insertSetting.run('receipt_header', 'Thank you for your business!');
    insertSetting.run('receipt_footer', 'Please come again');
    insertSetting.run('theme', 'light');
  }
}
