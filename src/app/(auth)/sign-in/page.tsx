"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { RoomLoading } from "@/components/ui/RoomLoading";
import { Sparkle, ArrowRight, ShieldCheck, Lock } from "@phosphor-icons/react";
import { useAuth } from "@/components/providers/AuthProvider";
import { PERSONAS, getDefaultRouteForRole } from "@/lib/auth/rbac";

export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("rahul@pulselabs.in");
  const [password, setPassword] = useState("••••••••••••");
  const [loading, setLoading] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const matched = PERSONAS.find(
      (p) => p.email.toLowerCase() === cleanEmail
    ) || PERSONAS[0];

    login(matched);

    setTimeout(() => {
      setLoading(false);
      const target = getDefaultRouteForRole(matched.role);
      router.push(target);
    }, 400);
  };

  const handlePersonaSelect = (userEmail: string) => {
    setEmail(userEmail);
    const matched = PERSONAS.find(
      (p) => p.email.toLowerCase() === userEmail.toLowerCase()
    );
    if (matched) {
      login(matched);
      const target = getDefaultRouteForRole(matched.role);
      router.push(target);
    }
  };

  return (
    <div className="min-h-screen bg-surface-soft flex flex-col justify-between p-6">
      <header className="max-w-md mx-auto w-full flex items-center justify-between py-4">
        <Link href="/dashboard" className="font-extrabold tracking-tighter text-2xl text-ink font-sans">
          ROOM<span className="text-primary">.</span>
        </Link>
        <span className="caption-mono text-xs text-primary font-bold">
          B2B WORKSPACE AUTH
        </span>
      </header>

      <main className="max-w-md mx-auto w-full my-auto space-y-6">
        <Card className="p-8 space-y-6 shadow-soft border border-hairline">
          <div>
            <span className="caption-mono text-primary font-semibold">
              Sign In to Your Workspace
            </span>
            <h1 className="headline text-2xl font-bold text-ink mt-1">
              Welcome back
            </h1>
            <p className="text-xs text-ink/70 mt-1">
              Secure multi-tenant workspace with organisation-level RLS isolation.
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-ink/70">
                Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-canvas border border-hairline rounded-md text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase text-ink/70">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline font-mono">
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-canvas border border-hairline rounded-md text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full py-3 mt-2"
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <RoomLoading size="xs" />
                  <span>Authenticating...</span>
                </span>
              ) : (
                "Sign In to Pulse Experiential"
              )}
            </Button>
          </form>

          {/* Quick Persona Demo Switcher */}
          <div className="pt-4 border-t border-hairline space-y-2">
            <span className="caption-mono text-[11px] text-ink/60 block">
              Quick Persona Sign-In:
            </span>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => handlePersonaSelect("rahul@pulselabs.in")}
                className={`text-left text-xs p-2 rounded border transition-colors flex items-center justify-between ${
                  email === "rahul@pulselabs.in"
                    ? "bg-block-lime border-[#ecd959] font-medium"
                    : "bg-surface-soft border-hairline hover:bg-hairline"
                }`}
              >
                <span>Rahul Mehta (Agency Owner)</span>
                <span className="font-mono text-[10px] text-ink/60">Owner / P0</span>
              </button>

              <button
                type="button"
                onClick={() => handlePersonaSelect("priya.sharma@aurabeauty.com")}
                className={`text-left text-xs p-2 rounded border transition-colors flex items-center justify-between ${
                  email === "priya.sharma@aurabeauty.com"
                    ? "bg-block-lilac border-[#91a0fc] font-medium"
                    : "bg-surface-soft border-hairline hover:bg-hairline"
                }`}
              >
                <span>Priya Sharma (Brand Marketing Manager)</span>
                <span className="font-mono text-[10px] text-ink/60">Brand / P0</span>
              </button>

              <button
                type="button"
                onClick={() => handlePersonaSelect("karan@pulselabs.in")}
                className={`text-left text-xs p-2 rounded border transition-colors flex items-center justify-between ${
                  email === "karan@pulselabs.in"
                    ? "bg-block-navy text-white font-medium"
                    : "bg-surface-soft border-hairline hover:bg-hairline"
                }`}
              >
                <span>Karan Verma (Operations Staff)</span>
                <span className="font-mono text-[10px] opacity-70">Ops / Gate</span>
              </button>
            </div>

            <div className="text-center text-xs text-ink/60 pt-3 border-t border-hairline mt-3">
              Don&apos;t have an organisation workspace?{" "}
              <Link href="/sign-up" className="text-primary hover:underline font-semibold">
                Create Organisation
              </Link>
            </div>
          </div>
        </Card>
      </main>

      <footer className="py-4 text-center text-xs text-ink/50 font-mono">
        ROOM SUPABASE AUTH INTEGRATION • B2B SaaS
      </footer>
    </div>
  );
}
