import { RANGES, type RangeId } from "@/lib/compare/build";

interface RangeTabsProps {
  value: RangeId;
  onChange: (range: RangeId) => void;
}

export function RangeTabs({ value, onChange }: RangeTabsProps) {
  return (
    <div role="group" aria-label="Time range" className="inline-flex">
      {RANGES.map((range, index) => {
        const active = range.id === value;
        return (
          <button
            key={range.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(range.id)}
            className={`min-h-11 min-w-14 border px-4 text-sm font-medium transition-colors ${
              index === 0 ? "rounded-l-control" : "-ml-px"
            } ${index === RANGES.length - 1 ? "rounded-r-control" : ""} ${
              active ? "relative z-10 border-accent bg-accent text-on-accent" : "border-edge bg-surface hover:border-ink"
            }`}
          >
            {range.label}
          </button>
        );
      })}
    </div>
  );
}
