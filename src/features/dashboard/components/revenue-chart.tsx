import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
} from "recharts";

import type { RevenuePoint } from "../types/dashboard.types";

type Props = {
  data: RevenuePoint[];
};

export function RevenueChart({
  data,
}: Props) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <AreaChart data={data}>
          <XAxis dataKey="date" />

          <Tooltip />

          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#14532D"
            fill="#14532D"
            fillOpacity={0.15}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}