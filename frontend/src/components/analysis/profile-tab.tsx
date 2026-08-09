"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Grid,
  HardDrive,
  Copy,
  AlertCircle,
} from "lucide-react";
import { datasetsAPI } from "@/lib/api";
import { RadialProfile } from "@/components/ui/radial-profile";
import { PieChart, PieSlices, PieCenter, PieTooltip, PieLegend, PieDataItem } from "@/components/ui/chart-pie";
import { RadarChart, RadarGrid, RadarAxis, RadarLabels, RadarArea, RadarMetric, RadarData } from "@/components/ui/chart-radar";

interface ProfileTabProps {
  datasetId: number | string;
}

export default function ProfileTab({ datasetId }: ProfileTabProps) {
  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: ["dataset-profile", datasetId],
    queryFn: () => datasetsAPI.getProfile(datasetId),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 animate-pulse font-sans">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-white dark:bg-[#181914] border border-black/10 dark:border-white/10" />
        ))}
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="border border-[#bc3e3e]/40 bg-[#bc3e3e]/5 rounded-xl p-6 font-sans flex flex-col items-center gap-3 text-center">
        <div className="w-10 h-10 rounded-lg bg-[#bc3e3e]/10 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-[#bc3e3e]" />
        </div>
        <p className="text-sm font-bold text-black dark:text-white">Failed to load dataset profile</p>
        <p className="text-xs text-black/60 dark:text-white/60">The profiling data could not be retrieved. Please try again.</p>
        <button
          onClick={() => refetch()}
          className="btn-ink-accent text-xs py-2.5 px-5 font-mono uppercase font-bold shadow-sm cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    { label: "Total Rows", value: profile.row_count.toLocaleString(), icon: FileText },
    { label: "Total Columns", value: profile.column_count, icon: Grid },
    { label: "Memory Size", value: `${(profile.memory_usage_bytes / 1024).toFixed(1)} KB`, icon: HardDrive },
    { label: "Duplicate Rows", value: profile.duplicate_row_count, icon: Copy },
  ];

  const columns = profile?.columns || [];
  const avgNullPct = columns.reduce((s: number, c: any) => s + (c.null_percentage || 0), 0) / (columns.length || 1);
  const knownTypes = columns.filter((c: any) => c.classification && c.classification !== 'unknown').length;
  const typeIntegrity = profile.column_count > 0 ? Math.round((knownTypes / profile.column_count) * 100) : 100;

  const completeness = profile.row_count > 0 ? Math.round(profile.health_score ?? 0) : 100;
  const uniqueness = profile.row_count > 0 ? Math.round(100 - (profile.duplicate_row_count / profile.row_count) * 100) : 100;
  
  const radialMetrics = [
    { label: "Schema Health & Completeness", score: completeness, color: "#edfe5e" },
    { label: "Row Uniqueness Ratio", score: uniqueness, color: "#31e992" },
    { label: "Column Type Integrity", score: typeIntegrity, color: "#bed4fb" },
    { label: "Null Cell Safety", score: Math.round(100 - avgNullPct), color: "#f59e0b" },
  ];

  const classifications = columns.reduce((acc: Record<string,number>, col: any) => {
    const cls = col.classification || 'unknown';
    acc[cls] = (acc[cls] || 0) + 1;
    return acc;
  }, {} as Record<string,number>);
  const typeDistribution: PieDataItem[] = [
    { name: 'Numeric', value: classifications.numeric || 0, fill: '#edfe5e' },
    { name: 'Categorical', value: classifications.categorical || 0, fill: '#31e992' },
    { name: 'DateTime', value: classifications.datetime || 0, fill: '#bed4fb' },
    { name: 'Boolean', value: classifications.boolean || 0, fill: '#f59e0b' },
  ].filter(d => d.value > 0);

  const numericRatio = ((columns.filter((c: any) => c.classification === 'numeric').length || 0) / (profile?.column_count || 1)) * 100;
  const qualityMetrics: RadarMetric[] = [
    { key: 'completeness', label: 'Completeness' },
    { key: 'uniqueness', label: 'Uniqueness' },
    { key: 'typeIntegrity', label: 'Type Integrity' },
    { key: 'nullSafety', label: 'Null Safety' },
    { key: 'density', label: 'Density' },
  ];
  const qualityData: RadarData[] = [{
    label: 'Dataset Quality',
    color: '#edfe5e',
    values: {
      completeness: Math.round(profile?.health_score ?? 0),
      uniqueness: Math.round(100 - ((profile?.duplicate_row_count || 0) / (profile?.row_count || 1)) * 100),
      typeIntegrity: Math.round(numericRatio),
      nullSafety: Math.round(100 - avgNullPct),
      density: Math.round(100 - avgNullPct * 0.8),
    },
  }];

  return (
    <div className="space-y-6 font-sans text-black dark:text-white">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="p-5 rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#181914] shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-black/60 dark:text-white/60">{card.label}</p>
                <p className="text-xl font-mono font-bold text-black dark:text-white mt-1">{card.value}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#edf0e9] dark:bg-[#262720] text-black dark:text-white border border-black/10 dark:border-white/10">
                <Icon className="w-4.5 h-4.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bklit UI Radial Profile Component */}
      <RadialProfile metrics={radialMetrics} title="Multi-Dimensional Schema Quality Radar" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {typeDistribution.length > 0 && (
          <div className="border border-black/15 dark:border-white/15 rounded-xl p-6 bg-white dark:bg-[#181914] space-y-4 shadow-sm">
            <div>
              <h3 className="text-sm font-serif font-bold text-black dark:text-white">Column Type Distribution</h3>
              <p className="text-black/60 dark:text-white/60 text-xs font-sans mt-0.5">Classification breakdown across dataset schema</p>
            </div>
            <PieChart data={typeDistribution} innerRadius={50} outerRadius={85} paddingAngle={3} height={300}>
              <PieSlices />
              <PieCenter>
                <span className="text-xl font-mono font-bold text-black dark:text-white">{profile.column_count}</span>
                <span className="text-[9px] font-mono text-black/60 dark:text-white/60 uppercase tracking-wider">Columns</span>
              </PieCenter>
              <PieTooltip />
              <PieLegend />
            </PieChart>
          </div>
        )}

        <div className="border border-black/15 dark:border-white/15 rounded-xl p-6 bg-white dark:bg-[#181914] space-y-4 shadow-sm">
          <div>
            <h3 className="text-sm font-serif font-bold text-black dark:text-white">Quality Radar Assessment</h3>
            <p className="text-black/60 dark:text-white/60 text-xs font-sans mt-0.5">Multi-dimensional dataset quality scoring</p>
          </div>
          <RadarChart data={qualityData} metrics={qualityMetrics} size={280} levels={5}>
            <RadarGrid showLabels stroke="#000000" />
            <RadarAxis stroke="#000000" />
            <RadarLabels offset={24} fontSize={10} />
            <RadarArea index={0} fill="#edfe5e" stroke="#000000" strokeWidth={2} />
          </RadarChart>
        </div>
      </div>

      {/* Columns Profile Table */}
      <div className="border border-black/15 dark:border-white/15 rounded-xl bg-white dark:bg-[#181914] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-black/10 dark:border-white/10 bg-[#edf0e9] dark:bg-[#262720]">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">Column Schema & Profiling</h3>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px] text-left">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 bg-[#f9f9f7] dark:bg-[#262720] font-mono text-[10px] uppercase font-bold text-black/70 dark:text-white/70">
                <th className="px-6 py-3.5">Column Name</th>
                <th className="px-6 py-3.5">Data Type</th>
                <th className="px-6 py-3.5">Classification</th>
                <th className="px-6 py-3.5 text-right">Unique Values</th>
                <th className="px-6 py-3.5 text-right">Missing Count</th>
                <th className="px-6 py-3.5 text-right">Missing %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {profile.columns.map((col: any, idx: number) => {
                return (
                  <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3.5 font-bold font-serif text-xs text-black dark:text-white">{col.name}</td>
                    <td className="px-6 py-3.5 font-mono text-[11px] text-black/60 dark:text-white/60">{col.dtype}</td>
                    <td className="px-6 py-3.5">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-black/10 dark:border-white/10 bg-[#edf0e9] dark:bg-[#262720] uppercase text-black dark:text-white">
                        {col.classification}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono text-xs font-bold text-black dark:text-white">{col.unique_count.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-right font-mono text-xs font-bold text-black dark:text-white">{col.null_count.toLocaleString()}</td>
                    <td className={`px-6 py-3.5 text-right font-mono text-xs font-bold ${col.null_percentage > 20 ? "text-[#bc3e3e]" : col.null_percentage > 0 ? "text-amber-600" : "text-black/50 dark:text-white/50"}`}>
                      {col.null_percentage}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
