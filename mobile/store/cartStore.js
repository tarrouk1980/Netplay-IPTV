import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items: [],
  merchantId: null,
  addItem: (item, merchantId) => {
    const { items, merchantId: currentMerchant } = get();
    if (currentMerchant && currentMerchant !== merchantId) {
      set({ items: [{ ...item, qty: 1 }], merchantId });
      return;
    }
    const existing = items.find((i) => i.id === item.id);
    if (existing) {
      set({ items: items.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i) });
    } else {
      set({ items: [...items, { ...item, qty: 1 }], merchantId });
    }
  },
  removeItem: (itemId) => set((s) => ({ items: s.items.filter((i) => i.id !== itemId) })),
  updateQty: (itemId, qty) => {
    if (qty <= 0) { get().removeItem(itemId); return; }
    set((s) => ({ items: s.items.map((i) => i.id === itemId ? { ...i, qty } : i) }));
  },
  clearCart: () => set({ items: [], merchantId: null }),
  total: () => get().items.reduce((sum, i) => sum + (i.price * i.qty), 0),
  count: () => get().items.reduce((sum, i) => sum + i.qty, 0),
}));

export default useCartStore;
