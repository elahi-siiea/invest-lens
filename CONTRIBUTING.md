# Contributing to Invest Lens

Thanks for helping. This is a small educational project, so the bar is simple: keep it clear, tested and honest.

## Set up

Requires Node.js 22.18 or newer (see `.nvmrc`).

```bash
npm install
npm run dev
```

Optional: `npm run data:fetch` downloads real monthly price history for local use. Copy `.env.example` to `.env.local` only if you have a Twelve Data key.

## Before you open a pull request

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

CI runs the same four commands. A pull request needs all of them green.

## Guidelines

- **Finance math lives in `src/lib/finance`** as pure functions with unit tests. New formulas need tests with values you can check by hand or against a formula.
- **Keep TypeScript strict.** No `any`, no unused code, and comments only where they explain a reason.
- **No investment advice.** Do not add copy that calls a ticker or strategy a good buy. Keep the disclaimer visible.
- **No fabricated data.** Numbers shown to users must be real or clearly labeled as sample data.
- **Do not commit price data.** `data/history.json` is git-ignored on purpose, because the source's terms do not allow redistribution. Never commit API keys.
- **Accessibility counts.** New controls need labels, keyboard support, a visible focus state, and a tap target of about 44px.
- **Follow the design direction** in `DESIGN.md`: restrained palette, one accent, no gradients or decorative effects.

## Commits and pull requests

- Write commit messages that say what changed and why, in the imperative mood ("Add volatility input").
- Keep pull requests focused on one change, and describe how you checked it.
- For larger changes, open an issue first so we can agree on the approach.

## Good first contributions

- More tickers in the suggestion list (with a matching sample profile in `src/lib/data/sample.ts`)
- A log-scale toggle for the Compare chart
- Tests for the components in `src/components`
