import { api } from "@/lib/api";

export async function getSlots(
  date: string,
  venueId?: string | null
) {
  const activeVenueId =
    venueId ||
    localStorage.getItem(
      "selectedVenueId"
    );

  if (!activeVenueId) {
    return [];
  }

  const res =
    await api.get(
      `/turfs/${activeVenueId}?date=${date}`
    );

  return res.data;
}