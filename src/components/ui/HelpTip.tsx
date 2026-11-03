"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

interface HelpTipProps {
  term: string;
  children: ReactNode;
  /** Which edge of the "?" button the popover lines up with. */
  align?: "start" | "end";
}

/** Small "?" button that explains a finance term on hover, focus or tap. */
export function HelpTip({ term, children, align = "start" }: HelpTipProps) {
  const id = useId();
  const root = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  return (
    <span
      ref={root}
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={`What is ${term}?`}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        className="relative inline-flex h-5 w-5 items-center justify-center rounded-full border border-edge text-xs font-semibold text-muted before:absolute before:-inset-3 before:content-[''] hover:text-ink"
      >
        ?
      </button>
      {open && (
        <span
          role="tooltip"
          id={id}
          className={`absolute top-full z-20 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-control border border-line bg-surface p-3 text-left text-sm font-normal leading-snug text-ink shadow-md ${
            align === "end" ? "right-0" : "left-0"
          }`}
        >
          {children}
        </span>
      )}
    </span>
  );
}
