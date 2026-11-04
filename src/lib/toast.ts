"use client";

import { toast } from "sonner";

/** App-wide toast helpers (sonner), themed by AppToaster. */
export const notify = {
  success: (message: string, description?: string) => toast.success(message, { description }),
  error: (message: string, description?: string) => toast.error(message, { description }),
  info: (message: string, description?: string) => toast.info(message, { description }),
  promise: toast.promise,
};

export function errorCode(error: unknown, fallback = "SERVER_ERROR") {
  return (error as { response?: { data?: { code?: string } } })?.response?.data?.code || fallback;
}
