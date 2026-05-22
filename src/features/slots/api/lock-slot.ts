type LockSlotParams = {
  slotId: string;
};

export async function lockSlot({
  slotId,
}: LockSlotParams) {

  await new Promise((resolve) =>
    setTimeout(resolve, 800)
  );

  return {
    success: true,

    slotId,

    expiresAt:
      Date.now() + 1000 * 60 * 10,
  };
}