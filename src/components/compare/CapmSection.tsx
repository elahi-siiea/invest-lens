"use client";

import {
  CartesianGrid,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { HelpTip } from "@/components/ui/HelpTip";
import { SliderField } from "@/components/ui/SliderField";
import type { Comparison, ComparisonLine } from "@/lib/compare/build";
import { formatPercent, formatSignedPercent } from "@/lib/format";
import { BENCHMARK_COLOR, seriesColor } from "./colors";
import { RISK_FREE_LIMITS } from "./settings";

interface CapmSectionProps {
  comparison: Comparison;
  tickers: readonly string[];
  riskFreePct: number;
  onRiskFreeChange: (value: number) => void;
}

interface Point {
  label: string;
  symbol: string;
  beta: number;
  actual: number;
  expected: number;
}

function colorFor(line: ComparisonLine, tickers: readonly string[]): string {
  const index = tickers.indexOf(line.key);
  return index === -1 ? BENCHMARK_COLOR : seriesColor(index);
}

function PointTooltip({ active, payload }: { active?: boolean; payload?: ReadonlyArray<{ payload?: Point }> }) {
  const point = active ? payload?.[0]?.payload : undefined;
  if (!point) return null;
  return (
    <div className="rounded-control border border-line bg-surface p-3 text-sm shadow-md">
      <p className="font-medium">{point.label}</p>
      <dl className="mt-1 space-y-0.5">
        <div className="flex justify-between gap-6">
          <dt className="text-muted">Beta</dt>
          <dd>{point.beta.toFixed(2)}</dd>
        </div>
        <div className="flex justify-between gap-6">
          <dt className="text-muted">Actual return</dt>
          <dd>{formatPercent(point.actual)}</dd>
        </div>
        <div className="flex justify-between gap-6">
          <dt className="text-muted">CAPM expected</dt>
          <dd>{formatPercent(point.expected)}</dd>
        </div>
      </dl>
    </div>
  );
}

function alphaTone(alpha: number): string {
  return alpha > 0 ? "text-gain" : alpha < 0 ? "text-loss" : "";
}

export function CapmSection({ comparison, tickers, riskFreePct, onRiskFreeChange }: CapmSectionProps) {
  const riskFree = riskFreePct / 100;
  const { lines } = comparison;
  const marketReturn = lines[0]?.capm.marketReturn ?? 0;
  const maxBeta = Math.ceil(Math.max(1.5, ...lines.map((line) => line.capm.beta * 1.15)) * 2) / 2;
  const slope = marketReturn - riskFree;
  const betaTicks = Array.from({ length: maxBeta * 2 + 1 }, (_, i) => i / 2);
  const peak = Math.max(riskFree + maxBeta * slope, ...lines.map((line) => line.capm.actualReturn));
  const floor = Math.min(0, ...lines.map((line) => line.capm.actualReturn));
  const step = peak - floor > 0.6 ? 0.1 : 0.05;
  const top = Math.ceil((peak * 1.06) / step) * step;
  const bottom = Math.floor(floor / step) * step;
  const returnTicks = Array.from({ length: Math.round((top - bottom) / step) + 1 }, (_, i) => Math.round((bottom + i * step) * 100) / 100);

  const summary = `Scatter chart of beta against annualized return with the security market line. ${lines
    .map((line) => `${line.label}: beta ${line.capm.beta.toFixed(2)}, actual ${formatPercent(line.capm.actualReturn)}, CAPM expected ${formatPercent(line.capm.expectedReturn)}`)
    .join("; ")}.`;

  return (
    <section aria-labelledby="capm-heading" className="border-t border-line pt-10">
      <h2 id="capm-heading" className="font-display text-xl">
        Did the return match the risk? The CAPM view
      </h2>
      <p className="mt-2 max-w-prose text-muted">
        The Capital Asset Pricing Model says an investment should earn the risk-free rate plus its beta times the
        market&apos;s extra return. Beta measures how strongly it moved with the S&amp;P 500. Here, the benchmark stands
        in for the market.
      </p>

      <div className="mt-6 max-w-sm">
        <SliderField
          label="Risk-free rate"
          suffix="%"
          help={
            <HelpTip term="the risk-free rate">
              What a near-zero-risk investment, such as a short-term government bill, would pay each year. It is an
              assumption you set here. Change it to match the rates for the years you are looking at.
            </HelpTip>
          }
          value={riskFreePct}
          onChange={onRiskFreeChange}
          {...RISK_FREE_LIMITS}
        />
      </div>

      <figure className="mt-8">
        <figcaption className="font-display text-lg">Beta against actual return, with the security market line</figcaption>
        <p className="mt-1 max-w-prose text-sm text-muted">
          The dashed line is what CAPM expects at each beta. Points above it earned more than expected for their risk,
          and points below it earned less.
        </p>
        <div role="img" aria-label={summary} className="mt-4 h-72 w-full sm:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 12, right: 16, bottom: 24, left: 0 }}>
              <CartesianGrid stroke="var(--line)" />
              <XAxis
                type="number"
                dataKey="beta"
                domain={[0, maxBeta]}
                ticks={betaTicks}
                tickFormatter={(value: number) => value.toFixed(1)}
                stroke="var(--edge)"
                tick={{ fill: "var(--muted)", fontSize: 12 }}
                label={{ value: "Beta", position: "insideBottom", offset: -12, fill: "var(--muted)", fontSize: 12 }}
              />
              <YAxis
                type="number"
                dataKey="actual"
                width={52}
                tickFormatter={(value: number) => `${Math.round(value * 100)}%`}
                stroke="var(--edge)"
                tick={{ fill: "var(--muted)", fontSize: 12 }}
                domain={[bottom, top]}
                ticks={returnTicks}
              />
              <ZAxis range={[110, 110]} />
              <ReferenceLine
                segment={[
                  { x: 0, y: riskFree },
                  { x: maxBeta, y: riskFree + maxBeta * slope },
                ]}
                stroke="var(--muted)"
                strokeWidth={2}
                strokeDasharray="6 4"
              />
              <Tooltip content={<PointTooltip />} cursor={false} />
              {lines.map((line) => (
                <Scatter
                  key={line.key}
                  name={line.label}
                  data={[{ label: line.label, symbol: line.key, beta: line.capm.beta, actual: line.capm.actualReturn, expected: line.capm.expectedReturn }]}
                  fill={colorFor(line, tickers)}
                  isAnimationActive={false}
                >
                  <LabelList dataKey="symbol" position={line.isBenchmark ? "left" : "right"} offset={10} fill="var(--ink)" fontSize={12} />
                </Scatter>
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </figure>

      <div className="mt-6 hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[40rem] text-left">
          <caption className="sr-only">CAPM measures for each investment against the benchmark</caption>
          <thead>
            <tr className="border-b border-edge text-sm text-muted">
              <th scope="col" className="py-3 pr-4 font-medium">Investment</th>
              <th scope="col" className="px-3 py-3 text-right font-medium">
                <span className="inline-flex items-center justify-end gap-1.5">
                  Beta
                  <HelpTip term="beta">
                    How much the investment moved when the market moved. 1.0 moves with the market, above 1.0 swings
                    more, below 1.0 swings less.
                  </HelpTip>
                </span>
              </th>
              <th scope="col" className="px-3 py-3 text-right font-medium">CAPM expected</th>
              <th scope="col" className="px-3 py-3 text-right font-medium">Actual return</th>
              <th scope="col" className="px-3 py-3 text-right font-medium">
                <span className="inline-flex items-center justify-end gap-1.5">
                  Alpha
                  <HelpTip term="alpha" align="end">
                    Actual return minus the CAPM expected return. Positive means it beat what its beta predicted over
                    this period. It does not mean it will do so again.
                  </HelpTip>
                </span>
              </th>
              <th scope="col" className="px-3 py-3 text-right font-medium">
                <span className="inline-flex items-center justify-end gap-1.5">
                  R&sup2;
                  <HelpTip term="R squared" align="end">
                    The share of the investment&apos;s ups and downs that the market explains. Near 1 means it mostly
                    follows the market.
                  </HelpTip>
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.key} className="border-b border-line">
                <th scope="row" className="py-4 pr-4 font-medium">
                  {line.label}
                  {line.isBenchmark && <span className="ml-2 text-xs font-normal text-muted">market</span>}
                </th>
                <td className="px-3 py-4 text-right">{line.capm.beta.toFixed(2)}</td>
                <td className="px-3 py-4 text-right">{formatPercent(line.capm.expectedReturn)}</td>
                <td className="px-3 py-4 text-right">{formatPercent(line.capm.actualReturn)}</td>
                <td className={`px-3 py-4 text-right ${alphaTone(line.capm.alpha)}`}>
                  {line.isBenchmark ? "n/a" : formatSignedPercent(line.capm.alpha)}
                </td>
                <td className="px-3 py-4 text-right">{line.capm.rSquared.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-6 space-y-4 sm:hidden">
        {lines.map((line) => (
          <li key={line.key} className="rounded-panel border border-line bg-surface p-4">
            <h3 className="font-medium">{line.label}</h3>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-muted">Beta</dt>
                <dd className="mt-0.5 text-base">{line.capm.beta.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-muted">R&sup2;</dt>
                <dd className="mt-0.5 text-base">{line.capm.rSquared.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-muted">CAPM expected</dt>
                <dd className="mt-0.5 text-base">{formatPercent(line.capm.expectedReturn)}</dd>
              </div>
              <div>
                <dt className="text-muted">Actual return</dt>
                <dd className="mt-0.5 text-base">{formatPercent(line.capm.actualReturn)}</dd>
              </div>
              <div>
                <dt className="text-muted">Alpha</dt>
                <dd className={`mt-0.5 text-base ${alphaTone(line.capm.alpha)}`}>
                  {line.isBenchmark ? "n/a" : formatSignedPercent(line.capm.alpha)}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <p className="mt-6 max-w-prose text-sm text-muted">
        CAPM is a simplified model. It uses one factor, and this page estimates beta from the months shown and uses the
        market&apos;s realized return in place of an expected one, so short ranges give noisy results. A positive alpha
        is a description of the past, not a sign that an investment is a good buy.
      </p>
    </section>
  );
}
