import { DataError, type ApiErrorBody, type PricesResponse } from "./types";

/** Loads prices from the app's own server route. Throws a DataError on any failure. */
export async function fetchPrices(symbols: readonly string[], sample: boolean, signal: AbortSignal): Promise<PricesResponse> {
  const params = new URLSearchParams({ symbols: symbols.join(",") });
  if (sample) params.set("source", "sample");

  let response: Response;
  try {
    response = await fetch(`/api/prices?${params}`, { signal });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new DataError("OFFLINE", "The app could not reach the server.");
  }

  if (response.ok) return (await response.json()) as PricesResponse;

  try {
    const { error } = (await response.json()) as ApiErrorBody;
    throw new DataError(error.code, error.message, error.symbol, error.source);
  } catch (error) {
    if (error instanceof DataError) throw error;
    throw new DataError("UPSTREAM", "The server sent an unexpected response.");
  }
}
