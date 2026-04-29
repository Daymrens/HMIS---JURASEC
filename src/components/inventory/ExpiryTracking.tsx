import { useState, useEffect } from 'react';
import { Product } from '../../types';

interface ExpiryItem {
  id: number;
  product_id: number;
  product_name: string;
  sku: string;
  batch_number: string;
  expiry_date: string;
  quantity: number;
  status: 'fresh' | 'expiring_soon' | 'expired';
  created_at: string;
}

export default function ExpiryTracking() {
  const [expiryItems, setExpiryItems] = useState<ExpiryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    batch_number: '',
    expiry_date: '',
    quantity: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const productsData = await window.electronAPI.getProducts();
      setProducts(productsData);
      const saved = localStorage.getItem('expiry_items');
      if (saved) {
        const items = JSON.parse(saved);
        // Update status based on expiry dates
        const updated = items.map((item: ExpiryItem) => ({
          ...item,
          status: getExpiryStatus(item.expiry_date),
        }));
        setExpiryItems(updated);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getExpiryStatus = (expiryDate: string): ExpiryItem['status'] => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'expiring_soon';
    return 'fresh';
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const addExpiryItem = () => {
    if (!formData.product_id || !formData.batch_number || !formData.expiry_date || !formData.quantity) {
      alert('Please fill all required fields');
      return;
    }

    const product = products.find((p) => p.id === parseInt(formData.product_id));
    if (!product) return;

    const newItem: ExpiryItem = {
      id: Date.now(),
      product_id: parseInt(formData.product_id),
      product_name: product.name,
      sku: product.sku,
      batch_number: formData.batch_number,
      expiry_date: formData.expiry_date,
      quantity: parseInt(formData.quantity),
      status: getExpiryStatus(formData.expiry_date),
      created_at: new Date().toISOString(),
    };

    const updated = [...expiryItems, newItem];
    setExpiryItems(updated);
    localStorage.setItem('expiry_items', JSON.stringify(updated));

    resetForm();
    alert('Expiry item added successfully!');
  };

  const removeItem = (id: number) => {
    if (!confirm('Remove this expiry item?')) return;
    const updated = expiryItems.filter((item) => item.id !== id);
    setExpiryItems(updated);
    localStorage.setItem('expiry_items', JSON.stringify(updated));
  };

  const resetForm = () => {
    setShowForm(false);
    setFormData({
      product_id: '',
      batch_number: '',
      expiry_date: '',
      quantity: '',
    });
  };

  const expiringSoon = expiryItems.filter((item) => item.status === 'expiring_soon');
  const expired = expiryItems.filter((item) => item.status === 'expired');

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Expiry Date Tracking</h3>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          + Add Expiry Item
        </button>
      </div>

      {/* Alerts */}
      {expired.length > 0 && (
        <div className="card bg-red-50 border-red-200">
          <h4 className="font-semibold text-red-800 mb-2">⚠️ Expired Items</h4>
          <p className="text-sm text-red-600">
            {expired.length} item(s) have expired. Please remove from inventory.
          </p>
        </div>
      )}

      {expiringSoon.length > 0 && (
        <div className="card bg-yellow-50 border-yellow-200">
          <h4 className="font-semibold text-yellow-800 mb-2">⏰ Expiring Soon</h4>
          <p className="text-sm text-yellow-600">
            {expiringSoon.length} item(s) expiring within 30 days.
          </p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card bg-green-50">
          <p className="text-sm text-gray-600">Fresh Items</p>
          <p className="text-2xl font-bold text-green-600">
            {expiryItems.filter((i) => i.status === 'fresh').length}
          </p>
        </div>
        <div className="card bg-yellow-50">
          <p className="text-sm text-gray-600">Expiring Soon</p>
          <p className="text-2xl font-bold text-yellow-600">{expiringSoon.length}</p>
        </div>
        <div className="card bg-red-50">
          <p className="text-sm text-gray-600">Expired</p>
          <p className="text-2xl font-bold text-red-600">{expired.length}</p>
        </div>
      </div>

      {/* Expiry Items Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3">Product</th>
              <th className="text-left py-3">SKU</th>
              <th className="text-left py-3">Batch #</th>
              <th className="text-left py-3">Expiry Date</th>
              <th className="text-right py-3">Days Left</th>
              <th className="text-right py-3">Quantity</th>
              <th className="text-center py-3">Status</th>
              <th className="text-center py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expiryItems
              .sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime())
              .map((item) => {
                const daysLeft = getDaysUntilExpiry(item.expiry_date);
                return (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-medium">{item.product_name}</td>
                    <td className="py-3">{item.sku}</td>
                    <td className="py-3">{item.batch_number}</td>
                    <td className="py-3">{new Date(item.expiry_date).toLocaleDateString()}</td>
                    <td className={`py-3 text-right font-semibold ${
                      daysLeft < 0 ? 'text-red-600' :
                      daysLeft <= 30 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {daysLeft < 0 ? 'Expired' : `${daysLeft} days`}
                    </td>
                    <td className="py-3 text-right">{item.quantity}</td>
                    <td className="py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'expired' ? 'bg-red-100 text-red-700' :
                        item.status === 'expiring_soon' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {item.status === 'expired' ? 'Expired' :
                         item.status === 'expiring_soon' ? 'Expiring Soon' : 'Fresh'}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        {expiryItems.length === 0 && (
          <div className="text-center py-12 text-gray-500">No expiry items tracked yet.</div>
        )}
      </div>

      {/* Add Expiry Item Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Add Expiry Item</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Product *</label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="input"
                >
                  <option value="">Select Product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Batch Number *</label>
                <input
                  type="text"
                  value={formData.batch_number}
                  onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                  placeholder="e.g., BATCH-2024-001"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Expiry Date *</label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="input"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Quantity *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="0"
                  min="1"
                  className="input"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={resetForm} className="flex-1 btn btn-secondary">
                Cancel
              </button>
              <button onClick={addExpiryItem} className="flex-1 btn btn-primary">
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
