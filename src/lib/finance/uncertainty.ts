import { gaussian, seeded } from "@/lib/random";
import { monthlyRate } from "./growth";
import { MONTHS_PER_YEAR } from "./returns";
import type { RangePoint, SimulationInput } from "./types";

export const DEFAULT_PATHS = 1_000;
const DEFAULT_SEED = 7;
const LOW_QUANTILE = 0.1;
const HIGH_QUANTILE = 0.9;

function quantile(sorted: Float64Array, q: number): number {
  return sorted[Math.floor(q * (sorted.length - 1))] ?? 0;
}

/**
 * Simulates many possible paths and reports the 10th, 50th and 90th
 * percentile balance at each year end, so the middle 80% of outcomes.
 *
 * Each month's growth is lognormal. It is centred so that its average equals
 * the deterministic monthly rate, which means a volatility of zero reproduces
 * `simulateGrowth` exactly. A fixed seed keeps the band steady while the
 * user drags a slider.
 */
export function simulateRange(
  input: SimulationInput,
  annualVolatility: number,
  paths = DEFAULT_PATHS,
  seed = DEFAULT_SEED,
): RangePoint[] {
  const { startingAmount, monthlyContribution, years, annualReturn, annualFee } = input;
  const rate = monthlyRate(annualReturn - annualFee);
  const sigma = annualVolatility / Math.sqrt(MONTHS_PER_YEAR);
  const mu = Math.log(1 + rate) - (sigma * sigma) / 2;
  const random = seeded(seed);

  const balances = new Float64Array(paths).fill(startingAmount);
  const points: RangePoint[] = [{ year: 0, low: startingAmount, median: startingAmount, high: startingAmount }];

  for (let month = 1; month <= years * MONTHS_PER_YEAR; month++) {
    for (let path = 0; path < paths; path++) {
      balances[path] = (balances[path] ?? 0) * Math.exp(mu + sigma * gaussian(random)) + monthlyContribution;
    }
    if (month % MONTHS_PER_YEAR === 0) {
      const sorted = Float64Array.from(balances).sort();
      points.push({
        year: month / MONTHS_PER_YEAR,
        low: quantile(sorted, LOW_QUANTILE),
        median: quantile(sorted, 0.5),
        high: quantile(sorted, HIGH_QUANTILE),
      });
    }
  }
  return points;
}
