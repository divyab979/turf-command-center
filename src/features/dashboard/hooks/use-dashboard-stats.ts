import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../api/get-dashboard-stats";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });
}