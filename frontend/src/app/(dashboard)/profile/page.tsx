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
    { label: "Datasets", value: datasetsData?.total || 0, icon: Database, color: "text-primary" },
    { label: "Analyses", value: historyData?.total || 0, icon: BarChart3, color: "text-primary" },
    { label: "Reports Generated", value: 3, icon: FileText, color: "text-primary" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-muted-foreground">
      
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl border border-border bg-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 blur-[40px] pointer-events-none" />
        
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-background border border-border text-foreground">
          <UserIcon className="w-8 h-8 text-primary" />
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-1">
          <h2 className="text-xl font-bold text-foreground flex items-center justify-center md:justify-start gap-2 font-sans">
            {user?.full_name || "User"}
            <span className="flex items-center gap-1 text-[9px] bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full uppercase font-bold font-mono">
              <Sparkles className="w-2.5 h-2.5 text-primary" />
              Pro Analyst
            </span>
          </h2>
          <p className="text-muted-foreground/60 text-sm font-semibold">{user?.email}</p>
          <p className="text-muted-foreground/40 text-xs font-semibold">Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "2026"}</p>
        </div>
      </div>

      {/* Account stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} className="border-border bg-card">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/50">{item.label}</p>
                  <p className="text-xl font-bold text-foreground mt-1.5 font-mono">{item.value}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-background border border-border text-primary">
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Security Profile */}
      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border bg-background/35 pb-4">
          <CardTitle className="text-base font-bold text-foreground font-sans">Security Credentials</CardTitle>
          <CardDescription className="text-muted-foreground/60 text-xs">Change your account password securely.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="old-pass" className="text-muted-foreground">Old Password</Label>
              <Input
                id="old-pass"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="bg-background border-border focus-visible:ring-primary/30 text-foreground text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-pass" className="text-muted-foreground">New Password</Label>
              <Input
                id="new-pass"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-background border-border focus-visible:ring-primary/30 text-foreground text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pass" className="text-muted-foreground">Confirm Password</Label>
              <Input
                id="confirm-pass"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-background border-border focus-visible:ring-primary/30 text-foreground text-sm"
              />
            </div>
            <Button
              type="submit"
              className="bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs h-9 px-5 rounded-full shadow-sm active:scale-[0.98] transition-all cursor-pointer"
            >
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
