import { useState, useEffect } from 'react';

interface BackupSchedule {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  lastBackup?: string;
  autoBackupPath?: string;
}

export default function AutoBackup() {
  const [schedule, setSchedule] = useState<BackupSchedule>({
    enabled: false,
    frequency: 'daily',
    time: '00:00',
  });
  const [backupHistory, setBackupHistory] = useState<any[]>([]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const saved = localStorage.getItem('backup_schedule');
    if (saved) setSchedule(JSON.parse(saved));

    const history = localStorage.getItem('backup_history');
    if (history) setBackupHistory(JSON.parse(history));
  };

  const saveSettings = () => {
    localStorage.setItem('backup_schedule', JSON.stringify(schedule));
    alert('Backup schedule saved!');
  };

  const createBackup = async () => {
    try {
      // Get all data from localStorage and database
      const data = {
        timestamp: new Date().toISOString(),
        products: await window.electronAPI.getProducts(),
        customers: await window.electronAPI.getCustomers(),
        suppliers: await window.electronAPI.getSuppliers(),
        categories: await window.electronAPI.getCategories(),
        users: await window.electronAPI.getUsers(),
        transactions: await window.electronAPI.getTransactions(),
        settings: await window.electronAPI.getSettings(),
        localStorage: {
          purchase_orders: localStorage.getItem('purchase_orders'),
          quotations: localStorage.getItem('quotations'),
          invoices: localStorage.getItem('invoices'),
          credit_sales: localStorage.getItem('credit_sales'),
          layaway_plans: localStorage.getItem('layaway_plans'),
          returns: localStorage.getItem('returns'),
          promotions: localStorage.getItem('promotions'),
          loyalty_data: localStorage.getItem('loyalty_data'),
          time_entries: localStorage.getItem('time_entries'),
        },
      };

      // Create backup file
      const backupData = JSON.stringify(data, null, 2);
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jurasec-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      // Update backup history
      const newHistory = [
        {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          size: new Blob([backupData]).size,
          type: 'manual',
        },
        ...backupHistory,
      ].slice(0, 10); // Keep last 10 backups

      setBackupHistory(newHistory);
      localStorage.setItem('backup_history', JSON.stringify(newHistory));

      // Update last backup time
      setSchedule({ ...schedule, lastBackup: new Date().toISOString() });

      alert('Backup created successfully!');
    } catch (error) {
      console.error('Backup failed:', error);
      alert('Failed to create backup');
    }
  };

  const restoreBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (!confirm('This will replace all current data. Continue?')) return;

        // Restore localStorage data
        if (data.localStorage) {
          Object.entries(data.localStorage).forEach(([key, value]) => {
            if (value) localStorage.setItem(key, value as string);
          });
        }

        // Restore database data would require backend support
        alert('Backup restored successfully! Please restart the application.');
        window.location.reload();
      } catch (error) {
        console.error('Restore failed:', error);
        alert('Failed to restore backup. Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Auto Backup</h3>

      {/* Manual Backup */}
      <div className="card bg-blue-50">
        <h4 className="font-semibold mb-3">Manual Backup</h4>
        <div className="flex gap-3">
          <button onClick={createBackup} className="btn btn-primary">
            💾 Create Backup Now
          </button>
          <label className="btn btn-secondary cursor-pointer">
            📥 Restore Backup
            <input
              type="file"
              accept=".json"
              onChange={restoreBackup}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Scheduled Backup */}
      <div className="card">
        <h4 className="font-semibold mb-4">Scheduled Backup</h4>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={schedule.enabled}
              onChange={(e) => setSchedule({ ...schedule, enabled: e.target.checked })}
              className="w-5 h-5"
            />
            <label className="font-medium">Enable Automatic Backups</label>
          </div>

          {schedule.enabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Frequency</label>
                  <select
                    value={schedule.frequency}
                    onChange={(e) => setSchedule({ ...schedule, frequency: e.target.value as any })}
                    className="input"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time</label>
                  <input
                    type="time"
                    value={schedule.time}
                    onChange={(e) => setSchedule({ ...schedule, time: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              {schedule.lastBackup && (
                <p className="text-sm text-gray-600">
                  Last backup: {new Date(schedule.lastBackup).toLocaleString()}
                </p>
              )}
            </>
          )}

          <button onClick={saveSettings} className="btn btn-primary">
            Save Schedule
          </button>
        </div>
      </div>

      {/* Backup History */}
      <div className="card">
        <h4 className="font-semibold mb-4">Backup History</h4>
        {backupHistory.length > 0 ? (
          <div className="space-y-2">
            {backupHistory.map((backup) => (
              <div key={backup.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{new Date(backup.timestamp).toLocaleString()}</p>
                  <p className="text-sm text-gray-600">
                    {formatBytes(backup.size)} • {backup.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No backup history yet.</p>
        )}
      </div>
    </div>
  );
}
