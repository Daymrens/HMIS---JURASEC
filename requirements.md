# Requirements Specification: Jurasec Enterprises POS & Inventory System

## 1. Functional Requirements

### 1.1 Dashboard Module
- FR-D-001: Display summary cards showing today's sales, total products, low stock alerts, and top-selling items
- FR-D-002: Render sales trend chart with daily/weekly/monthly views
- FR-D-003: Show recent transactions list (last 10 transactions)
- FR-D-004: Provide quick action buttons for New Sale, Add Product, and View Reports

### 1.2 Point of Sale (POS) Module
- FR-P-001: Search products by name, SKU, or barcode
- FR-P-002: Display product grid with category filters (Electrical, Plumbing, Tools, Lumber, Cement, Hardware)
- FR-P-003: Maintain shopping cart with quantity controls and subtotals
- FR-P-004: Apply discounts per item or overall percentage
- FR-P-005: Toggle 12% Philippine VAT calculation
- FR-P-006: Display subtotal, tax, and grand total
- FR-P-007: Process payments via Cash, GCash, or Bank Transfer
- FR-P-008: Calculate change for cash payments
- FR-P-009: Generate and print/save receipt as PDF
- FR-P-010: Show transaction complete screen with receipt preview

### 1.3 Inventory Management Module
- FR-I-001: List all products with search and category filter
- FR-I-002: Sort products by SKU, name, stock quantity, or price
- FR-I-003: Display product details: SKU, Name, Category, Unit, Stock Qty, Reorder Level, Cost Price, Selling Price, Supplier
- FR-I-004: Create, edit, and delete products
- FR-I-005: Adjust stock manually with reason tracking (delivery, damaged, return)
- FR-I-006: Highlight products below reorder level
- FR-I-007: Import products via CSV file

### 1.4 Suppliers Module
- FR-S-001: List suppliers with name, contact person, phone, email, and address
- FR-S-002: Create, edit, and delete suppliers
- FR-S-003: Link products to suppliers
- FR-S-004: Create purchase orders with supplier and product selection

### 1.5 Customers Module
- FR-C-001: List customers with name, phone, address, and purchase history
- FR-C-002: Create and edit customer records
- FR-C-003: Attach customer to POS transactions for history tracking

### 1.6 Sales & Reports Module
- FR-R-001: Display sales history with date range, cashier, and payment method filters
- FR-R-002: Show transaction detail view
- FR-R-003: Generate daily/weekly/monthly sales summary reports
- FR-R-004: Generate top-selling products report
- FR-R-005: Generate inventory valuation report
- FR-R-006: Generate low stock report
- FR-R-007: Export reports to PDF or CSV

### 1.7 User Management Module
- FR-U-001: Support Admin and Cashier roles
- FR-U-002: Admin has full system access
- FR-U-003: Cashier has POS and view-only inventory access
- FR-U-004: Authenticate users with username and password (bcrypt hashed)
- FR-U-005: Manage user sessions with auto-logout after idle period

### 1.8 Settings Module
- FR-ST-001: Configure business info (company name, address, TIN, contact)
- FR-ST-002: Configure receipt settings (header/footer text, VAT display, logo)
- FR-ST-003: Configure tax rate
- FR-ST-004: Backup and restore SQLite database
- FR-ST-005: Toggle light/dark theme

## 2. Non-Functional Requirements

### 2.1 Performance
- NFR-P-001: Application startup time < 3 seconds
- NFR-P-002: Product search results display < 500ms
- NFR-P-003: Transaction processing complete < 1 second
- NFR-P-004: Support inventory of up to 10,000 products

### 2.2 Usability
- NFR-U-001: Minimum screen resolution support: 1366x768
- NFR-U-002: All modals keyboard-navigable
- NFR-U-003: Clear error messages for user actions
- NFR-U-004: Consistent UI patterns across modules

### 2.3 Security
- NFR-S-001: Password hashing using bcrypt
- NFR-S-002: Session timeout after 30 minutes of inactivity
- NFR-S-003: Role-based access control enforcement
- NFR-S-004: Local data storage only (no external transmission)

### 2.4 Reliability
- NFR-R-001: Data persistence via SQLite with ACID compliance
- NFR-R-002: Automatic database backup capability
- NFR-R-003: Graceful error handling with user feedback

### 2.5 Compatibility
- NFR-C-001: Primary target: Windows 10/11
- NFR-C-002: Secondary target: macOS (optional)
- NFR-C-003: Offline-first architecture (no internet required)

## 3. Data Requirements

### 3.1 Currency
- Philippine Peso (₱) as default currency
- Two decimal places for all monetary values

### 3.2 Tax
- 12% Philippine VAT (configurable)
- Toggle VAT on/off per transaction

### 3.3 Receipt Format
- Support 80mm thermal printer format
- Support A4 paper format
- Include business info, items, totals, and payment details

## 4. Constraints
- Local SQLite database only (no cloud sync)
- Desktop application (not web-based)
- Single-user operation per instance
- Windows as primary deployment target
