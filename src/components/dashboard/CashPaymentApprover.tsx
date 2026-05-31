import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { Banknote, X, Check, Loader2, AlertCircle } from "lucide-react";

interface PendingBooking {
  id: string;
  bookingId: string;
  customerName: string;
  user?: {
    name: string;
    email: string;
  };
  venue: {
    name: string;
  };
  slot: {
    startTime: string;
    endTime: string;
  };
  bookingDate: string;
  totalAmount: number;
  advancePaid: number;
  remainingAmount: number;
  cashPaymentRequested: boolean;
}

export const CashPaymentApprover = () => {
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isManuallyClosed, setIsManuallyClosed] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Check if current user is authorized (Owner, Super Admin, Supervisor)
  const isAuthorized =
    isAuthenticated &&
    user &&
    ["SUPER_ADMIN", "OWNER", "SUPERVISOR"].includes(user.role);

  const fetchPendingCashPayments = async () => {
    if (!isAuthorized) return;
    try {
      const res = await api.get("/bookings/admin");
      const cashRequests = res.data.filter(
        (b: any) => b.cashPaymentRequested === true
      );
      
      setPendingBookings(cashRequests);

      // If a new request comes in and they closed the modal, auto-reopen it
      if (cashRequests.length > pendingBookings.length) {
        setIsManuallyClosed(false);
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Error fetching cash payments:", error);
    }
  };

  useEffect(() => {
    if (!isAuthorized) return;

    // Initial fetch
    fetchPendingCashPayments();

    // Poll every 8 seconds
    const interval = setInterval(fetchPendingCashPayments, 8000);
    return () => clearInterval(interval);
  }, [isAuthorized]);

  // Open modal automatically if there are pending bookings and it wasn't manually closed
  useEffect(() => {
    if (pendingBookings.length > 0 && !isManuallyClosed) {
      setIsOpen(true);
    } else if (pendingBookings.length === 0) {
      setIsOpen(false);
    }
  }, [pendingBookings, isManuallyClosed]);

  const handleConfirmPayment = async (bookingId: string) => {
    setProcessingId(bookingId);
    try {
      await api.post(`/bookings/${bookingId}/confirm-cash-payment`);
      toast.success("Cash payment confirmed successfully!");
      
      // Invalidate all query caches to refresh data tables immediately
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["recent-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["revenue-overview"] });

      // Refresh local state
      await fetchPendingCashPayments();
    } catch (error: any) {
      console.error("Error confirming payment:", error);
      toast.error(error.response?.data?.message || "Failed to confirm cash payment");
    } finally {
      setProcessingId(null);
    }
  };

  if (!isAuthorized || pendingBookings.length === 0) return null;

  return (
    <>
      {/* Floating Action Button / Badge if Closed */}
      {(!isOpen || isManuallyClosed) && (
        <button
          onClick={() => {
            setIsManuallyClosed(false);
            setIsOpen(true);
          }}
          className="fixed bottom-6 right-6 z-40 bg-amber-500 hover:bg-amber-600 text-white rounded-full p-4 shadow-xl flex items-center justify-center cursor-pointer transition-all duration-300 transform hover:scale-110 active:scale-95 group"
          title="Pending Cash Payments"
        >
          <Banknote className="h-6 w-6 animate-bounce" />
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-black rounded-full h-6 w-6 flex items-center justify-center border-2 border-white shadow">
            {pendingBookings.length}
          </span>
        </button>
      )}

      {/* Main Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 relative flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => {
                setIsOpen(false);
                setIsManuallyClosed(true);
              }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground rounded-full p-1.5 hover:bg-accent transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-100 dark:bg-amber-950 p-2.5 rounded-xl text-amber-600 dark:text-amber-400">
                <Banknote className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Confirm Cash Payments
                </h2>
                <p className="text-sm text-muted-foreground">
                  {pendingBookings.length} request{pendingBookings.length > 1 ? "s" : ""} pending approval
                </p>
              </div>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              {pendingBookings.map((booking) => {
                const customer =
                  booking.customerName ||
                  booking.user?.name ||
                  "Customer";
                const total = booking.totalAmount;
                const paid = booking.advancePaid || 0;
                const remaining =
                  booking.remainingAmount || (total - paid);
                const formattedDate = booking.bookingDate
                  ? new Date(booking.bookingDate).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "short", year: "numeric" }
                    )
                  : "";

                return (
                  <div
                    key={booking.id}
                    className="p-4 rounded-xl border border-border bg-muted/40 flex flex-col gap-3 transition-colors hover:bg-muted/60"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-foreground">{customer}</div>
                        <div className="text-xs text-muted-foreground font-semibold">
                          {booking.venue.name}
                        </div>
                      </div>
                      <div className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md">
                        CASH PENDING
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground flex flex-col gap-1">
                      <div>
                        <span className="font-medium">Date:</span> {formattedDate}
                      </div>
                      <div>
                        <span className="font-medium">Time:</span>{" "}
                        {booking.slot.startTime} - {booking.slot.endTime}
                      </div>
                    </div>

                    <div className="border-t border-border/60 pt-2 flex justify-between items-center">
                      <div className="text-xs">
                        <span className="text-muted-foreground">Collect Cash:</span>
                        <div className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
                          ₹{remaining}
                        </div>
                      </div>

                      <button
                        onClick={() => handleConfirmPayment(booking.id)}
                        disabled={processingId !== null}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow transition-all active:scale-95"
                      >
                        {processingId === booking.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        Payment Done
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-border mt-6 pt-4 flex justify-end">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsManuallyClosed(true);
                }}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg hover:bg-accent transition-colors"
              >
                Dismiss to Sidebar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
