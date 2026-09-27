"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartModifier {
  optionId: string;
  name: string;
  priceDelta: number;
}

export interface CartItem {
  key: string; // productId + sorted modifier ids, so identical customizations merge
  productId: string;
  name: string;
  imageUrl?: string | null;
  unitBasePrice: number;
  quantity: number;
  notes?: string;
  modifiers: CartModifier[];
}

interface CartState {
  items: CartItem[];
  // Which table session this persisted cart belongs to — the store itself is a
  // browser-wide singleton (one localStorage key), so without this a device that's
  // scanned a different table since its last visit would silently resurrect a stale,
  // unrelated cart. ensureSession clears the cart whenever the active session changes.
  cartTableSessionId: string | null;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  ensureSession: (tableSessionId: string) => void;
}

function lineUnitPrice(item: Pick<CartItem, "unitBasePrice" | "modifiers">) {
  return item.unitBasePrice + item.modifiers.reduce((sum, m) => sum + m.priceDelta, 0);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cartTableSessionId: null,
      ensureSession: (tableSessionId) => {
        if (get().cartTableSessionId === tableSessionId) return;
        set({ items: [], cartTableSessionId: tableSessionId });
      },
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.key === item.key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === item.key ? { ...i, quantity: i.quantity + (item.quantity ?? 1) } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: item.quantity ?? 1 }] };
        }),
      updateQuantity: (key, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.key !== key)
              : state.items.map((i) => (i.key === key ? { ...i, quantity } : i)),
        })),
      removeItem: (key) => set((state) => ({ items: state.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [] }),
    }),
    { name: "menu-os-cart" }
  )
);

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + lineUnitPrice(i) * i.quantity, 0);
}

export function cartLineTotal(item: CartItem) {
  return lineUnitPrice(item) * item.quantity;
}

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
