import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TtlCache } from "./cache";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("TtlCache", () => {
  it("loads once while the entry is fresh", async () => {
    const cache = new TtlCache<number>();
    const load = vi.fn(async () => 1);
    await cache.get("a", 1_000, load);
    await cache.get("a", 1_000, load);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("shares one in-flight request between callers", async () => {
    const cache = new TtlCache<number>();
    const load = vi.fn(async () => 1);
    await Promise.all([cache.get("a", 1_000, load), cache.get("a", 1_000, load)]);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("reloads after the entry expires", async () => {
    const cache = new TtlCache<number>();
    const load = vi.fn(async () => 1);
    await cache.get("a", 1_000, load);
    vi.advanceTimersByTime(1_001);
    await cache.get("a", 1_000, load);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("does not keep failures", async () => {
    const cache = new TtlCache<number>();
    await expect(cache.get("a", 1_000, () => Promise.reject(new Error("boom")))).rejects.toThrow("boom");
    await expect(cache.get("a", 1_000, async () => 2)).resolves.toBe(2);
  });

  it("drops the oldest entries past the limit", async () => {
    const cache = new TtlCache<number>(2);
    const load = vi.fn(async () => 1);
    await cache.get("a", 1_000, load);
    await cache.get("b", 1_000, load);
    await cache.get("c", 1_000, load);
    await cache.get("a", 1_000, load);
    expect(load).toHaveBeenCalledTimes(4);
  });
});
