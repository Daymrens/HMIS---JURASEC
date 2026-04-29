import { useState, useEffect } from 'react';

interface Widget {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  order: number;
}

const availableWidgets: Widget[] = [
  { id: 'revenue', name: 'Revenue Overview', icon: '💰', enabled: true, order: 1 },
  { id: 'sales', name: 'Sales Statistics', icon: '📊', enabled: true, order: 2 },
  { id: 'top_products', name: 'Top Selling Products', icon: '🏆', enabled: true, order: 3 },
  { id: 'low_stock', name: 'Low Stock Alerts', icon: '⚠️', enabled: true, order: 4 },
  { id: 'recent_transactions', name: 'Recent Transactions', icon: '🧾', enabled: true, order: 5 },
  { id: 'charts', name: 'Sales Charts', icon: '📈', enabled: true, order: 6 },
  { id: 'payment_methods', name: 'Payment Methods', icon: '💳', enabled: true, order: 7 },
  { id: 'quick_actions', name: 'Quick Actions', icon: '⚡', enabled: false, order: 8 },
  { id: 'notifications', name: 'Notifications', icon: '🔔', enabled: false, order: 9 },
];

export default function WidgetCustomizer() {
  const [widgets, setWidgets] = useState<Widget[]>(availableWidgets);

  useEffect(() => {
    const saved = localStorage.getItem('dashboard_widgets');
    if (saved) {
      setWidgets(JSON.parse(saved));
    }
  }, []);

  const toggleWidget = (id: string) => {
    const updated = widgets.map((w) =>
      w.id === id ? { ...w, enabled: !w.enabled } : w
    );
    setWidgets(updated);
    localStorage.setItem('dashboard_widgets', JSON.stringify(updated));
  };

  const moveWidget = (id: string, direction: 'up' | 'down') => {
    const index = widgets.findIndex((w) => w.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === widgets.length - 1)
    ) {
      return;
    }

    const newWidgets = [...widgets];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newWidgets[index], newWidgets[targetIndex]] = [
      newWidgets[targetIndex],
      newWidgets[index],
    ];

    // Update order
    newWidgets.forEach((w, i) => {
      w.order = i + 1;
    });

    setWidgets(newWidgets);
    localStorage.setItem('dashboard_widgets', JSON.stringify(newWidgets));
  };

  const resetToDefault = () => {
    if (!confirm('Reset dashboard to default layout?')) return;
    setWidgets(availableWidgets);
    localStorage.setItem('dashboard_widgets', JSON.stringify(availableWidgets));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Dashboard Widgets</h3>
        <button onClick={resetToDefault} className="btn btn-secondary">
          🔄 Reset to Default
        </button>
      </div>

      <div className="card bg-blue-50">
        <p className="text-sm text-gray-600">
          Customize your dashboard by enabling/disabling widgets and reordering them.
          Changes will be reflected on the Dashboard page.
        </p>
      </div>

      {/* Widget List */}
      <div className="space-y-2">
        {widgets.map((widget, index) => (
          <div
            key={widget.id}
            className={`card flex items-center justify-between ${
              widget.enabled ? 'bg-white' : 'bg-gray-50 opacity-60'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{widget.icon}</span>
              <div>
                <p className="font-semibold">{widget.name}</p>
                <p className="text-xs text-gray-500">Order: {widget.order}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Move buttons */}
              <button
                onClick={() => moveWidget(widget.id, 'up')}
                disabled={index === 0}
                className="p-2 hover:bg-gray-100 rounded disabled:opacity-30"
                title="Move up"
              >
                ⬆️
              </button>
              <button
                onClick={() => moveWidget(widget.id, 'down')}
                disabled={index === widgets.length - 1}
                className="p-2 hover:bg-gray-100 rounded disabled:opacity-30"
                title="Move down"
              >
                ⬇️
              </button>

              {/* Toggle button */}
              <button
                onClick={() => toggleWidget(widget.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  widget.enabled
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-700'
                }`}
              >
                {widget.enabled ? '✓ Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="card bg-green-50">
        <p className="text-sm font-semibold text-green-800">
          {widgets.filter((w) => w.enabled).length} of {widgets.length} widgets enabled
        </p>
      </div>
    </div>
  );
}
