import type { PricePoint } from "@/lib/finance";
import { gaussian, seeded } from "@/lib/random";
import type { PriceSeries } from "./types";

/**
 * Illustrative sample data. These are NOT real prices: each series is
 * generated from a seeded random walk that shares one market factor, so the
 * series move together the way related funds do. The same output is produced
 * every time, which keeps the demo stable and the tests exact.
 */

const FIRST_MONTH = { year: 1990, month: 1 };
const LAST_MONTH = { year: 2025, month: 12 };

const MARKET_ANNUAL_DRIFT = 0.07;
const MARKET_MONTHLY_VOL = 0.042;

/** Months with extra negative pressure so drawdowns show up in the sample. */
const STRESS_PERIODS: readonly { from: string; to: string; shift: number }[] = [
  { from: "2000-09", to: "2002-09", shift: -0.012 },
  { from: "2007-11", to: "2009-02", shift: -0.025 },
  { from: "2020-02", to: "2020-03", shift: -0.09 },
  { from: "2022-01", to: "2022-09", shift: -0.015 },
];

interface Profile {
  start: string;
  beta: number;
  drift: number;
  noise: number;
}

const PROFILES: Record<string, Profile> = {
  SPY: { start: "1993-02", beta: 1, drift: MARKET_ANNUAL_DRIFT, noise: 0 },
  VOO: { start: "2010-10", beta: 1, drift: 0.07, noise: 0.002 },
  VTI: { start: "2001-06", beta: 1.02, drift: 0.071, noise: 0.004 },
  QQQ: { start: "1999-03", beta: 1.25, drift: 0.09, noise: 0.016 },
  IWM: { start: "2000-05", beta: 1.15, drift: 0.06, noise: 0.025 },
  VXUS: { start: "2011-02", beta: 0.85, drift: 0.05, noise: 0.02 },
  BND: { start: "2007-04", beta: 0.05, drift: 0.035, noise: 0.012 },
  SCHD: { start: "2011-10", beta: 0.85, drift: 0.075, noise: 0.02 },
  VNQ: { start: "2004-09", beta: 1.05, drift: 0.075, noise: 0.04 },
  GLD: { start: "2004-11", beta: 0.05, drift: 0.085, noise: 0.045 },
  AAPL: { start: "1990-01", beta: 1.2, drift: 0.12, noise: 0.07 },
  MSFT: { start: "1990-01", beta: 1.1, drift: 0.10, noise: 0.055 },
  AMZN: { start: "1997-06", beta: 1.3, drift: 0.11, noise: 0.09 },
  GOOGL: { start: "2004-09", beta: 1.1, drift: 0.095, noise: 0.06 },
  NVDA: { start: "1999-02", beta: 1.6, drift: 0.14, noise: 0.11 },
  TSLA: { start: "2010-07", beta: 1.7, drift: 0.12, noise: 0.11 },
};

export const SAMPLE_SYMBOLS: readonly string[] = Object.keys(PROFILES);

function hash(text: string): number {
  let value = 2166136261;
  for (const char of text) value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  return value >>> 0;
}

function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function allMonths(): string[] {
  const months: string[] = [];
  for (let year = FIRST_MONTH.year; year <= LAST_MONTH.year; year++) {
    for (let month = 1; month <= 12; month++) months.push(monthKey(year, month));
  }
  return months;
}

let marketCache: Map<string, number> | undefined;

function marketReturns(): Map<string, number> {
  if (marketCache) return marketCache;
  const random = seeded(20_240_101);
  const returns = new Map<string, number>();
  for (const month of allMonths()) {
    const stress = STRESS_PERIODS.find((period) => month >= period.from && month <= period.to);
    returns.set(month, MARKET_ANNUAL_DRIFT / 12 + MARKET_MONTHLY_VOL * gaussian(random) + (stress?.shift ?? 0));
  }
  marketCache = returns;
  return returns;
}

/** Returns an illustrative series, or null when the symbol is not in the sample set. */
export function getSampleSeries(symbol: string): PriceSeries | null {
  const profile = PROFILES[symbol];
  if (!profile) return null;

  const random = seeded(hash(symbol));
  const market = marketReturns();
  const points: PricePoint[] = [];
  let close = 100;

  for (const month of allMonths()) {
    if (month < profile.start) continue;
    if (points.length > 0) {
      const m = market.get(month) ?? 0;
      const variance = (profile.beta * MARKET_MONTHLY_VOL) ** 2 + profile.noise ** 2;
      // The variance term offsets volatility drag, so `drift` is roughly the long-run growth rate.
      const own = (profile.drift - profile.beta * MARKET_ANNUAL_DRIFT) / 12 + variance / 2;
      const change = profile.beta * m + own + profile.noise * gaussian(random);
      close *= 1 + Math.max(change, -0.6);
    }
    points.push({ date: month, close });
  }
  return { symbol, points };
}
