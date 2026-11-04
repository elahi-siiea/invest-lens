import { readFile } from "node:fs/promises";
import { TtlCache } from "./cache";
import { parseSnapshot, SNAPSHOT_PATH, type Snapshot } from "./snapshot-format";
import { DataError, type PriceSeries } from "./types";

const cache = new TtlCache<Snapshot | null>(1);
const CACHE_MS = 60_000;

/** The downloaded history, or null when it has not been downloaded. */
export function readSnapshot(): Promise<Snapshot | null> {
  return cache.get("snapshot", CACHE_MS, async () => {
    try {
      return parseSnapshot(JSON.parse(await readFile(SNAPSHOT_PATH, "utf8")));
    } catch {
      return null;
    }
  });
}

export function snapshotSeries(snapshot: Snapshot, symbol: string): PriceSeries {
  const points = snapshot.series[symbol];
  if (!points) {
    throw new DataError(
      "INVALID_TICKER",
      `"${symbol}" is not in the downloaded history. Add it with: npm run data:fetch -- ${symbol}`,
      symbol,
    );
  }
  return { symbol, points };
}
