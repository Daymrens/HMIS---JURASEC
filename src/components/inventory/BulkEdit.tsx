import { useState, useEffect } from 'react';
import { Product } from '../../types';

export default function BulkEdit() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [bulkAction, setBulkAction] = useState<'price' | 'category' | 'stock' | 'discount'>('price');
  const [bulkValue, setBulkValue] = useState('');
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        window.electronAPI.getProducts(),
        window.electronAPI.getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = (id: number) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProducts(newSelected);
  };

  const toggleAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map((p) => p.id)));
    }
  };

  const applyBulkEdit = async () => {
    if (selectedProducts.size === 0) {
      alert('Please select products to edit');
      return;
    }

    if (!bulkValue && bulkAction !== 'stock') {
      alert('Please enter a value');
      return;
    }

    if (!confirm(`Apply changes to ${selectedProducts.size} products?`)) return;

    try {
      for (const productId of selectedProducts) {
        const product = products.find((p) => p.id === productId);
        if (!product) continue;

        let updatedProduct = { ...product };

        switch (bulkAction) {
          case 'price':
            const priceChange = parseFloat(bulkValue);
            if (bulkValue.startsWith('+')) {
              updatedProduct.selling_price += priceChange;
            } else if (bulkValue.startsWith('-')) {
              updatedProduct.selling_price += priceChange;
            } else if (bulkValue.includes('%')) {
              const percent = parseFloat(bulkValue) / 100;
              updatedProduct.selling_price *= 1 + percent;
            } else {
              updatedProduct.selling_price = priceChange;
            }
            break;

          case 'category':
            updatedProduct.category_id = parseInt(bulkValue);
            break;

          case 'stock':
            const stockChange = parseFloat(bulkValue);
            if (bulkValue.startsWith('+')) {
              updatedProduct.stock_qty += stockChange;
            } else if (bulkValue.startsWith('-')) {
              updatedProduct.stock_qty += stockChange;
            } else {
              updatedProduct.stock_qty = stockChange;
            }
            break;

          case 'discount':
            // Store discount percentage for future use
            break;
        }

        await window.electronAPI.updateProduct(productId, updatedProduct);
      }

      alert('Bulk edit completed successfully!');
      setSelectedProducts(new Set());
      setBulkValue('');
      loadData();
    } catch (error) {
      console.error('Bulk edit failed:', error);
      alert('Failed to apply bulk edit');
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Bulk Edit Products</h3>

      {/* Bulk Action Controls */}
      <div className="card bg-blue-50">
        <h4 className="font-semibold mb-4">
          Bulk Edit ({selectedProducts.size} selected)
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Action</label>
            <select
              value={bulkAction}
              onChange={(e) => {
                setBulkAction(e.target.value as any);
                setBulkValue('');
              }}
              className="input"
            >
              <option value="price">Update Price</option>
              <option value="category">Change Category</option>
              <option value="stock">Adjust Stock</option>
              <option value="discount">Apply Discount</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Value</label>
            {bulkAction === 'category' ? (
              <select value={bulkValue} onChange={(e) => setBulkValue(e.target.value)} className="input">
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                placeholder={
                  bulkAction === 'price'
                    ? '+10, -5, 10%, or 100'
                    : bulkAction === 'stock'
                    ? '+50, -10, or 100'
                    : '10'
                }
                className="input"
              />
            )}
          </div>
          <div className="flex items-end">
            <button onClick={applyBulkEdit} className="btn btn-primary w-full">
              Apply to Selected
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          💡 For price/stock: Use +10 to add, -5 to subtract, 10% for percentage, or just 100 to set value
        </p>
      </div>

      {/* Product Selection Table */}
      <div className="card overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold">Select Products</h4>
          <button onClick={toggleAll} className="text-sm text-blue-600 hover:text-blue-800">
            {selectedProducts.size === products.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 w-12">
                <input
                  type="checkbox"
                  checked={selectedProducts.size === products.length}
                  onChange={toggleAll}
                  className="w-4 h-4"
                />
              </th>
              <th className="text-left py-3">SKU</th>
              <th className="text-left py-3">Name</th>
              <th className="text-left py-3">Category</th>
              <th className="text-right py-3">Price</th>
              <th className="text-right py-3">Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className={`border-b hover:bg-gray-50 ${
                  selectedProducts.has(product.id) ? 'bg-blue-50' : ''
                }`}
              >
                <td className="py-3">
                  <input
                    type="checkbox"
                    checked={selectedProducts.has(product.id)}
                    onChange={() => toggleProduct(product.id)}
                    className="w-4 h-4"
                  />
                </td>
                <td className="py-3">{product.sku}</td>
                <td className="py-3">{product.name}</td>
                <td className="py-3">{product.category_name || '-'}</td>
                <td className="py-3 text-right">₱{product.selling_price.toFixed(2)}</td>
                <td className="py-3 text-right">{product.stock_qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
