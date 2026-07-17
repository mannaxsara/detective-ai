import { create } from 'zustand';
import type { Dataset, Analysis } from '@/types';

interface AnalysisState {
  currentDataset: Dataset | null;
  currentAnalysis: Analysis | null;
  activeTab: string;
  sidebarCollapsed: boolean;
  setDataset: (dataset: Dataset | null) => void;
  setAnalysis: (analysis: Analysis | null) => void;
  setActiveTab: (tab: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  currentDataset: null,
  currentAnalysis: null,
  activeTab: 'profile',
  sidebarCollapsed: false,

  setDataset: (dataset) => set({ currentDataset: dataset }),
  setAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
