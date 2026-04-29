import { useState, useEffect } from 'react';
import { Customer, Product } from '../types';

interface Invoice {
  id: number;
  customer_id: number | null;
  customer_name: string;
  status: 'unpaid' | 'paid' | 'overdue';
  due_date: string;
  created_at: string;
  items: any[];
  subtotal: number;
  tax: number;
  total: number;
  paid_amount: number;
}

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);

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
      const saved = localStorage.getItem('invoices');
      if (saved) setInvoices(JSON.parse(saved));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = invoiceItems.find(i => i.product_id === productId);
    if (existing) {
      setInvoiceItems(invoiceItems.map(i =>
        i.product_id === productId
          ? { ...i, qty: i.qty + 1, total: (i.qty + 1) * i.price }
          : i
      ));
    } else {
      setInvoiceItems([...invoiceItems, {
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
    setInvoiceItems(invoiceItems.map(i =>
      i.product_id === productId ? { ...i, qty, total: qty * i.price } : i
    ));
  };

  const removeItem = (productId: number) => {
    setInvoiceItems(invoiceItems.filter(i => i.product_id !== productId));
  };

  const createInvoice = () => {
    if ((!selectedCustomer && !customerName) || invoiceItems.length === 0 || !dueDate) {
      alert('Please fill all required fields and add items');
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomer);
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.12;
    const total = subtotal + tax;

    const newInvoice: Invoice = {
      id: Date.now(),
      customer_id: selectedCustomer,
      customer_name: customer?.name || customerName,
      status: 'unpaid',
      due_date: dueDate,
      created_at: new Date().toISOString(),
      items: invoiceItems,
      subtotal,
      tax,
      total,
      paid_amount: 0,
    };

    const updated = [...invoices, newInvoice];
    setInvoices(updated);
    localStorage.setItem('invoices', JSON.stringify(updated));

    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setSelectedCustomer(null);
    setCustomerName('');
    setDueDate('');
    setInvoiceItems([]);
  };

  const recordPayment = (id: number) => {
    const invoice = invoices.find(inv => inv.id === id);
    if (!invoice) return;

    const amount = prompt(`Enter payment amount (Balance: ₱${(invoice.total - invoice.paid_amount).toFixed(2)}):`);
    if (!amount) return;

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      alert('Invalid amount');
      return;
    }

    const newPaidAmount = invoice.paid_amount + paymentAmount;
    const newStatus = newPaidAmount >= invoice.total ? 'paid' : 'unpaid';

    const updated = invoices.map(inv =>
      inv.id === id ? { ...inv, paid_amount: newPaidAmount, status: newStatus } : inv
    );
    setInvoices(updated);
    localStorage.setItem('invoices', JSON.stringify(updated));
  };

  const printInvoice = (invoice: Invoice) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${invoice.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { text-align: right; font-weight: bold; }
            .status { display: inline-block; padding: 5px 10px; border-radius: 5px; }
            .unpaid { background-color: #fee; color: #c00; }
            .paid { background-color: #efe; color: #0a0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Jurasec Enterprises</h1>
            <h2>INVOICE</h2>
            <p>Invoice #: ${invoice.id}</p>
          </div>
          <div class="info">
            <p><strong>Bill To:</strong> ${invoice.customer_name}</p>
            <p><strong>Invoice Date:</strong> ${new Date(invoice.created_at).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span class="status ${invoice.status}">${invoice.status.toUpperCase()}</span></p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>SKU</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.sku}</td>
                  <td>${item.qty}</td>
                  <td>₱${item.price.toFixed(2)}</td>
                  <td>₱${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            <p>Subtotal: ₱${invoice.subtotal.toFixed(2)}</p>
            <p>Tax (12%): ₱${invoice.tax.toFixed(2)}</p>
            <p style="font-size: 1.2em;">TOTAL: ₱${invoice.total.toFixed(2)}</p>
            <p>Paid: ₱${invoice.paid_amount.toFixed(2)}</p>
            <p style="font-size: 1.2em; color: ${invoice.status === 'paid' ? 'green' : 'red'};">
              Balance Due: ₱${(invoice.total - invoice.paid_amount).toFixed(2)}
            </p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Invoices</h2>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          + Create Invoice
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3">Invoice #</th>
              <th className="text-left py-3">Customer</th>
              <th className="text-left py-3">Date</th>
              <th className="text-left py-3">Due Date</th>
              <th className="text-right py-3">Total</th>
              <th className="text-right py-3">Paid</th>
              <th className="text-right py-3">Balance</th>
              <th className="text-center py-3">Status</th>
              <th className="text-center py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="border-b hover:bg-gray-50">
                <td className="py-3">INV-{invoice.id}</td>
                <td className="py-3">{invoice.customer_name}</td>
                <td className="py-3">{new Date(invoice.created_at).toLocaleDateString()}</td>
                <td className="py-3">{new Date(invoice.due_date).toLocaleDateString()}</td>
                <td className="py-3 text-right font-semibold">₱{invoice.total.toFixed(2)}</td>
                <td className="py-3 text-right">₱{invoice.paid_amount.toFixed(2)}</td>
                <td className="py-3 text-right font-semibold text-red-600">
                  ₱{(invoice.total - invoice.paid_amount).toFixed(2)}
                </td>
                <td className="py-3 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                    invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="py-3 text-center">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => printInvoice(invoice)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      🖨️ Print
                    </button>
                    {invoice.status !== 'paid' && (
                      <button
                        onClick={() => recordPayment(invoice.id)}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        💰 Pay
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices.length === 0 && (
          <div className="text-center py-12 text-gray-500">No invoices yet.</div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Create Invoice</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Existing Customer</label>
                <select
                  value={selectedCustomer || ''}
                  onChange={(e) => {
                    setSelectedCustomer(Number(e.target.value) || null);
                    setCustomerName('');
                  }}
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
              <div>
                <label className="block text-sm font-medium mb-2">Or Enter Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    setSelectedCustomer(null);
                  }}
                  className="input"
                  placeholder="Customer name"
                  disabled={!!selectedCustomer}
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Due Date *</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input"
                min={new Date().toISOString().split('T')[0]}
              />
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

            {invoiceItems.length > 0 && (
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
                    {invoiceItems.map((item) => (
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
                <div className="mt-4 text-right space-y-1">
                  <p>Subtotal: ₱{invoiceItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</p>
                  <p>Tax (12%): ₱{(invoiceItems.reduce((sum, item) => sum + item.total, 0) * 0.12).toFixed(2)}</p>
                  <p className="text-lg font-bold text-accent">
                    Total: ₱{(invoiceItems.reduce((sum, item) => sum + item.total, 0) * 1.12).toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={resetForm} className="flex-1 btn btn-secondary">
                Cancel
              </button>
              <button onClick={createInvoice} className="flex-1 btn btn-primary">
                Create Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
