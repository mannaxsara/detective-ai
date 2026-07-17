"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-pumice flex items-center justify-center font-sans text-obsidian/60 text-xs uppercase tracking-widest font-mono">
      <span>Redirecting to workspace...</span>
    </div>
  );
}
