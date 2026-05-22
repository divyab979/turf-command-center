import { createFileRoute } from "@tanstack/react-router";

import {
  IndianRupee,
  CalendarDays,
  CircleDollarSign,
  Activity,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { KpiCard } from "@/components/dashboard/kpi-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { SectionCard } from "@/components/dashboard/section-card";

import { PageLoader } from "@/components/feedback/page-loader";
import { ErrorState } from "@/components/feedback/error-state";

import { RevenueChart } from "@/features/dashboard/components/revenue-chart";

import { useDashboardStats } from "@/features/dashboard/hooks/use-dashboard-stats";
import { useRevenueOverview } from "@/features/dashboard/hooks/use-revenue-overview";
import { useRecentBookings } from "@/features/dashboard/hooks/use-recent-bookings";

export const Route = createFileRoute(
  "/_authenticated/dashboard"
)({
  component: DashboardPage,
});

function DashboardPage() {
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useDashboardStats();

  const {
    data: revenueData,
    isLoading: revenueLoading,
    isError: revenueError,
  } = useRevenueOverview();

  const {
    data: recentBookings,
  } = useRecentBookings();

  if (statsLoading || revenueLoading) {
    return <PageLoader />;
  }

  if (
    statsError ||
    revenueError ||
    !stats ||
    !revenueData
  ) {
    return (
      <ErrorState message="Failed to load dashboard" />
    );
  }

  return (
    <div>

      <PageHeader
        title="Dashboard"
        description="Monitor venue operations, bookings and revenue."
        action={
          <Button className="rounded-2xl bg-primary hover:bg-primary/90">
            Add Booking
          </Button>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        <KpiCard
          title="Revenue Today"
          value={`₹${stats.revenueToday.toLocaleString()}`}
          change="+12.4%"
          positive
          icon={IndianRupee}
        />

        <KpiCard
          title="Bookings"
          value={String(stats.bookingsToday)}
          change="+8.1%"
          positive
          icon={CalendarDays}
        />

        <KpiCard
          title="Occupancy"
          value={`${stats.occupancyRate}%`}
          change="+5.2%"
          positive
          icon={Activity}
        />

        <KpiCard
          title="Pending Payments"
          value={`₹${stats.pendingPayments.toLocaleString()}`}
          change="-2.1%"
          positive={false}
          icon={CircleDollarSign}
        />

      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-4">

        <div className="xl:col-span-2">

          <SectionCard title="Revenue Overview">
            <RevenueChart data={revenueData} />
          </SectionCard>

        </div>

        <div className="xl:col-span-1">

          <SectionCard title="Today's Summary">

            <div className="space-y-5">

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Confirmed Bookings
                </span>

                <span className="font-semibold">
                  32
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Cancelled
                </span>

                <span className="font-semibold text-red-500">
                  4
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Active Turfs
                </span>

                <span className="font-semibold">
                  12
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Peak Slot
                </span>

                <span className="font-semibold">
                  7PM - 9PM
                </span>
              </div>

            </div>

          </SectionCard>

        </div>

        <div className="xl:col-span-1">

          <SectionCard title="Recent Bookings">

            <div className="space-y-4">

              {recentBookings?.map((booking) => (

                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-xl border border-border p-4"
                >

                  <div>
                    <p className="font-medium">
                      {booking.customer}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {booking.venue} • {booking.slot}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      ₹{booking.amount}
                    </p>

                    <p className="text-xs capitalize text-muted-foreground">
                      {booking.status}
                    </p>
                  </div>

                </div>

              ))}

            </div>

          </SectionCard>

        </div>

      </div>

    </div>
  );
}