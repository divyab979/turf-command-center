export type SportType =
  | "football"
  | "cricket"
  | "badminton"
  | "pickleball";

export type VenueStatus =
  | "active"
  | "maintenance"
  | "inactive";

export interface Turf {
  id: string;
  name: string;
  sport: SportType;
  pricePerHour: number;
  isActive: boolean;
}

export interface Venue {
  id: string;
  name: string;
  location: string;
  status: VenueStatus;
  sports: SportType[];
  turfs: Turf[];
  openingTime: string;
  closingTime: string;
}