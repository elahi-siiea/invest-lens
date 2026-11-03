import type { SimulationInput } from "@/lib/finance";

export interface SimulatorSettings {
  startingAmount: number;
  monthlyContribution: number;
  years: number;
  returnPct: number;
  inflationPct: number;
  feePct: number;
}

export const SIMULATOR_STORAGE_KEY = "invest-lens:simulator:v1";

export const DEFAULT_SETTINGS: SimulatorSettings = {
  startingAmount: 10_000,
  monthlyContribution: 300,
  years: 20,
  returnPct: 6,
  inflationPct: 2.5,
  feePct: 0.5,
};

export const LIMITS: Record<keyof SimulatorSettings, { min: number; max: number; step: number }> = {
  startingAmount: { min: 0, max: 1_000_000, step: 500 },
  monthlyContribution: { min: 0, max: 10_000, step: 25 },
  years: { min: 1, max: 50, step: 1 },
  returnPct: { min: 0, max: 15, step: 0.1 },
  inflationPct: { min: 0, max: 10, step: 0.1 },
  feePct: { min: 0, max: 3, step: 0.05 },
};

export interface Preset {
  id: string;
  name: string;
  returnPct: number;
  inflationPct: number;
  feePct: number;
}

export const PRESETS: readonly Preset[] = [
  { id: "conservative", name: "Conservative", returnPct: 4, inflationPct: 2.5, feePct: 0.2 },
  { id: "balanced", name: "Balanced", returnPct: 6, inflationPct: 2.5, feePct: 0.2 },
  { id: "aggressive", name: "Aggressive", returnPct: 8, inflationPct: 2.5, feePct: 0.2 },
];

export function matchesPreset(settings: SimulatorSettings, preset: Preset): boolean {
  return (
    settings.returnPct === preset.returnPct &&
    settings.inflationPct === preset.inflationPct &&
    settings.feePct === preset.feePct
  );
}

export function parseSettings(raw: unknown): SimulatorSettings | null {
  if (typeof raw !== "object" || raw === null) return null;
  const record = raw as Record<string, unknown>;
  const result = { ...DEFAULT_SETTINGS };
  for (const key of Object.keys(LIMITS) as (keyof SimulatorSettings)[]) {
    const value = record[key];
    const { min, max } = LIMITS[key];
    if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) return null;
    result[key] = value;
  }
  return result;
}

export function toSimulationInput(settings: SimulatorSettings): SimulationInput {
  return {
    startingAmount: settings.startingAmount,
    monthlyContribution: settings.monthlyContribution,
    years: settings.years,
    annualReturn: settings.returnPct / 100,
    inflation: settings.inflationPct / 100,
    annualFee: settings.feePct / 100,
  };
}
