import { useState } from 'react';

interface CSVImportProps {
  onClose: () => void;
  onSuccess: () => void;
  categories: any[];
  suppliers: any[];
}

export default function CSVImport({ onClose, onSuccess, categories, suppliers }: CSVImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        setErrors(['CSV file is empty or invalid']);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const requiredHeaders = ['sku', 'name', 'category', 'unit', 'cost_price', 'selling_price'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        setErrors([`Missing required columns: ${missingHeaders.join(', ')}`]);
        return;
      }

      const products = [];
      const parseErrors = [];

      for (let i = 1; i < Math.min(lines.length, 11); i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const product: any = {};
        
        headers.forEach((header, index) => {
          product[header] = values[index] || '';
        });

        // Validate
        if (!product.sku || !product.name) {
          parseErrors.push(`Row ${i + 1}: Missing SKU or Name`);
          continue;
        }

        products.push(product);
      }

      setPreview(products);
      setErrors(parseErrors);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      let successCount = 0;
      let errorCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const product: any = {};
        
        headers.forEach((header, index) => {
          product[header] = values[index] || '';
        });

        try {
          // Find category ID
          const category = categories.find(c => 
            c.name.toLowerCase() === product.category.toLowerCase()
          );
          
          // Find supplier ID
          const supplier = suppliers.find(s => 
            s.name.toLowerCase() === (product.supplier || '').toLowerCase()
          );

          await window.electronAPI.createProduct({
            sku: product.sku,
            name: product.name,
            category_id: category?.id || categories[0]?.id,
            unit: product.unit || 'pcs',
            stock_qty: parseInt(product.stock_qty || '0'),
            reorder_level: parseInt(product.reorder_level || '10'),
            cost_price: parseFloat(product.cost_price),
            selling_price: parseFloat(product.selling_price),
            supplier_id: supplier?.id || null,
          });
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(`Failed to import row ${i + 1}:`, error);
        }
      }

      alert(`Import complete!\nSuccess: ${successCount}\nFailed: ${errorCount}`);
      setImporting(false);
      onSuccess();
    };

    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = 'sku,name,category,unit,stock_qty,reorder_level,cost_price,selling_price,supplier\n' +
      'SKU001,Sample Product,Electrical,pcs,100,10,50.00,75.00,Sample Supplier\n' +
      'SKU002,Another Product,Plumbing,box,50,5,100.00,150.00,';
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_import_template.csv';
    a.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Import Products from CSV</h2>

        <div className="mb-6 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">CSV Format Requirements:</h3>
          <ul className="text-sm space-y-1 mb-3">
            <li>• Required columns: sku, name, category, unit, cost_price, selling_price</li>
            <li>• Optional columns: stock_qty, reorder_level, supplier</li>
            <li>• First row must be headers</li>
            <li>• Use comma (,) as separator</li>
          </ul>
          <button onClick={downloadTemplate} className="btn btn-secondary text-sm">
            📥 Download Template
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select CSV File</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="input"
          />
        </div>

        {errors.length > 0 && (
          <div className="mb-4 bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-700 mb-2">Errors:</h4>
            <ul className="text-sm text-red-600 space-y-1">
              {errors.map((error, i) => (
                <li key={i}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {preview.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Preview (first 10 rows):</h3>
            <div className="overflow-x-auto border rounded">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">SKU</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Category</th>
                    <th className="p-2 text-left">Unit</th>
                    <th className="p-2 text-right">Cost</th>
                    <th className="p-2 text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((product, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{product.sku}</td>
                      <td className="p-2">{product.name}</td>
                      <td className="p-2">{product.category}</td>
                      <td className="p-2">{product.unit}</td>
                      <td className="p-2 text-right">₱{product.cost_price}</td>
                      <td className="p-2 text-right">₱{product.selling_price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} disabled={importing} className="flex-1 btn btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!file || preview.length === 0 || importing}
            className="flex-1 btn btn-primary"
          >
            {importing ? 'Importing...' : `Import ${preview.length > 0 ? preview.length + '+' : ''} Products`}
          </button>
        </div>
      </div>
    </div>
  );
}
