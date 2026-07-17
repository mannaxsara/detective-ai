"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Grid,
  HardDrive,
  Copy,
} from "lucide-react";
import { datasetsAPI } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ProfileTabProps {
  datasetId: number | string;
}

export default function ProfileTab({ datasetId }: ProfileTabProps) {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["dataset-profile", datasetId],
    queryFn: () => datasetsAPI.getProfile(datasetId),
  });

  if (isLoading || !profile) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-white/[0.01] border border-[#27272A]" />
        ))}
      </div>
    );
  }

  const statCards = [
    { label: "Total Rows", value: profile.row_count.toLocaleString(), icon: FileText },
    { label: "Total Columns", value: profile.column_count, icon: Grid },
    { label: "Memory Size", value: `${(profile.memory_usage_bytes / 1024).toFixed(1)} KB`, icon: HardDrive },
    { label: "Duplicate Rows", value: profile.duplicate_row_count, icon: Copy },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="border-[#27272A] bg-[#18181B] shadow-none">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">{card.label}</p>
                  <p className="text-lg font-mono font-extrabold text-zinc-200 mt-1">{card.value}</p>
                </div>
                <div className="p-2 rounded-lg bg-[#09090B] text-[#ea580c] border border-[#27272A]">
                  <Icon className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Columns Profile Table */}
      <Card className="border-[#27272A] bg-[#18181B] shadow-none">
        <CardHeader className="pb-3 border-b border-[#27272A]">
          <CardTitle className="text-sm font-bold text-zinc-200">Column Schema & Profiling</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#09090B] border-b border-[#27272A]">
              <TableRow className="border-b border-[#27272A] hover:bg-transparent">
                <TableHead className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Column Name</TableHead>
                <TableHead className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Data Type</TableHead>
                <TableHead className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Classification</TableHead>
                <TableHead className="text-zinc-500 text-xs font-bold uppercase tracking-wider text-right">Unique Values</TableHead>
                <TableHead className="text-zinc-500 text-xs font-bold uppercase tracking-wider text-right">Missing Count</TableHead>
                <TableHead className="text-zinc-500 text-xs font-bold uppercase tracking-wider text-right">Missing %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profile.columns.map((col: any, idx: number) => {
                return (
                  <TableRow key={idx} className="border-b border-[#27272A] hover:bg-[#111217]/50">
                    <TableCell className="font-bold text-xs text-zinc-200">{col.name}</TableCell>
                    <TableCell className="font-mono text-[10px] text-zinc-500">{col.dtype}</TableCell>
                    <TableCell>
                      <Badge className="text-[9px] px-2 py-0.5 rounded capitalize bg-[#09090B] text-zinc-400 border border-[#27272A] font-bold">
                        {col.classification}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-zinc-300 font-mono text-xs">{col.unique_count.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-zinc-300 font-mono text-xs">{col.null_count.toLocaleString()}</TableCell>
                    <TableCell className={`text-right font-mono text-xs font-bold ${col.null_percentage > 20 ? "text-[#EF4444]" : col.null_percentage > 0 ? "text-[#F59E0B]" : "text-zinc-500"}`}>
                      {col.null_percentage}%
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
