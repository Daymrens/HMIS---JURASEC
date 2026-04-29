import { useState, useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import AutoBackup from '../components/settings/AutoBackup';
import AuditTrail from '../components/settings/AuditTrail';
import ThemeCustomizer from '../components/settings/ThemeCustomizer';
import WidgetCustomizer from '../components/dashboard/WidgetCustomizer';
import NotificationCenter from '../components/settings/NotificationCenter';
import LanguageSelector from '../components/settings/LanguageSelector';
import ReceiptTemplates from '../components/settings/ReceiptTemplates';
import PermissionSystem from '../components/settings/PermissionSystem';
import IntegrationHub from '../components/integrations/IntegrationHub';

export default function Settings() {
  const { theme, setTheme } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<'general' | 'backup' | 'audit' | 'appearance' | 'notifications' | 'language' | 'receipts' | 'permissions' | 'integrations'>('general');
  const [formData, setFormData] = useState({
    company_name: '',
    tax_rate: '0.12',
    receipt_header: '',
    receipt_footer: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [shortcuts, setShortcuts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadSettings();
    loadProducts();
    loadShortcuts();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await window.electronAPI.getSettings();
      setFormData({
        company_name: settings.company_name || 'Jurasec Enterprises',
        tax_rate: settings.tax_rate || '0.12',
        receipt_header: settings.receipt_header || 'Thank you for your business!',
        receipt_footer: settings.receipt_footer || 'Please come again',
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await window.electronAPI.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const loadShortcuts = () => {
    const saved = localStorage.getItem('quick_sale_shortcuts');
    if (saved) {
      setShortcuts(JSON.parse(saved));
    }
  };

  const saveShortcuts = () => {
    localStorage.setItem('quick_sale_shortcuts', JSON.stringify(shortcuts));
    alert('Shortcuts saved!');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        window.electronAPI.updateSetting('company_name', formData.company_name),
        window.electronAPI.updateSetting('tax_rate', formData.tax_rate),
        window.electronAPI.updateSetting('receipt_header', formData.receipt_header),
        window.electronAPI.updateSetting('receipt_footer', formData.receipt_footer),
        window.electronAPI.updateSetting('theme', theme),
      ]);
      alert('Settings saved successfully!');
    } catch (error: any) {
      alert(`Failed to save settings: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      {/* Tabs */}
      <div className="flex gap-2 border-b overflow-x-auto">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 font-medium whitespace-nowrap ${
            activeTab === 'general'
              ? 'border-b-2 border-accent text-accent'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab('appearance')}
          className={`px-4 py-2 font-medium whitespace-nowrap ${
            activeTab === 'appearance'
              ? 'border-b-2 border-accent text-accent'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Appearance
        </button>
        <button
          onClick={() => setActiveTab('receipts')}
          className={`px-4 py-2 font-medium whitespace-nowrap ${
            activeTab === 'receipts'
              ? 'border-b-2 border-accent text-accent'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Receipt Templates
        </button>
        <button
          onClick={() => setActiveTab('language')}
          className={`px-4 py-2 font-medium whitespace-nowrap ${
            activeTab === 'language'
              ? 'border-b-2 border-accent text-accent'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Language
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`px-4 py-2 font-medium whitespace-nowrap ${
            activeTab === 'permissions'
              ? 'border-b-2 border-accent text-accent'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Permissions
        </button>
        <button
          onClick={() => setActiveTab('integrations')}
          className={`px-4 py-2 font-medium whitespace-nowrap ${
            activeTab === 'integrations'
              ? 'border-b-2 border-accent text-accent'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Integrations
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 font-medium whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'border-b-2 border-accent text-accent'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Notifications
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2 font-medium whitespace-nowrap ${
            activeTab === 'backup'
              ? 'border-b-2 border-accent text-accent'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Backup & Restore
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 font-medium whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-b-2 border-accent text-accent'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Audit Trail
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <>
      {/* Business Information */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Business Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Company Name</label>
            <input
              type="text"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tax Rate (VAT)</label>
            <input
              type="number"
              value={formData.tax_rate}
              onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
              className="input"
              step="0.01"
              min="0"
              max="1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter as decimal (e.g., 0.12 for 12%)
            </p>
          </div>
        </div>
      </div>

      {/* Receipt Settings */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Receipt Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Receipt Header</label>
            <input
              type="text"
              value={formData.receipt_header}
              onChange={(e) => setFormData({ ...formData, receipt_header: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Receipt Footer</label>
            <input
              type="text"
              value={formData.receipt_footer}
              onChange={(e) => setFormData({ ...formData, receipt_footer: e.target.value })}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Appearance</h3>
        <div>
          <label className="block text-sm font-medium mb-2">Theme</label>
          <div className="flex gap-2">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                theme === 'light'
                  ? 'border-accent bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              ☀️ Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                theme === 'dark'
                  ? 'border-accent bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              🌙 Dark
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Location Support */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Multi-Location Support</h3>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Manage multiple store locations from a single system.
          </p>
          <div>
            <label className="block text-sm font-medium mb-2">Current Location</label>
            <select className="input">
              <option value="main">Main Store</option>
              <option value="branch1">Branch 1</option>
              <option value="branch2">Branch 2</option>
            </select>
          </div>
          <button className="btn btn-secondary">
            + Add New Location
          </button>
        </div>
      </div>

      {/* Database Backup */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Database Management</h3>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Backup and restore your database to prevent data loss.
          </p>
          <div className="flex gap-3">
            <button className="btn btn-secondary">
              💾 Backup Database
            </button>
            <button className="btn btn-secondary">
              📥 Restore Database
            </button>
          </div>
        </div>
      </div>

      {/* Quick Sale Shortcuts */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Quick Sale Shortcuts (F1-F12)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Assign products to function keys for instant add to cart in POS.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
            <div key={num}>
              <label className="block text-sm font-medium mb-2">F{num}</label>
              <select
                value={shortcuts[`F${num}`] || ''}
                onChange={(e) => setShortcuts({ ...shortcuts, [`F${num}`]: e.target.value ? parseInt(e.target.value) : 0 })}
                className="input"
              >
                <option value="">Not assigned</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ₱{product.selling_price}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <button onClick={saveShortcuts} className="btn btn-primary w-full mt-4">
          Save Shortcuts
        </button>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary px-8"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
        </>
      )}

      {activeTab === 'appearance' && (
        <>
          <ThemeCustomizer />
          <div className="mt-8">
            <WidgetCustomizer />
          </div>
        </>
      )}
      {activeTab === 'receipts' && <ReceiptTemplates />}
      {activeTab === 'language' && <LanguageSelector />}
      {activeTab === 'permissions' && <PermissionSystem />}
      {activeTab === 'integrations' && <IntegrationHub />}
      {activeTab === 'notifications' && <NotificationCenter />}
      {activeTab === 'backup' && <AutoBackup />}
      {activeTab === 'audit' && <AuditTrail />}
    </div>
  );
}
