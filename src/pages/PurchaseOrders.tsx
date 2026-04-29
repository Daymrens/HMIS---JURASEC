import { useState, useEffect } from 'react';
import { Supplier, Product } from '../types';

interface PurchaseOrder {
  id: number;
  supplier_id: number;
  supplier_name?: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  items?: any[];
  total?: number;
}

export default function PurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<number | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [suppliersData, productsData] = await Promise.all([
        window.electronAPI.getSuppliers(),
        window.electronAPI.getProducts(),
      ]);
      setSuppliers(suppliersData);
      setProducts(productsData);
      // Load POs from localStorage for now
      const savedPOs = localStorage.getItem('purchase_orders');
      if (savedPOs) {
        setOrders(JSON.parse(savedPOs));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = orderItems.find(i => i.product_id === productId);
    if (existing) {
      setOrderItems(orderItems.map(i =>
        i.product_id === productId
          ? { ...i, qty: i.qty + 1, total: (i.qty + 1) * i.unit_cost }
          : i
      ));
    } else {
      setOrderItems([...orderItems, {
        product_id: product.id,
        name: product.name,
        sku: product.sku,
        qty: 1,
        unit_cost: product.cost_price,
        total: product.cost_price,
      }]);
    }
  };

  const updateQty = (productId: number, qty: number) => {
    setOrderItems(orderItems.map(i =>
      i.product_id === productId
        ? { ...i, qty, total: qty * i.unit_cost }
        : i
    ));
  };

  const removeItem = (productId: number) => {
    setOrderItems(orderItems.filter(i => i.product_id !== productId));
  };

  const createPO = () => {
    if (!selectedSupplier || orderItems.length === 0) {
      alert('Please select supplier and add items');
      return;
    }

    const supplier = suppliers.find(s => s.id === selectedSupplier);
    const total = orderItems.reduce((sum, item) => sum + item.total, 0);
    
    const newPO = {
      id: Date.now(),
      supplier_id: selectedSupplier,
      supplier_name: supplier?.name,
      status: 'pending' as const,
      created_at: new Date().toISOString(),
      items: orderItems,
      total,
    };

    const updatedOrders = [...orders, newPO];
    setOrders(updatedOrders);
    localStorage.setItem('purchase_orders', JSON.stringify(updatedOrders));

    setShowForm(false);
    setSelectedSupplier(null);
    setOrderItems([]);
  };

  const updateStatus = (id: number, status: 'pending' | 'completed' | 'cancelled') => {
    const updatedOrders = orders.map(o => o.id === id ? { ...o, status } : o);
    setOrders(updatedOrders);
    localStorage.setItem('purchase_orders', JSON.stringify(updatedOrders));

    // If completed, update stock
    if (status === 'completed') {
      const order = orders.find(o => o.id === id);
      if (order?.items) {
        order.items.forEach(async (item) => {
          const product = products.find(p => p.id === item.product_id);
          if (product) {
            await window.electronAPI.updateProduct(product.id, {
              ...product,
              stock_qty: product.stock_qty + item.qty,
            });
          }
        });
        loadData();
      }
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Purchase Orders</h2>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          + Create Purchase Order
        </button>
      </div>

      {/* Orders List */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3">PO #</th>
              <th className="text-left py-3">Supplier</th>
              <th className="text-left py-3">Date</th>
              <th className="text-right py-3">Total</th>
              <th className="text-center py-3">Status</th>
              <th className="text-center py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="py-3">PO-{order.id}</td>
                <td className="py-3">{order.supplier_name}</td>
                <td className="py-3">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="py-3 text-right font-semibold">₱{order.total?.toFixed(2)}</td>
                <td className="py-3 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    order.status === 'completed' ? 'bg-green-100 text-green-700' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-3 text-center">
                  {order.status === 'pending' && (
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => updateStatus(order.id, 'completed')}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        ✓ Receive
                      </button>
                      <button
                        onClick={() => updateStatus(order.id, 'cancelled')}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        ✕ Cancel
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="text-center py-12 text-gray-500">No purchase orders yet.</div>
        )}
      </div>

      {/* Create PO Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Create Purchase Order</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Supplier *</label>
              <select
                value={selectedSupplier || ''}
                onChange={(e) => setSelectedSupplier(Number(e.target.value))}
                className="input"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
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
                    {product.name} - ₱{product.cost_price}
                  </option>
                ))}
              </select>
            </div>

            {/* Order Items */}
            {orderItems.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Order Items</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Product</th>
                      <th className="text-center py-2">Quantity</th>
                      <th className="text-right py-2">Unit Cost</th>
                      <th className="text-right py-2">Total</th>
                      <th className="text-center py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item) => (
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
                        <td className="py-2 text-right">₱{item.unit_cost.toFixed(2)}</td>
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
                    <tr className="font-bold">
                      <td colSpan={3} className="py-2 text-right">TOTAL:</td>
                      <td className="py-2 text-right text-accent">
                        ₱{orderItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedSupplier(null);
                  setOrderItems([]);
                }}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button onClick={createPO} className="flex-1 btn btn-primary">
                Create Purchase Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
