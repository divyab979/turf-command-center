import { useQuery } from "@tanstack/react-query";
import { getBookings } from "../api/get-bookings";

export function useBookings() {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: getBookings,
  });
}