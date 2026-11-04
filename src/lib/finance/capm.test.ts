import { describe, expect, it } from "vitest";
import { analyzeCapm, capmExpectedReturn, covariance } from "./capm";
import type { PricePoint } from "./types";

/** Builds a month-end price series from a list of monthly returns. */
function series(returns: readonly number[], start = 100): PricePoint[] {
  const points: PricePoint[] = [{ date: "2020-01", close: start }];
  let close = start;
  returns.forEach((r, i) => {
    close *= 1 + r;
    const month = (i + 1) % 12;
    const year = 2020 + Math.floor((i + 1) / 12);
    points.push({ date: `${year}-${String(month + 1).padStart(2, "0")}`, close });
  });
  return points;
}

const marketReturns = [0.02, -0.03, 0.04, 0.01, -0.02, 0.03, 0.05, -0.04, 0.02, 0.01, -0.01, 0.03, 0.02, -0.02];

describe("covariance", () => {
  it("uses the sample formula", () => {
    expect(covariance([1, 2, 3, 4], [2, 4, 6, 8])).toBeCloseTo(3.3333, 4);
  });

  it("is the variance when both series are the same", () => {
    expect(covariance([2, 4, 4, 4, 5, 5, 7, 9], [2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(4.5714, 4);
  });

  it("rejects mismatched or short input", () => {
    expect(() => covariance([1, 2], [1])).toThrow(RangeError);
    expect(() => covariance([1], [1])).toThrow(RangeError);
  });
});

describe("capmExpectedReturn", () => {
  it("is the risk-free rate plus beta times the market premium", () => {
    expect(capmExpectedReturn(0.03, 1.5, 0.1)).toBeCloseTo(0.135);
  });

  it("equals the market return when beta is one", () => {
    expect(capmExpectedReturn(0.03, 1, 0.1)).toBeCloseTo(0.1);
  });

  it("equals the risk-free rate when beta is zero", () => {
    expect(capmExpectedReturn(0.03, 0, 0.1)).toBeCloseTo(0.03);
  });
});

describe("analyzeCapm", () => {
  const market = series(marketReturns);

  it("gives the market a beta of one, an R squared of one and zero alpha", () => {
    const result = analyzeCapm(market, market, 0.03);
    expect(result.beta).toBeCloseTo(1, 10);
    expect(result.rSquared).toBeCloseTo(1, 10);
    expect(result.alpha).toBeCloseTo(0, 10);
  });

  it("finds a beta of two for an asset that doubles every market move", () => {
    const doubled = series(marketReturns.map((r) => 2 * r));
    const result = analyzeCapm(doubled, market, 0);
    expect(result.beta).toBeCloseTo(2, 10);
    expect(result.rSquared).toBeCloseTo(1, 10);
  });

  it("keeps beta the same whatever the risk-free rate", () => {
    const doubled = series(marketReturns.map((r) => 2 * r));
    expect(analyzeCapm(doubled, market, 0.05).beta).toBeCloseTo(2, 2);
  });

  it("gives an asset with no link to the market a low R squared", () => {
    const unrelated = series([0.01, 0.01, -0.01, 0.02, -0.02, 0.01, 0.0, 0.02, -0.01, 0.01, 0.02, -0.02, 0.01, 0.0]);
    expect(analyzeCapm(unrelated, market, 0.03).rSquared).toBeLessThan(0.3);
  });

  it("reports alpha as actual return minus the CAPM expectation", () => {
    const asset = series(marketReturns.map((r) => 1.2 * r + 0.004));
    const result = analyzeCapm(asset, market, 0.03);
    expect(result.alpha).toBeCloseTo(result.actualReturn - result.expectedReturn, 12);
    expect(result.alpha).toBeGreaterThan(0);
  });

  it("rejects series that cover different months", () => {
    expect(() => analyzeCapm(market.slice(1), market, 0.03)).toThrow(RangeError);
  });
});
