import type { Slot } from "../types/slot.types";

import { StatusBadge } from "@/components/dashboard/status-badge";

import { cn } from "@/lib/utils";

import { useSlotStore } from "../store/slot-store";

import { useLockSlot } from "../hooks/use-lock-slot";

type Props = {
  slots: Slot[];
};

export function SlotGrid({
  slots,
}: Props) {

  const {
    selectedSlotId,
    setSelectedSlot,
  } = useSlotStore();

  const {
    mutate: lockSlotMutation,
    isPending,
  } = useLockSlot();

  const handleSelectSlot = (
    slotId: string
  ) => {

    setSelectedSlot(slotId);

    lockSlotMutation({
      slotId,
    });
  };

  

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

      {slots.map((slot) => (

        <div
          key={slot.id}

          onClick={() =>
            slot.status === "available" &&
            handleSelectSlot(slot.id)
          }

          className={cn(
            "cursor-pointer rounded-2xl border border-border bg-card p-5 shadow-sm transition-all",

            selectedSlotId === slot.id &&
              "border-primary ring-2 ring-primary/20",

            slot.status !== "available" &&
              "cursor-not-allowed opacity-60"
          )}
        >

          <div className="flex items-start justify-between">

            <div>

              <p className="text-lg font-semibold">
                {slot.startTime} - {slot.endTime}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                ₹{slot.price}
              </p>

              {selectedSlotId === slot.id &&
                isPending && (
                  <p className="mt-2 text-xs text-primary">
                    Locking slot...
                  </p>
                )}

            </div>

            <StatusBadge
              status={slot.status}
            />

          </div>

        </div>

      ))}

    </div>
  );
}