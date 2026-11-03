import { describe, expect, it } from "vitest";
import { normalizeSymbol } from "./tickers";

describe("normalizeSymbol", () => {
  it("uppercases and trims", () => {
    expect(normalizeSymbol("  vti ")).toBe("VTI");
  });

  it("accepts dots and dashes used by some tickers", () => {
    expect(normalizeSymbol("brk.b")).toBe("BRK.B");
  });

  it("rejects anything that cannot be a ticker", () => {
    expect(normalizeSymbol("")).toBeNull();
    expect(normalizeSymbol("a b")).toBeNull();
    expect(normalizeSymbol("DROP;TABLE")).toBeNull();
    expect(normalizeSymbol("WAYTOOLONGSYMBOL")).toBeNull();
  });
});
