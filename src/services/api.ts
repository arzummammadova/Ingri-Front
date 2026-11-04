import axios from "axios";
import { readCookie } from "@/lib/utils";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  withCredentials: true,
});

let refreshPromise: Promise<void> | null = null;

api.interceptors.request.use((config) => {
  const token = readCookie("csrfToken");
  if (token) config.headers["X-CSRF-Token"] = token;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const url = String(original?.url || "");
    const status = error.response?.status;
    const skip =
      url.includes("/auth/login") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/register") ||
      url.includes("/auth/csrf");
    if (status === 401 && original && !original._retry && !skip) {
      original._retry = true;
      refreshPromise ||= api
        .post("/auth/refresh")
        .then(() => undefined)
        .finally(() => {
          refreshPromise = null;
        });
      try {
        await refreshPromise;
        return api(original);
      } catch {
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          const locale = window.location.pathname.split("/")[1] || "az";
          window.location.href = `/${locale}/login`;
        }
      }
    }
    return Promise.reject(error);
  },
);
