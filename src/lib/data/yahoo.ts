import type { PricePoint } from "@/lib/finance";

interface ChartBody {
  chart?: {
    error?: { description?: string } | null;
    result?: {
      timestamp?: number[];
      indicators?: { adjclose?: { adjclose?: (number | null)[] }[] };
    }[];
  };
}

/** Yahoo writes share classes with a dash, for example BRK-B. */
export function yahooSymbol(symbol: string): string {
  return symbol.replace(".", "-");
}

/** Reads monthly dividend-adjusted closes from a Yahoo chart response, oldest first. */
export function parseYahooChart(body: unknown): PricePoint[] {
  const { chart } = body as ChartBody;
  const result = chart?.result?.[0];
  if (!result) throw new Error(chart?.error?.description ?? "no data returned");

  const times = result.timestamp ?? [];
  const closes = result.indicators?.adjclose?.[0]?.adjclose ?? [];
  const byMonth = new Map<string, number>();
  times.forEach((time, index) => {
    const close = closes[index];
    if (typeof close === "number" && Number.isFinite(close) && close > 0) {
      byMonth.set(new Date(time * 1000).toISOString().slice(0, 7), close);
    }
  });

  const points = [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, close]) => ({ date, close: Math.round(close * 10_000) / 10_000 }));
  return unbrokenTail(points);
}

function monthIndex(date: string): number {
  const [year = 0, month = 1] = date.split("-").map(Number);
  return year * 12 + month;
}

/** Drops anything before the last missing month, because the finance math assumes monthly steps. */
export function unbrokenTail(points: readonly PricePoint[]): PricePoint[] {
  let start = 0;
  for (let i = 1; i < points.length; i++) {
    if (monthIndex(points[i]!.date) - monthIndex(points[i - 1]!.date) !== 1) start = i;
  }
  return points.slice(start);
}
