import { revenueOverviewMock } from "../mock/dashboard.mock";

export async function getRevenueOverview() {
  await new Promise((resolve) =>
    setTimeout(resolve, 700)
  );

  return revenueOverviewMock;
}