import { RANGES, type RangeId } from "@/lib/compare/build";
import { MAX_TICKERS, normalizeSymbol } from "@/lib/data/tickers";

export interface CompareSettings {
  tickers: string[];
  range: RangeId;
  /** True when the visitor chose sample data after a live-data problem. */
  sample: boolean;
}

export const COMPARE_STORAGE_KEY = "invest-lens:compare:v1";

export const DEFAULT_COMPARE: CompareSettings = { tickers: [], range: "5Y", sample: false };

export const EXAMPLE: CompareSettings = { tickers: ["VTI", "QQQ", "AAPL"], range: "10Y", sample: false };

export function parseCompareSettings(raw: unknown): CompareSettings | null {
  if (typeof raw !== "object" || raw === null) return null;
  const { tickers, range, sample } = raw as Record<string, unknown>;
  if (!Array.isArray(tickers) || tickers.length > MAX_TICKERS) return null;
  if (!tickers.every((ticker) => typeof ticker === "string" && normalizeSymbol(ticker) === ticker)) return null;
  if (!RANGES.some((entry) => entry.id === range) || typeof sample !== "boolean") return null;
  return { tickers: tickers as string[], range: range as RangeId, sample };
}
