"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./sidebar";
import Header from "./header";
import { useAuthStore } from "@/store/auth-store";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, initialize } = useAuthStore();

  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    initialize();
    const token = localStorage.getItem("detective_token");
    if (!token || !isAuthenticated) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [initialize, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-zinc-400 font-mono text-[12px]">
        Checking credentials...
      </div>
    );
  }

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-black text-zinc-50 font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-black p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
