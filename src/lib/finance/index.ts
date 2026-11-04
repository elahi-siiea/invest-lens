export { analyzeCapm, capmExpectedReturn, covariance, sharpeRatio } from "./capm";
export { costOfFees, finalBalance, monthlyRate, simulateGrowth } from "./growth";
export {
  annualizedReturn,
  calendarYearReturns,
  growthOf,
  MONTHS_PER_YEAR,
  periodicReturns,
  totalReturn,
  yearsBetween,
} from "./returns";
export { annualizedVolatility, maxDrawdown, standardDeviation } from "./risk";
export { summarizeSeries } from "./summary";
export { simulateRange } from "./uncertainty";
export type {
  CapmResult,
  FeeImpact,
  PricePoint,
  RangePoint,
  SeriesSummary,
  SimulationInput,
  SimulationPoint,
  YearReturn,
} from "./types";
