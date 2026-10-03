import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: CartProduct, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

function assertQuantity(quantity: number, allowZero = false): void {
  if (!Number.isInteger(quantity) || quantity < (allowZero ? 0 : 1)) {
    throw new RangeError("Cart quantity must be a positive integer.");
  }
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        assertQuantity(quantity);
        set((state) => {
          const existing = state.items.find(
            (item) => item.product.id === product.id,
          );
          return existing
            ? {
                items: state.items.map((item) =>
                  item.product.id === product.id
                    ? {
                        ...item,
                        product,
                        quantity: item.quantity + quantity,
                      }
                    : item,
                ),
              }
            : { items: [...state.items, { product, quantity }] };
        });
      },
      setQuantity: (productId, quantity) => {
        assertQuantity(quantity, true);
        set((state) => ({
          items:
            quantity === 0
              ? state.items.filter((item) => item.product.id !== productId)
              : state.items.map((item) =>
                  item.product.id === productId ? { ...item, quantity } : item,
                ),
        }));
      },
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "torino.cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export function getCartCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function getCartSubtotal(items: CartItem[]): number {
  return items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );
}
