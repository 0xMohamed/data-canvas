import * as React from "react";

import { cn } from "@/lib/utils";

type SpinnerSize = "sm" | "md" | "lg" | "xl";

const sizeClassName: Record<SpinnerSize, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-[3px]",
  xl: "h-10 w-10 border-[3px]",
};

export type SpinnerProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: SpinnerSize;
  label?: string;
};

// Reusable, consistent loading UI for the app.
// Use `FullPageSpinner` for route-level loading (e.g. beforeLoad guards, prefetching).
export function Spinner({
  size = "md",
  label,
  className,
  ...props
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label ?? "Loading"}
      className={cn("inline-flex items-center gap-2", className)}
      {...props}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-muted-foreground/30 border-t-muted-foreground",
          sizeClassName[size],
        )}
      />
      {label ? <div className="text-sm text-muted-foreground">{label}</div> : null}
    </div>
  );
}

export type FullPageSpinnerProps = {
  label?: string;
};

export function FullPageSpinner({ label }: FullPageSpinnerProps) {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Spinner size="xl" label={label ?? "Loading…"} />
    </div>
  );
}
