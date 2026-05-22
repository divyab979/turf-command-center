export interface DashboardStats {
  revenueToday: number;
  bookingsToday: number;
  occupancyRate: number;
  pendingPayments: number;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
}

export interface RecentBooking {
  id: string;
  customer: string;
  venue: string;
  slot: string;
  amount: number;
  status:
    | "confirmed"
    | "pending"
    | "completed";
}