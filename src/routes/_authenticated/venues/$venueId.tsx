import {
  createFileRoute,
} from "@tanstack/react-router";

import {
  useEffect,
  useState,
} from "react";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  DetailDrawer,
} from "@/components/dashboard/detail-drawer";

import {
  PageHeader,
} from "@/components/dashboard/page-header";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  api,
} from "@/lib/api";

import {
  GenerateSlotsForm,
} from "@/features/slots/components/generate-slots-form";

import { useMutation } from '@tanstack/react-query'

import { bookingApi } from '@/api/booking.api'

import { useBookingStore } from '@/store/booking.store'
import { BookingCountdown } from '@/features/bookings/components/BookingCountdown'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

import {
  Drawer,
  DrawerContent,
} from '@/components/ui/drawer'


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

export const Route =
  createFileRoute(
    "/_authenticated/venues/$venueId"
  )({
    component:
      VenueDetailPage,
  });

function VenueDetailPage() {

  const {
    venueId,
  } = Route.useParams();

const [open, setOpen] = useState(false);

  const [
  slotDrawerOpen,
  setSlotDrawerOpen,
] = useState(false);

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
  new Date()
    .toISOString()
    .split("T")[0]
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

  async function loadTurfs() {

   const response =
  await api.get(
    `/turfs/${venueId}?date=${selectedDate}`
  );

    setTurfs(
      response.data
    );
  }

 async function createTurf() {

  const turfResponse =
    await api.post(
      `/turfs/${venueId}`,
      {
        name,
        sport,
        description,
      }
    );

  const turf =
    turfResponse.data;

  if (image) {

    const formData =
      new FormData();

    formData.append(
      "file",
      image
    );

    await api.post(
      `/turfs/${turf.id}/image`,
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );
  }

  setName("");
  setSport("");
  setDescription("");
  setImage(null);

  setOpen(false);

  loadTurfs();
}

 useEffect(() => {
  loadTurfs();
}, [selectedDate]);

useEffect(() => {

  if (venueId) {

    localStorage.setItem(
      "selectedVenueId",
      venueId
    );
  }

}, [venueId]);

  return (
    <div className="space-y-8">

      <PageHeader
        title="Venue Details"
        description={`Manage turfs, slots and operational availability`}
        action={
          <Button
            onClick={() =>
              setOpen(true)
            }
            className="rounded-2xl"
          >
            Add Turf
          </Button>
        }
      />
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
<div className="
  h-44
  overflow-hidden
  rounded-2xl
  bg-muted
  mb-5
">

  {turf.images?.[0]?.url ? (

    <img
      src={turf.images[0].url}
      alt={turf.name}
      className="
        h-full
        w-full
        object-cover
      "
    />

  ) : (

    <div className="
      h-full
      flex
      items-center
      justify-center
      text-muted-foreground
    ">
      No Image
    </div>

  )}

</div>

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
    Generate Slots
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
        title="Create Turf"
        description="Add a playable turf/court to this venue"
      >

        <div className="space-y-6">

          <div>
            <Label>
              Turf Name
            </Label>

            <Input
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              placeholder="Football Turf A"
              className="mt-2"
            />
          </div>

          <div>
            <Label>
              Sport
            </Label>

            <Select
              value={sport}
              onValueChange={setSport}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select sport" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="FOOTBALL">
                  Football
                </SelectItem>

                <SelectItem value="CRICKET">
                  Cricket
                </SelectItem>

                <SelectItem value="BADMINTON">
                  Badminton
                </SelectItem>

                <SelectItem value="TENNIS">
                  Tennis
                </SelectItem>

                <SelectItem value="PICKLEBALL">
                  Pickleball
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>
              Description
            </Label>

            <Input
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="Premium 7v7 turf"
              className="mt-2"
            />
          </div>

          <div>
  <Label>
    Turf Image
  </Label>

  <Input
    type="file"
    accept="image/*"
    className="mt-2"
    onChange={(e) => {

      const file =
        e.target.files?.[0];

      if (file) {
        setImage(file);
      }
    }}
  />
</div>

          <Button
            onClick={createTurf}
            className="
              w-full
              rounded-2xl
            "
          >
            Create Turf
          </Button>

        </div>

      </DetailDrawer>

      <DetailDrawer
  open={slotDrawerOpen}
  onOpenChange={
    setSlotDrawerOpen
  }
  title="Generate Slots"
  description="Create operational booking slots for this turf"
>

  <GenerateSlotsForm
    turfId={selectedTurfId}
    onSuccess={() => {

      setSlotDrawerOpen(
        false
      );

      loadTurfs();
    }}
  />

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