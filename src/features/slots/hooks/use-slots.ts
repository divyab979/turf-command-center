import { useQuery } from "@tanstack/react-query";

import { getSlots } from "../api/get-slots";

export function useSlots(
  date: string,
  venueId?: string | null
) {
  return useQuery({
    queryKey: [
      "slots",
      venueId,
      date,
    ],

    queryFn: () =>
      getSlots(date, venueId),
  });
}