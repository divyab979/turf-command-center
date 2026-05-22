import { create } from "zustand";

type SlotStore = {
  selectedSlotId: string | null;

  lockExpiresAt: number | null;

  setSelectedSlot: (
    slotId: string | null
  ) => void;

  setLockExpiresAt: (
    expiresAt: number | null
  ) => void;

  clearSelection: () => void;
};

export const useSlotStore =
  create<SlotStore>((set) => ({

    selectedSlotId: null,

    lockExpiresAt: null,

    setSelectedSlot: (
      slotId
    ) =>
      set({
        selectedSlotId: slotId,
      }),

    setLockExpiresAt: (
      expiresAt
    ) =>
      set({
        lockExpiresAt: expiresAt,
      }),

    clearSelection: () =>
      set({
        selectedSlotId: null,
        lockExpiresAt: null,
      }),

  }));