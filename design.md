# Design Specification: Jurasec Enterprises POS & Inventory System

## 1. Architecture Overview

### 1.1 Application Architecture
```
┌─────────────────────────────────────────┐
│         Electron Main Process           │
│  - Window Management                    │
│  - Database Connection (better-sqlite3) │
│  - IPC Handlers                         │
│  - File System Operations               │
└─────────────────────────────────────────┘
                    ↕ IPC
┌─────────────────────────────────────────┐
│       Electron Renderer Process         │
│  ┌───────────────────────────────────┐  │
│  │   React Application (TypeScript)  │  │
│  │  - UI Components (shadcn/ui)      │  │
│  │  - State Management (Zustand)     │  │
│  │  - Routing                        │  │
│  │  - Business Logic                 │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│          SQLite Database                │
│  - Local file-based storage             │
│  - ACID transactions                    │
└─────────────────────────────────────────┘
```

### 1.2 Technology Stack
- **Frontend Framework**: React 18 + TypeScript
- **Desktop Framework**: Electron
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Database**: SQLite via better-sqlite3
- **Charts**: Recharts
- **PDF Generation**: jsPDF or react-pdf
- **Packaging**: electron-builder

## 2. Folder Structure

```
jurasec-pos/
├── electron/
│   ├── main.ts                 # Electron main process
│   ├── preload.ts              # Preload script for IPC
│   └── database/
│       ├── connection.ts       # SQLite connection
│       ├── migrations.ts       # Database schema setup
│       └── queries/
│           ├── products.ts
│           ├── transactions.ts
│           ├── users.ts
│           └── ...
├── src/
│   ├── main.tsx                # React entry point
│   ├── App.tsx                 # Root component
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Layout.tsx
│   │   ├── pos/
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── Cart.tsx
│   │   │   ├── PaymentModal.tsx
│   │   │   └── Receipt.tsx
│   │   ├── inventory/
│   │   │   ├── ProductList.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   └── StockAdjustment.tsx
│   │   ├── dashboard/
│   │   │   ├── SummaryCard.tsx
│   │   │   ├── SalesChart.tsx
│   │   │   └── RecentTransactions.tsx
│   │   └── ...
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── POS.tsx
│   │   ├── Inventory.tsx
│   │   ├── Suppliers.tsx
│   │   ├── Customers.tsx
│   │   ├── Reports.tsx
│   │   ├── Users.tsx
│   │   ├── Settings.tsx
│   │   └── Login.tsx
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── cartStore.ts
│   │   ├── inventoryStore.ts
│   │   └── settingsStore.ts
│   ├── types/
│   │   ├── database.ts
│   │   ├── models.ts
│   │   └── api.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── calculations.ts
│   └── styles/
│       └── globals.css
├── public/
│   └── assets/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── electron-builder.json
```

## 3. Database Schema

### 3.1 Tables

```sql
-- Users
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'cashier')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categories
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
);

-- Suppliers
CREATE TABLE suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT
);

-- Products
CREATE TABLE products (
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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- Customers
CREATE TABLE customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Transactions
CREATE TABLE transactions (
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

-- Transaction Items
CREATE TABLE transaction_items (
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

-- Stock Adjustments
CREATE TABLE stock_adjustments (
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

-- Purchase Orders
CREATE TABLE purchase_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  supplier_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'completed', 'cancelled')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- Purchase Order Items
CREATE TABLE purchase_order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  po_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  qty INTEGER NOT NULL,
  unit_cost REAL NOT NULL,
  FOREIGN KEY (po_id) REFERENCES purchase_orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Settings
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

### 3.2 Indexes
```sql
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_transactions_date ON transactions(created_at);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transaction_items_transaction ON transaction_items(transaction_id);
```

## 4. Data Flow

### 4.1 POS Transaction Flow
```
1. User searches/selects products → Add to cart (Zustand store)
2. User adjusts quantities/discounts → Cart updates
3. User clicks checkout → Payment modal opens
4. User enters payment details → Validate payment
5. Submit transaction → IPC to main process
6. Main process:
   - Begin SQLite transaction
   - Insert transaction record
   - Insert transaction_items records
   - Update product stock quantities
   - Commit transaction
7. Return success → Generate receipt
8. Display receipt → Option to print/save PDF
```

### 4.2 Inventory Update Flow
```
1. User edits product → Form validation
2. Submit changes → IPC to main process
3. Main process updates products table
4. Return success → Refresh inventory list
5. Update Zustand store
```

### 4.3 Authentication Flow
```
1. User enters credentials → Validate format
2. Submit login → IPC to main process
3. Main process:
   - Query users table
   - Compare password hash (bcrypt)
   - Create session token
4. Return user data + token → Store in authStore
5. Redirect to dashboard
6. Set idle timer → Auto-logout after 30 min
```

## 5. UI/UX Design

### 5.1 Color Palette
- **Primary**: Dark Navy (#1e293b)
- **Accent**: Orange (#f97316)
- **Background**: White (#ffffff)
- **Text**: Dark Gray (#1f2937)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)

### 5.2 Layout Structure
```
┌─────────────────────────────────────────┐
│  Sidebar (240px)  │   Main Content      │
│                   │                     │
│  - Dashboard      │  ┌───────────────┐  │
│  - POS            │  │   Header      │  │
│  - Inventory      │  └───────────────┘  │
│  - Suppliers      │                     │
│  - Customers      │  ┌───────────────┐  │
│  - Reports        │  │               │  │
│  - Users          │  │   Content     │  │
│  - Settings       │  │   Area        │  │
│                   │  │               │  │
│                   │  └───────────────┘  │
└─────────────────────────────────────────┘
```

### 5.3 POS Layout
```
┌─────────────────────────────────────────┐
│  Search Bar                             │
├──────────────────────────┬──────────────┤
│  Category Filters        │   Cart       │
├──────────────────────────┤              │
│                          │  Items List  │
│   Product Grid           │              │
│   (Cards with image,     │  ───────────  │
│    name, price)          │  Subtotal    │
│                          │  Discount    │
│                          │  Tax         │
│                          │  Total       │
│                          │              │
│                          │  [Checkout]  │
└──────────────────────────┴──────────────┘
```

## 6. IPC Communication

### 6.1 Channel Definitions
```typescript
// Products
'products:getAll'
'products:getById'
'products:create'
'products:update'
'products:delete'
'products:search'

// Transactions
'transactions:create'
'transactions:getAll'
'transactions:getById'

// Users
'users:login'
'users:logout'
'users:getAll'
'users:create'

// Reports
'reports:sales'
'reports:inventory'
'reports:topProducts'

// Settings
'settings:get'
'settings:update'
'settings:backup'
'settings:restore'
```

## 7. Security Considerations

- Password hashing with bcrypt (salt rounds: 10)
- Session tokens stored in memory only
- Role-based access control on IPC handlers
- Input validation on all database operations
- SQL injection prevention via parameterized queries
- Auto-logout after 30 minutes idle
- Database file permissions restricted to app user

## 8. Performance Optimization

- Database connection pooling (single connection, reused)
- Indexed queries for common searches
- Lazy loading for large product lists
- Debounced search inputs
- Memoized React components
- Virtual scrolling for long lists
- Optimistic UI updates with rollback on error
