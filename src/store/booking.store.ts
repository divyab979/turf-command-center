import { create } from 'zustand'

interface BookingStore {
  selectedSlot: any | null

  lockExpiresAt: string | null

  drawerOpen: boolean

  setSelectedSlot: (
    slot: any,
  ) => void

  setLockExpiresAt: (
    value: string,
  ) => void

  setDrawerOpen: (
    value: boolean,
  ) => void

  clearBooking: () => void
}

export const useBookingStore =
  create<BookingStore>((set) => ({
    selectedSlot: null,

    lockExpiresAt: null,

    drawerOpen: false,

    setSelectedSlot: (slot) =>
      set({
        selectedSlot: slot,
      }),

    setLockExpiresAt: (value) =>
      set({
        lockExpiresAt: value,
      }),

    setDrawerOpen: (value) =>
      set({
        drawerOpen: value,
      }),

    clearBooking: () =>
      set({
        selectedSlot: null,
        lockExpiresAt: null,
        drawerOpen: false,
      }),
  }))