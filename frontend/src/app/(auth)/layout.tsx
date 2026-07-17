"use client";

import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#09090B] text-zinc-100 overflow-hidden select-none">
      {children}
    </div>
  );
}
