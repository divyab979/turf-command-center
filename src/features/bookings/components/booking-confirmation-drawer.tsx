import { Button } from "@/components/ui/button";

import { DetailDrawer } from "@/components/dashboard/detail-drawer";

import { useBookingStore } from "../store/booking-store";

export function BookingConfirmationDrawer() {

  const {
    bookingId,
    paymentStatus,
    resetBooking,
  } = useBookingStore();

  return (
    <DetailDrawer
      open={
        paymentStatus !==
        "idle"
      }

      onOpenChange={(open) => {
        if (!open) {
          resetBooking();
        }
      }}

      title={
        paymentStatus ===
        "success"
          ? "Booking Confirmed"
          : paymentStatus ===
            "failed"
          ? "Payment Failed"
          : "Processing Payment"
      }

      description="Booking transaction status"
    >

      <div className="space-y-6">

        {paymentStatus ===
          "processing" && (

          <div className="rounded-2xl bg-muted p-6 text-center">

            <p className="font-medium">
              Processing payment...
            </p>

          </div>

        )}

        {paymentStatus ===
          "success" && (

          <div className="space-y-4">

            <div className="rounded-2xl bg-emerald-100 p-6 text-center">

              <p className="text-lg font-semibold text-emerald-700">
                Payment Successful
              </p>

              <p className="mt-2 text-sm text-emerald-700">

                Booking ID:
                {" "}
                {bookingId}

              </p>

            </div>

            <Button
              onClick={
                resetBooking
              }
              className="w-full rounded-2xl"
            >
              Done
            </Button>

          </div>

        )}

        {paymentStatus ===
          "failed" && (

          <div className="space-y-4">

            <div className="rounded-2xl bg-red-100 p-6 text-center">

              <p className="text-lg font-semibold text-red-700">
                Payment Failed
              </p>

              <p className="mt-2 text-sm text-red-700">
                Please retry payment
              </p>

            </div>

            <Button
              onClick={
                resetBooking
              }
              variant="destructive"
              className="w-full rounded-2xl"
            >
              Close
            </Button>

          </div>

        )}

      </div>

    </DetailDrawer>
  );
}