import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Products
  getProducts: () => ipcRenderer.invoke('products:getAll'),
  getProductById: (id: number) => ipcRenderer.invoke('products:getById', id),
  searchProducts: (query: string) => ipcRenderer.invoke('products:search', query),
  createProduct: (product: any) => ipcRenderer.invoke('products:create', product),
  updateProduct: (id: number, product: any) => ipcRenderer.invoke('products:update', id, product),
  deleteProduct: (id: number) => ipcRenderer.invoke('products:delete', id),
  adjustStock: (adjustment: any) => ipcRenderer.invoke('products:adjustStock', adjustment),
  getLowStockProducts: () => ipcRenderer.invoke('products:getLowStock'),

  // Transactions
  createTransaction: (transaction: any) => ipcRenderer.invoke('transactions:create', transaction),
  getTransactions: (filters?: any) => ipcRenderer.invoke('transactions:getAll', filters),
  getTransactionById: (id: number) => ipcRenderer.invoke('transactions:getById', id),

  // Users
  login: (username: string, password: string) => ipcRenderer.invoke('users:login', username, password),
  getUsers: () => ipcRenderer.invoke('users:getAll'),
  createUser: (user: any) => ipcRenderer.invoke('users:create', user),
  updateUser: (id: number, user: any) => ipcRenderer.invoke('users:update', id, user),
  deleteUser: (id: number) => ipcRenderer.invoke('users:delete', id),

  // Categories
  getCategories: () => ipcRenderer.invoke('categories:getAll'),
  createCategory: (name: string) => ipcRenderer.invoke('categories:create', name),
  deleteCategory: (id: number) => ipcRenderer.invoke('categories:delete', id),

  // Suppliers
  getSuppliers: () => ipcRenderer.invoke('suppliers:getAll'),
  createSupplier: (supplier: any) => ipcRenderer.invoke('suppliers:create', supplier),
  updateSupplier: (id: number, supplier: any) => ipcRenderer.invoke('suppliers:update', id, supplier),
  deleteSupplier: (id: number) => ipcRenderer.invoke('suppliers:delete', id),

  // Customers
  getCustomers: () => ipcRenderer.invoke('customers:getAll'),
  createCustomer: (customer: any) => ipcRenderer.invoke('customers:create', customer),
  updateCustomer: (id: number, customer: any) => ipcRenderer.invoke('customers:update', id, customer),
  deleteCustomer: (id: number) => ipcRenderer.invoke('customers:delete', id),

  // Reports
  getSalesReport: (startDate: string, endDate: string) => ipcRenderer.invoke('reports:sales', startDate, endDate),
  getTopProducts: (limit: number) => ipcRenderer.invoke('reports:topProducts', limit),
  getInventoryValuation: () => ipcRenderer.invoke('reports:inventoryValuation'),
  getDashboardStats: () => ipcRenderer.invoke('reports:dashboardStats'),

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:getAll'),
  updateSetting: (key: string, value: string) => ipcRenderer.invoke('settings:update', key, value),
  backupDatabase: (path: string) => ipcRenderer.invoke('settings:backup', path),
  restoreDatabase: (path: string) => ipcRenderer.invoke('settings:restore', path),
});
