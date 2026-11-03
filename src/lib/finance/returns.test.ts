import { describe, expect, it } from "vitest";
import {
  annualizedReturn,
  calendarYearReturns,
  growthOf,
  periodicReturns,
  totalReturn,
  yearsBetween,
} from "./returns";

describe("totalReturn", () => {
  it("returns the fractional change", () => {
    expect(totalReturn(100, 150)).toBeCloseTo(0.5);
    expect(totalReturn(100, 80)).toBeCloseTo(-0.2);
  });

  it("rejects a non-positive start", () => {
    expect(() => totalReturn(0, 10)).toThrow(RangeError);
  });
});

describe("periodicReturns", () => {
  it("returns one fewer entry than the input", () => {
    expect(periodicReturns([100, 110, 99])).toEqual([expect.closeTo(0.1), expect.closeTo(-0.1)]);
  });

  it("returns an empty list for a single value", () => {
    expect(periodicReturns([100])).toEqual([]);
  });

  it("rejects non-positive values", () => {
    expect(() => periodicReturns([100, 0, 50])).toThrow(RangeError);
  });
});

describe("annualizedReturn", () => {
  it("doubling over two years is about 41.4% a year", () => {
    expect(annualizedReturn(1, 2)).toBeCloseTo(Math.SQRT2 - 1, 10);
  });

  it("equals the total return over exactly one year", () => {
    expect(annualizedReturn(0.12, 1)).toBeCloseTo(0.12);
  });

  it("handles a total loss", () => {
    expect(annualizedReturn(-1, 3)).toBe(-1);
  });

  it("rejects a non-positive period", () => {
    expect(() => annualizedReturn(0.1, 0)).toThrow(RangeError);
  });
});

describe("yearsBetween", () => {
  it("counts whole months as twelfths of a year", () => {
    expect(yearsBetween("2020-01", "2025-01")).toBe(5);
    expect(yearsBetween("2020-01-31", "2020-07-31")).toBe(0.5);
  });

  it("rejects a malformed date", () => {
    expect(() => yearsBetween("soon", "2025-01")).toThrow(RangeError);
  });
});

describe("growthOf", () => {
  it("scales the series to start at the initial amount", () => {
    expect(growthOf(10_000, [50, 55, 40])).toEqual([10_000, 11_000, 8_000]);
  });

  it("rejects an empty series", () => {
    expect(() => growthOf(10_000, [])).toThrow(RangeError);
  });
});

describe("calendarYearReturns", () => {
  const points = [
    { date: "2019-12", close: 100 },
    { date: "2020-06", close: 90 },
    { date: "2020-12", close: 120 },
    { date: "2021-12", close: 108 },
    { date: "2022-03", close: 100 },
  ];

  it("compares each December with the previous one", () => {
    const years = calendarYearReturns(points);
    expect(years).toHaveLength(2);
    expect(years[0]).toEqual({ year: 2020, return: expect.closeTo(0.2) });
    expect(years[1]).toEqual({ year: 2021, return: expect.closeTo(-0.1) });
  });

  it("leaves out partial years at either end", () => {
    const partial = [
      { date: "2019-08", close: 100 },
      { date: "2019-12", close: 110 },
      { date: "2020-12", close: 121 },
      { date: "2021-02", close: 130 },
    ];
    expect(calendarYearReturns(partial).map((entry) => entry.year)).toEqual([2020]);
  });

  it("returns nothing when no full year exists", () => {
    expect(calendarYearReturns(points.slice(0, 2))).toEqual([]);
  });
});
