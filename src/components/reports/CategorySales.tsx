import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CategorySalesProps {
  startDate: string;
  endDate: string;
}

export default function CategorySales({ startDate, endDate }: CategorySalesProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategorySales();
  }, [startDate, endDate]);

  const loadCategorySales = async () => {
    setLoading(true);
    try {
      // Get all transactions in date range
      const transactions = await window.electronAPI.getTransactions({
        startDate,
        endDate,
      });

      // Get all products to map categories
      const products = await window.electronAPI.getProducts();
      const categories = await window.electronAPI.getCategories();

      // Calculate sales by category
      const categoryMap = new Map();
      
      for (const txn of transactions) {
        const details = await window.electronAPI.getTransactionById(txn.id);
        
        for (const item of details.items || []) {
          const product = products.find((p: any) => p.id === item.product_id);
          if (product) {
            const category = categories.find((c: any) => c.id === product.category_id);
            const categoryName = category?.name || 'Uncategorized';
            
            if (!categoryMap.has(categoryName)) {
              categoryMap.set(categoryName, {
                name: categoryName,
                value: 0,
                count: 0,
              });
            }
            
            const current = categoryMap.get(categoryName);
            current.value += item.subtotal;
            current.count += item.qty;
          }
        }
      }

      const chartData = Array.from(categoryMap.values()).sort((a, b) => b.value - a.value);
      setData(chartData);
    } catch (error) {
      console.error('Failed to load category sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'];

  const totalSales = data.reduce((sum, item) => sum + item.value, 0);

  if (loading) {
    return <div className="text-center py-12">Loading category sales...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Sales Distribution</h3>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₱${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">No sales data</div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {data.map((item, index) => {
              const percentage = totalSales > 0 ? (item.value / totalSales) * 100 : 0;
              return (
                <div key={index} className="border-b pb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-accent font-bold">
                      ₱{item.value.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{item.count} items sold</span>
                    <span>{percentage.toFixed(1)}% of total</span>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Detailed Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Category</th>
                <th className="text-right py-2">Items Sold</th>
                <th className="text-right py-2">Total Sales</th>
                <th className="text-right py-2">% of Total</th>
                <th className="text-right py-2">Avg per Item</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => {
                const percentage = totalSales > 0 ? (item.value / totalSales) * 100 : 0;
                const avgPerItem = item.count > 0 ? item.value / item.count : 0;
                return (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-medium">{item.name}</td>
                    <td className="py-2 text-right">{item.count}</td>
                    <td className="py-2 text-right font-semibold">
                      ₱{item.value.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 text-right">{percentage.toFixed(1)}%</td>
                    <td className="py-2 text-right">₱{avgPerItem.toFixed(2)}</td>
                  </tr>
                );
              })}
              <tr className="font-bold bg-gray-100">
                <td className="py-2">TOTAL</td>
                <td className="py-2 text-right">{data.reduce((sum, item) => sum + item.count, 0)}</td>
                <td className="py-2 text-right">
                  ₱{totalSales.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2 text-right">100%</td>
                <td className="py-2 text-right">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
