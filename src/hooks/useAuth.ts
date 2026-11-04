"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { authService } from "@/services/authService";

export function useAuth() {
  const locale = useLocale();
  const queryClient = useQueryClient();
  const me = useQuery({
    queryKey: ["me"],
    queryFn: authService.me,
    retry: false,
  });
  const logout = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.clear();
      window.location.href = `/${locale}/login`;
    },
  });
  return { user: me.data, isLoading: me.isLoading, logout };
}
