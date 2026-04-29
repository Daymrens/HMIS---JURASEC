import { useState, useEffect } from 'react';
import { Product, Category, Supplier } from '../../types';

interface ProductFormProps {
  product: Product | null;
  categories: Category[];
  suppliers: Supplier[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductForm({ product, categories, suppliers, onClose, onSuccess }: ProductFormProps) {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category_id: '',
    unit: '',
    stock_qty: '0',
    reorder_level: '10',
    cost_price: '',
    selling_price: '',
    supplier_id: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku,
        name: product.name,
        category_id: product.category_id.toString(),
        unit: product.unit,
        stock_qty: product.stock_qty.toString(),
        reorder_level: product.reorder_level.toString(),
        cost_price: product.cost_price.toString(),
        selling_price: product.selling_price.toString(),
        supplier_id: product.supplier_id?.toString() || '',
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        sku: formData.sku,
        name: formData.name,
        category_id: Number(formData.category_id),
        unit: formData.unit,
        stock_qty: Number(formData.stock_qty),
        reorder_level: Number(formData.reorder_level),
        cost_price: Number(formData.cost_price),
        selling_price: Number(formData.selling_price),
        supplier_id: formData.supplier_id ? Number(formData.supplier_id) : null,
      };

      if (product) {
        await window.electronAPI.updateProduct(product.id, data);
      } else {
        await window.electronAPI.createProduct(data);
      }

      onSuccess();
    } catch (error: any) {
      alert(`Failed to save product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">
          {product ? 'Edit Product' : 'Add New Product'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">SKU *</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="input"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Unit *</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g., pcs, kg, box"
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Stock Quantity *</label>
              <input
                type="number"
                value={formData.stock_qty}
                onChange={(e) => setFormData({ ...formData, stock_qty: e.target.value })}
                className="input"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Reorder Level *</label>
              <input
                type="number"
                value={formData.reorder_level}
                onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                className="input"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cost Price (₱) *</label>
              <input
                type="number"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                className="input"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Selling Price (₱) *</label>
              <input
                type="number"
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                className="input"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Supplier</label>
              <select
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                className="input"
              >
                <option value="">No Supplier</option>
                {suppliers.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn btn-primary"
            >
              {loading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
