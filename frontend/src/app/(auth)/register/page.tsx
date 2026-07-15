"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  User as UserIcon,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { authAPI } from "@/lib/api";
import FluidBackground from "@/components/ui/fluid-background";

/* ─── Password Strength ─── */
function getPasswordStrength(password: string) {
  const len = password.length;
  if (len === 0) return { label: "", percent: 0, color: "bg-zinc-900" };
  if (len < 6)
    return { label: "Weak", percent: 33, color: "bg-rose-500" };
  if (len < 8)
    return { label: "Fair", percent: 66, color: "bg-amber-500" };
  return { label: "Strong", percent: 100, color: "bg-emerald-500" };
}

export default function RegisterPage() {
  const router = useRouter();
  const loginStore = useAuthStore((state) => state.login);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }
    try {
      const res = await authAPI.register({
        email,
        password,
        full_name: fullName,
      });
      loginStore(res.user, res.access_token);
      toast.success("Account created successfully. Welcome!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Registration failed.");
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
      toast.success("Google Sign-Up successful!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error("Google authentication failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const isAnyLoading = loading || googleLoading;

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
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
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
              Create your account
            </h1>
            <p className="text-xs text-zinc-550">
              Start investigating your data in seconds
            </p>
          </div>

          <div className="space-y-5">
            {/* Google Sign-Up */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={isAnyLoading}
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5 text-left">
                <label htmlFor="name" className="text-xs font-bold text-zinc-400">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                  <input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isAnyLoading}
                    className="h-10 w-full rounded-full border border-zinc-900 bg-zinc-950/60 pl-10 pr-4 text-xs text-zinc-200 placeholder:text-zinc-700 focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5 text-left">
                <label htmlFor="email" className="text-xs font-bold text-zinc-400">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isAnyLoading}
                    className="h-10 w-full rounded-full border border-zinc-900 bg-zinc-950/60 pl-10 pr-4 text-xs text-zinc-200 placeholder:text-zinc-700 focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5 text-left">
                <label htmlFor="password" className="text-xs font-bold text-zinc-400">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isAnyLoading}
                    className="h-10 w-full rounded-full border border-zinc-900 bg-zinc-950/60 pl-10 pr-11 text-xs text-zinc-200 placeholder:text-zinc-700 focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 z-10 -translate-y-1/2 text-zinc-650 hover:text-zinc-350 transition-colors animate-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password strength */}
                {password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1 pt-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-550">
                        Password strength
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          strength.percent <= 33
                            ? "text-rose-400"
                            : strength.percent <= 66
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {strength.label}
                      </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-950">
                      <motion.div
                        className={`h-full rounded-full ${strength.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${strength.percent}%` }}
                        transition={{ duration: 0.35 }}
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Create Account Button */}
              <Button
                type="submit"
                disabled={isAnyLoading}
                className="h-10 w-full rounded-full bg-white hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Creating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1">
                    Create Account
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                )}
              </Button>
            </form>
          </div>

          {/* Footer Navigation */}
          <div className="border-t border-zinc-950 pt-5 text-center flex flex-col gap-2">
            <p className="text-xs text-zinc-550">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-[#ea580c] hover:text-[#c2410c] transition-colors"
              >
                Sign in
              </Link>
            </p>

            <p className="text-center text-[10px] leading-relaxed text-zinc-600 mt-1">
              By signing up, you agree to our{" "}
              <span className="cursor-pointer text-zinc-500 underline decoration-zinc-800 underline-offset-2 hover:text-zinc-400">
                Terms
              </span>{" "}
              and{" "}
              <span className="cursor-pointer text-zinc-500 underline decoration-zinc-800 underline-offset-2 hover:text-zinc-400">
                Privacy Policy
              </span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
