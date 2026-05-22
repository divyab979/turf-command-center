interface Props {
  status:

    | "confirmed"
    | "pending"
    | "cancelled"
    | "completed"
    | "active"
    | "maintenance"
    | "inactive"
    | "available"
| "booked"
| "blocked"
| "maintenance"
| "locked"
;
}

const statusStyles = {
  confirmed:
    "bg-emerald-100 text-emerald-700",

  pending:
    "bg-yellow-100 text-yellow-700",

  cancelled:
    "bg-red-100 text-red-600",

  completed:
    "bg-blue-100 text-blue-700",

  active:
    "bg-emerald-100 text-emerald-700",

  maintenance:
    "bg-amber-100 text-amber-700",

  inactive:
    "bg-slate-200 text-slate-700",

  available: "bg-green-100 text-green-800",
  booked: "bg-orange-100 text-orange-800",
  blocked: "bg-red-100 text-red-800",
  locked:
  "bg-orange-100 text-orange-700",
};

export const StatusBadge = ({
  status,
}: Props) => {
  return (
    <span
      className={`
        rounded-full px-3 py-1 text-xs font-semibold capitalize
        ${statusStyles[status]}
      `}
    >
      {status}
    </span>
  );
};