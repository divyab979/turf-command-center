import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/page-header";
import { SectionCard } from "@/components/dashboard/section-card";
import { PageLoader } from "@/components/feedback/page-loader";
import { ErrorState } from "@/components/feedback/error-state";
import { useSlots } from "@/features/slots/hooks/use-slots";
import { useVenues } from "@/features/venue/hooks/use-venues";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import {
  Clock,
  ShieldAlert,
  Award,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  ArrowLeft,
  Building2,
  Sparkles,
  Users,
} from "lucide-react";

import { formatLocalDate } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/calendar")({
  component: CalendarPage,
});

function CalendarPage() {
  const { user } = useAuthStore();
  const role = user?.role || "SUPERVISOR";

  const [selectedDate, setSelectedDate] = useState(
    formatLocalDate()
  );

  const [activeVenueId, setActiveVenueId] = useState<string>(
    localStorage.getItem("selectedVenueId") || ""
  );

  const { data: venues = [] } = useVenues();

  useEffect(() => {
    if (venues.length) {
      const exists = venues.some((v: any) => v.id === activeVenueId);
      if (!exists) {
        setActiveVenueId(venues[0].id);
        localStorage.setItem("selectedVenueId", venues[0].id);
      }
    }
  }, [venues, activeVenueId]);

  const { data, isLoading, isError } = useSlots(selectedDate, activeVenueId);
  const [localTurfs, setLocalTurfs] = useState<any[]>([]);

  // Selected Slot for Editing
  const [activeSlot, setActiveSlot] = useState<any>(null);
  const [activeTurfId, setActiveTurfId] = useState<string>("");
  const [slotPrice, setSlotPrice] = useState<number>(1500);
  const [slotPeak, setSlotPeak] = useState<boolean>(false);

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

  const hierarchicalTurfs = useMemo(() => {
    if (role !== "SUPER_ADMIN" || viewMode === "flat" || !selectedVenue) {
      return localTurfs;
    }
    // Filter turfs by venue name
    const sub = localTurfs.filter((t) => {
      if (selectedVenue.name === "Arena Turf") return t.name.includes("Football") || t.name.includes("Pitch");
      if (selectedVenue.name === "Goal Sports") return t.name.includes("Cricket") || t.name.includes("Ground");
      if (selectedVenue.name === "Wembley Turf") return t.name.includes("Badminton") || t.name.includes("Court");
      return true;
    });

    if (selectedTurf) {
      return sub.filter((t) => t.name === selectedTurf.name || t.id === selectedTurf.id);
    }
    return sub;
  }, [localTurfs, selectedVenue, selectedTurf, viewMode, role]);

  useEffect(() => {
    if (data) {
      setLocalTurfs(
        data.map((turf: any) => ({
          ...turf,
          slots: (turf.slots || []).map((slot: any) => ({
            ...slot,
            price: slot.price || 1500,
            isPeak: slot.isPeak || false,
          })),
        }))
      );
    }
  }, [data]);

  // Handlers
  const handleSlotClick = (turfId: string, slot: any) => {
    if (slot.status === "BOOKED") {
      toast.info(`Slot is booked by a customer`);
      return;
    }

    if (role === "SUPERVISOR") {
      // Direct Block/Unblock toggle
      const nextStatus = slot.status === "AVAILABLE" ? "BLOCKED" : "AVAILABLE";
      setLocalTurfs((prev) =>
        prev.map((t) => {
          if (t.id !== turfId) return t;
          return {
            ...t,
            slots: t.slots.map((s: any) =>
              s.id === slot.id ? { ...s, status: nextStatus } : s
            ),
          };
        })
      );
      toast.success(
        nextStatus === "BLOCKED"
          ? "Slot successfully blocked for ground maintenance"
          : "Slot successfully opened back to booking"
      );
    } else if (role === "OWNER" || role === "SUPER_ADMIN") {
      // Open Pricing and Configuration Drawer
      setActiveTurfId(turfId);
      setActiveSlot(slot);
      setSlotPrice(slot.price || 1500);
      setSlotPeak(slot.isPeak || false);
    }
  };

  const handleSaveSlotConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSlot) return;

    setLocalTurfs((prev) =>
      prev.map((t) => {
        if (t.id !== activeTurfId) return t;
        return {
          ...t,
          slots: t.slots.map((s: any) =>
            s.id === activeSlot.id
              ? {
                  ...s,
                  price: slotPrice,
                  isPeak: slotPeak,
                  // Toggles green status if owner changes it
                }
              : s
          ),
        };
      })
    );

    setActiveSlot(null);
    toast.success("Slot pricing rules updated successfully");
  };

  const handleToggleBlockFromOwner = () => {
    if (!activeSlot) return;
    const nextStatus = activeSlot.status === "AVAILABLE" ? "BLOCKED" : "AVAILABLE";

    setLocalTurfs((prev) =>
      prev.map((t) => {
        if (t.id !== activeTurfId) return t;
        return {
          ...t,
          slots: t.slots.map((s: any) =>
            s.id === activeSlot.id ? { ...s, status: nextStatus } : s
          ),
        };
      })
    );

    setActiveSlot(null);
    toast.success(
      nextStatus === "BLOCKED"
        ? "Slot successfully blocked"
        : "Slot opened back to booking"
    );
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError || !data) {
    return <ErrorState message="Failed to load slots" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar & Slots Control"
        description={
          role === "SUPERVISOR"
            ? "Quick block slots for maintenance or walk-in preps."
            : "Review slot schedules, manage custom pricing, and configure peak hours."
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
                      <span>View Slot schedules</span>
                      <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedOwner && selectedVenue && selectedTurf && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                    Schedules for {selectedTurf.name} ({selectedVenue.name})
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-[180px] rounded-xl shadow-none"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedOwner(null);
                      setSelectedVenue(null);
                      setSelectedTurf(null);
                    }}
                    className="rounded-xl border-slate-200 text-xs font-bold"
                  >
                    Reset
                  </Button>
                </div>
              </div>

              <SectionCard title="Schedules & Availability Grid">
                <div className="space-y-6 mt-4">
                  {hierarchicalTurfs.map((turf: any) => (
                    <div
                      key={turf.id}
                      className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 text-lg">{turf.name}</h3>
                        <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">
                          {turf.slots.length} slots active
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 font-semibold">
                        {turf.slots.map((slot: any) => {
                          const isAvailable = slot.status === "AVAILABLE";
                          const isBooked = slot.status === "BOOKED";

                          return (
                            <button
                              key={slot.id}
                              onClick={() => handleSlotClick(turf.id, slot)}
                              className={`
                                rounded-2xl p-4 text-left transition-all relative overflow-hidden flex flex-col justify-between h-24
                                ${
                                  isAvailable
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-100 hover:bg-emerald-100/50"
                                    : isBooked
                                    ? "bg-rose-50 text-rose-800 border border-rose-100 cursor-not-allowed opacity-80"
                                    : "bg-amber-50 text-amber-800 border border-amber-100 hover:bg-amber-100/50"
                                }
                              `}
                            >
                              <div className="flex items-start justify-between w-full">
                                <span className="text-xs uppercase font-extrabold tracking-wider opacity-60">
                                  {slot.startTime} - {slot.endTime}
                                </span>
                                {slot.isPeak && (
                                  <Award size={14} className="text-emerald-700 opacity-80 shrink-0" />
                                )}
                              </div>

                              <div className="mt-3">
                                <p className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                                  {slot.status}
                                </p>
                                <p className="text-sm font-extrabold mt-0.5">
                                  ₹{slot.price}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {role === "SUPERVISOR" ? (
              <div className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-semibold text-slate-500">
                💡 Tap any AVAILABLE slot to block it instantly, or tap a BLOCKED slot to reopen it.
              </div>
            ) : (
              <div className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-semibold text-slate-500">
                💡 Click any slot to launch the pricing panel and toggles.
              </div>
            )}

            <div className="flex items-center gap-2">
              {venues.length > 0 && (
                <select
                  value={activeVenueId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setActiveVenueId(id);
                    localStorage.setItem("selectedVenueId", id);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-800"
                >
                  {venues.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              )}

              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-[160px] rounded-xl shadow-none font-bold text-xs"
              />
            </div>
          </div>

          <SectionCard title="Schedules & Availability Grid">
            <div className="space-y-6 mt-4">
              {hierarchicalTurfs.map((turf: any) => (
                <div
                  key={turf.id}
                  className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-lg">{turf.name}</h3>
                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">
                      {turf.slots.length} slots active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 font-semibold">
                    {turf.slots.map((slot: any) => {
                      const isAvailable = slot.status === "AVAILABLE";
                      const isBooked = slot.status === "BOOKED";

                      return (
                        <button
                          key={slot.id}
                          onClick={() => handleSlotClick(turf.id, slot)}
                          className={`
                            rounded-2xl p-4 text-left transition-all relative overflow-hidden flex flex-col justify-between h-24
                            ${
                              isAvailable
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-100 hover:bg-emerald-100/50"
                                : isBooked
                                ? "bg-rose-50 text-rose-800 border border-rose-100 cursor-not-allowed opacity-80"
                                : "bg-amber-50 text-amber-800 border border-amber-100 hover:bg-amber-100/50"
                            }
                          `}
                        >
                          <div className="flex items-start justify-between w-full">
                            <span className="text-xs uppercase font-extrabold tracking-wider opacity-60">
                              {slot.startTime} - {slot.endTime}
                            </span>
                            {slot.isPeak && (
                              <Award size={14} className="text-emerald-700 opacity-80 shrink-0" />
                            )}
                          </div>

                          <div className="mt-3">
                            <p className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                              {slot.status}
                            </p>
                            <p className="text-sm font-extrabold mt-0.5">
                              ₹{slot.price}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </>
      )}

      {/* Pricing Override Modal (Owners & Admins) */}
      {activeSlot && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Slot Configuration</h3>
              <button
                onClick={() => setActiveSlot(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveSlotConfig} className="space-y-4 font-medium text-slate-700 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2.5">
                <Clock size={16} className="text-slate-400" />
                <div>
                  <p className="font-bold text-slate-800">Slot: {activeSlot.startTime}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Current Status: {activeSlot.status}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-500 font-bold">Slot Rate / Price (₹)</Label>
                <Input
                  type="number"
                  required
                  value={slotPrice}
                  onChange={(e) => setSlotPrice(Number(e.target.value))}
                  placeholder="e.g. 1500"
                  className="rounded-xl font-bold text-sm"
                />
              </div>

              <div className="flex items-center justify-between border border-slate-100 p-3.5 rounded-2xl bg-white shadow-sm">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">Set Peak pricing profile</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Flags this slot with dynamic peak markings</p>
                </div>
                <input
                  type="checkbox"
                  checked={slotPeak}
                  onChange={(e) => {
                    setSlotPeak(e.target.checked);
                    if (e.target.checked && slotPrice === 1500) {
                      setSlotPrice(2000); // Quick dynamic helper
                    }
                  }}
                  className="w-8 h-4 bg-slate-200 checked:bg-emerald-600 appearance-none rounded-full cursor-pointer relative before:content-[''] before:absolute before:w-3.5 before:h-3.5 before:bg-white before:rounded-full checked:before:translate-x-3.5 before:transition-transform"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  onClick={handleToggleBlockFromOwner}
                  variant="outline"
                  className="flex-1 rounded-xl border-amber-200 text-amber-700 hover:bg-amber-50"
                >
                  {activeSlot.status === "AVAILABLE" ? "Block Slot" : "Unblock Slot"}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl"
                >
                  Save Rules
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}