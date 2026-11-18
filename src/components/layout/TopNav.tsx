"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { RoomLogo } from "@/components/ui/RoomLogo";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  PERSONAS,
  getNavigationForRole,
  getDefaultRouteForRole,
  canAccessRoute,
  Persona,
} from "@/lib/auth/rbac";
import {
  Sparkle,
  UserSwitch,
  CaretDown,
  CheckCircle,
  ShieldCheck,
  IdentificationBadge,
} from "@phosphor-icons/react";

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { persona, setPersona, can } = useAuth();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems = getNavigationForRole(persona.role);
  const homeRoute = getDefaultRouteForRole(persona.role);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSwitcherOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur-md border-b border-hairline h-16 flex items-center px-4 md:px-8 justify-between">
      {/* Left: Brand + Dynamic Role Pill + Navigation */}
      <div className="flex items-center space-x-6 lg:space-x-8">
        <Link href={homeRoute} className="flex items-center space-x-3 shrink-0">
          <RoomLogo className="h-12 w-auto" />
          <span
            className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full font-semibold ${persona.badgeColor}`}
          >
            {persona.role.replace(/_/g, " ")}
          </span>
        </Link>

        {/* Dynamic Navigation Links based on RBAC.md Section 6 */}
        <nav className="hidden md:flex items-center space-x-5 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors relative flex items-center gap-1.5 py-1 ${
                  isActive
                    ? "text-primary font-semibold"
                    : "text-ink/80 hover:text-primary"
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-block-lime text-ink font-bold">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: Persona Switcher + Create Event Action */}
      <div className="flex items-center space-x-3">
        {/* Persona / RBAC Role Switcher */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-hairline hover:bg-surface-soft transition-all text-left"
          >
            <img
              src={persona.avatar}
              alt={persona.name}
              className="w-6 h-6 rounded-full object-cover border border-hairline"
            />
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-ink line-clamp-1 leading-tight">
                {persona.name}
              </div>
              <div className="text-[10px] font-mono text-ink/60 uppercase line-clamp-1 leading-tight">
                {persona.title}
              </div>
            </div>
            <CaretDown className="w-3 h-3 text-ink/40 ml-0.5" />
          </button>

          {/* Persona Selection Dropdown (8 PRD Roles) */}
          {isSwitcherOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-canvas border border-hairline rounded-lg shadow-modal p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-hairline mb-1">
                <div className="text-xs font-bold text-ink flex items-center justify-between">
                  <span>RBAC Persona Switcher</span>
                  <span className="font-mono text-[10px] text-primary">8 PRD ROLES</span>
                </div>
                <p className="text-[11px] text-ink/60 mt-0.5">
                  Select a persona to test permissions and screen visibility per RBAC.md.
                </p>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-1 py-1">
                {PERSONAS.map((p) => {
                  const isSelected = p.id === persona.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setPersona(p);
                        setIsSwitcherOpen(false);
                        const targetRoute = getDefaultRouteForRole(p.role);
                        const newAccess = canAccessRoute(p.role, pathname);
                        if (
                          !newAccess.allowed ||
                          p.role === "GUEST" ||
                          p.role === "CREATOR" ||
                          p.role === "OPERATIONS_STAFF"
                        ) {
                          router.push(targetRoute);
                        }
                      }}
                      className={`w-full text-left p-2 rounded-md flex items-start gap-2.5 transition-colors ${
                        isSelected
                          ? "bg-surface-soft border border-hairline"
                          : "hover:bg-surface-soft/60"
                      }`}
                    >
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="w-8 h-8 rounded-full object-cover mt-0.5 border border-hairline shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-xs text-ink truncate">
                            {p.name}
                          </span>
                          <span
                            className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold shrink-0 ${p.badgeColor}`}
                          >
                            {p.role.split("_")[0]}
                          </span>
                        </div>
                        <div className="text-[11px] text-ink/70 line-clamp-1">
                          {p.title}
                        </div>
                        <div className="text-[10px] text-ink/50 line-clamp-1 mt-0.5">
                          {p.description}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-4 h-4 text-primary shrink-0 self-center" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="px-3 py-2 border-t border-hairline mt-1 bg-surface-soft/50 rounded-b-md text-[10px] font-mono text-ink/60 flex items-center justify-between">
                <span>Least Privilege Enforced</span>
                <span className="text-semantic-success font-semibold">● ACTIVE</span>
              </div>
            </div>
          )}
        </div>

        {/* Action: Create Event (Only if permitted: Owner, Admin, Event Manager) */}
        {can("events.create") && (
          <Link href="/events/new">
            <Button variant="primary" size="sm" className="inline-flex items-center gap-1.5">
              <Sparkle className="w-3.5 h-3.5" />
              <span>Create Event</span>
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
