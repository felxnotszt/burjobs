import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  qty: number;
  optionValueIds: string[];
  optionLabels: string[];
  extraPrice: number;
  note: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (index: number) => void;
  updateQty: (index: number, qty: number) => void;
  updateNote: (index: number, note: string) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((s) => ({ items: [...s.items, item] })),
      removeItem: (index) => set((s) => ({ items: s.items.filter((_, i) => i !== index) })),
      updateQty: (index, qty) => set((s) => ({
        items: s.items.map((it, i) => i === index ? { ...it, qty: Math.max(1, qty) } : it),
      })),
      updateNote: (index, note) => set((s) => ({
        items: s.items.map((it, i) => i === index ? { ...it, note } : it),
      })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, it) => sum + (it.price + it.extraPrice) * it.qty, 0),
      count: () => get().items.reduce((sum, it) => sum + it.qty, 0),
    }),
    { name: 'burjoku-cart' }
  )
);
