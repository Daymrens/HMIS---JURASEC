# 🏗️ Jurasec Enterprises - POS & Inventory Management System

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Electron](https://img.shields.io/badge/electron-34.0.0-blue.svg)
![React](https://img.shields.io/badge/react-18.3.1-blue.svg)

**A complete, offline-first desktop application for hardware and construction supplies business management.**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Documentation](#-documentation) • [Screenshots](#-screenshots)

</div>

---

## 📋 Overview

Jurasec POS is a comprehensive Point of Sale and Inventory Management System specifically designed for hardware stores and construction supplies businesses in the Philippines. Built with modern technologies, it offers a complete solution for managing sales, inventory, customers, suppliers, and business operations.

### 🎯 Key Highlights

- 🚀 **145+ Features** - Complete business management solution
- 💾 **Offline-First** - Works without internet connection
- 🇵🇭 **Philippine-Ready** - PHP currency, 12% VAT, BIR compliance
- 📦 **Sample Data** - 73+ construction supplies products included
- 🔐 **Secure** - Role-based access control with 22 permissions
- 📊 **Analytics** - Comprehensive reports and dashboards
- 🎨 **Customizable** - 8 themes, multi-language support

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 18 + TypeScript |
| **Styling** | TailwindCSS |
| **Desktop** | Electron 34 |
| **Database** | SQLite (better-sqlite3) |
| **State Management** | Zustand |
| **Charts** | Recharts |
| **Build Tool** | Vite |
| **Authentication** | bcryptjs |

## ✨ Features

### 🏪 Core Modules

<details>
<summary><b>Dashboard & Analytics</b></summary>

- Real-time sales overview
- Revenue tracking (today, week, month, year)
- Top selling products
- Low stock alerts
- Recent transactions
- Interactive charts (line/bar/pie)
- Payment method breakdown
- Customizable widgets
</details>

<details>
<summary><b>Point of Sale (POS)</b></summary>

- Fast product search and barcode scanning
- Shopping cart management
- Multiple payment methods (Cash, Card, GCash, PayMaya)
- Tax calculation (12% VAT)
- Receipt generation and printing
- Customer selection
- Discount application
- Cash register management
- Quick sale shortcuts (F1-F12)
- Returns & refunds
- Layaway/installment plans
</details>

<details>
<summary><b>Inventory Management</b></summary>

- Product CRUD operations
- Category management
- Stock tracking and adjustments
- Low stock alerts
- Reorder level management
- Product images
- CSV import/export
- Bulk edit products
- Product variants (size, color, etc.)
- Expiry date tracking
- Serial number tracking
- Quick product add (Ctrl+N)
</details>

<details>
<summary><b>Business Operations</b></summary>

- Purchase orders to suppliers
- Professional quotations
- Invoice generation with payment tracking
- Credit sales management
- Layaway/installment plans
- Returns & refunds processing
- Promotions & discounts
- Loyalty points system
- Multi-location support
- Employee time tracking
</details>

<details>
<summary><b>Reports & Compliance</b></summary>

- Sales reports (daily, weekly, monthly, yearly)
- Inventory reports
- Category sales breakdown
- Inventory turnover analysis
- Period comparison
- Profit & loss statements
- Sales by cashier
- Hourly sales analysis
- BIR compliance reports (7 types)
- Export to CSV/Excel
</details>

<details>
<summary><b>User Management</b></summary>

- Role-based access control
- 22 granular permissions
- 4 default roles (Admin, Manager, Cashier, Custom)
- User CRUD operations
- Session management
- Activity logging
- Audit trail
</details>

<details>
<summary><b>Settings & Configuration</b></summary>

- Business information
- Receipt customization (4 templates)
- Tax rate configuration
- Auto backup scheduling
- Theme customization (8 themes)
- Multi-language support (6 languages)
- Integration management
- Notification center
</details>

### 🚀 Advanced Features

- **Integrations**: QuickBooks, Xero, Shopify, WooCommerce, Lazada, PayPal, Stripe, PayMaya, GCash, LBC, J&T, Ninja Van
- **Security**: Permission system, audit trail, activity logs
- **Compliance**: BIR reports, VAT tracking, tax compliance
- **Automation**: Auto backup, scheduled reports, low stock alerts
- **Customization**: Custom themes, dashboard widgets, receipt templates

## 📥 Installation

### Prerequisites

- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **npm** 8 or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Daymrens/HMIS---JURASEC.git
cd HMIS---JURASEC

# Install dependencies
npm install

# Build the application
npx vite build
node build-electron.js

# Start the application
npx electron .
```

Or use the startup script:
```bash
./start.sh
```

### First Login

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change the admin password after first login!

## 📦 Sample Data

Load 73+ construction supplies products instantly:

```bash
node seed-products.js
```

This adds:
- ✅ 5 Philippine suppliers
- ✅ 73+ products across 8 categories
- ✅ Realistic pricing in Philippine Peso (₱)
- ✅ ₱2.7M inventory value

**Categories**: Cement, Lumber, Electrical, Plumbing, Tools, Hardware, Paint, Safety Equipment

## 🚀 Usage

### Starting the Application

```bash
npx electron .
```

### Common Commands

| Command | Description |
|---------|-------------|
| `npx electron .` | Start the application |
| `node seed-products.js` | Add sample products |
| `node reset-admin.js` | Reset admin password |
| `npm run build` | Build for production |
| `npx electron-rebuild -f -w better-sqlite3` | Fix native module issues |

### Keyboard Shortcuts

- **Ctrl+N** - Quick add product
- **Ctrl+I** - Import CSV
- **F1-F12** - Quick sale shortcuts (configurable)
- **Ctrl+Shift+I** - Open DevTools (development mode)

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [START_HERE.md](./START_HERE.md) | Quick setup guide |
| [QUICK_START.md](./QUICK_START.md) | Detailed getting started |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Fix common issues |
| [SEED_DATA_GUIDE.md](./SEED_DATA_GUIDE.md) | Sample data information |
| [FIX_LOGIN.md](./FIX_LOGIN.md) | Login problem solutions |
| [WHATS_NEW.md](./WHATS_NEW.md) | Latest features |
| [FINAL_PROJECT_SUMMARY.md](./FINAL_PROJECT_SUMMARY.md) | Complete feature list |

## 🔧 Troubleshooting

### Can't Login?

```bash
node reset-admin.js
```

### Native Module Errors?

```bash
npx electron-rebuild -f -w better-sqlite3
npx electron .
```

### Database Issues?

```bash
# Linux
rm -rf ~/.config/jurasec-pos/jurasec.db*

# macOS
rm -rf ~/Library/Application\ Support/jurasec-pos/jurasec.db*

# Windows
del %APPDATA%\jurasec-pos\jurasec.db*
```

Then restart the application.

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more help.

## 📊 Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/800x450/1e3a8a/ffffff?text=Dashboard+with+Analytics)

### Point of Sale
![POS](https://via.placeholder.com/800x450/1e3a8a/ffffff?text=Point+of+Sale+System)

### Inventory Management
![Inventory](https://via.placeholder.com/800x450/1e3a8a/ffffff?text=Inventory+Management)

### Reports
![Reports](https://via.placeholder.com/800x450/1e3a8a/ffffff?text=Sales+Reports)

## 🏗️ Project Structure

```
jurasec-pos/
├── electron/              # Electron main process
│   ├── main.ts           # Main process entry
│   ├── preload.ts        # Preload script
│   └── database/         # SQLite database
│       ├── connection.ts # DB connection
│       └── queries/      # Query modules
├── src/                  # React frontend
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── stores/          # Zustand stores
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── styles/          # CSS files
├── dist/                # Built frontend
├── dist-electron/       # Built Electron
├── release/             # Distributable packages
└── docs/                # Documentation
```

## 💾 Database

### Location

- **Linux**: `~/.config/jurasec-pos/jurasec.db`
- **macOS**: `~/Library/Application Support/jurasec-pos/jurasec.db`
- **Windows**: `%APPDATA%\jurasec-pos\jurasec.db`

### Schema

10 tables: users, products, categories, suppliers, customers, transactions, transaction_items, stock_adjustments, purchase_orders, settings

### Backup

Use the built-in backup feature in Settings or manually copy the database file.

## 🎯 Use Cases

Perfect for:
- 🏗️ Hardware stores
- 🔨 Construction supplies
- 🛒 Supermarkets
- 💊 Pharmacies
- 📱 Electronics stores
- 👕 Clothing stores
- 🍽️ Restaurants
- 🏪 Retail businesses

## 🌟 Why Choose Jurasec POS?

| Feature | Benefit |
|---------|---------|
| **Offline-First** | No internet dependency |
| **Philippine-Ready** | PHP currency, VAT, BIR reports |
| **Complete Solution** | 145+ features out of the box |
| **Easy Setup** | Ready in 5 minutes |
| **Sample Data** | Test with realistic products |
| **Secure** | Role-based access control |
| **Customizable** | Themes, languages, templates |
| **Free** | Open source, no subscription |

## 🔐 Security

- Password-based authentication
- Role-based access control (22 permissions)
- Session management
- Audit trail logging
- Data backup and restore
- Local data storage (offline-first)
- Activity monitoring

## 🌍 Localization

- **Currency**: Philippine Peso (₱)
- **Tax Rate**: 12% VAT
- **Languages**: English, Filipino, Cebuano, Ilocano, Hiligaynon, Waray
- **Date Format**: Localized
- **Time Zone**: Philippine Time

## 📈 Performance

- **Fast**: SQLite for quick queries
- **Efficient**: React optimization
- **Scalable**: Handles thousands of products
- **Reliable**: Automatic backups
- **Responsive**: Touch-friendly interface

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Jurasec Enterprises**

## 🙏 Acknowledgments

- Built with ❤️ for hardware and construction supplies businesses
- Designed for the Philippine market
- Powered by modern web technologies

## 📞 Support

- 📖 [Documentation](./START_HERE.md)
- 🐛 [Issue Tracker](https://github.com/Daymrens/HMIS---JURASEC/issues)
- 💬 [Discussions](https://github.com/Daymrens/HMIS---JURASEC/discussions)

## 🗺️ Roadmap

- [ ] Mobile app companion
- [ ] Cloud synchronization
- [ ] Advanced analytics with AI
- [ ] Automated reordering
- [ ] Customer mobile app
- [ ] Online ordering portal
- [ ] API for third-party integrations
- [ ] Multi-currency full support

## 📊 Statistics

- **Total Features**: 145+
- **Lines of Code**: 15,000+
- **Components**: 50+
- **Database Tables**: 10
- **Integrations**: 12 platforms
- **Languages**: 6
- **Themes**: 8

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ for Philippine businesses

[Report Bug](https://github.com/Daymrens/HMIS---JURASEC/issues) • [Request Feature](https://github.com/Daymrens/HMIS---JURASEC/issues)

</div>
