import { createFileRoute } from "@tanstack/react-router";
import { MoreHorizontal, CheckCircle, Clock, XCircle, ChevronRight, ArrowLeft, Building2, Sparkles, Users } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { FilterSelect } from "@/components/dashboard/filter-select";
import { DetailDrawer } from "../../components/dashboard/detail-drawer";
import { useBookings } from "@/features/bookings/hooks/use-bookings";
import { PageLoader } from "@/components/feedback/page-loader";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import type { Booking } from "@/features/bookings/types/booking.types";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/bookings")({
  component: BookingsPage,
});

function BookingsPage() {
  const { user } = useAuthStore();
  const role = user?.role || "SUPERVISOR";

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Super Admin Drilldown States
  const [viewMode, setViewMode] = useState<"flat" | "hierarchical">("hierarchical");
  const [selectedOwner, setSelectedOwner] = useState<any>(null);
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [selectedTurf, setSelectedTurf] = useState<any>(null);

  const ownersHierarchy = useMemo(() => [
    {
      id: "OWNER-1",
      name: "Kunal (Arena Turf Owner)",
      email: "kunal@goalsports.com",
      venues: [
        {
          id: "V-1",
          name: "Arena Turf",
          location: "Bandra West, Mumbai",
          turfs: [
            { id: "T-1", name: "Football Pitch A" },
            { id: "T-2", name: "Football Pitch B" },
          ]
        }
      ]
    },
    {
      id: "OWNER-2",
      name: "Amit Patel (Goal Sports Owner)",
      email: "amit@goalsports.com",
      venues: [
        {
          id: "V-2",
          name: "Goal Sports",
          location: "Whitefield, Bangalore",
          turfs: [
            { id: "T-3", name: "Cricket Ground A" },
          ]
        }
      ]
    },
    {
      id: "OWNER-3",
      name: "Wembley Sports Group",
      email: "info@wembley.com",
      venues: [
        {
          id: "V-3",
          name: "Wembley Turf",
          location: "Connaught Place, Delhi",
          turfs: [
            { id: "T-4", name: "Badminton Court 1" },
          ]
        }
      ]
    }
  ], []);

  const { data: bookingsData = [], isLoading, isError } = useBookings();
  const [localBookings, setLocalBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (bookingsData.length && !localBookings.length) {
      // Clean and normalize role-based sample venues/data
      setLocalBookings(
        bookingsData.map((b, idx) => ({
          ...b,
          // Preserve real venue name, fallback to mock distribution for testing
          venue: b.venue && b.venue !== "Unknown Venue" ? b.venue : (idx % 3 === 0 ? "Arena Turf" : idx % 3 === 1 ? "Goal Sports" : "Wembley Turf"),
          due: idx % 2 === 0 ? 500 : 0,
        }))
      );
    }
  }, [bookingsData]);

  // Role Filtering
  const filteredData = useMemo(() => {
    return localBookings.filter((booking) => {
      // Scoped permissions:
      // Supervisor: Only Arena Turf bookings
      // Owner: Only Arena Turf and Goal Sports
      // Super Admin: All
      if (role === "SUPERVISOR" && booking.venue !== "Arena Turf") return false;
      if (role === "OWNER" && booking.venue === "Wembley Turf") return false;

      const matchesSearch =
        booking.customer.toLowerCase().includes(search.toLowerCase()) ||
        booking.id.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        status === "all" ? true : booking.status.toLowerCase() === status.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [localBookings, search, status, role]);

  // Update Status Actions
  const handleUpdateStatus = (id: string, newStatus: string) => {
    setLocalBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    toast.success(`Booking status updated to ${newStatus}`);
  };

  const columns: ColumnDef<Booking>[] = [
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
      cell: ({ row }) => <span>₹{row.original.amount}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          size="icon"
          variant="ghost"
          className="rounded-xl hover:bg-slate-100"
          onClick={() => setSelectedBooking(row.original)}
        >
          <MoreHorizontal size={18} />
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError) {
    return <ErrorState message="Failed to load bookings" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={role === "SUPERVISOR" ? "Today's Bookings" : "Bookings Directory"}
        description={
          role === "SUPERVISOR"
            ? "View on-ground bookings assigned for your shift today."
            : "Monitor and search booking reservations across all venues."
        }
      />

      {role === "SUPER_ADMIN" && (
        <div className="flex bg-slate-100 p-1 rounded-2xl w-fit font-bold text-xs gap-1 shadow-sm">
          <button
            onClick={() => setViewMode("hierarchical")}
            className={`px-4 py-2 rounded-xl transition-all ${
              viewMode === "hierarchical"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Hierarchy Explorer
          </button>
          <button
            onClick={() => setViewMode("flat")}
            className={`px-4 py-2 rounded-xl transition-all ${
              viewMode === "flat"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Flat Listing
          </button>
        </div>
      )}

      {role === "SUPER_ADMIN" && viewMode === "hierarchical" ? (
        <div className="space-y-6">
          {/* Breadcrumbs Navigation */}
          <div className="bg-white border border-slate-100 p-4 rounded-2xl flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500 shadow-sm">
            <span
              onClick={() => {
                setSelectedOwner(null);
                setSelectedVenue(null);
                setSelectedTurf(null);
              }}
              className="cursor-pointer hover:text-emerald-800 transition-colors"
            >
              Super Admin Workspace
            </span>
            {selectedOwner && (
              <>
                <ChevronRight size={14} className="text-slate-400" />
                <span
                  onClick={() => {
                    setSelectedVenue(null);
                    setSelectedTurf(null);
                  }}
                  className="cursor-pointer hover:text-emerald-800 transition-colors text-slate-700"
                >
                  {selectedOwner.name}
                </span>
              </>
            )}
            {selectedVenue && (
              <>
                <ChevronRight size={14} className="text-slate-400" />
                <span
                  onClick={() => setSelectedTurf(null)}
                  className="cursor-pointer hover:text-emerald-800 transition-colors text-slate-700"
                >
                  {selectedVenue.name}
                </span>
              </>
            )}
            {selectedTurf && (
              <>
                <ChevronRight size={14} className="text-slate-400" />
                <span className="text-emerald-800 font-extrabold">{selectedTurf.name}</span>
              </>
            )}
          </div>

          {/* Drilldown Views */}
          {!selectedOwner && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-600">Select Venue Owner</h3>
              <div className="grid gap-4 md:grid-cols-3">
                {ownersHierarchy.map((o) => (
                  <div
                    key={o.id}
                    onClick={() => setSelectedOwner(o)}
                    className="bg-white border border-slate-100 p-5 rounded-3xl cursor-pointer hover:border-emerald-700/30 hover:shadow-md transition-all space-y-3 group"
                  >
                    <div className="bg-emerald-50 text-emerald-800 p-3 rounded-2xl w-fit">
                      <Users size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-emerald-800 transition-colors">
                        {o.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{o.email}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold border-t border-slate-50 pt-2 mt-2">
                      <span>{o.venues.length} Venue Branch</span>
                      <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedOwner && !selectedVenue && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setSelectedOwner(null)}
                  className="rounded-full hover:bg-slate-100"
                >
                  <ArrowLeft size={16} />
                </Button>
                <h3 className="text-sm font-bold text-slate-600">Select Venue Branch</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {selectedOwner.venues.map((v: any) => (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVenue(v)}
                    className="bg-white border border-slate-100 p-5 rounded-3xl cursor-pointer hover:border-emerald-700/30 hover:shadow-md transition-all space-y-3 group"
                  >
                    <div className="bg-emerald-50 text-emerald-800 p-3 rounded-2xl w-fit">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-emerald-800 transition-colors">
                        {v.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{v.location}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold border-t border-slate-50 pt-2 mt-2">
                      <span>{v.turfs.length} Playable Turf / Courts</span>
                      <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedOwner && selectedVenue && !selectedTurf && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setSelectedVenue(null)}
                  className="rounded-full hover:bg-slate-100"
                >
                  <ArrowLeft size={16} />
                </Button>
                <h3 className="text-sm font-bold text-slate-600">Select Turf court</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {selectedVenue.turfs.map((t: any) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTurf(t)}
                    className="bg-white border border-slate-100 p-5 rounded-3xl cursor-pointer hover:border-emerald-700/30 hover:shadow-md transition-all space-y-3 group"
                  >
                    <div className="bg-emerald-50 text-emerald-800 p-3 rounded-2xl w-fit">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-emerald-800 transition-colors">
                        {t.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">Active schedule & availability</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold border-t border-slate-50 pt-2 mt-2">
                      <span>View Bookings list</span>
                      <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedOwner && selectedVenue && selectedTurf && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setSelectedTurf(null)}
                    className="rounded-full hover:bg-slate-100"
                  >
                    <ArrowLeft size={16} />
                  </Button>
                  <h3 className="font-bold text-slate-800 text-lg">
                    Bookings for {selectedTurf.name} ({selectedVenue.name})
                  </h3>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedOwner(null);
                    setSelectedVenue(null);
                    setSelectedTurf(null);
                  }}
                  className="rounded-xl border-slate-200 text-xs font-bold"
                >
                  Reset Explorer
                </Button>
              </div>

              <FilterBar search={search} setSearch={setSearch}>
                <FilterSelect
                  placeholder="Status"
                  value={status}
                  onChange={setStatus}
                  options={[
                    { label: "All Status", value: "all" },
                    { label: "Confirmed", value: "confirmed" },
                    { label: "Pending", value: "pending" },
                    { label: "Completed", value: "completed" },
                    { label: "Cancelled", value: "cancelled" },
                  ]}
                />
              </FilterBar>

              {(() => {
                const subBookings = filteredData.filter((b) => b.venue === selectedVenue.name);
                return subBookings.length ? (
                  <DataTable columns={columns} data={subBookings} />
                ) : (
                  <EmptyState title="No bookings matched" description="Try adjusting your filter search." />
                );
              })()}
            </div>
          )}
        </div>
      ) : (
        <>
          <FilterBar search={search} setSearch={setSearch}>
            <FilterSelect
              placeholder="Status"
              value={status}
              onChange={setStatus}
              options={[
                { label: "All Status", value: "all" },
                { label: "Confirmed", value: "confirmed" },
                { label: "Pending", value: "pending" },
                { label: "Completed", value: "completed" },
                { label: "Cancelled", value: "cancelled" },
              ]}
            />
          </FilterBar>

          {filteredData.length ? (
            <DataTable columns={columns} data={filteredData} />
          ) : (
            <EmptyState title="No bookings matched" description="Try adjusting your filter search." />
          )}
        </>
      )}

      <DetailDrawer
        open={!!selectedBooking}
        onOpenChange={() => setSelectedBooking(null)}
        title={selectedBooking?.id || "Booking Details"}
        description="Manage booking status, checklists, and payment collections."
      >
        <div className="space-y-5 font-semibold text-slate-700 text-sm">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-1">
            <p className="text-xs text-slate-400 font-bold uppercase">Customer Details</p>
            <h3 className="text-lg font-bold text-slate-800">{selectedBooking?.customer}</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-1">
              <p className="text-xs text-slate-400 font-bold uppercase">Assigned Venue</p>
              <h3 className="font-bold text-slate-800">{selectedBooking?.venue}</h3>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-1">
              <p className="text-xs text-slate-400 font-bold uppercase">Booking Timing</p>
              <h3 className="font-bold text-slate-800">{selectedBooking?.slot}</h3>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-1">
            <p className="text-xs text-slate-400 font-bold uppercase">Cash/Digital Pricing</p>
            <h3 className="text-2xl font-extrabold text-emerald-800">
              ₹{selectedBooking?.amount}
            </h3>
          </div>

          {/* Supervisor check-in checklist panel */}
          {role === "SUPERVISOR" ? (
            <div className="space-y-4 pt-2">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <p className="text-xs font-bold text-slate-500 uppercase">On-Ground Checklist</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedBooking?.status.toLowerCase() !== "completed" && (
                    <>
                      {selectedBooking?.status.toLowerCase() !== "arrived" && (
                        <Button
                          onClick={() => handleUpdateStatus(selectedBooking.id, "Arrived")}
                          className="bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs py-1.5 h-auto"
                        >
                          Mark Arrived
                        </Button>
                      )}
                      <Button
                        onClick={() => handleUpdateStatus(selectedBooking.id, "Completed")}
                        className="bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs py-1.5 h-auto"
                      >
                        Mark Completed
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => handleMarkNoShow(selectedBooking.id)}
                    variant="outline"
                    className="rounded-xl text-xs py-1.5 h-auto text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Mark No Show
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-amber-50/50 border border-amber-200/50 rounded-2xl text-xs text-amber-800 font-medium">
                ⚠️ Cancellation is administrative only. Please contact Venue Owner for overrides.
              </div>
            </div>
          ) : (
            // Full Admin Actions
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => handleUpdateStatus(selectedBooking.id, "Confirmed")}
                className="flex-1 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold"
              >
                Confirm Booking
              </Button>
              <Button
                variant="outline"
                onClick={() => handleUpdateStatus(selectedBooking.id, "Cancelled")}
                className="flex-1 rounded-xl text-red-600 border-red-100 hover:bg-red-50 font-bold"
              >
                Cancel Slot
              </Button>
            </div>
          )}
        </div>
      </DetailDrawer>
    </div>
  );
}