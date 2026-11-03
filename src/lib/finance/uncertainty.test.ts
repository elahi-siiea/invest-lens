import { describe, expect, it } from "vitest";
import { simulateGrowth } from "./growth";
import type { SimulationInput } from "./types";
import { simulateRange } from "./uncertainty";

const input: SimulationInput = {
  startingAmount: 10_000,
  monthlyContribution: 300,
  years: 20,
  annualReturn: 0.06,
  inflation: 0.025,
  annualFee: 0.005,
};

describe("simulateRange", () => {
  it("starts every percentile at the starting amount", () => {
    expect(simulateRange(input, 0.15)[0]).toEqual({ year: 0, low: 10_000, median: 10_000, high: 10_000 });
  });

  it("returns one point per year", () => {
    expect(simulateRange(input, 0.15)).toHaveLength(21);
  });

  it("matches the deterministic projection when volatility is zero", () => {
    const range = simulateRange(input, 0, 50);
    const expected = simulateGrowth(input);
    range.forEach((point, index) => {
      expect(point.low).toBeCloseTo(expected[index]?.nominal ?? 0, 6);
      expect(point.high).toBeCloseTo(expected[index]?.nominal ?? 0, 6);
    });
  });

  it("orders the percentiles and brackets the average projection", () => {
    const last = simulateRange(input, 0.15).at(-1);
    const average = simulateGrowth(input).at(-1)?.nominal ?? 0;
    expect(last?.low).toBeLessThan(last?.median ?? 0);
    expect(last?.median).toBeLessThan(last?.high ?? 0);
    expect(last?.low).toBeLessThan(average);
    expect(last?.high).toBeGreaterThan(average);
  });

  it("widens as volatility rises", () => {
    const calm = simulateRange(input, 0.06).at(-1);
    const wild = simulateRange(input, 0.2).at(-1);
    expect((wild?.high ?? 0) - (wild?.low ?? 0)).toBeGreaterThan((calm?.high ?? 0) - (calm?.low ?? 0));
  });

  it("gives identical results for the same seed", () => {
    expect(simulateRange(input, 0.15, 200, 3)).toEqual(simulateRange(input, 0.15, 200, 3));
  });
});
