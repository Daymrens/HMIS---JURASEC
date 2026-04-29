import { useState, useEffect } from 'react';
import { Product } from '../../types';

interface Promotion {
  id: number;
  name: string;
  type: 'percentage' | 'fixed' | 'bogo' | 'bulk';
  value: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'scheduled' | 'expired';
  applies_to: 'all' | 'category' | 'product';
  target_ids?: number[];
  min_quantity?: number;
  created_at: string;
}

export default function Promotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'percentage' as const,
    value: '',
    start_date: '',
    end_date: '',
    applies_to: 'all' as const,
    min_quantity: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const productsData = await window.electronAPI.getProducts();
      setProducts(productsData);
      const saved = localStorage.getItem('promotions');
      if (saved) {
        const promos = JSON.parse(saved);
        // Update status based on dates
        const updated = promos.map((promo: Promotion) => {
          const now = new Date();
          const start = new Date(promo.start_date);
          const end = new Date(promo.end_date);
          return {
            ...promo,
            status: now > end ? 'expired' : now < start ? 'scheduled' : 'active'
          };
        });
        setPromotions(updated);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPromotion = () => {
    if (!formData.name || !formData.value || !formData.start_date || !formData.end_date) {
      alert('Please fill all required fields');
      return;
    }

    const now = new Date();
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);

    const newPromo: Promotion = {
      id: Date.now(),
      name: formData.name,
      type: formData.type,
      value: parseFloat(formData.value),
      start_date: formData.start_date,
      end_date: formData.end_date,
      status: now > end ? 'expired' : now < start ? 'scheduled' : 'active',
      applies_to: formData.applies_to,
      min_quantity: formData.min_quantity ? parseInt(formData.min_quantity) : undefined,
      created_at: new Date().toISOString(),
    };

    const updated = [...promotions, newPromo];
    setPromotions(updated);
    localStorage.setItem('promotions', JSON.stringify(updated));

    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setFormData({
      name: '',
      type: 'percentage',
      value: '',
      start_date: '',
      end_date: '',
      applies_to: 'all',
      min_quantity: '',
    });
  };

  const deletePromotion = (id: number) => {
    if (!confirm('Delete this promotion?')) return;
    const updated = promotions.filter(p => p.id !== id);
    setPromotions(updated);
    localStorage.setItem('promotions', JSON.stringify(updated));
  };

  const getPromotionDescription = (promo: Promotion) => {
    let desc = '';
    switch (promo.type) {
      case 'percentage':
        desc = `${promo.value}% off`;
        break;
      case 'fixed':
        desc = `₱${promo.value} off`;
        break;
      case 'bogo':
        desc = `Buy ${promo.value} Get 1 Free`;
        break;
      case 'bulk':
        desc = `${promo.value}% off when buying ${promo.min_quantity}+ items`;
        break;
    }
    return desc;
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Discounts & Promotions</h2>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          + Create Promotion
        </button>
      </div>

      {/* Active Promotions */}
      <div className="card">
        <h3 className="font-semibold mb-4">Active Promotions</h3>
        {promotions.filter(p => p.status === 'active').length > 0 ? (
          <div className="space-y-3">
            {promotions.filter(p => p.status === 'active').map((promo) => (
              <div key={promo.id} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-green-800">{promo.name}</h4>
                    <p className="text-sm text-green-600">{getPromotionDescription(promo)}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Valid: {new Date(promo.start_date).toLocaleDateString()} - {new Date(promo.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deletePromotion(promo.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    ✕ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No active promotions</p>
        )}
      </div>

      {/* All Promotions Table */}
      <div className="card overflow-x-auto">
        <h3 className="font-semibold mb-4">All Promotions</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3">Name</th>
              <th className="text-left py-3">Type</th>
              <th className="text-left py-3">Discount</th>
              <th className="text-left py-3">Start Date</th>
              <th className="text-left py-3">End Date</th>
              <th className="text-center py-3">Status</th>
              <th className="text-center py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map((promo) => (
              <tr key={promo.id} className="border-b hover:bg-gray-50">
                <td className="py-3">{promo.name}</td>
                <td className="py-3 capitalize">{promo.type}</td>
                <td className="py-3">{getPromotionDescription(promo)}</td>
                <td className="py-3">{new Date(promo.start_date).toLocaleDateString()}</td>
                <td className="py-3">{new Date(promo.end_date).toLocaleDateString()}</td>
                <td className="py-3 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    promo.status === 'active' ? 'bg-green-100 text-green-700' :
                    promo.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {promo.status}
                  </span>
                </td>
                <td className="py-3 text-center">
                  <button
                    onClick={() => deletePromotion(promo.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    ✕ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {promotions.length === 0 && (
          <div className="text-center py-12 text-gray-500">No promotions yet.</div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">Create Promotion</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Promotion Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="e.g., Summer Sale"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="input"
                  >
                    <option value="percentage">Percentage Off</option>
                    <option value="fixed">Fixed Amount Off</option>
                    <option value="bogo">Buy X Get 1 Free</option>
                    <option value="bulk">Bulk Discount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {formData.type === 'percentage' ? 'Percentage (%)' :
                     formData.type === 'fixed' ? 'Amount (₱)' :
                     formData.type === 'bogo' ? 'Buy Quantity' : 'Discount (%)'}
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="input"
                    placeholder="0"
                    min="0"
                    step={formData.type === 'fixed' ? '0.01' : '1'}
                  />
                </div>
              </div>

              {formData.type === 'bulk' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Minimum Quantity</label>
                  <input
                    type="number"
                    value={formData.min_quantity}
                    onChange={(e) => setFormData({ ...formData, min_quantity: e.target.value })}
                    className="input"
                    placeholder="e.g., 5"
                    min="1"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date *</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date *</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="input"
                    min={formData.start_date}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Applies To</label>
                <select
                  value={formData.applies_to}
                  onChange={(e) => setFormData({ ...formData, applies_to: e.target.value as any })}
                  className="input"
                >
                  <option value="all">All Products</option>
                  <option value="category">Specific Category</option>
                  <option value="product">Specific Products</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={resetForm} className="flex-1 btn btn-secondary">
                Cancel
              </button>
              <button onClick={createPromotion} className="flex-1 btn btn-primary">
                Create Promotion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
