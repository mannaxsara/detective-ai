"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Mail, Lock, User, ArrowRight, ShieldCheck, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
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

function getPasswordStrength(password: string) {
  const len = password.length;
  if (len === 0) return { label: "", percent: 0, color: "bg-black/20" };
  if (len < 6) return { label: "Weak", percent: 33, color: "bg-[#bc3e3e]" };
  if (len < 8) return { label: "Fair", percent: 66, color: "bg-[#f59e0b]" };
  return { label: "Strong", percent: 100, color: "bg-[#31e992]" };
}

export default function RegisterPage() {
  const router = useRouter();
  const loginStore = useAuthStore((state) => state.login);

  useEffect(() => {
    const token = localStorage.getItem("detective_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp && payload.exp * 1000 > Date.now()) {
          router.push("/dashboard");
        } else {
          localStorage.removeItem("detective_token");
          localStorage.removeItem("detective_user");
        }
      } catch {
        localStorage.removeItem("detective_token");
        localStorage.removeItem("detective_user");
      }
    }
  }, [router]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const anyLoading = loading || googleLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.register({
        email,
        password,
        full_name: fullName,
      });
      loginStore(res.user, res.access_token, res.refresh_token);
      toast.success("Account created successfully!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { auth, googleProvider, signInWithPopup } = await import("@/lib/firebase");
      if (!auth || !googleProvider) {
        throw new Error("Firebase Auth is not initialized. Please check environment variables.");
      }
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      const res = await authAPI.googleAuth(idToken);
      loginStore(res.user, res.access_token, res.refresh_token);
      toast.success(`Welcome to DetectiveAI, ${res.user.full_name || 'Agent'}!`);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Google Auth error:", err);
      if (err?.code === "auth/popup-closed-by-user") {
        toast.info("Google Sign-In popup was closed.");
      } else if (err?.code?.includes("requests-from-referer")) {
        toast.error("Google Sign-In blocked: Please allow domain in Firebase & Google Cloud Console.");
      } else {
        toast.error(err.response?.data?.detail || err.message || "Google authentication failed.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f9f9f7] dark:bg-[#11120d] text-black dark:text-white px-4 py-12 font-sans relative selection:bg-[#edfe5e]">
      
      {/* Top Floating Back Link */}
      <Link href="/" className="absolute top-6 left-6 inline-flex items-center gap-2 font-mono text-xs font-bold uppercase text-black dark:text-white hover:underline">
        <ArrowLeft className="w-4 h-4 text-black dark:text-white" /> Back to Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px] space-y-6"
      >
        {/* Editorial Brutalist Card Container */}
        <div className="border border-black dark:border-[#3b3a33] rounded-2xl bg-white dark:bg-[#1c1d18] p-7 sm:p-8 shadow-[4px_4px_0px_#000000] space-y-5">
          
          {/* Header Wordmark & Logo */}
          <div className="text-center space-y-3">
            <Link href="/" className="inline-flex items-center gap-3 group select-none cursor-pointer">
              <DetectiveBadgeLogo />
              <span className="font-serif font-extrabold text-2xl tracking-tight text-black dark:text-white">
                DETECTIVE<span className="text-[#31e992] ml-0.5">AI</span>
              </span>
            </Link>

            <div>
              <h1 className="text-xl font-serif font-bold text-black dark:text-white tracking-tight">Create Account</h1>
              <p className="text-xs font-sans text-black/70 dark:text-white/70 mt-1">
                Set up your workspace to start data investigations
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold text-black dark:text-white uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative flex items-center w-full">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/60 dark:text-white/60 pointer-events-none z-10 shrink-0" />
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={anyLoading}
                  className="h-11 w-full rounded-xl border border-black/20 dark:border-white/20 bg-[#f9f9f7] dark:bg-[#11120d] pl-11 pr-4 text-xs font-mono font-bold text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none focus:border-black dark:focus:border-[#edfe5e] focus:ring-2 focus:ring-[#edfe5e] transition-all"
                />
              </div>
            </div>

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
                  disabled={anyLoading}
                  className="h-11 w-full rounded-xl border border-black/20 dark:border-white/20 bg-[#f9f9f7] dark:bg-[#11120d] pl-11 pr-4 text-xs font-mono font-bold text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none focus:border-black dark:focus:border-[#edfe5e] focus:ring-2 focus:ring-[#edfe5e] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold text-black dark:text-white uppercase tracking-wider block">
                Password
              </label>
              <div className="relative flex items-center w-full">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/60 dark:text-white/60 pointer-events-none z-10 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={anyLoading}
                  className="h-11 w-full rounded-xl border border-black/20 dark:border-white/20 bg-[#f9f9f7] dark:bg-[#11120d] pl-11 pr-11 text-xs font-mono font-bold text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none focus:border-black dark:focus:border-[#edfe5e] focus:ring-2 focus:ring-[#edfe5e] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white cursor-pointer z-10"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="h-1.5 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300 rounded-full`}
                      style={{ width: `${strength.percent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-black/60 dark:text-white/60">
                    Strength: {strength.label}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={anyLoading}
              className="btn-ink-accent h-11 w-full font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[2.5px_2.5px_0px_#000000] cursor-pointer disabled:opacity-50 transition-transform active:scale-[0.98] mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center py-1">
            <div className="w-full border-t border-black/15 dark:border-white/15" />
            <span className="absolute bg-white dark:bg-[#181914] px-3 font-mono text-[10px] font-bold text-black/60 dark:text-white/60 uppercase tracking-widest">
              OR
            </span>
          </div>

          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={anyLoading}
            className="h-11 w-full rounded-xl border border-black dark:border-white/20 bg-white dark:bg-[#262720] hover:bg-[#edf0e9] dark:hover:bg-[#2e2f27] text-black dark:text-white font-mono font-bold text-xs flex items-center justify-center gap-2.5 shadow-[2px_2px_0px_#000000] transition-all cursor-pointer disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-black dark:text-white" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          {/* Footer Redirect */}
          <div className="text-center text-xs font-sans text-black/70 dark:text-white/70 pt-1">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-black dark:text-white underline hover:text-black dark:hover:text-white ml-1"
            >
              Sign in
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
