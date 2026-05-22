import { useQuery } from "@tanstack/react-query";

import { getSlots } from "../api/get-slots";

export function useSlots(
  date: string
) {

  return useQuery({

    queryKey: [
      "slots",
      date,
    ],

    queryFn: () =>
      getSlots(date),
  });
}