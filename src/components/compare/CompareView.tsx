"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { StateMessage } from "@/components/ui/StateMessage";
import { usePrices } from "@/hooks/usePrices";
import { buildComparison } from "@/lib/compare/build";
import { BENCHMARK_SYMBOL, MIN_TICKERS } from "@/lib/data/tickers";
import type { DataError } from "@/lib/data/types";
import { usePersistedState } from "@/lib/storage";
import { CompareChart } from "./CompareChart";
import { DataNotice } from "./DataNotice";
import { Explainer } from "./Explainer";
import { RangeTabs } from "./RangeTabs";
import { COMPARE_STORAGE_KEY, DEFAULT_COMPARE, EXAMPLE, parseCompareSettings } from "./settings";
import { SummaryTable } from "./SummaryTable";
import { TickerPicker } from "./TickerPicker";

const ERROR_TITLES: Record<DataError["code"], string> = {
  INVALID_TICKER: "That ticker was not found",
  NOT_ENOUGH_DATA: "Not enough price history",
  PLAN_LIMIT: "That ticker is not available",
  RATE_LIMIT: "Too many requests for now",
  NETWORK: "The price service is unreachable",
  OFFLINE: "You appear to be offline",
  UPSTREAM: "Prices could not be loaded",
  BAD_REQUEST: "That request was not valid",
};

function ResultsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading prices" role="status" className="space-y-10">
      <div>
        <Skeleton className="h-7 w-64" />
        <Skeleton className="mt-4 h-72 w-full sm:h-96" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

export function CompareView() {
  const [settings, save] = usePersistedState(COMPARE_STORAGE_KEY, DEFAULT_COMPARE, parseCompareSettings);
  const [attempt, setAttempt] = useState(0);
  const { tickers, range, sample } = settings;

  const ready = tickers.length >= MIN_TICKERS;
  const symbols = ready ? (tickers.includes(BENCHMARK_SYMBOL) ? tickers : [...tickers, BENCHMARK_SYMBOL]) : [];
  const prices = usePrices(symbols, sample, attempt);

  const update = (patch: Partial<typeof settings>) => save({ ...settings, ...patch });

  const renderResults = () => {
    if (!ready) {
      return (
        <StateMessage
          tone="empty"
          title="Pick at least two investments"
          action={
            <Button variant="primary" onClick={() => save(EXAMPLE)}>
              Load example
            </Button>
          }
        >
          Add two to five tickers above to see how $10,000 would have grown in each, next to the S&amp;P 500. Or load an
          example to see it working.
        </StateMessage>
      );
    }

    if (prices.status === "idle" || prices.status === "loading") return <ResultsSkeleton />;

    if (prices.status === "error") {
      const { error } = prices;
      const removable = error.symbol && tickers.includes(error.symbol) ? error.symbol : null;
      return (
        <StateMessage
          tone="error"
          title={ERROR_TITLES[error.code]}
          action={
            <>
              {removable && (
                <Button variant="primary" onClick={() => update({ tickers: tickers.filter((t) => t !== removable) })}>
                  Remove {removable}
                </Button>
              )}
              <Button variant={removable ? "secondary" : "primary"} onClick={() => setAttempt((count) => count + 1)}>
                Try again
              </Button>
              {error.source === "live" && (
                <Button onClick={() => update({ sample: true })}>Use sample data</Button>
              )}
            </>
          }
        >
          {error.message}
          {error.code === "RATE_LIMIT" && " Wait about a minute, then try again."}
          {error.code === "OFFLINE" && " Check your connection, then try again."}
        </StateMessage>
      );
    }

    const result = buildComparison(prices.data.series, tickers, range);
    if (!result.ok) {
      return (
        <StateMessage tone="error" title="These do not overlap enough">
          {result.message} Try a shorter range or different tickers.
        </StateMessage>
      );
    }

    const { comparison } = result;
    return (
      <div className="space-y-12">
        <div className="space-y-3">
          <DataNotice source={prices.data.source} chosen={sample} onTryLive={() => update({ sample: false })} />
          {comparison.shortHistory && (
            <p className="text-sm text-muted">
              {comparison.shortHistory.symbol} only has data since {comparison.start}, so every line starts there.
            </p>
          )}
        </div>
        <CompareChart comparison={comparison} tickers={tickers} />
        <SummaryTable lines={comparison.lines} />
        <Explainer />
      </div>
    );
  };

  return (
    <div>
      <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Compare investments</h1>
      <p className="mt-3 max-w-prose text-lg text-muted">
        See how $10,000 would have grown in each stock or fund you pick, next to the S&amp;P 500, and how bumpy the ride
        was along the way.
      </p>

      <section aria-label="Choose investments" className="mt-10 grid gap-8 border-y border-line py-8 md:grid-cols-[minmax(0,1fr)_auto] md:gap-12">
        <TickerPicker
          tickers={tickers}
          onAdd={(symbol) => update({ tickers: [...tickers, symbol] })}
          onRemove={(symbol) => update({ tickers: tickers.filter((t) => t !== symbol) })}
        />
        <div className="space-y-4">
          <RangeTabs value={range} onChange={(next) => update({ range: next })} />
          <div>
            <Button onClick={() => save(EXAMPLE)}>Load example</Button>
          </div>
        </div>
      </section>

      <div className="mt-10">{renderResults()}</div>
    </div>
  );
}
