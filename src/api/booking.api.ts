import { api } from '@/lib/api'

export const bookingApi = {
  lockSlot: async (slotId: string) => {
    const res = await api.post(
      '/bookings/lock',
      { slotId },
    )

    return res.data
  },

  confirmBooking: async (
    slotId: string,
  ) => {
    const res = await api.post(
      '/bookings/confirm',
      { slotId },
    )

    return res.data
  },
}