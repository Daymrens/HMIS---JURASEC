export interface User {
  id: number;
  username: string;
  role: 'admin' | 'cashier';
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  category_id: number;
  category_name?: string;
  unit: string;
  stock_qty: number;
  reorder_level: number;
  cost_price: number;
  selling_price: number;
  supplier_id: number;
  supplier_name?: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  created_at: string;
}

export interface CartItem {
  product_id: number;
  name: string;
  sku: string;
  qty: number;
  unit_price: number;
  discount: number;
  subtotal: number;
}

export interface Transaction {
  id: number;
  transaction_no: string;
  customer_id?: number;
  customer_name?: string;
  user_id: number;
  username?: string;
  payment_method: 'cash' | 'gcash' | 'bank_transfer';
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  created_at: string;
  items?: TransactionItem[];
}

export interface TransactionItem {
  id: number;
  transaction_id: number;
  product_id: number;
  product_name: string;
  sku: string;
  qty: number;
  unit_price: number;
  discount: number;
  subtotal: number;
}

export interface DashboardStats {
  todaySales: number;
  totalProducts: number;
  lowStockCount: number;
  topItems: Array<{ name: string; total_sold: number }>;
  recentTransactions: Transaction[];
  salesTrend: Array<{ date: string; total: number }>;
}

declare global {
  interface Window {
    electronAPI: {
      getProducts: () => Promise<Product[]>;
      getProductById: (id: number) => Promise<Product>;
      searchProducts: (query: string) => Promise<Product[]>;
      createProduct: (product: Partial<Product>) => Promise<{ id: number }>;
      updateProduct: (id: number, product: Partial<Product>) => Promise<{ success: boolean }>;
      deleteProduct: (id: number) => Promise<{ success: boolean }>;
      adjustStock: (adjustment: any) => Promise<{ success: boolean }>;
      getLowStockProducts: () => Promise<Product[]>;
      
      createTransaction: (transaction: any) => Promise<{ id: number; transaction_no: string }>;
      getTransactions: (filters?: any) => Promise<Transaction[]>;
      getTransactionById: (id: number) => Promise<Transaction>;
      
      login: (username: string, password: string) => Promise<User>;
      getUsers: () => Promise<User[]>;
      createUser: (user: any) => Promise<{ id: number }>;
      updateUser: (id: number, user: any) => Promise<{ success: boolean }>;
      deleteUser: (id: number) => Promise<{ success: boolean }>;
      
      getCategories: () => Promise<Category[]>;
      createCategory: (name: string) => Promise<{ id: number }>;
      deleteCategory: (id: number) => Promise<{ success: boolean }>;
      
      getSuppliers: () => Promise<Supplier[]>;
      createSupplier: (supplier: Partial<Supplier>) => Promise<{ id: number }>;
      updateSupplier: (id: number, supplier: Partial<Supplier>) => Promise<{ success: boolean }>;
      deleteSupplier: (id: number) => Promise<{ success: boolean }>;
      
      getCustomers: () => Promise<Customer[]>;
      createCustomer: (customer: Partial<Customer>) => Promise<{ id: number }>;
      updateCustomer: (id: number, customer: Partial<Customer>) => Promise<{ success: boolean }>;
      deleteCustomer: (id: number) => Promise<{ success: boolean }>;
      
      getSalesReport: (startDate: string, endDate: string) => Promise<any[]>;
      getTopProducts: (limit: number) => Promise<any[]>;
      getInventoryValuation: () => Promise<any[]>;
      getDashboardStats: () => Promise<DashboardStats>;
      
      getSettings: () => Promise<Record<string, string>>;
      updateSetting: (key: string, value: string) => Promise<{ success: boolean }>;
      backupDatabase: (path: string) => Promise<{ success: boolean }>;
      restoreDatabase: (path: string) => Promise<{ success: boolean }>;
    };
  }
}
