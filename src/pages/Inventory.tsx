import { useState, useEffect } from 'react';
import { Product, Category, Supplier } from '../types';
import ProductForm from '../components/inventory/ProductForm';
import StockAdjustment from '../components/inventory/StockAdjustment';
import CSVImport from '../components/inventory/CSVImport';
import QuickProductAdd from '../components/inventory/QuickProductAdd';
import BulkEdit from '../components/inventory/BulkEdit';
import ProductVariants from '../components/inventory/ProductVariants';
import ExpiryTracking from '../components/inventory/ExpiryTracking';
import SerialTracking from '../components/inventory/SerialTracking';

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'bulk' | 'variants' | 'expiry' | 'serial'>('list');
  const [showForm, setShowForm] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showStockAdjustment, setShowStockAdjustment] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadData();

    // Keyboard shortcuts
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N = Quick Add Product
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setShowQuickAdd(true);
      }
      // Ctrl/Cmd + I = Import CSV
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        setShowCSVImport(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const loadData = async () => {
    try {
      const [productsData, categoriesData, suppliersData] = await Promise.all([
        window.electronAPI.getProducts(),
        window.electronAPI.getCategories(),
        window.electronAPI.getSuppliers(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setSuppliers(suppliersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await window.electronAPI.deleteProduct(id);
      loadData();
    } catch (error: any) {
      alert(`Failed to delete product: ${error.message}`);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = searchQuery
      ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesCategory = selectedCategory ? p.category_id === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = filteredProducts.filter((p) => p.stock_qty <= p.reorder_level);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Inventory Management</h2>
          <p className="text-gray-600">
            Total: {filteredProducts.length} products
            {lowStockProducts.length > 0 && (
              <span className="ml-4 text-red-600 font-semibold">
                ⚠️ {lowStockProducts.length} low stock
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowQuickAdd(true)} className="btn btn-secondary">
            ⚡ Quick Add <span className="keyboard-shortcut">Ctrl+N</span>
          </button>
          <button onClick={() => setShowCSVImport(true)} className="btn btn-secondary">
            📥 Import CSV <span className="keyboard-shortcut">Ctrl+I</span>
          </button>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            + Add Product
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'list'
              ? 'border-b-2 border-accent text-accent'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Product List
        </button>
        <button
          onClick={() => setActiveTab('bulk')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'bulk'
              ? 'border-b-2 border-accent text-accent'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Bulk Edit
        </button>
        <button
          onClick={() => setActiveTab('variants')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'variants'
              ? 'border-b-2 border-accent text-accent'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Variants
        </button>
        <button
          onClick={() => setActiveTab('expiry')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'expiry'
              ? 'border-b-2 border-accent text-accent'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Expiry Tracking
        </button>
        <button
          onClick={() => setActiveTab('serial')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'serial'
              ? 'border-b-2 border-accent text-accent'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Serial Numbers
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'list' && (
        <>
      {/* Filters */}
      <div className="card">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input flex-1"
          />
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
            className="input w-48"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3">SKU</th>
              <th className="text-left py-3">Name</th>
              <th className="text-left py-3">Category</th>
              <th className="text-left py-3">Unit</th>
              <th className="text-right py-3">Stock</th>
              <th className="text-right py-3">Reorder Level</th>
              <th className="text-right py-3">Cost Price</th>
              <th className="text-right py-3">Selling Price</th>
              <th className="text-left py-3">Supplier</th>
              <th className="text-center py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr
                key={product.id}
                className={`border-b hover:bg-gray-50 ${
                  product.stock_qty <= product.reorder_level ? 'bg-red-50' : ''
                }`}
              >
                <td className="py-3">{product.sku}</td>
                <td className="py-3 font-medium">{product.name}</td>
                <td className="py-3">{product.category_name}</td>
                <td className="py-3">{product.unit}</td>
                <td className="py-3 text-right">
                  <span
                    className={
                      product.stock_qty <= product.reorder_level
                        ? 'text-red-600 font-semibold'
                        : ''
                    }
                  >
                    {product.stock_qty}
                  </span>
                </td>
                <td className="py-3 text-right">{product.reorder_level}</td>
                <td className="py-3 text-right">₱{product.cost_price.toFixed(2)}</td>
                <td className="py-3 text-right">₱{product.selling_price.toFixed(2)}</td>
                <td className="py-3">{product.supplier_name || '-'}</td>
                <td className="py-3">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        setAdjustingProduct(product);
                        setShowStockAdjustment(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      title="Adjust Stock"
                    >
                      📦
                    </button>
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setShowForm(true);
                      }}
                      className="text-green-600 hover:text-green-800 text-sm"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No products found. Add your first product to get started.
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          suppliers={suppliers}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingProduct(null);
            loadData();
          }}
        />
      )}

      {/* Stock Adjustment Modal */}
      {showStockAdjustment && adjustingProduct && (
        <StockAdjustment
          product={adjustingProduct}
          onClose={() => {
            setShowStockAdjustment(false);
            setAdjustingProduct(null);
          }}
          onSuccess={() => {
            setShowStockAdjustment(false);
            setAdjustingProduct(null);
            loadData();
          }}
        />
      )}

      {/* Quick Product Add Modal */}
      {showQuickAdd && (
        <QuickProductAdd
          categories={categories}
          onSuccess={() => {
            setShowQuickAdd(false);
            loadData();
          }}
          onClose={() => setShowQuickAdd(false)}
        />
      )}

      {/* CSV Import Modal */}
      {showCSVImport && (
        <CSVImport
          onClose={() => setShowCSVImport(false)}
          onSuccess={() => {
            setShowCSVImport(false);
            loadData();
          }}
          categories={categories}
          suppliers={suppliers}
        />
      )}
        </>
      )}

      {activeTab === 'bulk' && <BulkEdit />}
      {activeTab === 'variants' && <ProductVariants />}
      {activeTab === 'expiry' && <ExpiryTracking />}
      {activeTab === 'serial' && <SerialTracking />}
    </div>
  );
}
