import { useQuery } from "@tanstack/react-query";
import { getRevenueOverview } from "../api/get-revenue-overview";

export function useRevenueOverview() {
  return useQuery({
    queryKey: ["revenue-overview"],
    queryFn: getRevenueOverview,
  });
}