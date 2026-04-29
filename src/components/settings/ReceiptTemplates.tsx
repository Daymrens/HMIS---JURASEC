import { useState, useEffect } from 'react';

interface ReceiptTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  style: 'standard' | 'compact' | 'detailed' | 'minimal';
}

const templates: ReceiptTemplate[] = [
  {
    id: 'standard',
    name: 'Standard Receipt',
    description: 'Classic receipt with all details',
    preview: '📄',
    style: 'standard',
  },
  {
    id: 'compact',
    name: 'Compact Receipt',
    description: 'Space-saving format for thermal printers',
    preview: '📋',
    style: 'compact',
  },
  {
    id: 'detailed',
    name: 'Detailed Receipt',
    description: 'Includes product descriptions and notes',
    preview: '📃',
    style: 'detailed',
  },
  {
    id: 'minimal',
    name: 'Minimal Receipt',
    description: 'Clean and simple design',
    preview: '🧾',
    style: 'minimal',
  },
];

export default function ReceiptTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState('standard');
  const [customization, setCustomization] = useState({
    showLogo: true,
    showBarcode: true,
    showTaxBreakdown: true,
    showFooterMessage: true,
    fontSize: 'medium',
    paperSize: '80mm',
  });

  useEffect(() => {
    const saved = localStorage.getItem('receipt_template');
    if (saved) setSelectedTemplate(saved);

    const customSaved = localStorage.getItem('receipt_customization');
    if (customSaved) setCustomization(JSON.parse(customSaved));
  }, []);

  const selectTemplate = (id: string) => {
    setSelectedTemplate(id);
    localStorage.setItem('receipt_template', id);
  };

  const saveCustomization = () => {
    localStorage.setItem('receipt_customization', JSON.stringify(customization));
    alert('Receipt customization saved!');
  };

  const previewReceipt = () => {
    const template = templates.find((t) => t.id === selectedTemplate);
    if (!template) return;

    const printWindow = window.open('', '', 'width=400,height=600');
    if (!printWindow) return;

    const sampleReceipt = `
      <html>
        <head>
          <title>Receipt Preview</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              padding: 20px;
              max-width: ${customization.paperSize === '80mm' ? '300px' : '400px'};
              margin: 0 auto;
              font-size: ${
                customization.fontSize === 'small' ? '10px' :
                customization.fontSize === 'large' ? '14px' : '12px'
              };
            }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #000; padding-bottom: 10px; }
            .logo { font-size: 24px; font-weight: bold; }
            .items { margin: 20px 0; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; }
            .totals { border-top: 2px dashed #000; padding-top: 10px; margin-top: 10px; }
            .total-line { display: flex; justify-content: space-between; margin: 3px 0; }
            .grand-total { font-weight: bold; font-size: 1.2em; border-top: 2px solid #000; padding-top: 5px; margin-top: 5px; }
            .footer { text-align: center; margin-top: 20px; border-top: 2px dashed #000; padding-top: 10px; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="header">
            ${customization.showLogo ? '<div class="logo">JURASEC ENTERPRISES</div>' : ''}
            <div>Hardware & Construction Supplies</div>
            <div>123 Main Street, City</div>
            <div>Tel: (123) 456-7890</div>
          </div>

          <div style="text-align: center; margin: 10px 0;">
            <div><strong>SALES RECEIPT</strong></div>
            <div>Receipt #: 12345</div>
            <div>Date: ${new Date().toLocaleString()}</div>
            <div>Cashier: Admin</div>
          </div>

          <div class="items">
            ${template.style === 'detailed' ? `
              <div class="item">
                <div>
                  <div><strong>Hammer</strong></div>
                  <div style="font-size: 0.9em; color: #666;">Heavy duty steel hammer</div>
                  <div>2 x ₱250.00</div>
                </div>
                <div>₱500.00</div>
              </div>
              <div class="item">
                <div>
                  <div><strong>Nails (1kg)</strong></div>
                  <div style="font-size: 0.9em; color: #666;">Galvanized steel nails</div>
                  <div>1 x ₱150.00</div>
                </div>
                <div>₱150.00</div>
              </div>
            ` : template.style === 'compact' ? `
              <div class="item"><span>Hammer (2x)</span><span>₱500.00</span></div>
              <div class="item"><span>Nails 1kg</span><span>₱150.00</span></div>
            ` : `
              <div class="item"><span>Hammer</span><span>2 x ₱250.00 = ₱500.00</span></div>
              <div class="item"><span>Nails (1kg)</span><span>1 x ₱150.00 = ₱150.00</span></div>
            `}
          </div>

          <div class="totals">
            <div class="total-line"><span>Subtotal:</span><span>₱650.00</span></div>
            ${customization.showTaxBreakdown ? `
              <div class="total-line"><span>VAT (12%):</span><span>₱78.00</span></div>
            ` : ''}
            <div class="total-line grand-total"><span>TOTAL:</span><span>₱728.00</span></div>
            <div class="total-line"><span>Cash:</span><span>₱1,000.00</span></div>
            <div class="total-line"><span>Change:</span><span>₱272.00</span></div>
          </div>

          ${customization.showBarcode ? `
            <div style="text-align: center; margin: 15px 0;">
              <div style="font-family: 'Libre Barcode 128', monospace; font-size: 40px;">*12345*</div>
            </div>
          ` : ''}

          ${customization.showFooterMessage ? `
            <div class="footer">
              <div>Thank you for your business!</div>
              <div>Please come again</div>
              <div style="margin-top: 10px; font-size: 0.8em;">
                This serves as your official receipt
              </div>
            </div>
          ` : ''}
        </body>
      </html>
    `;

    printWindow.document.write(sampleReceipt);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Receipt Templates</h3>
        <button onClick={previewReceipt} className="btn btn-secondary">
          👁️ Preview Receipt
        </button>
      </div>

      {/* Template Selection */}
      <div className="grid grid-cols-2 gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => selectTemplate(template.id)}
            className={`card text-left transition-all hover:scale-105 ${
              selectedTemplate === template.id
                ? 'border-2 border-accent shadow-lg bg-orange-50'
                : 'border-2 border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-4xl">{template.preview}</span>
              <div>
                <p className="font-semibold">{template.name}</p>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>
              {selectedTemplate === template.id && (
                <span className="ml-auto text-accent text-2xl">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Customization Options */}
      <div className="card">
        <h4 className="font-semibold mb-4">Customization Options</h4>
        <div className="space-y-4">
          {/* Toggles */}
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={customization.showLogo}
                onChange={(e) =>
                  setCustomization({ ...customization, showLogo: e.target.checked })
                }
                className="w-5 h-5"
              />
              <span>Show Logo</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={customization.showBarcode}
                onChange={(e) =>
                  setCustomization({ ...customization, showBarcode: e.target.checked })
                }
                className="w-5 h-5"
              />
              <span>Show Barcode</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={customization.showTaxBreakdown}
                onChange={(e) =>
                  setCustomization({
                    ...customization,
                    showTaxBreakdown: e.target.checked,
                  })
                }
                className="w-5 h-5"
              />
              <span>Show Tax Breakdown</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={customization.showFooterMessage}
                onChange={(e) =>
                  setCustomization({
                    ...customization,
                    showFooterMessage: e.target.checked,
                  })
                }
                className="w-5 h-5"
              />
              <span>Show Footer Message</span>
            </label>
          </div>

          {/* Dropdowns */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Font Size</label>
              <select
                value={customization.fontSize}
                onChange={(e) =>
                  setCustomization({ ...customization, fontSize: e.target.value })
                }
                className="input"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Paper Size</label>
              <select
                value={customization.paperSize}
                onChange={(e) =>
                  setCustomization({ ...customization, paperSize: e.target.value })
                }
                className="input"
              >
                <option value="80mm">80mm (Thermal)</option>
                <option value="A4">A4 (Letter)</option>
              </select>
            </div>
          </div>

          <button onClick={saveCustomization} className="btn btn-primary w-full">
            Save Customization
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="card bg-blue-50">
        <h4 className="font-semibold mb-2">💡 Tips</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Use Compact template for thermal printers (80mm)</li>
          <li>• Detailed template is best for A4 paper</li>
          <li>• Preview before printing to check layout</li>
          <li>• Customize header and footer in General Settings</li>
        </ul>
      </div>
    </div>
  );
}
