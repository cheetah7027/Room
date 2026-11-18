"use client";

import React, { useEffect, useRef } from "react";
import { roomAnimationData } from "./roomAnimationData";

export interface RoomLoadingProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  text?: string;
  className?: string;
  fullPage?: boolean;
}

export function RoomLoading({
  size = "md",
  text,
  className = "",
  fullPage = false,
}: RoomLoadingProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const getDimensions = () => {
    if (typeof size === "number") {
      return { width: size, height: Math.round(size * (13 / 12)) };
    }
    switch (size) {
      case "xs":
        return { width: 24, height: 26 };
      case "sm":
        return { width: 36, height: 39 };
      case "lg":
        return { width: 84, height: 91 };
      case "xl":
        return { width: 120, height: 130 };
      case "md":
      default:
        return { width: 56, height: 61 };
    }
  };

  const { width, height } = getDimensions();

  useEffect(() => {
    let anim: any = null;
    let isCancelled = false;

    import("lottie-web").then((lottieModule) => {
      if (isCancelled || !containerRef.current) return;
      const lottie = lottieModule.default || lottieModule;
      anim = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData: roomAnimationData,
      });
    });

    return () => {
      isCancelled = true;
      if (anim) {
        anim.destroy();
      }
    };
  }, []);

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        ref={containerRef}
        style={{ width, height }}
        className="flex items-center justify-center shrink-0 drop-shadow-sm"
      />
      {text && (
        <p className="font-mono text-xs uppercase tracking-wider text-ink/70 animate-pulse text-center">
          {text}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-canvas p-6">
        {content}
      </div>
    );
  }

  return content;
}
