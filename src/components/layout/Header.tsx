import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export default function Header() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {getPageTitle()}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {new Date().toLocaleDateString('en-PH', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

function getPageTitle() {
  const path = window.location.pathname;
  const titles: Record<string, string> = {
    '/': 'Dashboard',
    '/pos': 'Point of Sale',
    '/inventory': 'Inventory Management',
    '/suppliers': 'Suppliers',
    '/customers': 'Customers',
    '/reports': 'Reports',
    '/users': 'User Management',
    '/settings': 'Settings',
  };
  return titles[path] || 'Jurasec POS';
}
