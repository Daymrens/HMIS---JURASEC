# Jurasec Enterprises POS - Quick Start Guide

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation Steps

```bash
# Navigate to project directory
cd jurasec-pos

# Install dependencies
npm install

# Run in development mode
npm run electron:dev

# Build for production
npm run electron:build
```

The production installer will be in the `release/` directory.

## 🔐 First Login

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

⚠️ **Important:** Change the admin password after first login!

### 🔧 If Login Doesn't Work

**Option 1: Reset Admin Password**
```bash
cd jurasec-pos
node reset-admin.js
```

**Option 2: Delete Database and Start Fresh**
```bash
# Linux
rm -rf ~/.config/jurasec-pos/jurasec.db*

# macOS
rm -rf ~/Library/Application\ Support/jurasec-pos/jurasec.db*

# Windows
del %APPDATA%\jurasec-pos\jurasec.db*
```

Then restart the application. See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more help.

## 📖 Quick Tutorial

### 1. Add Products (Inventory)
1. Go to **Inventory** page
2. Click **+ Add Product**
3. Fill in product details:
   - SKU (unique identifier)
   - Name
   - Category
   - Unit (pcs, kg, box, etc.)
   - Stock quantity
   - Reorder level
   - Cost price
   - Selling price
   - Supplier (optional)
4. Click **Add Product**

### 2. Make a Sale (POS)
1. Go to **POS** page
2. Search or browse products by category
3. Click on products to add to cart
4. Adjust quantities using +/- buttons
5. Apply discounts if needed (per item or overall)
6. Toggle VAT on/off (12%)
7. Click **Proceed to Payment**
8. Select payment method:
   - **Cash**: Enter amount paid, system calculates change
   - **GCash**: Confirm payment
   - **Bank Transfer**: Confirm payment
9. Click **Complete Payment**
10. Receipt is displayed - print or close

### 3. Adjust Stock
1. Go to **Inventory** page
2. Click the 📦 icon on any product
3. Select adjustment type:
   - **Stock In**: Delivery, returns, corrections
   - **Stock Out**: Damaged, expired, lost items
4. Enter quantity and reason
5. Click **Adjust Stock**

### 4. Add Suppliers
1. Go to **Suppliers** page
2. Click **+ Add Supplier**
3. Fill in supplier information
4. Click **Add**

### 5. Add Customers
1. Go to **Customers** page
2. Click **+ Add Customer**
3. Fill in customer information
4. Click **Add**

### 6. View Reports
1. Go to **Reports** page
2. Select date range
3. Click **Generate Report**
4. View sales summary and transaction history

### 7. Manage Users (Admin Only)
1. Go to **Users** page
2. Click **+ Add User**
3. Set username, password, and role:
   - **Admin**: Full access
   - **Cashier**: POS and view-only inventory
4. Click **Add**

### 8. Configure Settings
1. Go to **Settings** page
2. Update business information
3. Customize receipt header/footer
4. Adjust tax rate if needed
5. Change theme (Light/Dark)
6. Click **Save Settings**

## 💡 Tips & Best Practices

### Inventory Management
- Set reorder levels to get low stock alerts
- Use stock adjustments to track damaged/lost items
- Link products to suppliers for easy reordering

### POS Operations
- Use category filters for faster product selection
- Search by SKU for quick access
- Apply discounts carefully - they affect profit margins
- Always verify change calculation for cash payments

### Security
- Create separate user accounts for each cashier
- Use strong passwords
- Regularly backup your database
- Don't share admin credentials

### Daily Operations
1. **Morning**: Check dashboard for low stock alerts
2. **During Day**: Process sales through POS
3. **Evening**: Review daily sales report
4. **Weekly**: Check inventory levels and reorder
5. **Monthly**: Review top-selling products

## 🔧 Troubleshooting

### Application won't start
- Ensure Node.js 18+ is installed
- Delete `node_modules` and run `npm install` again
- Check if port 5173 is available

### Database errors
- Database is stored in user data directory
- Backup regularly using Settings page
- If corrupted, restore from backup

### Products not showing in POS
- Check if products have stock quantity > 0
- Verify products are properly saved in Inventory
- Try refreshing the page

### Receipt not printing
- Ensure printer is connected and configured
- Use browser print dialog (Ctrl+P / Cmd+P)
- Save as PDF if printer unavailable

## 📞 Support

For issues or questions:
1. Check `PROJECT_STATUS.md` for known limitations
2. Review `requirements.md` for feature specifications
3. Check `design.md` for technical architecture

## 🎯 Next Steps

After setup:
1. ✅ Change admin password
2. ✅ Add your business information in Settings
3. ✅ Create user accounts for cashiers
4. ✅ Add product categories (if needed)
5. ✅ Add suppliers
6. ✅ Import or add products
7. ✅ Test a sample transaction
8. ✅ Configure receipt settings
9. ✅ Set up regular database backups
10. ✅ Train staff on POS operations

## 📦 Database Location

- **Windows**: `%APPDATA%/jurasec-pos/jurasec.db`
- **macOS**: `~/Library/Application Support/jurasec-pos/jurasec.db`
- **Linux**: `~/.config/jurasec-pos/jurasec.db`

Backup this file regularly!

## 🌟 Key Features

✅ Offline-first (no internet required)
✅ Fast product search
✅ Multiple payment methods
✅ Automatic stock tracking
✅ Low stock alerts
✅ Receipt printing
✅ Sales reporting
✅ User access control
✅ Philippine Peso (₱) currency
✅ 12% VAT support

---

**Jurasec Enterprises POS & Inventory Management System**
Version 1.0.0 | Built with Electron + React + TypeScript + SQLite
