import { api } from "./api";
import type { User } from "@/types";

export const authService = {
  csrf: () => api.get<{ csrfToken: string }>("/auth/csrf"),
  me: async () => (await api.get<{ user: User }>("/auth/me")).data.user,
  login: async (body: { email: string; password: string }) =>
    (await api.post<{ user: User }>("/auth/login", body)).data.user,
  register: (body: { name: string; email: string; password: string; locale: string; level?: string }) =>
    api.post("/auth/register", body),
  placement: async () => (await api.get<{ questions: { prompt: string; options: string[]; level: string }[] }>("/placement")).data.questions,
  scorePlacement: async (answers: number[]) =>
    (await api.post<{ score: number; suggested: string }>("/placement", { answers })).data,
  logout: () => api.post("/auth/logout"),
  forgot: (email: string) => api.post("/auth/forgot-password", { email }),
  reset: (token: string, password: string) => api.post("/auth/reset-password", { token, password }),
  verify: (token: string) => api.post("/auth/verify-email", { token }),
  resend: (email: string) => api.post("/auth/resend-verification", { email }),
  changePassword: (currentPassword: string, password: string) =>
    api.post("/auth/change-password", { currentPassword, password }),
  deleteAccount: (password: string) => api.delete("/auth/account", { data: { password } }),
};
