import { useState, useEffect } from 'react';
import { Transaction } from '../../types';
import { useAuthStore } from '../../stores/authStore';

interface ReturnsRefundsProps {
  onClose: () => void;
}

export default function ReturnsRefunds({ onClose }: ReturnsRefundsProps) {
  const user = useAuthStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [returnItems, setReturnItems] = useState<any[]>([]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const searchTransaction = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const transactions = await window.electronAPI.getTransactions({});
      const found = transactions.find((t: Transaction) => 
        t.transaction_no.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (found) {
        const details = await window.electronAPI.getTransactionById(found.id);
        setTransaction(details);
        setReturnItems(details.items?.map((item: any) => ({
          ...item,
          return_qty: 0,
          selected: false,
        })) || []);
      } else {
        alert('Transaction not found');
      }
    } catch (error) {
      console.error('Failed to search transaction:', error);
      alert('Failed to search transaction');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (index: number) => {
    setReturnItems(returnItems.map((item, i) =>
      i === index ? { ...item, selected: !item.selected, return_qty: !item.selected ? item.qty : 0 } : item
    ));
  };

  const updateReturnQty = (index: number, qty: number) => {
    setReturnItems(returnItems.map((item, i) =>
      i === index ? { ...item, return_qty: Math.min(qty, item.qty) } : item
    ));
  };

  const processReturn = async () => {
    const itemsToReturn = returnItems.filter(item => item.selected && item.return_qty > 0);
    
    if (itemsToReturn.length === 0) {
      alert('Please select items to return');
      return;
    }

    if (!reason.trim()) {
      alert('Please provide a reason for return');
      return;
    }

    try {
      // Calculate refund amount
      const refundAmount = itemsToReturn.reduce((sum, item) => {
        const itemRefund = (item.unit_price * item.return_qty) * (1 - item.discount / 100);
        return sum + itemRefund;
      }, 0);

      // Update stock for returned items
      for (const item of itemsToReturn) {
        const products = await window.electronAPI.getProducts();
        const product = products.find((p: any) => p.id === item.product_id);
        if (product) {
          await window.electronAPI.updateProduct(product.id, {
            ...product,
            stock_qty: product.stock_qty + item.return_qty,
          });
        }
      }

      // Save return record
      const returns = JSON.parse(localStorage.getItem('returns_refunds') || '[]');
      returns.push({
        id: Date.now(),
        transaction_id: transaction?.id,
        transaction_no: transaction?.transaction_no,
        items: itemsToReturn,
        refund_amount: refundAmount,
        reason,
        processed_by: user?.username,
        processed_at: new Date().toISOString(),
      });
      localStorage.setItem('returns_refunds', JSON.stringify(returns));

      alert(`Return processed successfully!\nRefund Amount: ₱${refundAmount.toFixed(2)}`);
      onClose();
    } catch (error) {
      console.error('Failed to process return:', error);
      alert('Failed to process return');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Returns & Refunds</h2>

        {/* Search Transaction */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Search Transaction</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter transaction number..."
              className="input flex-1"
              onKeyPress={(e) => e.key === 'Enter' && searchTransaction()}
            />
            <button onClick={searchTransaction} disabled={loading} className="btn btn-primary">
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Transaction Details */}
        {transaction && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Transaction No:</span>
                  <span className="ml-2 font-semibold">{transaction.transaction_no}</span>
                </div>
                <div>
                  <span className="text-gray-600">Date:</span>
                  <span className="ml-2 font-semibold">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Total:</span>
                  <span className="ml-2 font-semibold">₱{transaction.total.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Payment:</span>
                  <span className="ml-2 font-semibold capitalize">
                    {transaction.payment_method.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Items to Return */}
            <div>
              <h3 className="font-semibold mb-3">Select Items to Return</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Select</th>
                    <th className="text-left py-2">Product</th>
                    <th className="text-center py-2">Purchased Qty</th>
                    <th className="text-center py-2">Return Qty</th>
                    <th className="text-right py-2">Unit Price</th>
                    <th className="text-right py-2">Refund</th>
                  </tr>
                </thead>
                <tbody>
                  {returnItems.map((item, index) => {
                    const refund = (item.unit_price * item.return_qty) * (1 - item.discount / 100);
                    return (
                      <tr key={index} className="border-b">
                        <td className="py-2">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => toggleItem(index)}
                            className="w-4 h-4"
                          />
                        </td>
                        <td className="py-2">{item.product_name}</td>
                        <td className="py-2 text-center">{item.qty}</td>
                        <td className="py-2 text-center">
                          <input
                            type="number"
                            value={item.return_qty}
                            onChange={(e) => updateReturnQty(index, Number(e.target.value))}
                            disabled={!item.selected}
                            className="w-20 text-center border rounded px-2 py-1"
                            min="0"
                            max={item.qty}
                          />
                        </td>
                        <td className="py-2 text-right">₱{item.unit_price.toFixed(2)}</td>
                        <td className="py-2 text-right font-semibold text-accent">
                          ₱{refund.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="font-bold bg-gray-50">
                    <td colSpan={5} className="py-2 text-right">TOTAL REFUND:</td>
                    <td className="py-2 text-right text-accent">
                      ₱{returnItems
                        .filter(item => item.selected)
                        .reduce((sum, item) => {
                          const refund = (item.unit_price * item.return_qty) * (1 - item.discount / 100);
                          return sum + refund;
                        }, 0)
                        .toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium mb-2">Reason for Return *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="input"
              >
                <option value="">Select Reason</option>
                <option value="Defective Product">Defective Product</option>
                <option value="Wrong Item">Wrong Item</option>
                <option value="Customer Changed Mind">Customer Changed Mind</option>
                <option value="Damaged During Delivery">Damaged During Delivery</option>
                <option value="Not as Described">Not as Described</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 btn btn-secondary">
                Cancel
              </button>
              <button onClick={processReturn} className="flex-1 btn btn-primary">
                Process Return & Refund
              </button>
            </div>
          </div>
        )}

        {!transaction && !loading && (
          <div className="text-center py-12 text-gray-500">
            Enter a transaction number to begin processing a return
          </div>
        )}
      </div>
    </div>
  );
}
