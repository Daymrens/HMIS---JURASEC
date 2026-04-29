import { useState, useEffect } from 'react';
import { Customer } from '../types';
import PurchaseHistory from '../components/customers/PurchaseHistory';
import CreditSales from '../components/customers/CreditSales';
import LoyaltyPoints from '../components/customers/LoyaltyPoints';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'credit' | 'loyalty'>('list');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await window.electronAPI.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await window.electronAPI.updateCustomer(editingCustomer.id, formData);
      } else {
        await window.electronAPI.createCustomer(formData);
      }
      setShowForm(false);
      setEditingCustomer(null);
      setFormData({ name: '', phone: '', address: '' });
      loadCustomers();
    } catch (error: any) {
      alert(`Failed to save customer: ${error.message}`);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone || '',
      address: customer.address || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      await window.electronAPI.deleteCustomer(id);
      loadCustomers();
    } catch (error: any) {
      alert(`Failed to delete customer: ${error.message}`);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customers</h2>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          + Add Customer
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'list'
              ? 'border-b-2 border-accent text-accent'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Customer List
        </button>
        <button
          onClick={() => setActiveTab('credit')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'credit'
              ? 'border-b-2 border-accent text-accent'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Credit Sales
        </button>
        <button
          onClick={() => setActiveTab('loyalty')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'loyalty'
              ? 'border-b-2 border-accent text-accent'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Loyalty Points
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'list' && (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3">Name</th>
                <th className="text-left py-3">Phone</th>
                <th className="text-left py-3">Address</th>
                <th className="text-left py-3">Registered</th>
                <th className="text-center py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium">{customer.name}</td>
                  <td className="py-3">{customer.phone || '-'}</td>
                  <td className="py-3">{customer.address || '-'}</td>
                <td className="py-3">{new Date(customer.created_at).toLocaleDateString()}</td>
                <td className="py-3">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setShowHistory(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      title="Purchase History"
                    >
                      📊
                    </button>
                    <button
                      onClick={() => handleEdit(customer)}
                      className="text-green-600 hover:text-green-800"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️
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
      )}

      {activeTab === 'credit' && <CreditSales />}
      {activeTab === 'loyalty' && <LoyaltyPoints />}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">
              {editingCustomer ? 'Edit Customer' : 'Add Customer'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCustomer(null);
                    setFormData({ name: '', phone: '', address: '' });
                  }}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn btn-primary">
                  {editingCustomer ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purchase History Modal */}
      {showHistory && selectedCustomer && (
        <PurchaseHistory
          customerId={selectedCustomer.id}
          customerName={selectedCustomer.name}
          onClose={() => {
            setShowHistory(false);
            setSelectedCustomer(null);
          }}
        />
      )}
    </div>
  );
}
