import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-md border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-lilac-deep focus:ring-2 focus:ring-lilac",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
