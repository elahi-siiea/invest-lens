import { BENCHMARK_SYMBOL } from "@/lib/data/tickers";
import type { PriceSeries } from "@/lib/data/types";
import { growthOf, MONTHS_PER_YEAR, summarizeSeries, type PricePoint, type SeriesSummary } from "@/lib/finance";

export const RANGES = [
  { id: "1Y", label: "1Y", years: 1 },
  { id: "5Y", label: "5Y", years: 5 },
  { id: "10Y", label: "10Y", years: 10 },
  { id: "MAX", label: "Max", years: null },
] as const;

export type RangeId = (typeof RANGES)[number]["id"];

export const STARTING_AMOUNT = 10_000;

export interface ComparisonLine {
  key: string;
  label: string;
  isBenchmark: boolean;
  summary: SeriesSummary;
}

export interface Comparison {
  start: string;
  end: string;
  lines: ComparisonLine[];
  /** One row per month: `date` plus the value of $10,000 for each line key. */
  chart: Record<string, number | string>[];
  /** Set when a ticker's history is shorter than the chosen range. */
  shortHistory: { symbol: string; start: string } | null;
}

export type ComparisonResult = { ok: true; comparison: Comparison } | { ok: false; message: string };

export function shiftMonths(yearMonth: string, months: number): string {
  const [year = 0, month = 1] = yearMonth.split("-").map(Number);
  const index = year * MONTHS_PER_YEAR + (month - 1) + months;
  const nextYear = Math.floor(index / MONTHS_PER_YEAR);
  return `${nextYear}-${String((index % MONTHS_PER_YEAR) + 1).padStart(2, "0")}`;
}

function monthOf(point: PricePoint): string {
  return point.date.slice(0, 7);
}

/**
 * Lines up the chosen tickers (and the S&P 500 benchmark) on one shared
 * window. The window ends at the earliest last month, and starts at the
 * latest first month, or at the range length if that is later.
 */
export function buildComparison(series: readonly PriceSeries[], tickers: readonly string[], range: RangeId): ComparisonResult {
  const bySymbol = new Map(series.map((entry) => [entry.symbol, entry.points]));
  const keys = tickers.includes(BENCHMARK_SYMBOL) ? [...tickers] : [...tickers, BENCHMARK_SYMBOL];

  const loaded: { key: string; points: readonly PricePoint[] }[] = [];
  for (const key of keys) {
    const points = bySymbol.get(key);
    if (!points || points.length === 0) return { ok: false, message: `No price data came back for ${key}.` };
    loaded.push({ key, points });
  }

  const ends = loaded.map(({ points }) => monthOf(points[points.length - 1]!));
  const end = ends.reduce((a, b) => (a < b ? a : b));
  const firsts = loaded.map(({ key, points }) => ({ key, start: monthOf(points[0]!) }));
  const latestFirst = firsts.reduce((a, b) => (a.start > b.start ? a : b));

  const years = RANGES.find((entry) => entry.id === range)?.years ?? null;
  const windowStart = years === null ? latestFirst.start : shiftMonths(end, -years * MONTHS_PER_YEAR);
  const start = windowStart > latestFirst.start ? windowStart : latestFirst.start;
  const shortHistory = start > windowStart && years !== null ? { symbol: latestFirst.key, start } : null;

  const windowed = loaded.map(({ key, points }) => ({
    key,
    points: points.filter((point) => monthOf(point) >= start && monthOf(point) <= end),
  }));
  if (windowed.some(({ points }) => points.length < 3)) {
    return { ok: false, message: "These tickers do not share enough overlapping history for this range." };
  }

  const months = windowed[0]!.points.map(monthOf);
  const lines: ComparisonLine[] = windowed.map(({ key, points }) => ({
    key,
    label: key === BENCHMARK_SYMBOL && !tickers.includes(key) ? "S&P 500 (SPY)" : key,
    isBenchmark: key === BENCHMARK_SYMBOL,
    summary: summarizeSeries(points),
  }));

  const growth = new Map(
    windowed.map(({ key, points }) => [key, new Map(growthOf(STARTING_AMOUNT, points.map((p) => p.close)).map((value, i) => [monthOf(points[i]!), value]))]),
  );
  const chart = months.map((date) => {
    const row: Record<string, number | string> = { date };
    for (const { key } of windowed) {
      const value = growth.get(key)?.get(date);
      if (value !== undefined) row[key] = value;
    }
    return row;
  });

  return { ok: true, comparison: { start: months[0]!, end: months[months.length - 1]!, lines, chart, shortHistory } };
}
