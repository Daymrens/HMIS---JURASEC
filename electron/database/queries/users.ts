import { ipcMain } from 'electron';
import { getDatabase } from '../connection';
import bcrypt from 'bcryptjs';

export function registerUserHandlers() {
  ipcMain.handle('users:login', async (_, username: string, password: string) => {
    const db = getDatabase();
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
    };
  });

  ipcMain.handle('users:getAll', () => {
    const db = getDatabase();
    return db.prepare('SELECT id, username, role, created_at FROM users ORDER BY username').all();
  });

  ipcMain.handle('users:create', async (_, user) => {
    const db = getDatabase();
    const hashedPassword = await bcrypt.hash(user.password, 10);
    
    const result = db.prepare(`
      INSERT INTO users (username, password_hash, role)
      VALUES (?, ?, ?)
    `).run(user.username, hashedPassword, user.role);

    return { id: result.lastInsertRowid };
  });

  ipcMain.handle('users:update', async (_, id: number, user) => {
    const db = getDatabase();
    
    if (user.password) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      db.prepare(`
        UPDATE users SET username = ?, password_hash = ?, role = ? WHERE id = ?
      `).run(user.username, hashedPassword, user.role, id);
    } else {
      db.prepare(`
        UPDATE users SET username = ?, role = ? WHERE id = ?
      `).run(user.username, user.role, id);
    }

    return { success: true };
  });

  ipcMain.handle('users:delete', (_, id: number) => {
    const db = getDatabase();
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return { success: true };
  });
}
