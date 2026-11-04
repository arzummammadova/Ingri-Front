import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-md border border-border bg-card px-4 text-sm text-foreground shadow-glass outline-none transition placeholder:text-muted-foreground focus:border-lilac-deep focus:ring-2 focus:ring-lilac",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
