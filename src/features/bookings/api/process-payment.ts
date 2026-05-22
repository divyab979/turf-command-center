type ProcessPaymentParams = {
  slotId: string;
};

export async function processPayment({
  slotId,
}: ProcessPaymentParams) {

  await new Promise((resolve) =>
    setTimeout(resolve, 2000)
  );

  const success =
    Math.random() > 0.2;

  if (!success) {
    throw new Error(
      "Payment failed"
    );
  }

  return {
    success: true,

    bookingId:
      "BK-" +
      Math.floor(
        Math.random() * 100000
      ),

    slotId,
  };
}