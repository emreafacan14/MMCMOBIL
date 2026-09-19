import { create } from "zustand";

export type ToastKind = "success" | "error" | "info";

export interface ToastPayload {
  kind: ToastKind;
  message: string;
}

interface ToastState {
  toast: (ToastPayload & { id: number }) | null;
  show: (payload: ToastPayload) => void;
  dismiss: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toast: null,
  show: ({ kind, message }) =>
    set({ toast: { kind, message, id: Date.now() } }),
  dismiss: () => set({ toast: null }),
}));

export const toast = {
  success: (message: string) => useToastStore.getState().show({ kind: "success", message }),
  error: (message: string) => useToastStore.getState().show({ kind: "error", message }),
  info: (message: string) => useToastStore.getState().show({ kind: "info", message }),
};
