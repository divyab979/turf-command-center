import { createFileRoute } from "@tanstack/react-router";

import {
  MoreHorizontal,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import type {
  ColumnDef,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";

import { PageHeader } from "@/components/dashboard/page-header";

import { DataTable } from "@/components/dashboard/data-table";

import { StatusBadge } from "@/components/dashboard/status-badge";

import { FilterBar } from "@/components/dashboard/filter-bar";

import { FilterSelect } from "@/components/dashboard/filter-select";

import { DetailDrawer } from "../../components/dashboard/detail-drawer";
import { useBookings } from "@/features/bookings/hooks/use-bookings";import { PageLoader } from "@/components/feedback/page-loader";

import { EmptyState } from "@/components/feedback/empty-state";

import { ErrorState } from "@/components/feedback/error-state";
import type { Booking } from "@/features/bookings/types/booking.types";

export const Route = createFileRoute(
  "/_authenticated/bookings"
)({
  component: BookingsPage,
});



function BookingsPage() {
  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("all");

  const [
    selectedBooking,
    setSelectedBooking,
  ] = useState<Booking | null>(
    null
  );

const {
  data = [],
  isLoading,
  isError,
} = useBookings();

const filteredData = useMemo(() => {
  return data.filter((booking) => {
    const matchesSearch =
      booking.customer
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      booking.id
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      status === "all"
        ? true
        : booking.status === status;

    return (
      matchesSearch &&
      matchesStatus
    );
  });
}, [data, search, status]);

  const columns: ColumnDef<Booking>[] =
    [
      {
        accessorKey: "id",
        header: "Booking ID",
      },
      {
        accessorKey: "customer",
        header: "Customer",
      },
      {
        accessorKey: "venue",
        header: "Venue",
      },
      {
        accessorKey: "slot",
        header: "Slot",
      },
      {
        accessorKey: "amount",
        header: "Amount",
      },
      {
        accessorKey: "status",
        header: "Status",

        cell: ({ row }) => (
          <StatusBadge
            status={
              row.original.status
            }
          />
        ),
      },
      {
        id: "actions",

        header: "",

        cell: ({ row }) => (
          <Button
            size="icon"
            variant="ghost"
            className="rounded-xl"
            onClick={() =>
              setSelectedBooking(
                row.original
              )
            }
          >
            <MoreHorizontal
              size={18}
            />
          </Button>
        ),
      },
    ];

if (isLoading) {
  return <PageLoader />;
}

if (isError) {
  return (
    <ErrorState message="Failed to load bookings" />
  );
}

if (!data.length) {
  return (
    <EmptyState
      title="No bookings found"
      description="Bookings will appear here."
    />
  );
}

  return (
    <div>
      <PageHeader
        title="Bookings"
        description="Manage all venue bookings and reservations."
        action={
          <Button className="rounded-2xl bg-primary hover:bg-primary/90">
            Add Booking
          </Button>
        }
      />

      <FilterBar
        search={search}
        setSearch={setSearch}
      >
        <FilterSelect
          placeholder="Status"
          value={status}
          onChange={setStatus}
          options={[
            {
              label: "All Status",
              value: "all",
            },
            {
              label: "Confirmed",
              value: "confirmed",
            },
            {
              label: "Pending",
              value: "pending",
            },
            {
              label: "Completed",
              value: "completed",
            },
            {
              label: "Cancelled",
              value: "cancelled",
            },
          ]}
        />
      </FilterBar>

      <DataTable
        columns={columns}
        data={filteredData}
      />

      <DetailDrawer
        open={!!selectedBooking}
        onOpenChange={() =>
          setSelectedBooking(null)
        }
        title={
          selectedBooking?.id ||
          "Booking Details"
        }
        description="Manage booking details and payments."
      >
        <div className="space-y-6">
          
          <div className="rounded-2xl border border-border bg-white p-5">
            
            <p className="text-sm text-muted-foreground">
              Customer
            </p>

            <h3 className="mt-2 text-lg font-semibold">
              {
                selectedBooking?.customer
              }
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            
            <div className="rounded-2xl border border-border bg-white p-5">
              
              <p className="text-sm text-muted-foreground">
                Venue
              </p>

              <h3 className="mt-2 font-semibold">
                {
                  selectedBooking?.venue
                }
              </h3>
            </div>

            <div className="rounded-2xl border border-border bg-white p-5">
              
              <p className="text-sm text-muted-foreground">
                Slot
              </p>

              <h3 className="mt-2 font-semibold">
                {
                  selectedBooking?.slot
                }
              </h3>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-5">
            
            <p className="text-sm text-muted-foreground">
              Amount
            </p>

            <h3 className="mt-2 text-2xl font-bold text-primary">
              {
                selectedBooking?.amount
              }
            </h3>
          </div>

          <div className="flex gap-3">
            
            <Button className="flex-1 rounded-2xl bg-primary hover:bg-primary/90">
              Edit Booking
            </Button>

            <Button
              variant="outline"
              className="flex-1 rounded-2xl"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DetailDrawer>
    </div>
  );
}