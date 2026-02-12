import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { queryClient } from "@/lib/query-client";
import { FullPageSpinner } from "@/components/ui/spinner";

type RouterContext = {
  queryClient: typeof queryClient;
};

const RootLayout = () => (
  <>
    {/* <div className="p-2 flex gap-2">
      <Link to="/" className="[&.active]:font-bold">
        Home
      </Link>{' '}
      <Link to="/editor" className="[&.active]:font-bold">
        Editor
      </Link>{' '}
      <Link to="/dashboard" className="[&.active]:font-bold">
        Documents
      </Link>{' '}
      <Link to="/about" className="[&.active]:font-bold">
        About
      </Link>
    </div>
    <hr /> */}
    <Outlet />
    {import.meta.env.DEV && <TanStackRouterDevtools />}
  </>
);

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  // This shows a consistent spinner whenever any route is pending due to async
  // `beforeLoad` work (auth/RBAC guards, permission checks, data prefetching, etc.).
  pendingComponent: () => <FullPageSpinner />,
});
