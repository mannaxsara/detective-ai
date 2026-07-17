"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Mail, ArrowLeft, CheckCircle2, Send, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { authAPI } from "@/lib/api";

/* ─── Organic Fluid Plasma Canvas Component ─── */
function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const palette = [
      [0, 9, 8, 7],
      [0.32, 58, 24, 8],
      [0.52, 122, 45, 10],
      [0.63, 234, 88, 12],
      [0.78, 240, 205, 165],
      [1, 246, 240, 227]
    ];

    const colorMap = new Uint8ClampedArray(768);
    for (let e = 0; e < 256; e++) {
      const n = e / 255;
      let s = palette[0], i = palette[palette.length - 1];
      for (let c = 0; c < palette.length - 1; c++) {
        if (n >= palette[c][0] && n <= palette[c + 1][0]) {
          s = palette[c];
          i = palette[c + 1];
          break;
        }
      }
      const r = i[0] - s[0] || 1;
      let o = (n - s[0]) / r;
      o = o * o * (3 - 2 * o);
      colorMap[e * 3] = s[1] + (i[1] - s[1]) * o;
      colorMap[e * 3 + 1] = s[2] + (i[2] - s[2]) * o;
      colorMap[e * 3 + 2] = s[3] + (i[3] - s[3]) * o;
    }

    let width = 110;
    let height = 80;
    let imgData = ctx.createImageData(width, height);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const aspect = rect.width > 0 && rect.height > 0 ? rect.width / rect.height : 0.75;
      if (aspect >= 1) {
        width = 110;
        height = Math.max(2, Math.round(width / aspect));
      } else {
        height = 110;
        width = Math.max(2, Math.round(height * aspect));
      }
      imgData = ctx.createImageData(width, height);
    };

    resize();
    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(canvas);

    const seed = Math.random() * 1000;
    let animFrame: number;

    const render = (time: number) => {
      const data = imgData.data;
      const step = time / 1000 * 1.35;
      let offset = 0;
      const sin = Math.sin;

      for (let yIndex = 0; yIndex < height; yIndex++) {
        const d = yIndex / (height - 1);
        const h = 0.09 * sin(2.1 * d * 3.1416 + seed * 0.19);
        for (let xIndex = 0; xIndex < width; xIndex++) {
          const a = xIndex / (width - 1);
          const u = a + h;
          const m = d + 0.09 * sin(2.4 * a * 3.1416 - seed * 0.16 + 1.1);
          let f = 0.7 * Math.sqrt(u * u + 0.5 * m * m) - 0.02 
                  + 0.11 * sin(2.4 * u + 1.7 * m + step * 0.42) 
                  + 0.09 * sin(1.2 * u - 2.1 * m + step * 0.3 + 1.3) 
                  + 0.06 * sin(3.2 * u + 2.7 * m - step * 0.24 + 4.1);
          if (f < 0) f = 0;
          else if (f > 1) f = 1;

          const colorIdx = (f * 255) | 0;
          data[offset] = colorMap[colorIdx * 3];
          data[offset + 1] = colorMap[colorIdx * 3 + 1];
          data[offset + 2] = colorMap[colorIdx * 3 + 2];
          data[offset + 3] = 255;
          offset += 4;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      animFrame = requestAnimationFrame(render);
    };

    animFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrame);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full object-cover opacity-[0.25] pointer-events-none"
      style={{ filter: "blur(50px)" }}
    />
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
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black text-white selection:bg-[#ea580c] selection:text-white">
      {/* Premium background canvas */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <FluidBackground />
      </div>

      {/* Cyber Grid Overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:44px_44px]"
        aria-hidden="true"
      />

      {/* Auth Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[420px] px-4"
      >
        <Card className="relative overflow-hidden rounded-2xl border border-zinc-900 bg-black/60 shadow-2xl backdrop-blur-xl">
          {/* Top-edge orange highlight line */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ea580c]/50 to-transparent"
          />

          <CardHeader className="space-y-1.5 pb-2 pt-8 text-center">
            {/* Brand Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mx-auto mb-3 flex items-center gap-2"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded bg-zinc-900 border border-zinc-800">
                <Sparkles className="h-3.5 w-3.5 text-[#ea580c]" />
              </div>
              <span className="text-[13px] font-bold uppercase tracking-widest text-white">
                DetectiveAI
              </span>
            </motion.div>

            {submitted ? (
              <>
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#ea580c]/10 border border-[#ea580c]/20">
                  <CheckCircle2 className="h-6 w-6 text-[#ea580c]" />
                </div>
                <CardTitle className="text-xl font-bold tracking-tight text-white">
                  Check your email
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500">
                  We&apos;ve sent a password reset link to{" "}
                  <span className="font-bold text-zinc-300">{email}</span>
                </CardDescription>
              </>
            ) : (
              <>
                <CardTitle className="text-xl font-bold tracking-tight text-white">
                  Reset your password
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500">
                  Enter your email and we&apos;ll send you a reset link
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="space-y-5 px-6 pb-2 pt-4">
            {submitted ? (
              <div className="space-y-4">
                <p className="text-center text-[10px] text-zinc-600 font-medium">
                  Didn&apos;t receive an email? Check your spam folder or try again.
                </p>
                <Button
                  onClick={() => setSubmitted(false)}
                  variant="outline"
                  className="w-full h-10 rounded-full border-zinc-900 bg-zinc-950/60 text-xs font-bold text-zinc-300 hover:bg-zinc-950 hover:text-white transition-all"
                >
                  Try another email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold text-zinc-400">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-650" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 rounded-full border-zinc-900 bg-black/60 pl-10 text-xs text-zinc-200 placeholder:text-zinc-700 focus-visible:ring-[#ea580c]/30"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-10 w-full rounded-full bg-white hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-[0.98]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Sending…
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1">
                      Send Reset Link
                      <Send className="h-3.5 w-3.5" />
                    </span>
                  )}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="justify-center border-t border-zinc-950 px-6 py-4.5">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors font-bold"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to sign in
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
