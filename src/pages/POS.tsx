import { useState, useEffect } from 'react';
import { Product, Category, Customer } from '../types';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import ProductGrid from '../components/pos/ProductGrid';
import Cart from '../components/pos/Cart';
import PaymentModal from '../components/pos/PaymentModal';
import CashRegister from '../components/pos/CashRegister';
import QuickSaleShortcuts from '../components/pos/QuickSaleShortcuts';
import ReturnsRefunds from '../components/pos/ReturnsRefunds';
import Layaway from '../components/pos/Layaway';
import Promotions from '../components/pos/Promotions';

export default function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [showCashRegister, setShowCashRegister] = useState(false);
  const [showReturns, setShowReturns] = useState(false);
  const [showLayaway, setShowLayaway] = useState(false);
  const [showPromotions, setShowPromotions] = useState(false);

  const user = useAuthStore((state) => state.user);
  const cartItems = useCartStore((state) => state.items);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, categoriesData, customersData] = await Promise.all([
        window.electronAPI.getProducts(),
        window.electronAPI.getCategories(),
        window.electronAPI.getCustomers(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setCustomers(customersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const results = await window.electronAPI.searchProducts(query);
        setProducts(results);
        
        // Auto-add if exact SKU match (barcode scan)
        if (results.length === 1 && results[0].sku.toLowerCase() === query.toLowerCase()) {
          const product = results[0];
          if (product.stock_qty > 0) {
            const { addItem } = useCartStore.getState();
            addItem({
              product_id: product.id,
              name: product.name,
              sku: product.sku,
              qty: 1,
              unit_price: product.selling_price,
              discount: 0,
              subtotal: product.selling_price,
            });
            setSearchQuery(''); // Clear search after adding
            loadData(); // Reset product list
          }
        }
      } catch (error) {
        console.error('Search failed:', error);
      }
    } else {
      loadData();
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category_id === selectedCategory)
    : products;

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with Cash Register Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Point of Sale</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowPromotions(true)} className="btn btn-secondary">
            🎁 Promotions
          </button>
          <button onClick={() => setShowLayaway(true)} className="btn btn-secondary">
            📅 Layaway
          </button>
          <button onClick={() => setShowReturns(true)} className="btn btn-secondary">
            ↩️ Returns
          </button>
          <button onClick={() => setShowCashRegister(true)} className="btn btn-secondary">
            💰 Cash Register
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Search by name, SKU, or scan barcode..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="input text-lg"
          autoFocus
        />
        <p className="text-xs text-gray-500 mt-1">
          💡 Tip: Scan barcode or type SKU for instant add to cart
        </p>
      </div>

      {/* Quick Sale Shortcuts */}
      <QuickSaleShortcuts products={products} />

      {/* Category Filters */}
      <div className="mb-4 flex gap-2 flex-wrap">
        <button
          onClick={() => {
            setSelectedCategory(null);
            setSearchQuery('');
            loadData();
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-accent text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Products
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === cat.id
                ? 'bg-accent text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Main Content: Product Grid + Cart */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        <ProductGrid products={filteredProducts} />
        <Cart
          customers={customers}
          onCheckout={() => setShowPayment(true)}
        />
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setShowPayment(false);
            loadData();
          }}
          userId={user?.id || 0}
        />
      )}

      {/* Cash Register Modal */}
      {showCashRegister && (
        <CashRegister onClose={() => setShowCashRegister(false)} />
      )}

      {/* Returns & Refunds Modal */}
      {showReturns && (
        <ReturnsRefunds onClose={() => setShowReturns(false)} />
      )}

      {/* Layaway Modal */}
      {showLayaway && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Layaway Plans</h2>
              <button onClick={() => setShowLayaway(false)} className="text-2xl">✕</button>
            </div>
            <Layaway />
          </div>
        </div>
      )}

      {/* Promotions Modal */}
      {showPromotions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Promotions</h2>
              <button onClick={() => setShowPromotions(false)} className="text-2xl">✕</button>
            </div>
            <Promotions />
          </div>
        </div>
      )}
    </div>
  );
}
