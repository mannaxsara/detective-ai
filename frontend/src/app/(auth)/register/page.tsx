"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { authAPI } from "@/lib/api";

function getPasswordStrength(password: string) {
  const len = password.length;
  if (len === 0) return { label: "", percent: 0, color: "bg-border" };
  if (len < 6) return { label: "Weak", percent: 33, color: "bg-destructive" };
  if (len < 8) return { label: "Fair", percent: 66, color: "bg-amber-500" };
  return { label: "Strong", percent: 100, color: "bg-emerald-600" };
}

export default function RegisterPage() {
  const router = useRouter();
  const loginStore = useAuthStore((state) => state.login);

  useEffect(() => {
    const token = localStorage.getItem("detective_token");
    if (token) {
      router.push("/dashboard");
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
      toast.success("Google Sign-In successful!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error("Google authentication failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm rounded-cards border border-border bg-card p-8 shadow-sm">
        {/* Header Wordmark */}
        <div className="text-center mb-8">
          <span className="font-mono text-xs font-bold tracking-widest text-muted-foreground uppercase select-none">
            ◆ DetectiveAI
          </span>
          <h2 className="text-xl font-bold text-foreground mt-4">Create account</h2>
          <p className="text-xs text-muted-foreground mt-1.5">
            Set up your workspace to begin investigating
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={anyLoading}
              className="h-10 w-full rounded-small border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. agent@detective.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={anyLoading}
              className="h-10 w-full rounded-small border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={anyLoading}
                className="h-10 w-full rounded-small border border-border bg-background pl-3 pr-10 text-xs text-foreground placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground/50 hover:text-foreground cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Password strength bar */}
            {password.length > 0 && (
              <div className="space-y-1 pt-1">
                <div className="h-1 w-full bg-border rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${strength.percent}%` }}
                  />
                </div>
                <span className="font-mono text-[9px] text-muted-foreground uppercase">
                  Strength: {strength.label}
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={anyLoading}
            className="h-10 w-full rounded-small bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest">
            or
          </span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={anyLoading}
          className="h-10 w-full rounded-small border border-border bg-card hover:bg-muted text-foreground font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
        >
          {googleLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          Continue with Google
        </button>

        {/* Footer Redirect */}
        <div className="text-center mt-6 text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-foreground hover:underline transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
