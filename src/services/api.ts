/**
 * CLDB-AI API Service Layer - Compare Agent & Benchmark Agent
 * 
 * Provides typed API calls to the CLDB-AI backend endpoints.
 * Matches the exact response structure from /src/models/api_models.py
 */

// ========== CONFIGURATION ==========

// Auto-detect API base URL based on environment
const getAPIBaseURL = (): string => {
  // Check if we're in development (localhost) or production
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (isLocalhost) {
    // Development: use localhost backend
    return 'http://localhost:8000/api/v1';
  } else {
    // Production: use same domain as frontend (main app serves both frontend and API)
    return `${window.location.origin}/api/v1`;
  }
};

const API_BASE_URL = getAPIBaseURL();

// ========== TYPE DEFINITIONS ==========
// These match exactly the backend Pydantic models

export interface Client {
  client_id: number;
  client_name: string;
  industry: string;
  campaign_count: number;
}

export interface CampaignSummary {
  campaign_id: number;
  name: string | null;
  client_name: string | null;
  industry: string | null;
  job_type: string | null;
  status: string | null;
  total_pcs_mailed: number | null;
  mail_date: string | null;
  duration_days: number | null;
  
  // Calculated metrics
  combined_social_ctr: number | null;
  leads_per_1000: number | null;
  total_social_clicks: number | null;
  total_social_impressions: number | null;
  total_leads: number | null;
}

export interface AnalysisInsight {
  type: 'strength' | 'weakness' | 'opportunity' | 'recommendation' | 'observation';
  title: string;
  message: string;
  supporting_data?: Record<string, any> | null;
  priority?: 'low' | 'medium' | 'high' | 'critical' | null;
}

export interface KeyFinding {
  headline: string;
  context: string;
  business_impact: string;
}

export interface PrimaryFactor {
  root_cause: string;
  tactical_detail: string;
  confidence_level: string;
}

export interface KPIChange {
  kpi_name: 'ad_displays' | 'engagements' | 'visitors' | 'leads' | 'attributions';
  change: number;
  change_percent: number;
  previous_value: number;
  current_value: number;
  is_positive: boolean;
}

export interface CompareRequest {
  campaign_ids: number[];
  comparison_type?: 'performance' | 'audience' | 'creative' | 'financial' | 'comprehensive';
  confidence_threshold?: number;
  focus_metrics?: string[];
}

// Interface for individual KPI metric data structure
export interface KPIMetricData {
  previous: number;
  current: number;
  change: number;
  change_percent: number;
  is_positive: boolean;
}

export interface CompareResponse {
  comparison_id: string;
  campaign_summaries: CampaignSummary[];
  metrics_comparison: Record<string, KPIMetricData>;
  insights: AnalysisInsight[];
  key_finding: KeyFinding;
  primary_factor: PrimaryFactor;
  executive_summary: string;
  detailed_analysis: string;
  created_at: string;
}

// ========== BENCHMARK AGENT TYPES ==========
// Matches backend /src/models/api_models.py BenchmarkRequest/BenchmarkResponse

export interface BenchmarkRequest {
  campaign_id: number;
  industry?: string;
  job_type?: string;
  geographic_region?: string;
  timeframe?: string;
  minimum_sample_size?: number;
  include_trends?: boolean;
  include_competitive_gaps?: boolean;
}

export interface IndustryPosition {
  metric_name: string;
  campaign_value: number;
  industry_percentile: number;
  industry_median: number;
  industry_top_quartile: number;
  performance_vs_median: number;
  rank_description: string;
}

