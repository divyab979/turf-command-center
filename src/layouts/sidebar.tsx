import { Link, useRouterState } from "@tanstack/react-router";

import {
  LayoutDashboard,
  Calendar,
  MapPinned,
  ClipboardList,
} from "lucide-react";

import { useAuthStore } from "@/store/auth-store";

import { can } from "@/permissions/can";
import { PERMISSIONS } from "@/permissions/permissions";

const navItems = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    label: "Bookings",
    to: "/bookings",
    icon: ClipboardList,
    permission: PERMISSIONS.BOOKINGS_VIEW,
  },
  {
    label: "Calendar",
    to: "/calendar",
    icon: Calendar,
    permission: PERMISSIONS.CALENDAR_VIEW,
  },
  {
    label: "Venues",
    to: "/venues",
    icon: MapPinned,
    permission: PERMISSIONS.VENUES_VIEW,
  },
];

export const Sidebar = () => {
  const { user } = useAuthStore();

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <aside className="hidden md:flex w-72 flex-col border-r border-border bg-[#14532D] text-white">
      
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center gap-3">
          
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
            <span className="text-lg font-bold">
              G11
            </span>
          </div>

          <div>
            <h1 className="text-xl font-bold">
              GameUp11
            </h1>

            <p className="text-sm text-white/70">
              Turf Command Center
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4">
        <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-white/50">
          Operations
        </p>

        <nav className="space-y-2">
          {navItems
            .filter((item) =>
              can(
                user?.role || "MANAGER",
                item.permission
              )
            )
            .map((item) => {
              const Icon = item.icon;

              const active =
                pathname === item.to;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`
                    flex items-center gap-3 rounded-2xl px-4 py-3 transition-all
                    ${
                      active
                        ? "bg-white text-[#14532D] shadow-sm"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }
                  `}
                >
                  <Icon size={19} />

                  <span className="font-medium">
                    {item.label}
                  </span>
                </Link>
              );
            })}
        </nav>
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
          
          <p className="text-sm text-white/70">
            Logged in as
          </p>

          <div className="mt-2">
            <p className="font-semibold">
              {user?.name}
            </p>

            <p className="text-sm capitalize text-white/60">
             {user?.role
  ?.toLowerCase()
  .replace("_", " ")}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};