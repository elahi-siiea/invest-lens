import { MONTHS_PER_YEAR } from "./returns";
import type { FeeImpact, SimulationInput, SimulationPoint } from "./types";

/** Converts an annual rate into the equivalent compounding monthly rate. */
export function monthlyRate(annualRate: number): number {
  return (1 + annualRate) ** (1 / MONTHS_PER_YEAR) - 1;
}

/**
 * Year-by-year projection. Contributions are added at the end of each
 * month. The fee is subtracted from the annual return before compounding.
 * Years run from 0 (the starting amount) to `years`.
 */
export function simulateGrowth(input: SimulationInput): SimulationPoint[] {
  const { startingAmount, monthlyContribution, years, annualReturn, inflation, annualFee } = input;
  const rate = monthlyRate(annualReturn - annualFee);
  const points: SimulationPoint[] = [];
  let balance = startingAmount;

  for (let month = 0; month <= years * MONTHS_PER_YEAR; month++) {
    if (month > 0) balance = balance * (1 + rate) + monthlyContribution;
    if (month % MONTHS_PER_YEAR === 0) {
      const year = month / MONTHS_PER_YEAR;
      points.push({
        year,
        nominal: balance,
        real: balance / (1 + inflation) ** year,
        contributions: startingAmount + monthlyContribution * month,
      });
    }
  }
  return points;
}

export function finalBalance(input: SimulationInput): number {
  const last = simulateGrowth(input).at(-1);
  return last ? last.nominal : input.startingAmount;
}

export function costOfFees(input: SimulationInput): FeeImpact {
  const withFee = finalBalance(input);
  const withoutFee = finalBalance({ ...input, annualFee: 0 });
  const cost = withoutFee - withFee;
  return { withFee, withoutFee, cost, costShare: withoutFee > 0 ? cost / withoutFee : 0 };
}
