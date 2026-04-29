import { useState, useEffect } from 'react';
import { Customer, Product } from '../types';

interface Quotation {
  id: number;
  customer_id: number | null;
  customer_name: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  valid_until: string;
  created_at: string;
  items: any[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
}

export default function Quotations() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [quoteItems, setQuoteItems] = useState<any[]>([]);

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
      const saved = localStorage.getItem('quotations');
      if (saved) setQuotations(JSON.parse(saved));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = quoteItems.find(i => i.product_id === productId);
    if (existing) {
      setQuoteItems(quoteItems.map(i =>
        i.product_id === productId
          ? { ...i, qty: i.qty + 1, total: (i.qty + 1) * i.price }
          : i
      ));
    } else {
      setQuoteItems([...quoteItems, {
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
    setQuoteItems(quoteItems.map(i =>
      i.product_id === productId ? { ...i, qty, total: qty * i.price } : i
    ));
  };

  const removeItem = (productId: number) => {
    setQuoteItems(quoteItems.filter(i => i.product_id !== productId));
  };

  const createQuotation = () => {
    if ((!selectedCustomer && !customerName) || quoteItems.length === 0 || !validUntil) {
      alert('Please fill all required fields and add items');
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomer);
    const subtotal = quoteItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.12;
    const total = subtotal + tax;

    const newQuote: Quotation = {
      id: Date.now(),
      customer_id: selectedCustomer,
      customer_name: customer?.name || customerName,
      status: 'draft',
      valid_until: validUntil,
      created_at: new Date().toISOString(),
      items: quoteItems,
      subtotal,
      tax,
      total,
      notes,
    };

    const updated = [...quotations, newQuote];
    setQuotations(updated);
    localStorage.setItem('quotations', JSON.stringify(updated));

    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setSelectedCustomer(null);
    setCustomerName('');
    setValidUntil('');
    setNotes('');
    setQuoteItems([]);
  };

  const updateStatus = (id: number, status: Quotation['status']) => {
    const updated = quotations.map(q => q.id === id ? { ...q, status } : q);
    setQuotations(updated);
    localStorage.setItem('quotations', JSON.stringify(updated));
  };

  const printQuotation = (quote: Quotation) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Quotation #${quote.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { text-align: right; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Jurasec Enterprises</h1>
            <h2>QUOTATION</h2>
            <p>Quote #: ${quote.id}</p>
          </div>
          <div class="info">
            <p><strong>Customer:</strong> ${quote.customer_name}</p>
            <p><strong>Date:</strong> ${new Date(quote.created_at).toLocaleDateString()}</p>
            <p><strong>Valid Until:</strong> ${new Date(quote.valid_until).toLocaleDateString()}</p>
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
              ${quote.items.map(item => `
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
            <p>Subtotal: ₱${quote.subtotal.toFixed(2)}</p>
            <p>Tax (12%): ₱${quote.tax.toFixed(2)}</p>
            <p style="font-size: 1.2em;">TOTAL: ₱${quote.total.toFixed(2)}</p>
          </div>
          ${quote.notes ? `<p><strong>Notes:</strong> ${quote.notes}</p>` : ''}
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
        <h2 className="text-2xl font-bold">Quotations</h2>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          + Create Quotation
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3">Quote #</th>
              <th className="text-left py-3">Customer</th>
              <th className="text-left py-3">Date</th>
              <th className="text-left py-3">Valid Until</th>
              <th className="text-right py-3">Total</th>
              <th className="text-center py-3">Status</th>
              <th className="text-center py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((quote) => (
              <tr key={quote.id} className="border-b hover:bg-gray-50">
                <td className="py-3">Q-{quote.id}</td>
                <td className="py-3">{quote.customer_name}</td>
                <td className="py-3">{new Date(quote.created_at).toLocaleDateString()}</td>
                <td className="py-3">{new Date(quote.valid_until).toLocaleDateString()}</td>
                <td className="py-3 text-right font-semibold">₱{quote.total.toFixed(2)}</td>
                <td className="py-3 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    quote.status === 'accepted' ? 'bg-green-100 text-green-700' :
                    quote.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    quote.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {quote.status}
                  </span>
                </td>
                <td className="py-3 text-center">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => printQuotation(quote)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      🖨️ Print
                    </button>
                    {quote.status === 'draft' && (
                      <button
                        onClick={() => updateStatus(quote.id, 'sent')}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        ✓ Send
                      </button>
                    )}
                    {quote.status === 'sent' && (
                      <>
                        <button
                          onClick={() => updateStatus(quote.id, 'accepted')}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => updateStatus(quote.id, 'rejected')}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {quotations.length === 0 && (
          <div className="text-center py-12 text-gray-500">No quotations yet.</div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Create Quotation</h2>

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
              <label className="block text-sm font-medium mb-2">Valid Until *</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
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

            {quoteItems.length > 0 && (
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
                    {quoteItems.map((item) => (
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
                  <p>Subtotal: ₱{quoteItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</p>
                  <p>Tax (12%): ₱{(quoteItems.reduce((sum, item) => sum + item.total, 0) * 0.12).toFixed(2)}</p>
                  <p className="text-lg font-bold text-accent">
                    Total: ₱{(quoteItems.reduce((sum, item) => sum + item.total, 0) * 1.12).toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input"
                rows={3}
                placeholder="Additional notes or terms..."
              />
            </div>

            <div className="flex gap-3">
              <button onClick={resetForm} className="flex-1 btn btn-secondary">
                Cancel
              </button>
              <button onClick={createQuotation} className="flex-1 btn btn-primary">
                Create Quotation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
