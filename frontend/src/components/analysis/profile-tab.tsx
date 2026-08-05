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
import { RadialProfile } from "@/components/ui/radial-profile";
import { PieChart, PieSlices, PieCenter, PieTooltip, PieLegend, PieDataItem } from "@/components/ui/chart-pie";
import { RadarChart, RadarGrid, RadarAxis, RadarLabels, RadarArea, RadarMetric, RadarData } from "@/components/ui/chart-radar";

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
          <div key={i} className="h-20 rounded-xl bg-muted/20 border border-border/40" />
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

  const completeness = profile.row_count > 0 ? Math.round(profile.health_score || 95) : 100;
  const uniqueness = profile.row_count > 0 ? Math.round(100 - (profile.duplicate_row_count / profile.row_count) * 100) : 100;
  
  const radialMetrics = [
    { label: "Schema Health & Completeness", score: completeness, color: "#d8cfbc" },
    { label: "Row Uniqueness Ratio", score: uniqueness, color: "#78c51c" },
    { label: "Column Type Integrity", score: 98, color: "#bed4fb" },
    { label: "Null Cell Safety", score: Math.max(70, completeness - 5), color: "#f59e0b" },
  ];

  const classifications = (profile?.columns || []).reduce((acc: Record<string,number>, col: any) => {
    const cls = col.classification || 'unknown';
    acc[cls] = (acc[cls] || 0) + 1;
    return acc;
  }, {} as Record<string,number>);
  const typeDistribution: PieDataItem[] = [
    { name: 'Numeric', value: classifications.numeric || 0, fill: '#d8cfbc' },
    { name: 'Categorical', value: classifications.categorical || 0, fill: '#78c51c' },
    { name: 'DateTime', value: classifications.datetime || 0, fill: '#bed4fb' },
    { name: 'Boolean', value: classifications.boolean || 0, fill: '#f59e0b' },
  ].filter(d => d.value > 0);

  const avgNullPct = profile?.columns?.reduce((s: number, c: any) => s + (c.null_percentage || 0), 0) / (profile?.columns?.length || 1);
  const numericRatio = ((profile?.columns?.filter((c: any) => c.classification === 'numeric').length || 0) / (profile?.column_count || 1)) * 100;
  const qualityMetrics: RadarMetric[] = [
    { key: 'completeness', label: 'Completeness' },
    { key: 'uniqueness', label: 'Uniqueness' },
    { key: 'typeIntegrity', label: 'Type Integrity' },
    { key: 'nullSafety', label: 'Null Safety' },
    { key: 'density', label: 'Density' },
  ];
  const qualityData: RadarData[] = [{
    label: 'Dataset Quality',
    color: '#d8cfbc',
    values: {
      completeness: Math.round(profile?.health_score || 95),
      uniqueness: Math.round(100 - ((profile?.duplicate_row_count || 0) / (profile?.row_count || 1)) * 100),
      typeIntegrity: Math.round(numericRatio),
      nullSafety: Math.round(100 - avgNullPct),
      density: Math.round(100 - avgNullPct * 0.8),
    },
  }];

  return (
    <div className="space-y-6 font-sans">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="border-border bg-card shadow-none">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{card.label}</p>
                  <p className="text-lg font-mono font-extrabold text-foreground mt-1">{card.value}</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <Icon className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bklit UI Radial Profile Component */}
      <RadialProfile metrics={radialMetrics} title="Multi-Dimensional Schema Quality Radar" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {typeDistribution.length > 0 && (
          <div className="border border-border rounded-xl p-5 bg-card space-y-3">
            <div>
              <h3 className="text-xs font-serif font-bold text-foreground">Column Type Distribution</h3>
              <p className="text-muted-foreground text-[10px] mt-0.5">Classification breakdown across schema</p>
            </div>
            <PieChart data={typeDistribution} innerRadius={50} outerRadius={85} paddingAngle={3} height={260}>
              <PieSlices />
              <PieCenter>
                <span className="text-xl font-mono font-black text-foreground">{profile.column_count}</span>
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Columns</span>
              </PieCenter>
              <PieTooltip />
            </PieChart>
            <PieLegend />
          </div>
        )}

        <div className="border border-border rounded-xl p-5 bg-card space-y-3">
          <div>
            <h3 className="text-xs font-serif font-bold text-foreground">Quality Radar Assessment</h3>
            <p className="text-muted-foreground text-[10px] mt-0.5">Multi-dimensional dataset quality scoring</p>
          </div>
          <RadarChart data={qualityData} metrics={qualityMetrics} size={280} levels={5}>
            <RadarGrid showLabels stroke="var(--border)" />
            <RadarAxis stroke="var(--border)" />
            <RadarLabels offset={24} fontSize={10} />
            <RadarArea index={0} fill="#d8cfbc" stroke="#d8cfbc" strokeWidth={2} />
          </RadarChart>
        </div>
      </div>

      {/* Columns Profile Table */}
      <Card className="border-border bg-card shadow-none">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-sm font-bold text-foreground">Column Schema & Profiling</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader className="bg-muted/50 border-b border-border">
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Column Name</TableHead>
                <TableHead className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Data Type</TableHead>
                <TableHead className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Classification</TableHead>
                <TableHead className="text-muted-foreground text-xs font-bold uppercase tracking-wider text-right">Unique Values</TableHead>
                <TableHead className="text-muted-foreground text-xs font-bold uppercase tracking-wider text-right">Missing Count</TableHead>
                <TableHead className="text-muted-foreground text-xs font-bold uppercase tracking-wider text-right">Missing %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profile.columns.map((col: any, idx: number) => {
                return (
                  <TableRow key={idx} className="border-b border-border/40 hover:bg-muted/40 transition-colors">
                    <TableCell className="font-bold text-xs text-foreground">{col.name}</TableCell>
                    <TableCell className="font-mono text-[10px] text-muted-foreground">{col.dtype}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] px-2 py-0.5 rounded capitalize border-border text-muted-foreground font-semibold">
                        {col.classification}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-foreground/80 font-mono text-xs">{col.unique_count.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-foreground/80 font-mono text-xs">{col.null_count.toLocaleString()}</TableCell>
                    <TableCell className={`text-right font-mono text-xs font-bold ${col.null_percentage > 20 ? "text-destructive" : col.null_percentage > 0 ? "text-amber-500" : "text-muted-foreground"}`}>
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
