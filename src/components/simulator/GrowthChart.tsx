"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SimulationPoint } from "@/lib/finance";
import { formatCompactUsd, formatUsd } from "@/lib/format";

const SERIES = [
  { key: "nominal", label: "Balance", color: "var(--series-1)", dash: undefined },
  { key: "real", label: "In today's dollars", color: "var(--series-2)", dash: undefined },
  { key: "contributions", label: "Total you put in", color: "var(--muted)", dash: "6 4" },
] as const;

interface TooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ dataKey?: string | number; value?: number | string }>;
  label?: string | number;
}

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-control border border-line bg-surface p-3 text-sm shadow-md">
      <p className="font-medium">Year {label}</p>
      <dl className="mt-1 space-y-0.5">
        {SERIES.map((series) => {
          const entry = payload.find((item) => item.dataKey === series.key);
          return entry ? (
            <div key={series.key} className="flex justify-between gap-6">
              <dt className="text-muted">{series.label}</dt>
              <dd>{formatUsd(Number(entry.value))}</dd>
            </div>
          ) : null;
        })}
      </dl>
    </div>
  );
}

export function GrowthChart({ data }: { data: readonly SimulationPoint[] }) {
  const last = data.at(-1);
  const summary = last
    ? `Line chart of the projected balance over ${last.year} years. At the end the balance is ${formatUsd(last.nominal)}, which is ${formatUsd(last.real)} in today's dollars, from ${formatUsd(last.contributions)} contributed in total.`
    : "No data";

  return (
    <figure>
      <figcaption className="font-display text-xl">Balance by year, from your assumptions</figcaption>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
        {SERIES.map((series) => (
          <li key={series.key} className="flex items-center gap-2">
            <svg width="22" height="8" aria-hidden="true">
              <line x1="0" y1="4" x2="22" y2="4" stroke={series.color} strokeWidth="2.5" strokeDasharray={series.dash} />
            </svg>
            {series.label}
          </li>
        ))}
      </ul>
      <div role="img" aria-label={summary} className="mt-4 h-72 w-full sm:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={[...data]} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
            <CartesianGrid stroke="var(--line)" vertical={false} />
            <XAxis
              dataKey="year"
              tickLine={false}
              stroke="var(--edge)"
              tick={{ fill: "var(--muted)", fontSize: 12 }}
              label={{ value: "Years", position: "insideBottomRight", offset: -2, fill: "var(--muted)", fontSize: 12 }}
            />
            <YAxis
              width={56}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted)", fontSize: 12 }}
              tickFormatter={(value: number) => formatCompactUsd(value)}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--edge)" }} />
            {SERIES.map((series) => (
              <Line
                key={series.key}
                type="monotone"
                dataKey={series.key}
                stroke={series.color}
                strokeWidth={2.5}
                strokeDasharray={series.dash}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <details className="mt-4 text-sm">
        <summary className="inline-flex min-h-11 cursor-pointer items-center font-medium text-accent">
          Show the numbers as a table
        </summary>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full min-w-[28rem] text-left">
            <caption className="sr-only">Projected balance by year</caption>
            <thead className="text-muted">
              <tr>
                <th scope="col" className="py-2 pr-4 font-medium">Year</th>
                {SERIES.map((series) => (
                  <th key={series.key} scope="col" className="py-2 pr-4 text-right font-medium">
                    {series.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((point) => (
                <tr key={point.year} className="border-t border-line">
                  <th scope="row" className="py-2 pr-4 font-normal">{point.year}</th>
                  <td className="py-2 pr-4 text-right">{formatUsd(point.nominal)}</td>
                  <td className="py-2 pr-4 text-right">{formatUsd(point.real)}</td>
                  <td className="py-2 pr-4 text-right">{formatUsd(point.contributions)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
