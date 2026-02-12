import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/forbidden")({
  component: ForbiddenPage,
});

function ForbiddenPage() {
  return (
    <AppShell>
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <div className="text-xl font-semibold">Access denied</div>
        <div className="text-sm text-muted-foreground">
          You do not have permission to view this page.
        </div>
        <Link to="/" className="text-sm underline">
          Go home
        </Link>
      </div>
    </AppShell>
  );
}
