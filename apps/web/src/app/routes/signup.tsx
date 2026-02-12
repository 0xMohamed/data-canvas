import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { AuthCard } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRegister } from "@/features/auth/hooks";
import { redirectIfAuthenticated } from "@/features/auth/publicRouteProtection";

export const Route = createFileRoute("/signup")({
  beforeLoad: async ({ context, location }) => {
    await redirectIfAuthenticated({
      queryClient: context.queryClient,
      location,
      options: {
        // Avoid loops by redirecting away from /signup for already-authenticated users.
        to: "/dashboard",
      },
    });
  },
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const register = useRegister();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AuthCard title="Create account" subtitle="Sign up to start creating documents">
      <div className="flex flex-col gap-3">
        <Input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
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
          autoComplete="new-password"
        />

        <Button
          disabled={register.isPending}
          onClick={async () => {
            await register.mutateAsync({ name, email, password });
            navigate({ to: "/login", search: { redirect: undefined } });
          }}
        >
          {register.isPending ? "Creating…" : "Sign up"}
        </Button>

        {register.isError && (
          <div className="text-sm text-red-600">Failed to sign up</div>
        )}

        <button
          className="mt-2 text-sm text-muted-foreground underline"
          onClick={() => navigate({ to: "/login", search: { redirect: undefined } })}
          type="button"
        >
          Already have an account?
        </button>
      </div>
    </AuthCard>
  );
}
