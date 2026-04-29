import { useState } from 'react';
import { Product } from '../../types';
import { useAuthStore } from '../../stores/authStore';

interface StockAdjustmentProps {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StockAdjustment({ product, onClose, onSuccess }: StockAdjustmentProps) {
  const user = useAuthStore((state) => state.user);
  const [type, setType] = useState<'in' | 'out'>('in');
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const reasons = {
    in: ['Delivery', 'Return from Customer', 'Correction', 'Other'],
    out: ['Damaged', 'Expired', 'Lost', 'Return to Supplier', 'Correction', 'Other'],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!qty || Number(qty) <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    if (!reason) {
      alert('Please select a reason');
      return;
    }

    setLoading(true);

    try {
      await window.electronAPI.adjustStock({
        product_id: product.id,
        type,
        qty: Number(qty),
        reason,
        user_id: user?.id,
      });

      onSuccess();
    } catch (error: any) {
      alert(`Failed to adjust stock: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const newStock = type === 'in' 
    ? product.stock_qty + Number(qty || 0)
    : product.stock_qty - Number(qty || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Stock Adjustment</h2>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-2">{product.name}</h3>
          <p className="text-sm text-gray-600">SKU: {product.sku}</p>
          <p className="text-lg font-bold text-accent mt-2">
            Current Stock: {product.stock_qty} {product.unit}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Adjustment Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('in')}
                className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                  type === 'in'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                ➕ Stock In
              </button>
              <button
                type="button"
                onClick={() => setType('out')}
                className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                  type === 'out'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                ➖ Stock Out
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Quantity</label>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="input"
              min="1"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input"
              required
            >
              <option value="">Select Reason</option>
              {reasons[type].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {qty && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">New Stock Level:</p>
              <p className={`text-2xl font-bold ${newStock < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                {newStock} {product.unit}
              </p>
              {newStock < 0 && (
                <p className="text-sm text-red-600 mt-2">
                  ⚠️ Warning: Stock cannot be negative!
                </p>
              )}
            </div>
          )}

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
              disabled={loading || newStock < 0}
              className="flex-1 btn btn-primary"
            >
              {loading ? 'Adjusting...' : 'Adjust Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
