import { ipcMain } from 'electron';
import { getDatabase } from '../connection';
import fs from 'fs';
import path from 'path';
import { app } from 'electron';

export function registerSettingsHandlers() {
  ipcMain.handle('settings:getAll', () => {
    const db = getDatabase();
    const settings = db.prepare('SELECT * FROM settings').all() as Array<{ key: string; value: string }>;
    return settings.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
  });

  ipcMain.handle('settings:update', (_, key: string, value: string) => {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = ?
    `).run(key, value, value);
    return { success: true };
  });

  ipcMain.handle('settings:backup', (_, backupPath: string) => {
    try {
      const userDataPath = app.getPath('userData');
      const dbPath = path.join(userDataPath, 'jurasec.db');
      fs.copyFileSync(dbPath, backupPath);
      return { success: true };
    } catch (error: any) {
      throw new Error(`Backup failed: ${error.message}`);
    }
  });

  ipcMain.handle('settings:restore', (_, restorePath: string) => {
    try {
      const userDataPath = app.getPath('userData');
      const dbPath = path.join(userDataPath, 'jurasec.db');
      fs.copyFileSync(restorePath, dbPath);
      return { success: true };
    } catch (error: any) {
      throw new Error(`Restore failed: ${error.message}`);
    }
  });
}
