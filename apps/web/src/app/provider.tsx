import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundary } from 'react-error-boundary';
// import { HelmetProvider } from 'react-helmet-async';

// import { MainErrorFallback } from '@/components/errors/main';
import { queryClient } from '../lib/query-client';
// import { Notifications } from '@/components/ui/notifications';
// import { Spinner } from '@/components/ui/spinner';
// import { AuthLoader } from '@/lib/auth';

type AppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {


  return (
    <React.Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center">
          {/* <Spinner size="xl" /> */}
        </div>
      }
    >
      <ErrorBoundary FallbackComponent={() => <div>refersh</div>}>
        {/* <HelmetProvider> */}
          <QueryClientProvider client={queryClient}>
            {import.meta.env.DEV && <ReactQueryDevtools />}
            {/* <Notifications />
            <AuthLoader
              renderLoading={() => (
                <div className="flex h-screen w-screen items-center justify-center">
                  <Spinner size="xl" />
                </div>
              )}
            > */}
              {children}
            {/* </AuthLoader> */}
          </QueryClientProvider>
        {/* </HelmetProvider> */}
      </ErrorBoundary>
    </React.Suspense>
  );
};