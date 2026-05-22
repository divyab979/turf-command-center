import { api } from "@/lib/api";

import type {
  Booking,
} from "../types/booking.types";

export async function getBookings(): Promise<Booking[]> {

  const res =
    await api.get(
      "/bookings/admin"
    );

  return res.data.map(
    (booking: any) => ({

      id: booking.id,

      customer:
        booking.customerName ||
        booking.user?.name ||
        "Unknown",

      venue:
        booking.venue?.name ||
        "Unknown Venue",

      slot:
        `${booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''} • ${booking.slot?.startTime} - ${booking.slot?.endTime}`,

      amount:
        booking.totalAmount,

      status:
        booking.status
          ?.toLowerCase(),
    })
  );
}