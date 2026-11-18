import React from "react";

export function MarqueeStrip() {
  const items = [
    "ROOM • EXPERIENTIAL OPERATING SYSTEM",
    "CREATOR CRM & RELATIONSHIP INTELLIGENCE",
    "CRYPTOGRAPHIC QR PASS VERIFICATION",
    "IDEMPOTENT GATE CHECK-IN",
    "MULTI-TENANT EVENT OPERATIONS",
  ];

  const content = (
    <>
      {items.map((item, idx) => (
        <span key={idx} className="inline-flex items-center">
          <span className="mx-3">{item}</span>
          <span className="text-primary font-bold opacity-80">•</span>
        </span>
      ))}
    </>
  );

  return (
    <div className="h-9 bg-inverse-canvas text-inverse-ink flex items-center overflow-hidden border-b border-white/10 select-none group">
      <div className="flex w-max shrink-0 whitespace-nowrap">
        {/* Track 1 */}
        <div className="flex shrink-0 items-center animate-marquee text-xs font-mono tracking-widest uppercase group-hover:[animation-play-state:paused]">
          {content}
          {content}
        </div>
        {/* Track 2 for seamless infinite horizontal loop */}
        <div
          className="flex shrink-0 items-center animate-marquee text-xs font-mono tracking-widest uppercase group-hover:[animation-play-state:paused]"
          aria-hidden="true"
        >
          {content}
          {content}
        </div>
      </div>
    </div>
  );
}
