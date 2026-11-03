const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const usdCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatUsd(value: number): string {
  return usd.format(value);
}

export function formatCompactUsd(value: number): string {
  return usdCompact.format(value);
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2016-03" becomes "Mar 2016". */
export function formatMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split("-");
  return `${MONTH_NAMES[Number(month) - 1] ?? ""} ${year}`;
}

/** Formats a fraction (0.123) as a percent string ("12.3%"). */
export function formatPercent(fraction: number, digits = 1): string {
  return `${(fraction * 100).toFixed(digits)}%`;
}

export function formatSignedPercent(fraction: number, digits = 1): string {
  const text = formatPercent(Math.abs(fraction), digits);
  if (fraction > 0) return `+${text}`;
  if (fraction < 0) return `-${text}`;
  return text;
}
