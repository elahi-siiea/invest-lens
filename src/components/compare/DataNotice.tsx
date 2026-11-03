import { Button } from "@/components/ui/Button";
import type { DataSource } from "@/lib/data/types";

interface DataNoticeProps {
  source: DataSource;
  /** True when the visitor switched to sample data themselves. */
  chosen: boolean;
  onTryLive: () => void;
}

export function DataNotice({ source, chosen, onTryLive }: DataNoticeProps) {
  if (source === "live") {
    return (
      <p className="text-sm text-muted">
        Data provided by{" "}
        <a href="https://twelvedata.com" rel="noopener" className="font-medium text-accent underline underline-offset-2">
          Twelve Data
        </a>
        . Monthly prices adjusted for splits and dividends.
      </p>
    );
  }

  return (
    <div role="status" className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-control border border-edge bg-surface px-4 py-3 text-sm">
      <p>
        <strong className="font-semibold">Using sample data.</strong> These prices are illustrative and generated for
        the demo. They are not real market history.
      </p>
      {chosen && (
        <Button onClick={onTryLive} className="min-h-11 px-3">
          Try live data
        </Button>
      )}
    </div>
  );
}
