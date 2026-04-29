import { useState } from 'react';
import { Customer } from '../../types';
import { useCartStore } from '../../stores/cartStore';

interface CartProps {
  customers: Customer[];
  onCheckout: () => void;
}

export default function Cart({ customers, onCheckout }: CartProps) {
  const {
    items,
    discount,
    taxEnabled,
    updateQuantity,
    updateItemDiscount,
    removeItem,
    setDiscount,
    setTaxEnabled,
    getSubtotal,
    getTax,
    getTotal,
  } = useCartStore();

  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);

  const handleCheckout = () => {
    if (items.length === 0) {
      alert('Cart is empty!');
      return;
    }
    onCheckout();
  };

  return (
    <div className="w-96 card flex flex-col h-full">
      <h2 className="text-xl font-bold mb-4">Cart</h2>

      {/* Customer Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Customer (Optional)</label>
        <select
          value={selectedCustomer || ''}
          onChange={(e) => setSelectedCustomer(e.target.value ? Number(e.target.value) : null)}
          className="input"
        >
          <option value="">Walk-in Customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {items.map((item) => (
          <div key={item.product_id} className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{item.name}</h4>
                <p className="text-xs text-gray-500">{item.sku}</p>
              </div>
              <button
                onClick={() => removeItem(item.product_id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => updateQuantity(item.product_id, Math.max(1, item.qty - 1))}
                className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
              >
                -
              </button>
              <input
                type="number"
                value={item.qty}
                onChange={(e) => updateQuantity(item.product_id, Math.max(1, Number(e.target.value)))}
                className="w-16 text-center border rounded px-2 py-1"
                min="1"
              />
              <button
                onClick={() => updateQuantity(item.product_id, item.qty + 1)}
                className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
              >
                +
              </button>
              <span className="text-sm text-gray-600">× ₱{item.unit_price.toFixed(2)}</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">Discount %:</label>
              <input
                type="number"
                value={item.discount}
                onChange={(e) => updateItemDiscount(item.product_id, Math.max(0, Math.min(100, Number(e.target.value))))}
                className="w-16 text-sm border rounded px-2 py-1"
                min="0"
                max="100"
              />
              <span className="ml-auto font-semibold text-accent">
                ₱{item.subtotal.toFixed(2)}
              </span>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Cart is empty. Add products to start.
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="border-t pt-4 space-y-3">
        <div className="flex items-center gap-2">
          <label className="text-sm">Overall Discount %:</label>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(Math.max(0, Math.min(100, Number(e.target.value))))}
            className="w-20 text-sm border rounded px-2 py-1"
            min="0"
            max="100"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="vat"
            checked={taxEnabled}
            onChange={(e) => setTaxEnabled(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="vat" className="text-sm">Include VAT (12%)</label>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-semibold">₱{getSubtotal().toFixed(2)}</span>
          </div>
          {taxEnabled && (
            <div className="flex justify-between text-gray-600">
              <span>VAT (12%):</span>
              <span>₱{getTax().toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total:</span>
            <span className="text-accent">₱{getTotal().toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={items.length === 0}
          className="w-full btn btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
}
