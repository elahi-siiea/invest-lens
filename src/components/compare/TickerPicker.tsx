"use client";

import { useId, useState, type FormEvent, type KeyboardEvent } from "react";
import { MAX_TICKERS, normalizeSymbol, SUGGESTED_TICKERS } from "@/lib/data/tickers";
import { Button } from "@/components/ui/Button";
import { seriesColor } from "./colors";

interface TickerPickerProps {
  tickers: readonly string[];
  onAdd: (symbol: string) => void;
  onRemove: (symbol: string) => void;
}

const EXAMPLES = ["VTI", "SPY", "QQQ", "AAPL"];

export function TickerPicker({ tickers, onAdd, onRemove }: TickerPickerProps) {
  const id = useId();
  const listId = `${id}-list`;
  const hintId = `${id}-hint`;
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [problem, setProblem] = useState<string | null>(null);

  const full = tickers.length >= MAX_TICKERS;
  const query = text.trim().toUpperCase();
  const matches = SUGGESTED_TICKERS.filter(
    (entry) =>
      !tickers.includes(entry.symbol) &&
      (query === "" || entry.symbol.startsWith(query) || entry.name.toUpperCase().includes(query)),
  ).slice(0, 6);

  const add = (value: string) => {
    const symbol = normalizeSymbol(value);
    if (!symbol) return setProblem("Enter a ticker such as VTI or AAPL.");
    if (tickers.includes(symbol)) return setProblem(`${symbol} is already added.`);
    setProblem(null);
    setText("");
    setOpen(false);
    setActive(-1);
    onAdd(symbol);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const chosen = open && active >= 0 ? matches[active]?.symbol : undefined;
    add(chosen ?? text);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((index) => Math.min(index + 1, matches.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  };

  return (
    <div>
      <ul className="flex flex-wrap gap-2" aria-label="Selected tickers">
        {tickers.map((symbol, index) => (
          <li
            key={symbol}
            className="inline-flex min-h-11 items-center gap-2 rounded-control border border-edge bg-surface pl-3"
          >
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ background: seriesColor(index) }} />
            <span className="font-medium">{symbol}</span>
            <button
              type="button"
              aria-label={`Remove ${symbol}`}
              onClick={() => onRemove(symbol)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center text-lg text-muted hover:text-ink"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={submit} className="relative mt-3 flex max-w-md gap-2">
        <div className="relative flex-1">
          <label htmlFor={id} className="sr-only">
            Add a ticker
          </label>
          <input
            id={id}
            type="text"
            role="combobox"
            aria-expanded={open && matches.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={open && active >= 0 ? `${id}-option-${active}` : undefined}
            aria-describedby={hintId}
            aria-invalid={problem !== null}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            disabled={full}
            placeholder={full ? "Five tickers is the maximum" : "Add a ticker, for example VTI"}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setProblem(null);
              setOpen(true);
              setActive(-1);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={onKeyDown}
            className="min-h-11 w-full rounded-control border border-edge bg-surface px-3 text-base disabled:opacity-60"
          />
          {open && matches.length > 0 && (
            <ul
              id={listId}
              role="listbox"
              aria-label="Suggested tickers"
              className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-control border border-line bg-surface py-1 shadow-md"
            >
              {matches.map((entry, index) => (
                <li
                  key={entry.symbol}
                  id={`${id}-option-${index}`}
                  role="option"
                  aria-selected={index === active}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => add(entry.symbol)}
                  className={`flex min-h-11 cursor-pointer flex-col justify-center px-3 ${index === active ? "bg-line" : "hover:bg-line"}`}
                >
                  <span className="font-medium">{entry.symbol}</span>
                  <span className="text-sm text-muted">{entry.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Button type="submit" variant="primary" disabled={full}>
          Add
        </Button>
      </form>

      <p id={hintId} aria-live="polite" className={`mt-2 min-h-6 text-sm ${problem ? "text-loss" : "text-muted"}`}>
        {problem ??
          (tickers.length < 2
            ? "Pick two to five stocks or ETFs. The S&P 500 is added as a benchmark."
            : `${tickers.length} of ${MAX_TICKERS} added.`)}
      </p>

      {tickers.length < MAX_TICKERS && (
        <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
          Examples:
          {EXAMPLES.filter((symbol) => !tickers.includes(symbol)).map((symbol) => (
            <button
              key={symbol}
              type="button"
              onClick={() => add(symbol)}
              className="min-h-11 rounded-control px-2 font-medium text-accent hover:underline"
            >
              {symbol}
            </button>
          ))}
        </p>
      )}
    </div>
  );
}
