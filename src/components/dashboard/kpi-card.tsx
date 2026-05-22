import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon: LucideIcon;
}

export const KpiCard = ({
  title,
  value,
  change,
  positive = true,
  icon: Icon,
}: Props) => {
  return (
    <div className="rounded-3xl border border-border bg-white p-6 shadow-sm transition hover:shadow-md">
      
      <div className="flex items-start justify-between">
        
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-bold text-foreground">
            {value}
          </h3>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon size={22} />
        </div>
      </div>

      {change && (
        <div className="mt-5 flex items-center">
          
          <span
            className={`
              rounded-full px-3 py-1 text-xs font-semibold
              ${
                positive
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-600"
              }
            `}
          >
            {change}
          </span>

          <span className="ml-2 text-sm text-muted-foreground">
            vs last week
          </span>
        </div>
      )}
    </div>
  );
};