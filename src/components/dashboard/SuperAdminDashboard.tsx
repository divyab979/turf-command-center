import { useState, useEffect, useMemo } from "react";
import {
  IndianRupee,
  CalendarDays,
  Building,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Plus,
  RefreshCw,
  TrendingUp,
  Settings as SettingsIcon,
  ShieldAlert,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KpiCard } from "./kpi-card";
import { SectionCard } from "./section-card";
import { StatusBadge } from "./status-badge";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { getBookings } from "@/features/bookings/api/get-bookings";
import { getSplitPayments, getPaymentMethodBreakdown, getMonthlyRevenueTrend } from "@/utils/payment-store";

interface Props {
  view?: string;
}

export function SuperAdminDashboard({ view = "dashboard" }: Props) {
  // --- MOCK STATES ---
  // --- DYNAMIC DATABASE STATES ---
  const [dbBookings, setDbBookings] = useState<any[]>([]);
  const [dbVenues, setDbVenues] = useState<any[]>([]);
  const [rawBookings, setRawBookings] = useState<any[]>([]);
  const [dbOwners, setDbOwners] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const [bookingsResult, venuesResult, rawBookingsResult, ownersResult] =
        await Promise.allSettled([
          getBookings(),
          api.get("/venues"),
          api.get("/bookings/admin"),
          api.get("/users/owners"),
        ]);

      if (bookingsResult.status === "fulfilled") {
        setDbBookings(bookingsResult.value);
      } else {
        console.warn("Could not load bookings:", bookingsResult.reason?.response?.status);
      }

      if (venuesResult.status === "fulfilled") {
        setDbVenues(venuesResult.value.data);
      } else {
        console.warn("Could not load venues:", venuesResult.reason?.response?.status);
      }

      if (rawBookingsResult.status === "fulfilled") {
        setRawBookings(rawBookingsResult.value.data);
      } else {
        console.warn("Could not load raw bookings:", rawBookingsResult.reason?.response?.status);
      }

      if (ownersResult.status === "fulfilled") {
        setDbOwners(ownersResult.value.data);
      } else {
        console.warn(
          "Could not load owners list (insufficient permissions):",
          ownersResult.reason?.response?.status
        );
      }
    } catch (err) {
      console.error("Unexpected error loading platform stats", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    setOwners(
      dbOwners.map((o: any) => ({
        id: o.id,
        name: o.name,
        email: o.email,
        phone: o.phone || "+91 99999 99999",
        venueCount: o.ownedVenues?.length || 0,
        kyc: "Verified",
        status: o.status || "Active",
        joined: o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "Joined Today",
      }))
    );
  }, [dbOwners]);

  useEffect(() => {
    const customerMap = new Map<string, any>();
    rawBookings.forEach((b) => {
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
  }, [rawBookings]);

  const totalPlatformRevenue = useMemo(() => {
    return dbBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
  }, [dbBookings]);

  const totalBookingsCount = useMemo(() => {
    return dbBookings.length;
  }, [dbBookings]);

  const activeVenuesCount = useMemo(() => {
    return dbVenues.length;
  }, [dbVenues]);

  const registeredCustomersCount = useMemo(() => {
    const unique = new Set(dbBookings.map(b => b.customer));
    return unique.size;
  }, [dbBookings]);

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

  // --- MOCK STATES REMOVED ---
  const [owners, setOwners] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);

  const [commissionRate, setCommissionRate] = useState(10);
  const [refundPolicy, setRefundPolicy] = useState("flexible");
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);

  // Search States
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State for Add Owner
  const [addOwnerModal, setAddOwnerModal] = useState(false);
  const [newOwner, setNewOwner] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    venueCount: 0,
    kyc: "Pending",
    status: "Active",
  });

  // Dynamic Chart & Metric Calculations
  const bookingTrend = useMemo(() => {
    if (rawBookings.length === 0) return [];
    const groups: Record<string, { bookings: number; revenue: number }> = {};
    rawBookings.forEach((b) => {
      const dateVal = b.bookingDate || b.createdAt;
      if (!dateVal) return;
      const formattedDate = new Date(dateVal).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (!groups[formattedDate]) {
        groups[formattedDate] = { bookings: 0, revenue: 0 };
      }
      groups[formattedDate].bookings += 1;
      groups[formattedDate].revenue += b.totalAmount || 0;
    });
    return Object.entries(groups)
      .map(([date, data]) => ({
        date,
        bookings: data.bookings,
        revenue: data.revenue,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [rawBookings]);

  const occupancyByVenue = useMemo(() => {
    if (rawBookings.length === 0 || dbVenues.length === 0) return [];
    const bookingsCountByVenue: Record<string, number> = {};
    rawBookings.forEach((b) => {
      const venueName = b.venue?.name || "Unknown";
      bookingsCountByVenue[venueName] = (bookingsCountByVenue[venueName] || 0) + 1;
    });

    return dbVenues.map((v) => {
      const name = v.name;
      const count = bookingsCountByVenue[name] || 0;
      const occupancy = Math.min(count * 15, 100);
      return {
        name,
        occupancy: count > 0 ? occupancy || 10 : 0,
      };
    });
  }, [rawBookings, dbVenues]);

  const sportSplit = useMemo(() => {
    if (rawBookings.length === 0) return [];
    const counts: Record<string, number> = {};
    rawBookings.forEach((b) => {
      const sport = b.turf?.sport || b.venue?.sport || "Other";
      counts[sport] = (counts[sport] || 0) + 1;
    });

    const colors = ["#14532D", "#16A34A", "#4ADE80", "#86EFAC", "#A7F3D0"];
    return Object.entries(counts).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    }));
  }, [rawBookings]);

  const paymentModes = useMemo(() => {
    if (rawBookings.length === 0) return [];
    const counts: Record<string, number> = {};
    rawBookings.forEach((b) => {
      const mode = b.paymentMethod || "UPI";
      counts[mode] = (counts[mode] || 0) + 1;
    });
    const colors = ["#059669", "#D97706", "#2563EB", "#7C3AED"];
    return Object.entries(counts).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    }));
  }, [rawBookings]);

  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const list: any[] = [];
    let idCounter = 1;

    // Check for pending cash payments
    rawBookings.forEach((b) => {
      if (b.cashPaymentRequested && b.paymentStatus?.toLowerCase() === "pending") {
        list.push({
          id: idCounter++,
          venue: b.venue?.name || "Venue",
          message: `Cash payment approval requested for BK-${b.id?.slice(-4).toUpperCase() || b.id} (Customer: ${b.customerName || b.user?.name || "Guest"})`,
          time: "Action Required",
          type: "conflict",
        });
      }
    });

    // Check for pending KYC owners
    dbOwners.forEach((owner) => {
      if (owner.kyc?.toLowerCase() === "pending" || !owner.kyc) {
        list.push({
          id: idCounter++,
          venue: owner.name,
          message: `Owner KYC verification pending for ${owner.name}`,
          time: "KYC Pending",
          type: "kyc",
        });
      }
    });

    setAlerts(list);
  }, [rawBookings, dbOwners]);

  // Handlers
  const handleToggleOwnerStatus = (id: string) => {
    setOwners(
      owners.map((owner) =>
        owner.id === id
          ? {
              ...owner,
              status: owner.status === "Active" ? "Suspended" : "Active",
            }
          : owner
      )
    );
    toast.success("Owner status updated successfully");
  };

  const handleVerifyKyc = (id: string) => {
    setOwners(
      owners.map((owner) =>
        owner.id === id ? { ...owner, kyc: "Verified" } : owner
      )
    );
    toast.success("Owner KYC status updated to Verified");
  };

  const handleToggleCustomerStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Blocked" ? "Active" : "Blocked";
    setCustomers(
      customers.map((c) =>
        c.id === id ? { ...c, status: nextStatus } : c
      )
    );
    toast.success(`Customer status set to ${nextStatus}`);
  };

  const handleProcessSettlement = (id: string) => {
    setSettlements(
      settlements.map((s) =>
        s.id === id ? { ...s, status: "Processed" } : s
      )
    );
    toast.success("Payout processed successfully");
  };

  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwner.name || !newOwner.email || !newOwner.password) {
      toast.error("Please fill in name, email, and password");
      return;
    }
    try {
      await api.post("/auth/signup", {
        name: newOwner.name,
        email: newOwner.email,
        password: newOwner.password,
        role: "VENUE_OWNER",
      });
      toast.success("New Venue Owner registered successfully in database");
      setAddOwnerModal(false);
      setNewOwner({
        name: "",
        email: "",
        phone: "",
        password: "",
        venueCount: 0,
        kyc: "Pending",
        status: "Active",
      });
      fetchStats(); // Reload live lists
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to register owner");
    }
  };

  const handleDismissAlert = (id: number) => {
    setAlerts(alerts.filter((alert) => alert.id !== id));
    toast.success("Conflict alert resolved");
  };

  // Render Functions
  if (view === "dashboard") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Platform Operator Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Real-time analytics and global overview across all active venues.
          </p>
        </div>

        {/* Support Conflicts alerts bar */}
        {alerts.length > 0 && (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/80 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-red-800 font-bold text-sm uppercase tracking-wider">
              <ShieldAlert size={18} />
              <span>Support & Slot Conflict Overrides Required ({alerts.length})</span>
            </div>
            <div className="grid gap-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/90 border border-red-100 rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-red-100 text-red-600 shrink-0 mt-0.5">
                      <AlertTriangle size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {alert.venue} • <span className="font-normal text-slate-600">{alert.message}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{alert.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      size="sm"
                      onClick={() => handleDismissAlert(alert.id)}
                      className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs px-3 py-1.5 h-auto font-medium"
                    >
                      Resolve Overlap
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global KPIs */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Total Platform Revenue"
            value={`₹${totalPlatformRevenue.toLocaleString('en-IN')}`}
            change="+18.4% this month"
            positive
            icon={IndianRupee}
          />
          <KpiCard
            title="Total Bookings Today"
            value={`${totalBookingsCount} Slots`}
            change="+14.2% vs yesterday"
            positive
            icon={CalendarDays}
          />
          <KpiCard
            title="Active Venues Listed"
            value={`${activeVenuesCount} Arenas`}
            change="+4 new this week"
            positive
            icon={Building}
          />
          <KpiCard
            title="Registered Customers"
            value={`${registeredCustomersCount.toLocaleString('en-IN')} Users`}
            change="+82 joined today"
            positive
            icon={Users}
          />
        </div>

        {/* Payment breakdown and Monthly/Yearly Revenue KPIs */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 mt-4">
          <KpiCard
            title="This Month's Revenue"
            value={`₹${dynamicStats.monthRevenue.toLocaleString()}`}
            change="Across platform"
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
            change="Platform aggregate"
            positive
            icon={IndianRupee}
          />
          <KpiCard
            title="Card / Transfer / Other"
            value={`₹${(dynamicStats.breakdown.card || 0).toLocaleString()} / ₹${(dynamicStats.breakdown["bank transfer"] || 0).toLocaleString()}`}
            change={`Other: ₹${(dynamicStats.breakdown.other || 0).toLocaleString()}`}
            positive
            icon={Building}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionCard title={`Monthly Revenue Trend (${new Date().getFullYear()})`}>
              <div className="h-[320px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dynamicStats.trend}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14532D" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#14532D" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #E2E8F0",
                        borderRadius: "16px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      }}
                      formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="#14532D"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRev)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>

          <div className="lg:col-span-1 flex flex-col gap-6">
            <SectionCard title="Top Sports Booked">
              <div className="h-[180px] w-full flex items-center justify-center relative mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sportSplit}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {sportSplit.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-bold text-slate-800">55%</span>
                  <span className="text-xs text-slate-400 font-medium">Football</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-medium text-slate-600">
                {sportSplit.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>
                      {item.name} ({item.value}%)
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Payment Mode Split">
              <div className="space-y-3 mt-3">
                {paymentModes.map((mode) => (
                  <div key={mode.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{mode.name}</span>
                      <span>{mode.value}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${mode.value}%`,
                          backgroundColor: mode.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>

        {/* Venue Occupancies */}
        <SectionCard title="Occupancy Schedules by Venue">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
            {occupancyByVenue.map((venue) => (
              <div
                key={venue.name}
                className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-200"
              >
                <h3 className="font-bold text-slate-800">{venue.name}</h3>
                <div className="flex items-baseline gap-1 mt-3">
                  <span className="text-3xl font-extrabold text-emerald-800">{venue.occupancy}%</span>
                  <span className="text-xs text-slate-400 font-semibold">avg occupancy</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-emerald-700 rounded-full"
                    style={{ width: `${venue.occupancy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    );
  }

  // --- OWNERS LIST VIEW ---
  if (view === "owners") {
    const filteredOwners = owners.filter(
      (o) =>
        o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Turf / Venue Owners
            </h1>
            <p className="text-slate-500 mt-1">
              Verify platform accounts, linked branches, and check KYC documents.
            </p>
          </div>
          <Button
            onClick={() => setAddOwnerModal(true)}
            className="rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold flex items-center gap-2 shadow-sm self-start sm:self-center"
          >
            <Plus size={16} />
            <span>Add Owner</span>
          </Button>
        </div>

        {/* Filter / Search Bar */}
        <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl p-3 shadow-sm">
          <Search size={18} className="text-slate-400 shrink-0 ml-1" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search owners by name, email or phone..."
            className="border-0 shadow-none bg-transparent focus-visible:ring-0 p-0 text-sm"
          />
        </div>

        {/* Owners Table */}
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 font-bold text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Owner Info</th>
                  <th className="py-4 px-6">Venues Linked</th>
                  <th className="py-4 px-6">Joined Date</th>
                  <th className="py-4 px-6">KYC Status</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredOwners.map((owner) => (
                  <tr
                    key={owner.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800">{owner.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{owner.email}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{owner.phone}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
                        {owner.venueCount} branch{owner.venueCount !== 1 ? "es" : ""}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500">{owner.joined}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold ${
                          owner.kyc === "Verified"
                            ? "text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full"
                            : "text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full"
                        }`}
                      >
                        {owner.kyc}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center text-xs font-bold ${
                          owner.status === "Active"
                            ? "text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full"
                            : "text-red-700 bg-red-50 px-2.5 py-1 rounded-full"
                        }`}
                      >
                        {owner.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {owner.kyc !== "Verified" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerifyKyc(owner.id)}
                            className="rounded-xl border-emerald-600 text-emerald-800 hover:bg-emerald-50 text-xs px-2.5 py-1 h-auto"
                          >
                            Verify KYC
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleOwnerStatus(owner.id)}
                          className={`rounded-xl text-xs px-2.5 py-1 h-auto font-bold ${
                            owner.status === "Active"
                              ? "text-red-600 hover:bg-red-50"
                              : "text-emerald-700 hover:bg-emerald-50"
                          }`}
                        >
                          {owner.status === "Active" ? "Suspend" : "Activate"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add Owner */}
        {addOwnerModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Add New Owner</h3>
                <button
                  onClick={() => setAddOwnerModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateOwner} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Owner Full Name</Label>
                  <Input
                    required
                    value={newOwner.name}
                    onChange={(e) =>
                      setNewOwner({ ...newOwner, name: e.target.value })
                    }
                    placeholder="e.g. Vikram Malhotra"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    required
                    value={newOwner.email}
                    onChange={(e) =>
                      setNewOwner({ ...newOwner, email: e.target.value })
                    }
                    placeholder="vikram@playarena.com"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Mobile Number</Label>
                  <Input
                    required
                    value={newOwner.phone}
                    onChange={(e) =>
                      setNewOwner({ ...newOwner, phone: e.target.value })
                    }
                    placeholder="+91 98765 43210"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Account Password</Label>
                  <Input
                    type="password"
                    required
                    value={newOwner.password}
                    onChange={(e) =>
                      setNewOwner({ ...newOwner, password: e.target.value })
                    }
                    placeholder="••••••••"
                    className="rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddOwnerModal(false)}
                    className="flex-1 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl"
                  >
                    Save Owner
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
    const filteredCustomers = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Registered Customers Database
          </h1>
          <p className="text-slate-500 mt-1">
            Global directory of all active players, overall booking frequencies, total spends, and security flags.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 bg-white border border-slate-100 rounded-2xl p-3 shadow-sm">
          <div className="flex-1 flex items-center gap-2">
            <Search size={18} className="text-slate-400 shrink-0 ml-1" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user profile..."
              className="border-0 shadow-none bg-transparent focus-visible:ring-0 p-0 text-sm"
            />
          </div>
          <Button
            onClick={() => toast.success("Customers list successfully exported (CSV format)")}
            variant="outline"
            className="rounded-xl flex items-center gap-1.5 text-xs h-auto py-2 font-bold text-slate-700"
          >
            <ArrowUpRight size={14} />
            <span>Export Database</span>
          </Button>
        </div>

        {/* Database List */}
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 font-bold text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Customer Details</th>
                  <th className="py-4 px-6">Completed Bookings</th>
                  <th className="py-4 px-6">Total Spend (₹)</th>
                  <th className="py-4 px-6">Preferred Sport</th>
                  <th className="py-4 px-6">Account Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800">{cust.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{cust.email}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{cust.phone}</p>
                    </td>
                    <td className="py-4 px-6 font-semibold">{cust.bookings} sessions</td>
                    <td className="py-4 px-6 font-bold text-emerald-800">
                      ₹{cust.totalSpent.toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-xs font-bold">
                        {cust.preference}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${
                          cust.status === "Active"
                            ? "text-emerald-700 bg-emerald-50"
                            : cust.status === "Flagged"
                            ? "text-amber-700 bg-amber-50"
                            : "text-red-700 bg-red-50"
                        }`}
                      >
                        {cust.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {cust.status === "Active" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setCustomers(
                                customers.map((c) =>
                                  c.id === cust.id ? { ...c, status: "Flagged" } : c
                                )
                              );
                              toast.warning("Customer flagged for suspicious cancel patterns");
                            }}
                            className="rounded-xl text-xs text-amber-700 font-bold hover:bg-amber-50 px-2 py-1 h-auto"
                          >
                            Flag User
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleCustomerStatus(cust.id, cust.status)}
                          className={`rounded-xl text-xs font-bold px-2 py-1 h-auto ${
                            cust.status === "Blocked"
                              ? "text-emerald-700 hover:bg-emerald-50"
                              : "text-red-600 hover:bg-red-50"
                          }`}
                        >
                          {cust.status === "Blocked" ? "Unblock" : "Block User"}
                        </Button>
                      </div>
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

  // --- PAYMENTS & SETTLEMENTS ---
  if (view === "payments") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Payment & Owner Settlements
          </h1>
          <p className="text-slate-500 mt-1">
            Global ledger of online payments, split bookings, platform commission overrides, and payout clearances.
          </p>
        </div>

        {/* Global Finance Stats */}
        <div className="grid gap-5 md:grid-cols-3">
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Escrow Held
            </p>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-2">₹2,50,000</h3>
            <p className="text-xs text-slate-400 mt-2">Online collections awaiting weekly clearance</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Platform Commissions (Net)
            </p>
            <h3 className="text-3xl font-extrabold text-emerald-800 mt-2">₹25,000</h3>
            <p className="text-xs text-slate-400 mt-2">
              Based on flat <span className="font-bold">{commissionRate}%</span> commission rule
            </p>
          </div>
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pending Payout Approvals
            </p>
            <h3 className="text-3xl font-extrabold text-amber-600 mt-2">₹1,48,500</h3>
            <p className="text-xs text-slate-400 mt-2">Requires Super Admin approval before release</p>
          </div>
        </div>

        {/* Settlement approvals table */}
        <SectionCard title="Weekly Owner Settlement Ledger">
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden mt-4 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 font-bold text-xs uppercase tracking-wider">
                    <th className="py-4 px-6">Venue & Owner</th>
                    <th className="py-4 px-6">Gross Booking Value</th>
                    <th className="py-4 px-6">Platform Share ({commissionRate}%)</th>
                    <th className="py-4 px-6">Net Owner Payout</th>
                    <th className="py-4 px-6">Clearance Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {settlements.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-800">{s.venue}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{s.owner}</p>
                      </td>
                      <td className="py-4 px-6">₹{s.grossRevenue.toLocaleString()}</td>
                      <td className="py-4 px-6 font-semibold text-slate-600">
                        ₹{s.commission.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 font-bold text-emerald-800">
                        ₹{s.payout.toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${
                            s.status === "Processed"
                              ? "text-emerald-700 bg-emerald-50"
                              : s.status === "Pending Payout"
                              ? "text-amber-700 bg-amber-50"
                              : "text-purple-700 bg-purple-50"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {s.status !== "Processed" ? (
                          <Button
                            size="sm"
                            onClick={() => handleProcessSettlement(s.id)}
                            className="rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs px-2.5 py-1.5 h-auto shadow-sm"
                          >
                            Disburse Funds
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
        </SectionCard>
      </div>
    );
  }

  // --- SETTINGS VIEW ---
  if (view === "settings") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Platform Configuration & Settings
          </h1>
          <p className="text-slate-500 mt-1">
            Configure system-wide commissions, advance deposit structures, refund parameters, and alert configurations.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Commission and Payments Rules */}
          <SectionCard title="Commission & Booking Rules">
            <div className="space-y-5 mt-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold">Default Platform Commission (%)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="rounded-xl w-32 font-bold"
                  />
                  <span className="text-slate-400 font-semibold">% of Gross Booking Value</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-bold">Minimum Advance Deposit Policy</Label>
                <select
                  value={refundPolicy}
                  onChange={(e) => setRefundPolicy(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm font-medium bg-transparent"
                >
                  <option value="strict">Strict (100% advance payments only)</option>
                  <option value="flexible">Flexible (Part payments / Min 25% allowed)</option>
                  <option value="free">No advance required (100% pay on arrival)</option>
                </select>
              </div>

              <Button
                onClick={() => toast.success("Commission and Advance policies saved")}
                className="rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold w-full mt-2"
              >
                Save Payment Policies
              </Button>
            </div>
          </SectionCard>

          {/* Integrations and templates */}
          <SectionCard title="Integrations & Gateways">
            <div className="space-y-5 mt-4 font-medium text-slate-700">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">WhatsApp Shortcode Messaging</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Send real-time alerts automatically</p>
                </div>
                <input
                  type="checkbox"
                  checked={whatsappEnabled}
                  onChange={(e) => {
                    setWhatsappEnabled(e.target.checked);
                    toast.info(`WhatsApp notifications ${e.target.checked ? "Enabled" : "Disabled"}`);
                  }}
                  className="w-9 h-5 rounded-full bg-slate-200 checked:bg-emerald-600 appearance-none transition-colors relative cursor-pointer outline-none before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-4 shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700">SMS Gateway API Provider</Label>
                <Input value="https://api.twilio.com/2010-04-01/Accounts..." disabled className="rounded-xl bg-slate-50 text-slate-400" />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-slate-700">Platform Refund Lead-Time (hours)</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" defaultValue={24} className="rounded-xl w-32" />
                  <span className="text-xs text-slate-400 font-semibold">Hours before slot start</span>
                </div>
              </div>

              <Button
                onClick={() => toast.success("Gateway and lead time updates successfully loaded")}
                className="rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold w-full mt-2"
              >
                Sync Gateways
              </Button>
            </div>
          </SectionCard>
        </div>
      </div>
    );
  }

  return null;
}
