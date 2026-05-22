import { useQuery }
  from "@tanstack/react-query";

import { getVenues }
  from "../services/venue-service";

export const useVenues = () => {

  return useQuery({
    queryKey: ["venues"],

    queryFn: getVenues,
  });
};