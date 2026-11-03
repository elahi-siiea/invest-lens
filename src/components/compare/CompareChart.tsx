"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Comparison } from "@/lib/compare/build";
import { formatCompactUsd, formatMonth, formatUsd } from "@/lib/format";
import { BENCHMARK_COLOR, seriesColor } from "./colors";

interface CompareChartProps {
  comparison: Comparison;
  tickers: readonly string[];
}

interface TooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ dataKey?: string | number; value?: number | string }>;
  label?: string | number;
}

function styleFor(key: string, tickers: readonly string[]) {
  const index = tickers.indexOf(key);
  return index === -1
    ? { color: BENCHMARK_COLOR, dash: "6 4" as string | undefined }
    : { color: seriesColor(index), dash: undefined };
}

/** Year starts for long ranges, every third month for short ones, thinned to about seven labels. */
function axisTicks(dates: readonly string[]): string[] {
  const short = dates.length <= 25;
  const candidates = dates.filter((date) => (short ? Number(date.slice(5)) % 3 === 1 : date.endsWith("-01")));
  const step = Math.max(1, Math.ceil(candidates.length / 7));
  return candidates.filter((_, index) => index % step === 0);
}

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const rows = [...payload].sort((a, b) => Number(b.value) - Number(a.value));
  return (
    <div className="rounded-control border border-line bg-surface p-3 text-sm shadow-md">
      <p className="font-medium">{formatMonth(String(label))}</p>
      <dl className="mt-1 space-y-0.5">
        {rows.map((row) => (
          <div key={String(row.dataKey)} className="flex justify-between gap-6">
            <dt className="text-muted">{row.dataKey}</dt>
            <dd>{formatUsd(Number(row.value))}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function CompareChart({ comparison, tickers }: CompareChartProps) {
  const { chart, lines, start, end } = comparison;
  const last = chart[chart.length - 1] ?? {};
  const dates = chart.map((row) => String(row.date));
  const short = dates.length <= 25;
  const yearEnds = chart.filter((row, index) => index === 0 || index === chart.length - 1 || String(row.date).endsWith("-12"));

  const summary = `Line chart of how $10,000 would have grown from ${formatMonth(start)} to ${formatMonth(end)}. Ending values: ${lines
    .map((line) => `${line.label} ${formatUsd(Number(last[line.key]))}`)
    .join(", ")}.`;

  return (
    <figure>
      <figcaption className="font-display text-xl">What $10,000 would have become</figcaption>
      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {lines.map((line) => {
          const { color, dash } = styleFor(line.key, tickers);
          return (
            <li key={line.key} className="flex items-center gap-2">
              <svg width="22" height="8" aria-hidden="true">
                <line x1="0" y1="4" x2="22" y2="4" stroke={color} strokeWidth="2.5" strokeDasharray={dash} />
              </svg>
              <span>{line.label}</span>
              <span className="text-muted">{formatUsd(Number(last[line.key]))}</span>
            </li>
          );
        })}
      </ul>

      <div role="img" aria-label={summary} className="mt-4 h-72 w-full sm:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chart} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
            <CartesianGrid stroke="var(--line)" vertical={false} />
            <XAxis
              dataKey="date"
              ticks={axisTicks(dates)}
              tickLine={false}
              stroke="var(--edge)"
              tick={{ fill: "var(--muted)", fontSize: 12 }}
              tickFormatter={(date: string) => (short ? formatMonth(date) : date.slice(0, 4))}
            />
            <YAxis
              width={56}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted)", fontSize: 12 }}
              tickFormatter={(value: number) => formatCompactUsd(value)}
              domain={["auto", "auto"]}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--edge)" }} />
            {lines.map((line) => {
              const { color, dash } = styleFor(line.key, tickers);
              return (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  name={line.label}
                  stroke={color}
                  strokeWidth={2.5}
                  strokeDasharray={dash}
                  dot={false}
                  isAnimationActive={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <details className="mt-4 text-sm">
        <summary className="inline-flex min-h-11 cursor-pointer items-center font-medium text-accent">
          Show the numbers as a table
        </summary>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full min-w-[24rem] text-left">
            <caption className="sr-only">Value of $10,000 at the start, each year end and the end of the range</caption>
            <thead className="text-muted">
              <tr>
                <th scope="col" className="py-2 pr-4 font-medium">Month</th>
                {lines.map((line) => (
                  <th key={line.key} scope="col" className="py-2 pr-4 text-right font-medium">{line.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {yearEnds.map((row) => (
                <tr key={String(row.date)} className="border-t border-line">
                  <th scope="row" className="py-2 pr-4 font-normal">{formatMonth(String(row.date))}</th>
                  {lines.map((line) => (
                    <td key={line.key} className="py-2 pr-4 text-right">{formatUsd(Number(row[line.key]))}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
