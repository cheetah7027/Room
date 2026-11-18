import React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-canvas border border-hairline rounded-lg p-6 transition-all hover:border-ink/20",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function ColorBlock({
  variant = "lime",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: "lime" | "lilac" | "cream" | "navy" }) {
  let colorClass = "bg-block-lime text-ink";
  if (variant === "lilac") colorClass = "bg-block-lilac text-ink";
  if (variant === "cream") colorClass = "bg-block-cream text-ink";
  if (variant === "navy") colorClass = "bg-block-navy text-white";

  return (
    <div
      className={cn("rounded-lg p-8 md:p-12 transition-all", colorClass, className)}
      {...props}
    >
      {children}
    </div>
  );
}
