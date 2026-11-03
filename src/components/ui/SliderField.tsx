"use client";

import { useId, useState, type ReactNode } from "react";

interface SliderFieldProps {
  label: string;
  help?: ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  onChange: (value: number) => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** A number input and a slider that edit the same value. */
export function SliderField({ label, help, value, min, max, step, prefix, suffix, onChange }: SliderFieldProps) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);

  const handleInput = (text: string) => {
    setDraft(text);
    const parsed = Number(text);
    if (text.trim() !== "" && Number.isFinite(parsed)) onChange(clamp(parsed, min, max));
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <label htmlFor={id} className="text-sm font-medium">
            {label}
          </label>
          {help}
        </span>
        <span className="flex min-h-11 items-center rounded-control border border-edge bg-surface px-3 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
          {prefix && <span className="mr-1 text-muted">{prefix}</span>}
          <input
            id={id}
            type="number"
            inputMode="decimal"
            min={min}
            max={max}
            step={step}
            value={draft ?? String(value)}
            onChange={(event) => handleInput(event.target.value)}
            onBlur={() => setDraft(null)}
            className="w-24 bg-transparent py-2 text-right text-base focus-visible:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          {suffix && <span className="ml-1 text-muted">{suffix}</span>}
        </span>
      </div>
      <input
        type="range"
        aria-label={`${label} slider`}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => {
          setDraft(null);
          onChange(Number(event.target.value));
        }}
        className="mt-1 h-11 w-full cursor-pointer accent-accent"
      />
    </div>
  );
}
