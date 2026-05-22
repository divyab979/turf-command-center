import type { Slot } from "../types/slot.types";

type GenerateSlotsParams = {
  turfId: string;

  date: string;

  openingTime: string;
  closingTime: string;

  intervalMinutes?: number;

  basePrice: number;
};

export function generateSlots({
  turfId,
  date,
  openingTime,
  closingTime,
  intervalMinutes = 60,
  basePrice,
}: GenerateSlotsParams): Slot[] {

  const slots: Slot[] = [];

  const [openingHour] =
    openingTime.split(":").map(Number);

  const [closingHour] =
    closingTime.split(":").map(Number);

  for (
    let hour = openingHour;
    hour < closingHour;
    hour++
  ) {

    const start = `${String(hour).padStart(2, "0")}:00`;

    const end = `${String(hour + 1).padStart(2, "0")}:00`;

    slots.push({
      id: `${turfId}-${date}-${hour}`,

      turfId,

      date,

      startTime: start,
      endTime: end,

      price:
        hour >= 18 && hour <= 22
          ? basePrice + 300
          : basePrice,

      status: "available",
    });
  }

  return slots;
}