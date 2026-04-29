import { useState, useEffect } from 'react';
import { User } from '../types';

interface TimeEntry {
  id: number;
  user_id: number;
  user_name: string;
  clock_in: string;
  clock_out?: string;
  hours_worked?: number;
  status: 'clocked_in' | 'clocked_out';
}

export default function TimeTracking() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const usersData = await window.electronAPI.getUsers();
      setUsers(usersData);
      const saved = localStorage.getItem('time_entries');
      if (saved) setEntries(JSON.parse(saved));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const clockIn = () => {
    if (!selectedUser) {
      alert('Please select an employee');
      return;
    }

    const user = users.find(u => u.id === selectedUser);
    if (!user) return;

    // Check if already clocked in
    const existing = entries.find(e => e.user_id === selectedUser && e.status === 'clocked_in');
    if (existing) {
      alert('Employee is already clocked in!');
      return;
    }

    const newEntry: TimeEntry = {
      id: Date.now(),
      user_id: selectedUser,
      user_name: user.username,
      clock_in: new Date().toISOString(),
      status: 'clocked_in',
    };

    const updated = [...entries, newEntry];
    setEntries(updated);
    localStorage.setItem('time_entries', JSON.stringify(updated));
    alert(`${user.username} clocked in successfully!`);
  };

  const clockOut = (entryId: number) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    const clockOutTime = new Date();
    const clockInTime = new Date(entry.clock_in);
    const hoursWorked = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

    const updated = entries.map(e =>
      e.id === entryId
        ? {
            ...e,
            clock_out: clockOutTime.toISOString(),
            hours_worked: hoursWorked,
            status: 'clocked_out' as const,
          }
        : e
    );

    setEntries(updated);
    localStorage.setItem('time_entries', JSON.stringify(updated));
    alert(`Clocked out! Hours worked: ${hoursWorked.toFixed(2)}`);
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString();
  };

  const filteredEntries = entries.filter(e => {
    const entryDate = new Date(e.clock_in).toISOString().split('T')[0];
    return entryDate === filterDate;
  });

  const currentlyClockedIn = entries.filter(e => e.status === 'clocked_in');

  const totalHoursToday = filteredEntries
    .filter(e => e.hours_worked)
    .reduce((sum, e) => sum + (e.hours_worked || 0), 0);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Employee Time Tracking</h2>

      {/* Clock In/Out Card */}
      <div className="card bg-blue-50">
        <h3 className="font-semibold mb-4">Clock In / Out</h3>
        <div className="flex gap-4">
          <select
            value={selectedUser || ''}
            onChange={(e) => setSelectedUser(Number(e.target.value))}
            className="input flex-1"
          >
            <option value="">Select Employee</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username} ({user.role})
              </option>
            ))}
          </select>
          <button onClick={clockIn} className="btn btn-primary">
            🕐 Clock In
          </button>
        </div>
      </div>

      {/* Currently Clocked In */}
      {currentlyClockedIn.length > 0 && (
        <div className="card bg-green-50">
          <h3 className="font-semibold mb-4">Currently Clocked In</h3>
          <div className="space-y-2">
            {currentlyClockedIn.map((entry) => (
              <div key={entry.id} className="flex justify-between items-center p-3 bg-white rounded">
                <div>
                  <p className="font-semibold">{entry.user_name}</p>
                  <p className="text-sm text-gray-600">
                    Clocked in at {formatTime(entry.clock_in)}
                  </p>
                </div>
                <button
                  onClick={() => clockOut(entry.id)}
                  className="btn btn-secondary"
                >
                  🕐 Clock Out
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <h3 className="text-sm text-gray-600 mb-2">Currently Working</h3>
          <p className="text-3xl font-bold text-green-600">{currentlyClockedIn.length}</p>
        </div>
        <div className="card">
          <h3 className="text-sm text-gray-600 mb-2">Total Hours Today</h3>
          <p className="text-3xl font-bold text-accent">{totalHoursToday.toFixed(1)}h</p>
        </div>
        <div className="card">
          <h3 className="text-sm text-gray-600 mb-2">Entries Today</h3>
          <p className="text-3xl font-bold text-blue-600">{filteredEntries.length}</p>
        </div>
      </div>

      {/* Time Entries Table */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Time Entries</h3>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="input w-auto"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3">Employee</th>
                <th className="text-left py-3">Date</th>
                <th className="text-left py-3">Clock In</th>
                <th className="text-left py-3">Clock Out</th>
                <th className="text-right py-3">Hours</th>
                <th className="text-center py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="border-b hover:bg-gray-50">
                  <td className="py-3">{entry.user_name}</td>
                  <td className="py-3">{formatDate(entry.clock_in)}</td>
                  <td className="py-3">{formatTime(entry.clock_in)}</td>
                  <td className="py-3">
                    {entry.clock_out ? formatTime(entry.clock_out) : '-'}
                  </td>
                  <td className="py-3 text-right font-semibold">
                    {entry.hours_worked ? entry.hours_worked.toFixed(2) : '-'}
                  </td>
                  <td className="py-3 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      entry.status === 'clocked_in'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {entry.status === 'clocked_in' ? 'Working' : 'Completed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEntries.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No time entries for this date.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
