import {
  useState,
} from "react";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  api,
} from "@/lib/api";

interface Props {
  turfId: string;

  onSuccess?: () => void;
}

export const GenerateSlotsForm = ({
  turfId,
  onSuccess,
}: Props) => {

  const [
    startTime,
    setStartTime,
  ] = useState("06:00");

  const [
    endTime,
    setEndTime,
  ] = useState("23:00");

  const [
    duration,
    setDuration,
  ] = useState(1);

  const [
    morningPrice,
    setMorningPrice,
  ] = useState(800);

  const [
    eveningPrice,
    setEveningPrice,
  ] = useState(1000);

  const [
    days,
    setDays,
  ] = useState(30);

  const [
    loading,
    setLoading,
  ] = useState(false);

  async function generate() {

    try {

      setLoading(true);

      await api.post(
        `/slots/${turfId}/generate`,
        {
          startTime,
          endTime,
          duration,
          morningPrice,
          eveningPrice,
          days,
        }
      );

      onSuccess?.();

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">

      <div>
        <Label>
          Start Time
        </Label>

        <Input
          type="time"
          value={startTime}
          onChange={(e) =>
            setStartTime(
              e.target.value
            )
          }
          className="mt-2"
        />
      </div>

      <div>
        <Label>
          End Time
        </Label>

        <Input
          type="time"
          value={endTime}
          onChange={(e) =>
            setEndTime(
              e.target.value
            )
          }
          className="mt-2"
        />
      </div>

      <div>
        <Label>
          Slot Duration (Hours)
        </Label>

        <Input
          type="number"
          value={duration}
          min={1}
          max={2}
          onChange={(e) =>
            setDuration(
              Number(
                e.target.value
              )
            )
          }
          className="mt-2"
        />
      </div>

      <div>
        <Label>
          Morning Price
        </Label>

        <Input
          type="number"
          value={morningPrice}
          onChange={(e) =>
            setMorningPrice(
              Number(
                e.target.value
              )
            )
          }
          className="mt-2"
        />
      </div>

      <div>
        <Label>
          Evening Price
        </Label>

        <Input
          type="number"
          value={eveningPrice}
          onChange={(e) =>
            setEveningPrice(
              Number(
                e.target.value
              )
            )
          }
          className="mt-2"
        />
      </div>

      <div>
        <Label>
          Generate For Days
        </Label>

        <Input
          type="number"
          value={days}
          onChange={(e) =>
            setDays(
              Number(
                e.target.value
              )
            )
          }
          className="mt-2"
        />
      </div>

      <Button
        onClick={generate}
        disabled={loading}
        className="
          w-full
          rounded-2xl
        "
      >
        {loading
          ? "Generating..."
          : "Generate Slots"}
      </Button>

    </div>
  );
};