import type { QueryClient } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";

import { meQueryOptions } from "./routeProtection";

export type RedirectIfAuthenticatedOptions = {
  // Where to send authenticated users (default is dashboard).
  to?: string;
};

// Public route guard.
// If the user is already authenticated, redirect them away from public pages
// like `/login` and `/signup`.
export async function redirectIfAuthenticated(args: {
  queryClient: QueryClient;
  location?: { pathname: string };
  options?: RedirectIfAuthenticatedOptions;
}) {
  const { queryClient, location, options } = args;

  try {
    await queryClient.ensureQueryData(meQueryOptions());
  } catch {
    // Not authenticated (or token refresh failed). Public route can render.
    return;
  }

  const to = options?.to ?? "/dashboard";

  // Avoid redirect loops (e.g. if `to` is misconfigured to the same public route).
  if (location?.pathname === to) return;

  throw redirect({ to });
}
