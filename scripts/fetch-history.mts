/**
 * Downloads real monthly price history and saves it to data/history.json.
 *
 *   npm run data:fetch                 the suggested tickers
 *   npm run data:fetch -- KO PEP       add or refresh specific tickers
 *
 * Data comes from Yahoo Finance's unofficial chart endpoint, adjusted for
 * splits and dividends. It is meant for personal and educational use, so the
 * output stays out of git. Check Yahoo's terms before using it any other way.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { BENCHMARK_SYMBOL, normalizeSymbol, SUGGESTED_TICKERS } from "../src/lib/data/tickers.ts";
import { parseSnapshot, SNAPSHOT_PATH, type Snapshot } from "../src/lib/data/snapshot-format.ts";
import { parseYahooChart, yahooSymbol } from "../src/lib/data/yahoo.ts";

/** January 1993, the start of the SPY ETF. Yahoo returns coarser bars if the range reaches further back. */
const HISTORY_START = Date.UTC(1993, 0, 1) / 1000;
const PAUSE_MS = 1_000;
const MAX_ATTEMPTS = 3;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function download(symbol: string): Promise<[string, number][]> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol(symbol))}?period1=${HISTORY_START}&period2=${Math.floor(Date.now() / 1000)}&interval=1mo`;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const response = await fetch(url, { headers: { "User-Agent": "invest-lens-data-script (personal, educational)" } });
    if (response.status === 429 && attempt < MAX_ATTEMPTS) {
      await sleep(2_000 * attempt);
      continue;
    }
    const points = parseYahooChart(await response.json().catch(() => ({})));
    if (points.length < 13) throw new Error("fewer than 13 months of history");
    return points.map((point) => [point.date, point.close]);
  }
  throw new Error("rate limited");
}

async function existingSnapshot(): Promise<Snapshot | null> {
  try {
    return parseSnapshot(JSON.parse(await readFile(SNAPSHOT_PATH, "utf8")));
  } catch {
    return null;
  }
}

const requested = process.argv.slice(2).map((arg) => normalizeSymbol(arg));
if (requested.includes(null)) {
  console.error("Every argument must be a ticker symbol, for example: npm run data:fetch -- KO PEP");
  process.exit(1);
}
const symbols = requested.length > 0
  ? (requested as string[])
  : [...new Set([BENCHMARK_SYMBOL, ...SUGGESTED_TICKERS.map((entry) => entry.symbol)])];

const previous = await existingSnapshot();
const series: Record<string, [string, number][]> = Object.fromEntries(
  Object.entries(previous?.series ?? {}).map(([symbol, points]) => [symbol, points.map((p) => [p.date, p.close] as [string, number])]),
);

let failures = 0;
for (const symbol of symbols) {
  try {
    series[symbol] = await download(symbol);
    console.log(`ok      ${symbol.padEnd(6)} ${series[symbol]?.length} months from ${series[symbol]?.[0]?.[0]}`);
  } catch (error) {
    failures++;
    console.error(`failed  ${symbol.padEnd(6)} ${error instanceof Error ? error.message : error}`);
  }
  await sleep(PAUSE_MS);
}

if (failures === symbols.length) {
  console.error("No ticker could be downloaded, so nothing was written.");
  process.exit(1);
}

await mkdir(path.dirname(SNAPSHOT_PATH), { recursive: true });
await writeFile(
  SNAPSHOT_PATH,
  JSON.stringify({ fetchedAt: new Date().toISOString().slice(0, 10), source: "Yahoo Finance", series }),
);
console.log(`\nSaved ${Object.keys(series).length} tickers to data/history.json`);
