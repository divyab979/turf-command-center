import { useEffect, useState } from "react";

import { useSlotStore } from "../store/slot-store";

type Props = {
  expiresAt: number;
};

export function SlotLockTimer({
  expiresAt,
}: Props) {

  const [timeLeft, setTimeLeft] =
    useState("");

  useEffect(() => {

    const interval =
      setInterval(() => {

        const diff =
          expiresAt - Date.now();

       if (diff <= 0) {

  setTimeLeft("Expired");

  clearSelection();

  return;
}

        const minutes =
          Math.floor(diff / 1000 / 60);

        const seconds =
          Math.floor(
            (diff / 1000) % 60
          );

        setTimeLeft(
          `${minutes}:${String(
            seconds
          ).padStart(2, "0")}`
        );

      }, 1000);

    return () =>
      clearInterval(interval);

  }, [expiresAt]);

  const { clearSelection } =
  useSlotStore();

  return (
    <div className="rounded-xl bg-orange-100 px-4 py-2 text-sm font-medium text-orange-700">

      Slot locked for {timeLeft}

    </div>
  );
}