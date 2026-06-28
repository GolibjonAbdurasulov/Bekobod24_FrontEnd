import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  storeId: string;
  storeName?: string;
};

export type CartStore = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((s) => {
          const ex = s.items.find((i) => i.productId === item.productId);
          if (ex) return { items: s.items.map((i) => i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i) };
          return { items: [...s.items, { ...item, quantity: 1 }] };
        }),
      inc: (id) => set((s) => ({ items: s.items.map((i) => i.productId === id ? { ...i, quantity: i.quantity + 1 } : i) })),
      dec: (id) => set((s) => ({ items: s.items.map((i) => i.productId === id && i.quantity > 1 ? { ...i, quantity: i.quantity - 1 } : i).filter((i) => i.quantity > 0) })),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.productId !== id) })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: "b24-cart" }
  )
);
