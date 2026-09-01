import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-brand text-white",
        primary: "border-transparent bg-brand text-white",
        secondary: "border border-border bg-slate-100 text-slate-800",
        warning: "border-transparent bg-amber-100 text-amber-900 border border-amber-200",
        overdue: "border-transparent bg-amber-100 text-amber-900 border border-amber-200",
        dueToday: "border-transparent bg-slate-900 text-white",
        completed: "border-transparent bg-emerald-100 text-emerald-900 border border-emerald-200",
        unassigned: "border border-border bg-surface-subtle text-content-muted",
        cancelled: "border border-border bg-slate-100 text-content-subtle",
        danger: "border-transparent bg-red-100 text-red-900 border border-red-200",
        info: "border-transparent bg-blue-100 text-blue-900 border border-blue-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
