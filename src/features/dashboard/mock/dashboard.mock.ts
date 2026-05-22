import type {
  DashboardStats,
  RevenuePoint,
  RecentBooking,
} from "../types/dashboard.types";

export const dashboardStatsMock: DashboardStats = {
  revenueToday: 24500,
  bookingsToday: 42,
  occupancyRate: 78,
  pendingPayments: 8000,
};

export const revenueOverviewMock: RevenuePoint[] = [
  { date: "Mon", revenue: 12000 },
  { date: "Tue", revenue: 18000 },
  { date: "Wed", revenue: 15000 },
  { date: "Thu", revenue: 22000 },
  { date: "Fri", revenue: 26000 },
  { date: "Sat", revenue: 32000 },
  { date: "Sun", revenue: 28000 },
];

export const recentBookingsMock: RecentBooking[] = [
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
];