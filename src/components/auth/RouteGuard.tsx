"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { canAccessRoute, getDefaultRouteForRole } from "@/lib/auth/rbac";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ShieldCheck, Lock, ArrowRight, SignIn } from "@phosphor-icons/react";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { persona, isAuthenticated } = useAuth();

  // If unauthenticated, prompt to sign in
  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <Card className="p-8 md:p-12 space-y-6 border border-hairline shadow-soft bg-canvas">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="caption-mono text-primary font-bold">
              Authentication Required
            </span>
            <h2 className="headline text-2xl font-bold text-ink">
              Sign In to Access ROOM Workspace
            </h2>
            <p className="text-sm text-ink/70 max-w-md mx-auto">
              This operational workspace requires an active organisation account and authenticated session.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/sign-in">
              <Button variant="primary" size="lg" className="gap-2">
                <span>Sign In to Organisation</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="secondary" size="lg">
                Create Organisation
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const access = canAccessRoute(persona.role, pathname);

  if (!access.allowed) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <Card className="p-8 md:p-12 space-y-6 border border-hairline shadow-soft">
          <div className="w-14 h-14 rounded-full bg-surface-soft border border-hairline flex items-center justify-center mx-auto text-primary">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="caption-mono text-primary font-bold">
              RBAC • Least Privilege Access Boundary
            </span>
            <h2 className="headline text-2xl font-bold text-ink">
              Restricted Area for {persona.role.replace(/_/g, " ")}
            </h2>
            <p className="text-sm text-ink/70 max-w-md mx-auto">
              {access.reason || "You do not have administrative clearance to access this module."}
            </p>
          </div>

          <div className="bg-surface-soft p-4 rounded-md text-xs text-ink/80 text-left space-y-1.5 border border-hairline">
            <div className="font-semibold flex items-center gap-1.5 text-ink">
              <ShieldCheck className="w-4 h-4 text-semantic-success" />
              <span>Active Persona: {persona.name} ({persona.title})</span>
            </div>
            <div className="text-ink/60">
              Role Scope: {persona.description}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {access.redirect && (
              <Link href={access.redirect}>
                <Button variant="primary" className="gap-2">
                  <span>Go to Assigned View</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
            <Link href={getDefaultRouteForRole(persona.role)}>
              <Button variant="secondary">
                {persona.role === "GUEST"
                  ? "View My Invitation"
                  : persona.role === "CREATOR"
                  ? "View My Pass"
                  : persona.role === "OPERATIONS_STAFF"
                  ? "Gate Console"
                  : "Return to Home"}
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
