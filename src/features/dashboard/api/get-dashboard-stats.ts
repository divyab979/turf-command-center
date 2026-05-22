import { dashboardStatsMock } from "../mock/dashboard.mock";

export async function getDashboardStats() {
  await new Promise((resolve) =>
    setTimeout(resolve, 600)
  );

  return dashboardStatsMock;
}