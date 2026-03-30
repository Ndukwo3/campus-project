"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // How long the data stays "fresh" (5 minutes)
            staleTime: 5 * 60 * 1000,
            // How long the data stays in memory after it becomes stale
            gcTime: 10 * 60 * 1000,
            // Automatically refetch on window focus for real-time feel
            refetchOnWindowFocus: true,
            // Retry failed fetches 3 times
            retry: 3,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
