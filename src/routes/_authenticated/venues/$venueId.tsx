import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DetailDrawer } from "@/components/dashboard/detail-drawer";
import { PageHeader } from "@/components/dashboard/page-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { GenerateSlotsForm } from "@/features/slots/components/generate-slots-form";
import { useMutation } from '@tanstack/react-query'
import { bookingApi } from '@/api/booking.api'
import { useBookingStore } from '@/store/booking.store'
import { BookingCountdown } from '@/features/bookings/components/BookingCountdown'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { useAuthStore } from "@/store/auth-store";
import {
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Sparkles,
  Plus,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { CreateVenueForm } from "@/features/venue/components/create-venue-form";
import { formatLocalDate } from "@/lib/utils";

interface Turf {
  id: string;
  name: string;
  sport: string;
  description?: string;
  images: {
    id: string;
    url: string;
  }[];
  slots: {
    id: string;
    status: string;
    price: number;
    startTime: string;
    endTime: string;
  }[];
}

export const Route = createFileRoute(
  "/_authenticated/venues/$venueId"
)({
  component: VenueDetailPage,
});

function VenueDetailPage() {
  const { user } = useAuthStore();
  const role = user?.role || "SUPERVISOR";

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

  const {
    venueId,
  } = Route.useParams();

  const [open, setOpen] = useState(false);

  const [
    slotDrawerOpen,
    setSlotDrawerOpen,
  ] = useState(false);

  // Slot mode: 'generate' (bulk) or 'manual' (single slot)
  const [slotMode, setSlotMode] = useState<"generate" | "manual">("generate");
  const [manualSlotDate, setManualSlotDate] = useState("");
  const [manualSlotStart, setManualSlotStart] = useState("");
  const [manualSlotEnd, setManualSlotEnd] = useState("");
  const [manualSlotPrice, setManualSlotPrice] = useState("");
  const [manualSlotDuration, setManualSlotDuration] = useState(1);

const [
  selectedTurfId,
  setSelectedTurfId,
] = useState("");

const [
  expandedTurfId,
  setExpandedTurfId,
] = useState<string | null>(
  null
);

const {
  selectedSlot,
  lockExpiresAt,
  drawerOpen,

  setSelectedSlot,
  setLockExpiresAt,
  setDrawerOpen,

  clearBooking,
} = useBookingStore()

const [
  selectedDate,
  setSelectedDate,
] = useState(
  formatLocalDate()
);

const lockMutation = useMutation({
  mutationFn: (slotId: string) =>
    bookingApi.lockSlot(slotId),

 onSuccess: async (
  data,
  slotId
) => {

    let foundSlot = null;

    for (const turf of turfs) {

      const slot =
        turf.slots.find(
          (s) => s.id === slotId
        );

      if (slot) {
        foundSlot = {
          ...slot,
          turf,
        };

        break;
      }
    }

    if (!foundSlot) return;

    setSelectedSlot(foundSlot);

    setLockExpiresAt(
      data.expiresAt
    );

    setDrawerOpen(true);
    await loadTurfs();

    toast.success(
      "Slot locked successfully"
    );
  },

  onError: (error: any) => {
    toast.error(
      error?.response?.data?.message ||
      "Failed to lock slot"
    );
  },
});

const confirmBookingMutation =
  useMutation({
    mutationFn: (slotId: string) =>
      bookingApi.confirmBooking(
        slotId
      ),

  onSuccess: async () => {

  toast.success(
    "Booking confirmed"
  );

  clearBooking();

  await loadTurfs();
},

    onError: (error: any) => {

      toast.error(
        error?.response?.data?.message ||
        "Booking failed"
      );
    },
  });

  const [turfs, setTurfs] =
    useState<Turf[]>([]);

  const [name, setName] =
    useState("");

  const [sport, setSport] =
    useState("");

const queryClient =
  useQueryClient();

  const handleFakePayment =
  async () => {

    if (!selectedSlot) return;

    try {

      await new Promise(
        (resolve) =>
          setTimeout(resolve, 2000)
      );

      confirmBookingMutation.mutate(
        selectedSlot.id
      );

    } catch {
      toast.error(
        "Payment failed"
      );
    }
  };

  const [
    description,
    setDescription,
  ] = useState("");

  const [image, setImage] =
  useState<File | null>(null);

  const [venueDetails, setVenueDetails] = useState<any>(null);
  const [activeVenueImgIdx, setActiveVenueImgIdx] = useState(0);
  const [activeTurfImgIdx, setActiveTurfImgIdx] = useState<{ [turfId: string]: number }>({});
  const [editVenueOpen, setEditVenueOpen] = useState(false);
  const [turfPhotos, setTurfPhotos] = useState<{ url: string; file?: File }[]>([]);
  const [newTurfPhotoUrl, setNewTurfPhotoUrl] = useState("");
  const [customSports, setCustomSports] = useState<string[]>([]);

  useEffect(() => {
    const storedSports = localStorage.getItem("custom_sports");
    if (storedSports) {
      setCustomSports(JSON.parse(storedSports));
    } else {
      setCustomSports(["FOOTBALL", "CRICKET", "BADMINTON", "TENNIS", "PICKLEBALL","POOL","SNOOKER"]);
    }
  }, []);

  useEffect(() => {
    if (venueId) {
      api.get(`/venues/${venueId}`)
        .then((res) => {
          const venue = res.data;
          if (venue) {
            const dbPhotos = venue.images && venue.images.length > 0 ? venue.images.map((im: any) => im.url) : null;
            setVenueDetails({
              ...venue,
              address: venue.address || `${venue.name} Street, ${venue.location}`,
              photos: dbPhotos || venue.photos || ["https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800"],
              amenities: venue.amenities || ["parking", "washroom", "floodlights"],
            });
          }
        })
        .catch((err) => {
          console.error("Failed to load venue details", err);
        });
    }
  }, [venueId, editVenueOpen]);

  async function loadTurfs() {
    try {
      const response = await api.get(
        `/turfs/${venueId}?date=${selectedDate}`
      );
      const mapped = response.data.map((t: any) => ({
        ...t,
        images: t.images && t.images.length ? t.images : [
          { id: "img-default", url: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800" }
        ],
      }));
      setTurfs(mapped);
    } catch (e) {
      console.error("Failed to load turfs", e);
    }
  }

  async function createTurf() {
    if (!name || !sport) {
      toast.error("Please fill in turf name and choose a sport");
      return;
    }

    try {
      const res = await api.post(`/turfs/${venueId}`, {
        name,
        sport,
        description,
      });
      const newTurf = res.data;

      for (const photo of turfPhotos) {
        if (photo.file) {
          const formData = new FormData();
          formData.append("file", photo.file);
          await api.post(`/turfs/${newTurf.id}/image`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
        } else if (photo.url) {
          await api.post(`/turfs/${newTurf.id}/image-url`, { url: photo.url });
        }
      }

      setName("");
      setSport("");
      setDescription("");
      setTurfPhotos([]);
      setOpen(false);
      toast.success("Turf successfully created");
      loadTurfs();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to create turf";
      toast.error(msg);
    }
  }

  useEffect(() => {
    loadTurfs();
  }, [selectedDate, venueId]);

  useEffect(() => {
    if (venueId) {
      localStorage.setItem("selectedVenueId", venueId);
    }
  }, [venueId]);

  return (
    <div className="space-y-8">

      <PageHeader
        title="Venue Details"
        description="Manage turfs, slots and operational availability"
        action={
          <div className="flex gap-2">
            {(role === "OWNER" || role === "SUPER_ADMIN") && (
              <Button
                variant="outline"
                onClick={() => setEditVenueOpen(true)}
                className="rounded-2xl border-slate-200 text-slate-700 hover:bg-slate-50 font-bold"
              >
                Edit Venue
              </Button>
            )}
            <Button
              onClick={() => setOpen(true)}
              className="rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold"
            >
              {venueDetails?.businessType === "GAME_ROOM" ? "Add Table / Court" : "Add Turf"}
            </Button>
          </div>
        }
      />

      {venueDetails && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full">
                {venueDetails.id}
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 mt-2">
                {venueDetails.name}
              </h1>
              <p className="text-slate-500 mt-1 flex items-center gap-1.5 font-semibold text-xs">
                <MapPin size={16} className="text-emerald-700 shrink-0" />
                <span>{venueDetails.address || `${venueDetails.name} Street, ${venueDetails.location}`}</span>
              </p>
            </div>

            {venueDetails.amenities && venueDetails.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {venueDetails.amenities.map((am: string) => (
                  <span
                    key={am}
                    className="bg-emerald-50/50 text-emerald-800 border border-emerald-100/50 px-3 py-1.5 rounded-full text-xs font-bold capitalize shadow-sm"
                  >
                    {am}
                  </span>
                ))}
              </div>
            )}
          </div>

          {venueDetails.photos && venueDetails.photos.length > 0 && (
            <div className="relative group rounded-2xl overflow-hidden border border-slate-100 aspect-[21/9] max-h-80 bg-slate-50 shadow-sm">
              <img
                src={venueDetails.photos[activeVenueImgIdx] || "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800"}
                alt={venueDetails.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
              {venueDetails.photos.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveVenueImgIdx((prev) =>
                        prev === 0 ? venueDetails.photos.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2.5 backdrop-blur-sm transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() =>
                      setActiveVenueImgIdx((prev) =>
                        prev === venueDetails.photos.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2.5 backdrop-blur-sm transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    {venueDetails.photos.map((_: any, idx: number) => (
                      <span
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === activeVenueImgIdx ? "bg-white scale-125" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {venueDetails.businessType === "GAME_ROOM" && (
            <div className="border-t border-slate-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Game Room Info</h3>
                <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">Booking Mode:</span>
                    <span className="text-emerald-800 uppercase font-extrabold">
                      {venueDetails.bookingMode === "CUSTOM_DURATION" ? "Custom Duration / Manual" : "Fixed Slots"}
                    </span>
                  </div>
                  {venueDetails.gamesHosted && venueDetails.gamesHosted.length > 0 && (
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">Games Hosted:</span>
                      <span className="text-slate-800 capitalize font-bold">
                        {venueDetails.gamesHosted.join(", ")}
                      </span>
                    </div>
                  )}
                  {venueDetails.description && (
                    <div className="text-xs font-semibold space-y-1">
                      <span className="text-slate-500 block">Description:</span>
                      <p className="text-slate-700 font-medium leading-relaxed bg-white border border-slate-100 rounded-xl p-2.5">
                        {venueDetails.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Equipment & Inventory</h3>
                <div className="grid grid-cols-2 gap-3">
                  {venueDetails.numPoolTables !== null && venueDetails.numPoolTables !== undefined && (
                    <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100/50">
                      <span className="text-[10px] text-slate-500 font-extrabold uppercase">Pool Tables</span>
                      <p className="text-lg font-extrabold text-emerald-800 mt-1">{venueDetails.numPoolTables}</p>
                    </div>
                  )}
                  {venueDetails.numSnookerTables !== null && venueDetails.numSnookerTables !== undefined && (
                    <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100/50">
                      <span className="text-[10px] text-slate-500 font-extrabold uppercase">Snooker Tables</span>
                      <p className="text-lg font-extrabold text-emerald-800 mt-1">{venueDetails.numSnookerTables}</p>
                    </div>
                  )}
                  {venueDetails.numTvScreens !== null && venueDetails.numTvScreens !== undefined && (
                    <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100/50">
                      <span className="text-[10px] text-slate-500 font-extrabold uppercase">TV/Screens</span>
                      <p className="text-lg font-extrabold text-emerald-800 mt-1">{venueDetails.numTvScreens}</p>
                    </div>
                  )}
                  {venueDetails.numPsConsoles !== null && venueDetails.numPsConsoles !== undefined && (
                    <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100/50">
                      <span className="text-[10px] text-slate-500 font-extrabold uppercase">PS Consoles</span>
                      <p className="text-lg font-extrabold text-emerald-800 mt-1">{venueDetails.numPsConsoles}</p>
                    </div>
                  )}
                  {venueDetails.numControllers !== null && venueDetails.numControllers !== undefined && (
                    <div className="bg-slate-50 rounded-2xl p-3 text-center col-span-2 border border-slate-100/50">
                      <span className="text-[10px] text-slate-500 font-extrabold uppercase">Controllers</span>
                      <p className="text-lg font-extrabold text-emerald-800 mt-1">{venueDetails.numControllers}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="
  flex
  items-center
  justify-between
  rounded-3xl
  border
  border-border
  bg-card
  p-5
">

  <div>

    <h2 className="
      text-lg
      font-semibold
    ">
      Occupancy Schedule
    </h2>

    <p className="
      text-sm
      text-muted-foreground
      mt-1
    ">
      View bookings and slot occupancy by date
    </p>

  </div>

  <Input
    type="date"

    value={selectedDate}

    onChange={(e) =>
      setSelectedDate(
        e.target.value
      )
    }

    className="
      w-[220px]
      rounded-2xl
    "
  />

</div>

      <div className="
        grid
        gap-6
        md:grid-cols-2
        xl:grid-cols-3
      ">

        {turfs.map((turf) => (

          <Card
            key={turf.id}
            className="
              rounded-3xl
              border-border
            "
          >
            <CardContent className="p-6">
                {(() => {
                  const imgUrls = turf.images?.map((im: any) => typeof im === 'string' ? im : im.url).filter(Boolean) || [];
                  const currentImgIdx = activeTurfImgIdx[turf.id] || 0;
                  const currentImgUrl = imgUrls[currentImgIdx] || "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800";

                  return (
                    <div className="h-44 overflow-hidden rounded-2xl bg-slate-100 mb-5 relative group shadow-sm border border-slate-200/50">
                      <img
                        src={currentImgUrl}
                        alt={turf.name}
                        className="h-full w-full object-cover transition-all duration-300"
                      />
                      {imgUrls.length > 1 && (
                        <>
                          <button
                            onClick={() => {
                              setActiveTurfImgIdx((prev) => ({
                                ...prev,
                                [turf.id]: currentImgIdx === 0 ? imgUrls.length - 1 : currentImgIdx - 1
                              }));
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setActiveTurfImgIdx((prev) => ({
                                ...prev,
                                [turf.id]: currentImgIdx === imgUrls.length - 1 ? 0 : currentImgIdx + 1
                              }));
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                          >
                            <ChevronRight size={16} />
                          </button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-black/35 px-2 py-1 rounded-full backdrop-blur-sm">
                            {imgUrls.map((_: any, idx: number) => (
                              <span
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${
                                  idx === currentImgIdx ? "bg-white scale-125" : "bg-white/50"
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })()}

              <div className="
                flex
                items-start
                justify-between
                gap-3
              ">
                <div>
                  <h2 className="
                    text-xl
                    font-bold
                  ">
                    {turf.name}
                  </h2>

                  <p className="
                    text-sm
                    text-muted-foreground
                    mt-1
                  ">
                    {turf.description}
                  </p>
                </div>

                <div className="
                  rounded-full
                  bg-primary/10
                  px-3
                  py-1
                  text-xs
                  font-medium
                  text-primary
                ">
                  {turf.sport}
                </div>
              </div>

            <div className="
  mt-6
  grid
  grid-cols-3
  gap-3
">

  <div className="
    rounded-2xl
    border
    border-border
    p-3
  ">
    <p className="
      text-xs
      text-muted-foreground
    ">
      Total Slots
    </p>

    <p className="
      mt-1
      text-xl
      font-bold
    ">
      {turf.slots.length}
    </p>
  </div>

  <div className="
    rounded-2xl
    border
    border-border
    p-3
  ">
    <p className="
      text-xs
      text-muted-foreground
    ">
      Available
    </p>

    <p className="
      mt-1
      text-xl
      font-bold
      text-green-600
    ">
      {
        turf.slots.filter(
          (slot) =>
            slot.status ===
            "AVAILABLE"
        ).length
      }
    </p>
  </div>

  <div className="
    rounded-2xl
    border
    border-border
    p-3
  ">
    <p className="
      text-xs
      text-muted-foreground
    ">
      Booked
    </p>

    <p className="
      mt-1
      text-xl
      font-bold
      text-red-500
    ">
      {
        turf.slots.filter(
          (slot) =>
            slot.status ===
            "BOOKED"
        ).length
      }
    </p>
  </div>

</div>

<div className="
  mt-5
  flex
  items-center
  justify-between
">

  <Button
    variant="ghost"
    className="
      rounded-2xl
    "
    onClick={() => {

      if (
        expandedTurfId ===
        turf.id
      ) {

        setExpandedTurfId(
          null
        );

      } else {

        setExpandedTurfId(
          turf.id
        );
      }
    }}
  >
    {expandedTurfId === turf.id
      ? "Hide Slots"
      : "View Slots"}
  </Button>

  <Button
    variant="outline"
    className="
      rounded-2xl
    "
    onClick={() => {

      setSelectedTurfId(
        turf.id
      );

      setSlotDrawerOpen(
        true
      );
    }}
  >
    {venueDetails?.businessType === "GAME_ROOM" ? "Generate Table Slots" : "Generate Slots"}
  </Button>

</div>

{expandedTurfId === turf.id && (
  <div className="
    mt-6
    space-y-4
    border-t
    border-border
    pt-6
  ">
    <div className="grid grid-cols-2 gap-3">
      {turf.slots.map((slot) => (
        <button
          key={slot.id}
          disabled={slot.status !== "AVAILABLE"}
          onClick={() => lockMutation.mutate(slot.id)}
          className={`
            relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all
            ${
              slot.status === "AVAILABLE"
                ? "bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/40 cursor-pointer"
                : slot.status === "BOOKED"
                ? "bg-muted border-border opacity-50 cursor-not-allowed"
                : "bg-yellow-500/10 border-yellow-500/20 opacity-70 cursor-not-allowed"
            }
          `}
        >
          <span className={`text-[15px] font-semibold tracking-tight whitespace-nowrap ${
            slot.status === "AVAILABLE" ? "text-primary" : "text-muted-foreground"
          }`}>
            {slot.startTime} - {slot.endTime}
          </span>
          <span className={`text-xs mt-1 font-medium ${
            slot.status === "AVAILABLE" ? "text-foreground/80" : "text-muted-foreground/50"
          }`}>
            ₹{slot.price}
          </span>
          
          {slot.status !== "AVAILABLE" && (
            <span className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {slot.status}
            </span>
          )}
        </button>
      ))}
    </div>
  </div>
)}
            </CardContent>
          </Card>

        ))}

      </div>

      <DetailDrawer
        open={open}
        onOpenChange={setOpen}
        title={venueDetails?.businessType === "GAME_ROOM" ? "Create Table / Court" : "Create Turf"}
        description={venueDetails?.businessType === "GAME_ROOM" ? "Add a table or court to this Game Room venue" : "Add a playable turf/court to this venue"}
      >
        <div className="space-y-6 font-medium text-slate-700 text-xs">
          <div>
            <Label className="text-slate-500 font-bold">
              {venueDetails?.businessType === "GAME_ROOM" ? "Table / Court Name" : "Turf Name"}
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={venueDetails?.businessType === "GAME_ROOM" ? "e.g. Snooker Table 1" : "e.g. Football Turf A"}
              className="mt-2 rounded-xl"
            />
          </div>

          <div>
            <Label className="text-slate-500 font-bold">
              {venueDetails?.businessType === "GAME_ROOM" ? "Game / Activity" : "Sport"}
            </Label>
            <Select value={sport} onValueChange={setSport}>
              <SelectTrigger className="mt-2 rounded-xl">
                <SelectValue placeholder={venueDetails?.businessType === "GAME_ROOM" ? "Select game" : "Select sport"} />
              </SelectTrigger>
              <SelectContent>
                {venueDetails?.businessType === "GAME_ROOM"
                  ? (venueDetails?.gamesHosted ?? ["pool", "snooker", "playstation", "other"]).map((game: string) => (
                      <SelectItem key={game} value={game.toUpperCase()}>
                        {game.charAt(0).toUpperCase() + game.slice(1)}
                      </SelectItem>
                    ))
                  : customSports.map((sportKey) => (
                      <SelectItem key={sportKey} value={sportKey}>
                        {sportKey.charAt(0) + sportKey.slice(1).toLowerCase()}
                      </SelectItem>
                    ))
                }
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-slate-500 font-bold">Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Premium 7v7 turf, FIFA certified grass"
              className="mt-2 rounded-xl"
            />
          </div>

          <div>
            <Label className="text-slate-500 font-bold">Upload Local Photo</Label>
            <div className="relative mt-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setTurfPhotos((prev) => [...prev, { url, file }]);
                    toast.success("Turf photo uploaded successfully");
                  }
                }}
                className="hidden"
                id="turf-photo-file"
              />
              <label
                htmlFor="turf-photo-file"
                className="flex items-center justify-center gap-2 border border-dashed border-slate-300 rounded-xl p-2.5 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors text-slate-500 font-bold text-xs"
              >
                <Plus size={16} />
                <span>Select File</span>
              </label>
            </div>
          </div>

          <div>
            <Label className="text-slate-500 font-bold">Paste Photo URL</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newTurfPhotoUrl}
                onChange={(e) => setNewTurfPhotoUrl(e.target.value)}
                placeholder="Paste Turf URL..."
                className="rounded-xl flex-1"
              />
              <Button
                type="button"
                onClick={() => {
                  const trimmed = newTurfPhotoUrl.trim();
                  if (trimmed && !turfPhotos.some((p) => p.url === trimmed)) {
                    setTurfPhotos((prev) => [...prev, { url: trimmed }]);
                    setNewTurfPhotoUrl("");
                  }
                }}
                className="rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold shrink-0"
              >
                Add URL
              </Button>
            </div>

            {turfPhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3 max-h-32 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-100">
                {turfPhotos.map((p, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-video bg-white">
                    <img src={p.url} alt="Turf preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setTurfPhotos((prev) => prev.filter((item) => item.url !== p.url))}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={createTurf}
            className="w-full rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold h-11"
          >
            Create Turf
          </Button>
        </div>
      </DetailDrawer>

      <DetailDrawer
        open={editVenueOpen}
        onOpenChange={setEditVenueOpen}
        title="Edit Venue"
        description="Update venue information, address, photos, and amenities."
      >
        <CreateVenueForm
          venueId={venueId}
          onSuccess={() => {
            setEditVenueOpen(false);
            const stored = localStorage.getItem("custom_venues");
            if (stored) {
              const list = JSON.parse(stored);
              const matched = list.find((v: any) => v.id === venueId);
              if (matched) {
                setVenueDetails(matched);
              }
            }
          }}
        />
      </DetailDrawer>

  <DetailDrawer
  open={slotDrawerOpen}
  onOpenChange={(v) => {
    setSlotDrawerOpen(v);
    if (!v) setSlotMode("generate");
  }}
  title={venueDetails?.businessType === "GAME_ROOM" ? "Add Slots for Table" : "Generate Slots"}
  description={venueDetails?.businessType === "GAME_ROOM" ? "Create fixed-time booking slots for this table or court" : "Create operational booking slots for this turf"}
>

  {/* Mode toggle */}
  <div className="flex bg-slate-100 p-1 rounded-2xl w-full font-bold text-xs gap-1 shadow-sm mb-5">
    <button
      onClick={() => setSlotMode("generate")}
      className={`flex-1 py-2 rounded-xl transition-all ${
        slotMode === "generate"
          ? "bg-white text-slate-800 shadow-sm"
          : "text-slate-500 hover:text-slate-700"
      }`}
    >
      Generate (Bulk)
    </button>
    <button
      onClick={() => setSlotMode("manual")}
      className={`flex-1 py-2 rounded-xl transition-all ${
        slotMode === "manual"
          ? "bg-white text-slate-800 shadow-sm"
          : "text-slate-500 hover:text-slate-700"
      }`}
    >
      Manual (Single)
    </button>
  </div>

  {slotMode === "generate" ? (
    <GenerateSlotsForm
      turfId={selectedTurfId}
      onSuccess={() => {
        setSlotDrawerOpen(false);
        loadTurfs();
      }}
    />
  ) : (
    <div className="space-y-4 font-medium text-slate-700 text-xs">
      <div>
        <Label className="text-slate-500 font-bold">Date</Label>
        <Input
          type="date"
          value={manualSlotDate}
          onChange={(e) => setManualSlotDate(e.target.value)}
          className="mt-2 rounded-xl"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-slate-500 font-bold">Start Time</Label>
          <Input
            type="time"
            value={manualSlotStart}
            onChange={(e) => setManualSlotStart(e.target.value)}
            className="mt-2 rounded-xl"
          />
        </div>
        <div>
          <Label className="text-slate-500 font-bold">End Time</Label>
          <Input
            type="time"
            value={manualSlotEnd}
            onChange={(e) => setManualSlotEnd(e.target.value)}
            className="mt-2 rounded-xl"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-slate-500 font-bold">Price (₹)</Label>
          <Input
            type="number"
            value={manualSlotPrice}
            onChange={(e) => setManualSlotPrice(e.target.value)}
            className="mt-2 rounded-xl"
            placeholder="e.g. 300"
          />
        </div>
        <div>
          <Label className="text-slate-500 font-bold">Duration (hours)</Label>
          <Select value={String(manualSlotDuration)} onValueChange={(v) => setManualSlotDuration(Number(v))}>
            <SelectTrigger className="mt-2 rounded-xl">
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.5">30 min</SelectItem>
              <SelectItem value="1">1 hour</SelectItem>
              <SelectItem value="1.5">1.5 hours</SelectItem>
              <SelectItem value="2">2 hours</SelectItem>
              <SelectItem value="3">3 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button
        onClick={async () => {
          if (!manualSlotDate || !manualSlotStart || !manualSlotEnd || !manualSlotPrice) {
            toast.error("Please fill in all fields");
            return;
          }
          try {
            await api.post(`/slots/${selectedTurfId}/manual`, {
              date: manualSlotDate,
              startTime: manualSlotStart,
              endTime: manualSlotEnd,
              price: parseFloat(manualSlotPrice),
              duration: manualSlotDuration,
            });
            toast.success("Slot created successfully");
            setManualSlotDate("");
            setManualSlotStart("");
            setManualSlotEnd("");
            setManualSlotPrice("");
            setManualSlotDuration(1);
            setSlotDrawerOpen(false);
            loadTurfs();
          } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to create slot");
          }
        }}
        className="w-full rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold h-11 mt-2"
      >
        Create Slot
      </Button>
    </div>
  )}

</DetailDrawer>

<Drawer
  open={drawerOpen}
  onOpenChange={setDrawerOpen}
>

  <DrawerContent>

    <div className="
      p-6
      space-y-5
    ">

      <h2 className="
        text-2xl
        font-bold
      ">
        Booking Summary
      </h2>

      {selectedSlot && (

        <>

          <div className="
            rounded-2xl
            border
            p-4
            space-y-2
          ">

            <div className="
              flex
              justify-between
            ">
              <span>Turf</span>

              <span className="
                font-semibold
              ">
                {
                  selectedSlot.turf.name
                }
              </span>
            </div>

            <div className="
              flex
              justify-between
            ">
              <span>Time</span>

              <span className="
                font-semibold
              ">
                {
                  selectedSlot.startTime
                }
                {" - "}
                {
                  selectedSlot.endTime
                }
              </span>
            </div>

            <div className="
              flex
              justify-between
            ">
              <span>Total</span>

              <span className="
                font-semibold
              ">
                ₹{selectedSlot.price}
              </span>
            </div>

            <div className="
              flex
              justify-between
            ">
              <span>
                Advance (25%)
              </span>

              <span className="
                font-semibold
                text-primary
              ">
                ₹
                {
                  Math.floor(
                    selectedSlot.price * 0.25
                  )
                }
              </span>
            </div>

          </div>

          <BookingCountdown />

          <Button
  className="
    w-full
    rounded-2xl
  "

  disabled={
    confirmBookingMutation.isPending
  }

  onClick={handleFakePayment}
>

  {
    confirmBookingMutation.isPending
      ? "Processing..."
      : "Proceed To Pay"
  }

</Button>

        </>

      )}

    </div>

  </DrawerContent>

</Drawer>

    </div>
  );
}