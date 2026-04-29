import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';

interface CashRegisterProps {
  onClose: () => void;
}

export default function CashRegister({ onClose }: CashRegisterProps) {
  const user = useAuthStore((state) => state.user);
  const [view, setView] = useState<'open' | 'close' | 'report'>('report');
  const [openingBalance, setOpeningBalance] = useState('');
  const [closingBalance, setClosingBalance] = useState('');
  const [registerData, setRegisterData] = useState<any>(null);
  const [todayTransactions, setTodayTransactions] = useState<any[]>([]);

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const transactions = await window.electronAPI.getTransactions({
        startDate: today,
        endDate: today,
      });
      setTodayTransactions(transactions);

      // Check if register is already opened today
      const registerKey = `cash_register_${today}_${user?.id}`;
      const savedData = localStorage.getItem(registerKey);
      if (savedData) {
        setRegisterData(JSON.parse(savedData));
        setView('report');
      } else {
        setView('open');
      }
    } catch (error) {
      console.error('Failed to load today data:', error);
    }
  };

  const handleOpenRegister = () => {
    const today = new Date().toISOString().split('T')[0];
    const registerKey = `cash_register_${today}_${user?.id}`;
    const data = {
      date: today,
      userId: user?.id,
      userName: user?.username,
      openingBalance: parseFloat(openingBalance),
      openedAt: new Date().toISOString(),
    };
    localStorage.setItem(registerKey, JSON.stringify(data));
    setRegisterData(data);
    setView('report');
  };

  const handleCloseRegister = () => {
    const today = new Date().toISOString().split('T')[0];
    const registerKey = `cash_register_${today}_${user?.id}`;
    const data = {
      ...registerData,
      closingBalance: parseFloat(closingBalance),
      closedAt: new Date().toISOString(),
    };
    localStorage.setItem(registerKey, JSON.stringify(data));
    setRegisterData(data);
    setView('report');
  };

  const cashTransactions = todayTransactions.filter(t => t.payment_method === 'cash');
  const totalCashSales = cashTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalGCash = todayTransactions.filter(t => t.payment_method === 'gcash').reduce((sum, t) => sum + t.total, 0);
  const totalBank = todayTransactions.filter(t => t.payment_method === 'bank_transfer').reduce((sum, t) => sum + t.total, 0);
  const totalSales = todayTransactions.reduce((sum, t) => sum + t.total, 0);

  const expectedCash = (registerData?.openingBalance || 0) + totalCashSales;
  const difference = (registerData?.closingBalance || 0) - expectedCash;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Daily Cash Register</h2>

        {view === 'open' && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Open Cash Register</h3>
              <p className="text-sm text-gray-600 mb-4">
                Enter the starting cash amount in the register to begin your shift.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Opening Balance (₱)</label>
              <input
                type="number"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                className="input"
                placeholder="0.00"
                step="0.01"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleOpenRegister}
                disabled={!openingBalance}
                className="flex-1 btn btn-primary"
              >
                Open Register
              </button>
            </div>
          </div>
        )}

        {view === 'report' && registerData && (
          <div className="space-y-6">
            {/* Register Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Cashier:</span>
                  <span className="ml-2 font-semibold">{registerData.userName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Date:</span>
                  <span className="ml-2 font-semibold">{new Date(registerData.date).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Opened:</span>
                  <span className="ml-2 font-semibold">{new Date(registerData.openedAt).toLocaleTimeString()}</span>
                </div>
                {registerData.closedAt && (
                  <div>
                    <span className="text-gray-600">Closed:</span>
                    <span className="ml-2 font-semibold">{new Date(registerData.closedAt).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Sales Summary */}
            <div>
              <h3 className="font-semibold mb-3">Sales Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span>Cash Sales ({cashTransactions.length} transactions)</span>
                  <span className="font-semibold">₱{totalCashSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>GCash Sales</span>
                  <span className="font-semibold">₱{totalGCash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Bank Transfer Sales</span>
                  <span className="font-semibold">₱{totalBank.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 font-bold text-lg">
                  <span>Total Sales</span>
                  <span className="text-accent">₱{totalSales.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Cash Reconciliation */}
            <div>
              <h3 className="font-semibold mb-3">Cash Reconciliation</h3>
              <div className="space-y-2">
                <div className="flex justify-between py-2">
                  <span>Opening Balance</span>
                  <span className="font-semibold">₱{registerData.openingBalance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>+ Cash Sales</span>
                  <span className="font-semibold">₱{totalCashSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-t font-bold">
                  <span>Expected Cash</span>
                  <span>₱{expectedCash.toFixed(2)}</span>
                </div>
                {registerData.closingBalance !== undefined && (
                  <>
                    <div className="flex justify-between py-2">
                      <span>Actual Closing Balance</span>
                      <span className="font-semibold">₱{registerData.closingBalance.toFixed(2)}</span>
                    </div>
                    <div className={`flex justify-between py-2 border-t font-bold ${
                      difference === 0 ? 'text-green-600' : difference > 0 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      <span>Difference</span>
                      <span>₱{difference.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {!registerData.closedAt && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Close Register</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Count the cash in the register and enter the closing balance.
                </p>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-2">Closing Balance (₱)</label>
                  <input
                    type="number"
                    value={closingBalance}
                    onChange={(e) => setClosingBalance(e.target.value)}
                    className="input"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <button
                  onClick={handleCloseRegister}
                  disabled={!closingBalance}
                  className="btn btn-primary w-full"
                >
                  Close Register
                </button>
              </div>
            )}

            <button onClick={onClose} className="btn btn-secondary w-full">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
