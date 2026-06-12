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
        booking.slot
          ? `${booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''} • ${booking.slot.startTime} - ${booking.slot.endTime}`
          : `${booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''} • ${booking.startTime || ''} - ${booking.endTime || ''} (Custom)`,

      amount:
        booking.totalAmount,

      status:
        booking.status
          ?.toLowerCase(),

      cashPaymentRequested:
        booking.cashPaymentRequested,

      paymentStatus:
        booking.paymentStatus,

      advancePaid:
        booking.advancePaid,

      remainingAmount:
        booking.remainingAmount,
      paymentMethod:
        booking.paymentMethod,
      venueId:
        booking.venueId,
      bookingDate:
        booking.bookingDate,
      customerPhone:
        booking.customerPhone,
      notes:
        booking.notes,
      turfName:
        booking.turf?.name,
      startTime:
        booking.slot?.startTime || booking.startTime,
      endTime:
        booking.slot?.endTime || booking.endTime,
    })
  );
}