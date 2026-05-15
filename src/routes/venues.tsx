import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout, PageHeader } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { venues } from "@/lib/mock-data";
import { MapPin, Phone, Plus, Clock } from "lucide-react";

export const Route = createFileRoute("/venues")({ component: VenuesPage });

function VenuesPage() {
  return (
    <DashboardLayout title="Venues">
      <PageHeader title="Venues" description="Manage your venue master data."
        action={<Button size="sm" className="gap-1 bg-primary hover:bg-primary/90"><Plus className="h-4 w-4"/>Add venue</Button>} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {venues.map(v => (
          <Card key={v.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-28" style={{ background: "var(--gradient-primary)" }}>
              <div className="p-3 flex justify-between">
                <Badge className="bg-white/20 text-white border-white/30">{v.id}</Badge>
                <Badge variant={v.status==="Active"?"default":"destructive"}>{v.status}</Badge>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold">{v.name}</h3>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3"/>{v.city} · {v.address}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Phone className="h-3 w-3"/>{v.contact}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Clock className="h-3 w-3"/>{v.open} – {v.close}</div>
              <div className="flex flex-wrap gap-1 mt-3">
                {v.amenities.map(a => <Badge key={a} variant="secondary" className="text-[10px]">{a}</Badge>)}
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="flex-1">Edit</Button>
                <Button size="sm" variant="outline" className="flex-1">View turfs</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}