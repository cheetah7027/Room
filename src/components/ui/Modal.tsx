"use client";

import React, { useEffect } from "react";
import { X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "lg",
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWMap = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          "relative w-full bg-canvas rounded-lg shadow-modal border border-hairline overflow-hidden z-10 transition-all transform animate-in fade-in zoom-in-95 duration-150 p-6 md:p-8",
          maxWMap[maxWidth]
        )}
      >
        <div className="flex items-start justify-between pb-4 border-b border-hairline">
          <div>
            {title && <h3 className="headline text-xl font-semibold text-ink">{title}</h3>}
            {description && <p className="text-sm text-ink/70 mt-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-soft text-ink flex items-center justify-center hover:bg-hairline transition-colors ml-4"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
