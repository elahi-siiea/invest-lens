export interface TickerSuggestion {
  symbol: string;
  name: string;
}

/** Common funds and stocks offered as autocomplete suggestions. Any valid ticker can still be typed. */
export const SUGGESTED_TICKERS: readonly TickerSuggestion[] = [
  { symbol: "VTI", name: "Vanguard Total Stock Market ETF" },
  { symbol: "SPY", name: "SPDR S&P 500 ETF Trust" },
  { symbol: "VOO", name: "Vanguard S&P 500 ETF" },
  { symbol: "QQQ", name: "Invesco QQQ Trust" },
  { symbol: "IWM", name: "iShares Russell 2000 ETF" },
  { symbol: "VXUS", name: "Vanguard Total International Stock ETF" },
  { symbol: "BND", name: "Vanguard Total Bond Market ETF" },
  { symbol: "SCHD", name: "Schwab U.S. Dividend Equity ETF" },
  { symbol: "VNQ", name: "Vanguard Real Estate ETF" },
  { symbol: "GLD", name: "SPDR Gold Shares" },
  { symbol: "AAPL", name: "Apple" },
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "AMZN", name: "Amazon" },
  { symbol: "GOOGL", name: "Alphabet" },
  { symbol: "NVDA", name: "NVIDIA" },
  { symbol: "TSLA", name: "Tesla" },
];

export const BENCHMARK_SYMBOL = "SPY";
export const MIN_TICKERS = 2;
export const MAX_TICKERS = 5;

const SYMBOL_PATTERN = /^[A-Z0-9][A-Z0-9.-]{0,9}$/;

/** Uppercases and trims a ticker. Returns null when it cannot be a valid symbol. */
export function normalizeSymbol(input: string): string | null {
  const symbol = input.trim().toUpperCase();
  return SYMBOL_PATTERN.test(symbol) ? symbol : null;
}

export function suggestionName(symbol: string): string | undefined {
  return SUGGESTED_TICKERS.find((entry) => entry.symbol === symbol)?.name;
}
