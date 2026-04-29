import { useState, useEffect } from 'react';
import { Customer } from '../../types';

interface LoyaltyTransaction {
  id: number;
  customer_id: number;
  type: 'earn' | 'redeem';
  points: number;
  description: string;
  created_at: string;
}

interface CustomerLoyalty extends Customer {
  loyalty_points: number;
  transactions: LoyaltyTransaction[];
}

export default function LoyaltyPoints() {
  const [customers, setCustomers] = useState<CustomerLoyalty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerLoyalty | null>(null);
  const [pointsPerPeso, setPointsPerPeso] = useState(1); // 1 point per ₱1 spent
  const [pesosPerPoint, setPesosPerPoint] = useState(0.5); // ₱0.50 value per point

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const customersData = await window.electronAPI.getCustomers();
      const saved = localStorage.getItem('loyalty_data');
      const loyaltyData = saved ? JSON.parse(saved) : {};

      const customersWithLoyalty = customersData.map((customer: Customer) => ({
        ...customer,
        loyalty_points: loyaltyData[customer.id]?.points || 0,
        transactions: loyaltyData[customer.id]?.transactions || [],
      }));

      setCustomers(customersWithLoyalty);

      // Load settings
      const settings = localStorage.getItem('loyalty_settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setPointsPerPeso(parsed.pointsPerPeso || 1);
        setPesosPerPoint(parsed.pesosPerPoint || 0.5);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveLoyaltyData = (updatedCustomers: CustomerLoyalty[]) => {
    const loyaltyData: any = {};
    updatedCustomers.forEach(customer => {
      loyaltyData[customer.id] = {
        points: customer.loyalty_points,
        transactions: customer.transactions,
      };
    });
    localStorage.setItem('loyalty_data', JSON.stringify(loyaltyData));
  };

  const addPoints = (customerId: number) => {
    const amount = prompt('Enter purchase amount to calculate points:');
    if (!amount) return;

    const purchaseAmount = parseFloat(amount);
    if (isNaN(purchaseAmount) || purchaseAmount <= 0) {
      alert('Invalid amount');
      return;
    }

    const pointsEarned = Math.floor(purchaseAmount * pointsPerPeso);

    const transaction: LoyaltyTransaction = {
      id: Date.now(),
      customer_id: customerId,
      type: 'earn',
      points: pointsEarned,
      description: `Earned from ₱${purchaseAmount.toFixed(2)} purchase`,
      created_at: new Date().toISOString(),
    };

    const updated = customers.map(c =>
      c.id === customerId
        ? {
            ...c,
            loyalty_points: c.loyalty_points + pointsEarned,
            transactions: [...c.transactions, transaction],
          }
        : c
    );

    setCustomers(updated);
    saveLoyaltyData(updated);
    alert(`${pointsEarned} points added!`);
  };

  const redeemPoints = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const points = prompt(`Enter points to redeem (Available: ${customer.loyalty_points}):`);
    if (!points) return;

    const redeemPoints = parseInt(points);
    if (isNaN(redeemPoints) || redeemPoints <= 0 || redeemPoints > customer.loyalty_points) {
      alert('Invalid points amount');
      return;
    }

    const discountValue = redeemPoints * pesosPerPoint;

    const transaction: LoyaltyTransaction = {
      id: Date.now(),
      customer_id: customerId,
      type: 'redeem',
      points: redeemPoints,
      description: `Redeemed for ₱${discountValue.toFixed(2)} discount`,
      created_at: new Date().toISOString(),
    };

    const updated = customers.map(c =>
      c.id === customerId
        ? {
            ...c,
            loyalty_points: c.loyalty_points - redeemPoints,
            transactions: [...c.transactions, transaction],
          }
        : c
    );

    setCustomers(updated);
    saveLoyaltyData(updated);
    alert(`${redeemPoints} points redeemed for ₱${discountValue.toFixed(2)} discount!`);
  };

  const saveSettings = () => {
    localStorage.setItem('loyalty_settings', JSON.stringify({
      pointsPerPeso,
      pesosPerPoint,
    }));
    alert('Settings saved!');
  };

  const totalPoints = customers.reduce((sum, c) => sum + c.loyalty_points, 0);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Loyalty Points System</h2>

      {/* Settings Card */}
      <div className="card bg-blue-50">
        <h3 className="font-semibold mb-4">Loyalty Program Settings</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Points per ₱1 Spent</label>
            <input
              type="number"
              value={pointsPerPeso}
              onChange={(e) => setPointsPerPeso(parseFloat(e.target.value))}
              className="input"
              min="0"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">₱ Value per Point</label>
            <input
              type="number"
              value={pesosPerPoint}
              onChange={(e) => setPesosPerPoint(parseFloat(e.target.value))}
              className="input"
              min="0"
              step="0.01"
            />
          </div>
        </div>
        <button onClick={saveSettings} className="btn btn-primary">
          Save Settings
        </button>
      </div>

      {/* Summary */}
      <div className="card">
        <h3 className="text-sm text-gray-600 mb-2">Total Points in Circulation</h3>
        <p className="text-3xl font-bold text-accent">{totalPoints.toLocaleString()} points</p>
        <p className="text-sm text-gray-600 mt-1">
          Value: ₱{(totalPoints * pesosPerPoint).toFixed(2)}
        </p>
      </div>

      {/* Customers Table */}
      <div className="card overflow-x-auto">
        <h3 className="font-semibold mb-4">Customer Loyalty Points</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3">Customer</th>
              <th className="text-left py-3">Email</th>
              <th className="text-right py-3">Points</th>
              <th className="text-right py-3">Value</th>
              <th className="text-center py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b hover:bg-gray-50">
                <td className="py-3">{customer.name}</td>
                <td className="py-3">{customer.email || '-'}</td>
                <td className="py-3 text-right font-semibold text-accent">
                  {customer.loyalty_points.toLocaleString()}
                </td>
                <td className="py-3 text-right">
                  ₱{(customer.loyalty_points * pesosPerPoint).toFixed(2)}
                </td>
                <td className="py-3 text-center">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => addPoints(customer.id)}
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      + Add
                    </button>
                    {customer.loyalty_points > 0 && (
                      <button
                        onClick={() => redeemPoints(customer.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        🎁 Redeem
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedCustomer(customer)}
                      className="text-gray-600 hover:text-gray-800 text-sm"
                    >
                      📋 History
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && (
          <div className="text-center py-12 text-gray-500">No customers yet.</div>
        )}
      </div>

      {/* Transaction History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">
              {selectedCustomer.name} - Loyalty History
            </h2>

            <div className="mb-6">
              <p className="text-lg">
                Current Balance: <span className="font-bold text-accent">{selectedCustomer.loyalty_points} points</span>
              </p>
              <p className="text-sm text-gray-600">
                Value: ₱{(selectedCustomer.loyalty_points * pesosPerPoint).toFixed(2)}
              </p>
            </div>

            {selectedCustomer.transactions.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">Type</th>
                      <th className="text-right py-2">Points</th>
                      <th className="text-left py-2">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCustomer.transactions.map((txn) => (
                      <tr key={txn.id} className="border-b">
                        <td className="py-2">{new Date(txn.created_at).toLocaleDateString()}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            txn.type === 'earn' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {txn.type}
                          </span>
                        </td>
                        <td className={`py-2 text-right font-semibold ${
                          txn.type === 'earn' ? 'text-green-600' : 'text-blue-600'
                        }`}>
                          {txn.type === 'earn' ? '+' : '-'}{txn.points}
                        </td>
                        <td className="py-2">{txn.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No transactions yet.</p>
            )}

            <button
              onClick={() => setSelectedCustomer(null)}
              className="w-full btn btn-secondary mt-6"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
