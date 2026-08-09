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
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (!isAuthenticated || isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#f9f9f7] dark:bg-[#11120d] text-black dark:text-white font-mono text-[12px]">
        Checking credentials...
      </div>
    );
  }

  return (
    <div className="flex w-full h-screen overflow-hidden bg-[#f9f9f7] dark:bg-[#11120d] text-black dark:text-white font-sans selection:bg-[#edfe5e]">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-[#f9f9f7] dark:bg-[#11120d] p-6 sm:p-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
