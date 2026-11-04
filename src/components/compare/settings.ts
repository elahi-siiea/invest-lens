import { RANGES, type RangeId } from "@/lib/compare/build";
import { MAX_TICKERS, normalizeSymbol } from "@/lib/data/tickers";

export interface CompareSettings {
  tickers: string[];
  range: RangeId;
  /** True when the visitor chose sample data after a live-data problem. */
  sample: boolean;
  /** Risk-free rate for CAPM, as a percent a year. */
  riskFreePct: number;
}

export const COMPARE_STORAGE_KEY = "invest-lens:compare:v1";

export const RISK_FREE_LIMITS = { min: 0, max: 10, step: 0.1 };

export const DEFAULT_COMPARE: CompareSettings = { tickers: [], range: "5Y", sample: false, riskFreePct: 3 };

export const EXAMPLE: CompareSettings = { tickers: ["VTI", "QQQ", "AAPL"], range: "10Y", sample: false, riskFreePct: 3 };

export function parseCompareSettings(raw: unknown): CompareSettings | null {
  if (typeof raw !== "object" || raw === null) return null;
  const { tickers, range, sample, riskFreePct } = raw as Record<string, unknown>;
  if (!Array.isArray(tickers) || tickers.length > MAX_TICKERS) return null;
  if (!tickers.every((ticker) => typeof ticker === "string" && normalizeSymbol(ticker) === ticker)) return null;
  if (!RANGES.some((entry) => entry.id === range) || typeof sample !== "boolean") return null;
  const rate =
    typeof riskFreePct === "number" && riskFreePct >= RISK_FREE_LIMITS.min && riskFreePct <= RISK_FREE_LIMITS.max
      ? riskFreePct
      : DEFAULT_COMPARE.riskFreePct;
  return { tickers: tickers as string[], range: range as RangeId, sample, riskFreePct: rate };
}
