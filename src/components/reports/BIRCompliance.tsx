import { useState, useEffect } from 'react';

interface BIRReport {
  id: string;
  name: string;
  description: string;
  frequency: string;
  icon: string;
}

const birReports: BIRReport[] = [
  {
    id: 'sales_summary',
    name: 'Sales Summary Report',
    description: 'Daily/Monthly sales summary for BIR filing',
    frequency: 'Daily/Monthly',
    icon: '📊',
  },
  {
    id: 'vat_report',
    name: 'VAT Report (12%)',
    description: 'Value Added Tax computation and breakdown',
    frequency: 'Monthly',
    icon: '💰',
  },
  {
    id: 'withholding_tax',
    name: 'Withholding Tax Report',
    description: 'Expanded Withholding Tax (EWT) summary',
    frequency: 'Monthly',
    icon: '📋',
  },
  {
    id: 'sales_book',
    name: 'Sales Book',
    description: 'Detailed sales transactions log',
    frequency: 'Monthly',
    icon: '📖',
  },
  {
    id: 'purchase_book',
    name: 'Purchase Book',
    description: 'Detailed purchase transactions log',
    frequency: 'Monthly',
    icon: '📗',
  },
  {
    id: 'quarterly_vat',
    name: 'Quarterly VAT Return',
    description: 'BIR Form 2550Q - Quarterly VAT Declaration',
    frequency: 'Quarterly',
    icon: '📄',
  },
  {
    id: 'annual_itr',
    name: 'Annual Income Tax Return',
    description: 'BIR Form 1701/1702 - Annual ITR',
    frequency: 'Annually',
    icon: '📑',
  },
];

