import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        success: "border-transparent bg-success text-success-foreground",
        warning: "border-transparent bg-warning text-warning-foreground",
        info: "border-transparent bg-info text-info-foreground",
        // Status badges
        idle: "border-transparent bg-status-idle/15 text-status-idle",
        active: "border-transparent bg-status-active/15 text-status-active",
        charging: "border-transparent bg-status-charging/15 text-status-charging",
        error: "border-transparent bg-status-error/15 text-status-error",
        offline: "border-transparent bg-status-offline/15 text-status-offline",
        // Priority badges
        low: "border-transparent bg-muted text-muted-foreground",
        normal: "border-transparent bg-info/15 text-info",
        high: "border-transparent bg-warning/15 text-warning",
        critical: "border-transparent bg-destructive/15 text-destructive animate-pulse",
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
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
