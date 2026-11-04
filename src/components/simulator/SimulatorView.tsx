"use client";

import { HelpTip } from "@/components/ui/HelpTip";
import { SliderField } from "@/components/ui/SliderField";
import { costOfFees, simulateGrowth, simulateRange } from "@/lib/finance";
import { formatUsd } from "@/lib/format";
import { usePersistedState } from "@/lib/storage";
import { FeeCard } from "./FeeCard";
import { GrowthChart } from "./GrowthChart";
import {
  DEFAULT_SETTINGS,
  LIMITS,
  matchesPreset,
  parseSettings,
  PRESETS,
  SIMULATOR_STORAGE_KEY,
  toSimulationInput,
  type SimulatorSettings,
} from "./settings";

export function SimulatorView() {
  const [settings, save] = usePersistedState(SIMULATOR_STORAGE_KEY, DEFAULT_SETTINGS, parseSettings);
  const update = (patch: Partial<SimulatorSettings>) => save({ ...settings, ...patch });

  const input = toSimulationInput(settings);
  const points = simulateGrowth(input);
  const impact = costOfFees(input);
  const range = simulateRange(input, settings.volatilityPct / 100);
  const last = points.at(-1);

  return (
    <div>
      <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Investing simulator</h1>
      <p className="mt-3 max-w-prose text-lg text-muted">
        Change the inputs to see how a balance could grow, and how much fees and inflation take out of it. Every number
        follows from the assumptions you set. None of it is a forecast.
      </p>

      <section aria-labelledby="results-heading" className="mt-10 border-y border-line py-8">
        <h2 id="results-heading" className="sr-only">
          Projected results
        </h2>
        <dl className="grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="py-5 first:pt-0 sm:px-8 sm:py-0 sm:first:pl-0 sm:last:pr-0">
            <dt className="flex min-h-6 items-center text-sm text-muted">
              Balance after {settings.years} {settings.years === 1 ? "year" : "years"}
            </dt>
            <dd className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">{formatUsd(last?.nominal ?? 0)}</dd>
          </div>
          <div className="py-5 sm:px-8 sm:py-0">
            <dt className="flex min-h-6 items-center gap-2 text-sm text-muted">
              In today&apos;s dollars
              <HelpTip term="inflation-adjusted value">
                The same balance, measured in what money buys today. Prices rise over time, so a future dollar buys less
                than a dollar now.
              </HelpTip>
            </dt>
            <dd className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">{formatUsd(last?.real ?? 0)}</dd>
          </div>
          <div className="py-5 last:pb-0 sm:px-8 sm:py-0 sm:last:pr-0">
            <dt className="flex min-h-6 items-center text-sm text-muted">Total you put in</dt>
            <dd className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">{formatUsd(last?.contributions ?? 0)}</dd>
          </div>
        </dl>
        <p className="mt-6 text-sm text-muted">
          Assumes {settings.returnPct}% a year before fees, a {settings.feePct}% fee, {settings.inflationPct}% inflation and{" "}
          {settings.volatilityPct}% volatility.
        </p>
      </section>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16">
        <section aria-labelledby="inputs-heading">
          <h2 id="inputs-heading" className="font-display text-xl">
            Your assumptions
          </h2>

          <div role="group" aria-label="Preset scenarios" className="mt-4 grid grid-cols-3 gap-2">
            {PRESETS.map((preset) => {
              const active = matchesPreset(settings, preset);
              return (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    update({
                      returnPct: preset.returnPct,
                      inflationPct: preset.inflationPct,
                      feePct: preset.feePct,
                      volatilityPct: preset.volatilityPct,
                    })
                  }
                  className={`min-h-14 rounded-control border px-2 py-2 text-center text-sm font-medium transition-colors ${
                    active ? "border-accent bg-accent text-on-accent" : "border-edge bg-surface hover:border-ink"
                  }`}
                >
                  {preset.name}
                  <span className={`block text-xs font-normal ${active ? "" : "text-muted"}`}>
                    {preset.returnPct}% return
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-sm text-muted">
            Presets set the return, volatility, inflation and fee. They are example assumptions, not predictions.
          </p>

          <div className="mt-8 space-y-6">
            <SliderField
              label="Starting amount"
              prefix="$"
              value={settings.startingAmount}
              onChange={(startingAmount) => update({ startingAmount })}
              {...LIMITS.startingAmount}
            />
            <SliderField
              label="Monthly contribution"
              prefix="$"
              value={settings.monthlyContribution}
              onChange={(monthlyContribution) => update({ monthlyContribution })}
              {...LIMITS.monthlyContribution}
            />
            <SliderField
              label="Years"
              suffix="yrs"
              value={settings.years}
              onChange={(years) => update({ years })}
              {...LIMITS.years}
            />
            <SliderField
              label="Expected annual return"
              suffix="%"
              help={
                <HelpTip term="expected annual return">
                  The average yearly growth you assume, before fees. Real returns change from year to year and can be
                  negative. This is a number you choose, not a prediction.
                </HelpTip>
              }
              value={settings.returnPct}
              onChange={(returnPct) => update({ returnPct })}
              {...LIMITS.returnPct}
            />
            <SliderField
              label="Expected volatility"
              suffix="%"
              help={
                <HelpTip term="volatility">
                  How much returns swing from year to year. Higher volatility widens the shaded range of outcomes on the
                  chart. Broad stock funds usually swing more than bond funds.
                </HelpTip>
              }
              value={settings.volatilityPct}
              onChange={(volatilityPct) => update({ volatilityPct })}
              {...LIMITS.volatilityPct}
            />
            <SliderField
              label="Inflation rate"
              suffix="%"
              help={
                <HelpTip term="inflation">
                  How fast prices rise each year. Higher inflation means your future balance buys less.
                </HelpTip>
              }
              value={settings.inflationPct}
              onChange={(inflationPct) => update({ inflationPct })}
              {...LIMITS.inflationPct}
            />
            <SliderField
              label="Annual fee"
              suffix="%"
              help={
                <HelpTip term="an annual fee">
                  A yearly percent of your balance paid to a fund or advisor. Check a fund&apos;s expense ratio to find
                  its fee.
                </HelpTip>
              }
              value={settings.feePct}
              onChange={(feePct) => update({ feePct })}
              {...LIMITS.feePct}
            />
          </div>
        </section>

        <div className="space-y-10">
          <GrowthChart data={points} range={range} />
          <FeeCard impact={impact} feePct={settings.feePct} years={settings.years} />
        </div>
      </div>
    </div>
  );
}
