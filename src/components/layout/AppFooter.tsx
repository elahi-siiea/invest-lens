export const DISCLAIMER =
  "For educational purposes only. Not financial advice. Past performance does not predict future results.";

export function AppFooter() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="max-w-prose text-sm text-muted">{DISCLAIMER}</p>
      </div>
    </footer>
  );
}
