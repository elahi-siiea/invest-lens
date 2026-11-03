const TERMS = [
  {
    term: "Total return",
    text: "How much the starting $10,000 grew or shrank over the whole period, including reinvested dividends in live data.",
  },
  {
    term: "Annualized return",
    text: "The steady yearly rate that would give the same total. Actual years rarely match it.",
  },
  {
    term: "Volatility",
    text: "How widely monthly returns swing, shown as a yearly figure. Higher means a bumpier path, not a worse outcome.",
  },
  {
    term: "Max drawdown",
    text: "The largest fall from a peak to a later low. A drawdown of -34% means a holder at the peak saw their balance drop by about a third before it recovered, if it did.",
  },
  {
    term: "Best and worst year",
    text: "Returns for full calendar years only, so short ranges can show n/a.",
  },
];

export function Explainer() {
  return (
    <section aria-labelledby="explainer-heading" className="border-t border-line pt-8">
      <h2 id="explainer-heading" className="font-display text-xl">
        Reading the table
      </h2>
      <dl className="mt-4 grid gap-x-10 gap-y-4 text-sm md:grid-cols-2">
        {TERMS.map(({ term, text }) => (
          <div key={term}>
            <dt className="font-medium">{term}</dt>
            <dd className="mt-0.5 text-muted">{text}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-6 max-w-prose text-sm text-muted">
        These figures describe the past. They say nothing about what any investment will do next.
      </p>
    </section>
  );
}
