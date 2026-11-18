import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "icon" | "icon-inverse" | "promo" | "ghost";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    let variantClasses = "";
    if (variant === "primary") {
      variantClasses = "bg-primary text-white rounded-pill hover:bg-primary-pressed shadow-sm";
    } else if (variant === "secondary") {
      variantClasses = "bg-canvas text-ink border border-hairline rounded-pill hover:bg-surface-soft";
    } else if (variant === "promo") {
      variantClasses = "bg-primary text-white rounded-pill hover:bg-primary-pressed";
    } else if (variant === "icon") {
      variantClasses = "w-10 h-10 rounded-full bg-surface-soft text-ink hover:bg-hairline flex-shrink-0";
    } else if (variant === "icon-inverse") {
      variantClasses = "w-10 h-10 rounded-full bg-white/20 text-white hover:bg-white/30 flex-shrink-0";
    } else if (variant === "ghost") {
      variantClasses = "bg-transparent text-ink hover:bg-surface-soft rounded-pill";
    }

    let sizeClasses = "";
    if (variant === "icon" || variant === "icon-inverse") {
      sizeClasses = "";
    } else if (size === "sm") {
      sizeClasses = "text-sm px-4 py-1.5";
    } else if (size === "md") {
      sizeClasses = "text-base px-5 py-2.5";
    } else if (size === "lg") {
      sizeClasses = "text-lg px-7 py-3.5";
    }

    return (
      <button
        ref={ref}
        className={cn(base, variantClasses, sizeClasses, className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
