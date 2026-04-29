import { Product } from '../../types';
import { useCartStore } from '../../stores/cartStore';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (product: Product) => {
    if (product.stock_qty <= 0) {
      alert('Product out of stock!');
      return;
    }

    addItem({
      product_id: product.id,
      name: product.name,
      sku: product.sku,
      qty: 1,
      unit_price: product.selling_price,
      discount: 0,
      subtotal: product.selling_price,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => handleAddToCart(product)}
            className={`card cursor-pointer hover:shadow-lg transition-shadow ${
              product.stock_qty <= 0 ? 'opacity-50' : ''
            }`}
          >
            <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
              <span className="text-4xl">📦</span>
            </div>
            <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h3>
            <p className="text-xs text-gray-500 mb-2">{product.sku}</p>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-accent">
                ₱{product.selling_price.toFixed(2)}
              </span>
              <span className={`text-xs ${product.stock_qty <= product.reorder_level ? 'text-red-600' : 'text-gray-600'}`}>
                Stock: {product.stock_qty}
              </span>
            </div>
            {product.stock_qty <= 0 && (
              <div className="mt-2 text-xs text-red-600 font-semibold">Out of Stock</div>
            )}
          </div>
        ))}
      </div>
      {products.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No products found. Try a different search or category.
        </div>
      )}
    </div>
  );
}