export interface PerformanceGap {
  metric_name: string;
  campaign_value: number;
  industry_top_10_avg: number;
  gap_percentage: number;
  improvement_potential: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface IndustryTrend {
  metric_name: string;
  trend_direction: 'improving' | 'declining' | 'stable';
  trend_percentage: number;
  trend_confidence: number;
  context: string;
}

export type PerformanceGrade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F';

export interface BenchmarkResponse {
  campaign_summary: CampaignSummary;
  industry_cohort: Record<string, any>;
  statistical_significance: boolean;
  industry_positions: IndustryPosition[];
  overall_industry_grade: PerformanceGrade;
  overall_percentile: number;
  performance_gaps: PerformanceGap[];
  competitive_strengths: string[];
  industry_trends: IndustryTrend[];
  competitive_positioning: string;
  market_opportunity_score: number;
  insights: AnalysisInsight[];
  created_at: string;
}

// ========== ROI AGENT TYPES ==========
// Matches backend /src/models/api_models.py ROIRequest/ROIResponse

export interface ROIRequest {
  // Manual Input (Primary)
  campaign_cost?: number;
  sales_revenue?: number;
  additional_costs?: number;
  
  // Campaign Context (NEW - v3.0 enhancement)
  campaign_id?: number;
  
  // AI Data Processing
  uploaded_data?: string;
  data_format?: string;
}

export interface CampaignROIContext {
  campaign_id?: number;
  campaign_name?: string;
  total_pcs_mailed?: number;
  revenue_per_piece?: number;
  campaign_duration_days?: number;
  job_type?: string;
  industry?: string;
  performance_insights: string[];
}

export interface ROIResponse {
  // Core ROI Results
  roi_percentage: number;
  profit_amount: number;
  total_cost: number;
  total_revenue: number;
  explanation: string;
  data_source: string;
  
  // Campaign Context Insights (v3.0 enhancement)
  campaign_context?: CampaignROIContext;
}

// ========== ERROR HANDLING ==========

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      // Use default message if JSON parsing fails
    }
    
    throw new APIError(errorMessage, response.status, errorText);
  }
  
  return response.json();
}

// ========== API SERVICE FUNCTIONS ==========

