import { ipcMain } from 'electron';
import { getDatabase } from '../connection';

export function registerSupplierHandlers() {
  ipcMain.handle('suppliers:getAll', () => {
    const db = getDatabase();
    return db.prepare('SELECT * FROM suppliers ORDER BY name').all();
  });

  ipcMain.handle('suppliers:create', (_, supplier) => {
    const db = getDatabase();
    const result = db.prepare(`
      INSERT INTO suppliers (name, contact_person, phone, email, address)
      VALUES (?, ?, ?, ?, ?)
    `).run(supplier.name, supplier.contact_person, supplier.phone, supplier.email, supplier.address);
    return { id: result.lastInsertRowid };
  });

  ipcMain.handle('suppliers:update', (_, id: number, supplier) => {
    const db = getDatabase();
    db.prepare(`
      UPDATE suppliers
      SET name = ?, contact_person = ?, phone = ?, email = ?, address = ?
      WHERE id = ?
    `).run(supplier.name, supplier.contact_person, supplier.phone, supplier.email, supplier.address, id);
    return { success: true };
  });

  ipcMain.handle('suppliers:delete', (_, id: number) => {
    const db = getDatabase();
    db.prepare('DELETE FROM suppliers WHERE id = ?').run(id);
    return { success: true };
  });
}
