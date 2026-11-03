import { activeSource, loadPrices } from "@/lib/data/service";
import { MAX_TICKERS, normalizeSymbol } from "@/lib/data/tickers";
import { DataError, type ApiErrorBody, type DataErrorCode, type DataSource } from "@/lib/data/types";

const STATUS: Record<DataErrorCode, number> = {
  INVALID_TICKER: 404,
  NOT_ENOUGH_DATA: 422,
  PLAN_LIMIT: 422,
  RATE_LIMIT: 429,
  NETWORK: 502,
  OFFLINE: 503,
  UPSTREAM: 502,
  BAD_REQUEST: 400,
};

function errorResponse(error: DataError, source?: DataSource): Response {
  const body: ApiErrorBody = { error: { code: error.code, message: error.message, symbol: error.symbol, source } };
  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (error.code === "RATE_LIMIT") headers["Retry-After"] = "60";
  return Response.json(body, { status: STATUS[error.code], headers });
}

/** GET /api/prices?symbols=VTI,SPY[&source=sample] */
export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const raw = (params.get("symbols") ?? "").split(",").filter(Boolean);
  const symbols = [...new Set(raw.map(normalizeSymbol))];

  if (symbols.length === 0 || symbols.length > MAX_TICKERS + 1 || symbols.includes(null)) {
    return errorResponse(new DataError("BAD_REQUEST", "Provide between 1 and 6 valid ticker symbols."));
  }

  const forceSample = params.get("source") === "sample";
  try {
    const data = await loadPrices(symbols as string[], forceSample);
    return Response.json(data, {
      headers: { "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (error) {
    if (error instanceof DataError) return errorResponse(error, activeSource(forceSample));
    return errorResponse(new DataError("UPSTREAM", "Something went wrong while loading prices."), activeSource(forceSample));
  }
}
