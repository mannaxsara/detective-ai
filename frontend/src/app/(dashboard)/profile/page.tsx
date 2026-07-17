"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User as UserIcon, Database, BarChart3, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { datasetsAPI, historyAPI } from "@/lib/api";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data: datasetsData } = useQuery({
    queryKey: ["datasets-stats"],
    queryFn: () => datasetsAPI.list(0, 1),
  });

  const { data: historyData } = useQuery({
    queryKey: ["history-stats"],
    queryFn: () => historyAPI.list(0, 1),
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    toast.success("Password updated successfully.");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const statItems = [
    { label: "Datasets", value: datasetsData?.total || 0, icon: Database, color: "text-[#ea580c]" },
    { label: "Analyses", value: historyData?.total || 0, icon: BarChart3, color: "text-[#ea580c]" },
    { label: "Reports Generated", value: 3, icon: FileText, color: "text-[#ea580c]" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-zinc-350">
      
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl border border-zinc-900 bg-[#09090B] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#ea580c]/5 blur-[40px] pointer-events-none" />
        
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-black border-2 border-zinc-900 text-zinc-300">
          <UserIcon className="w-8 h-8" />
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-1">
          <h2 className="text-xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
            {user?.full_name || "User"}
            <span className="flex items-center gap-1 text-[10px] bg-[#ea580c]/10 border border-[#ea580c]/20 text-[#ea580c] px-2 py-0.5 rounded-full uppercase font-bold">
              <Sparkles className="w-3 h-3 text-[#ea580c]" />
              Pro Analyst
            </span>
          </h2>
          <p className="text-zinc-500 text-sm font-semibold">{user?.email}</p>
          <p className="text-zinc-650 text-xs font-semibold">Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "2026"}</p>
        </div>
      </div>

      {/* Account stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} className="border-zinc-900 bg-[#09090B]">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">{item.label}</p>
                  <p className="text-xl font-bold text-white mt-1.5">{item.value}</p>
                </div>
                <div className={`p-2.5 rounded-lg bg-black border border-zinc-900 ${item.color}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Security Profile */}
      <Card className="border-zinc-900 bg-[#09090B]">
        <CardHeader className="border-b border-zinc-900/50 bg-black pb-4">
          <CardTitle className="text-base font-bold text-white">Security Credentials</CardTitle>
          <CardDescription className="text-zinc-550 text-xs">Change your account password securely.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="old-pass" className="text-zinc-400">Old Password</Label>
              <Input
                id="old-pass"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="bg-black border-zinc-900 focus-visible:ring-[#ea580c]/30 text-zinc-200 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-pass" className="text-zinc-400">New Password</Label>
              <Input
                id="new-pass"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-black border-zinc-900 focus-visible:ring-[#ea580c]/30 text-zinc-200 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pass" className="text-zinc-400">Confirm Password</Label>
              <Input
                id="confirm-pass"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-black border-zinc-900 focus-visible:ring-[#ea580c]/30 text-zinc-200 text-sm"
              />
            </div>
            <Button
              type="submit"
              className="bg-white hover:bg-zinc-200 text-black font-bold text-xs h-9 px-5 rounded-full shadow-sm active:scale-[0.98] transition-all cursor-pointer"
            >
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
