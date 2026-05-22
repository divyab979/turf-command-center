import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import type {
  ColumnDef,
} from "@tanstack/react-table";

interface Props<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
}

export function DataTable<TData>({
  columns,
  data,
}: Props<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel:
      getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
      
      <table className="w-full">
        
        <thead className="border-b border-border bg-muted/40">
          {table
            .getHeaderGroups()
            .map((headerGroup) => (
              <tr key={headerGroup.id}>
                
                {headerGroup.headers.map(
                  (header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-sm font-semibold text-foreground"
                    >
                      {flexRender(
                        header.column.columnDef
                          .header,
                        header.getContext()
                      )}
                    </th>
                  )
                )}
              </tr>
            ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map(
            (row) => (
              <tr
                key={row.id}
                className="border-b border-border transition hover:bg-muted/20"
              >
                {row
                  .getVisibleCells()
                  .map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 text-sm text-muted-foreground"
                    >
                      {flexRender(
                        cell.column.columnDef
                          .cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}