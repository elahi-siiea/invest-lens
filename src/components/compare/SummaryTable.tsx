import type { ReactNode } from "react";
import { HelpTip } from "@/components/ui/HelpTip";
import type { ComparisonLine } from "@/lib/compare/build";
import type { SeriesSummary, YearReturn } from "@/lib/finance";
import { formatPercent, formatSignedPercent } from "@/lib/format";

type Tone = "gain" | "loss" | "neutral";

interface Cell {
  text: string;
  tone: Tone;
}

interface Column {
  id: string;
  label: string;
  help?: string;
  cell: (summary: SeriesSummary) => Cell;
}

function signed(value: number): Cell {
  return { text: formatSignedPercent(value), tone: value > 0 ? "gain" : value < 0 ? "loss" : "neutral" };
}

function year(entry: YearReturn | null): Cell {
  if (!entry) return { text: "n/a", tone: "neutral" };
  const cell = signed(entry.return);
  return { text: `${cell.text} (${entry.year})`, tone: cell.tone };
}

const COLUMNS: readonly Column[] = [
  { id: "total", label: "Total return", cell: (s) => signed(s.totalReturn) },
  {
    id: "annualized",
    label: "Annualized return",
    help: "The steady yearly rate that would give the same total result. Real years bounce above and below it.",
    cell: (s) => signed(s.annualizedReturn),
  },
  {
    id: "volatility",
    label: "Volatility",
    help: "How much monthly returns swing, scaled to a year. A higher number means a bumpier ride.",
    cell: (s) => ({ text: formatPercent(s.volatility), tone: "neutral" }),
  },
  {
    id: "drawdown",
    label: "Max drawdown",
    help: "The biggest fall from a high point to a later low during this period.",
    cell: (s) => signed(s.maxDrawdown),
  },
  { id: "best", label: "Best year", cell: (s) => year(s.bestYear) },
  { id: "worst", label: "Worst year", cell: (s) => year(s.worstYear) },
];

const TONE: Record<Tone, string> = { gain: "text-gain", loss: "text-loss", neutral: "" };

function Name({ line }: { line: ComparisonLine }): ReactNode {
  return (
    <>
      {line.label}
      {line.isBenchmark && <span className="ml-2 text-xs font-normal text-muted">benchmark</span>}
    </>
  );
}

export function SummaryTable({ lines }: { lines: readonly ComparisonLine[] }) {
  return (
    <section aria-labelledby="summary-heading">
      <h2 id="summary-heading" className="font-display text-xl">
        How each one compares
      </h2>

      <div className="mt-4 hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[40rem] text-left">
          <caption className="sr-only">Return and risk measures for each investment over the chosen range</caption>
          <thead>
            <tr className="border-b border-edge text-sm text-muted">
              <th scope="col" className="py-3 pr-4 font-medium">Investment</th>
              {COLUMNS.map((column, index) => (
                <th key={column.id} scope="col" className="px-3 py-3 text-right font-medium">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    {column.label}
                    {column.help && (
                      <HelpTip term={column.label.toLowerCase()} align={index > 2 ? "end" : "start"}>
                        {column.help}
                      </HelpTip>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.key} className="border-b border-line">
                <th scope="row" className="py-4 pr-4 font-medium">
                  <Name line={line} />
                </th>
                {COLUMNS.map((column) => {
                  const cell = column.cell(line.summary);
                  return (
                    <td key={column.id} className={`px-3 py-4 text-right ${TONE[cell.tone]}`}>
                      {cell.text}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-4 space-y-4 sm:hidden">
        {lines.map((line) => (
          <li key={line.key} className="rounded-panel border border-line bg-surface p-4">
            <h3 className="font-medium">
              <Name line={line} />
            </h3>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {COLUMNS.map((column) => {
                const cell = column.cell(line.summary);
                return (
                  <div key={column.id}>
                    <dt className="text-muted">{column.label}</dt>
                    <dd className={`mt-0.5 text-base ${TONE[cell.tone]}`}>{cell.text}</dd>
                  </div>
                );
              })}
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}
