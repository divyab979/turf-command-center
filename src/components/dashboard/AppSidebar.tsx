import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, CalendarDays, ClipboardList, MapPin, Goal, Trophy,
  UserPlus, Wrench, Users, CreditCard, UserCircle, BarChart3, Settings, Dumbbell,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard",    url: "/dashboard",    icon: LayoutDashboard },
  { title: "Bookings",     url: "/bookings",     icon: ClipboardList },
  { title: "Calendar",     url: "/calendar",     icon: CalendarDays },
  { title: "Venues",       url: "/venues",       icon: MapPin },
  { title: "Turfs",        url: "/turfs",        icon: Goal },
  { title: "Sports & Pricing", url: "/sports",   icon: Dumbbell },
  { title: "Tournaments",  url: "/tournaments",  icon: Trophy },
  { title: "Guest Mode",   url: "/guest",        icon: UserPlus },
  { title: "Maintenance",  url: "/maintenance",  icon: Wrench },
  { title: "Supervisors",  url: "/supervisors",  icon: Users },
  { title: "Payments",     url: "/payments",     icon: CreditCard },
  { title: "Customers",    url: "/customers",    icon: UserCircle },
  { title: "Reports",      url: "/reports",      icon: BarChart3 },
  { title: "Settings",     url: "/settings",     icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
            G11
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-sm font-semibold text-sidebar-foreground">GameUp11</div>
              <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">Owner Console</div>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = path === item.url;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}