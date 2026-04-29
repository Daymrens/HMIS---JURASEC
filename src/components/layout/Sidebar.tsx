import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export default function Sidebar() {
  const user = useAuthStore((state) => state.user);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/pos', label: 'POS', icon: '🛒' },
    { path: '/inventory', label: 'Inventory', icon: '📦' },
    { path: '/purchase-orders', label: 'Purchase Orders', icon: '📋' },
    { path: '/quotations', label: 'Quotations', icon: '📄' },
    { path: '/invoices', label: 'Invoices', icon: '🧾' },
    { path: '/suppliers', label: 'Suppliers', icon: '🏭' },
    { path: '/customers', label: 'Customers', icon: '👥' },
    { path: '/reports', label: 'Reports', icon: '📈' },
    ...(user?.role === 'admin' ? [
      { path: '/users', label: 'Users', icon: '👤' },
      { path: '/time-tracking', label: 'Time Tracking', icon: '🕐' }
    ] : []),
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-primary text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold">Jurasec Enterprises</h1>
        <p className="text-sm text-gray-400 mt-1">POS & Inventory</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-accent text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="text-sm text-gray-400">
          Logged in as: <span className="text-white font-medium">{user?.username}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Role: {user?.role}
        </div>
      </div>
    </aside>
  );
}
