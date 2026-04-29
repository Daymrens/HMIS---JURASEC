import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface InventoryTurnoverProps {
  startDate: string;
  endDate: string;
}

export default function InventoryTurnover({ startDate, endDate }: InventoryTurnoverProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTurnoverData();
  }, [startDate, endDate]);

  const loadTurnoverData = async () => {
    setLoading(true);
    try {
      const products = await window.electronAPI.getProducts();
      const transactions = await window.electronAPI.getTransactions({
        startDate,
        endDate,
      });

      const turnoverData = [];

      for (const product of products) {
        let totalSold = 0;
        
        for (const txn of transactions) {
          const details = await window.electronAPI.getTransactionById(txn.id);
          const item = details.items?.find((i: any) => i.product_id === product.id);
          if (item) {
            totalSold += item.qty;
          }
        }

        if (totalSold > 0) {
          const avgInventory = (product.stock_qty + totalSold) / 2;
          const turnoverRate = avgInventory > 0 ? totalSold / avgInventory : 0;
          const daysInPeriod = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
          const daysToSell = turnoverRate > 0 ? daysInPeriod / turnoverRate : 0;

          turnoverData.push({
            name: product.name,
            sku: product.sku,
            sold: totalSold,
            currentStock: product.stock_qty,
            turnoverRate: turnoverRate.toFixed(2),
            daysToSell: Math.round(daysToSell),
            category: product.category_name,
            revenue: totalSold * product.selling_price,
          });
        }
      }

      // Sort by turnover rate (fastest moving first)
      turnoverData.sort((a, b) => parseFloat(b.turnoverRate) - parseFloat(a.turnoverRate));
      setData(turnoverData);
    } catch (error) {
      console.error('Failed to load turnover data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading inventory turnover...</div>;
  }

  const topMovers = data.slice(0, 10);
  const slowMovers = data.slice(-10).reverse();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-green-50">
          <div className="text-sm text-gray-600">Fast Moving Items</div>
          <div className="text-2xl font-bold text-green-600">{topMovers.length}</div>
          <div className="text-xs text-gray-500">High turnover rate</div>
        </div>
        <div className="card bg-yellow-50">
          <div className="text-sm text-gray-600">Average Turnover</div>
          <div className="text-2xl font-bold text-yellow-600">
            {data.length > 0 ? (data.reduce((sum, item) => sum + parseFloat(item.turnoverRate), 0) / data.length).toFixed(2) : '0'}x
          </div>
          <div className="text-xs text-gray-500">Per period</div>
        </div>
        <div className="card bg-red-50">
          <div className="text-sm text-gray-600">Slow Moving Items</div>
          <div className="text-2xl font-bold text-red-600">{slowMovers.length}</div>
          <div className="text-xs text-gray-500">Low turnover rate</div>
        </div>
      </div>

      {/* Top Movers Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Top 10 Fast-Moving Products</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topMovers} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip />
            <Legend />
            <Bar dataKey="sold" fill="#10b981" name="Units Sold" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Table */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Inventory Turnover Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Product</th>
                <th className="text-left py-2">Category</th>
                <th className="text-right py-2">Sold</th>
                <th className="text-right py-2">Current Stock</th>
                <th className="text-right py-2">Turnover Rate</th>
                <th className="text-right py-2">Days to Sell</th>
                <th className="text-right py-2">Revenue</th>
                <th className="text-center py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => {
                const turnover = parseFloat(item.turnoverRate);
                const status = turnover > 2 ? 'Fast' : turnover > 1 ? 'Normal' : 'Slow';
                const statusColor = turnover > 2 ? 'text-green-600' : turnover > 1 ? 'text-yellow-600' : 'text-red-600';
                
                return (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-2">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.sku}</div>
                    </td>
                    <td className="py-2">{item.category}</td>
                    <td className="py-2 text-right font-semibold">{item.sold}</td>
                    <td className="py-2 text-right">{item.currentStock}</td>
                    <td className="py-2 text-right font-bold">{item.turnoverRate}x</td>
                    <td className="py-2 text-right">{item.daysToSell} days</td>
                    <td className="py-2 text-right">₱{item.revenue.toFixed(2)}</td>
                    <td className="py-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColor}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {data.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No inventory movement in selected period
            </div>
          )}
        </div>
      </div>

      {/* Slow Movers Alert */}
      {slowMovers.length > 0 && (
        <div className="card bg-red-50">
          <h3 className="text-lg font-semibold mb-4 text-red-700">⚠️ Slow-Moving Items Alert</h3>
          <p className="text-sm text-gray-600 mb-3">
            These items have low turnover rates. Consider promotions or adjusting stock levels.
          </p>
          <div className="space-y-2">
            {slowMovers.slice(0, 5).map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-white p-2 rounded">
                <span className="font-medium">{item.name}</span>
                <span className="text-sm text-gray-600">
                  {item.daysToSell} days to sell • {item.currentStock} in stock
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
