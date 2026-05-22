import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { generateSlotsApi } from "../api/generate-slots";
import { CalendarDays } from "lucide-react";

interface Props {
  turfId: string;
  onSuccess?: () => void;
}

const DAYS_OF_WEEK = [
  { label: "M", value: 1, name: "Monday" },
  { label: "T", value: 2, name: "Tuesday" },
  { label: "W", value: 3, name: "Wednesday" },
  { label: "T", value: 4, name: "Thursday" },
  { label: "F", value: 5, name: "Friday" },
  { label: "S", value: 6, name: "Saturday" },
  { label: "S", value: 0, name: "Sunday" },
];

export const GenerateSlotsForm = ({ turfId, onSuccess }: Props) => {
  const [startTime, setStartTime] = useState("06:00");
  const [endTime, setEndTime] = useState("23:00");
  const [duration, setDuration] = useState(1);
  const [morningPrice, setMorningPrice] = useState(1200);
  const [eveningPrice, setEveningPrice] = useState(1500);

  const [schedulePreset, setSchedulePreset] = useState<"weekdays" | "weekends" | "custom">("weekdays");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default

  const [fromDate, setFromDate] = useState(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });

  const [toDate, setToDate] = useState(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const y = nextWeek.getFullYear();
    const m = String(nextWeek.getMonth() + 1).padStart(2, "0");
    const d = String(nextWeek.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });

  const [loading, setLoading] = useState(false);

  const handlePresetChange = (preset: "weekdays" | "weekends" | "custom") => {
    setSchedulePreset(preset);
    if (preset === "weekdays") {
      setSelectedDays([1, 2, 3, 4, 5]);
    } else if (preset === "weekends") {
      setSelectedDays([0, 6]);
    }
  };

  const handleDayToggle = (dayValue: number) => {
    setSchedulePreset("custom"); // Switch to custom automatically when toggling day pills
    if (selectedDays.includes(dayValue)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayValue));
    } else {
      setSelectedDays([...selectedDays, dayValue]);
    }
  };

  async function generate() {
    if (!fromDate || !toDate) {
      toast.error("Please select a valid date range");
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      toast.error("From Date cannot be after To Date");
      return;
    }
    if (selectedDays.length === 0) {
      toast.error("Please select at least one day of the week");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        startTime,
        endTime,
        duration,
        morningPrice,
        eveningPrice,
        startDate: fromDate,
        endDate: toDate,
        daysOfWeek: selectedDays,
      };

      await generateSlotsApi(turfId, payload);

      toast.success(
        `Generated day-specific slots successfully from ${fromDate} to ${toDate}`
      );
      onSuccess?.();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Error generating slots";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5 font-medium text-slate-700 text-xs">
      {/* Date Range Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-slate-500 font-bold">From Date</Label>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="mt-2 rounded-xl"
          />
        </div>

        <div>
          <Label className="text-slate-500 font-bold">To Date</Label>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="mt-2 rounded-xl"
          />
        </div>
      </div>

      {/* Days of Week Scheduling Preset */}
      <div className="space-y-2">
        <Label className="text-slate-500 font-bold">Schedule Days Pattern</Label>
        <div className="grid grid-cols-3 gap-2">
          {["weekdays", "weekends", "custom"].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handlePresetChange(preset as any)}
              className={`py-2 rounded-xl border text-[10px] font-extrabold uppercase tracking-wider transition-all ${
                schedulePreset === preset
                  ? "bg-emerald-800 border-emerald-800 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-500 hover:border-emerald-800/35"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Days of week circular selection pills */}
        <div className="flex justify-between items-center gap-1 bg-slate-50 border border-slate-100 p-3 rounded-2xl mt-2">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDays.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                onClick={() => handleDayToggle(day.value)}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-all shrink-0 ${
                  isSelected
                    ? "bg-emerald-800 text-white shadow-md scale-105"
                    : "bg-white border border-slate-200 text-slate-500 hover:border-emerald-800/35"
                }`}
                title={day.name}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Slot Start & End Hours */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-slate-500 font-bold">Start Time</Label>
          <Input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-2 rounded-xl"
          />
        </div>

        <div>
          <Label className="text-slate-500 font-bold">End Time</Label>
          <Input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="mt-2 rounded-xl"
          />
        </div>
      </div>

      {/* Duration Selection */}
      <div>
        <Label className="text-slate-500 font-bold">Slot Duration</Label>
        <Select
          value={String(duration)}
          onValueChange={(val) => setDuration(Number(val))}
        >
          <SelectTrigger className="mt-2 rounded-xl">
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0.5">30 Minutes</SelectItem>
            <SelectItem value="1">1 Hour</SelectItem>
            <SelectItem value="1.5">1.5 Hours</SelectItem>
            <SelectItem value="2">2 Hours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Standard and Peak Pricing */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-slate-500 font-bold">Morning Price (₹)</Label>
          <Input
            type="number"
            value={morningPrice}
            onChange={(e) => setMorningPrice(Number(e.target.value))}
            className="mt-2 rounded-xl"
          />
        </div>

        <div>
          <Label className="text-slate-500 font-bold">Evening Price (₹)</Label>
          <Input
            type="number"
            value={eveningPrice}
            onChange={(e) => setEveningPrice(Number(e.target.value))}
            className="mt-2 rounded-xl"
          />
        </div>
      </div>

      {/* Submit Button */}
      <Button
        onClick={generate}
        disabled={loading}
        className="w-full rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold h-11 flex items-center justify-center gap-2 shadow-md transition-all mt-4"
      >
        <CalendarDays size={16} />
        <span>{loading ? "Generating Slots..." : "Generate Slots"}</span>
      </Button>
    </div>
  );
};