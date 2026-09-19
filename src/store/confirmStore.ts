import { create } from "zustand";

/** Visual weight of the confirm button; "danger" tints it red. */
export type ConfirmTone = "danger" | "primary";

export interface ConfirmPayload {
  title: string;
  message: string;
  /** Label of the confirming action (e.g. t("common.delete")). */
  confirmLabel: string;
  tone?: ConfirmTone;
  /** Runs only when the user confirms; cancel/backdrop never triggers it. */
  onConfirm: () => void;
}

interface ConfirmState {
  request: (ConfirmPayload & { id: number }) | null;
  show: (payload: ConfirmPayload) => void;
  dismiss: () => void;
}

export const useConfirmStore = create<ConfirmState>((set) => ({
  request: null,
  show: (payload) =>
    set({ request: { ...payload, id: Date.now() } }),
  dismiss: () => set({ request: null }),
}));

/** Imperative entry point mirroring the `toast` helper in toastStore. */
export const confirmDialog = {
  show: (payload: ConfirmPayload) => useConfirmStore.getState().show(payload),
};
