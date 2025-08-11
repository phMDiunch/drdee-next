"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: Data được coi là fresh trong 5 phút
            staleTime: 5 * 60 * 1000, // 5 minutes
            // Cache time: Data được giữ trong cache 10 phút
            gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
            // Retry: Thử lại 3 lần nếu fail
            retry: 3,
            // Refetch: Tự động refetch khi window focus
            refetchOnWindowFocus: false,
            // Refetch: Tự động refetch khi reconnect
            refetchOnReconnect: true,
          },
          mutations: {
            // Retry mutations 1 lần
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools chỉ hiển thị trong development */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
}
