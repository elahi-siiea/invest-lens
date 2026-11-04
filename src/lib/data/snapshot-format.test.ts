import { describe, expect, it } from "vitest";
import { parseSnapshot } from "./snapshot-format";

describe("parseSnapshot", () => {
  it("reads the file written by the download script", () => {
    const snapshot = parseSnapshot({
      fetchedAt: "2026-11-04",
      source: "Yahoo Finance",
      series: { SPY: [["2024-01", 100], ["2024-02", 101]] },
    });
    expect(snapshot?.series.SPY).toEqual([{ date: "2024-01", close: 100 }, { date: "2024-02", close: 101 }]);
  });

  it("rejects unexpected shapes", () => {
    expect(parseSnapshot(null)).toBeNull();
    expect(parseSnapshot({ fetchedAt: "x", source: "y", series: { SPY: [["2024-01", -1]] } })).toBeNull();
    expect(parseSnapshot({ fetchedAt: 5, source: "y", series: {} })).toBeNull();
  });
});
