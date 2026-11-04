import { describe, expect, it } from "vitest";
import { parseYahooChart, unbrokenTail, yahooSymbol } from "./yahoo";

const at = (iso: string) => Date.parse(`${iso}T14:30:00Z`) / 1000;

function body(rows: [string, number | null][]) {
  return {
    chart: {
      result: [
        {
          timestamp: rows.map(([date]) => at(date)),
          indicators: { adjclose: [{ adjclose: rows.map(([, close]) => close) }] },
        },
      ],
    },
  };
}

describe("parseYahooChart", () => {
  it("returns month-keyed adjusted closes, oldest first", () => {
    const points = parseYahooChart(body([["2024-02-01", 11], ["2024-01-01", 10]]));
    expect(points).toEqual([{ date: "2024-01", close: 10 }, { date: "2024-02", close: 11 }]);
  });

  it("keeps the latest value when a month appears twice", () => {
    const points = parseYahooChart(body([["2024-01-01", 10], ["2024-01-15", 12]]));
    expect(points).toEqual([{ date: "2024-01", close: 12 }]);
  });

  it("skips missing prices", () => {
    expect(parseYahooChart(body([["2024-01-01", null], ["2024-02-01", 5]]))).toEqual([{ date: "2024-02", close: 5 }]);
  });

  it("throws the provider's message when there is no result", () => {
    expect(() => parseYahooChart({ chart: { result: null, error: { description: "No data found" } } })).toThrow("No data found");
  });
});

describe("unbrokenTail", () => {
  it("keeps only the stretch after the last missing month", () => {
    const points = [
      { date: "2020-01", close: 1 },
      { date: "2020-04", close: 2 },
      { date: "2020-05", close: 3 },
      { date: "2020-06", close: 4 },
    ];
    expect(unbrokenTail(points).map((p) => p.date)).toEqual(["2020-04", "2020-05", "2020-06"]);
  });

  it("leaves a complete series alone", () => {
    const points = [{ date: "2020-12", close: 1 }, { date: "2021-01", close: 2 }];
    expect(unbrokenTail(points)).toEqual(points);
  });
});

describe("yahooSymbol", () => {
  it("uses a dash for share classes", () => {
    expect(yahooSymbol("BRK.B")).toBe("BRK-B");
  });
});
