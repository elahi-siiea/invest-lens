import { describe, expect, it } from "vitest";
import { getSampleSeries, SAMPLE_SYMBOLS } from "./sample";
import { SUGGESTED_TICKERS } from "./tickers";

describe("sample data", () => {
  it("covers every suggested ticker", () => {
    for (const { symbol } of SUGGESTED_TICKERS) expect(SAMPLE_SYMBOLS).toContain(symbol);
  });

  it("returns identical output on every call", () => {
    expect(getSampleSeries("AAPL")).toEqual(getSampleSeries("AAPL"));
  });

  it("starts at 100 and keeps prices positive", () => {
    for (const symbol of SAMPLE_SYMBOLS) {
      const points = getSampleSeries(symbol)?.points ?? [];
      expect(points[0]?.close).toBe(100);
      expect(points.every((point) => point.close > 0)).toBe(true);
    }
  });

  it("ends in the same month for every ticker", () => {
    const ends = new Set(SAMPLE_SYMBOLS.map((symbol) => getSampleSeries(symbol)?.points.at(-1)?.date));
    expect(ends).toEqual(new Set(["2025-12"]));
  });

  it("returns null for an unknown symbol", () => {
    expect(getSampleSeries("ZZZZ")).toBeNull();
  });
});
