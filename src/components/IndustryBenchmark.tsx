import React, { useState, useEffect } from 'react';
import { Trophy, Building2, Target, TrendingUp, TrendingDown, Award, Lightbulb } from 'lucide-react';
import { 
  CampaignSummary, 
  BenchmarkResponse,
  apiService, 
  APIError, 
  formatCampaignName, 
  formatDuration 
} from '../services/api';

interface Client {
  client_id: number;
  client_name: string;
}

interface IndustryBenchmarkProps {
  selectedClient: Client | null;
}

const IndustryBenchmark: React.FC<IndustryBenchmarkProps> = ({ selectedClient }) => {
  // State management following Compare Agent patterns
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignSummary | null>(null);
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResponse | null>(null);
  
  // Loading states
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Error states
  const [campaignError, setCampaignError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Effect: Load campaigns when client changes (mirrors Compare Agent pattern)
  useEffect(() => {
    const loadCampaigns = async () => {
      if (!selectedClient) {
        setCampaigns([]);
        setSelectedCampaign(null);
        setBenchmarkResult(null);
        return;
      }

      try {
        setIsLoadingCampaigns(true);
        setCampaignError(null);
        setSelectedCampaign(null);
        setBenchmarkResult(null);
        
        const campaignData = await apiService.getCampaignsByClient(selectedClient.client_id);
        setCampaigns(campaignData);
      } catch (error) {
        console.error('Failed to load campaigns:', error);
        setCampaignError(error instanceof APIError ? error.message : 'Failed to load campaigns');
        setCampaigns([]);
      } finally {
        setIsLoadingCampaigns(false);
      }
    };

    loadCampaigns();
  }, [selectedClient]);

  // Handle analyze button click
  const handleAnalyze = async () => {
    if (!selectedCampaign) {
      setAnalysisError('Please select a campaign to benchmark');
      return;
    }

    try {
      setIsAnalyzing(true);
      setAnalysisError(null);
      
      const result = await apiService.benchmarkCampaign({
        campaign_id: selectedCampaign.campaign_id,
        industry: selectedCampaign.industry || undefined
      });
      
      setBenchmarkResult(result);
    } catch (error) {
      console.error('Failed to analyze campaign:', error);
      setAnalysisError(error instanceof APIError ? error.message : 'Failed to analyze campaign');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper function to get metric data by name
  const getMetricData = (metricName: string) => {
    if (!benchmarkResult) return null;
    
    return benchmarkResult.industry_positions.find(
      (position: any) => position.metric_name.toLowerCase().includes(metricName.toLowerCase())
    );
  };
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Industry Benchmark Analysis</h1>
        <p className="text-gray-600">Compare performance against industry cohorts with statistical analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Campaign Selection Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Campaign Selection</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Select Campaign to Benchmark
                </label>
                <p className="text-sm text-gray-500 mb-3">Choose a campaign for industry comparison</p>
                <div className="relative">
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    disabled={!selectedClient || isLoadingCampaigns}
                    value={selectedCampaign?.campaign_id || ''}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      const campaignId = parseInt(e.target.value);
                      const campaign = campaigns.find((c: CampaignSummary) => c.campaign_id === campaignId);
                      setSelectedCampaign(campaign || null);
                      setBenchmarkResult(null); // Reset results when campaign changes
                    }}
                  >
                    <option value="">
                      {!selectedClient 
                        ? 'Select client first' 
                        : isLoadingCampaigns 
                          ? 'Loading campaigns...' 
                          : campaignError
                            ? 'Error loading campaigns'
                            : campaigns.length === 0
                              ? 'No campaigns available'
                              : 'Select campaign to benchmark'
                      }
                    </option>
                    {campaigns.map((campaign: CampaignSummary) => (
                      <option key={campaign.campaign_id} value={campaign.campaign_id}>
                        {formatCampaignName(campaign)} ({formatDuration(campaign.duration_days)})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <button 
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedCampaign || isAnalyzing}
                onClick={handleAnalyze}
              >
                <Trophy className="w-5 h-5" />
                <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Industry Position'}</span>
              </button>
              
              {/* Error Display */}
              {analysisError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {analysisError}
                </div>
              )}
              
              <p className="text-sm text-gray-600 text-center italic">
                {benchmarkResult 
                  ? `Compared against ${benchmarkResult.industry_cohort.sample_size} similar ${benchmarkResult.industry_cohort.industry.toLowerCase()} campaigns`
                  : selectedCampaign 
                    ? `Ready to benchmark against ${selectedCampaign.industry || 'industry'} campaigns`
                    : 'Select a campaign to see comparison details'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2">
          {/* Campaign Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Industry Benchmark Analysis</h2>
                <p className="text-sm text-gray-600">Performance comparison against furniture industry cohorts</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-orange-600" />
                  <span>Campaign Details</span>
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-1 border-b border-orange-200">
                    <span className="text-sm font-medium text-gray-600">Campaign</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {benchmarkResult?.campaign_summary?.name || selectedCampaign?.name || '---'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-orange-200">
                    <span className="text-sm font-medium text-gray-600">Client</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {benchmarkResult?.campaign_summary?.client_name || selectedCampaign?.client_name || '---'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-orange-200">
                    <span className="text-sm font-medium text-gray-600">Duration</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {benchmarkResult?.campaign_summary?.duration_days 
                        ? `${benchmarkResult.campaign_summary.duration_days} days`
                        : selectedCampaign?.duration_days 
                          ? `${selectedCampaign.duration_days} days`
                          : '---'
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm font-medium text-gray-600">Industry</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {benchmarkResult?.campaign_summary?.industry || selectedCampaign?.industry || '---'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center space-x-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  <span>Industry Position Summary</span>
                </h3>
                <div className="space-y-3">
                  <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-gray-600 mb-2">Overall Industry Grade</p>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-base font-bold bg-orange-100 text-orange-800 border border-orange-300">
                      {benchmarkResult?.overall_industry_grade || '---'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-1 border-b border-blue-200">
                      <span className="text-sm font-medium text-gray-600">Industry Percentile</span>
                      <span className="text-sm font-semibold text-blue-700">
                        {benchmarkResult?.overall_percentile 
                          ? `${benchmarkResult.overall_percentile.toFixed(1)}th percentile`
                          : '---'
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm font-medium text-gray-600">Industry Cohort</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {benchmarkResult?.industry_cohort 
                          ? `${benchmarkResult.industry_cohort.industry} (${benchmarkResult.industry_cohort.sample_size} campaigns)`
                          : '---'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Industry Benchmark Metrics - Full Width */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Click-Through Rate (CTR)</h3>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Industry Median</p>
              <p className="text-2xl font-bold text-gray-900">
                {(() => {
                  const ctrData = getMetricData('ctr');
                  return ctrData ? `${ctrData.industry_median.toFixed(2)}%` : '---';
                })()}
              </p>
            </div>
            
            {(() => {
              if (isAnalyzing) {
                return (
                  <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Your Campaign</p>
                    <p className="text-2xl font-bold text-blue-400">
                      <span className="animate-pulse">...</span>
                    </p>
                    <p className="text-sm text-blue-500">Analyzing...</p>
                  </div>
                );
              }
              
              const ctrData = getMetricData('ctr');
              if (!ctrData) {
                return (
                  <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Your Campaign</p>
                    <p className="text-2xl font-bold text-gray-400">---</p>
                    <p className="text-sm text-gray-400">Select campaign and analyze</p>
                  </div>
                );
              }
              
              const isPositive = ctrData.industry_percentile >= 50;
              const bgColor = isPositive ? 'bg-green-50' : 'bg-red-50';
              const borderColor = isPositive ? 'border-green-200' : 'border-red-200';
              const textColor = isPositive ? 'text-green-700' : 'text-red-700';
              const iconColor = isPositive ? 'text-green-600' : 'text-red-600';
              const TrendIcon = isPositive ? TrendingUp : TrendingDown;
              
              return (
                <div className={`text-center p-4 ${bgColor} ${borderColor} rounded-lg`}>
                  <p className="text-sm text-gray-600 mb-1">Your Campaign</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {ctrData.campaign_value.toFixed(2)}%
                  </p>
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    <TrendIcon className={`w-4 h-4 ${iconColor}`} />
                    <span className={`${textColor} font-semibold`}>
                      {ctrData.rank_description}
                    </span>
                    <span className={iconColor}>
                      ({ctrData.industry_percentile.toFixed(1)}th percentile)
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Leads</h3>
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Industry Median</p>
              <p className="text-2xl font-bold text-gray-900">
                {(() => {
                  const leadsData = getMetricData('leads');
                  return leadsData ? leadsData.industry_median.toLocaleString() : '---';
                })()}
              </p>
            </div>
            
            {(() => {
              if (isAnalyzing) {
                return (
                  <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Your Campaign</p>
                    <p className="text-2xl font-bold text-blue-400">
                      <span className="animate-pulse">...</span>
                    </p>
                    <p className="text-sm text-blue-500">Analyzing...</p>
                  </div>
                );
              }
              
              const leadsData = getMetricData('leads');
              if (!leadsData) {
                return (
                  <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Your Campaign</p>
                    <p className="text-2xl font-bold text-gray-400">---</p>
                    <p className="text-sm text-gray-400">Select campaign and analyze</p>
                  </div>
                );
              }
              
              const isPositive = leadsData.industry_percentile >= 50;
              const bgColor = isPositive ? 'bg-green-50' : 'bg-red-50';
              const borderColor = isPositive ? 'border-green-200' : 'border-red-200';
              const textColor = isPositive ? 'text-green-700' : 'text-red-700';
              const iconColor = isPositive ? 'text-green-600' : 'text-red-600';
              const TrendIcon = isPositive ? TrendingUp : TrendingDown;
              
              return (
                <div className={`text-center p-4 ${bgColor} ${borderColor} rounded-lg`}>
                  <p className="text-sm text-gray-600 mb-1">Your Campaign</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {leadsData.campaign_value.toLocaleString()}
                  </p>
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    <TrendIcon className={`w-4 h-4 ${iconColor}`} />
                    <span className={`${textColor} font-semibold`}>
                      {leadsData.rank_description}
                    </span>
                    <span className={iconColor}>
                      ({leadsData.industry_percentile.toFixed(1)}th percentile)
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Competitive Strengths - Full Width */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <span>✅</span>
          <span>Competitive Strengths:</span>
        </h3>
        {benchmarkResult?.competitive_strengths && benchmarkResult.competitive_strengths.length > 0 ? (
          <div className="space-y-3">
            {benchmarkResult.competitive_strengths.map((strength: string, index: number) => (
              <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <p className="text-gray-700">{strength}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                ?
              </div>
              <p className="text-gray-500">
                {benchmarkResult ? 'No competitive strengths identified' : 'Select a campaign and analyze to see competitive strengths'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Key Industry Insights - Full Width */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          <span>Key Industry Insights:</span>
        </h3>
        {benchmarkResult?.insights && benchmarkResult.insights.length > 0 ? (
          <div className="space-y-4">
            {benchmarkResult.insights.map((insight: any, index: number) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-gray-700">{insight.message}</p>
                  {insight.title && insight.title !== `Industry Insight ${index + 1}` && (
                    <p className="text-sm font-medium text-blue-700 mt-1">{insight.title}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-start space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              ?
            </div>
            <p className="text-gray-500">
              {benchmarkResult ? 'No insights available for this analysis' : 'Select a campaign and analyze to see AI-generated insights'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndustryBenchmark;