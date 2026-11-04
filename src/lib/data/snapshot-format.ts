import path from "node:path";
import type { PricePoint } from "@/lib/finance";

export const SNAPSHOT_PATH = path.join(process.cwd(), "data", "history.json");

export interface Snapshot {
  /** Date the history was downloaded, `YYYY-MM-DD`. */
  fetchedAt: string;
  source: string;
  series: Record<string, PricePoint[]>;
}

function isPoint(value: unknown): value is [string, number] {
  return Array.isArray(value) && typeof value[0] === "string" && typeof value[1] === "number" && value[1] > 0;
}

/** Validates the file written by `npm run data:fetch`. Returns null for anything unexpected. */
export function parseSnapshot(raw: unknown): Snapshot | null {
  if (typeof raw !== "object" || raw === null) return null;
  const { fetchedAt, source, series } = raw as Record<string, unknown>;
  if (typeof fetchedAt !== "string" || typeof source !== "string") return null;
  if (typeof series !== "object" || series === null) return null;

  const parsed: Record<string, PricePoint[]> = {};
  for (const [symbol, rows] of Object.entries(series)) {
    if (!Array.isArray(rows) || !rows.every(isPoint)) return null;
    parsed[symbol] = rows.map(([date, close]) => ({ date, close }));
  }
  return { fetchedAt, source, series: parsed };
}
