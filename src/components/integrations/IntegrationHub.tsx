import { useState, useEffect } from 'react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'accounting' | 'ecommerce' | 'payment' | 'shipping';
  icon: string;
  status: 'connected' | 'disconnected' | 'pending';
  config?: any;
}

const availableIntegrations: Integration[] = [
  // Accounting
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Sync sales and expenses with QuickBooks Online',
    category: 'accounting',
    icon: '📊',
    status: 'disconnected',
  },
  {
    id: 'xero',
    name: 'Xero',
    description: 'Connect with Xero accounting software',
    category: 'accounting',
    icon: '📈',
    status: 'disconnected',
  },
  
  // E-commerce
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Sync inventory and orders with Shopify store',
    category: 'ecommerce',
    icon: '🛍️',
    status: 'disconnected',
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    description: 'Connect with WordPress WooCommerce',
    category: 'ecommerce',
    icon: '🛒',
    status: 'disconnected',
  },
  {
    id: 'lazada',
    name: 'Lazada',
    description: 'Sync with Lazada marketplace',
    category: 'ecommerce',
    icon: '🏪',
    status: 'disconnected',
  },
  
  // Payment Gateways
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Accept PayPal payments',
    category: 'payment',
    icon: '💳',
    status: 'disconnected',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Process credit card payments with Stripe',
    category: 'payment',
    icon: '💰',
    status: 'disconnected',
  },
  {
    id: 'paymaya',
    name: 'PayMaya',
    description: 'Accept PayMaya digital payments',
    category: 'payment',
    icon: '📱',
    status: 'disconnected',
  },
  {
    id: 'gcash',
    name: 'GCash',
    description: 'Accept GCash mobile payments',
    category: 'payment',
    icon: '💵',
    status: 'disconnected',
  },
  
  // Shipping
  {
    id: 'lbc',
    name: 'LBC Express',
    description: 'Track deliveries with LBC',
    category: 'shipping',
    icon: '📦',
    status: 'disconnected',
  },
  {
    id: 'jnt',
    name: 'J&T Express',
    description: 'Integrate with J&T shipping',
    category: 'shipping',
    icon: '🚚',
    status: 'disconnected',
  },
  {
    id: 'ninjavan',
    name: 'Ninja Van',
    description: 'Connect with Ninja Van logistics',
    category: 'shipping',
    icon: '🥷',
    status: 'disconnected',
  },
];

