import { useMemo } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Calendar,
  MapPinned,
  ClipboardList,
  Users,
  IndianRupee,
  Settings,
  Trophy,
  Wrench,
  UserCog,
  TrendingUp,
  Sparkles,
} from "lucide-react";

import { useAuthStore } from "@/store/auth-store";

export const Sidebar = () => {
  const { user } = useAuthStore();
  const role = user?.role || "SUPERVISOR";

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const search = useRouterState({
    select: (state) => state.location.search,
  }) as Record<string, any>;
  const activeView = search.view;

  const getNavSections = (userRole: string) => {
    if (userRole === "SUPER_ADMIN") {
      return [
        {
          title: "Operations",
          items: [
            { label: "Global Dashboard", to: "/dashboard", icon: LayoutDashboard },
            { label: "Bookings", to: "/bookings", icon: ClipboardList },
            { label: "Calendar", to: "/calendar", icon: Calendar },
            { label: "Venues", to: "/venues", icon: MapPinned },
          ],
        },
        {
          title: "Management",
          items: [
            { label: "Owners", to: "/dashboard", search: { view: "owners" }, icon: Users },
            { label: "Customers", to: "/dashboard", search: { view: "customers" }, icon: Users },
          ],
        },
        {
          title: "Finance & Setup",
          items: [
            { label: "Payments", to: "/dashboard", search: { view: "payments" }, icon: IndianRupee },
            { label: "Platform Settings", to: "/dashboard", search: { view: "settings" }, icon: Settings },
          ],
        },
      ];
    } else if (userRole === "OWNER") {
      return [
        {
          title: "Operations",
          items: [
            { label: "Business Dashboard", to: "/dashboard", icon: LayoutDashboard },
            { label: "Bookings", to: "/bookings", icon: ClipboardList },
            { label: "Calendar", to: "/calendar", icon: Calendar },
            { label: "Venues & Turfs", to: "/venues", icon: MapPinned },
          ],
        },
        {
          title: "Special Modes",
          items: [
            { label: "Tournament Mode", to: "/dashboard", search: { view: "tournaments" }, icon: Trophy },
            { label: "Guest Walk-ins", to: "/dashboard", search: { view: "guest_mode" }, icon: Sparkles },
            { label: "Maintenance", to: "/dashboard", search: { view: "maintenance" }, icon: Wrench },
          ],
        },
        {
          title: "Management",
          items: [
            { label: "Staff & Supervisors", to: "/dashboard", search: { view: "staff" }, icon: UserCog },
            { label: "Customers CRM", to: "/dashboard", search: { view: "customers" }, icon: Users },
          ],
        },
        {
          title: "Finance & Setup",
          items: [
            { label: "Payments", to: "/dashboard", search: { view: "payments" }, icon: IndianRupee },
            { label: "Business Reports", to: "/dashboard", search: { view: "reports" }, icon: TrendingUp },
            { label: "Settings", to: "/dashboard", search: { view: "settings" }, icon: Settings },
          ],
        },
      ];
    } else {
      // SUPERVISOR
      return [
        {
          title: "Operations",
          items: [
            { label: "Home Dashboard", to: "/dashboard", icon: LayoutDashboard },
            { label: "Today's Bookings", to: "/bookings", icon: ClipboardList },
            { label: "Slot Control", to: "/calendar", icon: Calendar },
          ],
        },
        {
          title: "On-Ground",
          items: [
            { label: "Guest Walk-ins", to: "/dashboard", search: { view: "guest_mode" }, icon: Sparkles },
            { label: "Maintenance Issue", to: "/dashboard", search: { view: "maintenance" }, icon: Wrench },
          ],
        },
        {
          title: "Collections & Reports",
          items: [
            { label: "Daily Collection", to: "/dashboard", search: { view: "payments" }, icon: IndianRupee },
            { label: "Simple Reports", to: "/dashboard", search: { view: "reports" }, icon: TrendingUp },
          ],
        },
      ];
    }
  };

  const sections = useMemo(() => getNavSections(role), [role]);

  return (
    <aside className="hidden md:flex w-72 flex-col border-r border-border bg-[#14532D] text-white overflow-y-auto">
      <div className="border-b border-white/10 p-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
            <span className="text-lg font-bold">G11</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">GameUp11</h1>
            <p className="text-xs text-white/70">Turf Command Center</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-white/40">
              {section.title}
            </p>
            <nav className="space-y-0.5">
              {section.items.map((item: any) => {
                const Icon = item.icon;
                const active =
                  pathname === item.to &&
                  (item.search ? activeView === item.search.view : !activeView);

                const LinkComponent = Link as any;
                return (
                  <LinkComponent
                    key={item.label + (item.search?.view || "")}
                    to={item.to}
                    search={item.search}
                    className={`
                      flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-all text-sm
                      ${
                        active
                          ? "bg-white text-[#14532D] shadow-sm font-semibold"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }
                    `}
                  >
                    <Icon size={17} />
                    <span>{item.label}</span>
                  </LinkComponent>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 p-4 shrink-0 bg-emerald-950/20">
        <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
          <p className="text-xs text-white/60">Logged in as</p>
          <div className="mt-1">
            <p className="font-semibold text-sm">{user?.name}</p>
            <p className="text-xs capitalize text-white/50">
              {role.toLowerCase().replace("_", " ")}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};