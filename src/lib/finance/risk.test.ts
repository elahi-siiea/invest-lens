import { describe, expect, it } from "vitest";
import { annualizedVolatility, maxDrawdown, standardDeviation } from "./risk";

describe("standardDeviation", () => {
  it("uses the sample formula", () => {
    expect(standardDeviation([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.13809, 4);
  });

  it("is zero for identical values", () => {
    expect(standardDeviation([0.01, 0.01, 0.01])).toBe(0);
  });

  it("needs at least two values", () => {
    expect(() => standardDeviation([1])).toThrow(RangeError);
  });
});

describe("annualizedVolatility", () => {
  it("scales monthly deviation by the square root of twelve", () => {
    expect(annualizedVolatility([0.1, -0.1], 12)).toBeCloseTo(0.141421 * Math.sqrt(12), 5);
  });
});

describe("maxDrawdown", () => {
  it("measures the deepest fall from a prior peak", () => {
    expect(maxDrawdown([100, 120, 60, 90])).toBeCloseTo(-0.5);
  });

  it("is zero when the series only rises", () => {
    expect(maxDrawdown([100, 101, 130])).toBe(0);
  });

  it("uses the deepest fall, not the latest", () => {
    expect(maxDrawdown([100, 50, 200, 180])).toBeCloseTo(-0.5);
  });

  it("rejects non-positive values", () => {
    expect(() => maxDrawdown([100, -5])).toThrow(RangeError);
  });
});
