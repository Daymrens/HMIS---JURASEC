import { useState, useEffect } from 'react';
import { Customer } from '../../types';

interface CreditSale {
  id: number;
  customer_id: number;
  customer_name: string;
  amount: number;
  paid: number;
  balance: number;
  due_date: string;
  created_at: string;
  status: 'active' | 'paid' | 'overdue';
  payments: { date: string; amount: number }[];
}

export default function CreditSales() {
  const [creditSales, setCreditSales] = useState<CreditSale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<CreditSale | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const customersData = await window.electronAPI.getCustomers();
      setCustomers(customersData);
      const saved = localStorage.getItem('credit_sales');
      if (saved) {
        const sales = JSON.parse(saved);
        // Update overdue status
        const updated = sales.map((sale: CreditSale) => ({
          ...sale,
          status: sale.balance === 0 ? 'paid' :
                  new Date(sale.due_date) < new Date() ? 'overdue' : 'active'
        }));
        setCreditSales(updated);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const recordPayment = (saleId: number) => {
    const sale = creditSales.find(s => s.id === saleId);
    if (!sale) return;

    const amount = prompt(`Enter payment amount (Balance: ₱${sale.balance.toFixed(2)}):`);
    if (!amount) return;

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0 || paymentAmount > sale.balance) {
      alert('Invalid amount');
      return;
    }

    const newBalance = sale.balance - paymentAmount;
    const newStatus = newBalance === 0 ? 'paid' : sale.status;
    const newPayment = { date: new Date().toISOString(), amount: paymentAmount };

    const updated = creditSales.map(s =>
      s.id === saleId
        ? {
            ...s,
            paid: s.paid + paymentAmount,
            balance: newBalance,
            status: newStatus,
            payments: [...s.payments, newPayment]
          }
        : s
    );

    setCreditSales(updated);
    localStorage.setItem('credit_sales', JSON.stringify(updated));
  };

  const totalCredit = creditSales.reduce((sum, sale) => sum + sale.balance, 0);
  const overdueCredit = creditSales
    .filter(s => s.status === 'overdue')
    .reduce((sum, sale) => sum + sale.balance, 0);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Credit Sales</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card bg-blue-50">
          <h3 className="text-sm text-gray-600 mb-2">Total Credit Outstanding</h3>
          <p className="text-2xl font-bold text-blue-600">₱{totalCredit.toFixed(2)}</p>
        </div>
        <div className="card bg-red-50">
          <h3 className="text-sm text-gray-600 mb-2">Overdue Amount</h3>
          <p className="text-2xl font-bold text-red-600">₱{overdueCredit.toFixed(2)}</p>
        </div>
        <div className="card bg-green-50">
          <h3 className="text-sm text-gray-600 mb-2">Active Accounts</h3>
          <p className="text-2xl font-bold text-green-600">
            {creditSales.filter(s => s.status === 'active').length}
          </p>
        </div>
      </div>

      {/* Credit Sales List */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3">Sale #</th>
              <th className="text-left py-3">Customer</th>
              <th className="text-left py-3">Date</th>
              <th className="text-left py-3">Due Date</th>
              <th className="text-right py-3">Amount</th>
              <th className="text-right py-3">Paid</th>
              <th className="text-right py-3">Balance</th>
              <th className="text-center py-3">Status</th>
              <th className="text-center py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {creditSales.map((sale) => (
              <tr key={sale.id} className="border-b hover:bg-gray-50">
                <td className="py-3">CS-{sale.id}</td>
                <td className="py-3">{sale.customer_name}</td>
                <td className="py-3">{new Date(sale.created_at).toLocaleDateString()}</td>
                <td className="py-3">{new Date(sale.due_date).toLocaleDateString()}</td>
                <td className="py-3 text-right">₱{sale.amount.toFixed(2)}</td>
                <td className="py-3 text-right">₱{sale.paid.toFixed(2)}</td>
                <td className="py-3 text-right font-semibold text-red-600">
                  ₱{sale.balance.toFixed(2)}
                </td>
                <td className="py-3 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    sale.status === 'paid' ? 'bg-green-100 text-green-700' :
                    sale.status === 'overdue' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {sale.status}
                  </span>
                </td>
                <td className="py-3 text-center">
                  <div className="flex gap-2 justify-center">
                    {sale.status !== 'paid' && (
                      <button
                        onClick={() => recordPayment(sale.id)}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        💰 Pay
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedSale(sale)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      📋 Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {creditSales.length === 0 && (
          <div className="text-center py-12 text-gray-500">No credit sales yet.</div>
        )}
      </div>

      {/* Payment History Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">Credit Sale Details</h2>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Sale #</p>
                  <p className="font-semibold">CS-{selectedSale.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-semibold">{selectedSale.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-semibold">₱{selectedSale.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Balance</p>
                  <p className="font-semibold text-red-600">₱{selectedSale.balance.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Payment History</h3>
                {selectedSale.payments.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Date</th>
                        <th className="text-right py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSale.payments.map((payment, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="py-2">{new Date(payment.date).toLocaleDateString()}</td>
                          <td className="py-2 text-right">₱{payment.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500 text-sm">No payments recorded yet.</p>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedSale(null)}
              className="w-full btn btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
