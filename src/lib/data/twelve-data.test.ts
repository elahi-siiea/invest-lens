import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchMonthlySeries } from "./twelve-data";
import { DataError } from "./types";

function mockFetch(body: unknown, status = 200) {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(body), { status })));
}

function monthly(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    datetime: `${2020 + Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, "0")}-01`,
    close: String(100 + i),
  }));
}

async function failure(promise: Promise<unknown>): Promise<DataError> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof DataError) return error;
  }
  throw new Error("expected a DataError");
}

afterEach(() => vi.unstubAllGlobals());

describe("fetchMonthlySeries", () => {
  it("returns month-keyed points, oldest first", async () => {
    mockFetch({ status: "ok", values: monthly(24) });
    const series = await fetchMonthlySeries("VTI", "key");
    expect(series.symbol).toBe("VTI");
    expect(series.points).toHaveLength(24);
    expect(series.points[0]).toEqual({ date: "2020-01", close: 100 });
  });

  it("sends the key and adjustment options to the provider", async () => {
    mockFetch({ status: "ok", values: monthly(24) });
    await fetchMonthlySeries("VTI", "secret-key");
    const url = String(vi.mocked(fetch).mock.calls[0]?.[0]);
    expect(url).toContain("interval=1month");
    expect(url).toContain("adjust=all");
    expect(url).toContain("apikey=secret-key");
  });

  it("maps a not-found error body to INVALID_TICKER", async () => {
    mockFetch({ status: "error", code: 404, message: "symbol not found" });
    const error = await failure(fetchMonthlySeries("ZZZZ", "key"));
    expect(error.code).toBe("INVALID_TICKER");
    expect(error.symbol).toBe("ZZZZ");
  });

  it("maps a 429 body to RATE_LIMIT even when the HTTP status is 200", async () => {
    mockFetch({ status: "error", code: 429, message: "limit" });
    expect((await failure(fetchMonthlySeries("VTI", "key"))).code).toBe("RATE_LIMIT");
  });

  it("maps a rejected key to UPSTREAM without echoing it", async () => {
    mockFetch({ status: "error", code: 401, message: "bad key" }, 401);
    const error = await failure(fetchMonthlySeries("VTI", "secret-key"));
    expect(error.code).toBe("UPSTREAM");
    expect(error.message).not.toContain("secret-key");
  });

  it("maps a network failure to NETWORK", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("offline"))));
    expect((await failure(fetchMonthlySeries("VTI", "key"))).code).toBe("NETWORK");
  });

  it("rejects a series with too little history", async () => {
    mockFetch({ status: "ok", values: monthly(6) });
    expect((await failure(fetchMonthlySeries("NEW", "key"))).code).toBe("NOT_ENOUGH_DATA");
  });

  it("ignores rows with invalid prices", async () => {
    mockFetch({ status: "ok", values: [...monthly(14), { datetime: "2022-01-01", close: "not a number" }] });
    expect((await fetchMonthlySeries("VTI", "key")).points).toHaveLength(14);
  });
});
