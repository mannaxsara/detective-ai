"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { authAPI } from "@/lib/api";
import FluidBackground from "@/components/ui/fluid-background";

export default function LoginPage() {
  const router = useRouter();
  const loginStore = useAuthStore((state) => state.login);

  useEffect(() => {
    const token = localStorage.getItem("detective_token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const anyLoading = loading || googleLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      loginStore(res.user, res.access_token);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const fakeGoogleToken = "google-oauth-token-simulated-12345";
      const res = await authAPI.googleAuth(fakeGoogleToken);
      loginStore(res.user, res.access_token);
      toast.success("Google Sign-In successful!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error("Google authentication failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black text-white selection:bg-[#ea580c] selection:text-white">
      {/* Background canvas */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <FluidBackground />
      </div>

      {/* Cyber Grid */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:44px_44px]"
        aria-hidden="true"
      />

      {/* Auth Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[400px] px-4"
      >
        <div className="relative overflow-hidden rounded-2xl border border-zinc-900 bg-[#09090B]/80 p-8 shadow-2xl backdrop-blur-xl flex flex-col gap-6">
          {/* Top orange highlight line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ea580c]/50 to-transparent" />

          {/* Logo & Header */}
          <div className="space-y-1.5 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mx-auto mb-3 flex items-center justify-center gap-2"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded bg-zinc-950 border border-zinc-900">
                <Sparkles className="h-3.5 w-3.5 text-[#ea580c]" />
              </div>
              <span className="text-[13px] font-bold uppercase tracking-widest text-white">
                DetectiveAI
              </span>
            </motion.div>

            <h1 className="text-xl font-bold tracking-tight text-white">
              Welcome back
            </h1>
            <p className="text-xs text-zinc-550">
              Sign in to your account to continue
            </p>
          </div>

          <div className="space-y-5">
            {/* Google OAuth Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={anyLoading}
              className="group relative h-10 w-full gap-2.5 rounded-full border-zinc-900 bg-zinc-950/60 text-[12px] font-bold text-zinc-300 transition-all duration-200 hover:border-zinc-800 hover:bg-zinc-950 hover:text-white"
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
              ) : (
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="relative flex items-center">
              <span className="flex-1 border-t border-zinc-900" />
              <span className="px-3 text-[9px] font-bold uppercase tracking-widest text-zinc-600">
                or continue with email
              </span>
              <span className="flex-1 border-t border-zinc-900" />
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label htmlFor="email" className="text-xs font-bold text-zinc-400">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 w-full rounded-full border border-zinc-900 bg-zinc-950/60 pl-10 pr-4 text-xs text-zinc-200 placeholder:text-zinc-700 focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-bold text-zinc-400">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[10px] font-bold text-[#ea580c] hover:text-[#c2410c] transition-colors"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 w-full rounded-full border border-zinc-900 bg-zinc-950/60 pl-10 pr-11 text-xs text-zinc-200 placeholder:text-zinc-700 focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-650 hover:text-zinc-350 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={anyLoading}
                className="h-10 w-full rounded-full bg-white hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1">
                    Sign In
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                )}
              </Button>
            </form>
          </div>

          {/* Footer Navigation */}
          <div className="border-t border-zinc-950 pt-5 text-center">
            <p className="text-xs text-zinc-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-[#ea580c] hover:text-[#c2410c] transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