export default function IntegrationHub() {
  const [integrations, setIntegrations] = useState<Integration[]>(availableIntegrations);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [configForm, setConfigForm] = useState<any>({});

  useEffect(() => {
    const saved = localStorage.getItem('integrations');
    if (saved) {
      const savedIntegrations = JSON.parse(saved);
      setIntegrations(integrations.map(int => {
        const saved = savedIntegrations.find((s: Integration) => s.id === int.id);
        return saved || int;
      }));
    }
  }, []);

  const saveIntegrations = (updated: Integration[]) => {
    setIntegrations(updated);
    localStorage.setItem('integrations', JSON.stringify(updated));
  };

  const connectIntegration = (integration: Integration) => {
    setSelectedIntegration(integration);
    setShowConfigModal(true);
    
    // Set default config based on integration type
    switch (integration.category) {
      case 'accounting':
        setConfigForm({ apiKey: '', companyId: '', syncFrequency: 'daily' });
        break;
      case 'ecommerce':
        setConfigForm({ storeUrl: '', apiKey: '', apiSecret: '', syncInventory: true });
        break;
      case 'payment':
        setConfigForm({ apiKey: '', secretKey: '', webhookUrl: '', testMode: true });
        break;
      case 'shipping':
        setConfigForm({ apiKey: '', accountNumber: '', defaultService: 'standard' });
        break;
    }
  };

  const saveConfiguration = () => {
    if (!selectedIntegration) return;

    const updated = integrations.map(int =>
      int.id === selectedIntegration.id
        ? { ...int, status: 'connected' as const, config: configForm }
        : int
    );

    saveIntegrations(updated);
    setShowConfigModal(false);
    setSelectedIntegration(null);
    setConfigForm({});
    alert(`${selectedIntegration.name} connected successfully!`);
  };

  const disconnectIntegration = (id: string) => {
    if (!confirm('Disconnect this integration?')) return;

    const updated = integrations.map(int =>
      int.id === id ? { ...int, status: 'disconnected' as const, config: undefined } : int
    );

    saveIntegrations(updated);
  };

  const testConnection = () => {
    alert('Testing connection... (This would make an API call in production)');
  };

  const filteredIntegrations = selectedCategory === 'all'
    ? integrations
    : integrations.filter(int => int.category === selectedCategory);

  const connectedCount = integrations.filter(int => int.status === 'connected').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Integration Hub</h3>
          <p className="text-sm text-gray-600">
            {connectedCount} of {integrations.length} integrations connected
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg font-medium ${
            selectedCategory === 'all'
              ? 'bg-accent text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setSelectedCategory('accounting')}
          className={`px-4 py-2 rounded-lg font-medium ${
            selectedCategory === 'accounting'
              ? 'bg-accent text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          📊 Accounting
        </button>
        <button
          onClick={() => setSelectedCategory('ecommerce')}
          className={`px-4 py-2 rounded-lg font-medium ${
            selectedCategory === 'ecommerce'
              ? 'bg-accent text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          🛍️ E-commerce
        </button>
        <button
          onClick={() => setSelectedCategory('payment')}
          className={`px-4 py-2 rounded-lg font-medium ${
            selectedCategory === 'payment'
              ? 'bg-accent text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          💳 Payment
        </button>
        <button
          onClick={() => setSelectedCategory('shipping')}
          className={`px-4 py-2 rounded-lg font-medium ${
            selectedCategory === 'shipping'
              ? 'bg-accent text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          📦 Shipping
        </button>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredIntegrations.map((integration) => (
          <div
            key={integration.id}
            className={`card ${
              integration.status === 'connected'
                ? 'border-2 border-green-500 bg-green-50'
                : 'border-2 border-gray-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-4xl">{integration.icon}</span>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{integration.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{integration.description}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      integration.status === 'connected'
                        ? 'bg-green-100 text-green-700'
                        : integration.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {integration.status}
                  </span>
                </div>

                <div className="flex gap-2 mt-3">
                  {integration.status === 'disconnected' ? (
                    <button
                      onClick={() => connectIntegration(integration)}
                      className="text-sm btn btn-primary"
                    >
                      Connect
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => connectIntegration(integration)}
                        className="text-sm btn btn-secondary"
                      >
                        ⚙️ Configure
                      </button>
                      <button
                        onClick={() => disconnectIntegration(integration.id)}
                        className="text-sm btn btn-secondary"
                      >
                        Disconnect
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Configuration Modal */}
      {showConfigModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">
              Configure {selectedIntegration.name}
            </h2>

            <div className="space-y-4">
              {selectedIntegration.category === 'accounting' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">API Key *</label>
                    <input
                      type="text"
                      value={configForm.apiKey || ''}
                      onChange={(e) => setConfigForm({ ...configForm, apiKey: e.target.value })}
                      className="input"
                      placeholder="Enter API key"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Company ID</label>
                    <input
                      type="text"
                      value={configForm.companyId || ''}
                      onChange={(e) => setConfigForm({ ...configForm, companyId: e.target.value })}
                      className="input"
                      placeholder="Enter company ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Sync Frequency</label>
                    <select
                      value={configForm.syncFrequency || 'daily'}
                      onChange={(e) => setConfigForm({ ...configForm, syncFrequency: e.target.value })}
                      className="input"
                    >
                      <option value="realtime">Real-time</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </>
              )}

              {selectedIntegration.category === 'ecommerce' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Store URL *</label>
                    <input
                      type="url"
                      value={configForm.storeUrl || ''}
                      onChange={(e) => setConfigForm({ ...configForm, storeUrl: e.target.value })}
                      className="input"
                      placeholder="https://yourstore.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">API Key *</label>
                    <input
                      type="text"
                      value={configForm.apiKey || ''}
                      onChange={(e) => setConfigForm({ ...configForm, apiKey: e.target.value })}
                      className="input"
                      placeholder="Enter API key"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">API Secret *</label>
                    <input
                      type="password"
                      value={configForm.apiSecret || ''}
                      onChange={(e) => setConfigForm({ ...configForm, apiSecret: e.target.value })}
                      className="input"
                      placeholder="Enter API secret"
                    />
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={configForm.syncInventory || false}
                      onChange={(e) => setConfigForm({ ...configForm, syncInventory: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span>Sync inventory automatically</span>
                  </label>
                </>
              )}

              {selectedIntegration.category === 'payment' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">API Key *</label>
                    <input
                      type="text"
                      value={configForm.apiKey || ''}
                      onChange={(e) => setConfigForm({ ...configForm, apiKey: e.target.value })}
                      className="input"
                      placeholder="Enter API key"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Secret Key *</label>
                    <input
                      type="password"
                      value={configForm.secretKey || ''}
                      onChange={(e) => setConfigForm({ ...configForm, secretKey: e.target.value })}
                      className="input"
                      placeholder="Enter secret key"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Webhook URL</label>
                    <input
                      type="url"
                      value={configForm.webhookUrl || ''}
                      onChange={(e) => setConfigForm({ ...configForm, webhookUrl: e.target.value })}
                      className="input"
                      placeholder="https://yoursite.com/webhook"
                    />
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={configForm.testMode || false}
                      onChange={(e) => setConfigForm({ ...configForm, testMode: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span>Test Mode (Sandbox)</span>
                  </label>
                </>
              )}

              {selectedIntegration.category === 'shipping' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">API Key *</label>
                    <input
                      type="text"
                      value={configForm.apiKey || ''}
                      onChange={(e) => setConfigForm({ ...configForm, apiKey: e.target.value })}
                      className="input"
                      placeholder="Enter API key"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Account Number</label>
                    <input
                      type="text"
                      value={configForm.accountNumber || ''}
                      onChange={(e) => setConfigForm({ ...configForm, accountNumber: e.target.value })}
                      className="input"
                      placeholder="Enter account number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Default Service</label>
                    <select
                      value={configForm.defaultService || 'standard'}
                      onChange={(e) => setConfigForm({ ...configForm, defaultService: e.target.value })}
                      className="input"
                    >
                      <option value="standard">Standard</option>
                      <option value="express">Express</option>
                      <option value="sameday">Same Day</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowConfigModal(false);
                  setSelectedIntegration(null);
                  setConfigForm({});
                }}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button onClick={testConnection} className="flex-1 btn btn-secondary">
                Test Connection
              </button>
              <button onClick={saveConfiguration} className="flex-1 btn btn-primary">
                Save & Connect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="card bg-blue-50">
        <h4 className="font-semibold mb-2">💡 About Integrations</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Integrations require API keys from the respective services</li>
          <li>• Test connections before going live</li>
          <li>• Some integrations may have additional fees</li>
          <li>• Data syncs automatically based on configured frequency</li>
          <li>• Contact support if you need help setting up integrations</li>
        </ul>
      </div>
    </div>
  );
}
