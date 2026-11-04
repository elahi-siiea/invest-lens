import { describe, expect, it } from "vitest";
import { getSampleSeries } from "@/lib/data/sample";
import { buildComparison, shiftMonths, STARTING_AMOUNT } from "./build";

function sample(symbol: string) {
  const series = getSampleSeries(symbol);
  if (!series) throw new Error(`missing sample ${symbol}`);
  return series;
}

describe("shiftMonths", () => {
  it("moves across year boundaries", () => {
    expect(shiftMonths("2024-03", -12)).toBe("2023-03");
    expect(shiftMonths("2024-01", -1)).toBe("2023-12");
    expect(shiftMonths("2024-12", 1)).toBe("2025-01");
  });
});

const RF = 0.03;

describe("buildComparison", () => {
  const all = ["VTI", "QQQ", "SPY"].map(sample);

  it("starts every line at $10,000", () => {
    const result = buildComparison(all, ["VTI", "QQQ"], "5Y", RF);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const first = result.comparison.chart[0];
    expect(first?.VTI).toBeCloseTo(STARTING_AMOUNT);
    expect(first?.QQQ).toBeCloseTo(STARTING_AMOUNT);
    expect(first?.SPY).toBeCloseTo(STARTING_AMOUNT);
  });

  it("adds the S&P 500 benchmark when it was not chosen", () => {
    const result = buildComparison(all, ["VTI", "QQQ"], "5Y", RF);
    if (!result.ok) throw new Error(result.message);
    const benchmark = result.comparison.lines.find((line) => line.isBenchmark);
    expect(benchmark?.label).toBe("S&P 500 (SPY)");
    expect(result.comparison.lines).toHaveLength(3);
  });

  it("does not duplicate SPY when it was chosen", () => {
    const result = buildComparison(all, ["SPY", "QQQ"], "5Y", RF);
    if (!result.ok) throw new Error(result.message);
    expect(result.comparison.lines.map((line) => line.key)).toEqual(["SPY", "QQQ"]);
    expect(result.comparison.lines[0]?.isBenchmark).toBe(true);
  });

  it("covers the requested number of years", () => {
    const result = buildComparison(all, ["VTI", "QQQ"], "5Y", RF);
    if (!result.ok) throw new Error(result.message);
    expect(result.comparison.chart).toHaveLength(61);
    expect(result.comparison.shortHistory).toBeNull();
  });

  it("reports when the shortest history limits the range", () => {
    const young = { symbol: "NEW", points: sample("VTI").points.slice(-30) };
    const result = buildComparison([...all, young], ["NEW", "QQQ"], "10Y", RF);
    if (!result.ok) throw new Error(result.message);
    expect(result.comparison.shortHistory?.symbol).toBe("NEW");
    expect(result.comparison.chart).toHaveLength(30);
  });

  it("uses the longest shared history for Max", () => {
    const result = buildComparison(all, ["VTI", "QQQ"], "MAX", RF);
    if (!result.ok) throw new Error(result.message);
    expect(result.comparison.start).toBe("2001-06");
  });

  it("fails clearly when a series is missing", () => {
    const result = buildComparison(all, ["VTI", "ZZZ"], "5Y", RF);
    expect(result).toEqual({ ok: false, message: expect.stringContaining("ZZZ") });
  });

  it("runs CAPM against the benchmark", () => {
    const result = buildComparison(all, ["VTI", "QQQ"], "5Y", RF);
    if (!result.ok) throw new Error(result.message);
    const benchmark = result.comparison.lines.find((line) => line.isBenchmark);
    const qqq = result.comparison.lines.find((line) => line.key === "QQQ");
    expect(benchmark?.capm.beta).toBeCloseTo(1, 10);
    expect(benchmark?.capm.alpha).toBeCloseTo(0, 10);
    expect(qqq?.capm.beta).toBeGreaterThan(1);
    expect(qqq?.sharpe).toBeCloseTo(((qqq?.summary.annualizedReturn ?? 0) - RF) / (qqq?.summary.volatility ?? 1), 10);
  });
});
