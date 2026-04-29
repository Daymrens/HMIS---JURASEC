import { useState, useEffect } from 'react';
import { Product } from '../../types';

interface ProductVariant {
  id: number;
  parent_product_id: number;
  variant_name: string;
  variant_type: string; // size, color, material, etc.
  sku: string;
  price_adjustment: number;
  stock_qty: number;
  created_at: string;
}

export default function ProductVariants() {
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    variant_type: 'size',
    variant_name: '',
    sku: '',
    price_adjustment: '0',
    stock_qty: '0',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const productsData = await window.electronAPI.getProducts();
      setProducts(productsData);
      const saved = localStorage.getItem('product_variants');
      if (saved) setVariants(JSON.parse(saved));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createVariant = () => {
    if (!selectedProduct || !formData.variant_name || !formData.sku) {
      alert('Please fill all required fields');
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    const newVariant: ProductVariant = {
      id: Date.now(),
      parent_product_id: selectedProduct,
      variant_type: formData.variant_type,
      variant_name: formData.variant_name,
      sku: formData.sku,
      price_adjustment: parseFloat(formData.price_adjustment),
      stock_qty: parseInt(formData.stock_qty),
      created_at: new Date().toISOString(),
    };

    const updated = [...variants, newVariant];
    setVariants(updated);
    localStorage.setItem('product_variants', JSON.stringify(updated));

    resetForm();
    alert('Variant created successfully!');
  };

  const deleteVariant = (id: number) => {
    if (!confirm('Delete this variant?')) return;
    const updated = variants.filter((v) => v.id !== id);
    setVariants(updated);
    localStorage.setItem('product_variants', JSON.stringify(updated));
  };

  const resetForm = () => {
    setShowForm(false);
    setFormData({
      variant_type: 'size',
      variant_name: '',
      sku: '',
      price_adjustment: '0',
      stock_qty: '0',
    });
  };

  const getProductVariants = (productId: number) => {
    return variants.filter((v) => v.parent_product_id === productId);
  };

  const getVariantPrice = (variant: ProductVariant) => {
    const product = products.find((p) => p.id === variant.parent_product_id);
    if (!product) return 0;
    return product.selling_price + variant.price_adjustment;
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Product Variants</h3>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          + Add Variant
        </button>
      </div>

      {/* Products with Variants */}
      <div className="space-y-4">
        {products.map((product) => {
          const productVariants = getProductVariants(product.id);
          if (productVariants.length === 0) return null;

          return (
            <div key={product.id} className="card">
              <h4 className="font-semibold mb-3">
                {product.name} (Base: ₱{product.selling_price.toFixed(2)})
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Type</th>
                      <th className="text-left py-2">Variant</th>
                      <th className="text-left py-2">SKU</th>
                      <th className="text-right py-2">Price Adj.</th>
                      <th className="text-right py-2">Final Price</th>
                      <th className="text-right py-2">Stock</th>
                      <th className="text-center py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productVariants.map((variant) => (
                      <tr key={variant.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 capitalize">{variant.variant_type}</td>
                        <td className="py-2 font-medium">{variant.variant_name}</td>
                        <td className="py-2">{variant.sku}</td>
                        <td className={`py-2 text-right ${
                          variant.price_adjustment > 0 ? 'text-green-600' :
                          variant.price_adjustment < 0 ? 'text-red-600' : ''
                        }`}>
                          {variant.price_adjustment > 0 ? '+' : ''}₱{variant.price_adjustment.toFixed(2)}
                        </td>
                        <td className="py-2 text-right font-semibold">
                          ₱{getVariantPrice(variant).toFixed(2)}
                        </td>
                        <td className="py-2 text-right">{variant.stock_qty}</td>
                        <td className="py-2 text-center">
                          <button
                            onClick={() => deleteVariant(variant.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {variants.length === 0 && (
          <div className="card text-center py-12 text-gray-500">
            No product variants yet. Create variants for products with different sizes, colors, etc.
          </div>
        )}
      </div>

      {/* Create Variant Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">Add Product Variant</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Parent Product *</label>
                <select
                  value={selectedProduct || ''}
                  onChange={(e) => setSelectedProduct(Number(e.target.value))}
                  className="input"
                >
                  <option value="">Select Product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ₱{product.selling_price}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Variant Type *</label>
                  <select
                    value={formData.variant_type}
                    onChange={(e) => setFormData({ ...formData, variant_type: e.target.value })}
                    className="input"
                  >
                    <option value="size">Size</option>
                    <option value="color">Color</option>
                    <option value="material">Material</option>
                    <option value="style">Style</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Variant Name *</label>
                  <input
                    type="text"
                    value={formData.variant_name}
                    onChange={(e) => setFormData({ ...formData, variant_name: e.target.value })}
                    placeholder="e.g., Large, Red, Cotton"
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">SKU *</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Unique SKU"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Price Adjustment</label>
                  <input
                    type="number"
                    value={formData.price_adjustment}
                    onChange={(e) => setFormData({ ...formData, price_adjustment: e.target.value })}
                    placeholder="0.00"
                    step="0.01"
                    className="input"
                  />
                  <p className="text-xs text-gray-500 mt-1">+/- from base price</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stock_qty}
                    onChange={(e) => setFormData({ ...formData, stock_qty: e.target.value })}
                    placeholder="0"
                    min="0"
                    className="input"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={resetForm} className="flex-1 btn btn-secondary">
                Cancel
              </button>
              <button onClick={createVariant} className="flex-1 btn btn-primary">
                Create Variant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
