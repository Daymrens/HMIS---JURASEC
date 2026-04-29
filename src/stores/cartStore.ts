import { create } from 'zustand';
import { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  discount: number;
  taxEnabled: boolean;
  taxRate: number;
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: number, qty: number) => void;
  updateItemDiscount: (productId: number, discount: number) => void;
  removeItem: (productId: number) => void;
  setDiscount: (discount: number) => void;
  setTaxEnabled: (enabled: boolean) => void;
  setTaxRate: (rate: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  discount: 0,
  taxEnabled: true,
  taxRate: 0.12,

  addItem: (item) => set((state) => {
    const existingItem = state.items.find(i => i.product_id === item.product_id);
    if (existingItem) {
      return {
        items: state.items.map(i =>
          i.product_id === item.product_id
            ? { ...i, qty: i.qty + item.qty, subtotal: (i.qty + item.qty) * i.unit_price * (1 - i.discount / 100) }
            : i
        ),
      };
    }
    return { items: [...state.items, item] };
  }),

  updateQuantity: (productId, qty) => set((state) => ({
    items: state.items.map(item =>
      item.product_id === productId
        ? { ...item, qty, subtotal: qty * item.unit_price * (1 - item.discount / 100) }
        : item
    ),
  })),

  updateItemDiscount: (productId, discount) => set((state) => ({
    items: state.items.map(item =>
      item.product_id === productId
        ? { ...item, discount, subtotal: item.qty * item.unit_price * (1 - discount / 100) }
        : item
    ),
  })),

  removeItem: (productId) => set((state) => ({
    items: state.items.filter(item => item.product_id !== productId),
  })),

  setDiscount: (discount) => set({ discount }),
  setTaxEnabled: (enabled) => set({ taxEnabled: enabled }),
  setTaxRate: (rate) => set({ taxRate: rate }),
  clearCart: () => set({ items: [], discount: 0 }),

  getSubtotal: () => {
    const state = get();
    const itemsTotal = state.items.reduce((sum, item) => sum + item.subtotal, 0);
    return itemsTotal * (1 - state.discount / 100);
  },

  getTax: () => {
    const state = get();
    return state.taxEnabled ? state.getSubtotal() * state.taxRate : 0;
  },

  getTotal: () => {
    const state = get();
    return state.getSubtotal() + state.getTax();
  },
}));
