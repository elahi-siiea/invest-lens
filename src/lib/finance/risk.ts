/** Sample standard deviation (n - 1 in the denominator). */
export function standardDeviation(values: readonly number[]): number {
  if (values.length < 2) throw new RangeError("at least two values are required");
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const squares = values.reduce((sum, value) => sum + (value - mean) ** 2, 0);
  return Math.sqrt(squares / (values.length - 1));
}

export function annualizedVolatility(returns: readonly number[], periodsPerYear: number): number {
  return standardDeviation(returns) * Math.sqrt(periodsPerYear);
}

/** Largest peak-to-trough fall, as a value between -1 and 0. */
export function maxDrawdown(values: readonly number[]): number {
  let peak = -Infinity;
  let worst = 0;
  for (const value of values) {
    if (!(value > 0)) throw new RangeError("values must be positive numbers");
    peak = Math.max(peak, value);
    worst = Math.min(worst, value / peak - 1);
  }
  return worst;
}
