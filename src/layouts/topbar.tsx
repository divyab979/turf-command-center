import { Bell, Search } from "lucide-react";

import { useAuthStore } from "@/store/auth-store";

export const Topbar = () => {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-xl">
      
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Welcome back,
          <span className="text-primary">
            {" "}
            {user?.name}
          </span>
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage bookings, venues and operations.
        </p>
      </div>

      <div className="flex items-center gap-4">
        
        <div className="hidden lg:flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-2 shadow-sm">
          <Search
            size={18}
            className="text-muted-foreground"
          />

          <input
            placeholder="Search..."
            className="bg-transparent outline-none text-sm"
          />
        </div>

        <button className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-white shadow-sm transition hover:scale-[1.02]">
          
          <Bell size={19} />

          <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[#EF4444]" />
        </button>

        <div className="flex items-center gap-3 rounded-2xl border border-border bg-white px-3 py-2 shadow-sm">
          
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
            {user?.name?.charAt(0)}
          </div>

          <div className="hidden md:block">
            <p className="text-sm font-semibold text-foreground">
              {user?.name}
            </p>

            <p className="text-xs capitalize text-muted-foreground">
              {user?.role.replace("_", " ")}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};