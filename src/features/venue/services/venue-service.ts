import { api } from "@/lib/api";

export interface Venue {
  id: string;

  name: string;

  location: string;

  createdAt: string;

  owner: {
    id: string;

    name: string;

    email: string;
  };

  turfs: {
    id: string;
  }[];
}
export const getVenues =
  async (): Promise<Venue[]> => {

    const response =
      await api.get("/venues");

    return response.data;
  };

export const createVenue =
  async (payload: {
    name: string;

    location: string;
  }) => {

    const response =
      await api.post(
        "/venues",
        payload
      );

    return response.data;
  };