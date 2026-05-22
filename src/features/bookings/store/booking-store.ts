import { create } from "zustand";

type BookingStore = {

  bookingId: string | null;

  paymentStatus:
    | "idle"
    | "processing"
    | "success"
    | "failed";

  setBookingId: (
    bookingId: string | null
  ) => void;

  setPaymentStatus: (
    status:
      | "idle"
      | "processing"
      | "success"
      | "failed"
  ) => void;

  resetBooking: () => void;
};

export const useBookingStore =
  create<BookingStore>((set) => ({

    bookingId: null,

    paymentStatus: "idle",

    setBookingId: (
      bookingId
    ) =>
      set({
        bookingId,
      }),

    setPaymentStatus: (
      paymentStatus
    ) =>
      set({
        paymentStatus,
      }),

    resetBooking: () =>
      set({
        bookingId: null,
        paymentStatus: "idle",
      }),

  }));