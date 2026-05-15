import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout, PageHeader } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { bookings, customerName, turfName, venueName } from "@/lib/mock-data";
import { Search, Download, Plus } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/bookings")({ component: BookingsPage });

function BookingsPage() {
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? bookings : bookings.filter(b => b.status === filter);
  const selected = bookings.find(b => b.id === open);

  return (
    <DashboardLayout title="Bookings">
      <PageHeader title="Bookings" description="All booking activity across your venues."
        action={<div className="flex gap-2"><Button variant="outline" size="sm" className="gap-1"><Download className="h-4 w-4"/>Export</Button><Button size="sm" className="gap-1 bg-primary hover:bg-primary/90"><Plus className="h-4 w-4"/>New booking</Button></div>}/>

      <Card className="p-4 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
            <Input className="pl-9" placeholder="Search by ID, customer, phone…"/>
          </div>
          {["All","Confirmed","Pending","Completed","Cancelled","No-show"].map(s => (
            <Button key={s} size="sm" variant={filter===s?"default":"outline"} onClick={()=>setFilter(s)}>{s}</Button>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3">ID</th><th>Customer</th><th>Venue / Turf</th><th>Sport</th>
                <th>Date</th><th>Slot</th><th>Source</th><th>Status</th><th>Payment</th><th className="text-right pr-4">Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer" onClick={()=>setOpen(b.id)}>
                  <td className="px-4 py-3 font-mono text-xs">{b.id}</td>
                  <td>{customerName(b.customer)}</td>
                  <td><div>{venueName(b.venue)}</div><div className="text-xs text-muted-foreground">{turfName(b.turf)}</div></td>
                  <td>{b.sport}</td>
                  <td>{b.date}</td>
                  <td>{b.start}–{b.end}</td>
                  <td><Badge variant="outline">{b.source}</Badge></td>
                  <td><Badge variant={b.status==="Confirmed"?"default":b.status==="Cancelled"||b.status==="No-show"?"destructive":"secondary"}>{b.status}</Badge></td>
                  <td><Badge variant={b.pay==="Paid"?"default":b.pay==="Partial"?"secondary":"destructive"}>{b.pay}</Badge></td>
                  <td className="text-right pr-4 font-semibold">₹{b.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Sheet open={!!open} onOpenChange={()=>setOpen(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>Booking {selected.id}</SheetTitle>
              </SheetHeader>
              <div className="mt-5 space-y-4 text-sm">
                <Card className="p-3">
                  <div className="text-xs uppercase text-muted-foreground mb-1">Customer</div>
                  <div className="font-semibold">{customerName(selected.customer)}</div>
                </Card>
                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-3"><div className="text-xs text-muted-foreground">Venue</div><div className="font-medium">{venueName(selected.venue)}</div></Card>
                  <Card className="p-3"><div className="text-xs text-muted-foreground">Turf</div><div className="font-medium">{turfName(selected.turf)}</div></Card>
                  <Card className="p-3"><div className="text-xs text-muted-foreground">Date</div><div className="font-medium">{selected.date}</div></Card>
                  <Card className="p-3"><div className="text-xs text-muted-foreground">Slot</div><div className="font-medium">{selected.start}–{selected.end}</div></Card>
                </div>
                <Card className="p-3">
                  <div className="text-xs uppercase text-muted-foreground mb-2">Payment ledger</div>
                  <div className="flex justify-between"><span>Total</span><span className="font-semibold">₹{selected.total.toLocaleString()}</span></div>
                  <div className="flex justify-between text-primary"><span>Advance paid</span><span>₹{selected.advance.toLocaleString()}</span></div>
                  <div className="flex justify-between text-destructive"><span>Balance</span><span>₹{selected.balance.toLocaleString()}</span></div>
                </Card>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline">Reschedule</Button>
                  <Button size="sm" variant="outline">Add payment</Button>
                  <Button size="sm" variant="outline">Send WhatsApp</Button>
                  <Button size="sm" variant="outline">Invoice</Button>
                  <Button size="sm" className="col-span-2 bg-primary hover:bg-primary/90">Mark check-in</Button>
                  <Button size="sm" variant="destructive" className="col-span-2">Cancel booking</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
}