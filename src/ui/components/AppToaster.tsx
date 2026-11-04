"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";

export default function AppToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      position="top-center"
      richColors
      closeButton
      duration={4500}
      toastOptions={{
        classNames: {
          toast: "!rounded-2xl !border !border-border !shadow-soft !font-sans",
          title: "!font-semibold",
          description: "!text-sm !opacity-80",
        },
      }}
    />
  );
}
