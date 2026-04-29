import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useSettingsStore } from './stores/settingsStore';
import { useEffect } from 'react';

import Login from './pages/Login';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import PurchaseOrders from './pages/PurchaseOrders';
import Quotations from './pages/Quotations';
import Invoices from './pages/Invoices';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import Reports from './pages/Reports';
import Users from './pages/Users';
import TimeTracking from './pages/TimeTracking';
import Settings from './pages/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const setTheme = useSettingsStore((state) => state.setTheme);

  useEffect(() => {
    // Check if electronAPI is available
    if (!window.electronAPI) {
      console.error('electronAPI not available!');
      return;
    }

    // Load settings on app start
    window.electronAPI.getSettings().then((settings) => {
      loadSettings(settings);
      setTheme((settings.theme as 'light' | 'dark') || 'light');
    }).catch(err => {
      console.error('Failed to load settings:', err);
    });
  }, []);

  // Show error if electronAPI is not available
  if (!window.electronAPI) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Error: Electron API not available</h1>
        <p>Please make sure the application is running in Electron.</p>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="pos" element={<POS />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="purchase-orders" element={<PurchaseOrders />} />
          <Route path="quotations" element={<Quotations />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="customers" element={<Customers />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<Users />} />
          <Route path="time-tracking" element={<TimeTracking />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
