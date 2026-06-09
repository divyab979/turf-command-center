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
import type { Booking, BookingStatus } from "@/features/bookings/types/booking.types";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { getSplitPayments, saveSplitPayments, SplitPaymentEntry } from "@/utils/payment-store";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/bookings")({
  component: BookingsPage,
});

function BookingsPage() {
  const { user } = useAuthStore();
  const role = user?.role || "SUPERVISOR";

  const queryClient = useQueryClient();

  // Custom Booking States
  const [customBookingOpen, setCustomBookingOpen] = useState(false);
  const [customVenueId, setCustomVenueId] = useState("");
  const [customCustomerName, setCustomCustomerName] = useState("");
  const [customCustomerPhone, setCustomCustomerPhone] = useState("");
  const [customStartTime, setCustomStartTime] = useState("");
  const [customEndTime, setCustomEndTime] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [customGameActivity, setCustomGameActivity] = useState("SNOOKER");
  const [customPaymentMethod, setCustomPaymentMethod] = useState("CASH");
  const [customNotes, setCustomNotes] = useState("");
  const [isSavingCustom, setIsSavingCustom] = useState(false);
  const [gameRoomVenues, setGameRoomVenues] = useState<any[]>([]);

  useEffect(() => {
    api.get("/venues")
      .then((res) => {
        const list = res.data || [];
        const filtered = list.filter((v: any) => {
          const isGameRoom = v.businessType === "GAME_ROOM";
          if (role === "SUPERVISOR") {
            return isGameRoom && v.id === (user as any)?.venueId;
          }
          return isGameRoom;
        });
        setGameRoomVenues(filtered);
      })
      .catch((err) => console.error("Error loading venues for custom booking", err));
  }, [role, user]);

  const handleCreateCustomBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customVenueId || !customCustomerName || !customStartTime || !customEndTime || !customAmount) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSavingCustom(true);
      await api.post("/bookings/custom", {
        venueId: customVenueId,
        customerName: customCustomerName,
        customerPhone: customCustomerPhone,
        startTime: customStartTime,
        endTime: customEndTime,
        totalAmount: parseFloat(customAmount),
        gameActivity: customGameActivity,
        paymentMethod: customPaymentMethod,
        notes: customNotes,
      });

      toast.success("Custom guest entry successfully created");
      setCustomBookingOpen(false);
      
      // Reset form
      setCustomCustomerName("");
      setCustomCustomerPhone("");
      setCustomStartTime("");
      setCustomEndTime("");
      setCustomAmount("");
      setCustomGameActivity("SNOOKER");
      setCustomPaymentMethod("CASH");
      setCustomNotes("");

      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to create guest entry";
      toast.error(msg);
    } finally {
      setIsSavingCustom(false);
    }
  };

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
        bookingsData.map((b, idx) => {
          const venue = b.venue && b.venue !== "Unknown Venue" ? b.venue : (idx % 3 === 0 ? "Arena Turf" : idx % 3 === 1 ? "Goal Sports" : "Wembley Turf");
          const splits = getSplitPayments(b.id, b.amount, b);
          const totalPaid = splits.reduce((sum, s) => sum + s.amount, 0);
          const due = Math.max(0, b.amount - totalPaid);
          return {
            ...b,
            venue,
            due,
          };
        })
      );
    }
  }, [bookingsData]);

  // Split payment state
  const [splitMethod, setSplitMethod] = useState<"cash" | "UPI" | "bank transfer" | "card" | "other">("cash");
  const [splitAmountInput, setSplitAmountInput] = useState("");
  const [splitNote, setSplitNote] = useState("");

  const handleMarkNoShow = (id: string) => {
    handleUpdateStatus(id, "cancelled");
  };

  const handleRecordSplitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    const amountVal = parseFloat(splitAmountInput);
    if (isNaN(amountVal) || amountVal <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    const splits = getSplitPayments(selectedBooking.id, selectedBooking.amount, selectedBooking);
    const totalPaid = splits.reduce((sum, s) => sum + s.amount, 0);
    const due = Math.max(0, selectedBooking.amount - totalPaid);
    
    if (amountVal > due) {
      toast.error(`Amount cannot exceed remaining due of ₹${due}`);
      return;
    }
    
    const newEntry: SplitPaymentEntry = {
      id: `split-${Date.now()}`,
      method: splitMethod,
      amount: amountVal,
      note: splitNote,
      recordedBy: `${user?.name || "Unknown"} (${user?.role || "SUPERVISOR"})`,
      timestamp: new Date().toLocaleString(),
    };
    
    const hasOnlyDefault = splits.length === 1 && splits[0].id.startsWith("default-");
    const updatedSplits = hasOnlyDefault ? [newEntry] : [...splits, newEntry];
    saveSplitPayments(selectedBooking.id, updatedSplits);
    
    const newTotalPaid = (hasOnlyDefault ? 0 : totalPaid) + amountVal;
    const newDue = Math.max(0, selectedBooking.amount - newTotalPaid);
    const newStatus = newDue === 0 ? "confirmed" : selectedBooking.status;
    
    setLocalBookings((prev) =>
      prev.map((b) => (b.id === selectedBooking.id ? { ...b, status: newStatus, due: newDue } : b))
    );
    
    setSelectedBooking((prev) =>
      prev ? { ...prev, status: newStatus, due: newDue } : null
    );
    
    setSplitAmountInput("");
    setSplitNote("");
    toast.success(`Recorded split payment of ₹${amountVal} via ${splitMethod}`);
  };

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
    const lowerStatus = newStatus.toLowerCase() as BookingStatus;
    setLocalBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: lowerStatus } : b))
    );
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking((prev) => (prev ? { ...prev, status: lowerStatus } : null));
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
      header: "Amount / Due",
      cell: ({ row }) => {
        const amount = row.original.amount;
        const splits = getSplitPayments(row.original.id, amount, row.original);
        
        let cashPaid = 0;
        let onlinePaid = 0;
        splits.forEach((s) => {
          const m = s.method.toLowerCase();
          if (m === "cash") {
            cashPaid += s.amount;
          } else {
            onlinePaid += s.amount;
          }
        });
        
        const totalPaid = cashPaid + onlinePaid;
        const due = Math.max(0, amount - totalPaid);
        
        return (
          <div className="flex flex-col gap-0.5 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-800">₹{amount}</span>
              {due === 0 ? (
                <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Paid</span>
              ) : (
                <span className="text-[9px] font-extrabold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Partial</span>
              )}
            </div>
            
            {/* Payment breakdown */}
            <div className="flex flex-col text-[10px] text-slate-500 font-semibold gap-0.5 mt-0.5">
              {onlinePaid > 0 && (
                <span className="text-emerald-700">₹{onlinePaid} Online</span>
              )}
              {cashPaid > 0 && (
                <span className="text-indigo-600">₹{cashPaid} Cash</span>
              )}
              {due > 0 && (
                <span className="text-amber-600">₹{due} Due</span>
              )}
            </div>
          </div>
        );
      },
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
        action={
          gameRoomVenues.length > 0 && (
            <Button
              className="rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold"
              onClick={() => setCustomBookingOpen(true)}
            >
              Add Custom Booking
            </Button>
          )
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

          {/* Split Payments Section */}
          {selectedBooking && (() => {
            const splits = getSplitPayments(selectedBooking.id, selectedBooking.amount, selectedBooking);
            const totalPaid = splits.reduce((sum, s) => sum + s.amount, 0);
            const remainingDue = Math.max(0, selectedBooking.amount - totalPaid);

            return (
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                  <p className="text-xs text-slate-400 font-bold uppercase">Split Payment Breakdown</p>
                  {remainingDue > 0 ? (
                    <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Partially Paid
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Fully Paid
                    </span>
                  )}
                </div>

                {/* Splits List */}
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {splits.map((s, index) => (
                    <div key={s.id || index} className="flex justify-between items-center text-xs bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-700 uppercase">{s.method}</span>
                          {s.recordedBy && (
                            <span className="text-[9px] text-slate-400 font-medium">by {s.recordedBy}</span>
                          )}
                        </div>
                        {s.note && <p className="text-[10px] text-slate-500 italic mt-0.5">"{s.note}"</p>}
                        {s.timestamp && <p className="text-[9px] text-slate-400 mt-0.5">{s.timestamp}</p>}
                      </div>
                      <span className="font-bold text-slate-800">₹{s.amount}</span>
                    </div>
                  ))}
                </div>

                {/* Balance Summary */}
                <div className="pt-2 flex justify-between items-center text-xs font-bold border-t border-slate-100">
                  <div className="text-slate-500">
                    Paid: <span className="text-emerald-700">₹{totalPaid}</span>
                  </div>
                  <div className="text-slate-500">
                    Remaining: <span className={remainingDue > 0 ? "text-amber-600" : "text-emerald-700"}>₹{remainingDue}</span>
                  </div>
                </div>

                {/* Add Split Form */}
                {remainingDue > 0 && (
                  <form onSubmit={handleRecordSplitPayment} className="space-y-3 pt-2 border-t border-slate-50">
                    <p className="text-[11px] text-slate-500 font-bold">Record Split Payment Part</p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase font-bold">Method</label>
                        <select
                          value={splitMethod}
                          onChange={(e: any) => setSplitMethod(e.target.value)}
                          className="w-full text-xs border border-slate-200 rounded-xl p-2 bg-transparent font-medium text-slate-700 outline-none"
                        >
                          <option value="cash">Cash</option>
                          <option value="UPI">UPI</option>
                          <option value="bank transfer">Bank Transfer</option>
                          <option value="card">Card</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase font-bold">Amount (₹)</label>
                        <input
                          type="number"
                          min="1"
                          max={remainingDue}
                          step="any"
                          required
                          value={splitAmountInput}
                          onChange={(e) => setSplitAmountInput(e.target.value)}
                          placeholder={`Max: ${remainingDue}`}
                          className="w-full text-xs border border-slate-200 rounded-xl p-2 font-medium text-slate-700 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase font-bold">Note / Reference (Optional)</label>
                      <input
                        type="text"
                        value={splitNote}
                        onChange={(e) => setSplitNote(e.target.value)}
                        placeholder="e.g. Transaction ID, GPay details"
                        className="w-full text-xs border border-slate-200 rounded-xl p-2 font-medium text-slate-700 outline-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2 h-auto text-xs"
                    >
                      Record Payment Part
                    </Button>
                  </form>
                )}
              </div>
            );
          })()}

          {/* Supervisor check-in checklist panel */}
          {role === "SUPERVISOR" ? (
            <div className="space-y-4 pt-2">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <p className="text-xs font-bold text-slate-500 uppercase">On-Ground Checklist</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedBooking!.status.toLowerCase() !== "completed" && (
                    <>
                      {selectedBooking!.status.toLowerCase() !== "arrived" && (
                        <Button
                          onClick={() => handleUpdateStatus(selectedBooking!.id, "Arrived")}
                          className="bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs py-1.5 h-auto"
                        >
                          Mark Arrived
                        </Button>
                      )}
                      <Button
                        onClick={() => handleUpdateStatus(selectedBooking!.id, "Completed")}
                        className="bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs py-1.5 h-auto"
                      >
                        Mark Completed
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => handleMarkNoShow(selectedBooking!.id)}
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
                onClick={() => handleUpdateStatus(selectedBooking!.id, "Confirmed")}
                className="flex-1 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold"
              >
                Confirm Booking
              </Button>
              <Button
                variant="outline"
                onClick={() => handleUpdateStatus(selectedBooking!.id, "Cancelled")}
                className="flex-1 rounded-xl text-red-600 border-red-100 hover:bg-red-50 font-bold"
              >
                Cancel Slot
              </Button>
            </div>
          )}
        </div>
      </DetailDrawer>

      <DetailDrawer
        open={customBookingOpen}
        onOpenChange={setCustomBookingOpen}
        title="Add Custom Booking"
        description="Create a manual entry for Snooker Clubs / Game Rooms."
      >
        <form onSubmit={handleCreateCustomBooking} className="space-y-4 font-semibold text-slate-700 text-xs">
          <div>
            <label className="text-slate-500 font-bold">Select Game Room / Snooker Club</label>
            <select
              value={customVenueId}
              onChange={(e) => setCustomVenueId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 p-2.5 bg-white text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-800"
              required
            >
              <option value="">-- Choose Venue --</option>
              {gameRoomVenues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.location})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-500 font-bold">Customer Name</label>
            <Input
              type="text"
              value={customCustomerName}
              onChange={(e) => setCustomCustomerName(e.target.value)}
              placeholder="e.g. John Doe"
              className="mt-2 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="text-slate-500 font-bold">Customer Phone (Optional)</label>
            <Input
              type="tel"
              value={customCustomerPhone}
              onChange={(e) => setCustomCustomerPhone(e.target.value)}
              placeholder="e.g. 9999999999"
              className="mt-2 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-500 font-bold">Start Time</label>
              <Input
                type="time"
                value={customStartTime}
                onChange={(e) => setCustomStartTime(e.target.value)}
                className="mt-2 rounded-xl"
                required
              />
            </div>
            <div>
              <label className="text-slate-500 font-bold">End Time</label>
              <Input
                type="time"
                value={customEndTime}
                onChange={(e) => setCustomEndTime(e.target.value)}
                className="mt-2 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-500 font-bold">Payment Amount (₹)</label>
              <Input
                type="number"
                min="0"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="₹ 500"
                className="mt-2 rounded-xl"
                required
              />
            </div>
            <div>
              <label className="text-slate-500 font-bold">Activity / Game</label>
              <select
                value={customGameActivity}
                onChange={(e) => setCustomGameActivity(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 p-2.5 bg-white text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-800"
              >
                <option value="SNOOKER">Snooker</option>
                <option value="POOL">Pool</option>
                <option value="PLAYSTATION">PlayStation</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-500 font-bold">Payment Method</label>
              <select
                value={customPaymentMethod}
                onChange={(e) => setCustomPaymentMethod(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 p-2.5 bg-white text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-800"
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="ONLINE">Online</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-500 font-bold">Notes</label>
            <textarea
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Add optional notes..."
              className="mt-2 w-full min-h-[60px] rounded-xl border border-slate-200 p-2.5 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-800"
            />
          </div>

          <Button
            type="submit"
            className="w-full rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold h-11"
            disabled={isSavingCustom}
          >
            {isSavingCustom ? "Saving Entry..." : "Submit Entry"}
          </Button>
        </form>
      </DetailDrawer>
    </div>
  );
}