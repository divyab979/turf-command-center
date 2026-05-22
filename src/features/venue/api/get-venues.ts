import { venuesMock } from "../mock/venues.mock";

export async function getVenues() {
  await new Promise((resolve) =>
    setTimeout(resolve, 700)
  );

  return venuesMock;
}