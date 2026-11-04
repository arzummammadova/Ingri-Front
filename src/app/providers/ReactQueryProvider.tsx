"use client";

import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { authService } from "@/services/authService";

function CsrfBootstrap() {
  useQuery({ queryKey: ["csrf"], queryFn: authService.csrf, staleTime: Infinity, retry: 1 });
  return null;
}

export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 20_000 } },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <CsrfBootstrap />
      {children}
    </QueryClientProvider>
  );
}
