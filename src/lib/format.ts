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
