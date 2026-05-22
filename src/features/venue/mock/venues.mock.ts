import type { Venue } from "../types/venue.types";

export const venuesMock: Venue[] = [
  {
    id: "VEN-1001",
    name: "Arena Turf",
    location: "Pune",
    status: "active",

    sports: [
      "football",
      "cricket",
    ],

    openingTime: "06:00",
    closingTime: "23:00",

    turfs: [
      {
        id: "TRF-1",
        name: "Football Turf A",
        sport: "football",
        pricePerHour: 1800,
        isActive: true,
      },

      {
        id: "TRF-2",
        name: "Cricket Box A",
        sport: "cricket",
        pricePerHour: 1500,
        isActive: true,
      },
    ],
  },

  {
    id: "VEN-1002",
    name: "Goal Arena",
    location: "Mumbai",
    status: "maintenance",

    sports: ["football"],

    openingTime: "07:00",
    closingTime: "22:00",

    turfs: [
      {
        id: "TRF-3",
        name: "Main Football Ground",
        sport: "football",
        pricePerHour: 2200,
        isActive: false,
      },
    ],
  },
];