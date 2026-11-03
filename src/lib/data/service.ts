import { TtlCache } from "./cache";
import { getSampleSeries, SAMPLE_SYMBOLS } from "./sample";
import { fetchMonthlySeries } from "./twelve-data";
import { DataError, type DataSource, type PriceSeries, type PricesResponse } from "./types";

const SERIES_TTL_MS = 12 * 60 * 60 * 1000;
const INVALID_TICKER_TTL_MS = 60 * 60 * 1000;

const seriesCache = new TtlCache<PriceSeries>();
/** Remembers unknown tickers so repeated typos do not use up the daily request limit. */
const knownInvalid = new Map<string, number>();

function sampleSeries(symbol: string): PriceSeries {
  const series = getSampleSeries(symbol);
  if (!series) {
    throw new DataError(
      "INVALID_TICKER",
      `"${symbol}" is not in the sample data. Try one of: ${SAMPLE_SYMBOLS.join(", ")}.`,
      symbol,
    );
  }
  return series;
}

async function liveSeries(symbol: string, apiKey: string): Promise<PriceSeries> {
  if ((knownInvalid.get(symbol) ?? 0) > Date.now()) {
    throw new DataError("INVALID_TICKER", `"${symbol}" was not found.`, symbol);
  }
  try {
    return await seriesCache.get(symbol, SERIES_TTL_MS, () => fetchMonthlySeries(symbol, apiKey));
  } catch (error) {
    if (error instanceof DataError && error.code === "INVALID_TICKER") {
      knownInvalid.set(symbol, Date.now() + INVALID_TICKER_TTL_MS);
    }
    throw error;
  }
}

export async function loadPrices(symbols: readonly string[], forceSample: boolean): Promise<PricesResponse> {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  const source: DataSource = apiKey && !forceSample ? "live" : "sample";

  const series =
    source === "live" && apiKey
      ? await Promise.all(symbols.map((symbol) => liveSeries(symbol, apiKey)))
      : symbols.map(sampleSeries);

  return { source, series };
}
