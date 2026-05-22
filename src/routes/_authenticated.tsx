import { createFileRoute, Outlet } from "@tanstack/react-router";

import { ProtectedRoute } from "@/guards/protected-route";
import { DashboardLayout } from "@/layouts/dashboard-layout";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    </ProtectedRoute>
  );
}