import { useMutation } from "@tanstack/react-query";

import { lockSlot } from "../api/lock-slot";

export function useLockSlot() {

  return useMutation({
    mutationFn: lockSlot,
  });
}