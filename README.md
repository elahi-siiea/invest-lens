# Invest Lens

A plain-English investing analysis tool: compare how stocks and ETFs have grown, and explore how savings could grow over time.

[Live demo](#) <!-- Replace with the Vercel URL after deploying -->

| Compare investments | Investing simulator |
| --- | --- |
| ![Compare investments screenshot](docs/compare.png) | ![Investing simulator screenshot](docs/simulator.png) |

> Screenshots are placeholders. Add `docs/compare.png` and `docs/simulator.png`.

> **For educational purposes only. Not financial advice. Past performance does not predict future results.**

## Features

**Compare investments**
- Two to five tickers with autocomplete, plus the S&P 500 as a benchmark
- Ranges of 1Y, 5Y, 10Y and Max, all lined up on the same start date
- Line chart of the growth of $10,000
- Summary table: total return, annualized return, volatility, max drawdown, best year and worst year
- Plain-English explanations next to the table and "?" help on each term

**Investing simulator**
- Starting amount, monthly contribution, years, expected return, inflation and annual fee
- Sliders paired with number inputs, and Conservative, Balanced and Aggressive presets
- Chart of nominal balance, inflation-adjusted balance and total contributions
- "Cost of fees" card comparing the final balance with and without the fee

**Across the app**
- Light and dark themes, responsive down to phone widths
- Skeleton loading states, empty states and specific error messages (unknown ticker, rate limit, offline)
- Keyboard navigable, labeled inputs, and a data table behind every chart for screen readers
- Settings saved in `localStorage`; no database and no login

## Tech stack

Next.js (App Router), TypeScript in strict mode, Tailwind CSS, Recharts, Vitest.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. With no API key the app runs on bundled sample data.

```bash
npm test          # unit tests
npm run typecheck # TypeScript
npm run lint      # ESLint
npm run build     # production build
```

## Environment variables

Copy `.env.example` to `.env.local` to use live prices.

| Variable | Required | Description |
| --- | --- | --- |
| `TWELVE_DATA_API_KEY` | No | Key from [Twelve Data](https://twelvedata.com). Read only on the server, inside `/api/prices`. Without it, the app uses sample data. |

## Data

Prices come from the [Twelve Data](https://twelvedata.com) `time_series` endpoint as monthly closes adjusted for splits and dividends. The free Basic plan allows 8 requests per minute and 800 per day. I chose it over Alpha Vantage, whose free plan allows 25 requests per day.

- **Server only.** The browser calls `/api/prices`; the route handler holds the key.
- **Cached.** Each ticker is cached in memory for 12 hours, duplicate in-flight requests are shared, unknown tickers are remembered for an hour, and responses carry CDN cache headers.
- **Sample data.** Without a key (or if a visitor chooses it after a live-data error) the app shows a "Using sample data" notice. The sample series are **generated, not real**: a seeded random walk with a shared market factor, so the same numbers appear on every load. They exist so the demo works for everyone and must not be read as market history.
- **Benchmark.** The S&P 500 line uses SPY as a stand-in.

Before deploying publicly with a free key, read Twelve Data's terms for the Basic plan. Their attribution guidance asks for visible credit where their data is shown, which the app provides.

## How the calculations work

All finance math lives in [`src/lib/finance`](src/lib/finance) as pure functions with unit tests. Prices are month-end values, so one year is 12 periods.

| Measure | Formula |
| --- | --- |
| Growth of $10,000 | `10,000 × Pₜ / P₀` |
| Total return | `P_end / P_start − 1` |
| Annualized return | `(1 + total return) ^ (1 / years) − 1`, where `years = months / 12` |
| Volatility | Sample standard deviation of monthly returns `× √12` |
| Max drawdown | `min over t of (Pₜ / highest price so far − 1)` |
| Best and worst year | December-to-December return for each full calendar year in the range |

**Simulator.** The fee is subtracted from the expected return, `net = return − fee`, and converted to a monthly rate `m = (1 + net)^(1/12) − 1`. Each month, `balance = balance × (1 + m) + contribution`, with contributions added at month end. The inflation-adjusted value divides by `(1 + inflation)^years`. The cost of fees is the final balance with a 0% fee minus the final balance with the chosen fee.

These are simplified models. Real returns vary, fees and taxes differ, and nothing here predicts the future.

## Project structure

```
src/
  app/                 Routes: Compare (/), Simulator (/simulator), /api/prices
  components/
    compare/           Ticker picker, chart, summary table
    simulator/         Inputs, presets, chart, fee card
    layout/            Header, footer, theme toggle
    ui/                Help tooltip, slider field, skeleton, state messages
  hooks/               usePrices
  lib/
    finance/           Returns, risk, growth math and tests
    compare/           Lines up tickers on a shared window
    data/              Twelve Data client, cache, sample data, tickers
```

## Data source credit

Market data provided by [Twelve Data](https://twelvedata.com).

## Disclaimer

For educational purposes only. Not financial advice. Past performance does not predict future results. Invest Lens does not recommend any investment, strategy or ticker.

## License

[MIT](LICENSE)
