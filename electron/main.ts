import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { initDatabase } from './database/connection';
import { registerProductHandlers } from './database/queries/products';
import { registerTransactionHandlers } from './database/queries/transactions';
import { registerUserHandlers } from './database/queries/users';
import { registerCategoryHandlers } from './database/queries/categories';
import { registerSupplierHandlers } from './database/queries/suppliers';
import { registerCustomerHandlers } from './database/queries/customers';
import { registerReportHandlers } from './database/queries/reports';
import { registerSettingsHandlers } from './database/queries/settings';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 1366,
    minHeight: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: 'Jurasec Enterprises',
  });

  // Always load from production build
  const indexPath = path.join(__dirname, '../dist/index.html');
  console.log('Loading from:', indexPath);
  
  mainWindow.loadFile(indexPath);
  
  // Only open DevTools in development (when NODE_ENV is set)
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Log any errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Initialize database
  initDatabase();

  // Register IPC handlers
  registerProductHandlers();
  registerTransactionHandlers();
  registerUserHandlers();
  registerCategoryHandlers();
  registerSupplierHandlers();
  registerCustomerHandlers();
  registerReportHandlers();
  registerSettingsHandlers();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
