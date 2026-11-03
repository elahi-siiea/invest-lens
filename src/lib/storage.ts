"use client";

import { useCallback, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
const snapshots = new Map<string, { raw: string | null; value: unknown }>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be blocked or full; the app keeps working without it.
  }
  listeners.forEach((listener) => listener());
}

/**
 * State backed by localStorage. Renders `fallback` on the server and during
 * hydration, then switches to the saved value. `parse` must return null for
 * anything it does not recognise, so stale or edited data is ignored.
 */
export function usePersistedState<T>(
  key: string,
  fallback: T,
  parse: (raw: unknown) => T | null,
): [T, (next: T) => void] {
  const getSnapshot = useCallback((): T => {
    const raw = readStorage(key);
    const cached = snapshots.get(key);
    if (cached && cached.raw === raw) return cached.value as T;

    let value = fallback;
    if (raw !== null) {
      try {
        value = parse(JSON.parse(raw)) ?? fallback;
      } catch {
        value = fallback;
      }
    }
    snapshots.set(key, { raw, value });
    return value;
  }, [key, fallback, parse]);

  const value = useSyncExternalStore(subscribe, getSnapshot, () => fallback);
  const set = useCallback((next: T) => writeStorage(key, JSON.stringify(next)), [key]);
  return [value, set];
}
