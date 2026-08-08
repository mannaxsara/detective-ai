"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle2, Send, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authAPI } from "@/lib/api";

function DetectiveBadgeLogo() {
  return (
    <div className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl bg-[#edfe5e] border border-black flex items-center justify-center text-black font-bold shadow-[2px_2px_0px_#000000] shrink-0 select-none">
      <svg
        width="22"
        height="22"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="13" cy="13" r="9" stroke="#000000" strokeWidth="3" />
        <circle cx="13" cy="13" r="4.5" stroke="#000000" strokeWidth="2" strokeDasharray="2 2" />
        <circle cx="11" cy="11" r="1.5" fill="#000000" />
        <circle cx="15" cy="14" r="1.5" fill="#000000" />
        <line x1="19.5" y1="19.5" x2="27.5" y2="27.5" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </div>
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f9f9f7] dark:bg-[#11120d] text-black dark:text-white px-4 py-12 font-sans relative selection:bg-[#edfe5e]">
      
      {/* Top Floating Back Link */}
      <Link href="/login" className="absolute top-6 left-6 inline-flex items-center gap-2 font-mono text-xs font-bold uppercase text-black dark:text-white hover:underline">
        <ArrowLeft className="w-4 h-4 text-black dark:text-white" /> Back to Sign In
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px] space-y-6"
      >
        {/* Card Container */}
        <div className="border border-black dark:border-white/20 rounded-2xl bg-white dark:bg-[#181914] p-7 sm:p-8 shadow-[4px_4px_0px_#000000] space-y-6">
          
          {/* Header Wordmark & Logo */}
          <div className="text-center space-y-3">
            <Link href="/" className="inline-flex items-center gap-3 group select-none cursor-pointer">
              <DetectiveBadgeLogo />
              <span className="font-serif font-extrabold text-2xl tracking-tight text-black dark:text-white">
                DETECTIVE<span className="text-[#31e992] ml-0.5">AI</span>
              </span>
            </Link>

            {submitted ? (
              <div className="space-y-2 pt-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#31e992] border border-black text-black shadow-[2px_2px_0px_#000000]">
                  <CheckCircle2 className="h-6 w-6 text-black" />
                </div>
                <h1 className="text-xl font-serif font-bold text-black dark:text-white tracking-tight">Check Your Email</h1>
                <p className="text-xs font-sans text-black/70 dark:text-white/70">
                  We&apos;ve sent a password recovery link to{" "}
                  <strong className="font-mono font-bold text-black dark:text-white">{email}</strong>
                </p>
              </div>
            ) : (
              <div>
                <h1 className="text-xl font-serif font-bold text-black dark:text-white tracking-tight">Reset Password</h1>
                <p className="text-xs font-sans text-black/70 dark:text-white/70 mt-1">
                  Enter your email address to receive a recovery link
                </p>
              </div>
            )}
          </div>

          {submitted ? (
            <div className="space-y-4 pt-2">
              <p className="text-center text-xs font-sans text-black/70 dark:text-white/70">
                Didn&apos;t receive an email? Check your spam folder or try another address.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="btn-ink-outlined h-11 w-full font-mono font-bold text-xs uppercase cursor-pointer"
              >
                Try another email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-black dark:text-white uppercase tracking-wider block">
                  Email Address
                </label>
                <div className="relative flex items-center w-full">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/60 dark:text-white/60 pointer-events-none z-10 shrink-0" />
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="agent@detective.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="h-11 w-full rounded-xl border border-black/20 dark:border-white/20 bg-[#f9f9f7] dark:bg-[#11120d] pl-11 pr-4 text-xs font-mono font-bold text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none focus:border-black dark:focus:border-[#edfe5e] focus:ring-2 focus:ring-[#edfe5e] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-ink-accent h-11 w-full font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[2.5px_2.5px_0px_#000000] cursor-pointer disabled:opacity-50 transition-transform active:scale-[0.98] mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
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
          <div className="text-center pt-2 border-t border-black/15 dark:border-white/15">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-black dark:text-white hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </div>
        </div>

        {/* Security Trust Badge */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono font-bold text-black/60 dark:text-white/60 select-none">
          <ShieldCheck className="w-3.5 h-3.5 text-[#31e992]" />
          <span>256-bit Encrypted Session · DetectiveAI Security</span>
        </div>
      </motion.div>
    </div>
  );
}
