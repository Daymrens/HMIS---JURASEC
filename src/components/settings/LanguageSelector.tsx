import { useState, useEffect } from 'react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'fil', name: 'Filipino', nativeName: 'Filipino', flag: '🇵🇭' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
];

// Translation dictionary (sample - would be expanded in production)
const translations: Record<string, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard',
    pos: 'POS',
    inventory: 'Inventory',
    customers: 'Customers',
    suppliers: 'Suppliers',
    reports: 'Reports',
    settings: 'Settings',
    logout: 'Logout',
    total: 'Total',
    subtotal: 'Subtotal',
    tax: 'Tax',
    discount: 'Discount',
    payment: 'Payment',
    cash: 'Cash',
    card: 'Card',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    print: 'Print',
  },
  fil: {
    dashboard: 'Dashboard',
    pos: 'POS',
    inventory: 'Imbentaryo',
    customers: 'Mga Kostumer',
    suppliers: 'Mga Supplier',
    reports: 'Mga Ulat',
    settings: 'Mga Setting',
    logout: 'Mag-logout',
    total: 'Kabuuan',
    subtotal: 'Subtotal',
    tax: 'Buwis',
    discount: 'Diskwento',
    payment: 'Bayad',
    cash: 'Cash',
    card: 'Card',
    save: 'I-save',
    cancel: 'Kanselahin',
    delete: 'Tanggalin',
    edit: 'I-edit',
    add: 'Magdagdag',
    search: 'Maghanap',
    filter: 'I-filter',
    export: 'I-export',
    print: 'I-print',
  },
};

export default function LanguageSelector() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('app_language');
    if (saved) setSelectedLanguage(saved);
  }, []);

  const changeLanguage = (code: string) => {
    setSelectedLanguage(code);
    localStorage.setItem('app_language', code);
    localStorage.setItem('translations', JSON.stringify(translations[code] || translations.en));
    
    alert(`Language changed to ${languages.find(l => l.code === code)?.name}. Some text will update immediately, full translation requires app restart.`);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Language / Wika</h3>

      <div className="card bg-blue-50">
        <p className="text-sm text-gray-600">
          Select your preferred language. The interface will be translated to the selected language.
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Piliin ang iyong gustong wika. Ang interface ay isasalin sa napiling wika.
        </p>
      </div>

      {/* Language Selection */}
      <div className="grid grid-cols-2 gap-4">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`card flex items-center gap-4 p-4 transition-all hover:scale-105 ${
              selectedLanguage === language.code
                ? 'border-2 border-accent shadow-lg bg-orange-50'
                : 'border-2 border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-4xl">{language.flag}</span>
            <div className="text-left">
              <p className="font-semibold">{language.name}</p>
              <p className="text-sm text-gray-600">{language.nativeName}</p>
            </div>
            {selectedLanguage === language.code && (
              <span className="ml-auto text-accent text-2xl">✓</span>
            )}
          </button>
        ))}
      </div>

      {/* Translation Status */}
      <div className="card">
        <h4 className="font-semibold mb-3">Translation Coverage</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">English</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '100%' }}></div>
              </div>
              <span className="text-sm font-semibold">100%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Filipino</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500" style={{ width: '60%' }}></div>
              </div>
              <span className="text-sm font-semibold">60%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Other Languages</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: '20%' }}></div>
              </div>
              <span className="text-sm font-semibold">20%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Translations */}
      <div className="card">
        <h4 className="font-semibold mb-3">Preview</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(translations[selectedLanguage] || translations.en)
            .slice(0, 10)
            .map(([key, value]) => (
              <div key={key} className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">{key}:</span>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Info */}
      <div className="card bg-yellow-50">
        <h4 className="font-semibold mb-2">📝 Note</h4>
        <p className="text-sm text-gray-600">
          Full translation support is in progress. Currently, basic UI elements are translated.
          For complete translation, please contribute to the translation files.
        </p>
      </div>
    </div>
  );
}

// Utility function to get translation
export const t = (key: string): string => {
  const translations = JSON.parse(localStorage.getItem('translations') || '{}');
  return translations[key] || key;
};
