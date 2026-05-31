export interface SplitPaymentEntry {
  id: string;
  method: "cash" | "UPI" | "bank transfer" | "card" | "other";
  amount: number;
  note?: string;
  recordedBy?: string;
  timestamp?: string;
}

export const getSplitPayments = (bookingId: string, totalAmount: number): SplitPaymentEntry[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(`split_payments_${bookingId}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse split payments", e);
    }
  }
  
  // Default fallback: Single payment of totalAmount
  return [
    {
      id: `default-${bookingId}`,
      method: "cash",
      amount: totalAmount,
      note: "Standard Single Payment",
      recordedBy: "System (auto)",
      timestamp: new Date().toLocaleString(),
    }
  ];
};

export const saveSplitPayments = (bookingId: string, entries: SplitPaymentEntry[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(`split_payments_${bookingId}`, JSON.stringify(entries));
};

export const getBookingMonth = (booking: any): number => {
  const dateVal = booking.slotDate || booking.date || booking.createdAt;
  if (dateVal) {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      return d.getMonth(); // 0-11
    }
    if (typeof dateVal === "string") {
      const lower = dateVal.toLowerCase();
      if (lower.includes("today") || lower.includes("now")) {
        return new Date().getMonth();
      }
      if (lower.includes("yesterday")) {
        const yes = new Date();
        yes.setDate(yes.getDate() - 1);
        return yes.getMonth();
      }
      const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
      for (let i = 0; i < 12; i++) {
        if (lower.includes(months[i])) {
          return i;
        }
      }
    }
  }
  
  if (booking.id) {
    const num = parseInt(booking.id.replace(/\D/g, ""), 10);
    if (!isNaN(num)) {
      return num % 12;
    }
  }
  
  return new Date().getMonth();
};

export const getBookingYear = (booking: any): number => {
  const dateVal = booking.slotDate || booking.date || booking.createdAt;
  if (dateVal) {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      return d.getFullYear();
    }
  }
  return new Date().getFullYear();
};

export const getPaymentMethodBreakdown = (bookings: any[], allowedVenues?: string[]) => {
  const breakdown = {
    cash: 0,
    UPI: 0,
    "bank transfer": 0,
    card: 0,
    other: 0,
  };

  bookings.forEach((booking) => {
    // Filter by venue if specified
    if (allowedVenues && allowedVenues.length > 0) {
      const venueName = booking.venue || booking.venueName || (booking.venue && booking.venue.name);
      if (venueName && !allowedVenues.includes(venueName)) {
        return;
      }
    }

    const status = (booking.status || "").toLowerCase();
    if (status === "cancelled") {
      return;
    }

    const amount = booking.amount || booking.totalAmount || 0;
    const splits = getSplitPayments(booking.id, amount);

    splits.forEach((s) => {
      const method = s.method;
      if (method in breakdown) {
        breakdown[method as keyof typeof breakdown] += s.amount;
      } else {
        const normalized = method.toLowerCase();
        if (normalized.includes("upi")) breakdown["UPI"] += s.amount;
        else if (normalized.includes("cash")) breakdown["cash"] += s.amount;
        else if (normalized.includes("card")) breakdown["card"] += s.amount;
        else if (normalized.includes("bank") || normalized.includes("transfer")) breakdown["bank transfer"] += s.amount;
        else breakdown["other"] += s.amount;
      }
    });
  });

  return breakdown;
};

export const getMonthlyRevenueTrend = (bookings: any[], allowedVenues?: string[]) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentYear = new Date().getFullYear();
  
  const monthlyData = months.map((month) => ({
    month,
    revenue: 0,
  }));

  bookings.forEach((booking) => {
    // Filter by venue if specified
    if (allowedVenues && allowedVenues.length > 0) {
      const venueName = booking.venue || booking.venueName || (booking.venue && booking.venue.name);
      if (venueName && !allowedVenues.includes(venueName)) {
        return;
      }
    }

    const status = (booking.status || "").toLowerCase();
    if (status === "cancelled") {
      return;
    }

    // Only current year
    const year = getBookingYear(booking);
    if (year !== currentYear) {
      return;
    }

    const monthIdx = getBookingMonth(booking);
    const amount = booking.amount || booking.totalAmount || 0;
    
    // Sum split payments that are recorded
    const splits = getSplitPayments(booking.id, amount);
    const totalPaid = splits.reduce((sum, s) => sum + s.amount, 0);
    
    monthlyData[monthIdx].revenue += totalPaid;
  });

  return monthlyData;
};
