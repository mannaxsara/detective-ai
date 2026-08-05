"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle2, Send, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authAPI } from "@/lib/api";

function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="13" cy="13" r="9.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="11" cy="12" r="1.2" fill="currentColor" />
      <circle cx="15" cy="10" r="1.2" fill="currentColor" />
      <circle cx="15" cy="15" r="1.2" fill="currentColor" />
      <line x1="11" y1="12" x2="15" y2="10" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="15" y1="10" x2="15" y2="15" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="11" y1="12" x2="15" y2="15" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="20" y1="20" x2="28" y2="28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSubmitted(true);
      toast.success("Reset link sent!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Request failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background px-4 py-12 text-foreground font-sans overflow-hidden">
      {/* Background Grid Accent */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(216,207,188,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(216,207,188,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <div className="rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xl p-7 sm:p-9 shadow-2xl shadow-black/40 space-y-6">
          {/* Header Wordmark & Logo */}
          <div className="text-center space-y-3">
            <Link href="/" className="inline-flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
              <LogoMark size={24} />
              <span className="font-mono text-xs font-bold tracking-[0.2em] text-foreground uppercase">
                DetectiveAI
              </span>
            </Link>

            {submitted ? (
              <div className="space-y-2 pt-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">Check Your Email</h2>
                <p className="text-xs text-muted-foreground">
                  We&apos;ve sent a password reset link to{" "}
                  <span className="font-bold text-foreground">{email}</span>
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">Reset Password</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your email address and we&apos;ll send you a recovery link
                </p>
              </div>
            )}
          </div>

          {submitted ? (
            <div className="space-y-4 pt-2">
              <p className="text-center text-xs text-muted-foreground">
                Didn&apos;t receive an email? Check your spam folder or try another address.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="h-11 w-full rounded-xl border border-border/80 bg-muted/40 hover:bg-muted text-foreground font-semibold text-xs transition-all cursor-pointer"
              >
                Try another email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[10.5px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="agent@detective.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="h-11 w-full rounded-xl border border-border/80 bg-background/50 pl-10 pr-3.5 text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:brightness-110 text-primary-foreground font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-primary/15 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  <>
                    Send Reset Link <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Back Link */}
          <div className="text-center pt-2 border-t border-border/60">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to sign in
            </Link>
          </div>
        </div>

        {/* Security Trust Badge */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-muted-foreground/60 mt-6 select-none">
          <ShieldCheck className="w-3.5 h-3.5 text-primary/70" />
          <span>256-bit Encrypted Session · DetectiveAI Security</span>
        </div>
      </motion.div>
    </div>
  );
}
