import { useState, useEffect } from 'react';
import { Customer, Product } from '../../types';

interface LayawayPlan {
  id: number;
  customer_id: number;
  customer_name: string;
  total_amount: number;
  down_payment: number;
  balance: number;
  installment_amount: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  next_payment_date: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  items: any[];
  payments: { date: string; amount: number }[];
}

export default function Layaway() {
  const [plans, setPlans] = useState<LayawayPlan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [downPayment, setDownPayment] = useState('');
  const [installmentAmount, setInstallmentAmount] = useState('');
  const [frequency, setFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('monthly');
  const [layawayItems, setLayawayItems] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [customersData, productsData] = await Promise.all([
        window.electronAPI.getCustomers(),
        window.electronAPI.getProducts(),
      ]);
      setCustomers(customersData);
      setProducts(productsData);
      const saved = localStorage.getItem('layaway_plans');
      if (saved) setPlans(JSON.parse(saved));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = layawayItems.find(i => i.product_id === productId);
    if (existing) {
      setLayawayItems(layawayItems.map(i =>
        i.product_id === productId
          ? { ...i, qty: i.qty + 1, total: (i.qty + 1) * i.price }
          : i
      ));
    } else {
      setLayawayItems([...layawayItems, {
        product_id: product.id,
        name: product.name,
        sku: product.sku,
        qty: 1,
        price: product.selling_price,
        total: product.selling_price,
      }]);
    }
  };

  const updateQty = (productId: number, qty: number) => {
    setLayawayItems(layawayItems.map(i =>
      i.product_id === productId ? { ...i, qty, total: qty * i.price } : i
    ));
  };

  const removeItem = (productId: number) => {
    setLayawayItems(layawayItems.filter(i => i.product_id !== productId));
  };

  const calculateNextPaymentDate = (freq: string) => {
    const today = new Date();
    switch (freq) {
      case 'weekly':
        today.setDate(today.getDate() + 7);
        break;
      case 'biweekly':
        today.setDate(today.getDate() + 14);
        break;
      case 'monthly':
        today.setMonth(today.getMonth() + 1);
        break;
    }
    return today.toISOString();
  };

  const createPlan = () => {
    if (!selectedCustomer || layawayItems.length === 0 || !downPayment || !installmentAmount) {
      alert('Please fill all required fields');
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomer);
    const totalAmount = layawayItems.reduce((sum, item) => sum + item.total, 0);
    const downPmt = parseFloat(downPayment);
    const installment = parseFloat(installmentAmount);

    if (downPmt >= totalAmount) {
      alert('Down payment must be less than total amount');
      return;
    }

    const newPlan: LayawayPlan = {
      id: Date.now(),
      customer_id: selectedCustomer,
      customer_name: customer?.name || '',
      total_amount: totalAmount,
      down_payment: downPmt,
      balance: totalAmount - downPmt,
      installment_amount: installment,
      frequency,
      next_payment_date: calculateNextPaymentDate(frequency),
      status: 'active',
      created_at: new Date().toISOString(),
      items: layawayItems,
      payments: [{ date: new Date().toISOString(), amount: downPmt }],
    };

    const updated = [...plans, newPlan];
    setPlans(updated);
    localStorage.setItem('layaway_plans', JSON.stringify(updated));

    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setSelectedCustomer(null);
    setDownPayment('');
    setInstallmentAmount('');
    setFrequency('monthly');
    setLayawayItems([]);
  };

  const recordPayment = (planId: number) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    const amount = prompt(`Enter payment amount (Balance: ₱${plan.balance.toFixed(2)}, Suggested: ₱${plan.installment_amount.toFixed(2)}):`);
    if (!amount) return;

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0 || paymentAmount > plan.balance) {
      alert('Invalid amount');
      return;
    }

    const newBalance = plan.balance - paymentAmount;
    const newStatus = newBalance === 0 ? 'completed' : 'active';
    const newPayment = { date: new Date().toISOString(), amount: paymentAmount };

    const updated = plans.map(p =>
      p.id === planId
        ? {
            ...p,
            balance: newBalance,
            status: newStatus,
            next_payment_date: newStatus === 'active' ? calculateNextPaymentDate(p.frequency) : p.next_payment_date,
            payments: [...p.payments, newPayment]
          }
        : p
    );

    setPlans(updated);
    localStorage.setItem('layaway_plans', JSON.stringify(updated));

    if (newStatus === 'completed') {
      alert('Layaway plan completed! Customer can now collect items.');
    }
  };

  const cancelPlan = (planId: number) => {
    if (!confirm('Are you sure you want to cancel this layaway plan?')) return;

    const updated = plans.map(p =>
      p.id === planId ? { ...p, status: 'cancelled' as const } : p
    );
    setPlans(updated);
    localStorage.setItem('layaway_plans', JSON.stringify(updated));
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Layaway / Installment Plans</h2>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          + Create Layaway Plan
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3">Plan #</th>
              <th className="text-left py-3">Customer</th>
              <th className="text-right py-3">Total</th>
              <th className="text-right py-3">Balance</th>
              <th className="text-right py-3">Installment</th>
              <th className="text-left py-3">Next Payment</th>
              <th className="text-center py-3">Status</th>
              <th className="text-center py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.id} className="border-b hover:bg-gray-50">
                <td className="py-3">LAY-{plan.id}</td>
                <td className="py-3">{plan.customer_name}</td>
                <td className="py-3 text-right">₱{plan.total_amount.toFixed(2)}</td>
                <td className="py-3 text-right font-semibold text-red-600">
                  ₱{plan.balance.toFixed(2)}
                </td>
                <td className="py-3 text-right">
                  ₱{plan.installment_amount.toFixed(2)} / {plan.frequency}
                </td>
                <td className="py-3">
                  {plan.status === 'active' ? new Date(plan.next_payment_date).toLocaleDateString() : '-'}
                </td>
                <td className="py-3 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    plan.status === 'completed' ? 'bg-green-100 text-green-700' :
                    plan.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {plan.status}
                  </span>
                </td>
                <td className="py-3 text-center">
                  <div className="flex gap-2 justify-center">
                    {plan.status === 'active' && (
                      <>
                        <button
                          onClick={() => recordPayment(plan.id)}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          💰 Pay
                        </button>
                        <button
                          onClick={() => cancelPlan(plan.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          ✕ Cancel
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {plans.length === 0 && (
          <div className="text-center py-12 text-gray-500">No layaway plans yet.</div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Create Layaway Plan</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Customer *</label>
              <select
                value={selectedCustomer || ''}
                onChange={(e) => setSelectedCustomer(Number(e.target.value))}
                className="input"
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Add Products</label>
              <select
                onChange={(e) => {
                  addItem(Number(e.target.value));
                  e.target.value = '';
                }}
                className="input"
              >
                <option value="">Select Product to Add</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ₱{product.selling_price}
                  </option>
                ))}
              </select>
            </div>

            {layawayItems.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Items</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Product</th>
                      <th className="text-center py-2">Qty</th>
                      <th className="text-right py-2">Price</th>
                      <th className="text-right py-2">Total</th>
                      <th className="text-center py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {layawayItems.map((item) => (
                      <tr key={item.product_id} className="border-b">
                        <td className="py-2">{item.name}</td>
                        <td className="py-2 text-center">
                          <input
                            type="number"
                            value={item.qty}
                            onChange={(e) => updateQty(item.product_id, Number(e.target.value))}
                            className="w-20 text-center border rounded px-2 py-1"
                            min="1"
                          />
                        </td>
                        <td className="py-2 text-right">₱{item.price.toFixed(2)}</td>
                        <td className="py-2 text-right font-semibold">₱{item.total.toFixed(2)}</td>
                        <td className="py-2 text-center">
                          <button
                            onClick={() => removeItem(item.product_id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 text-right">
                  <p className="text-lg font-bold text-accent">
                    Total: ₱{layawayItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Down Payment *</label>
                <input
                  type="number"
                  value={downPayment}
                  onChange={(e) => setDownPayment(e.target.value)}
                  className="input"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Installment Amount *</label>
                <input
                  type="number"
                  value={installmentAmount}
                  onChange={(e) => setInstallmentAmount(e.target.value)}
                  className="input"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Frequency *</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="input"
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={resetForm} className="flex-1 btn btn-secondary">
                Cancel
              </button>
              <button onClick={createPlan} className="flex-1 btn btn-primary">
                Create Layaway Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
