import { recentBookingsMock } from "../mock/dashboard.mock";

export async function getRecentBookings() {
  await new Promise((resolve) =>
    setTimeout(resolve, 500)
  );

  return recentBookingsMock;
}