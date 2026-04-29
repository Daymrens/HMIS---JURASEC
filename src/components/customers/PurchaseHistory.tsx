import { useState, useEffect } from 'react';
import { Transaction } from '../../types';

interface PurchaseHistoryProps {
  customerId: number;
  customerName: string;
  onClose: () => void;
}

export default function PurchaseHistory({ customerId, customerName, onClose }: PurchaseHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    loadHistory();
  }, [customerId]);

  const loadHistory = async () => {
    try {
      const allTransactions = await window.electronAPI.getTransactions({});
      const customerTransactions = allTransactions.filter(t => t.customer_id === customerId);
      setTransactions(customerTransactions);
    } catch (error) {
      console.error('Failed to load purchase history:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactionDetails = async (id: number) => {
    try {
      const details = await window.electronAPI.getTransactionById(id);
      setSelectedTransaction(details);
    } catch (error) {
      console.error('Failed to load transaction details:', error);
    }
  };

  const totalSpent = transactions.reduce((sum, t) => sum + t.total, 0);
  const totalTransactions = transactions.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Purchase History - {customerName}</h2>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Total Purchases</div>
            <div className="text-2xl font-bold text-blue-600">{totalTransactions}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Total Spent</div>
            <div className="text-2xl font-bold text-green-600">
              ₱{totalSpent.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <>
            {/* Transactions List */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Transaction No</th>
                    <th className="text-left py-2">Payment Method</th>
                    <th className="text-right py-2">Total</th>
                    <th className="text-center py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="border-b hover:bg-gray-50">
                      <td className="py-2">{new Date(txn.created_at).toLocaleDateString()}</td>
                      <td className="py-2">{txn.transaction_no}</td>
                      <td className="py-2 capitalize">{txn.payment_method.replace('_', ' ')}</td>
                      <td className="py-2 text-right font-semibold">
                        ₱{txn.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 text-center">
                        <button
                          onClick={() => loadTransactionDetails(txn.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transactions.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No purchase history yet.
                </div>
              )}
            </div>

            {/* Transaction Details Modal */}
            {selectedTransaction && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                  <h3 className="text-xl font-bold mb-4">
                    Transaction Details - {selectedTransaction.transaction_no}
                  </h3>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      Date: {new Date(selectedTransaction.created_at).toLocaleString()}
                    </p>
                  </div>
                  <table className="w-full mb-4">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Product</th>
                        <th className="text-center py-2">Qty</th>
                        <th className="text-right py-2">Price</th>
                        <th className="text-right py-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTransaction.items?.map((item, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-2">{item.product_name}</td>
                          <td className="py-2 text-center">{item.qty}</td>
                          <td className="py-2 text-right">₱{item.unit_price.toFixed(2)}</td>
                          <td className="py-2 text-right">₱{item.subtotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      Total: ₱{selectedTransaction.total.toFixed(2)}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="mt-4 btn btn-secondary w-full"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <button onClick={onClose} className="mt-6 btn btn-secondary w-full">
          Close
        </button>
      </div>
    </div>
  );
}
