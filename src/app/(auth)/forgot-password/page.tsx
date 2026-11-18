"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RoomLoading } from "@/components/ui/RoomLoading";
import { ArrowLeft, CheckCircle, EnvelopeSimple } from "@phosphor-icons/react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-surface-soft flex flex-col justify-between p-6">
      <header className="max-w-md mx-auto w-full flex items-center justify-between py-4">
        <Link href="/" className="font-extrabold tracking-tighter text-2xl text-ink font-sans">
          ROOM<span className="text-primary">.</span>
        </Link>
        <span className="caption-mono text-xs text-primary font-bold">
          SECURITY RECOVERY
        </span>
      </header>

      <main className="max-w-md mx-auto w-full my-auto space-y-6">
        <Card className="p-8 space-y-6 shadow-soft border border-hairline bg-canvas">
          {sent ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 rounded-full bg-semantic-success/15 text-semantic-success flex items-center justify-center mx-auto border border-semantic-success/30">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h2 className="headline text-2xl font-bold text-ink">
                  Recovery Link Dispatched
                </h2>
                <p className="text-xs text-ink/70 max-w-sm mx-auto">
                  If an account exists for <span className="font-semibold text-ink">{email}</span>, we have sent instructions to reset your password.
                </p>
              </div>
              <div className="pt-4">
                <Link href="/sign-in">
                  <Button variant="primary" className="w-full">
                    Return to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div>
                <span className="caption-mono text-primary font-semibold">
                  Account Recovery
                </span>
                <h1 className="headline text-2xl font-bold text-ink mt-1">
                  Reset Password
                </h1>
                <p className="text-xs text-ink/70 mt-1">
                  Enter your registered work email to receive a secure password reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-ink/70">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@agency.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                      <span>Sending link...</span>
                    </span>
                  ) : (
                    "Send Password Reset Link"
                  )}
                </Button>
              </form>

              <div className="text-center text-xs text-ink/60 pt-2 border-t border-hairline">
                Remember your password?{" "}
                <Link href="/sign-in" className="text-primary hover:underline font-medium">
                  Sign In
                </Link>
              </div>
            </>
          )}
        </Card>
      </main>

      <footer className="py-4 text-center text-xs text-ink/50 font-mono">
        ROOM ZERO-TRUST RECOVERY PROTOCOL • B2B SaaS
      </footer>
    </div>
  );
}
