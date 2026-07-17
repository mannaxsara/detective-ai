// ========== User Types ==========
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  datasets_count?: number;
  analyses_count?: number;
  reports_count?: number;
}

// ========== Auth Types ==========
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  full_name: string;
}

// ========== Dataset Types ==========
export interface Dataset {
  id: string | number;
  slug?: string;
  name: string;
  file_name?: string;
  original_filename?: string;
  file_type: string;
  file_size: number;
  row_count: number;
  column_count: number;
  uploaded_at?: string;
  created_at?: string;
  status: string;
  user_id: string | number;
  description?: string;
  columns?: ColumnInfo[];
  health_score?: number;
}

export interface ColumnInfo {
  name: string;
  dtype: string;
  nullable: boolean;
  unique_count: number;
  missing_count: number;
  missing_percentage: number;
}

export interface DatasetPreview {
  columns: string[];
  rows: Record<string, unknown>[];
  total_rows: number;
  preview_rows: number;
}

// ========== Analysis Types ==========
export interface Analysis {
  id: string;
  dataset_id: string;
  dataset_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  health_score: number;
  created_at: string;
  completed_at?: string;
  error_message?: string;
  profile?: DatasetProfile;
}

export interface DatasetProfile {
  total_rows: number;
  total_columns: number;
  memory_usage: string;
  duplicate_rows: number;
  duplicate_percentage: number;
  missing_values_total: number;
  missing_percentage: number;
  constant_columns: number;
  numeric_columns: number;
  categorical_columns: number;
  datetime_columns: number;
  boolean_columns: number;
  text_columns: number;
  column_profiles: ColumnProfile[];
}

export interface ColumnProfile {
  name: string;
  dtype: string;
  unique_count: number;
  unique_percentage: number;
  missing_count: number;
  missing_percentage: number;
  min?: number | string;
  max?: number | string;
  mean?: number;
  median?: number;
  std?: number;
  mode?: string | number;
  skewness?: number;
  kurtosis?: number;
  top_values?: { value: string; count: number; percentage: number }[];
  histogram?: { bins: number[]; counts: number[] };
}

// ========== Chart Types ==========
export interface ChartConfig {
  id: string;
  title: string;
  chart_type: 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap' | 'histogram' | 'boxplot' | 'treemap' | 'area' | 'donut';
  description?: string;
  options: Record<string, unknown>;
  data: Record<string, unknown>;
  columns_used: string[];
}

// ========== KPI Types ==========
export interface KPICard {
  id: string;
  name: string;
  value: string | number;
  formatted_value: string;
  trend: 'up' | 'down' | 'stable';
  change_percentage: number;
  category: string;
  icon_type?: string;
  icon?: string;
  sparkline_data?: number[];
  description?: string;
}

// ========== Insight Types ==========
export interface InsightItem {
  id: string;
  description: string;
  category: 'trend' | 'anomaly' | 'correlation' | 'distribution' | 'recommendation' | 'revenue' | 'customer' | 'product';
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  supporting_data?: Record<string, unknown>;
  affected_columns?: string[];
}

// ========== Statistics Types ==========
export interface StatisticalTest {
  id?: string;
  test_name: string;
  description: string;
  p_value: number;
  significance_level: number;
  is_significant?: boolean;
  significant?: boolean;
  test_statistic?: number;
  statistic?: number;
  interpretation: string;
  columns_tested?: string[];
  method?: string;
}

export interface CorrelationMatrix {
  columns: string[];
  values: number[][];
}

export interface RegressionResult {
  equation: string;
  r_squared: number;
  adj_r_squared: number;
  coefficients: { name: string; value: number; std_error: number; p_value: number }[];
  dependent_variable: string;
  independent_variables: string[];
}

// ========== Anomaly Types ==========
export interface AnomalyItem {
  id: string;
  entity_type: string;
  entity_id: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  detection_method: string;
  reason: string;
  affected_column?: string;
  affected_columns?: string[];
  value?: number | string;
  expected_range?: { min: number; max: number };
}

// ========== Forecast Types ==========
export interface ForecastResult {
  metric?: string;
  metric_name: string;
  dates: string[];
  values: number[];
  lower_bound: number[];
  upper_bound: number[];
  periods: number;
  components?: Record<string, any>;
  period_days?: number;
  historical?: { date: string; value: number }[];
  forecast?: { date: string; value: number; lower_bound: number; upper_bound: number }[];
  predicted_end_value?: number;
  growth_percentage?: number;
  confidence_level?: number;
  model_used?: string;
}

// ========== Cleaning Types ==========
export interface CleaningSuggestion {
  id: string;
  issue_type: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  affected_column?: string;
  affected_count: number;
  affected_percentage: number;
  suggested_fix: string;
  auto_fixable: boolean;
}

// ========== Report Types ==========
export interface Report {
  id: string;
  analysis_id: string;
  dataset_name: string;
  format: 'pdf' | 'docx';
  status: 'generating' | 'ready' | 'failed';
  created_at: string;
  download_url?: string;
  sections: string[];
  file_size?: number;
}

// ========== History Types ==========
export interface HistoryItem {
  id: string;
  slug?: string;
  dataset_name: string;
  analysis_id: string;
  action_type: string;
  status: 'completed' | 'failed' | 'pending';
  health_score?: number;
  row_count?: number;
  created_at: string;
}

// ========== API Response Types ==========
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// ========== Dashboard Stats ==========
export interface DashboardStats {
  total_datasets: number;
  total_analyses: number;
  total_reports: number;
  total_insights: number;
  recent_analyses: Analysis[];
  activity_timeline: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  icon_type: string;
}
