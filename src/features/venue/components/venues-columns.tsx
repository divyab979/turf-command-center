import {
  ColumnDef,
} from "@tanstack/react-table";

import {
  Link,
} from "@tanstack/react-router";

import {
  Venue,
} from "../services/venue-service";

export const venueColumns:
  ColumnDef<Venue>[] = [
  {
    accessorKey: "name",

    header: "Venue",

    cell: ({ row }) => (
      <Link
        to="/venues/$venueId"
        params={{
          venueId:
            row.original.id,
        }}
        className="
          font-semibold
          text-primary
          hover:underline
        "
      >
        {row.original.name}
      </Link>
    ),
  },

  {
    accessorKey: "location",

    header: "Location",
  },

  {
    id: "owner",

    header: "Owner",

    cell: ({ row }) =>
      row.original.owner.name,
  },

  {
    id: "turfs",

    header: "Turfs",

    cell: ({ row }) =>
      row.original?.turfs?.length || 0,
  },
];