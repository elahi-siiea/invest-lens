"use client";

import { useEffect, useState } from "react";
import { fetchPrices } from "@/lib/data/client";
import { DataError, type PricesResponse } from "@/lib/data/types";

export type PricesState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: PricesResponse }
  | { status: "error"; error: DataError };

interface Settled {
  key: string;
  result: { data: PricesResponse } | { error: DataError };
}

/**
 * Loads prices whenever the symbols or the sample flag change. `attempt`
 * lets the caller force a reload after an error.
 */
export function usePrices(symbols: readonly string[], sample: boolean, attempt: number): PricesState {
  const key = symbols.length > 0 ? `${symbols.join(",")}|${sample}|${attempt}` : null;
  const [settled, setSettled] = useState<Settled | null>(null);

  useEffect(() => {
    if (key === null) return;
    const controller = new AbortController();
    fetchPrices(key.split("|")[0]!.split(","), sample, controller.signal)
      .then((data) => setSettled({ key, result: { data } }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const wrapped = error instanceof DataError ? error : new DataError("UPSTREAM", "Something went wrong.");
        setSettled({ key, result: { error: wrapped } });
      });
    return () => controller.abort();
  }, [key, sample]);

  if (key === null) return { status: "idle" };
  if (settled?.key !== key) return { status: "loading" };
  return "error" in settled.result
    ? { status: "error", error: settled.result.error }
    : { status: "success", data: settled.result.data };
}
