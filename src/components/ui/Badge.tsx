import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "vip" | "vvip" | "creator" | "media" | "outline";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  let badgeStyles = "bg-surface-soft text-ink border border-hairline";

  if (variant === "success") {
    badgeStyles = "bg-[#edf7ed] text-[#287a57] border border-[#287a57]/30";
  } else if (variant === "warning") {
    badgeStyles = "bg-[#fff8e6] text-[#b54708] border border-[#b54708]/30";
  } else if (variant === "error") {
    badgeStyles = "bg-[#fef3f2] text-[#b42318] border border-[#b42318]/30";
  } else if (variant === "vip") {
    badgeStyles = "bg-block-lime text-ink border border-[#ecd959] font-semibold";
  } else if (variant === "vvip") {
    badgeStyles = "bg-primary text-white font-semibold";
  } else if (variant === "creator") {
    badgeStyles = "bg-block-lilac text-ink border border-[#91a0fc] font-medium";
  } else if (variant === "media") {
    badgeStyles = "bg-block-navy text-white font-medium";
  } else if (variant === "outline") {
    badgeStyles = "bg-transparent text-ink border border-hairline";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide",
        badgeStyles,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
