import { api } from "@/lib/api";

export async function getSlots(
  date: string
) {

  const venueId =
    localStorage.getItem(
      "selectedVenueId"
    );

  const res =
    await api.get(
      `/turfs/${venueId}?date=${date}`
    );

  return res.data;
}