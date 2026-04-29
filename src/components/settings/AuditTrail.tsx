import { useState, useEffect } from 'react';

interface AuditLog {
  id: number;
  user: string;
  action: string;
  entity: string;
  entity_id?: number;
  details: string;
  timestamp: string;
}

export default function AuditTrail() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filterEntity, setFilterEntity] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    const saved = localStorage.getItem('audit_logs');
    if (saved) {
      setLogs(JSON.parse(saved));
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filterEntity !== 'all' && log.entity !== filterEntity) return false;
    if (filterUser !== 'all' && log.user !== filterUser) return false;
    if (searchQuery && !log.details.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const entities = Array.from(new Set(logs.map((log) => log.entity)));
  const users = Array.from(new Set(logs.map((log) => log.user)));

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'text-green-600';
      case 'update':
        return 'text-blue-600';
      case 'delete':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Entity', 'Details'].join(','),
      ...filteredLogs.map((log) =>
        [
          new Date(log.timestamp).toLocaleString(),
          log.user,
          log.action,
          log.entity,
          `"${log.details}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Audit Trail</h3>
        <button onClick={exportLogs} className="btn btn-secondary">
          📥 Export Logs
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Entity Type</label>
            <select
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
              className="input"
            >
              <option value="all">All Entities</option>
              {entities.map((entity) => (
                <option key={entity} value={entity}>
                  {entity}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">User</label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="input"
            >
              <option value="all">All Users</option>
              {users.map((user) => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search details..."
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3">Timestamp</th>
              <th className="text-left py-3">User</th>
              <th className="text-left py-3">Action</th>
              <th className="text-left py-3">Entity</th>
              <th className="text-left py-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id} className="border-b hover:bg-gray-50">
                <td className="py-3">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="py-3 font-medium">{log.user}</td>
                <td className={`py-3 font-semibold capitalize ${getActionColor(log.action)}`}>
                  {log.action}
                </td>
                <td className="py-3">{log.entity}</td>
                <td className="py-3 text-gray-600">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredLogs.length === 0 && (
          <div className="text-center py-12 text-gray-500">No audit logs found.</div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card bg-blue-50">
          <p className="text-sm text-gray-600">Total Logs</p>
          <p className="text-2xl font-bold text-blue-600">{logs.length}</p>
        </div>
        <div className="card bg-green-50">
          <p className="text-sm text-gray-600">Creates</p>
          <p className="text-2xl font-bold text-green-600">
            {logs.filter((l) => l.action === 'create').length}
          </p>
        </div>
        <div className="card bg-yellow-50">
          <p className="text-sm text-gray-600">Updates</p>
          <p className="text-2xl font-bold text-yellow-600">
            {logs.filter((l) => l.action === 'update').length}
          </p>
        </div>
        <div className="card bg-red-50">
          <p className="text-sm text-gray-600">Deletes</p>
          <p className="text-2xl font-bold text-red-600">
            {logs.filter((l) => l.action === 'delete').length}
          </p>
        </div>
      </div>
    </div>
  );
}
