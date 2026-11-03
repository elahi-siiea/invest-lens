/** Series colors are assigned by position, so the chips and chart lines always match. */
export function seriesColor(index: number): string {
  return `var(--series-${(index % 5) + 1})`;
}

export const BENCHMARK_COLOR = "var(--ink)";
