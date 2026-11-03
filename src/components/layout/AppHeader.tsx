"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

const TABS = [
  { href: "/", label: "Compare" },
  { href: "/simulator", label: "Simulator" },
] as const;

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 sm:gap-8 sm:px-6 lg:px-8">
        <Link href="/" className="py-3 font-display text-lg font-semibold tracking-tight sm:text-xl">
          Invest Lens
        </Link>
        <nav aria-label="Tools" className="flex">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 items-center border-b-2 px-2.5 text-sm font-medium sm:px-4 ${
                  active ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
