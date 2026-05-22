import { createFileRoute } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth-store";
import { SuperAdminDashboard } from "@/components/dashboard/SuperAdminDashboard";
import { OwnerDashboard } from "@/components/dashboard/OwnerDashboard";
import { SupervisorDashboard } from "@/components/dashboard/SupervisorDashboard";

export const Route = createFileRoute("/_authenticated/dashboard")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      view: (search.view as string) || "dashboard",
    };
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuthStore();
  const { view } = Route.useSearch();

  const role = user?.role || "SUPERVISOR";

  if (role === "SUPER_ADMIN") {
    return <SuperAdminDashboard view={view} />;
  }

  if (role === "OWNER") {
    return <OwnerDashboard view={view} />;
  }

  return <SupervisorDashboard view={view} />;
}