"use client";

import { useSyncExternalStore } from "react";
import { writeStorage } from "@/lib/storage";
import { THEME_STORAGE_KEY } from "./theme";

type Theme = "light" | "dark";

function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, currentTheme, () => "light" as Theme);
  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => {
        document.documentElement.dataset.theme = next;
        writeStorage(THEME_STORAGE_KEY, next);
      }}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-control border border-edge px-3 text-sm font-medium hover:border-ink"
    >
      <span className="sr-only">Switch to {next} theme</span>
      <span aria-hidden="true">{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}
