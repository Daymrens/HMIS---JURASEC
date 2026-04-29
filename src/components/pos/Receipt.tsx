import { useRef } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';

interface ReceiptProps {
  transaction: any;
  onClose: () => void;
}

export default function Receipt({ transaction, onClose }: ReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const { companyName, receiptHeader, receiptFooter } = useSettingsStore();

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${transaction.transaction_no}</title>
          <style>
            body { font-family: monospace; padding: 20px; }
            .receipt { max-width: 300px; margin: 0 auto; }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #000; margin: 10px 0; }
            table { width: 100%; }
            td { padding: 2px 0; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center text-green-600">
          ✓ Transaction Complete
        </h2>

        <div ref={receiptRef} className="bg-white p-6 border-2 border-gray-200 rounded-lg mb-6">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold">{companyName}</h3>
            <p className="text-sm text-gray-600">{receiptHeader}</p>
          </div>

          <div className="border-t border-b border-dashed border-gray-400 py-3 mb-3 text-sm">
            <div className="flex justify-between">
              <span>Transaction No:</span>
              <span className="font-semibold">{transaction.transaction_no}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment:</span>
              <span className="capitalize">{transaction.payment_method.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="mb-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-1">Item</th>
                  <th className="text-center py-1">Qty</th>
                  <th className="text-right py-1">Price</th>
                  <th className="text-right py-1">Total</th>
                </tr>
              </thead>
              <tbody>
                {transaction.items.map((item: any, index: number) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-1 text-xs">{item.name}</td>
                    <td className="text-center py-1">{item.qty}</td>
                    <td className="text-right py-1">₱{item.unit_price.toFixed(2)}</td>
                    <td className="text-right py-1">₱{item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-300 pt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₱{transaction.subtotal.toFixed(2)}</span>
            </div>
            {transaction.discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount ({transaction.discount}%):</span>
                <span>-₱{(transaction.subtotal * transaction.discount / 100).toFixed(2)}</span>
              </div>
            )}
            {transaction.tax > 0 && (
              <div className="flex justify-between">
                <span>VAT (12%):</span>
                <span>₱{transaction.tax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
              <span>TOTAL:</span>
              <span>₱{transaction.total.toFixed(2)}</span>
            </div>
          </div>

          {transaction.payment_method === 'cash' && (
            <div className="border-t border-gray-300 mt-3 pt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span>₱{transaction.amount_paid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Change:</span>
                <span>₱{transaction.change.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="text-center mt-4 text-xs text-gray-600">
            <p>{receiptFooter}</p>
            <p className="mt-2">Thank you for your business!</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handlePrint} className="flex-1 btn btn-secondary">
            🖨️ Print Receipt
          </button>
          <button onClick={onClose} className="flex-1 btn btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
