import { ipcMain } from 'electron';
import { getDatabase } from '../connection';

export function registerCategoryHandlers() {
  ipcMain.handle('categories:getAll', () => {
    const db = getDatabase();
    return db.prepare('SELECT * FROM categories ORDER BY name').all();
  });

  ipcMain.handle('categories:create', (_, name: string) => {
    const db = getDatabase();
    const result = db.prepare('INSERT INTO categories (name) VALUES (?)').run(name);
    return { id: result.lastInsertRowid };
  });

  ipcMain.handle('categories:delete', (_, id: number) => {
    const db = getDatabase();
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    return { success: true };
  });
}
