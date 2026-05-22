import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

import { PageHeader } from "@/components/dashboard/page-header";

import { SectionCard } from "@/components/dashboard/section-card";

import { DataTable } from "@/components/dashboard/data-table";

import { PageLoader } from "@/components/feedback/page-loader";

import { ErrorState } from "@/components/feedback/error-state";

import { useVenues } from "@/features/venue/hooks/use-venues";

import { venueColumns } from "@/features/venue/components/venues-columns";
import { useState } from "react";

import { DetailDrawer }
  from "@/components/dashboard/detail-drawer";

import { CreateVenueForm }
  from "@/features/venue/components/create-venue-form";


export const Route = createFileRoute(
  "/_authenticated/venues/"
)({
  component: VenuesPage,
});

function VenuesPage() {
  const {
    data,
    isLoading,
    isError,
  } = useVenues();

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError || !data) {
    return (
      <ErrorState message="Failed to load venues" />
    );
  }

  const [open, setOpen] =
  useState(false);

  return (
    <div>

      <PageHeader
        title="Venues"
        description="Manage venues, turfs and operational availability."
        action={
          <Button
  className="rounded-2xl"
  onClick={() =>
    setOpen(true)
  }
>
  Add Venue
</Button>
        }
      />

      <SectionCard title="All Venues">

        <DataTable
          columns={venueColumns}
          data={data}
        />

      </SectionCard>
      <DetailDrawer
  open={open}
  onOpenChange={setOpen}
  title="Create Venue"
  description="Add a new operational venue."
>
  <CreateVenueForm
    onSuccess={() =>
      setOpen(false)
    }
  />
</DetailDrawer><DetailDrawer
  open={open}
  onOpenChange={setOpen}
  title="Create Venue"
  description="Add a new operational venue."
>
  <CreateVenueForm
    onSuccess={() =>
      setOpen(false)
    }
  />
</DetailDrawer>

    </div>
  );
}