# Seed Data Guide

## Overview

The `seed-products.js` script adds realistic construction supplies data to your database, including:

- **5 Suppliers** - Philippine-based suppliers
- **90+ Products** - Across 8 categories
- **Realistic Pricing** - Philippine Peso (₱) prices
- **Stock Levels** - Initial inventory quantities

## Categories Included

1. **Cement** (5 products) - Portland cement, masonry cement, white cement
2. **Lumber** (8 products) - Plywood, coco lumber, marine plywood
3. **Electrical** (10 products) - Wires, outlets, switches, circuit breakers
4. **Plumbing** (10 products) - PVC pipes, fittings, faucets, shower heads
5. **Tools** (10 products) - Hammers, screwdrivers, measuring tapes, saws
6. **Hardware** (10 products) - Nails, screws, hinges, locks, bolts
7. **Paint** (10 products) - Latex paint, enamel, brushes, rollers
8. **Safety Equipment** (10 products) - Hard hats, goggles, gloves, boots

## How to Use

### Step 1: Run the Application First

The database must exist before seeding:

```bash
cd jurasec-pos
npx electron .
```

Login with admin/admin123, then close the app.

### Step 2: Run the Seed Script

```bash
node seed-products.js
```

### Expected Output

```
Database path: /home/username/.config/jurasec-pos/jurasec.db

Available categories: Electrical, Plumbing, Tools, Lumber, Cement, Hardware, Paint, Safety Equipment

📦 Adding suppliers...
📦 Adding products...
✅ Added 90 products

📊 Inventory Summary:
┌─────────┬──────────────────┬───────┬─────────────────┐
│ (index) │    category      │ count │ inventory_value │
├─────────┼──────────────────┼───────┼─────────────────┤
│    0    │    'Cement'      │   5   │     115000      │
│    1    │  'Electrical'    │  10   │     450000      │
│    2    │   'Hardware'     │  10   │     180000      │
│    3    │    'Lumber'      │   8   │     320000      │
│    4    │    'Paint'       │  10   │     220000      │
│    5    │   'Plumbing'     │  10   │     150000      │
│    6    │ 'Safety Equipment'│  10   │     280000      │
│    7    │    'Tools'       │  10   │     185000      │
└─────────┴──────────────────┴───────┴─────────────────┘

✅ Total Products: 90
💰 Total Inventory Value: ₱1,900,000.00

✅ Database seeded successfully!
```

## What Gets Added

### Suppliers

1. **Manila Hardware Supply** - Manila
2. **Cebu Construction Materials** - Cebu City
3. **Davao Building Supplies** - Davao City
4. **Baguio Tools & Equipment** - Baguio City
5. **Quezon Electrical Supply** - Quezon City

### Sample Products

**Cement:**
- Portland Cement Type 1 (40kg) - ₱280/bag
- Portland Cement Type 2 (40kg) - ₱290/bag
- Masonry Cement (40kg) - ₱270/bag
- White Cement (40kg) - ₱450/bag
- Quick Setting Cement (25kg) - ₱360/bag

**Lumber:**
- Plywood 1/4" x 4' x 8' - ₱580/sheet
- Plywood 1/2" x 4' x 8' - ₱950/sheet
- 2x2 x 10' Coco Lumber - ₱120/pcs
- 2x4 x 10' Coco Lumber - ₱240/pcs
- Marine Plywood 1/2" - ₱1,550/sheet

**Electrical:**
- Romex Wire #12 (100m) - ₱4,500/roll
- Duplex Outlet (White) - ₱40/pcs
- Circuit Breaker 20A - ₱250/pcs
- PVC Conduit 1/2" x 10' - ₱65/pcs
- LED Bulb 9W - ₱120/pcs

**Plumbing:**
- PVC Pipe 1/2" x 10' - ₱120/pcs
- PVC Elbow 1/2" - ₱15/pcs
- Faucet Single Lever - ₱500/pcs
- Shower Head Chrome - ₱400/pcs
- PVC Glue 250ml - ₱120/bottle

**Tools:**
- Hammer Claw 16oz - ₱280/pcs
- Screwdriver Set (6pcs) - ₱380/set
- Measuring Tape 5m - ₱180/pcs
- Level 24" - ₱420/pcs
- Drill Bit Set (13pcs) - ₱550/set

**Hardware:**
- Common Nails 2" (1kg) - ₱120/kg
- Wood Screws #8 x 1" (100pcs) - ₱170/box
- Door Hinge 3" (pair) - ₱70/pair
- Door Knob Set - ₱420/set
- Padlock 40mm - ₱180/pcs

**Paint:**
- Latex Paint White 4L - ₱900/gallon
- Enamel Paint White 4L - ₱1,050/gallon
- Paint Roller 9" - ₱70/pcs
- Paint Brush 2" - ₱55/pcs
- Paint Thinner 1L - ₱125/liter

**Safety Equipment:**
- Hard Hat Yellow - ₱280/pcs
- Safety Goggles Clear - ₱135/pcs
- Work Gloves (pair) - ₱70/pair
- Dust Mask (50pcs) - ₱420/box
- Safety Boots - ₱1,200/pair

## Features

✅ **Realistic Data** - Based on actual Philippine construction supplies
✅ **Proper Pricing** - Cost and selling prices with profit margins
✅ **Stock Levels** - Initial inventory quantities
✅ **Reorder Levels** - Low stock alert thresholds
✅ **Supplier Links** - Each product linked to a supplier
✅ **SKU Codes** - Unique identifiers for each product
✅ **Units** - Proper units (bag, pcs, sheet, kg, etc.)

## After Seeding

1. ✅ Start the application: `npx electron .`
2. ✅ Login with admin/admin123
3. ✅ Go to **Inventory** page to see all products
4. ✅ Go to **Suppliers** page to see suppliers
5. ✅ Go to **POS** page to start making sales
6. ✅ Products are organized by category
7. ✅ Search works with SKU or product name

## Customization

You can edit `seed-products.js` to:

- Add more products
- Change prices
- Adjust stock levels
- Add more suppliers
- Modify categories
- Change product details

## Re-running the Script

The script uses `INSERT OR IGNORE`, so:
- ✅ Safe to run multiple times
- ✅ Won't create duplicates
- ✅ Only adds new products

## Troubleshooting

### Error: Database not found

**Solution:** Run the app first to create the database:
```bash
npx electron .
```

### Error: Category not found

**Solution:** Make sure all 8 categories exist in the database. They should be created automatically on first run.

### Products not showing

**Solution:** 
1. Check the console output for errors
2. Verify the script completed successfully
3. Restart the application
4. Check Inventory page

## Inventory Value

After seeding, you'll have approximately:
- **90+ products** in inventory
- **₱1.9 million** total inventory value (at cost)
- **₱2.4 million** potential revenue (at selling price)
- **₱500,000+** potential profit margin

## Next Steps

After seeding:

1. ✅ Review products in Inventory page
2. ✅ Adjust stock levels as needed
3. ✅ Update prices if necessary
4. ✅ Add more products manually
5. ✅ Start making sales in POS
6. ✅ Generate reports to see inventory value

## Benefits

- **Save Time** - No need to manually add 90+ products
- **Realistic Testing** - Test with real-world data
- **Ready to Use** - Start selling immediately
- **Professional** - Looks like a real business
- **Training** - Great for staff training

---

**Ready to start selling!** 🚀
