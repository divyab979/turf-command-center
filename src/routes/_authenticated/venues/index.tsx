import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { SectionCard } from "@/components/dashboard/section-card";
import { DataTable } from "@/components/dashboard/data-table";
import { PageLoader } from "@/components/feedback/page-loader";
import { ErrorState } from "@/components/feedback/error-state";
import { useVenues } from "@/features/venue/hooks/use-venues";
import { useState, useEffect } from "react";
import { DetailDrawer } from "@/components/dashboard/detail-drawer";
import { CreateVenueForm } from "@/features/venue/components/create-venue-form";
import { useAuthStore } from "@/store/auth-store";
import { ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/venues/")({
  component: VenuesPage,
});

function VenuesPage() {
  const { user } = useAuthStore();
  const role = user?.role || "SUPERVISOR";

  const { data = [], isLoading, isError } = useVenues();
  const [localVenues, setLocalVenues] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (data.length) {
      const initial = data.map((venue: any, idx) => ({
        ...venue,
        status: "Approved",
        address: venue.address || `${venue.name} Street, ${venue.location}`,
        photos: venue.photos || ["https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800"],
        amenities: venue.amenities || ["parking", "washroom", "floodlights"],
      }));
      setLocalVenues(initial);
    } else {
      setLocalVenues([]);
    }
  }, [data]);

  if (role === "SUPERVISOR") {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center p-6 space-y-4 font-semibold text-slate-700">
        <ShieldAlert size={54} className="text-red-600 animate-bounce" />
        <h2 className="text-2xl font-bold text-slate-800">Access Denied</h2>
        <p className="text-slate-500 max-w-sm">
          Supervisor accounts are restricted to shift dashboards and ground checklists. Venue listings are restricted to Venue Owners and Super Admins.
        </p>
      </div>
    );
  }

  const handleToggleApproval = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Approved" ? "Pending Approval" : "Approved";
    const updated = localVenues.map((v) => (v.id === id ? { ...v, status: nextStatus } : v));
    setLocalVenues(updated);
    localStorage.setItem("custom_venues", JSON.stringify(updated));
    toast.success(
      nextStatus === "Approved"
        ? "Venue approved and listed successfully"
        : "Venue status toggled back to pending"
    );
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Venue",
      cell: ({ row }) => (
        <Link
          to="/venues/$venueId"
          params={{ venueId: row.original.id }}
          className="font-bold text-emerald-800 hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "location",
      header: "Location",
    },
    {
      id: "owner",
      header: "Owner",
      cell: ({ row }) => <span>{row.original.owner?.name || "Global Owner"}</span>,
    },
    {
      id: "turfs",
      header: "Turfs",
      cell: ({ row }) => <span>{row.original.turfs?.length || 0} arenas</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const isApproved = row.original.status === "Approved";
        return (
          <span
            className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
              isApproved ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50"
            }`}
          >
            {isApproved ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
            {row.original.status}
          </span>
        );
      },
    },
    ...(role === "SUPER_ADMIN"
      ? [
          {
            id: "actions",
            header: "Admin Actions",
            cell: ({ row }: any) => (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleToggleApproval(row.original.id, row.original.status)}
                className={`rounded-xl text-xs font-bold px-3.5 py-1.5 h-auto ${
                  row.original.status === "Approved"
                    ? "text-amber-700 hover:bg-amber-50"
                    : "text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                {row.original.status === "Approved" ? "Reject" : "Approve"}
              </Button>
            ),
          },
        ]
      : []),
  ];

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError || !data) {
    return <ErrorState message="Failed to load venues" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Venues Listing"
        description="Configure multi-branch locations, linked turf specs, and clearance parameters."
        action={
          role === "OWNER" && (
            <Button
              className="rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold"
              onClick={() => setOpen(true)}
            >
              Add Venue
            </Button>
          )
        }
      />

      <SectionCard title="Registered Platforms Branches">
        <DataTable columns={columns} data={localVenues} />
      </SectionCard>

      <DetailDrawer
        open={open}
        onOpenChange={setOpen}
        title="Create Venue"
        description="Add a new operational venue."
      >
        <CreateVenueForm onSuccess={() => setOpen(false)} />
      </DetailDrawer>
    </div>
  );
}