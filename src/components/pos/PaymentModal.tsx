import { useState } from 'react';
import { useCartStore } from '../../stores/cartStore';
import Receipt from './Receipt';

interface PaymentModalProps {
  onClose: () => void;
  onSuccess: () => void;
  userId: number;
}

export default function PaymentModal({ onClose, onSuccess, userId }: PaymentModalProps) {
  const { items, discount, getSubtotal, getTax, getTotal, clearCart } = useCartStore();
  
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'gcash' | 'bank_transfer'>('cash');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [transactionData, setTransactionData] = useState<any>(null);

  const total = getTotal();
  const change = paymentMethod === 'cash' ? Math.max(0, Number(amountPaid) - total) : 0;

  const handlePayment = async () => {
    if (paymentMethod === 'cash' && Number(amountPaid) < total) {
      alert('Insufficient payment amount!');
      return;
    }

    setProcessing(true);

    try {
      const transaction = {
        user_id: userId,
        payment_method: paymentMethod,
        subtotal: getSubtotal(),
        discount: discount,
        tax: getTax(),
        total: total,
        items: items.map(item => ({
          product_id: item.product_id,
          qty: item.qty,
          unit_price: item.unit_price,
          discount: item.discount,
          subtotal: item.subtotal,
        })),
      };

      const result = await window.electronAPI.createTransaction(transaction);
      
      // Calculate profit
      const profit = items.reduce((sum, item) => {
        const costPrice = item.cost_price || 0; // We'll need to pass this
        const revenue = item.subtotal;
        const cost = costPrice * item.qty;
        return sum + (revenue - cost);
      }, 0);

      setTransactionData({
        ...result,
        ...transaction,
        items: items,
        payment_method: paymentMethod,
        amount_paid: paymentMethod === 'cash' ? Number(amountPaid) : total,
        change: change,
        profit: profit,
      });

      clearCart();
      setShowReceipt(true);
    } catch (error: any) {
      alert(`Transaction failed: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  if (showReceipt && transactionData) {
    return (
      <Receipt
        transaction={transactionData}
        onClose={() => {
          setShowReceipt(false);
          onSuccess();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Payment</h2>

        {/* Payment Method */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">Payment Method</label>
          <div className="space-y-2">
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`w-full p-3 rounded-lg border-2 transition-colors ${
                paymentMethod === 'cash'
                  ? 'border-accent bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              💵 Cash
            </button>
            <button
              onClick={() => setPaymentMethod('gcash')}
              className={`w-full p-3 rounded-lg border-2 transition-colors ${
                paymentMethod === 'gcash'
                  ? 'border-accent bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              📱 GCash
            </button>
            <button
              onClick={() => setPaymentMethod('bank_transfer')}
              className={`w-full p-3 rounded-lg border-2 transition-colors ${
                paymentMethod === 'bank_transfer'
                  ? 'border-accent bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              🏦 Bank Transfer
            </button>
          </div>
        </div>

        {/* Amount Details */}
        <div className="mb-6 space-y-2 bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between text-lg">
            <span>Total Amount:</span>
            <span className="font-bold text-accent">₱{total.toFixed(2)}</span>
          </div>

          {paymentMethod === 'cash' && (
            <>
              <div className="flex justify-between items-center">
                <span>Amount Paid:</span>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="0.00"
                  className="w-32 text-right input"
                  autoFocus
                  step="0.01"
                />
              </div>
              {amountPaid && (
                <div className="flex justify-between text-lg font-semibold">
                  <span>Change:</span>
                  <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                    ₱{change.toFixed(2)}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={processing}
            className="flex-1 btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={processing || (paymentMethod === 'cash' && !amountPaid)}
            className="flex-1 btn btn-primary"
          >
            {processing ? 'Processing...' : 'Complete Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}
