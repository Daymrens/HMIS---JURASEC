import { useEffect, useState } from 'react';
import { DashboardStats } from '../types';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState<'line' | 'bar'>('line');
  const [paymentMethodData, setPaymentMethodData] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
    loadPaymentMethodBreakdown();
  }, []);

  const loadStats = async () => {
    try {
      const data = await window.electronAPI.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentMethodBreakdown = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const transactions = await window.electronAPI.getTransactions({
        startDate: weekAgo,
        endDate: today,
      });

      const breakdown = transactions.reduce((acc: any, txn: any) => {
        const method = txn.payment_method.replace('_', ' ');
        if (!acc[method]) {
          acc[method] = { name: method, value: 0, count: 0 };
        }
        acc[method].value += txn.total;
        acc[method].count += 1;
        return acc;
      }, {});

      setPaymentMethodData(Object.values(breakdown));
    } catch (error) {
      console.error('Failed to load payment breakdown:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="text-sm text-gray-600 dark:text-gray-400">Today's Sales</div>
          <div className="text-3xl font-bold text-accent mt-2">
            ₱{stats?.todaySales.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="card">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Products</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">
            {stats?.totalProducts}
          </div>
        </div>

        <div className="card">
          <div className="text-sm text-gray-600 dark:text-gray-400">Low Stock Alerts</div>
          <div className="text-3xl font-bold text-red-600 mt-2">
            {stats?.lowStockCount}
          </div>
        </div>

        <div className="card">
          <div className="text-sm text-gray-600 dark:text-gray-400">Top Selling Items</div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            {stats?.topItems.length}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex gap-4">
          <button onClick={() => navigate('/pos')} className="btn btn-primary">
            🛒 New Sale
          </button>
          <button onClick={() => navigate('/inventory')} className="btn btn-secondary">
            📦 Add Product
          </button>
          <button onClick={() => navigate('/reports')} className="btn btn-secondary">
            📈 View Reports
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Sales Trend (Last 7 Days)</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setChartView('line')}
                className={`px-3 py-1 rounded text-sm ${
                  chartView === 'line' ? 'bg-accent text-white' : 'bg-gray-200'
                }`}
              >
                Line
              </button>
              <button
                onClick={() => setChartView('bar')}
                className={`px-3 py-1 rounded text-sm ${
                  chartView === 'bar' ? 'bg-accent text-white' : 'bg-gray-200'
                }`}
              >
                Bar
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            {chartView === 'line' ? (
              <LineChart data={stats?.salesTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => `₱${value.toFixed(2)}`} />
                <Line type="monotone" dataKey="total" stroke="#f97316" strokeWidth={2} />
              </LineChart>
            ) : (
              <BarChart data={stats?.salesTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => `₱${value.toFixed(2)}`} />
                <Bar dataKey="total" fill="#f97316" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Payment Method Breakdown */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Payment Methods (Last 7 Days)</h3>
          {paymentMethodData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#f97316', '#3b82f6', '#10b981'][index % 3]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₱${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">No payment data</div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Transaction No</th>
                <th className="text-left py-2">Cashier</th>
                <th className="text-left py-2">Payment Method</th>
                <th className="text-right py-2">Total</th>
                <th className="text-left py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentTransactions.map((txn) => (
                <tr key={txn.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-2">{txn.transaction_no}</td>
                  <td className="py-2">{txn.username}</td>
                  <td className="py-2 capitalize">{txn.payment_method.replace('_', ' ')}</td>
                  <td className="py-2 text-right font-semibold">
                    ₱{txn.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2">{new Date(txn.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!stats?.recentTransactions || stats.recentTransactions.length === 0) && (
            <p className="text-gray-500 text-center py-8">No transactions yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
