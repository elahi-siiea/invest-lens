import type { ReactNode } from "react";

interface StateMessageProps {
  tone: "empty" | "error";
  title: string;
  children: ReactNode;
  action?: ReactNode;
}

/** Empty and error states: say what happened, then offer the next step. */
export function StateMessage({ tone, title, children, action }: StateMessageProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className="rounded-panel border border-line bg-surface p-6 sm:p-8"
    >
      <h2 className="font-display text-xl">
        {tone === "error" && <span className="text-loss">Problem: </span>}
        {title}
      </h2>
      <p className="mt-2 max-w-prose text-muted">{children}</p>
      {action && <div className="mt-5 flex flex-wrap gap-3">{action}</div>}
    </div>
  );
}
