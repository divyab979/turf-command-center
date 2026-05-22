import { api } from "@/lib/api";

export interface GenerateSlotsPayload {
  startTime: string;
  endTime: string;
  duration: number;
  morningPrice: number;
  eveningPrice: number;
  startDate: string;
  endDate: string;
  daysOfWeek: number[];
}

export async function generateSlotsApi(
  turfId: string,
  payload: GenerateSlotsPayload
) {
  const response = await api.post(`/slots/${turfId}/generate`, payload);
  return response.data;
}