export const apiService = {
  /**
   * Get all clients with campaign counts
   * Endpoint: GET /api/v1/clients
   */
  async getClients(): Promise<Client[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/clients`);
      return await handleResponse<Client[]>(response);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(`Failed to fetch clients: ${error instanceof Error ? error.message : 'Network error'}`);
    }
  },

  /**
   * Get all campaigns for a specific client
   * Endpoint: GET /api/v1/campaigns/by-client/{client_id}
   */
  async getCampaignsByClient(clientId: number): Promise<CampaignSummary[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns/by-client/${clientId}`);
      return await handleResponse<CampaignSummary[]>(response);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(`Failed to fetch campaigns for client ${clientId}: ${error instanceof Error ? error.message : 'Network error'}`);
    }
  },

  /**
   * Get campaigns with similar duration to the selected campaign
   * Endpoint: GET /api/v1/campaigns/{campaign_id}/similar-duration
   */
  async getSimilarCampaigns(
    campaignId: number, 
    durationTolerance: number = 2.0
  ): Promise<CampaignSummary[]> {
    try {
      const url = `${API_BASE_URL}/campaigns/${campaignId}/similar-duration?duration_tolerance=${durationTolerance}`;
      const response = await fetch(url);
      return await handleResponse<CampaignSummary[]>(response);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(`Failed to fetch similar campaigns for ${campaignId}: ${error instanceof Error ? error.message : 'Network error'}`);
    }
  },

  /**
   * Compare two campaigns using AI analysis
   * Endpoint: POST /api/v1/compare
   */
  async compareCampaigns(request: CompareRequest): Promise<CompareResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      return await handleResponse<CompareResponse>(response);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(`Failed to compare campaigns: ${error instanceof Error ? error.message : 'Network error'}`);
    }
  },

  /**
   * Analyze campaign position within industry using Benchmark Agent
   * Endpoint: POST /api/v1/industry-benchmark
   */
  async benchmarkCampaign(request: BenchmarkRequest): Promise<BenchmarkResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/industry-benchmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      return await handleResponse<BenchmarkResponse>(response);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(`Failed to benchmark campaign: ${error instanceof Error ? error.message : 'Network error'}`);
    }
  },

  /**
   * Calculate ROI with AI-powered data parsing and optional campaign context
   * Endpoint: POST /api/v1/calculate-roi
   */
  async calculateROI(request: ROIRequest): Promise<ROIResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/calculate-roi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      return await handleResponse<ROIResponse>(response);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(`Failed to calculate ROI: ${error instanceof Error ? error.message : 'Network error'}`);
    }
  },

  /**
   * Calculate ROI with file upload
   * Endpoint: POST /api/v1/calculate-roi-file (dedicated file upload endpoint)
   */
  async calculateROIWithFile(
    file: File, 
    campaignId?: number, 
    additionalCosts?: number,
    campaignCost?: number
  ): Promise<ROIResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (campaignCost) {
        formData.append('campaign_cost', campaignCost.toString());
      }
      
      if (campaignId) {
        formData.append('campaign_id', campaignId.toString());
      }
      
      if (additionalCosts) {
        formData.append('additional_costs', additionalCosts.toString());
      }

      const response = await fetch(`${API_BASE_URL}/calculate-roi-file`, {
        method: 'POST',
        // Don't set Content-Type header - let browser set it with boundary for FormData
        body: formData,
      });
      return await handleResponse<ROIResponse>(response);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(`Failed to calculate ROI from file: ${error instanceof Error ? error.message : 'Network error'}`);
    }
  },

  /**
   * Health check for API availability
   * Endpoint: GET /health (if available)
   */
  async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`);
      return await handleResponse<{ status: string }>(response);
    } catch (error) {
      throw new APIError(`API health check failed: ${error instanceof Error ? error.message : 'Network error'}`);
    }
  }
};

// ========== UTILITY FUNCTIONS ==========

/**
 * Format campaign name for display
 */
export function formatCampaignName(campaign: CampaignSummary): string {
  return campaign.name || `Campaign ${campaign.campaign_id}`;
}

/**
 * Format duration for display
 */
export function formatDuration(durationDays: number | null): string {
  if (!durationDays) return 'Unknown duration';
  if (durationDays === 1) return '1 day';
  return `${durationDays} days`;
}

/**
 * Format KPI change for display
 */
export function formatKPIChange(kpiChange: KPIChange): string {
  const sign = kpiChange.is_positive ? '+' : '';
  return `${sign}${kpiChange.change_percent.toFixed(1)}%`;
}

/**
 * Get insight icon based on type
 */
export function getInsightIcon(type: AnalysisInsight['type']): string {
  switch (type) {
    case 'strength': return '💪';
    case 'weakness': return '⚠️';
    case 'opportunity': return '🎯';
    case 'recommendation': return '💡';
    case 'observation': return '📊';
    default: return '📄';
  }
}

/**
 * Format ROI percentage for display
 */
export function formatROI(roiPercentage: number): string {
  return `${roiPercentage.toFixed(1)}%`;
}

/**
 * Format currency amount for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get ROI performance indicator
 */
export function getROIPerformanceIndicator(roiPercentage: number): {
  label: string;
  color: string;
  icon: string;
} {
  if (roiPercentage >= 300) {
    return { label: 'Excellent ROI', color: 'text-green-600', icon: '🚀' };
  } else if (roiPercentage >= 100) {
    return { label: 'Good ROI', color: 'text-green-500', icon: '✅' };
  } else if (roiPercentage >= 0) {
    return { label: 'Positive ROI', color: 'text-blue-500', icon: '📈' };
  } else {
    return { label: 'Loss', color: 'text-red-500', icon: '⚠️' };
  }
}

/**
 * Get data source display information
 */
export function getDataSourceDisplay(dataSource: string): {
  label: string;
  accuracy: string;
  icon: string;
} {
  switch (dataSource) {
    case 'manual_input':
      return { label: 'Manual Input', accuracy: 'High Accuracy', icon: '✋' };
    case 'csv_parsed':
      return { label: 'AI Parsed File', accuracy: 'Medium-High Accuracy', icon: '🤖' };
    case 'insufficient_data':
      return { label: 'Insufficient Data', accuracy: 'N/A', icon: '❌' };
    default:
      return { label: 'Unknown', accuracy: 'Unknown', icon: '❓' };
  }
}