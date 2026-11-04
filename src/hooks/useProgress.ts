"use client";

import { useQuery } from "@tanstack/react-query";
import { progressService } from "@/services/contentService";

export function useProgress() {
  return useQuery({ queryKey: ["progress"], queryFn: progressService.get });
}
