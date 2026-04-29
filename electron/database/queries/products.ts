import { ipcMain } from 'electron';
import { getDatabase } from '../connection';

export function registerProductHandlers() {
  ipcMain.handle('products:getAll', () => {
    const db = getDatabase();
    return db.prepare(`
      SELECT p.*, c.name as category_name, s.name as supplier_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      ORDER BY p.name
    `).all();
  });

  ipcMain.handle('products:getById', (_, id: number) => {
    const db = getDatabase();
    return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  });

  ipcMain.handle('products:search', (_, query: string) => {
    const db = getDatabase();
    const searchTerm = `%${query}%`;
    return db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.name LIKE ? OR p.sku LIKE ?
      ORDER BY p.name
      LIMIT 50
    `).all(searchTerm, searchTerm);
  });

  ipcMain.handle('products:create', (_, product) => {
    const db = getDatabase();
    const result = db.prepare(`
      INSERT INTO products (sku, name, category_id, unit, stock_qty, reorder_level, cost_price, selling_price, supplier_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      product.sku,
      product.name,
      product.category_id,
      product.unit,
      product.stock_qty || 0,
      product.reorder_level || 0,
      product.cost_price,
      product.selling_price,
      product.supplier_id
    );
    return { id: result.lastInsertRowid };
  });

  ipcMain.handle('products:update', (_, id: number, product) => {
    const db = getDatabase();
    db.prepare(`
      UPDATE products
      SET sku = ?, name = ?, category_id = ?, unit = ?, stock_qty = ?, reorder_level = ?, cost_price = ?, selling_price = ?, supplier_id = ?
      WHERE id = ?
    `).run(
      product.sku,
      product.name,
      product.category_id,
      product.unit,
      product.stock_qty,
      product.reorder_level,
      product.cost_price,
      product.selling_price,
      product.supplier_id,
      id
    );
    return { success: true };
  });

  ipcMain.handle('products:delete', (_, id: number) => {
    const db = getDatabase();
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    return { success: true };
  });

  ipcMain.handle('products:adjustStock', (_, adjustment) => {
    const db = getDatabase();
    const transaction = db.transaction(() => {
      // Insert adjustment record
      db.prepare(`
        INSERT INTO stock_adjustments (product_id, type, qty, reason, user_id)
        VALUES (?, ?, ?, ?, ?)
      `).run(adjustment.product_id, adjustment.type, adjustment.qty, adjustment.reason, adjustment.user_id);

      // Update product stock
      const qtyChange = adjustment.type === 'in' ? adjustment.qty : -adjustment.qty;
      db.prepare('UPDATE products SET stock_qty = stock_qty + ? WHERE id = ?').run(qtyChange, adjustment.product_id);
    });
    transaction();
    return { success: true };
  });

  ipcMain.handle('products:getLowStock', () => {
    const db = getDatabase();
    return db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.stock_qty <= p.reorder_level
      ORDER BY p.stock_qty ASC
    `).all();
  });
}
