import { HelpTip } from "@/components/ui/HelpTip";
import type { FeeImpact } from "@/lib/finance";
import { formatPercent, formatUsd } from "@/lib/format";

interface FeeCardProps {
  impact: FeeImpact;
  feePct: number;
  years: number;
}

export function FeeCard({ impact, feePct, years }: FeeCardProps) {
  const hasFee = feePct > 0;

  return (
    <section aria-labelledby="fee-heading" className="rounded-panel border border-line bg-surface p-5 sm:p-6">
      <h2 id="fee-heading" className="flex items-center gap-2 font-display text-xl">
        Cost of fees
        <HelpTip term="an annual fee">
          A yearly charge taken from your balance by a fund or advisor, shown as a percent. It is subtracted from the
          return before growth compounds, so its cost grows over time.
        </HelpTip>
      </h2>

      {hasFee ? (
        <>
          <p className="mt-3 font-display text-4xl text-loss">-{formatUsd(impact.cost)}</p>
          <p className="mt-1 text-muted">
            Over {years} {years === 1 ? "year" : "years"}, a {feePct.toFixed(2)}% annual fee takes{" "}
            {formatPercent(impact.costShare)} of the final balance.
          </p>
          <dl className="mt-5 divide-y divide-line border-y border-line text-sm">
            <div className="flex justify-between py-3">
              <dt className="text-muted">Without the fee</dt>
              <dd className="font-medium">{formatUsd(impact.withoutFee)}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-muted">With the {feePct.toFixed(2)}% fee</dt>
              <dd className="font-medium">{formatUsd(impact.withFee)}</dd>
            </div>
          </dl>
        </>
      ) : (
        <p className="mt-3 max-w-prose text-muted">
          No fee is set, so there is nothing to compare. Raise the annual fee to see what it would cost over the years you
          chose.
        </p>
      )}
    </section>
  );
}
