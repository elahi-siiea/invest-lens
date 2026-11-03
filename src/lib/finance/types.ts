/** One month-end observation. `date` is `YYYY-MM` or a full ISO date. */
export interface PricePoint {
  date: string;
  close: number;
}

export interface YearReturn {
  year: number;
  return: number;
}

export interface SeriesSummary {
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  maxDrawdown: number;
  bestYear: YearReturn | null;
  worstYear: YearReturn | null;
}

export interface SimulationInput {
  startingAmount: number;
  monthlyContribution: number;
  years: number;
  /** Expected annual return before fees, as a fraction (0.07 = 7%). */
  annualReturn: number;
  /** Expected annual inflation, as a fraction. */
  inflation: number;
  /** Annual fee, as a fraction of the balance. */
  annualFee: number;
}

export interface SimulationPoint {
  year: number;
  nominal: number;
  real: number;
  contributions: number;
}

/** Balance at the 10th, 50th and 90th percentile of simulated paths. */
export interface RangePoint {
  year: number;
  low: number;
  median: number;
  high: number;
}

export interface FeeImpact {
  withFee: number;
  withoutFee: number;
  cost: number;
  /** Share of the fee-free final balance lost to fees. */
  costShare: number;
}
