import { useMutation } from "@tanstack/react-query";

import { processPayment } from "../api/process-payment";

export function useProcessPayment() {

  return useMutation({
    mutationFn: processPayment,
  });
}