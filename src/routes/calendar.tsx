import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout, PageHeader } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { turfs, slots } from "@/lib/mock-data";
import { ChevronLeft, ChevronRight, Lock, Wrench, Trophy, CheckCircle2 } from "lucide-react";
import { Fragment } from "react";

export const Route = createFileRoute("/calendar")({ component: CalendarPage });

const HOURS = Array.from({length: 14}, (_, i) => `${String(7+i).padStart(2,"0")}:00`);
const STATE_COLORS: Record<string,string> = {
  Available: "bg-muted/40 text-muted-foreground border-dashed",
  Booked: "bg-primary/15 text-primary border-primary/40",
  Blocked: "bg-amber-100 text-amber-800 border-amber-300",
  Maintenance: "bg-destructive/15 text-destructive border-destructive/40",
  Tournament: "bg-blue-100 text-blue-800 border-blue-300",
  Past: "bg-secondary text-muted-foreground",
};

function rng(seed: number){let x = Math.sin(seed)*10000; return x - Math.floor(x);}

function CalendarPage() {
  const turfsList = turfs.slice(0, 5);
  return (
    <DashboardLayout title="Calendar">
      <PageHeader title="Slot Calendar" description="Today's availability across your turfs."
        action={<div className="flex items-center gap-2"><Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4"/></Button><Button variant="outline" size="sm">Thu, 15 May 2025</Button><Button variant="outline" size="icon"><ChevronRight className="h-4 w-4"/></Button><Button size="sm" className="bg-primary hover:bg-primary/90">Bulk block</Button></div>}/>

      <div className="flex flex-wrap gap-2 mb-4 text-xs">
        {Object.entries(STATE_COLORS).map(([s, cls]) => (
          <span key={s} className={`px-2 py-1 rounded border ${cls}`}>{s}</span>
        ))}
      </div>

      <Card className="p-3 overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid" style={{ gridTemplateColumns: `120px repeat(${HOURS.length}, minmax(70px, 1fr))` }}>
            <div className="text-xs font-semibold text-muted-foreground p-2">Turf / Time</div>
            {HOURS.map(h => <div key={h} className="text-xs text-muted-foreground p-2 text-center border-l">{h}</div>)}
            {turfsList.map((t, ti) => (
              <Fragment key={t.id}>
                <div className="p-2 border-t font-medium text-sm">{t.name}<div className="text-[10px] text-muted-foreground">{t.sport}</div></div>
                {HOURS.map((h, hi) => {
                  const r = rng(ti*31 + hi);
                  const state = r<0.45?"Booked":r<0.55?"Blocked":r<0.62?"Maintenance":r<0.68?"Tournament":"Available";
                  const Icon = state==="Blocked"?Lock:state==="Maintenance"?Wrench:state==="Tournament"?Trophy:state==="Booked"?CheckCircle2:null;
                  return (
                    <div key={h} className={`m-0.5 rounded border p-1.5 text-[10px] flex items-center justify-center gap-1 cursor-pointer hover:opacity-80 ${STATE_COLORS[state]}`}>
                      {Icon && <Icon className="h-3 w-3"/>}
                      <span className="hidden md:inline">{state}</span>
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-5 mt-4">
        <div className="font-semibold mb-3">Today's slots (Turf A)</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {slots.map(s => (
            <div key={s.id} className={`rounded-lg border p-3 text-sm ${STATE_COLORS[s.state] ?? ""}`}>
              <div className="font-medium">{s.time}</div>
              <div className="text-xs mt-1">₹{s.price}</div>
              <Badge variant="outline" className="mt-2">{s.state}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
}