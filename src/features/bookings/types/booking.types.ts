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
}