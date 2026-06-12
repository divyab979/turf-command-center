export type BookingStatus =
  | "confirmed"
  | "pending"
  | "completed"
  | "cancelled";

export interface Booking {
  id: string;
  customer: string;
  venue: string;
  slot: string;
  amount: number;
  status: BookingStatus;
  cashPaymentRequested?: boolean;
  paymentStatus?: string;
  advancePaid?: number;
  remainingAmount?: number;
  paymentMethod?: string;
  venueId?: string;
  bookingDate?: string;
  customerPhone?: string;
  notes?: string;
  turfName?: string;
  startTime?: string;
  endTime?: string;
}