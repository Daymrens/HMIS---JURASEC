import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function PeriodComparison() {
  const [view, setView] = useState<'monthly' | 'yearly'>('monthly');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComparisonData();
  }, [view]);

  const loadComparisonData = async () => {
    setLoading(true);
    try {
      const allTransactions = await window.electronAPI.getTransactions({});
      
      if (view === 'monthly') {
        // Last 12 months
        const monthlyData: any = {};
        const now = new Date();
        
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          monthlyData[key] = { month: key, sales: 0, transactions: 0, profit: 0 };
        }

        allTransactions.forEach((txn: any) => {
          const date = new Date(txn.created_at);
          const key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          if (monthlyData[key]) {
            monthlyData[key].sales += txn.total;
            monthlyData[key].transactions += 1;
          }
        });

        setData(Object.values(monthlyData));
      } else {
        // Last 5 years
        const yearlyData: any = {};
        const currentYear = new Date().getFullYear();
        
        for (let i = 4; i >= 0; i--) {
          const year = currentYear - i;
          yearlyData[year] = { year: year.toString(), sales: 0, transactions: 0, profit: 0 };
        }

        allTransactions.forEach((txn: any) => {
          const year = new Date(txn.created_at).getFullYear();
          if (yearlyData[year]) {
            yearlyData[year].sales += txn.total;
            yearlyData[year].transactions += 1;
          }
        });

        setData(Object.values(yearlyData));
      }
    } catch (error) {
      console.error('Failed to load comparison data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading comparison data...</div>;
  }

  const totalSales = data.reduce((sum, item) => sum + item.sales, 0);
  const avgSales = data.length > 0 ? totalSales / data.length : 0;
  const bestPeriod = data.reduce((best, item) => item.sales > best.sales ? item : best, data[0] || {});
  const growth = data.length >= 2 ? ((data[data.length - 1].sales - data[data.length - 2].sales) / data[data.length - 2].sales * 100) : 0;

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setView('monthly')}
          className={`px-4 py-2 rounded font-medium ${
            view === 'monthly' ? 'bg-accent text-white' : 'bg-gray-200'
          }`}
        >
          Monthly (Last 12 Months)
        </button>
        <button
          onClick={() => setView('yearly')}
          className={`px-4 py-2 rounded font-medium ${
            view === 'yearly' ? 'bg-accent text-white' : 'bg-gray-200'
          }`}
        >
          Yearly (Last 5 Years)
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-sm text-gray-600">Total Sales</div>
          <div className="text-2xl font-bold text-accent">
            ₱{totalSales.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600">Average per Period</div>
          <div className="text-2xl font-bold text-blue-600">
            ₱{avgSales.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600">Best Period</div>
          <div className="text-2xl font-bold text-green-600">
            {bestPeriod[view === 'monthly' ? 'month' : 'year']}
          </div>
          <div className="text-xs text-gray-500">
            ₱{bestPeriod.sales?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600">Growth Rate</div>
          <div className={`text-2xl font-bold ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">vs previous period</div>
        </div>
      </div>

      {/* Sales Comparison Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Sales Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={view === 'monthly' ? 'month' : 'year'} />
            <YAxis />
            <Tooltip formatter={(value: number) => `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`} />
            <Legend />
            <Bar dataKey="sales" fill="#f97316" name="Sales" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Transaction Count Trend */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Transaction Count Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={view === 'monthly' ? 'month' : 'year'} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="transactions" stroke="#3b82f6" strokeWidth={2} name="Transactions" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Table */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Detailed Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Period</th>
                <th className="text-right py-2">Sales</th>
                <th className="text-right py-2">Transactions</th>
                <th className="text-right py-2">Avg per Transaction</th>
                <th className="text-right py-2">Growth</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => {
                const prevSales = index > 0 ? data[index - 1].sales : item.sales;
                const periodGrowth = prevSales > 0 ? ((item.sales - prevSales) / prevSales * 100) : 0;
                const avgPerTxn = item.transactions > 0 ? item.sales / item.transactions : 0;

                return (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-medium">{item[view === 'monthly' ? 'month' : 'year']}</td>
                    <td className="py-2 text-right font-semibold">
                      ₱{item.sales.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 text-right">{item.transactions}</td>
                    <td className="py-2 text-right">₱{avgPerTxn.toFixed(2)}</td>
                    <td className={`py-2 text-right font-semibold ${
                      periodGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {index > 0 ? `${periodGrowth >= 0 ? '+' : ''}${periodGrowth.toFixed(1)}%` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
