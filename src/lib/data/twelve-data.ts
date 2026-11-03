import type { PricePoint } from "@/lib/finance";
import { DataError, type PriceSeries } from "./types";

const ENDPOINT = "https://api.twelvedata.com/time_series";
const REQUEST_TIMEOUT_MS = 8_000;
const MIN_POINTS = 13;

interface TwelveDataBody {
  status?: string;
  code?: number;
  message?: string;
  values?: { datetime: string; close: string }[];
}

function toError(code: number | undefined, message: string | undefined, symbol: string): DataError {
  switch (code) {
    case 400:
    case 404:
      return new DataError("INVALID_TICKER", `"${symbol}" was not found.`, symbol);
    case 401:
      return new DataError("UPSTREAM", "The data provider rejected the API key.");
    case 403:
      return new DataError("PLAN_LIMIT", `"${symbol}" is not available on the current data plan.`, symbol);
    case 429:
      return new DataError("RATE_LIMIT", "The data provider's request limit was reached.");
    default:
      return new DataError("UPSTREAM", message ?? "The data provider returned an error.");
  }
}

/** Keeps the last observation of each month, oldest first. */
function toMonthlyPoints(values: { datetime: string; close: string }[]): PricePoint[] {
  const byMonth = new Map<string, number>();
  for (const { datetime, close } of values) {
    const value = Number(close);
    if (Number.isFinite(value) && value > 0) byMonth.set(datetime.slice(0, 7), value);
  }
  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, close]) => ({ date, close }));
}

/** Monthly closes adjusted for splits and dividends, oldest first. */
export async function fetchMonthlySeries(symbol: string, apiKey: string): Promise<PriceSeries> {
  const params = new URLSearchParams({
    symbol,
    interval: "1month",
    outputsize: "5000",
    order: "asc",
    adjust: "all",
    apikey: apiKey,
  });

  let response: Response;
  try {
    response = await fetch(`${ENDPOINT}?${params}`, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch {
    throw new DataError("NETWORK", "Could not reach the data provider.");
  }

  let body: TwelveDataBody;
  try {
    body = (await response.json()) as TwelveDataBody;
  } catch {
    throw new DataError("UPSTREAM", "The data provider sent an unreadable response.");
  }

  if (body.status === "error" || !response.ok) {
    throw toError(body.code ?? response.status, body.message, symbol);
  }

  const points = toMonthlyPoints(body.values ?? []);
  if (points.length < MIN_POINTS) {
    throw new DataError("NOT_ENOUGH_DATA", `"${symbol}" does not have enough price history.`, symbol);
  }
  return { symbol, points };
}
