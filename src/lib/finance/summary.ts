import { annualizedReturn, calendarYearReturns, MONTHS_PER_YEAR, periodicReturns, totalReturn, yearsBetween } from "./returns";
import { annualizedVolatility, maxDrawdown } from "./risk";
import type { PricePoint, SeriesSummary, YearReturn } from "./types";

/** Needs at least three month-end points so volatility has two returns. */
export function summarizeSeries(points: readonly PricePoint[]): SeriesSummary {
  const first = points[0];
  const last = points.at(-1);
  if (!first || !last || points.length < 3) {
    throw new RangeError("at least three data points are required");
  }

  const closes = points.map((point) => point.close);
  const total = totalReturn(first.close, last.close);
  const years = yearsBetween(first.date, last.date);
  const byYear = calendarYearReturns(points);

  return {
    totalReturn: total,
    annualizedReturn: annualizedReturn(total, years),
    volatility: annualizedVolatility(periodicReturns(closes), MONTHS_PER_YEAR),
    maxDrawdown: maxDrawdown(closes),
    bestYear: pickYear(byYear, (a, b) => b.return - a.return),
    worstYear: pickYear(byYear, (a, b) => a.return - b.return),
  };
}

function pickYear(years: readonly YearReturn[], compare: (a: YearReturn, b: YearReturn) => number): YearReturn | null {
  return [...years].sort(compare)[0] ?? null;
}
