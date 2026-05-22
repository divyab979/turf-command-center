import { Button } from "@/components/ui/button";

import { DetailDrawer } from "@/components/dashboard/detail-drawer";

import { SlotLockTimer } from "./slot-lock-timer";

import { useSlotStore } from "../store/slot-store";

import type { Slot } from "../types/slot.types";

import { useProcessPayment } from "@/features/bookings/hooks/use-process-payment";

import { useBookingStore } from "@/features/bookings/store/booking-store";

type Props = {
  slots: Slot[];
};

export function BookingSummaryDrawer({
  slots,
}: Props) {

  const {
    selectedSlotId,
    lockExpiresAt,
    clearSelection,
  } = useSlotStore();

  const {
    mutate: processPaymentMutation,
    isPending,
  } = useProcessPayment();

  const {
    setBookingId,
    setPaymentStatus,
  } = useBookingStore();

  const selectedSlot =
    slots.find(
      (slot) =>
        slot.id === selectedSlotId
    );

  const handlePayment = () => {

    if (!selectedSlot) {
      return;
    }

    setPaymentStatus(
      "processing"
    );

    processPaymentMutation(
      {
        slotId:
          selectedSlot.id,
      },

      {
        onSuccess: (data) => {

          setBookingId(
            data.bookingId
          );

          setPaymentStatus(
            "success"
          );

          clearSelection();
        },

        onError: () => {

          setPaymentStatus(
            "failed"
          );
        },
      }
    );
  };

  return (
    <DetailDrawer
      open={!!selectedSlot}

      onOpenChange={(open) => {

        if (!open) {
          clearSelection();
        }

      }}

      title="Booking Summary"

      description="Review slot and proceed to payment."
    >

      {selectedSlot && (

        <div className="space-y-6">

          {lockExpiresAt && (

            <SlotLockTimer
              expiresAt={lockExpiresAt}
            />

          )}

          <div className="space-y-4">

            <div className="flex items-center justify-between">

              <span className="text-muted-foreground">
                Time Slot
              </span>

              <span className="font-medium">
                {selectedSlot.startTime}
                {" - "}
                {selectedSlot.endTime}
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-muted-foreground">
                Date
              </span>

              <span className="font-medium">
                {selectedSlot.date}
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-muted-foreground">
                Turf
              </span>

              <span className="font-medium">
                {selectedSlot.turfId}
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-muted-foreground">
                Total Amount
              </span>

              <span className="font-semibold">
                ₹{selectedSlot.price}
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-muted-foreground">
                Advance Payment
              </span>

              <span className="font-semibold text-primary">

                ₹
                {Math.floor(
                  selectedSlot.price * 0.25
                )}

              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-muted-foreground">
                Remaining Amount
              </span>

              <span className="font-semibold">

                ₹
                {selectedSlot.price -
                  Math.floor(
                    selectedSlot.price * 0.25
                  )}

              </span>

            </div>

          </div>

          <Button
            onClick={handlePayment}

            disabled={isPending}

            className="w-full rounded-2xl"
          >

            {isPending
              ? "Processing Payment..."
              : "Proceed To Payment"}

          </Button>

        </div>

      )}

    </DetailDrawer>
  );
}