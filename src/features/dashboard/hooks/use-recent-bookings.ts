import { useQuery } from "@tanstack/react-query";
import { getRecentBookings } from "../api/get-recent-bookings";

export function useRecentBookings() {
  return useQuery({
    queryKey: ["recent-bookings"],
    queryFn: getRecentBookings,
  });
}