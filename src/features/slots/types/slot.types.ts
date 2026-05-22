export type SlotStatus =
  | "available"
  | "booked"
  | "blocked"
  | "maintenance"
  | "locked";

export interface Slot {
  id: string;

  turfId: string;

  startTime: string;
  endTime: string;

  date: string;

  price: number;

  status: SlotStatus;
  lockedBy?: string;

lockExpiresAt?: string;
}