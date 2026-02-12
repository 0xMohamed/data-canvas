import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { AuthCard } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/features/auth/hooks";
import { redirectIfAuthenticated } from "@/features/auth/publicRouteProtection";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    };
  },
  beforeLoad: async ({ context, location }) => {
    await redirectIfAuthenticated({
      queryClient: context.queryClient,
      location,
      options: {
        // Avoid loops by redirecting away from /login for already-authenticated users.
        to: "/dashboard",
      },
    });
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const search = Route.useSearch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AuthCard title="Login" subtitle="Sign in to access your dashboard">
      <div className="flex flex-col gap-3">
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <Button
          disabled={login.isPending}
          onClick={async () => {
            await login.mutateAsync({ email, password });
            const redirectTo =
              typeof search.redirect === "string" && search.redirect.startsWith("/")
                ? search.redirect
                : "/dashboard";
            navigate({ to: redirectTo });
          }}
        >
          {login.isPending ? "Signing in…" : "Login"}
        </Button>

        {login.isError && (
          <div className="text-sm text-red-600">Failed to login</div>
        )}

        <button
          className="mt-2 text-sm text-muted-foreground underline"
          onClick={() => navigate({ to: "/signup" })}
          type="button"
        >
          Create an account
        </button>
      </div>
    </AuthCard>
  );
}
