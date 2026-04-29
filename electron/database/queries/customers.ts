import { ipcMain } from 'electron';
import { getDatabase } from '../connection';

export function registerCustomerHandlers() {
  ipcMain.handle('customers:getAll', () => {
    const db = getDatabase();
    return db.prepare('SELECT * FROM customers ORDER BY name').all();
  });

  ipcMain.handle('customers:create', (_, customer) => {
    const db = getDatabase();
    const result = db.prepare(`
      INSERT INTO customers (name, phone, address)
      VALUES (?, ?, ?)
    `).run(customer.name, customer.phone, customer.address);
    return { id: result.lastInsertRowid };
  });

  ipcMain.handle('customers:update', (_, id: number, customer) => {
    const db = getDatabase();
    db.prepare(`
      UPDATE customers SET name = ?, phone = ?, address = ? WHERE id = ?
    `).run(customer.name, customer.phone, customer.address, id);
    return { success: true };
  });

  ipcMain.handle('customers:delete', (_, id: number) => {
    const db = getDatabase();
    db.prepare('DELETE FROM customers WHERE id = ?').run(id);
    return { success: true };
  });
}
