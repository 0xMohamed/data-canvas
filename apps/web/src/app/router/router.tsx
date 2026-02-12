import { createRouter, RouterProvider } from "@tanstack/react-router";
import { queryClient } from "@/lib/query-client";
import { routeTree } from "./routeTree.gen";

type RouterContext = {
  // Route guards (`beforeLoad`) use this to read the authenticated user and
  // optionally prefetch/authorize resources.
  queryClient: typeof queryClient;
};

const router = createRouter({
  routeTree,
  context: {
    queryClient,
  } satisfies RouterContext,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function AppRouter() {
  return <RouterProvider router={router} context={{ queryClient }} />;
}
