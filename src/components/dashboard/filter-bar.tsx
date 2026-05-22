import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

interface Props {
  search?: string;
  setSearch?: (value: string) => void;

  children?: React.ReactNode;
}

export const FilterBar = ({
  search,
  setSearch,
  children,
}: Props) => {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-border bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      
      <div className="flex items-center gap-3">
        
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2">
          
          <Search
            size={18}
            className="text-muted-foreground"
          />

          <Input
            value={search}
            onChange={(e) =>
              setSearch?.(e.target.value)
            }
            placeholder="Search..."
            className="border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
        </div>

        {children}
      </div>
    </div>
  );
};