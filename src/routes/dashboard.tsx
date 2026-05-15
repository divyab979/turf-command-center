import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout, PageHeader } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { dashboardKpis, dailyBookings, paymentBreakdown, sportShare, bookings, customerName, turfName } from "@/lib/mock-data";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

export const Route = createFileRoute("/dashboard")({ component: DashboardPage });

const COLORS = ["hsl(148 60% 45%)","hsl(75 75% 55%)","hsl(230 60% 55%)","hsl(25 70% 55%)","hsl(280 35% 55%)","hsl(190 60% 50%)"];

function DashboardPage() {
  return (
    <DashboardLayout title="Dashboard">
      <PageHeader title="Welcome back, Rohan 👋" description="Here's what's happening across your venues today." />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {dashboardKpis.map((k) => (
          <Card key={k.label} className="p-4">
            <div className="text-xs text-muted-foreground">{k.label}</div>
            <div className="text-xl font-bold text-foreground mt-1">{k.value}</div>
            <div className={`text-[11px] mt-1 inline-flex items-center gap-1 ${k.tone === "warning" ? "text-amber-600" : k.tone === "success" ? "text-primary" : "text-muted-foreground"}`}>
              {k.tone === "warning" ? <TrendingDown className="h-3 w-3"/> : <TrendingUp className="h-3 w-3"/>}
              {k.delta}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-semibold">Bookings & Revenue</div>
              <div className="text-xs text-muted-foreground">Last 7 days</div>
            </div>
            <Badge variant="secondary">Weekly</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={dailyBookings}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(150 20% 90%)" />
                <XAxis dataKey="day" stroke="hsl(155 10% 40%)" fontSize={12}/>
                <YAxis stroke="hsl(155 10% 40%)" fontSize={12}/>
                <Tooltip />
                <Bar dataKey="bookings" fill="hsl(148 60% 45%)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <div className="font-semibold mb-3">Payment Mode</div>
          <div className="h-48">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={paymentBreakdown} dataKey="value" nameKey="name" innerRadius={42} outerRadius={70}>
                  {paymentBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i]}/>)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-1.5">
            {paymentBreakdown.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{background: COLORS[i]}}/>{p.name}</span>
                <span className="text-muted-foreground">{p.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-5">
          <div className="font-semibold mb-3">Revenue trend</div>
          <div className="h-44">
            <ResponsiveContainer>
              <LineChart data={dailyBookings}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(150 20% 90%)" />
                <XAxis dataKey="day" stroke="hsl(155 10% 40%)" fontSize={12}/>
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="hsl(148 60% 35%)" strokeWidth={2} dot={{r:3}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <div className="font-semibold mb-3">Sport share</div>
          <div className="space-y-2.5">
            {sportShare.map((s) => (
              <div key={s.name}>
                <div className="flex justify-between text-xs mb-1"><span>{s.name}</span><span className="text-muted-foreground">{s.value}%</span></div>
                <Progress value={s.value*2.5} className="h-2"/>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <div className="font-semibold mb-3">Alerts</div>
          <div className="space-y-2 text-sm">
            <div className="rounded-md border-l-4 border-amber-500 bg-amber-50 p-2.5">3 bookings have pending balance ₹4,400</div>
            <div className="rounded-md border-l-4 border-destructive bg-red-50 p-2.5">Floodlight repair on Powai Field B until 18 May</div>
            <div className="rounded-md border-l-4 border-primary bg-primary/10 p-2.5">Tournament “Corporate Cup” starts in 17 days</div>
            <div className="rounded-md border-l-4 border-blue-500 bg-blue-50 p-2.5">2 slots blocked for maintenance today</div>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold">Today's bookings</div>
          <Badge variant="outline">{bookings.length} total</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground border-b">
              <tr><th className="py-2">ID</th><th>Customer</th><th>Turf</th><th>Slot</th><th>Status</th><th className="text-right">Total</th></tr>
            </thead>
            <tbody>
              {bookings.slice(0,8).map(b => (
                <tr key={b.id} className="border-b last:border-0">
                  <td className="py-2.5 font-mono text-xs">{b.id}</td>
                  <td>{customerName(b.customer)}</td>
                  <td>{turfName(b.turf)}</td>
                  <td>{b.start}–{b.end}</td>
                  <td><Badge variant={b.status === "Confirmed" ? "default" : b.status === "Cancelled" ? "destructive" : "secondary"}>{b.status}</Badge></td>
                  <td className="text-right font-medium">₹{b.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}