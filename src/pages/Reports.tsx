import { useState, useEffect } from 'react';
import { Transaction } from '../types';
import CategorySales from '../components/reports/CategorySales';
import BIRCompliance from '../components/reports/BIRCompliance';

export default function Reports() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'sales' | 'category' | 'inventory' | 'bir'>('sales');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setStartDate(weekAgo);
    setEndDate(today);
    loadSalesReport(weekAgo, today);
  }, []);

  const loadSalesReport = async (start: string, end: string) => {
    setLoading(true);
    try {
      const data = await window.electronAPI.getTransactions({
        startDate: start,
        endDate: end,
      });
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (startDate && endDate) {
      loadSalesReport(startDate, endDate);
    }
  };

  const totalSales = transactions.reduce((sum, t) => sum + t.total, 0);
  const totalTransactions = transactions.length;
  const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Reports</h2>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'sales'
              ? 'border-b-2 border-accent text-accent'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Sales Report
        </button>
        <button
          onClick={() => setActiveTab('category')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'category'
              ? 'border-b-2 border-accent text-accent'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Sales by Category
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'inventory'
              ? 'border-b-2 border-accent text-accent'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Inventory Valuation
        </button>
        <button
          onClick={() => setActiveTab('bir')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'bir'
              ? 'border-b-2 border-accent text-accent'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          BIR Compliance
        </button>
      </div>

      {activeTab === 'sales' && (
        <>
          {/* Date Filter */}
          <div className="card">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input"
                />
              </div>
              <button onClick={handleSearch} className="btn btn-primary">
                Generate Report
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="text-sm text-gray-600">Total Sales</div>
              <div className="text-3xl font-bold text-accent mt-2">
                ₱{totalSales.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-600">Total Transactions</div>
              <div className="text-3xl font-bold text-blue-600 mt-2">{totalTransactions}</div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-600">Average Transaction</div>
              <div className="text-3xl font-bold text-green-600 mt-2">
                ₱{averageTransaction.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="card overflow-x-auto">
            <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3">Transaction No</th>
                    <th className="text-left py-3">Date</th>
                    <th className="text-left py-3">Cashier</th>
                    <th className="text-left py-3">Payment Method</th>
                    <th className="text-right py-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="border-b hover:bg-gray-50">
                      <td className="py-3">{txn.transaction_no}</td>
                      <td className="py-3">{new Date(txn.created_at).toLocaleString()}</td>
                      <td className="py-3">{txn.username}</td>
                      <td className="py-3 capitalize">{txn.payment_method.replace('_', ' ')}</td>
                      <td className="py-3 text-right font-semibold">
                        ₱{txn.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && transactions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No transactions found for the selected period.
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'category' && startDate && endDate && (
        <CategorySales startDate={startDate} endDate={endDate} />
      )}

      {activeTab === 'category' && (!startDate || !endDate) && (
        <div className="card">
          <p className="text-gray-600">Please select a date range above to view category sales.</p>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Inventory Valuation</h3>
          <p className="text-gray-600">Coming soon...</p>
        </div>
      )}

      {activeTab === 'bir' && <BIRCompliance />}
    </div>
  );
}
