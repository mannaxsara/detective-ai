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

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Protect router client-side
  useEffect(() => {
    const token = localStorage.getItem("detective_token");
    if (!token) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

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
