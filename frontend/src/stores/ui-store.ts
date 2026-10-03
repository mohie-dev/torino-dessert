import { create } from "zustand";

export type ToastKind = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  kind: ToastKind;
  message: string;
}

interface UIStore {
  isMobileMenuOpen: boolean;
  toasts: ToastMessage[];
  setMobileMenuOpen: (isOpen: boolean) => void;
  toggleMobileMenu: () => void;
  notify: (kind: ToastKind, message: string) => void;
  dismissToast: (id: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isMobileMenuOpen: false,
  toasts: [],
  setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  notify: (kind, message) =>
    set((state) => ({
      toasts: [...state.toasts, { id: crypto.randomUUID(), kind, message }],
    })),
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));
