import { Bell, Search } from "lucide-react";

import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LogOut, User as UserIcon } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Topbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

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

        <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 rounded-2xl border border-border bg-white px-3 py-2 shadow-sm cursor-pointer hover:bg-slate-50 transition outline-none text-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white select-none">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>

                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-foreground">
                    {user?.name}
                  </p>

                  <p className="text-xs capitalize text-muted-foreground">
                    {user?.role?.replace("_", " ").toLowerCase()}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-1">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setProfileOpen(true)} className="cursor-pointer">
                <UserIcon size={16} className="mr-2 text-muted-foreground" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                <LogOut size={16} className="mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">User Profile</DialogTitle>
              <DialogDescription>
                Your account details and permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4 border-b border-border pb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-foreground">{user?.name}</h4>
                  <p className="text-sm text-muted-foreground capitalize">
                    Role: {user?.role?.replace("_", " ").toLowerCase()}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</span>
                  <p className="text-sm font-medium text-foreground mt-0.5">{user?.email || "No email provided"}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">User ID</span>
                  <p className="text-sm font-mono text-foreground mt-0.5">{user?.id}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
};