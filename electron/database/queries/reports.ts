import { ipcMain } from 'electron';
import { getDatabase } from '../connection';

export function registerReportHandlers() {
  ipcMain.handle('reports:sales', (_, startDate: string, endDate: string) => {
    const db = getDatabase();
    return db.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as transaction_count,
        SUM(total) as total_sales,
        SUM(tax) as total_tax
      FROM transactions
      WHERE DATE(created_at) BETWEEN ? AND ?
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `).all(startDate, endDate);
  });

  ipcMain.handle('reports:topProducts', (_, limit: number) => {
    const db = getDatabase();
    return db.prepare(`
      SELECT 
        p.id,
        p.name,
        p.sku,
        SUM(ti.qty) as total_sold,
        SUM(ti.subtotal) as total_revenue
      FROM transaction_items ti
      JOIN products p ON ti.product_id = p.id
      GROUP BY p.id
      ORDER BY total_sold DESC
      LIMIT ?
    `).all(limit);
  });

  ipcMain.handle('reports:inventoryValuation', () => {
    const db = getDatabase();
    return db.prepare(`
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.stock_qty,
        p.cost_price,
        (p.stock_qty * p.cost_price) as total_value
      FROM products p
      ORDER BY total_value DESC
    `).all();
  });

  ipcMain.handle('reports:dashboardStats', () => {
    const db = getDatabase();
    
    // Today's sales
    const todaySales = db.prepare(`
      SELECT COALESCE(SUM(total), 0) as total
      FROM transactions
      WHERE DATE(created_at) = DATE('now')
    `).get() as { total: number };

    // Total products
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };

    // Low stock count
    const lowStockCount = db.prepare(`
      SELECT COUNT(*) as count FROM products WHERE stock_qty <= reorder_level
    `).get() as { count: number };

    // Top selling items (last 30 days)
    const topItems = db.prepare(`
      SELECT 
        p.name,
        SUM(ti.qty) as total_sold
      FROM transaction_items ti
      JOIN products p ON ti.product_id = p.id
      JOIN transactions t ON ti.transaction_id = t.id
      WHERE t.created_at >= DATE('now', '-30 days')
      GROUP BY p.id
      ORDER BY total_sold DESC
      LIMIT 5
    `).all();

    // Recent transactions
    const recentTransactions = db.prepare(`
      SELECT 
        t.id,
        t.transaction_no,
        t.total,
        t.payment_method,
        t.created_at,
        u.username
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
      LIMIT 10
    `).all();

    // Sales trend (last 7 days)
    const salesTrend = db.prepare(`
      SELECT 
        DATE(created_at) as date,
        SUM(total) as total
      FROM transactions
      WHERE created_at >= DATE('now', '-7 days')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).all();

    return {
      todaySales: todaySales.total,
      totalProducts: totalProducts.count,
      lowStockCount: lowStockCount.count,
      topItems,
      recentTransactions,
      salesTrend,
    };
  });
}
