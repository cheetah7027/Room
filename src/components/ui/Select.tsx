"use client";

import React, { forwardRef } from "react";
import { CaretDown } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, containerClassName, children, disabled, ...props }, ref) => {
    return (
      <div className={cn("relative inline-block", containerClassName)}>
        <select
          ref={ref}
          disabled={disabled}
          className={cn(
            "appearance-none w-full pl-3.5 pr-8 py-2 bg-canvas border border-hairline rounded-md text-xs font-medium text-ink cursor-pointer",
            "font-sans transition-all duration-150",
            "hover:border-ink/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-soft",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-ink/50">
          <CaretDown className="w-3.5 h-3.5" />
        </div>
      </div>
    );
  }
);

Select.displayName = "Select";
