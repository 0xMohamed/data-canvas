import * as React from "react";

import { cn } from "@/lib/utils";

export type AppShellProps = {
  children: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
};

// Shared page shell for non-editor pages.
// Editor uses its own full-screen layout (EditorCanvas), so we only apply this
// shell to routes like login/signup/dashboard.
export function AppShell({ children, header, className }: AppShellProps) {
  return (
    <div className={cn("min-h-screen bg-background text-[color:var(--text)]", className)}>
      {header ? (
        <div className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
            {header}
          </div>
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">{children}</div>
    </div>
  );
}

export type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

// Consistent centered card layout for auth pages.
export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-black/20 p-6 shadow-lg backdrop-blur">
        <div className="text-lg font-semibold tracking-tight">{title}</div>
        {subtitle ? (
          <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div>
        ) : null}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
