import type { PricePoint, YearReturn } from "./types";

export const MONTHS_PER_YEAR = 12;

export function totalReturn(start: number, end: number): number {
  if (!(start > 0)) throw new RangeError("start value must be positive");
  return end / start - 1;
}

export function periodicReturns(values: readonly number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < values.length; i++) {
    const previous = values[i - 1];
    const current = values[i];
    if (previous === undefined || current === undefined || !(previous > 0)) {
      throw new RangeError("values must be positive numbers");
    }
    out.push(current / previous - 1);
  }
  return out;
}

export function annualizedReturn(total: number, years: number): number {
  if (!(years > 0)) throw new RangeError("years must be positive");
  return (1 + total) ** (1 / years) - 1;
}

function parseYearMonth(date: string): { year: number; month: number } {
  const [year, month] = date.slice(0, 7).split("-").map(Number);
  if (year === undefined || month === undefined || Number.isNaN(year) || Number.isNaN(month)) {
    throw new RangeError(`invalid date: ${date}`);
  }
  return { year, month };
}

export function yearsBetween(from: string, to: string): number {
  const a = parseYearMonth(from);
  const b = parseYearMonth(to);
  return ((b.year - a.year) * MONTHS_PER_YEAR + (b.month - a.month)) / MONTHS_PER_YEAR;
}

/** Scales a price series so that it starts at `initial`. */
export function growthOf(initial: number, values: readonly number[]): number[] {
  const first = values[0];
  if (first === undefined || !(first > 0)) throw new RangeError("series must start with a positive value");
  return values.map((value) => (initial * value) / first);
}

/**
 * Return for each complete calendar year: December close against the
 * previous December close. Partial years are left out.
 */
export function calendarYearReturns(points: readonly PricePoint[]): YearReturn[] {
  const lastOfYear = new Map<number, { month: number; close: number }>();
  for (const point of points) {
    const { year, month } = parseYearMonth(point.date);
    lastOfYear.set(year, { month, close: point.close });
  }
  const out: YearReturn[] = [];
  for (const [year, end] of lastOfYear) {
    const previous = lastOfYear.get(year - 1);
    if (end.month === MONTHS_PER_YEAR && previous?.month === MONTHS_PER_YEAR) {
      out.push({ year, return: totalReturn(previous.close, end.close) });
    }
  }
  return out.sort((a, b) => a.year - b.year);
}
