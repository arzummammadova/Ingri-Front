import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", {
  variants: {
    variant: {
      lilac: "bg-lilac text-ink",
      mint: "bg-mint text-ink",
      peach: "bg-peach text-ink",
      aqua: "bg-aqua text-ink",
      ink: "bg-primary text-primary-foreground",
    },
  },
  defaultVariants: { variant: "lilac" },
});

function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
