import { useState, useEffect, useMemo } from "react";
import {
  IndianRupee,
  CalendarDays,
  Activity,
  Users,
  Plus,
  Search,
  Sparkles,
  Trophy,
  Wrench,
  TrendingUp,
  Settings as SettingsIcon,
  Phone,
  Printer,
  Share2,
  Trash2,
  CheckCircle,
  FileText,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KpiCard } from "./kpi-card";
import { SectionCard } from "./section-card";
import { StatusBadge } from "./status-badge";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { getSplitPayments, getPaymentMethodBreakdown, getMonthlyRevenueTrend } from "@/utils/payment-store";

interface Props {
  view?: string;
}

export function OwnerDashboard({ view = "dashboard" }: Props) {
  // --- MOCK STATES REMOVED ---
  const [tournaments, setTournaments] = useState<any[]>(() => {
    const stored = localStorage.getItem("owner_tournaments");
    return stored ? JSON.parse(stored) : [];
  });

  const [guestBookings, setGuestBookings] = useState<any[]>(() => {
    const stored = localStorage.getItem("owner_guest_bookings");
    return stored ? JSON.parse(stored) : [];
  });

  const [maintenance, setMaintenance] = useState<any[]>(() => {
    const stored = localStorage.getItem("owner_maintenance");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("owner_tournaments", JSON.stringify(tournaments));
  }, [tournaments]);

  useEffect(() => {
    localStorage.setItem("owner_guest_bookings", JSON.stringify(guestBookings));
  }, [guestBookings]);

  useEffect(() => {
    localStorage.setItem("owner_maintenance", JSON.stringify(maintenance));
  }, [maintenance]);

  // Venue & Staff dynamic databases
  const [dbVenues, setDbVenues] = useState<any[]>([]);
  const [dbStaff, setDbStaff] = useState<any[]>([]);
  const [dbBookings, setDbBookings] = useState<any[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const fetchVenues = async () => {
    try {
      setLoadingVenues(true);
      const res = await api.get("/venues");
      setDbVenues(res.data);
    } catch (err) {
      console.error("Failed to load venues", err);
    } finally {
      setLoadingVenues(false);
    }
  };

  const fetchStaff = async () => {
    try {
      setLoadingStaff(true);
      const res = await api.get("/users/staff");
      setDbStaff(res.data);
    } catch (err) {
      console.error("Failed to load staff", err);
    } finally {
      setLoadingStaff(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const res = await api.get("/bookings/admin");
      setDbBookings(res.data);
    } catch (err) {
      console.error("Failed to load bookings", err);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchVenues();
    fetchStaff();
    fetchBookings();
  }, []);

  useEffect(() => {
    const customerMap = new Map<string, any>();
    dbBookings.forEach((b) => {
      const key = b.userId || b.customerName || "Unknown";
      const name = b.customerName || b.user?.name || "Walk-in Customer";
      const email = b.user?.email || `${name.toLowerCase().replace(/\s+/g, "")}@example.com`;
      const phone = b.customerPhone || b.user?.phone || "+91 99999 99999";
      const amount = b.totalAmount || 0;
      const sport = b.turf?.sport || "Football";

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: key.startsWith("usr_") || key.length > 10 ? `CUST-${key.slice(-4).toUpperCase()}` : `CUST-${key}`,
          name,
          email,
          phone,
          bookings: 0,
          totalSpent: 0,
          preference: sport,
          status: "Active",
        });
      }

      const existing = customerMap.get(key);
      existing.bookings += 1;
      existing.totalSpent += amount;
      if (b.turf?.sport) {
        existing.preference = b.turf.sport;
      }
    });

    setCustomers(Array.from(customerMap.values()));
  }, [dbBookings]);

  const supervisors = useMemo(() => {
    return dbStaff.map((s: any) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      phone: s.phone || "+91 93322 11009",
      assignedVenue: s.venue?.name || "No Venue Assigned",
      dailyCollection: 0,
      status: "Active",
    }));
  }, [dbStaff]);

  const dynamicStats = useMemo(() => {
    const bookingsList = dbBookings;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let monthRevenue = 0;
    let yearRevenue = 0;

    bookingsList.forEach((b: any) => {
      const status = (b.status || "").toLowerCase();
      if (status === "cancelled") return;

      const amt = b.amount || b.totalAmount || 0;
      const splits = getSplitPayments(b.id, amt, b);
      const paid = splits.reduce((sum, s) => sum + s.amount, 0);

      const dateVal = b.slotDate || b.date || b.createdAt;
      let monthVal = currentMonth;
      let yearVal = currentYear;
      if (dateVal) {
        const d = new Date(dateVal);
        if (!isNaN(d.getTime())) {
          monthVal = d.getMonth();
          yearVal = d.getFullYear();
        } else if (typeof dateVal === "string") {
          const lower = dateVal.toLowerCase();
          const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
          for (let i = 0; i < 12; i++) {
            if (lower.includes(months[i])) {
              monthVal = i;
              break;
            }
          }
        }
      } else if (b.id) {
        const num = parseInt(b.id.replace(/\D/g, ""), 10);
        if (!isNaN(num)) {
          monthVal = num % 12;
        }
      }

      if (yearVal === currentYear) {
        yearRevenue += paid;
        if (monthVal === currentMonth) {
          monthRevenue += paid;
        }
      }
    });

    const breakdown = getPaymentMethodBreakdown(bookingsList);
    const trend = getMonthlyRevenueTrend(bookingsList);

    return {
      monthRevenue,
      yearRevenue,
      breakdown,
      trend,
    };
  }, [dbBookings]);


  const [customSports, setCustomSports] = useState<string[]>(() => {
    const stored = localStorage.getItem("custom_sports");
    if (stored) return JSON.parse(stored);
    const initial = ["FOOTBALL", "CRICKET", "BADMINTON", "TENNIS", "PICKLEBALL","POOL","SNOOKER"];
    localStorage.setItem("custom_sports", JSON.stringify(initial));
    return initial;
  });
  const [newSportInput, setNewSportInput] = useState("");

  const handleAddSport = () => {
    if (!newSportInput.trim()) return;
    const key = newSportInput.trim().toUpperCase();
    if (customSports.includes(key)) {
      toast.error("Sport category already exists!");
      return;
    }
    const updated = [...customSports, key];
    setCustomSports(updated);
    localStorage.setItem("custom_sports", JSON.stringify(updated));
    setNewSportInput("");
    toast.success(`Custom sport category "${key}" successfully added!`);
  };

  const handleRemoveSport = (sport: string) => {
    const updated = customSports.filter(s => s !== sport);
    setCustomSports(updated);
    localStorage.setItem("custom_sports", JSON.stringify(updated));
    toast.success(`Removed "${sport}" category.`);
  };

  // CRM database
  const [customers, setCustomers] = useState<any[]>([]);

  // Payments Ledger
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    const list = dbBookings.map((b: any, index: number) => {
      const amount = b.amount || 0;
      const remaining = b.remainingAmount !== undefined ? b.remainingAmount : (amount - (b.advancePaid || 0));
      const isPaid = b.paymentStatus?.toLowerCase() === "paid" || remaining === 0;
      
      let status = "Unpaid";
      if (isPaid) {
        status = "Fully Paid";
      } else if ((b.advancePaid || 0) > 0) {
        status = "Partially Paid";
      }

      return {
        id: b.id ? `PAY-${b.id.slice(-4).toUpperCase()}` : `PAY-${100 + index}`,
        customer: b.customer || "Walk-in Customer",
        amount: amount,
        due: isPaid ? 0 : remaining,
        method: b.paymentMethod || "UPI",
        status: status,
        date: b.slot ? b.slot.split("•")[0].trim() : "Today",
      };
    });
    setPayments(list);
  }, [dbBookings]);

  // Form states
  const [searchQuery, setSearchQuery] = useState("");
  const [addTrnModal, setAddTrnModal] = useState(false);
  const [newTrn, setNewTrn] = useState({
    title: "",
    organizer: "",
    phone: "",
    turfs: "Football Pitch A",
    packagePrice: 0,
    advance: 0,
  });

  const [addGuestModal, setAddGuestModal] = useState(false);
  const [newGuest, setNewGuest] = useState({
    name: "",
    phone: "",
    turf: "Football Pitch A",
    slot: "07:00 PM - 08:00 PM",
    amount: 1200,
    paymentMode: "UPI (GPay)",
  });

  const [addMntModal, setAddMntModal] = useState(false);
  const [newMnt, setNewMnt] = useState({
    turf: "Football Pitch A",
    issue: "",
    severity: "Low",
    supervisor: "Ramesh Kumar",
  });

  const [addSupModal, setAddSupModal] = useState(false);
  const [newSup, setNewSup] = useState({
    name: "",
    email: "",
    password: "",
    venueId: "",
  });

  // Dynamic Chart & Performance Calculations
  const revenueTrend = useMemo(() => {
    if (dbBookings.length === 0) return [];
    const groups: Record<string, number> = {};
    dbBookings.forEach((b) => {
      const dateVal = b.slotDate || b.date || b.createdAt;
      if (!dateVal) return;
      const formattedDate = new Date(dateVal).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      groups[formattedDate] = (groups[formattedDate] || 0) + (b.amount || 0);
    });
    return Object.entries(groups).map(([date, revenue]) => ({
      date,
      revenue,
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [dbBookings]);

  const turfPerformance = useMemo(() => {
    if (dbBookings.length === 0) return [];
    const performanceMap: Record<string, { bookings: number; revenue: number }> = {};
    dbBookings.forEach((b) => {
      const turfName = b.venue || "Unknown Venue";
      if (!performanceMap[turfName]) {
        performanceMap[turfName] = { bookings: 0, revenue: 0 };
      }
      performanceMap[turfName].bookings += 1;
      performanceMap[turfName].revenue += b.amount || 0;
    });

    const colors = ["#14532D", "#16A34A", "#22C55E", "#86EFAC", "#A7F3D0"];
    return Object.entries(performanceMap).map(([name, data], index) => ({
      name,
      bookings: data.bookings,
      revenue: data.revenue,
      color: colors[index % colors.length],
    }));
  }, [dbBookings]);

  const peakSlots = useMemo(() => {
    if (dbBookings.length === 0) return [];
    const buckets = [
      { slot: "6 AM - 8 AM", hours: [6, 7], count: 0 },
      { slot: "8 AM - 12 PM", hours: [8, 9, 10, 11], count: 0 },
      { slot: "12 PM - 4 PM", hours: [12, 13, 14, 15], count: 0 },
      { slot: "4 PM - 6 PM", hours: [16, 17], count: 0 },
      { slot: "6 PM - 8 PM", hours: [18, 19], count: 0 },
      { slot: "8 PM - 10 PM", hours: [20, 21], count: 0 },
      { slot: "10 PM - 12 AM", hours: [22, 23], count: 0 },
    ];

    dbBookings.forEach((b) => {
      const slotStr = (b.slot || "").toLowerCase();
      let hour = -1;
      const timeMatch = slotStr.match(/(\d+):(\d+)\s*(pm|am)?/i) || slotStr.match(/(\d+)\s*(pm|am)/i);
      if (timeMatch) {
        let h = parseInt(timeMatch[1], 10);
        const isPM = slotStr.includes("pm") || (timeMatch[3] && timeMatch[3].toLowerCase() === "pm");
        const isAM = slotStr.includes("am") || (timeMatch[3] && timeMatch[3].toLowerCase() === "am");
        if (isPM && h < 12) h += 12;
        if (isAM && h === 12) h = 0;
        hour = h;
      } else {
        const numberMatches = slotStr.match(/\d+/g);
        if (numberMatches && numberMatches.length > 0) {
          hour = parseInt(numberMatches[0], 10);
          if (slotStr.includes("pm") && hour < 12) hour += 12;
        }
      }

      if (hour !== -1) {
        const bucket = buckets.find((bucket) => bucket.hours.includes(hour));
        if (bucket) {
          bucket.count += 1;
        }
      }
    });

    const maxCount = Math.max(...buckets.map((b) => b.count));
    return buckets
      .map((b) => ({
        slot: b.slot,
        occupancy: maxCount > 0 ? Math.round((b.count / maxCount) * 100) : 0,
      }))
      .filter((b) => b.occupancy > 0);
  }, [dbBookings]);

  // Action handlers
  const handleToggleSupervisor = async (id: string) => {
    try {
      await api.delete(`/users/staff/${id}`);
      toast.success("Supervisor successfully deleted");
      fetchStaff();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to delete supervisor";
      toast.error(msg);
    }
  };

  const handleResolveMaintenance = (id: string) => {
    setMaintenance(
      maintenance.map((m) =>
        m.id === id ? { ...m, status: "Resolved" } : m
      )
    );
    toast.success("Turf maintenance issue marked Resolved");
  };

  const handleCollectDues = (id: string) => {
    setPayments(
      payments.map((p) =>
        p.id === id ? { ...p, due: 0, status: "Fully Paid" } : p
      )
    );
    toast.success("Remaining payment successfully received and cleared");
  };

  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrn.title || !newTrn.organizer || !newTrn.phone || newTrn.packagePrice <= 0) {
      toast.error("Please fill in all fields correctly");
      return;
    }
    const newId = `TRN-${tournaments.length + 501}`;
    setTournaments([
      ...tournaments,
      {
        ...newTrn,
        id: newId,
        dues: newTrn.packagePrice - newTrn.advance,
        status: "Upcoming",
        dates: "Jun 15 - Jun 18",
      },
    ]);
    setAddTrnModal(false);
    toast.success("Tournament booking generated successfully. Slots blocked.");
  };

  const handleCreateGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuest.name || !newGuest.phone) {
      toast.error("Please fill in all guest fields");
      return;
    }
    const newId = `GST-${guestBookings.length + 701}`;
    setGuestBookings([
      ...guestBookings,
      {
        ...newGuest,
        id: newId,
        date: "Today",
      },
    ]);
    setAddGuestModal(false);
    toast.success("Walk-in slot assigned and receipt created");
  };

  const handleCreateMnt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMnt.issue) {
      toast.error("Please enter a description of the issue");
      return;
    }
    const newId = `MNT-${maintenance.length + 201}`;
    setMaintenance([
      ...maintenance,
      {
        ...newMnt,
        id: newId,
        date: "Today",
        status: "Logged",
      },
    ]);
    setAddMntModal(false);
    toast.success("Ground maintenance ticket raised. Turf schedule updated.");
  };

  const handleCreateSup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSup.name || !newSup.email || !newSup.password || !newSup.venueId) {
      toast.error("Please fill in name, email, password, and assigned venue");
      return;
    }
    if (!newSup.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    try {
      await api.post("/users/staff", {
        name: newSup.name,
        email: newSup.email,
        password: newSup.password,
        venueId: newSup.venueId,
      });
      toast.success("New Supervisor created. Credentials issued.");
      fetchStaff();
      setNewSup({
        name: "",
        email: "",
        password: "",
        venueId: dbVenues[0]?.id || "",
      });
      setAddSupModal(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to create supervisor";
      toast.error(msg);
    }
  };

  // Render view
  if (view === "dashboard") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Business Command Center
          </h1>
          <p className="text-slate-500 mt-1">
            Real-time tracking of bookings, collections, turf popularity, and ground staff.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Today's Revenue"
            value="₹35,000"
            change="₹18,000 online • ₹17,000 cash"
            positive
            icon={IndianRupee}
          />
          <KpiCard
            title="Today's Bookings"
            value="32 Slots"
            change="22 app bookings • 10 walk-ins"
            positive
            icon={CalendarDays}
          />
          <KpiCard
            title="Average Occupancy"
            value="82%"
            change="Peak: 7PM - 9PM (95%)"
            positive
            icon={Activity}
          />
          <KpiCard
            title="Pending Customer Dues"
            value="₹21,500"
            change="3 bookings have unpaid balances"
            positive={false}
            icon={Users}
          />
        </div>

        {/* Payment breakdown and Monthly/Yearly Revenue KPIs */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 mt-4">
          <KpiCard
            title="This Month's Revenue"
            value={`₹${dynamicStats.monthRevenue.toLocaleString()}`}
            change="All active venues"
            positive
            icon={IndianRupee}
          />
          <KpiCard
            title="This Year's Revenue"
            value={`₹${dynamicStats.yearRevenue.toLocaleString()}`}
            change="Current calendar year"
            positive
            icon={TrendingUp}
          />
          <KpiCard
            title="Cash / UPI Revenue"
            value={`₹${dynamicStats.breakdown.cash.toLocaleString()} / ₹${dynamicStats.breakdown.UPI.toLocaleString()}`}
            change="Based on splits"
            positive
            icon={IndianRupee}
          />
          <KpiCard
            title="Card / Transfer / Other"
            value={`₹${(dynamicStats.breakdown.card || 0).toLocaleString()} / ₹${(dynamicStats.breakdown["bank transfer"] || 0).toLocaleString()}`}
            change={`Other: ₹${(dynamicStats.breakdown.other || 0).toLocaleString()}`}
            positive
            icon={Activity}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionCard title={`Monthly Revenue Trend (${new Date().getFullYear()})`}>
              <div className="h-[280px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dynamicStats.trend}>
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="#14532D"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>

          <div className="lg:col-span-1">
            <SectionCard title="Peak Slots by Occupancy">
              <div className="space-y-4 mt-4">
                {peakSlots.map((item) => (
                  <div key={item.slot} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{item.slot}</span>
                      <span>{item.occupancy}% occupancy</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-800 rounded-full"
                        style={{ width: `${item.occupancy}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>

        {/* Turf performance */}
        <SectionCard title="Turf Inventory Performance">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
            {turfPerformance.map((turf) => (
              <div
                key={turf.name}
                className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: turf.color }}
                  />
                  <h4 className="font-bold text-slate-800 text-sm">{turf.name}</h4>
                </div>
                <div className="flex justify-between items-baseline mt-4">
                  <span className="text-2xl font-extrabold text-emerald-800">
                    ₹{turf.revenue.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">
                    {turf.bookings} slots booked
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    );
  }

  // --- TOURNAMENTS VIEW ---
  if (view === "tournaments") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Tournament Allocations
            </h1>
            <p className="text-slate-500 mt-1">
              Block multiple grounds, setup custom pricing structures, and record corporate deposits.
            </p>
          </div>
          <Button
            onClick={() => setAddTrnModal(true)}
            className="rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold flex items-center gap-2 shadow-sm self-start sm:self-center"
          >
            <Plus size={16} />
            <span>Create Tournament</span>
          </Button>
        </div>

        {/* Tournaments List */}
        <div className="grid gap-5 md:grid-cols-2">
          {tournaments.map((trn) => (
            <div
              key={trn.id}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <span className="bg-emerald-50 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full">
                    {trn.id}
                  </span>
                  <span
                    className={`inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      trn.status === "Active"
                        ? "text-emerald-700 bg-emerald-50"
                        : "text-amber-700 bg-amber-50"
                    }`}
                  >
                    {trn.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 leading-tight">
                  {trn.title}
                </h3>
                <p className="text-sm font-semibold text-slate-500">
                  Organizer: <span className="text-slate-800 font-bold">{trn.organizer}</span> ({trn.phone})
                </p>
                <p className="text-xs text-slate-400 font-bold">
                  Assigned: {trn.turfs} • {trn.dates}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-sm font-bold">
                <div>
                  <p className="text-xs text-slate-400">Total Price</p>
                  <p className="text-slate-800 font-extrabold">₹{trn.packagePrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Advance Paid</p>
                  <p className="text-emerald-700">₹{trn.advance.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Pending Dues</p>
                  <p className={trn.dues > 0 ? "text-red-600" : "text-emerald-700"}>
                    ₹{trn.dues.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Create Tournament */}
        {addTrnModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Generate Tournament Block</h3>
                <button
                  onClick={() => setAddTrnModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateTournament} className="space-y-3 font-medium text-slate-700 text-xs">
                <div className="space-y-1">
                  <Label className="text-slate-500 font-bold">Tournament Name</Label>
                  <Input
                    required
                    value={newTrn.title}
                    onChange={(e) => setNewTrn({ ...newTrn, title: e.target.value })}
                    placeholder="e.g. Corporate League"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-500 font-bold">Organizer Group Name</Label>
                  <Input
                    required
                    value={newTrn.organizer}
                    onChange={(e) => setNewTrn({ ...newTrn, organizer: e.target.value })}
                    placeholder="e.g. Red Bull Club"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-500 font-bold">Organizer Mobile</Label>
                  <Input
                    required
                    value={newTrn.phone}
                    onChange={(e) => setNewTrn({ ...newTrn, phone: e.target.value })}
                    placeholder="+91 99887 76655"
                    className="rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-slate-500 font-bold">Package Price (₹)</Label>
                    <Input
                      type="number"
                      required
                      value={newTrn.packagePrice || ""}
                      onChange={(e) =>
                        setNewTrn({ ...newTrn, packagePrice: Number(e.target.value) })
                      }
                      placeholder="e.g. 50000"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-500 font-bold">Advance Deposit (₹)</Label>
                    <Input
                      type="number"
                      required
                      value={newTrn.advance || ""}
                      onChange={(e) =>
                        setNewTrn({ ...newTrn, advance: Number(e.target.value) })
                      }
                      placeholder="e.g. 20000"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddTrnModal(false)}
                    className="flex-1 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl"
                  >
                    Confirm Slots Block
                  </Button>
                </div>
              </form>
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
              Add bookings for offline players, collect on-ground payments, and issue dynamic receipts.
            </p>
          </div>
          <Button
            onClick={() => setAddGuestModal(true)}
            className="rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold flex items-center gap-2 shadow-sm self-start sm:self-center"
          >
            <Plus size={16} />
            <span>New Walk-in</span>
          </Button>
        </div>

        {/* Guest ledger list */}
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 font-bold text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Guest Details</th>
                  <th className="py-4 px-6">Assigned Space</th>
                  <th className="py-4 px-6">Slot Timings</th>
                  <th className="py-4 px-6">Amount Collected</th>
                  <th className="py-4 px-6">Payment Mode</th>
                  <th className="py-4 px-6 text-right">Receipt Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {guestBookings.map((guest) => (
                  <tr key={guest.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800">{guest.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <Phone size={12} />
                        {guest.phone}
                      </p>
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
                    <td className="py-4 px-6">
                      <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        {guest.paymentMode}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toast.success("Opening receipt PDF template for print")}
                          className="rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                        >
                          <Printer size={16} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toast.success("Receipt successfully shared on customer WhatsApp")}
                          className="rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50"
                        >
                          <Share2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: New Walk-in */}
        {addGuestModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Logger Walk-in Booking</h3>
                <button
                  onClick={() => setAddGuestModal(false)}
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
                    placeholder="e.g. Siddharth Goel"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-500 font-bold">Phone Number</Label>
                  <Input
                    required
                    value={newGuest.phone}
                    onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                    placeholder="+91 99887 76655"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-500 font-bold">Select Playing Turf</Label>
                  <select
                    value={newGuest.turf}
                    onChange={(e) => setNewGuest({ ...newGuest, turf: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-transparent"
                  >
                    <option value="Football Pitch A">Football Pitch A</option>
                    <option value="Football Pitch B">Football Pitch B</option>
                    <option value="Cricket Ground A">Cricket Ground A</option>
                    <option value="Badminton Court 1">Badminton Court 1</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-slate-500 font-bold">Cash/UPI Amount (₹)</Label>
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
                      <option value="UPI (GPay)">UPI (GPay)</option>
                      <option value="Cash">Cash</option>
                      <option value="Card Swipe">Card Swipe</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddGuestModal(false)}
                    className="flex-1 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl"
                  >
                    Generate Ticket
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- MAINTENANCE MODE ---
  if (view === "maintenance") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Turf Downtime & Issue Logs
            </h1>
            <p className="text-slate-500 mt-1">
              Log turf structural issues, designate repair staff, and block slots to avoid overlaps.
            </p>
          </div>
          <Button
            onClick={() => setAddMntModal(true)}
            className="rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold flex items-center gap-2 shadow-sm self-start sm:self-center"
          >
            <Plus size={16} />
            <span>Raise Ticket</span>
          </Button>
        </div>

        {/* Maintenance list */}
        <div className="grid gap-5 md:grid-cols-2">
          {maintenance.map((m) => (
            <div
              key={m.id}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {m.id}
                  </span>
                  <span
                    className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
                      m.status === "Resolved"
                        ? "text-emerald-700 bg-emerald-50"
                        : "text-amber-700 bg-amber-50"
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 leading-tight">
                  {m.turf}
                </h3>
                <p className="text-sm font-semibold text-slate-600">{m.issue}</p>
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold pt-2">
                  <p>Urgency: <span className={m.severity === "Urgent" ? "text-red-600 font-extrabold" : "text-slate-500"}>{m.severity}</span></p>
                  <p>Assigned Staff: {m.supervisor}</p>
                </div>
              </div>

              {m.status !== "Resolved" && (
                <Button
                  onClick={() => handleResolveMaintenance(m.id)}
                  className="rounded-xl w-full bg-slate-100 text-emerald-800 hover:bg-slate-200 font-bold text-xs py-2 shadow-none border-0"
                >
                  Mark Issue Resolved & Open Slots
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Modal: Raise maintenance */}
        {addMntModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Raise Maintenance downtime</h3>
                <button
                  onClick={() => setAddMntModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateMnt} className="space-y-3 font-medium text-slate-700 text-xs">
                <div className="space-y-1">
                  <Label className="text-slate-500 font-bold">Select Damaged Turf</Label>
                  <select
                    value={newMnt.turf}
                    onChange={(e) => setNewMnt({ ...newMnt, turf: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-transparent"
                  >
                    <option value="Football Pitch A">Football Pitch A</option>
                    <option value="Football Pitch B">Football Pitch B</option>
                    <option value="Cricket Ground A">Cricket Ground A</option>
                    <option value="Badminton Court 1">Badminton Court 1</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-500 font-bold">Issue Description</Label>
                  <Input
                    required
                    value={newMnt.issue}
                    onChange={(e) => setNewMnt({ ...newMnt, issue: e.target.value })}
                    placeholder="e.g. net tearing, lighting ballast failure"
                    className="rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-slate-500 font-bold">Severity Level</Label>
                    <select
                      value={newMnt.severity}
                      onChange={(e) => setNewMnt({ ...newMnt, severity: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 bg-transparent"
                    >
                      <option value="Low">Low (No blocking)</option>
                      <option value="Urgent">Urgent (Block Slots)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-500 font-bold">Assign Staff Member</Label>
                    <select
                      value={newMnt.supervisor}
                      onChange={(e) => setNewMnt({ ...newMnt, supervisor: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 bg-transparent"
                    >
                      <option value="Ramesh Kumar">Ramesh Kumar</option>
                      <option value="Sunil Dutt">Sunil Dutt</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddMntModal(false)}
                    className="flex-1 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl"
                  >
                    Submit Issue Ticket
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- STAFF & SUPERVISORS ---
  if (view === "staff") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Staff & Supervisors Directory
            </h1>
            <p className="text-slate-500 mt-1">
              Add operational supervisors, assign grounds, reset passwords, and audit daily cash collections.
            </p>
          </div>
          <Button
            onClick={() => setAddSupModal(true)}
            className="rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold flex items-center gap-2 shadow-sm self-start sm:self-center"
          >
            <Plus size={16} />
            <span>Create Supervisor</span>
          </Button>
        </div>

        {/* Staff Table */}
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 font-bold text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Supervisor Name</th>
                  <th className="py-4 px-6">Assigned Turf Scope</th>
                  <th className="py-4 px-6">Daily Collections Recorded</th>
                  <th className="py-4 px-6">Account Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {supervisors.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800">{s.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{s.phone}</p>
                      {s.email && <p className="text-[10px] text-slate-400 mt-0.5">{s.email}</p>}
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-full">
                        {s.assignedVenue}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-emerald-800">
                      ₹{s.dailyCollection.toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${
                          s.status === "Active"
                            ? "text-emerald-700 bg-emerald-50"
                            : "text-red-700 bg-red-50"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            toast.success(`Temporary password set to 'GameUp123' for ${s.name}`);
                          }}
                          className="rounded-xl text-xs px-2.5 py-1 h-auto"
                        >
                          Reset Credentials
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleSupervisor(s.id)}
                          className={`rounded-xl text-xs font-bold px-2.5 py-1 h-auto ${
                            s.status === "Active"
                              ? "text-red-600 hover:bg-red-50"
                              : "text-emerald-700 hover:bg-emerald-50"
                          }`}
                        >
                          {s.status === "Active" ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Create Supervisor */}
        {addSupModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Create Supervisor Profile</h3>
                <button
                  onClick={() => setAddSupModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateSup} className="space-y-3 font-medium text-slate-700 text-xs">
                <div className="space-y-1">
                  <Label className="text-slate-500 font-bold">Supervisor Full Name</Label>
                  <Input
                    required
                    value={newSup.name}
                    onChange={(e) => setNewSup({ ...newSup, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-500 font-bold">Email Address</Label>
                  <Input
                    required
                    type="email"
                    value={newSup.email}
                    onChange={(e) => setNewSup({ ...newSup, email: e.target.value })}
                    placeholder="ramesh@goalsports.com"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-500 font-bold">Password</Label>
                  <Input
                    required
                    type="password"
                    value={newSup.password}
                    onChange={(e) => setNewSup({ ...newSup, password: e.target.value })}
                    placeholder="••••••••"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-500 font-bold">Assigned Venue</Label>
                  <select
                    value={newSup.venueId}
                    onChange={(e) => setNewSup({ ...newSup, venueId: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-transparent"
                  >
                    <option value="">-- Select Venue --</option>
                    {dbVenues.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddSupModal(false)}
                    className="flex-1 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl"
                  >
                    Add Staff
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- CUSTOMER CRM ---
  if (view === "customers") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Customers CRM Directory
          </h1>
          <p className="text-slate-500 mt-1">
            Track repeat booking habits, identify VIPs, and review total spends at your venues.
          </p>
        </div>

        {/* Customer Table */}
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 font-bold text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Customer Profile</th>
                  <th className="py-4 px-6">Frequency</th>
                  <th className="py-4 px-6">Preferred Turf Space</th>
                  <th className="py-4 px-6">Gross Spend (₹)</th>
                  <th className="py-4 px-6">Class Designation</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800">{c.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{c.phone}</p>
                    </td>
                    <td className="py-4 px-6 font-semibold">{c.bookings} bookings</td>
                    <td className="py-4 px-6">
                      <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-full">
                        {c.preference}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-emerald-800">
                      ₹{c.totalSpent.toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${
                          c.status === "VIP"
                            ? "text-emerald-700 bg-emerald-50"
                            : "text-slate-600 bg-slate-100"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {c.status !== "VIP" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setCustomers(
                              customers.map((cust) =>
                                cust.id === c.id ? { ...cust, status: "VIP" } : cust
                              )
                            );
                            toast.success(`${c.name} promoted to VIP status!`);
                          }}
                          className="rounded-xl text-xs text-emerald-700 font-bold hover:bg-emerald-50 px-2 py-1 h-auto"
                        >
                          Mark VIP
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">VIP Account</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // --- PAYMENTS LEDGER ---
  if (view === "payments") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Venue Billing & Ledger
          </h1>
          <p className="text-slate-500 mt-1">
            Capture manual cash bookings, split transaction balances, and download PDF receipts.
          </p>
        </div>

        {/* Payments list */}
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 font-bold text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Payment ID & Timestamp</th>
                  <th className="py-4 px-6">Player / Client</th>
                  <th className="py-4 px-6">Gross Amount</th>
                  <th className="py-4 px-6">Pending Dues</th>
                  <th className="py-4 px-6">Billing Mode</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800">{p.id}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{p.date}</p>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-700">{p.customer}</td>
                    <td className="py-4 px-6">₹{p.amount.toLocaleString()}</td>
                    <td className="py-4 px-6 font-bold text-red-600">
                      ₹{p.due.toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        {p.method}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${
                          p.status === "Fully Paid"
                            ? "text-emerald-700 bg-emerald-50"
                            : p.status === "Partially Paid"
                            ? "text-amber-700 bg-amber-50"
                            : "text-red-700 bg-red-50"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {p.due > 0 ? (
                        <Button
                          size="sm"
                          onClick={() => handleCollectDues(p.id)}
                          className="rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs px-2.5 py-1 h-auto font-bold shadow-sm"
                        >
                          Collect Balance
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Cleared</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // --- BUSINESS REPORTS ---
  if (view === "reports") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Business Financial Reports
          </h1>
          <p className="text-slate-500 mt-1">
            Comprehensive summaries of daily revenues, supervisor collections, and turf occupancies.
          </p>
        </div>

        {/* Report charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <SectionCard title="Turf Contribution (Gross Revenue)">
            <div className="h-[260px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={turfPerformance}>
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#14532D">
                    {turfPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard title="Supervisor Collection Audits">
            <div className="space-y-4 mt-4 font-semibold text-slate-700">
              {supervisors.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between border-b border-slate-100 pb-3"
                >
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">{s.name}</h5>
                    <p className="text-xs text-slate-400 mt-0.5">Assigned to: {s.assignedVenue}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-emerald-800">
                      ₹{s.dailyCollection.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Deposited today</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    );
  }

  // --- BUSINESS SETTINGS ---
  if (view === "settings") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Venue Management Settings
          </h1>
          <p className="text-slate-500 mt-1">
            Configure default slot dimensions, pricing ratios, local cancellation thresholds, and staff permissions.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <SectionCard title="Venue Cancellation Policy">
            <div className="space-y-4 mt-4 font-medium text-slate-700 text-xs">
              <div className="space-y-1">
                <Label className="font-bold text-slate-600">Local Free Cancellation Windows (Hours)</Label>
                <select className="w-full border border-slate-200 rounded-xl p-2.5 bg-transparent">
                  <option value="12">12 hours before slot start time</option>
                  <option value="24">24 hours before slot start time (Recommended)</option>
                  <option value="48">48 hours before slot start time</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="font-bold text-slate-600">Refund Handling Method</Label>
                <select className="w-full border border-slate-200 rounded-xl p-2.5 bg-transparent">
                  <option value="original">Refund directly back to original payment gateway</option>
                  <option value="wallet">Refund to player wallet credits only</option>
                </select>
              </div>

              <Button
                onClick={() => toast.success("Local refund configurations successfully saved")}
                className="rounded-xl w-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold pt-2.5 pb-2.5 h-auto mt-2"
              >
                Save Policies
              </Button>
            </div>
          </SectionCard>

          <SectionCard title="Supervisor Permissions Template">
            <div className="space-y-4 mt-4 font-medium text-slate-700 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h5 className="font-bold text-slate-800 text-sm">Can Shift Slot Timings</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">Allows supervisor to shift bookings on-ground</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  onChange={() => toast.info("Supervisor timing overrides set")}
                  className="w-8 h-4 bg-slate-200 rounded-full checked:bg-emerald-600 cursor-pointer appearance-none transition-colors relative outline-none before:content-[''] before:absolute before:w-3.5 before:h-3.5 before:bg-white before:rounded-full before:top-px before:left-px checked:before:translate-x-3.5"
                />
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h5 className="font-bold text-slate-800 text-sm">Can Issue Manual Discounts</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">Allows supervisors to modify pricing on walk-ins</p>
                </div>
                <input
                  type="checkbox"
                  onChange={() => toast.info("Supervisor pricing overrides set")}
                  className="w-8 h-4 bg-slate-200 rounded-full checked:bg-emerald-600 cursor-pointer appearance-none transition-colors relative outline-none before:content-[''] before:absolute before:w-3.5 before:h-3.5 before:bg-white before:rounded-full before:top-px before:left-px checked:before:translate-x-3.5"
                />
              </div>

              <Button
                onClick={() => toast.success("Supervisor templates updated successfully")}
                className="rounded-xl w-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold pt-2.5 pb-2.5 h-auto mt-2"
              >
                Apply Templates
              </Button>
            </div>
          </SectionCard>

          <SectionCard title="Manage Sport Categories">
            <div className="space-y-4 mt-4 font-medium text-slate-700 text-xs">
              <p className="text-[10px] text-slate-400">
                Create new sport categories dynamically. These become available instantly when creating or editing turfs.
              </p>

              <div className="flex gap-2">
                <Input
                  value={newSportInput}
                  onChange={(e) => setNewSportInput(e.target.value)}
                  placeholder="e.g. Volleyball, Basketball"
                  className="rounded-xl flex-1"
                />
                <Button
                  onClick={handleAddSport}
                  className="rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold shrink-0"
                >
                  Add Sport
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {customSports.map((sport) => (
                  <div
                    key={sport}
                    className="flex items-center gap-1.5 bg-slate-100 text-slate-800 px-3 py-1.5 rounded-full text-xs font-bold capitalize border border-slate-200/50 shadow-sm"
                  >
                    <span>{sport.toLowerCase()}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSport(sport)}
                      className="text-red-500 hover:text-red-700 font-extrabold text-sm select-none"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    );
  }

  return null;
}
