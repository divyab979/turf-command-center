import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { CashPaymentApprover } from "../components/dashboard/CashPaymentApprover";

export const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Topbar />

        <main className="flex-1 overflow-y-auto bg-background p-6 md:p-8">
          {children}
        </main>
      </div>

      <CashPaymentApprover />
    </div>
  );
};