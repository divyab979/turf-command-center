import { useState, useEffect, useMemo } from "react";
import {
  IndianRupee,
  CalendarDays,
  Sparkles,
  Wrench,
  TrendingUp,
  Phone,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  Search,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KpiCard } from "./kpi-card";
import { SectionCard } from "./section-card";
import { toast } from "sonner";
import { getBookings } from "@/features/bookings/api/get-bookings";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { getVenues } from "@/features/venue/services/venue-service";

const getYYYYMMDD = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isBookingToday = (bookingDateStr: string | undefined | null) => {
  if (!bookingDateStr) return false;
  try {
    const todayStr = getYYYYMMDD(new Date());
    const targetStr = getYYYYMMDD(new Date(bookingDateStr));
    return todayStr === targetStr;
  } catch (e) {
    return false;
  }
};

interface Props {
  view?: string;
}

export function SupervisorDashboard({ view = "dashboard" }: Props) {
  const { user } = useAuthStore();
  const [assignedVenueName, setAssignedVenueName] = useState("Arena Turf");
  const [assignedVenueTurfs, setAssignedVenueTurfs] = useState<any[]>([]);
  const [upcomingBookingsModalOpen, setUpcomingBookingsModalOpen] = useState(false);

  useEffect(() => {
    const fetchAssignedVenue = async () => {
      if (!user?.venueId) return;
      try {
        const venues = await getVenues();
        const matched = venues.find((v) => v.id === user.venueId);
        if (matched) {
          setAssignedVenueName(matched.name);
          setAssignedVenueTurfs(matched.turfs || []);
        }
      } catch (err) {
        console.error("Failed to load assigned venue details", err);
      }
    };
    fetchAssignedVenue();
  }, [user?.venueId]);

  // --- DYNAMIC DATABASE STATES ---
  const [dbBookings, setDbBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const data = await getBookings();
      setDbBookings(data);
    } catch (err) {
      console.error("Failed to load bookings", err);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchMaintenanceTickets();
  }, []);

  const [bookings, setBookings] = useState<any[]>([]);
  const [localPaymentsTotal, setLocalPaymentsTotal] = useState({ cash: 0, upi: 0 });

  useEffect(() => {
    if (dbBookings && dbBookings.length > 0) {
      const todayBookings = dbBookings.filter((b: any) => {
        if (!b.bookingDate) return true; // Fallback for mock/offline entries
        return isBookingToday(b.bookingDate);
      });
      setBookings(todayBookings.map((b: any) => {
        let mappedStatus = "Confirmed";
        if (b.status === "completed" || b.status === "paid") {
          mappedStatus = "Completed";
        } else if (b.status === "arrived") {
          mappedStatus = "Arrived";
        } else if (b.status === "no_show") {
          mappedStatus = "No Show";
        }
        return {
          id: b.id,
          customer: b.customer,
          phone: b.phone || "+91 99887 76655",
          turf: b.venue || "Football Pitch A",
          slot: b.slot || "05:00 PM - 06:00 PM",
          sport: b.sport || "Football",
          amount: b.amount || 1500,
          due: mappedStatus === "Completed" ? 0 : (b.remainingAmount !== undefined ? b.remainingAmount : (b.amount || 1500)),
          status: mappedStatus,
          date: "Today",
        };
      }));
    } else {
      setBookings([]);
    }
  }, [dbBookings]);

  const [maintenanceTickets, setMaintenanceTickets] = useState<any[]>([]);
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);

  const fetchMaintenanceTickets = async () => {
    try {
      setLoadingMaintenance(true);
      const res = await api.get("/turfs/maintenance/list");
      const mapped = (res.data || []).map((t: any) => ({
        id: t.id,
        status: t.status,
        turf: t.turf?.name || "Unknown Turf",
        issue: t.issue,
        urgency: t.severity,
      }));
      setMaintenanceTickets(mapped);
    } catch (err) {
      console.error("Failed to load maintenance issues", err);
    } finally {
      setLoadingMaintenance(false);
    }
  };

  const [guestBookings, setGuestBookings] = useState<any[]>([]);

  const [dailyCollections, setDailyCollections] = useState({
    cash: 0,
    upi: 0,
  });

  useEffect(() => {
    if (dbBookings && dbBookings.length > 0) {
      const dbWalkIns = dbBookings
        .filter((b) => b.notes === "Guest Walk-in booking")
        .map((b) => ({
          id: b.id,
          name: b.customer,
          phone: b.customerPhone || "9999999999",
          turf: b.turfName || "Turf",
          slot: b.startTime && b.endTime ? `${b.startTime} - ${b.endTime}` : b.slot,
          amount: b.amount,
          paymentMode: b.paymentMethod || "UPI",
          date: b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : "Today",
        }));
      setGuestBookings(dbWalkIns);
    }
  }, [dbBookings]);

  useEffect(() => {
    let cash = 0;
    let upi = 0;

    dbBookings.forEach((b: any) => {
      // Filter out bookings that are not for today
      if (b.bookingDate && !isBookingToday(b.bookingDate)) return;

      const status = b.status?.toLowerCase();
      if (status === "cancelled") return;

      const method = (b.paymentMethod || "").toLowerCase();
      const amt = b.amount || 0;

      if (method === "cash") {
        cash += amt;
      } else {
        upi += amt;
      }
    });



    setDailyCollections({
      cash: cash + localPaymentsTotal.cash,
      upi: upi + localPaymentsTotal.upi,
    });
  }, [dbBookings, guestBookings, localPaymentsTotal]);

  const [searchQuery, setSearchQuery] = useState("");

  // Modal / Form States
  const [guestModal, setGuestModal] = useState(false);
  const [newGuest, setNewGuest] = useState({
    name: "",
    phone: "",
    turf: "",
    slotId: "",
    amount: 1200,
    paymentMode: "UPI",
  });

  const [venueSlots, setVenueSlots] = useState<any[]>([]);

  useEffect(() => {
    if (guestModal && user?.venueId) {
      const todayStr = getYYYYMMDD(new Date());
      api.get(`/turfs/${user.venueId}?date=${todayStr}`)
        .then((res) => {
          setVenueSlots(res.data || []);
        })
        .catch((err) => console.error("Error fetching slots for walk-in", err));
    }
  }, [guestModal, user?.venueId]);

  const selectedTurfSlots = useMemo(() => {
    const matched = venueSlots.find((v) => v.id === newGuest.turf);
    if (matched) {
      return (matched.slots || []).filter((s: any) => s.status === "AVAILABLE");
    }
    return [];
  }, [venueSlots, newGuest.turf]);

  useEffect(() => {
    if (assignedVenueTurfs.length > 0) {
      if (!newGuest.turf) {
        setNewGuest((prev) => ({
          ...prev,
          turf: assignedVenueTurfs[0].id,
        }));
      }
      if (!newIssue.turf) {
        setNewIssue((prev) => ({
          ...prev,
          turf: assignedVenueTurfs[0].id,
        }));
      }
    }
  }, [assignedVenueTurfs]);

  useEffect(() => {
    if (selectedTurfSlots.length > 0) {
      setNewGuest((prev) => ({
        ...prev,
        slotId: selectedTurfSlots[0].id,
      }));
    } else {
      setNewGuest((prev) => ({
        ...prev,
        slotId: "",
      }));
    }
  }, [selectedTurfSlots]);

  const [issueModal, setIssueModal] = useState(false);
  const [newIssue, setNewIssue] = useState({
    turf: "",
    issue: "",
    urgency: "Medium",
  });

  // Pay modal details
  const [paymentModal, setPaymentModal] = useState<any>(null);
  const [splitAmount, setSplitAmount] = useState({
    cash: 0,
    upi: 0,
  });

  // Handlers
  const handleMarkArrived = (id: string) => {
    setBookings(
      bookings.map((b) => (b.id === id ? { ...b, status: "Arrived" } : b))
    );
    toast.success("Player check-in marked: Arrived");
  };

  const handleMarkCompleted = async (id: string) => {
    try {
      if (id.startsWith("GST-") || id.startsWith("BK")) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: "Completed" } : b))
        );
        toast.success("Player check-in marked: Completed");
        return;
      }
      await api.post(`/bookings/${id}/complete`);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "Completed" } : b))
      );
      toast.success("Player check-in marked: Completed");
      fetchBookings();
    } catch (err) {
      console.error("Failed to complete booking", err);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "Completed" } : b))
      );
      toast.success("Player check-in marked: Completed");
    }
  };

  const handleMarkNoShow = (id: string) => {
    setBookings(
      bookings.map((b) => (b.id === id ? { ...b, status: "No Show" } : b))
    );
    toast.error("Booking marked as No Show");
  };

  const handleOpenPayment = (booking: any) => {
    setPaymentModal(booking);
    setSplitAmount({ cash: booking.due, upi: 0 });
  };

  const handleConfirmSplitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModal) return;

    const totalPaid = Number(splitAmount.cash) + Number(splitAmount.upi);
    if (totalPaid !== paymentModal.due) {
      toast.error(`Total sum must equal the pending due of ₹${paymentModal.due}`);
      return;
    }

    setBookings(
      bookings.map((b) =>
        b.id === paymentModal.id ? { ...b, due: 0, status: "Completed" } : b
      )
    );

    setLocalPaymentsTotal((prev) => ({
      cash: prev.cash + Number(splitAmount.cash),
      upi: prev.upi + Number(splitAmount.upi),
    }));

    setPaymentModal(null);
    toast.success("Split payment recorded. Booking marked Completed.");
  };

  const handleCreateGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuest.name || !newGuest.phone) {
      toast.error("Please fill in player name and phone");
      return;
    }
    if (!newGuest.turf) {
      toast.error("Please select a turf space");
      return;
    }
    if (!newGuest.slotId) {
      toast.error("Please select a slot");
      return;
    }

    const matchedTurf = assignedVenueTurfs.find((t) => t.id === newGuest.turf);
    const matchedSlot = selectedTurfSlots.find((s) => s.id === newGuest.slotId);

    if (!matchedSlot) {
      toast.error("Invalid slot selected");
      return;
    }

    try {
      const payload = {
        venueId: user?.venueId,
        customerName: newGuest.name,
        customerPhone: newGuest.phone,
        startTime: matchedSlot.startTime,
        endTime: matchedSlot.endTime,
        totalAmount: Number(newGuest.amount),
        gameActivity: matchedTurf?.sport || "FOOTBALL",
        paymentMethod: newGuest.paymentMode,
        turfId: newGuest.turf,
        slotId: newGuest.slotId,
        notes: "Guest Walk-in booking",
      };

      const res = await api.post("/bookings/custom", payload);
      
      setGuestBookings((prev) => [
        ...prev,
        {
          id: res.data.id,
          name: newGuest.name,
          phone: newGuest.phone,
          turf: matchedTurf?.name || "Turf",
          slot: `${matchedSlot.startTime} - ${matchedSlot.endTime}`,
          amount: Number(newGuest.amount),
          paymentMode: newGuest.paymentMode,
          date: getYYYYMMDD(new Date()),
        },
      ]);

      setGuestModal(false);
      toast.success("Walk-in slot assigned successfully");
      fetchBookings();
    } catch (err: any) {
      console.error("Failed to create walk-in booking", err);
      toast.error("Failed to create walk-in booking: " + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssue.issue) {
      toast.error("Please describe the issue");
      return;
    }
    if (!newIssue.turf) {
      toast.error("Please select a turf space");
      return;
    }

    try {
      const payload = {
        turfId: newIssue.turf,
        issue: newIssue.issue,
        severity: newIssue.urgency,
        supervisor: user?.name || "Staff",
      };

      await api.post("/turfs/maintenance", payload);
      setIssueModal(false);
      toast.success("Turf issue reported to Owner successfully");
      fetchMaintenanceTickets();
      setNewIssue({
        turf: assignedVenueTurfs[0]?.id || "",
        issue: "",
        urgency: "Medium",
      });
    } catch (err: any) {
      console.error("Failed to report turf issue", err);
      toast.error("Failed to report issue: " + (err.response?.data?.message || err.message));
    }
  };

  // Render Sub-Views
  if (view === "dashboard") {
    // Current ongoing and next bookings
    const activeOngoing = bookings.find((b) => b.status === "Arrived");
    const upcomingNext = bookings.find((b) => b.status === "Confirmed");

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Ground Supervisor Console
            </h1>
            <p className="text-slate-500 mt-1">
              Assigned Venue: <span className="font-bold text-emerald-800">{assignedVenueName}</span>
            </p>
          </div>
          <Button
            onClick={() => setUpcomingBookingsModalOpen(true)}
            className="rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold flex items-center gap-2 shadow-sm self-start sm:self-center"
          >
            <CalendarDays size={16} />
            <span>Manage Today's Slots</span>
          </Button>
        </div>

        {/* Dynamic Live Cards */}
        <div className="grid gap-5 md:grid-cols-2">
          <div className="bg-emerald-800 text-white rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-4">
            <div>
              <p className="text-xs uppercase font-extrabold tracking-wider text-emerald-200">
                Current Ongoing Booking
              </p>
              {activeOngoing ? (
                <div className="mt-3 space-y-1">
                  <h3 className="text-2xl font-extrabold">{activeOngoing.customer}</h3>
                  <p className="text-sm text-emerald-100">{activeOngoing.turf} • {activeOngoing.slot}</p>
                </div>
              ) : (
                <p className="mt-3 text-emerald-100 font-semibold text-sm">No ongoing slot active right now</p>
              )}
            </div>
            {activeOngoing && (
              <Button
                size="sm"
                onClick={() => handleMarkCompleted(activeOngoing.id)}
                className="bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl font-bold self-start mt-2 text-xs"
              >
                Mark Finished
              </Button>
            )}
          </div>

          <div className="bg-slate-950 text-white rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-4">
            <div>
              <p className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                Next Upcoming Booking
              </p>
              {upcomingNext ? (
                <div className="mt-3 space-y-1">
                  <h3 className="text-2xl font-extrabold">{upcomingNext.customer}</h3>
                  <p className="text-sm text-slate-300">{upcomingNext.turf} • {upcomingNext.slot}</p>
                </div>
              ) : (
                <p className="mt-3 text-slate-300 font-semibold text-sm">All cleared! No upcoming slots today</p>
              )}
            </div>
            {upcomingNext && (
              <Button
                size="sm"
                onClick={() => handleMarkArrived(upcomingNext.id)}
                className="bg-emerald-700 text-white hover:bg-emerald-800 rounded-xl font-bold self-start mt-2 text-xs border-0"
              >
                Mark Arrived
              </Button>
            )}
          </div>
        </div>

        {/* Daily counters */}
        <div className="grid gap-5 md:grid-cols-3">
          <KpiCard
            title="Today's Collections"
            value={`₹${(dailyCollections.cash + dailyCollections.upi).toLocaleString()}`}
            change={`₹${dailyCollections.upi.toLocaleString()} UPI • ₹${dailyCollections.cash.toLocaleString()} Cash`}
            positive
            icon={IndianRupee}
          />
          <KpiCard
            title="Bookings Completed"
            value={`${bookings.filter((b) => b.status === "Completed").length} / ${bookings.length}`}
            change="slots completed today"
            positive
            icon={CalendarDays}
          />
          <KpiCard
            title="Assigned Grounds"
            value={assignedVenueTurfs.length > 0 ? `${assignedVenueTurfs.length} Turf${assignedVenueTurfs.length > 1 ? 's' : ''}` : "0 Turfs"}
            change={assignedVenueTurfs.length > 0 ? assignedVenueTurfs.map(t => t.name).join(", ") : "No active turfs"}
            positive
            icon={Sparkles}
          />
        </div>

        {/* Maintenance / downtime highlights */}
        {maintenanceTickets.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle size={16} />
              <span>Ground Maintenance Issues Raised ({maintenanceTickets.length})</span>
            </div>
            <div className="grid gap-2">
              {maintenanceTickets.map((tkt) => (
                <div key={tkt.id} className="bg-white border border-amber-100 rounded-2xl p-4 flex justify-between items-center text-sm font-semibold text-slate-800">
                  <div>
                    <p>{tkt.turf}: <span className="font-normal text-slate-600">{tkt.issue}</span></p>
                    <p className="text-xs text-slate-400 mt-0.5">Urgency: {tkt.urgency}</p>
                  </div>
                  <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold">
                    {tkt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal: Today's Slot Schedule Checklist */}
        {upcomingBookingsModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Today's Slot Schedule</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Manage player check-ins and complete slots for {assignedVenueName}</p>
                </div>
                <button
                  onClick={() => setUpcomingBookingsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
                {bookings.length === 0 ? (
                  <p className="text-center text-slate-400 py-6 text-sm">No slots booked for today.</p>
                ) : (
                  bookings.map((booking) => {
                    const isCompleted = booking.status.toLowerCase() === "completed";
                    const isArrived = booking.status.toLowerCase() === "arrived";
                    return (
                      <div
                        key={booking.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 rounded-2xl gap-3 hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-800 text-sm">{booking.customer}</h4>
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                isCompleted
                                  ? "bg-emerald-100 text-emerald-800"
                                  : isArrived
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">{booking.turf} • {booking.slot}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {booking.id}</p>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {!isCompleted && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkCompleted(booking.id)}
                              className="bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold px-4"
                            >
                              Mark Completed
                            </Button>
                          )}
                          {isCompleted && (
                            <span className="text-xs text-emerald-800 font-bold flex items-center gap-1">
                              <CheckCircle size={14} /> Completed
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  onClick={() => setUpcomingBookingsModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 px-6 font-semibold"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- GUEST WALK-INS ---
  if (view === "guest_mode") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Walk-in & Guest Bookings
            </h1>
            <p className="text-slate-500 mt-1">
              Logger for on-ground players. Captured split collections are audited immediately.
            </p>
          </div>
          <Button
            onClick={() => setGuestModal(true)}
            className="rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold flex items-center gap-2 shadow-sm self-start sm:self-center"
          >
            <Plus size={16} />
            <span>Create Walk-in</span>
          </Button>
        </div>

        {/* Guest ledger table */}
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 font-bold text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Player Info</th>
                  <th className="py-4 px-6">Assigned Turf</th>
                  <th className="py-4 px-6">Slot Time</th>
                  <th className="py-4 px-6">Amount Paid</th>
                  <th className="py-4 px-6 text-right">Payment Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {guestBookings.map((guest) => (
                  <tr key={guest.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800">{guest.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{guest.phone}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
                        {guest.turf}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-semibold">{guest.slot}</td>
                    <td className="py-4 px-6 font-bold text-slate-800">
                      ₹{guest.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        {guest.paymentMode}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: New Walk-in */}
        {guestModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Create Walk-in Booking</h3>
                <button
                  onClick={() => setGuestModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateGuest} className="space-y-3 font-medium text-slate-700 text-xs">
                <div className="space-y-1">
                  <Label className="text-slate-500 font-bold">Player Name</Label>
                  <Input
                    required
                    value={newGuest.name}
                    onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                    placeholder="e.g. Tushar Dev"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-500 font-bold">Player Phone</Label>
                  <Input
                    required
                    value={newGuest.phone}
                    onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                    placeholder="+91 95555 44444"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-500 font-bold">Select Turf Space</Label>
                  <select
                    value={newGuest.turf}
                    onChange={(e) => setNewGuest({ ...newGuest, turf: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-transparent"
                    required
                  >
                    {assignedVenueTurfs.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-500 font-bold">Select Slot Time</Label>
                  <select
                    value={newGuest.slotId}
                    onChange={(e) => setNewGuest({ ...newGuest, slotId: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-transparent"
                    required
                  >
                    {selectedTurfSlots.length > 0 ? (
                      selectedTurfSlots.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.startTime} - {s.endTime} (₹{s.price})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No available slots for today</option>
                    )}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-slate-500 font-bold">Amount Paid (₹)</Label>
                    <Input
                      type="number"
                      required
                      value={newGuest.amount || ""}
                      onChange={(e) =>
                        setNewGuest({ ...newGuest, amount: Number(e.target.value) })
                      }
                      placeholder="e.g. 1500"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-500 font-bold">Payment Method</Label>
                    <select
                      value={newGuest.paymentMode}
                      onChange={(e) => setNewGuest({ ...newGuest, paymentMode: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 bg-transparent"
                    >
                      <option value="UPI">UPI (GPay/PhonePe)</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setGuestModal(false)}
                    className="flex-1 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl"
                  >
                    Confirm Walk-in
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- MAINTENANCE TICKET RAISE ---
  if (view === "maintenance") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Report Ground Issue
            </h1>
            <p className="text-slate-500 mt-1">
              Submit turf damages directly to the Turf Owner to request slot blocking.
            </p>
          </div>
          <Button
            onClick={() => setIssueModal(true)}
            className="rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold flex items-center gap-2 shadow-sm self-start sm:self-center"
          >
            <Plus size={16} />
            <span>Report Turf Issue</span>
          </Button>
        </div>

        {/* Maintenance Logged */}
        <div className="grid gap-5 md:grid-cols-2">
          {maintenanceTickets.map((tkt) => (
            <div
              key={tkt.id}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full font-mono">
                    {tkt.id}
                  </span>
                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {tkt.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800">{tkt.turf}</h3>
                <p className="text-sm font-semibold text-slate-600">{tkt.issue}</p>
                <p className="text-xs text-slate-400 font-bold">Severity: {tkt.urgency}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Report Issue */}
        {issueModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Report Turf Damage</h3>
                <button
                  onClick={() => setIssueModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateIssue} className="space-y-3 font-medium text-slate-700 text-xs">
                <div className="space-y-1">
                  <Label className="text-slate-500 font-bold">Identify Turf Space</Label>
                  <select
                    value={newIssue.turf}
                    onChange={(e) => setNewIssue({ ...newIssue, turf: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-transparent"
                  >
                    <option value="" disabled>Select Turf Space</option>
                    {assignedVenueTurfs.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-500 font-bold">Issue Details / Comments</Label>
                  <Input
                    required
                    value={newIssue.issue}
                    onChange={(e) => setNewIssue({ ...newIssue, issue: e.target.value })}
                    placeholder="e.g. net tearing, lighting ballast failure"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-500 font-bold">Severity / Urgency Level</Label>
                  <select
                    value={newIssue.urgency}
                    onChange={(e) => setNewIssue({ ...newIssue, urgency: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-transparent"
                  >
                    <option value="Medium">Medium (Low operational risk)</option>
                    <option value="High (Request Slot Block)">High (Requires Slot Block)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIssueModal(false)}
                    className="flex-1 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl"
                  >
                    Raise Issue Log
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- COLLECTION REPORTS ---
  if (view === "payments") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Daily Collections Summary
          </h1>
          <p className="text-slate-500 mt-1">
            Auditing log of cash and digital payments collected during your shift.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cash Collected (Physical Handover)</p>
            <h3 className="text-3xl font-extrabold text-slate-800">₹{dailyCollections.cash.toLocaleString()}</h3>
            <p className="text-xs text-slate-400 mt-2">Awaiting owner deposit tally</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">UPI / GPay Collected</p>
            <h3 className="text-3xl font-extrabold text-emerald-800">₹{dailyCollections.upi.toLocaleString()}</h3>
            <p className="text-xs text-slate-400 mt-2">Direct bank settlements completed</p>
          </div>
        </div>
      </div>
    );
  }

  if (view === "reports") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Shift Occupancy & Reports
          </h1>
          <p className="text-slate-500 mt-1">
            Simple summaries of ongoing slot utilization and total check-in counts.
          </p>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4 font-bold text-slate-700">
          <div className="flex justify-between border-b border-slate-100 pb-3 text-sm">
            <span>Today's Total Booking Capacity</span>
            <span className="text-emerald-800 font-extrabold">24 Slots</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-3 text-sm">
            <span>Active Slots Booked</span>
            <span className="text-slate-800 font-extrabold">{bookings.length} Slots</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-3 text-sm">
            <span>Walk-in Bookings Logged Self</span>
            <span className="text-slate-800">{guestBookings.length} Slots</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shift Occupancy Percentage</span>
            <span className="text-emerald-800 font-extrabold">
              {Math.round((bookings.length / 24) * 100)}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
