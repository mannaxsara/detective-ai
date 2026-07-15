import axios, { AxiosProgressEvent } from 'axios';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
  Dataset,
  DatasetPreview,
  Analysis,
  ChartConfig,
  KPICard,
  InsightItem,
  StatisticalTest,
  CorrelationMatrix,
  RegressionResult,
  AnomalyItem,
  ForecastResult,
  CleaningSuggestion,
  Report,
  HistoryItem,
  DashboardStats,
  PaginatedResponse,
} from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('detective_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('detective_token');
        localStorage.removeItem('detective_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ========== Auth API ==========
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/register', credentials);
    return data;
  },

  googleAuth: async (token: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/google', { token });
    return data;
  },

  refreshToken: async (): Promise<{ access_token: string }> => {
    const { data } = await api.post('/auth/refresh');
    return data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },

  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    const { data } = await api.post('/auth/reset-password', { token, password });
    return data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get('/auth/me');
    return data;
  },
};

// ========== Datasets API ==========
export const datasetsApi = {
  upload: async (
    file: File,
    onProgress?: (progress: AxiosProgressEvent) => void
  ): Promise<Dataset> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/datasets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
      timeout: 300000,
    });
    return data;
  },

  list: async (skip = 0, limit = 10): Promise<any> => {
    const { data } = await api.get('/datasets', {
      params: { skip, limit },
    });
    return data;
  },

  getById: async (id: string | number): Promise<Dataset> => {
    const { data } = await api.get(`/datasets/${id}`);
    return data;
  },

  deleteById: async (id: string | number): Promise<void> => {
    await api.delete(`/datasets/${id}`);
  },

  delete: async (id: string | number): Promise<void> => {
    await api.delete(`/datasets/${id}`);
  },

  preview: async (id: string | number): Promise<DatasetPreview> => {
    const { data } = await api.get(`/datasets/${id}/preview`);
    return data;
  },

  getProfile: async (id: string | number): Promise<any> => {
    const { data } = await api.get(`/datasets/${id}/profile`);
    return data;
  },
};

// ========== Cleaning API ==========
export const cleaningApi = {
  getSuggestions: async (datasetId: string | number): Promise<any> => {
    const { data } = await api.get(`/datasets/${datasetId}/cleaning`);
    return data;
  },

  applyFixes: async (datasetId: string | number, fixIds: string[]): Promise<any> => {
    const { data } = await api.post(`/datasets/${datasetId}/cleaning/apply`, { fix_ids: fixIds });
    return data;
  },
};

// ========== Analysis API ==========
export const analysisApi = {
  triggerAnalysis: async (datasetId: string | number): Promise<Analysis> => {
    const { data } = await api.post(`/analysis/trigger`, { dataset_id: datasetId });
    return data;
  },

  getAnalysis: async (analysisId: string | number): Promise<Analysis> => {
    const { data } = await api.get(`/analysis/${analysisId}`);
    return data;
  },

  getCharts: async (analysisId: string | number): Promise<ChartConfig[]> => {
    const { data } = await api.get(`/analysis/${analysisId}/charts`);
    return data;
  },

  getKpis: async (analysisId: string | number): Promise<KPICard[]> => {
    const { data } = await api.get(`/analysis/${analysisId}/kpis`);
    return data;
  },

  getInsights: async (analysisId: string | number): Promise<InsightItem[]> => {
    const { data } = await api.get(`/analysis/${analysisId}/insights`);
    return data;
  },

  chat: async (analysisId: string | number, message: string): Promise<{ reply: string }> => {
    const { data } = await api.post(`/analysis/${analysisId}/chat`, { message });
    return data;
  },

  getRootCause: async (analysisId: string | number): Promise<any[]> => {
    const { data } = await api.get(`/analysis/${analysisId}/root-cause`);
    return data;
  },

  getRecommendations: async (analysisId: string | number): Promise<string[]> => {
    const { data } = await api.get(`/analysis/${analysisId}/recommendations`);
    return data;
  },
};

// ========== Statistics API ==========
export const statisticsApi = {
  getStatistics: async (analysisId: string | number): Promise<StatisticalTest[]> => {
    const { data } = await api.get(`/analysis/${analysisId}/statistics`);
    return data;
  },

  getAnomalies: async (analysisId: string | number): Promise<AnomalyItem[]> => {
    const { data } = await api.get(`/analysis/${analysisId}/anomalies`);
    return data;
  },
};

// ========== Forecast API ==========
export const forecastApi = {
  generateForecast: async (analysisId: string | number, metric: string, periodDays: number): Promise<ForecastResult> => {
    const { data } = await api.post(`/analysis/${analysisId}/forecast`, {
      metric,
      period_days: periodDays,
    });
    return data;
  },

  getForecast: async (analysisId: string | number, targetCol?: string | null, periods?: number): Promise<ForecastResult> => {
    const { data } = await api.get(`/analysis/${analysisId}/forecast`, {
      params: {
        target_col: targetCol || undefined,
        periods: periods || undefined,
      }
    });
    return data;
  },
};

// ========== Reports API ==========
export const reportsApi = {
  generate: async (analysisId: string | number, format: 'pdf' | 'docx'): Promise<any> => {
    const { data } = await api.post(`/reports/analysis/${analysisId}`, null, {
      params: { file_format: format },
    });
    return data;
  },

  listReports: async (): Promise<Report[]> => {
    const { data } = await api.get('/reports');
    return data;
  },

  downloadReport: async (reportId: string | number): Promise<Blob> => {
    const { data } = await api.get(`/reports/${reportId}/download`, {
      responseType: 'blob',
    });
    return data;
  },
};

// ========== History API ==========
export const historyApi = {
  getHistory: async (page = 1, perPage = 20): Promise<PaginatedResponse<HistoryItem>> => {
    const { data } = await api.get('/history', {
      params: { page, per_page: perPage },
    });
    return data;
  },

  list: async (skip = 0, limit = 10): Promise<any> => {
    const page = Math.floor(skip / limit) + 1;
    const { data } = await api.get('/history', {
      params: { page, per_page: limit },
    });
    return data;
  },

  searchHistory: async (query: string): Promise<HistoryItem[]> => {
    const { data } = await api.get('/history/search', {
      params: { q: query },
    });
    return data;
  },

  search: async (query: string): Promise<any> => {
    const { data } = await api.get('/history/search', {
      params: { q: query },
    });
    return data;
  },
};

// ========== Dashboard API ==========
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get('/dashboard/stats');
    return data;
  },
};

export const authAPI = authApi;
export const datasetsAPI = datasetsApi;
export const cleaningAPI = cleaningApi;
export const analysisAPI = {
  ...analysisApi,
  getStatistics: statisticsApi.getStatistics,
  getAnomalies: statisticsApi.getAnomalies,
  getForecast: forecastApi.getForecast,
  generateForecast: forecastApi.generateForecast,
};
export const statisticsAPI = statisticsApi;
export const forecastAPI = forecastApi;
export const reportsAPI = reportsApi;
export const historyAPI = historyApi;
export const dashboardAPI = dashboardApi;

export default api;

