import { useEffect } from 'react';
import { useCartStore } from '../../stores/cartStore';

interface QuickSaleShortcutsProps {
  products: any[];
}

export default function QuickSaleShortcuts({ products }: QuickSaleShortcutsProps) {
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // F1-F12 keys
      if (e.key.startsWith('F') && e.key.length <= 3) {
        e.preventDefault();
        const keyNum = parseInt(e.key.substring(1));
        
        // Get shortcut from localStorage
        const shortcuts = JSON.parse(localStorage.getItem('quick_sale_shortcuts') || '{}');
        const productId = shortcuts[`F${keyNum}`];
        
        if (productId) {
          const product = products.find(p => p.id === productId);
          if (product && product.stock_qty > 0) {
            addItem({
              product_id: product.id,
              name: product.name,
              sku: product.sku,
              qty: 1,
              unit_price: product.selling_price,
              discount: 0,
              subtotal: product.selling_price,
            });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [products, addItem]);

  const shortcuts = JSON.parse(localStorage.getItem('quick_sale_shortcuts') || '{}');
  const assignedShortcuts = Object.entries(shortcuts).map(([key, productId]) => {
    const product = products.find(p => p.id === productId);
    return { key, product };
  }).filter(s => s.product);

  if (assignedShortcuts.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 bg-blue-50 p-3 rounded-lg">
      <div className="text-sm font-semibold mb-2">⚡ Quick Sale Shortcuts:</div>
      <div className="flex flex-wrap gap-2">
        {assignedShortcuts.map(({ key, product }) => (
          <div key={key} className="bg-white px-3 py-1 rounded border text-xs">
            <span className="font-bold text-blue-600">{key}</span>
            <span className="mx-1">→</span>
            <span>{product?.name}</span>
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-600 mt-2">
        💡 Configure shortcuts in Settings page
      </div>
    </div>
  );
}
