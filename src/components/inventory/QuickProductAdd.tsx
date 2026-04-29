import { useState } from 'react';

interface QuickProductFormData {
  name: string;
  sku: string;
  selling_price: string;
  cost_price: string;
  stock_qty: string;
  category_id: string;
}

interface QuickProductAddProps {
  categories: any[];
  onSuccess: () => void;
  onClose: () => void;
}

export default function QuickProductAdd({ categories, onSuccess, onClose }: QuickProductAddProps) {
  const [formData, setFormData] = useState<QuickProductFormData>({
    name: '',
    sku: '',
    selling_price: '',
    cost_price: '',
    stock_qty: '0',
    category_id: '',
  });
  const [saving, setSaving] = useState(false);

  const generateSKU = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    setFormData({ ...formData, sku: `SKU-${timestamp}-${random}` });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.sku || !formData.selling_price) {
      alert('Please fill all required fields');
      return;
    }

    setSaving(true);
    try {
      await window.electronAPI.createProduct({
        name: formData.name,
        sku: formData.sku,
        description: '',
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        supplier_id: null,
        cost_price: parseFloat(formData.cost_price) || 0,
        selling_price: parseFloat(formData.selling_price),
        stock_qty: parseInt(formData.stock_qty) || 0,
        reorder_level: 10,
        unit: 'pcs',
        barcode: formData.sku,
        image_url: null,
      });

      alert('Product added successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(`Failed to add product: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">⚡ Quick Add Product</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Product Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="e.g., Hammer"
              required
              autoFocus
            />
          </div>

          {/* SKU with Generator */}
          <div>
            <label className="block text-sm font-medium mb-2">SKU *</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="input flex-1"
                placeholder="e.g., HAM-001"
                required
              />
              <button
                type="button"
                onClick={generateSKU}
                className="btn btn-secondary whitespace-nowrap"
              >
                🎲 Generate
              </button>
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Selling Price *
              </label>
              <input
                type="number"
                value={formData.selling_price}
                onChange={(e) =>
                  setFormData({ ...formData, selling_price: e.target.value })
                }
                className="input"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Cost Price
              </label>
              <input
                type="number"
                value={formData.cost_price}
                onChange={(e) =>
                  setFormData({ ...formData, cost_price: e.target.value })
                }
                className="input"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          {/* Stock and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Initial Stock
              </label>
              <input
                type="number"
                value={formData.stock_qty}
                onChange={(e) =>
                  setFormData({ ...formData, stock_qty: e.target.value })
                }
                className="input"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({ ...formData, category_id: e.target.value })
                }
                className="input"
              >
                <option value="">None</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600">
              💡 Quick add creates a basic product. You can edit it later to add
              more details like description, supplier, images, etc.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn btn-secondary"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Adding...' : '⚡ Quick Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
