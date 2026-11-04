interface Term {
  term: string;
  text: string;
}

const TABLE_TERMS: readonly Term[] = [
  {
    term: "Total return",
    text: "How much the starting $10,000 grew or shrank over the whole period, including reinvested dividends when the data is real (not sample).",
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

const CAPM_TERMS: readonly Term[] = [
  {
    term: "CAPM",
    text: "The Capital Asset Pricing Model. Its idea is that investors are paid for market risk, the kind you cannot diversify away, and not for risks specific to one company.",
  },
  {
    term: "Beta",
    text: "How much an investment moved when the S&P 500 moved. A beta of 1.2 means it tended to move about 20% more than the market, in either direction.",
  },
  {
    term: "CAPM expected return",
    text: "The risk-free rate plus beta times the market's extra return over that rate. It is the return the model says that much market risk should have earned.",
  },
  {
    term: "Alpha",
    text: "Actual return minus the CAPM expected return. A positive alpha means the investment earned more than its beta predicted over this period. It describes the past and can be luck.",
  },
  {
    term: "R²",
    text: "The share of an investment's ups and downs explained by the market. A low R² means company-specific moves drive much of the result, so beta tells you less.",
  },
  {
    term: "Sharpe ratio",
    text: "Return above the risk-free rate divided by volatility: how much reward came for each unit of swing. Compare it across investments over the same period.",
  },
];

function TermList({ terms }: { terms: readonly Term[] }) {
  return (
    <dl className="mt-4 grid gap-x-10 gap-y-4 text-sm md:grid-cols-2">
      {terms.map(({ term, text }) => (
        <div key={term}>
          <dt className="font-medium">{term}</dt>
          <dd className="mt-0.5 text-muted">{text}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Explainer() {
  return (
    <section aria-labelledby="explainer-heading" className="border-t border-line pt-8">
      <h2 id="explainer-heading" className="font-display text-xl">
        Reading the table
      </h2>
      <TermList terms={TABLE_TERMS} />

      <h3 className="mt-8 font-display text-lg">Reading the CAPM view</h3>
      <TermList terms={CAPM_TERMS} />

      <p className="mt-6 max-w-prose text-sm text-muted">
        These figures describe the past. They say nothing about what any investment will do next.
      </p>
    </section>
  );
}
