import { create } from 'zustand';

interface SettingsState {
  theme: 'light' | 'dark';
  companyName: string;
  taxRate: number;
  receiptHeader: string;
  receiptFooter: string;
  setTheme: (theme: 'light' | 'dark') => void;
  loadSettings: (settings: Record<string, string>) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'light',
  companyName: 'Jurasec Enterprises',
  taxRate: 0.12,
  receiptHeader: 'Thank you for your business!',
  receiptFooter: 'Please come again',

  setTheme: (theme) => {
    set({ theme });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  loadSettings: (settings) => {
    set({
      theme: (settings.theme as 'light' | 'dark') || 'light',
      companyName: settings.company_name || 'Jurasec Enterprises',
      taxRate: parseFloat(settings.tax_rate) || 0.12,
      receiptHeader: settings.receipt_header || 'Thank you for your business!',
      receiptFooter: settings.receipt_footer || 'Please come again',
    });
  },
}));
