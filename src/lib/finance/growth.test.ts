import { describe, expect, it } from "vitest";
import { costOfFees, finalBalance, monthlyRate, simulateGrowth } from "./growth";
import type { SimulationInput } from "./types";

const base: SimulationInput = {
  startingAmount: 10_000,
  monthlyContribution: 0,
  years: 10,
  annualReturn: 0.07,
  inflation: 0,
  annualFee: 0,
};

describe("monthlyRate", () => {
  it("compounds back to the annual rate over twelve months", () => {
    expect((1 + monthlyRate(0.07)) ** 12).toBeCloseTo(1.07, 10);
  });
});

describe("simulateGrowth", () => {
  it("matches the compound interest formula with no contributions", () => {
    expect(finalBalance(base)).toBeCloseTo(10_000 * 1.07 ** 10, 6);
  });

  it("matches the annuity formula with monthly contributions", () => {
    const input = { ...base, monthlyContribution: 500 };
    const m = monthlyRate(0.07);
    const n = 120;
    const expected = 10_000 * (1 + m) ** n + (500 * ((1 + m) ** n - 1)) / m;
    expect(finalBalance(input)).toBeCloseTo(expected, 6);
  });

  it("adds contributions in a straight line when the return is zero", () => {
    const input = { ...base, annualReturn: 0, monthlyContribution: 100, years: 5 };
    expect(finalBalance(input)).toBeCloseTo(10_000 + 100 * 60);
  });

  it("returns one point per year including year zero", () => {
    const points = simulateGrowth(base);
    expect(points).toHaveLength(11);
    expect(points[0]).toEqual({ year: 0, nominal: 10_000, real: 10_000, contributions: 10_000 });
  });

  it("tracks total contributions", () => {
    const points = simulateGrowth({ ...base, monthlyContribution: 200, years: 3 });
    expect(points.at(-1)?.contributions).toBe(10_000 + 200 * 36);
  });

  it("deflates the real value by inflation", () => {
    const points = simulateGrowth({ ...base, inflation: 0.03 });
    const last = points.at(-1);
    expect(last?.real).toBeCloseTo((last?.nominal ?? 0) / 1.03 ** 10, 6);
  });

  it("subtracts the fee from the annual return", () => {
    expect(finalBalance({ ...base, annualFee: 0.01 })).toBeCloseTo(10_000 * 1.06 ** 10, 6);
  });
});

describe("costOfFees", () => {
  it("reports the gap between the fee-free and fee-paying balance", () => {
    const impact = costOfFees({ ...base, annualFee: 0.01, monthlyContribution: 300 });
    expect(impact.withoutFee).toBeGreaterThan(impact.withFee);
    expect(impact.cost).toBeCloseTo(impact.withoutFee - impact.withFee);
    expect(impact.costShare).toBeCloseTo(impact.cost / impact.withoutFee);
  });

  it("is zero when the fee is zero", () => {
    expect(costOfFees(base).cost).toBe(0);
  });
});
