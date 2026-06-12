import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/auth-store";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/services/auth-service";
import { Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [role, setRole] = useState("owner");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const mutation = useMutation({
    mutationFn: loginUser,

    onSuccess: (data) => {
      const mappedRole =
        role === "super_admin"
          ? "SUPER_ADMIN"
          : role === "owner"
          ? "OWNER"
          : "SUPERVISOR";

      login({
        ...data,
        user: {
          ...data.user,
          role: mappedRole,
          name: data.user?.name || (role === "super_admin" ? "Super Admin" : role === "owner" ? "Venue Owner" : "Supervisor Staff"),
        },
      });

      navigate({
        to: "/dashboard",
      } as any);
    },

    onError: (error) => {
      console.error(error);
      alert("Invalid credentials");
    },
  });

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex relative overflow-hidden" style={{ background: "var(--gradient-primary)" }}>
        <div className="m-auto p-10 text-primary-foreground max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center font-bold">G11</div>
            <div className="text-2xl font-bold">GameUp11</div>
          </div>
          <h1 className="text-4xl font-bold leading-tight">Run your turfs like a pro.</h1>
          <p className="mt-4 text-primary-foreground/85">Bookings, payments, occupancy and staff — one operational console for every venue.</p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[["10","Venues"],["38","Turfs"],["72%","Occupancy"]].map(([v,l]) => (
              <div key={l} className="bg-white/10 rounded-lg p-3 backdrop-blur">
                <div className="text-2xl font-bold">{v}</div>
                <div className="text-xs text-primary-foreground/80">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8">
          <h2 className="text-2xl font-bold text-foreground">Sign in</h2>
          <p className="text-sm text-muted-foreground mt-1">Welcome back. Choose your role.</p>
          <Tabs value={role} onValueChange={setRole} className="mt-5">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="super_admin">Super</TabsTrigger>
              <TabsTrigger value="owner">Owner</TabsTrigger>
              <TabsTrigger value="supervisor">Supervisor</TabsTrigger>
            </TabsList>
            <TabsContent value={role} className="mt-5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  mutation.mutate({
                    email,
                    password,
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <Label>Email or mobile</Label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="johndoe@test.com"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Password</Label>
                  <div className="relative mt-1.5">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-muted-foreground">
                    <input type="checkbox" className="accent-primary" defaultChecked /> Remember me
                  </label>
                  <a className="text-primary hover:underline" href="#">Forgot?</a>
                </div>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {mutation.isPending ? "Signing in..." : "Sign in"}
                </Button>
                <div className="text-xs text-center text-muted-foreground">Demo: any credentials sign you in as the selected role.</div>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}