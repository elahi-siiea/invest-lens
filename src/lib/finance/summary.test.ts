import { describe, expect, it } from "vitest";
import { summarizeSeries } from "./summary";

const points = [
  { date: "2019-12", close: 100 },
  { date: "2020-06", close: 80 },
  { date: "2020-12", close: 120 },
  { date: "2021-06", close: 130 },
  { date: "2021-12", close: 108 },
];

describe("summarizeSeries", () => {
  const summary = summarizeSeries(points);

  it("computes total and annualized return", () => {
    expect(summary.totalReturn).toBeCloseTo(0.08);
    expect(summary.annualizedReturn).toBeCloseTo(1.08 ** 0.5 - 1, 10);
  });

  it("finds the deepest drawdown", () => {
    expect(summary.maxDrawdown).toBeCloseTo(-0.2);
  });

  it("picks the best and worst full calendar years", () => {
    expect(summary.bestYear).toEqual({ year: 2020, return: expect.closeTo(0.2) });
    expect(summary.worstYear).toEqual({ year: 2021, return: expect.closeTo(-0.1) });
  });

  it("reports positive volatility for a moving series", () => {
    expect(summary.volatility).toBeGreaterThan(0);
  });

  it("returns null years when no full year is available", () => {
    const short = summarizeSeries(points.slice(1, 4));
    expect(short.bestYear).toBeNull();
    expect(short.worstYear).toBeNull();
  });

  it("needs at least three points", () => {
    expect(() => summarizeSeries(points.slice(0, 2))).toThrow(RangeError);
  });
});
