import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/dashboard/page-header";

import { SectionCard } from "@/components/dashboard/section-card";

import { PageLoader } from "@/components/feedback/page-loader";

import { ErrorState } from "@/components/feedback/error-state";

import { SlotGrid } from "@/features/slots/components/slot-grid";

import { useSlots } from "@/features/slots/hooks/use-slots";

import { BookingSummaryDrawer } from "@/features/slots/components/booking-summary-drawer";

import { BookingConfirmationDrawer } from "@/features/bookings/components/booking-confirmation-drawer";
import { useState }
from "react";

import { Input }
from "@/components/ui/input";


export const Route = createFileRoute(
  "/_authenticated/calendar"
)({
  component: CalendarPage,
});

function CalendarPage() {

   const [
  selectedDate,
  setSelectedDate,
] = useState(
  new Date()
    .toISOString()
    .split("T")[0]
);

  const {
  data,
  isLoading,
  isError,
} = useSlots(
  selectedDate
);



  if (isLoading) {
    return <PageLoader />;
  }

  if (isError || !data) {
    return (
      <ErrorState message="Failed to load slots" />
    );
  }

 

  return (
    <div>

      <PageHeader
        title="Calendar & Slots"
        description="Manage slot availability and operational schedules."
      />

      <div className="
  mb-6
  flex
  items-center
  justify-end
">

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

      <SectionCard title="Today's Slots">

        <div className="
  space-y-5
">

  {data.map((turf: any) => (

    <div
      key={turf.id}

      className="
        rounded-3xl
        border
        border-border
        bg-card
        p-5
      "
    >

      <div className="
        mb-4
        flex
        items-center
        justify-between
      ">

        <h2 className="
          text-lg
          font-semibold
        ">
          {turf.name}
        </h2>

        <span className="
          text-sm
          text-muted-foreground
        ">
          {
            turf.slots.length
          } slots
        </span>

      </div>

      <div className="
        grid
        grid-cols-2
        gap-3
        md:grid-cols-4
        xl:grid-cols-6
      ">

        {turf.slots.map(
          (slot: any) => (

          <div
            key={slot.id}

            className={`
              rounded-2xl
              p-4
              text-white

              ${
                slot.status ===
                "AVAILABLE"

                ? "bg-green-600"

                : slot.status ===
                  "BOOKED"

                ? "bg-red-500"

                : "bg-yellow-500"
              }
            `}
          >

            <div className="
              text-sm
              font-medium
            ">
              {
                slot.startTime
              }
            </div>

            <div className="
              mt-1
              text-xs
            ">
              {
                slot.status
              }
            </div>

          </div>

        ))}

      </div>

    </div>

  ))}

</div>

      </SectionCard>
      <BookingSummaryDrawer
  slots={data}
/>

<BookingConfirmationDrawer />



    </div>
  );
}