export default function BIRCompliance() {
  const [selectedPeriod, setSelectedPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, [selectedPeriod]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const allTransactions = await window.electronAPI.getTransactions();
      // Filter by selected period
      const filtered = allTransactions.filter((t: any) => {
        const date = new Date(t.created_at);
        return (
          date.getMonth() + 1 === selectedPeriod.month &&
          date.getFullYear() === selectedPeriod.year
        );
      });
      setTransactions(filtered);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateVAT = () => {
    const totalSales = transactions.reduce((sum, t) => sum + t.total_amount, 0);
    const vatableSales = totalSales / 1.12; // Remove VAT
    const vat = totalSales - vatableSales;
    return { totalSales, vatableSales, vat };
  };

  const generateReport = (reportId: string) => {
    const { totalSales, vatableSales, vat } = calculateVAT();
    const report = birReports.find(r => r.id === reportId);

    let reportContent = '';

    switch (reportId) {
      case 'sales_summary':
        reportContent = `
          <h2>Sales Summary Report</h2>
          <p>Period: ${selectedPeriod.month}/${selectedPeriod.year}</p>
          <table border="1" cellpadding="5">
            <tr><th>Description</th><th>Amount</th></tr>
            <tr><td>Total Sales (VAT Inclusive)</td><td>₱${totalSales.toFixed(2)}</td></tr>
            <tr><td>VATable Sales</td><td>₱${vatableSales.toFixed(2)}</td></tr>
            <tr><td>VAT Amount (12%)</td><td>₱${vat.toFixed(2)}</td></tr>
            <tr><td>Number of Transactions</td><td>${transactions.length}</td></tr>
          </table>
        `;
        break;

      case 'vat_report':
        reportContent = `
          <h2>VAT Report (12%)</h2>
          <p>Period: ${selectedPeriod.month}/${selectedPeriod.year}</p>
          <h3>Output VAT</h3>
          <table border="1" cellpadding="5">
            <tr><th>Description</th><th>Amount</th></tr>
            <tr><td>Gross Sales</td><td>₱${totalSales.toFixed(2)}</td></tr>
            <tr><td>Less: VAT</td><td>₱${vat.toFixed(2)}</td></tr>
            <tr><td>Net Sales</td><td>₱${vatableSales.toFixed(2)}</td></tr>
            <tr><td><strong>Output VAT (12%)</strong></td><td><strong>₱${vat.toFixed(2)}</strong></td></tr>
          </table>
          <p><em>Note: Input VAT from purchases should be deducted separately</em></p>
        `;
        break;

      case 'sales_book':
        reportContent = `
          <h2>Sales Book</h2>
          <p>Period: ${selectedPeriod.month}/${selectedPeriod.year}</p>
          <table border="1" cellpadding="5">
            <tr>
              <th>Date</th>
              <th>Receipt #</th>
              <th>Customer</th>
              <th>TIN</th>
              <th>Gross Sales</th>
              <th>VAT</th>
              <th>Net Sales</th>
            </tr>
            ${transactions.map(t => `
              <tr>
                <td>${new Date(t.created_at).toLocaleDateString()}</td>
                <td>${t.id}</td>
                <td>${t.customer_name || 'Walk-in'}</td>
                <td>-</td>
                <td>₱${t.total_amount.toFixed(2)}</td>
                <td>₱${(t.total_amount - t.total_amount / 1.12).toFixed(2)}</td>
                <td>₱${(t.total_amount / 1.12).toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr>
              <td colspan="4"><strong>TOTAL</strong></td>
              <td><strong>₱${totalSales.toFixed(2)}</strong></td>
              <td><strong>₱${vat.toFixed(2)}</strong></td>
              <td><strong>₱${vatableSales.toFixed(2)}</strong></td>
            </tr>
          </table>
        `;
        break;

      default:
        reportContent = `
          <h2>${report?.name}</h2>
          <p>This report is under development.</p>
          <p>Period: ${selectedPeriod.month}/${selectedPeriod.year}</p>
        `;
    }

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${report?.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { color: #1e293b; border-bottom: 2px solid #f97316; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background-color: #f97316; color: white; padding: 10px; text-align: left; }
            td { padding: 8px; border: 1px solid #ddd; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div style="text-align: center; margin-bottom: 30px;">
            <h1>JURASEC ENTERPRISES</h1>
            <p>Hardware & Construction Supplies</p>
            <p>TIN: XXX-XXX-XXX-XXX</p>
          </div>
          ${reportContent}
          <div class="footer">
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>This is a system-generated report</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const exportToCSV = (reportId: string) => {
    const { totalSales, vatableSales, vat } = calculateVAT();
    
    let csvContent = '';
    
    if (reportId === 'sales_book') {
      csvContent = [
        ['Date', 'Receipt #', 'Customer', 'TIN', 'Gross Sales', 'VAT', 'Net Sales'].join(','),
        ...transactions.map(t => [
          new Date(t.created_at).toLocaleDateString(),
          t.id,
          t.customer_name || 'Walk-in',
          '-',
          t.total_amount.toFixed(2),
          (t.total_amount - t.total_amount / 1.12).toFixed(2),
          (t.total_amount / 1.12).toFixed(2),
        ].join(',')),
        ['TOTAL', '', '', '', totalSales.toFixed(2), vat.toFixed(2), vatableSales.toFixed(2)].join(','),
      ].join('\n');
    } else {
      csvContent = [
        ['Description', 'Amount'].join(','),
        ['Total Sales (VAT Inclusive)', totalSales.toFixed(2)].join(','),
        ['VATable Sales', vatableSales.toFixed(2)].join(','),
        ['VAT Amount (12%)', vat.toFixed(2)].join(','),
        ['Number of Transactions', transactions.length].join(','),
      ].join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BIR_${reportId}_${selectedPeriod.month}_${selectedPeriod.year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const { totalSales, vatableSales, vat } = calculateVAT();

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">BIR Compliance Reports</h3>

      {/* Period Selection */}
      <div className="card bg-blue-50">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Month</label>
            <select
              value={selectedPeriod.month}
              onChange={(e) => setSelectedPeriod({ ...selectedPeriod, month: parseInt(e.target.value) })}
              className="input"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Year</label>
            <select
              value={selectedPeriod.year}
              onChange={(e) => setSelectedPeriod({ ...selectedPeriod, year: parseInt(e.target.value) })}
              className="input"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card bg-green-50">
          <p className="text-sm text-gray-600">Total Sales (VAT Inc.)</p>
          <p className="text-2xl font-bold text-green-600">₱{totalSales.toFixed(2)}</p>
        </div>
        <div className="card bg-blue-50">
          <p className="text-sm text-gray-600">VATable Sales</p>
          <p className="text-2xl font-bold text-blue-600">₱{vatableSales.toFixed(2)}</p>
        </div>
        <div className="card bg-orange-50">
          <p className="text-sm text-gray-600">VAT Amount (12%)</p>
          <p className="text-2xl font-bold text-orange-600">₱{vat.toFixed(2)}</p>
        </div>
      </div>

      {/* BIR Reports */}
      <div className="grid grid-cols-2 gap-4">
        {birReports.map((report) => (
          <div key={report.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-3">
              <span className="text-4xl">{report.icon}</span>
              <div className="flex-1">
                <h4 className="font-semibold">{report.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                <p className="text-xs text-gray-500 mt-2">Frequency: {report.frequency}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => generateReport(report.id)}
                    className="text-sm btn btn-primary"
                  >
                    🖨️ Generate
                  </button>
                  <button
                    onClick={() => exportToCSV(report.id)}
                    className="text-sm btn btn-secondary"
                  >
                    📥 Export CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Important Notes */}
      <div className="card bg-yellow-50">
        <h4 className="font-semibold mb-2">⚠️ Important Notes</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• These reports are for reference only. Consult with a tax professional for official BIR filing.</li>
          <li>• Ensure all transactions are properly recorded before generating reports.</li>
          <li>• VAT rate is set to 12% as per Philippine tax law.</li>
          <li>• Keep backup copies of all reports for audit purposes.</li>
          <li>• Update your TIN in Settings → General for official reports.</li>
        </ul>
      </div>
    </div>
  );
}
