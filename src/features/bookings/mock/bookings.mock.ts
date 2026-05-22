import type { Booking } from "../types/booking.types";

export const bookingsMock: Booking[] = [
  {
    id: "BK-1024",
    customer: "Rahul Sharma",
    venue: "Arena Turf",
    slot: "7PM - 8PM",
    amount: 1200,
    status: "confirmed",
  },
  {
    id: "BK-1025",
    customer: "Aman Verma",
    venue: "Goal Arena",
    slot: "9PM - 10PM",
    amount: 1500,
    status: "pending",
  },
  {
    id: "BK-1026",
    customer: "Rohan Mehta",
    venue: "Turf Nation",
    slot: "6PM - 7PM",
    amount: 1800,
    status: "completed",
  },
];