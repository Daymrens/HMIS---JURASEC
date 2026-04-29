import { ipcMain } from 'electron';
import { getDatabase } from '../connection';

export function registerTransactionHandlers() {
  ipcMain.handle('transactions:create', (_, transaction) => {
    const db = getDatabase();
    
    const transact = db.transaction(() => {
      // Generate transaction number
      const transactionNo = `TXN-${Date.now()}`;
      
      // Insert transaction
      const result = db.prepare(`
        INSERT INTO transactions (transaction_no, customer_id, user_id, payment_method, subtotal, discount, tax, total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        transactionNo,
        transaction.customer_id || null,
        transaction.user_id,
        transaction.payment_method,
        transaction.subtotal,
        transaction.discount,
        transaction.tax,
        transaction.total
      );

      const transactionId = result.lastInsertRowid;

      // Insert transaction items and update stock
      const insertItem = db.prepare(`
        INSERT INTO transaction_items (transaction_id, product_id, qty, unit_price, discount, subtotal)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      const updateStock = db.prepare('UPDATE products SET stock_qty = stock_qty - ? WHERE id = ?');

      transaction.items.forEach((item: any) => {
        insertItem.run(transactionId, item.product_id, item.qty, item.unit_price, item.discount, item.subtotal);
        updateStock.run(item.qty, item.product_id);
      });

      return { id: transactionId, transaction_no: transactionNo };
    });

    return transact();
  });

  ipcMain.handle('transactions:getAll', (_, filters) => {
    const db = getDatabase();
    let query = `
      SELECT t.*, u.username, c.name as customer_name
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN customers c ON t.customer_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters?.startDate) {
      query += ' AND DATE(t.created_at) >= ?';
      params.push(filters.startDate);
    }
    if (filters?.endDate) {
      query += ' AND DATE(t.created_at) <= ?';
      params.push(filters.endDate);
    }
    if (filters?.payment_method) {
      query += ' AND t.payment_method = ?';
      params.push(filters.payment_method);
    }

    query += ' ORDER BY t.created_at DESC LIMIT 100';

    return db.prepare(query).all(...params);
  });

  ipcMain.handle('transactions:getById', (_, id: number) => {
    const db = getDatabase();
    const transaction = db.prepare(`
      SELECT t.*, u.username, c.name as customer_name
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN customers c ON t.customer_id = c.id
      WHERE t.id = ?
    `).get(id);

    if (transaction) {
      const items = db.prepare(`
        SELECT ti.*, p.name as product_name, p.sku
        FROM transaction_items ti
        JOIN products p ON ti.product_id = p.id
        WHERE ti.transaction_id = ?
      `).all(id);

      return { ...transaction, items };
    }

    return null;
  });
}
