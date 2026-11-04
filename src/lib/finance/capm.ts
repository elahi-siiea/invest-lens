import { monthlyRate } from "./growth";
import { annualizedReturn, periodicReturns, totalReturn, yearsBetween } from "./returns";
import type { CapmResult, PricePoint } from "./types";

/** Sample covariance (n - 1 in the denominator). */
export function covariance(a: readonly number[], b: readonly number[]): number {
  if (a.length !== b.length || a.length < 2) throw new RangeError("need two equal-length series of at least two values");
  const meanA = a.reduce((sum, value) => sum + value, 0) / a.length;
  const meanB = b.reduce((sum, value) => sum + value, 0) / b.length;
  let total = 0;
  for (let i = 0; i < a.length; i++) total += ((a[i] ?? 0) - meanA) * ((b[i] ?? 0) - meanB);
  return total / (a.length - 1);
}

/** CAPM: the return an investment with this beta should earn, `rf + beta × (market − rf)`. */
export function capmExpectedReturn(riskFree: number, beta: number, marketReturn: number): number {
  return riskFree + beta * (marketReturn - riskFree);
}

/** Return above the risk-free rate, per unit of volatility. */
export function sharpeRatio(annualReturn: number, riskFree: number, annualVolatility: number): number {
  if (!(annualVolatility > 0)) throw new RangeError("volatility must be positive");
  return (annualReturn - riskFree) / annualVolatility;
}

function annualized(points: readonly PricePoint[]): number {
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) throw new RangeError("series is empty");
  return annualizedReturn(totalReturn(first.close, last.close), yearsBetween(first.date, last.date));
}

/**
 * Regresses the asset's monthly excess returns on the market's. The slope is
 * beta and the squared correlation is R squared. Alpha is Jensen's alpha:
 * the annualized return actually earned minus what CAPM expected.
 * Both series must cover the same months.
 */
export function analyzeCapm(
  asset: readonly PricePoint[],
  market: readonly PricePoint[],
  riskFreeAnnual: number,
): CapmResult {
  if (asset.length !== market.length || asset.some((point, i) => point.date !== market[i]?.date)) {
    throw new RangeError("asset and market must cover the same months");
  }

  const monthlyRiskFree = monthlyRate(riskFreeAnnual);
  const assetExcess = periodicReturns(asset.map((point) => point.close)).map((r) => r - monthlyRiskFree);
  const marketExcess = periodicReturns(market.map((point) => point.close)).map((r) => r - monthlyRiskFree);

  const crossCovariance = covariance(marketExcess, assetExcess);
  const marketVariance = covariance(marketExcess, marketExcess);
  const assetVariance = covariance(assetExcess, assetExcess);
  if (marketVariance === 0) throw new RangeError("market returns do not vary");

  const beta = crossCovariance / marketVariance;
  const marketReturn = annualized(market);
  const actualReturn = annualized(asset);
  const expectedReturn = capmExpectedReturn(riskFreeAnnual, beta, marketReturn);

  return {
    beta,
    rSquared: assetVariance === 0 ? 0 : crossCovariance ** 2 / (marketVariance * assetVariance),
    expectedReturn,
    actualReturn,
    alpha: actualReturn - expectedReturn,
    marketReturn,
  };
}
