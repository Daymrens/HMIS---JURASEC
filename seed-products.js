const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

// Get the database path
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

  // Get category IDs
  const categories = db.prepare('SELECT id, name FROM categories').all();
  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat.name] = cat.id;
  });

  console.log('\nAvailable categories:', Object.keys(categoryMap).join(', '));

  // Add suppliers first
  const suppliers = [
    { name: 'Manila Hardware Supply', contact_person: 'Juan Dela Cruz', phone: '02-8123-4567', email: 'manila@hardware.ph', address: 'Manila' },
    { name: 'Cebu Construction Materials', contact_person: 'Maria Santos', phone: '032-234-5678', email: 'cebu@construction.ph', address: 'Cebu City' },
    { name: 'Davao Building Supplies', contact_person: 'Pedro Reyes', phone: '082-345-6789', email: 'davao@building.ph', address: 'Davao City' },
    { name: 'Baguio Tools & Equipment', contact_person: 'Rosa Garcia', phone: '074-456-7890', email: 'baguio@tools.ph', address: 'Baguio City' },
    { name: 'Quezon Electrical Supply', contact_person: 'Jose Mercado', phone: '02-8234-5678', email: 'quezon@electrical.ph', address: 'Quezon City' }
  ];

  console.log('\n📦 Adding suppliers...');
  const insertSupplier = db.prepare('INSERT OR IGNORE INTO suppliers (name, contact_person, phone, email, address) VALUES (?, ?, ?, ?, ?)');
  suppliers.forEach(s => {
    insertSupplier.run(s.name, s.contact_person, s.phone, s.email, s.address);
  });

  const supplierIds = db.prepare('SELECT id, name FROM suppliers').all();
  const supplierMap = {};
  supplierIds.forEach(s => {
    supplierMap[s.name] = s.id;
  });

  // Construction supplies products
  const products = [
    // CEMENT (Cement category)
    { sku: 'CEM-001', name: 'Portland Cement Type 1 (40kg)', category: 'Cement', unit: 'bag', stock: 500, reorder: 100, cost: 220, price: 280, supplier: 'Manila Hardware Supply' },
    { sku: 'CEM-002', name: 'Portland Cement Type 2 (40kg)', category: 'Cement', unit: 'bag', stock: 300, reorder: 80, cost: 230, price: 290, supplier: 'Manila Hardware Supply' },
    { sku: 'CEM-003', name: 'Masonry Cement (40kg)', category: 'Cement', unit: 'bag', stock: 200, reorder: 50, cost: 210, price: 270, supplier: 'Cebu Construction Materials' },
    { sku: 'CEM-004', name: 'White Cement (40kg)', category: 'Cement', unit: 'bag', stock: 100, reorder: 30, cost: 350, price: 450, supplier: 'Manila Hardware Supply' },
    { sku: 'CEM-005', name: 'Quick Setting Cement (25kg)', category: 'Cement', unit: 'bag', stock: 150, reorder: 40, cost: 280, price: 360, supplier: 'Cebu Construction Materials' },

    // LUMBER
    { sku: 'LUM-001', name: 'Plywood 1/4" x 4\' x 8\'', category: 'Lumber', unit: 'sheet', stock: 200, reorder: 50, cost: 450, price: 580, supplier: 'Davao Building Supplies' },
    { sku: 'LUM-002', name: 'Plywood 1/2" x 4\' x 8\'', category: 'Lumber', unit: 'sheet', stock: 180, reorder: 40, cost: 750, price: 950, supplier: 'Davao Building Supplies' },
    { sku: 'LUM-003', name: 'Plywood 3/4" x 4\' x 8\'', category: 'Lumber', unit: 'sheet', stock: 150, reorder: 35, cost: 1100, price: 1400, supplier: 'Davao Building Supplies' },
    { sku: 'LUM-004', name: '2x2 x 10\' Coco Lumber', category: 'Lumber', unit: 'pcs', stock: 300, reorder: 80, cost: 85, price: 120, supplier: 'Davao Building Supplies' },
    { sku: 'LUM-005', name: '2x3 x 10\' Coco Lumber', category: 'Lumber', unit: 'pcs', stock: 250, reorder: 70, cost: 120, price: 160, supplier: 'Davao Building Supplies' },
    { sku: 'LUM-006', name: '2x4 x 10\' Coco Lumber', category: 'Lumber', unit: 'pcs', stock: 200, reorder: 60, cost: 180, price: 240, supplier: 'Davao Building Supplies' },
    { sku: 'LUM-007', name: 'Marine Plywood 1/2" x 4\' x 8\'', category: 'Lumber', unit: 'sheet', stock: 100, reorder: 25, cost: 1200, price: 1550, supplier: 'Davao Building Supplies' },
    { sku: 'LUM-008', name: 'Lawanit Board 1/4" x 4\' x 8\'', category: 'Lumber', unit: 'sheet', stock: 120, reorder: 30, cost: 280, price: 380, supplier: 'Davao Building Supplies' },

    // ELECTRICAL
    { sku: 'ELC-001', name: 'Romex Wire #12 (100m)', category: 'Electrical', unit: 'roll', stock: 80, reorder: 20, cost: 3500, price: 4500, supplier: 'Quezon Electrical Supply' },
    { sku: 'ELC-002', name: 'Romex Wire #14 (100m)', category: 'Electrical', unit: 'roll', stock: 100, reorder: 25, cost: 2800, price: 3600, supplier: 'Quezon Electrical Supply' },
    { sku: 'ELC-003', name: 'Duplex Outlet (White)', category: 'Electrical', unit: 'pcs', stock: 500, reorder: 100, cost: 25, price: 40, supplier: 'Quezon Electrical Supply' },
    { sku: 'ELC-004', name: 'Single Gang Switch', category: 'Electrical', unit: 'pcs', stock: 400, reorder: 80, cost: 20, price: 35, supplier: 'Quezon Electrical Supply' },
    { sku: 'ELC-005', name: 'Circuit Breaker 20A', category: 'Electrical', unit: 'pcs', stock: 150, reorder: 30, cost: 180, price: 250, supplier: 'Quezon Electrical Supply' },
    { sku: 'ELC-006', name: 'Circuit Breaker 30A', category: 'Electrical', unit: 'pcs', stock: 120, reorder: 25, cost: 220, price: 300, supplier: 'Quezon Electrical Supply' },
    { sku: 'ELC-007', name: 'PVC Conduit 1/2" x 10\'', category: 'Electrical', unit: 'pcs', stock: 300, reorder: 60, cost: 45, price: 65, supplier: 'Quezon Electrical Supply' },
    { sku: 'ELC-008', name: 'PVC Conduit 3/4" x 10\'', category: 'Electrical', unit: 'pcs', stock: 250, reorder: 50, cost: 65, price: 90, supplier: 'Quezon Electrical Supply' },
    { sku: 'ELC-009', name: 'Junction Box 4x4', category: 'Electrical', unit: 'pcs', stock: 200, reorder: 40, cost: 15, price: 25, supplier: 'Quezon Electrical Supply' },
    { sku: 'ELC-010', name: 'LED Bulb 9W', category: 'Electrical', unit: 'pcs', stock: 300, reorder: 60, cost: 80, price: 120, supplier: 'Quezon Electrical Supply' },

    // PLUMBING
    { sku: 'PLM-001', name: 'PVC Pipe 1/2" x 10\'', category: 'Plumbing', unit: 'pcs', stock: 200, reorder: 50, cost: 85, price: 120, supplier: 'Manila Hardware Supply' },
    { sku: 'PLM-002', name: 'PVC Pipe 3/4" x 10\'', category: 'Plumbing', unit: 'pcs', stock: 180, reorder: 45, cost: 120, price: 165, supplier: 'Manila Hardware Supply' },
    { sku: 'PLM-003', name: 'PVC Pipe 1" x 10\'', category: 'Plumbing', unit: 'pcs', stock: 150, reorder: 40, cost: 180, price: 240, supplier: 'Manila Hardware Supply' },
    { sku: 'PLM-004', name: 'PVC Elbow 1/2"', category: 'Plumbing', unit: 'pcs', stock: 500, reorder: 100, cost: 8, price: 15, supplier: 'Manila Hardware Supply' },
    { sku: 'PLM-005', name: 'PVC Elbow 3/4"', category: 'Plumbing', unit: 'pcs', stock: 400, reorder: 80, cost: 12, price: 20, supplier: 'Manila Hardware Supply' },
    { sku: 'PLM-006', name: 'PVC Tee 1/2"', category: 'Plumbing', unit: 'pcs', stock: 300, reorder: 60, cost: 10, price: 18, supplier: 'Manila Hardware Supply' },
    { sku: 'PLM-007', name: 'PVC Coupling 1/2"', category: 'Plumbing', unit: 'pcs', stock: 400, reorder: 80, cost: 6, price: 12, supplier: 'Manila Hardware Supply' },
    { sku: 'PLM-008', name: 'Faucet Single Lever', category: 'Plumbing', unit: 'pcs', stock: 80, reorder: 20, cost: 350, price: 500, supplier: 'Manila Hardware Supply' },
    { sku: 'PLM-009', name: 'Shower Head Chrome', category: 'Plumbing', unit: 'pcs', stock: 60, reorder: 15, cost: 280, price: 400, supplier: 'Manila Hardware Supply' },
    { sku: 'PLM-010', name: 'PVC Glue 250ml', category: 'Plumbing', unit: 'bottle', stock: 150, reorder: 30, cost: 85, price: 120, supplier: 'Manila Hardware Supply' },

    // TOOLS
    { sku: 'TLS-001', name: 'Hammer Claw 16oz', category: 'Tools', unit: 'pcs', stock: 100, reorder: 25, cost: 180, price: 280, supplier: 'Baguio Tools & Equipment' },
    { sku: 'TLS-002', name: 'Screwdriver Set (6pcs)', category: 'Tools', unit: 'set', stock: 80, reorder: 20, cost: 250, price: 380, supplier: 'Baguio Tools & Equipment' },
    { sku: 'TLS-003', name: 'Measuring Tape 5m', category: 'Tools', unit: 'pcs', stock: 120, reorder: 30, cost: 120, price: 180, supplier: 'Baguio Tools & Equipment' },
    { sku: 'TLS-004', name: 'Level 24"', category: 'Tools', unit: 'pcs', stock: 60, reorder: 15, cost: 280, price: 420, supplier: 'Baguio Tools & Equipment' },
    { sku: 'TLS-005', name: 'Handsaw 20"', category: 'Tools', unit: 'pcs', stock: 70, reorder: 18, cost: 220, price: 330, supplier: 'Baguio Tools & Equipment' },
    { sku: 'TLS-006', name: 'Pliers Set (3pcs)', category: 'Tools', unit: 'set', stock: 90, reorder: 22, cost: 320, price: 480, supplier: 'Baguio Tools & Equipment' },
    { sku: 'TLS-007', name: 'Wrench Set (8pcs)', category: 'Tools', unit: 'set', stock: 50, reorder: 12, cost: 450, price: 680, supplier: 'Baguio Tools & Equipment' },
    { sku: 'TLS-008', name: 'Drill Bit Set (13pcs)', category: 'Tools', unit: 'set', stock: 60, reorder: 15, cost: 380, price: 550, supplier: 'Baguio Tools & Equipment' },
    { sku: 'TLS-009', name: 'Utility Knife', category: 'Tools', unit: 'pcs', stock: 150, reorder: 35, cost: 65, price: 100, supplier: 'Baguio Tools & Equipment' },
    { sku: 'TLS-010', name: 'Tool Belt', category: 'Tools', unit: 'pcs', stock: 40, reorder: 10, cost: 350, price: 520, supplier: 'Baguio Tools & Equipment' },

    // HARDWARE
    { sku: 'HDW-001', name: 'Common Nails 2" (1kg)', category: 'Hardware', unit: 'kg', stock: 300, reorder: 60, cost: 85, price: 120, supplier: 'Manila Hardware Supply' },
    { sku: 'HDW-002', name: 'Common Nails 3" (1kg)', category: 'Hardware', unit: 'kg', stock: 280, reorder: 55, cost: 90, price: 130, supplier: 'Manila Hardware Supply' },
    { sku: 'HDW-003', name:'Finishing Nails 1.5" (1kg)', category: 'Hardware', unit: 'kg', stock: 200, reorder: 40, cost: 95, price: 135, supplier: 'Manila Hardware Supply' },
    { sku: 'HDW-004', name: 'Wood Screws #8 x 1" (100pcs)', category: 'Hardware', unit: 'box', stock: 250, reorder: 50, cost: 120, price: 170, supplier: 'Manila Hardware Supply' },
    { sku: 'HDW-005', name: 'Wood Screws #10 x 2" (100pcs)', category: 'Hardware', unit: 'box', stock: 220, reorder: 45, cost: 150, price: 210, supplier: 'Manila Hardware Supply' },
    { sku: 'HDW-006', name: 'Door Hinge 3" (pair)', category: 'Hardware', unit: 'pair', stock: 180, reorder: 35, cost: 45, price: 70, supplier: 'Manila Hardware Supply' },
    { sku: 'HDW-007', name: 'Door Knob Set', category: 'Hardware', unit: 'set', stock: 100, reorder: 25, cost: 280, price: 420, supplier: 'Manila Hardware Supply' },
    { sku: 'HDW-008', name: 'Padlock 40mm', category: 'Hardware', unit: 'pcs', stock: 150, reorder: 30, cost: 120, price: 180, supplier: 'Manila Hardware Supply' },
    { sku: 'HDW-009', name: 'Chain Link (per meter)', category: 'Hardware', unit: 'meter', stock: 200, reorder: 40, cost: 85, price: 130, supplier: 'Manila Hardware Supply' },
    { sku: 'HDW-010', name: 'Bolt & Nut 1/2" x 3" (10pcs)', category: 'Hardware', unit: 'pack', stock: 300, reorder: 60, cost: 65, price: 95, supplier: 'Manila Hardware Supply' },

    // PAINT
    { sku: 'PNT-001', name: 'Latex Paint White 4L', category: 'Paint', unit: 'gallon', stock: 150, reorder: 30, cost: 650, price: 900, supplier: 'Cebu Construction Materials' },
    { sku: 'PNT-002', name: 'Latex Paint Beige 4L', category: 'Paint', unit: 'gallon', stock: 120, reorder: 25, cost: 680, price: 950, supplier: 'Cebu Construction Materials' },
    { sku: 'PNT-003', name: 'Enamel Paint White 4L', category: 'Paint', unit: 'gallon', stock: 100, reorder: 20, cost: 750, price: 1050, supplier: 'Cebu Construction Materials' },
    { sku: 'PNT-004', name: 'Paint Roller 9"', category: 'Paint', unit: 'pcs', stock: 200, reorder: 40, cost: 45, price: 70, supplier: 'Cebu Construction Materials' },
    { sku: 'PNT-005', name: 'Paint Brush 2"', category: 'Paint', unit: 'pcs', stock: 250, reorder: 50, cost: 35, price: 55, supplier: 'Cebu Construction Materials' },
    { sku: 'PNT-006', name: 'Paint Brush 3"', category: 'Paint', unit: 'pcs', stock: 220, reorder: 45, cost: 50, price: 75, supplier: 'Cebu Construction Materials' },
    { sku: 'PNT-007', name: 'Paint Thinner 1L', category: 'Paint', unit: 'liter', stock: 180, reorder: 35, cost: 85, price: 125, supplier: 'Cebu Construction Materials' },
    { sku: 'PNT-008', name: 'Primer Sealer 4L', category: 'Paint', unit: 'gallon', stock: 90, reorder: 20, cost: 580, price: 820, supplier: 'Cebu Construction Materials' },
    { sku: 'PNT-009', name: 'Masking Tape 1"', category: 'Paint', unit: 'roll', stock: 300, reorder: 60, cost: 25, price: 40, supplier: 'Cebu Construction Materials' },
    { sku: 'PNT-010', name: 'Sandpaper Assorted (10pcs)', category: 'Paint', unit: 'pack', stock: 150, reorder: 30, cost: 65, price: 95, supplier: 'Cebu Construction Materials' },

    // SAFETY EQUIPMENT
    { sku: 'SFT-001', name: 'Hard Hat Yellow', category: 'Safety Equipment', unit: 'pcs', stock: 100, reorder: 25, cost: 180, price: 280, supplier: 'Baguio Tools & Equipment' },
    { sku: 'SFT-002', name: 'Safety Goggles Clear', category: 'Safety Equipment', unit: 'pcs', stock: 150, reorder: 30, cost: 85, price: 135, supplier: 'Baguio Tools & Equipment' },
    { sku: 'SFT-003', name: 'Work Gloves (pair)', category: 'Safety Equipment', unit: 'pair', stock: 200, reorder: 40, cost: 45, price: 70, supplier: 'Baguio Tools & Equipment' },
    { sku: 'SFT-004', name: 'Dust Mask (50pcs)', category: 'Safety Equipment', unit: 'box', stock: 80, reorder: 20, cost: 280, price: 420, supplier: 'Baguio Tools & Equipment' },
    { sku: 'SFT-005', name: 'Safety Vest Orange', category: 'Safety Equipment', unit: 'pcs', stock: 120, reorder: 25, cost: 120, price: 180, supplier: 'Baguio Tools & Equipment' },
    { sku: 'SFT-006', name: 'Ear Plugs (100 pairs)', category: 'Safety Equipment', unit: 'box', stock: 60, reorder: 15, cost: 350, price: 520, supplier: 'Baguio Tools & Equipment' },
    { sku: 'SFT-007', name: 'Safety Boots Size 9', category: 'Safety Equipment', unit: 'pair', stock: 40, reorder: 10, cost: 850, price: 1200, supplier: 'Baguio Tools & Equipment' },
    { sku: 'SFT-008', name: 'Safety Boots Size 10', category: 'Safety Equipment', unit: 'pair', stock: 40, reorder: 10, cost: 850, price: 1200, supplier: 'Baguio Tools & Equipment' },
    { sku: 'SFT-009', name: 'First Aid Kit', category: 'Safety Equipment', unit: 'set', stock: 50, reorder: 12, cost: 450, price: 680, supplier: 'Baguio Tools & Equipment' },
    { sku: 'SFT-010', name: 'Fire Extinguisher 5kg', category: 'Safety Equipment', unit: 'pcs', stock: 30, reorder: 8, cost: 1200, price: 1800, supplier: 'Baguio Tools & Equipment' },
  ];

  console.log('\n📦 Adding products...');
  const insertProduct = db.prepare(`
    INSERT OR IGNORE INTO products (sku, name, category_id, unit, stock_qty, reorder_level, cost_price, selling_price, supplier_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let added = 0;
  products.forEach(p => {
    const categoryId = categoryMap[p.category];
    const supplierId = supplierMap[p.supplier];
    
    if (categoryId && supplierId) {
      const result = insertProduct.run(
        p.sku, p.name, categoryId, p.unit, p.stock, p.reorder,
        p.cost, p.price, supplierId
      );
      if (result.changes > 0) added++;
    }
  });

  console.log(`✅ Added ${added} products`);

  // Show summary
  const summary = db.prepare(`
    SELECT c.name as category, COUNT(*) as count, SUM(p.stock_qty * p.cost_price) as inventory_value
    FROM products p
    JOIN categories c ON p.category_id = c.id
    GROUP BY c.name
    ORDER BY c.name
  `).all();

  console.log('\n📊 Inventory Summary:');
  console.table(summary);

  const total = db.prepare('SELECT COUNT(*) as count, SUM(stock_qty * cost_price) as total_value FROM products').get();
  console.log(`\n✅ Total Products: ${total.count}`);
  console.log(`💰 Total Inventory Value: ₱${total.total_value.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`);

  db.close();
  console.log('\n✅ Database seeded successfully!');

} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('\nMake sure the app has been run at least once to create the database.');
}
