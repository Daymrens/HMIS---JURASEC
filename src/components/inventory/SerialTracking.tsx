import { useState, useEffect } from 'react';
import { Product } from '../../types';

interface SerialItem {
  id: number;
  product_id: number;
  product_name: string;
  sku: string;
  serial_number: string;
  status: 'in_stock' | 'sold' | 'returned' | 'warranty';
  purchase_date?: string;
  sold_date?: string;
  customer_name?: string;
  warranty_until?: string;
  notes?: string;
  created_at: string;
}

export default function SerialTracking() {
  const [serialItems, setSerialItems] = useState<SerialItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [formData, setFormData] = useState({
    product_id: '',
    serial_number: '',
    purchase_date: '',
    warranty_until: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const productsData = await window.electronAPI.getProducts();
      setProducts(productsData);
      const saved = localStorage.getItem('serial_items');
      if (saved) setSerialItems(JSON.parse(saved));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSerialItem = () => {
    if (!formData.product_id || !formData.serial_number) {
      alert('Please fill all required fields');
      return;
    }

    // Check for duplicate serial number
    if (serialItems.some((item) => item.serial_number === formData.serial_number)) {
      alert('Serial number already exists!');
      return;
    }

    const product = products.find((p) => p.id === parseInt(formData.product_id));
    if (!product) return;

    const newItem: SerialItem = {
      id: Date.now(),
      product_id: parseInt(formData.product_id),
      product_name: product.name,
      sku: product.sku,
      serial_number: formData.serial_number,
      status: 'in_stock',
      purchase_date: formData.purchase_date || undefined,
      warranty_until: formData.warranty_until || undefined,
      notes: formData.notes || undefined,
      created_at: new Date().toISOString(),
    };

    const updated = [...serialItems, newItem];
    setSerialItems(updated);
    localStorage.setItem('serial_items', JSON.stringify(updated));

    resetForm();
    alert('Serial item added successfully!');
  };

  const updateStatus = (id: number, status: SerialItem['status'], customerName?: string) => {
    const updated = serialItems.map((item) =>
      item.id === id
        ? {
            ...item,
            status,
            sold_date: status === 'sold' ? new Date().toISOString() : item.sold_date,
            customer_name: customerName || item.customer_name,
          }
        : item
    );
    setSerialItems(updated);
    localStorage.setItem('serial_items', JSON.stringify(updated));
  };

  const markAsSold = (id: number) => {
    const customerName = prompt('Enter customer name:');
    if (!customerName) return;
    updateStatus(id, 'sold', customerName);
  };

  const resetForm = () => {
    setShowForm(false);
    setFormData({
      product_id: '',
      serial_number: '',
      purchase_date: '',
      warranty_until: '',
      notes: '',
    });
  };

  const filteredItems = serialItems.filter((item) => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.serial_number.toLowerCase().includes(query) ||
        item.product_name.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const exportToCSV = () => {
    const csv = [
      ['Serial Number', 'Product', 'SKU', 'Status', 'Purchase Date', 'Sold Date', 'Customer', 'Warranty Until'].join(','),
      ...filteredItems.map((item) =>
        [
          item.serial_number,
          item.product_name,
          item.sku,
          item.status,
          item.purchase_date || '',
          item.sold_date || '',
          item.customer_name || '',
          item.warranty_until || '',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `serial-tracking-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Serial Number Tracking</h3>
        <div className="flex gap-2">
          <button onClick={exportToCSV} className="btn btn-secondary">
            📥 Export
          </button>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            + Add Serial Item
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card bg-blue-50">
          <p className="text-sm text-gray-600">In Stock</p>
          <p className="text-2xl font-bold text-blue-600">
            {serialItems.filter((i) => i.status === 'in_stock').length}
          </p>
        </div>
        <div className="card bg-green-50">
          <p className="text-sm text-gray-600">Sold</p>
          <p className="text-2xl font-bold text-green-600">
            {serialItems.filter((i) => i.status === 'sold').length}
          </p>
        </div>
        <div className="card bg-yellow-50">
          <p className="text-sm text-gray-600">Under Warranty</p>
          <p className="text-2xl font-bold text-yellow-600">
            {serialItems.filter((i) => i.status === 'warranty').length}
          </p>
        </div>
        <div className="card bg-red-50">
          <p className="text-sm text-gray-600">Returned</p>
          <p className="text-2xl font-bold text-red-600">
            {serialItems.filter((i) => i.status === 'returned').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by serial, product, or SKU..."
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="in_stock">In Stock</option>
              <option value="sold">Sold</option>
              <option value="warranty">Under Warranty</option>
              <option value="returned">Returned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Serial Items Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3">Serial Number</th>
              <th className="text-left py-3">Product</th>
              <th className="text-left py-3">SKU</th>
              <th className="text-left py-3">Purchase Date</th>
              <th className="text-left py-3">Warranty Until</th>
              <th className="text-left py-3">Customer</th>
              <th className="text-center py-3">Status</th>
              <th className="text-center py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="py-3 font-mono font-semibold">{item.serial_number}</td>
                <td className="py-3">{item.product_name}</td>
                <td className="py-3">{item.sku}</td>
                <td className="py-3">
                  {item.purchase_date ? new Date(item.purchase_date).toLocaleDateString() : '-'}
                </td>
                <td className="py-3">
                  {item.warranty_until ? new Date(item.warranty_until).toLocaleDateString() : '-'}
                </td>
                <td className="py-3">{item.customer_name || '-'}</td>
                <td className="py-3 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.status === 'in_stock' ? 'bg-blue-100 text-blue-700' :
                    item.status === 'sold' ? 'bg-green-100 text-green-700' :
                    item.status === 'warranty' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 text-center">
                  {item.status === 'in_stock' && (
                    <button
                      onClick={() => markAsSold(item.id)}
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      Mark Sold
                    </button>
                  )}
                  {item.status === 'sold' && (
                    <button
                      onClick={() => updateStatus(item.id, 'warranty')}
                      className="text-yellow-600 hover:text-yellow-800 text-sm"
                    >
                      Warranty
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-gray-500">No serial items found.</div>
        )}
      </div>

      {/* Add Serial Item Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Add Serial Item</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Product *</label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="input"
                >
                  <option value="">Select Product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Serial Number *</label>
                <input
                  type="text"
                  value={formData.serial_number}
                  onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                  placeholder="e.g., SN123456789"
                  className="input font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Purchase Date</label>
                <input
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Warranty Until</label>
                <input
                  type="date"
                  value={formData.warranty_until}
                  onChange={(e) => setFormData({ ...formData, warranty_until: e.target.value })}
                  className="input"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={resetForm} className="flex-1 btn btn-secondary">
                Cancel
              </button>
              <button onClick={addSerialItem} className="flex-1 btn btn-primary">
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
