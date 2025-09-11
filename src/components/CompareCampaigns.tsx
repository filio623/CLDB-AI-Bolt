import React, { useState, useEffect } from 'react';
import { Search, BarChart3 } from 'lucide-react';
import AnalysisSection from './AnalysisSection';
import { Client, CampaignSummary, CompareResponse, KPIMetricData, apiService, APIError, formatCampaignName, formatDuration } from '../services/api';
import campaignPlaceholder from '../assets/images/campaign-placeholder.png';
import postcardThumbnail from '../assets/images/postcard2 save.png';

interface CompareCampaignsProps {
  selectedClient: Client | null;
}

const CompareCampaigns: React.FC<CompareCampaignsProps> = ({ selectedClient }) => {
  // Compare tab specific state
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [similarCampaigns, setSimilarCampaigns] = useState<CampaignSummary[]>([]);
  const [primaryCampaign, setPrimaryCampaign] = useState<CampaignSummary | null>(null);
  const [comparisonCampaign, setComparisonCampaign] = useState<CampaignSummary | null>(null);
  const [compareResult, setCompareResult] = useState<CompareResponse | null>(null);

  // Loading states
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Error states
  const [campaignError, setCampaignError] = useState<string | null>(null);
  const [similarError, setSimilarError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Effect: Load campaigns when client changes
  useEffect(() => {
    const loadCampaigns = async () => {
      if (!selectedClient) {
        setCampaigns([]);
        setPrimaryCampaign(null);
        setComparisonCampaign(null);
        setSimilarCampaigns([]);
        return;
      }

      try {
        setIsLoadingCampaigns(true);
        setCampaignError(null);
        setPrimaryCampaign(null);
        setComparisonCampaign(null);
        setSimilarCampaigns([]);

        const campaignData = await apiService.getCampaignsByClient(selectedClient.client_id);
        console.log('Campaign data loaded:', campaignData); // Debug log
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

  // Effect: Load similar campaigns when primary campaign changes
  useEffect(() => {
    const loadSimilarCampaigns = async () => {
      if (!primaryCampaign) {
        setSimilarCampaigns([]);
        setComparisonCampaign(null);
        return;
      }

      try {
        setIsLoadingSimilar(true);
        setSimilarError(null);
        setComparisonCampaign(null);

        const similarData = await apiService.getSimilarCampaigns(primaryCampaign.campaign_id);
        setSimilarCampaigns(similarData);
      } catch (error) {
        console.error('Failed to load similar campaigns:', error);
        setSimilarError(error instanceof APIError ? error.message : 'Failed to load similar campaigns');
        setSimilarCampaigns([]);
      } finally {
        setIsLoadingSimilar(false);
      }
    };

    loadSimilarCampaigns();
  }, [primaryCampaign]);

  // Handle analyze button click
  const handleAnalyze = async () => {
    if (!primaryCampaign || !comparisonCampaign) {
      setAnalysisError('Please select both campaigns to compare');
      return;
    }

    try {
      setIsAnalyzing(true);
      setAnalysisError(null);

      const result = await apiService.compareCampaigns({
        campaign_ids: [primaryCampaign.campaign_id, comparisonCampaign.campaign_id],
        comparison_type: 'performance'
      });

      setCompareResult(result);
    } catch (error) {
      console.error('Failed to analyze campaigns:', error);
      setAnalysisError(error instanceof APIError ? error.message : 'Failed to analyze campaigns');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper function to render individual KPI card
  const renderKPICard = (kpiName: string, kpiData?: KPIMetricData) => {
    const kpiDisplayNames: Record<string, string> = {
      'ad_displays': 'Ad Displays',
      'engagements': 'Engagements',
      'visitors': 'Visitors',
      'leads': 'Leads',
      'attributions': 'Attributions'
    };

    const displayName = kpiDisplayNames[kpiName] || kpiName;

    // Loading state - during analysis
    if (isAnalyzing) {
      return (
        <div key={kpiName} className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <h3 className="text-base font-semibold text-gray-900 mb-3">{displayName}</h3>
          <p className="text-2xl font-bold text-blue-400 mb-2">
            <span className="animate-pulse">...</span>
          </p>
          <p className="text-blue-400 font-medium text-sm mb-2">Analyzing...</p>
          <p className="text-xs text-blue-500">Please wait</p>
        </div>
      );
    }

    // No data state - before analysis
    if (!kpiData) {
      return (
        <div key={kpiName} className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <h3 className="text-base font-semibold text-gray-900 mb-3">{displayName}</h3>
          <p className="text-2xl font-bold text-gray-400 mb-2">---</p>
          <p className="text-gray-400 font-medium text-sm mb-2">---%</p>
          <p className="text-xs text-gray-400">Select campaigns to analyze</p>
        </div>
      );
    }

    // With data - after analysis
    const isPositive = kpiData.is_positive;
    const bgColor = isPositive ? 'bg-green-50' : 'bg-red-50';
    const borderColor = isPositive ? 'border-green-200' : 'border-red-200';
    const percentColor = isPositive ? 'text-green-700' : 'text-red-700';
    const sign = kpiData.change_percent >= 0 ? '+' : '';

    return (
      <div key={kpiName} className={`${bgColor} border ${borderColor} rounded-xl p-4 text-center`}>
        <h3 className="text-base font-semibold text-gray-900 mb-3">{displayName}</h3>
        <p className={`text-2xl font-bold ${percentColor} mb-3`}>
          {sign}{kpiData.change_percent.toFixed(1)}%
        </p>
        <div className="flex items-center justify-center space-x-2 mb-2">
          <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">A</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{kpiData.current.toLocaleString()}</p>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#987D7C' }}>
            <span className="text-xs font-bold text-white">B</span>
          </div>
          <p className="text-base font-semibold text-gray-700">{kpiData.previous.toLocaleString()}</p>
        </div>
      </div>
    );
  };

  // Extract KPI data from API response
  const getKPIData = () => {
    if (!compareResult || !compareResult.metrics_comparison) return null;

    const metrics = compareResult.metrics_comparison;
    const kpiData: Record<string, KPIMetricData> = {};

    const kpiMetrics = ['ad_displays', 'engagements', 'visitors', 'leads', 'attributions'];

    kpiMetrics.forEach(kpi => {
      if (metrics[kpi] && typeof metrics[kpi] === 'object') {
        const kpiMetric = metrics[kpi];
        if ('previous' in kpiMetric && 'current' in kpiMetric) {
          kpiData[kpi] = {
            current: kpiMetric.current,
            previous: kpiMetric.previous,
            change: kpiMetric.change,
            change_percent: kpiMetric.change_percent,
            is_positive: kpiMetric.is_positive
          };
        }
      }
    });

    return Object.keys(kpiData).length > 0 ? kpiData : null;
  };

  // Helper function to get campaign basic info (qty_mailed and mail_date)
  const getCampaignBasicInfo = (campaign: CampaignSummary | null) => {
    if (!campaign) return { qtyMailed: null, mailDate: null };

    return {
      qtyMailed: campaign.total_pcs_mailed,
      mailDate: campaign.mail_date,
      jobType: campaign.job_type || null
    };
  };

  // Helper function to format mail date
  const formatMailDate = (dateStr: string | null): string => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr; // Return original if parsing fails
    }
  };

  // Helper function to format numbers with commas
  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return 'N/A';
    return num.toLocaleString();
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Compare Campaign Performance</h1>
        <p className="text-gray-600">Select campaigns to analyze performance trends and get AI-powered insights</p>
      </div>

      {/* Campaign Selector - Compact Top Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">Compare:</span>
          </div>

          {/* Primary Campaign Dropdown */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500"
            disabled={!selectedClient || isLoadingCampaigns}
            value={primaryCampaign?.campaign_id || ''}
            onChange={(e) => {
              const campaignId = parseInt(e.target.value);
              const campaign = campaigns.find(c => c.campaign_id === campaignId);
              setPrimaryCampaign(campaign || null);
            }}
          >
            <option value="">
              {!selectedClient
                ? 'Select client first'
                : isLoadingCampaigns
                  ? 'Loading campaigns...'
                  : campaignError
                    ? 'Error loading campaigns'
                    : 'Select primary campaign'
              }
            </option>
            {campaigns.map((campaign) => (
              <option key={campaign.campaign_id} value={campaign.campaign_id}>
                {formatCampaignName(campaign)} ({formatDuration(campaign.duration_days)})
              </option>
            ))}
          </select>

          <span className="text-gray-500">vs</span>

          {/* Comparison Campaign Dropdown */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500"
            disabled={!primaryCampaign || isLoadingSimilar}
            value={comparisonCampaign?.campaign_id || ''}
            onChange={(e) => {
              const campaignId = parseInt(e.target.value);
              const campaign = similarCampaigns.find(c => c.campaign_id === campaignId);
              setComparisonCampaign(campaign || null);
            }}
          >
            <option value="">
              {!primaryCampaign
                ? 'Select primary first'
                : isLoadingSimilar
                  ? 'Loading similar campaigns...'
                  : similarError
                    ? 'Error loading similar campaigns'
                    : similarCampaigns.length === 0
                      ? 'No similar campaigns found'
                      : 'Select comparison campaign'
              }
            </option>
            {similarCampaigns.map((campaign) => (
              <option key={campaign.campaign_id} value={campaign.campaign_id}>
                {formatCampaignName(campaign)} ({formatDuration(campaign.duration_days)})
              </option>
            ))}
          </select>

          {/* Analyze Button */}
          <button
            className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors text-sm"
            disabled={!primaryCampaign || !comparisonCampaign || isAnalyzing}
            onClick={handleAnalyze}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>

        {/* Error Display */}
        {analysisError && (
          <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {analysisError}
          </div>
        )}
      </div>

      {/* Campaign Comparison Cards */}
      {primaryCampaign && comparisonCampaign && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Primary Campaign Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-2 right-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">A</span>
              </div>
            </div>
            {/* Floating thumbnail image */}
            <div style={{
              position: 'absolute',
              top: 35,    // shifted up slightly
              right: 84,  // align with right edge
              width: 152, // image width (20% larger again)
              height: 120, // image height (20% larger again)
              borderRadius: 8,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <img
                src={campaignPlaceholder} // Using placeholder for now
                alt="Primary campaign thumbnail"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div className="mb-3">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white mb-2">
                PRIMARY CAMPAIGN
              </div>
              <h3 className="text-lg font-bold text-gray-900">{formatCampaignName(primaryCampaign)}</h3>
              <p className="text-sm text-gray-600">{primaryCampaign.client_name} • {formatDuration(primaryCampaign.duration_days)}</p>
            </div>
            <div className="flex items-start space-x-6 text-sm">
              <div className="text-left">
                <p className="text-gray-600 mb-1">Qty Mailed</p>
                <p className="font-semibold text-blue-700">
                  {(() => {
                    const info = getCampaignBasicInfo(primaryCampaign);
                    return formatNumber(info.qtyMailed);
                  })()}
                </p>
              </div>
              <div className="text-left">
                <p className="text-gray-600 mb-1">Mail Date</p>
                <p className="font-semibold text-blue-700">
                  {(() => {
                    const info = getCampaignBasicInfo(primaryCampaign);
                    return formatMailDate(info.mailDate);
                  })()}
                </p>
              </div>
              <div className="text-left">
                <p className="text-gray-600 mb-1">Job type</p>
                <p className="font-semibold text-blue-700">
                  {(() => {
                    const info = getCampaignBasicInfo(primaryCampaign);
                    return info.jobType ? info.jobType : 'N/A';
                  })()}
                </p>
              </div>
            </div>
          </div>

          {/* Comparison Campaign Card */}
          <div className="bg-gradient-to-br from-stone-50 to-stone-100 border-2 rounded-xl p-5 relative overflow-hidden" style={{ borderColor: 'rgba(152, 125, 124, 0.3)' }}>
            <div className="absolute top-2 right-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#987D7C' }}>
                <span className="text-xs font-bold text-white">B</span>
              </div>
            </div>
            {/* Floating thumbnail image */}
            <div style={{
              position: 'absolute',
              top: 35,    // shifted up slightly
              right: 84,  // align with right edge
              width: 152, // image width (same as primary)
              height: 120, // image height (same as primary)
              borderRadius: 8,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <img
                src={postcardThumbnail} // Using the new postcard image
                alt="Comparison campaign thumbnail"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div className="mb-3">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white mb-2" style={{ backgroundColor: '#987D7C' }}>
                COMPARISON CAMPAIGN
              </div>
              <h3 className="text-lg font-bold text-gray-900">{formatCampaignName(comparisonCampaign)}</h3>
              <p className="text-sm text-gray-600">{comparisonCampaign.client_name} • {formatDuration(comparisonCampaign.duration_days)}</p>
            </div>
            <div className="flex items-start space-x-6 text-sm">
              <div className="text-left">
                <p className="text-gray-600 mb-1">Qty Mailed</p>
                <p className="font-semibold" style={{ color: '#6B5B5A' }}>
                  {(() => {
                    const info = getCampaignBasicInfo(comparisonCampaign);
                    return formatNumber(info.qtyMailed);
                  })()}
                </p>
              </div>
              <div className="text-left">
                <p className="text-gray-600 mb-1">Mail Date</p>
                <p className="font-semibold" style={{ color: '#6B5B5A' }}>
                  {(() => {
                    const info = getCampaignBasicInfo(comparisonCampaign);
                    return formatMailDate(info.mailDate);
                  })()}
                </p>
              </div>
              <div className="text-left">
                <p className="text-gray-600 mb-1">Job type</p>
                <p className="font-semibold text-blue-700">
                  {(() => {
                    const info = getCampaignBasicInfo(comparisonCampaign);
                    return info.jobType ? info.jobType : 'N/A';
                  })()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Performance Row */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <span>KPI Performance Changes</span>
        </h2>
        
        {/* Main KPI Cards - Larger */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Impressions per Piece Card */}
          <div className={`${
            isAnalyzing 
              ? 'bg-blue-50 border-blue-200' 
              : compareResult 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-gray-200'
          } border rounded-xl p-6 text-center`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Impressions per Piece</h3>
            {isAnalyzing ? (
              <>
                <p className="text-3xl font-bold text-blue-400 mb-3">
                  <span className="animate-pulse">...</span>
                </p>
                <p className="text-blue-400 font-medium text-base mb-3">Analyzing...</p>
                <p className="text-sm text-blue-500">Please wait</p>
              </>
            ) : compareResult ? (
              <>
                <p className="text-3xl font-bold text-green-700 mb-4">+12.3%</p>
                <div className="flex items-center justify-center space-x-3 mb-3">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">A</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">2.45</p>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#987D7C' }}>
                    <span className="text-xs font-bold text-white">B</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-700">2.18</p>
                </div>
              </>
            ) : (
              <>
                <p className="text-3xl font-bold text-gray-400 mb-3">---</p>
                <p className="text-gray-400 font-medium text-base mb-3">---%</p>
                <p className="text-sm text-gray-400">Select campaigns to analyze</p>
              </>
            )}
          </div>

          {/* Engagements Card */}
          <div className={`${
            isAnalyzing 
              ? 'bg-blue-50 border-blue-200' 
              : compareResult 
                ? 'bg-red-50 border-red-200' 
                : 'bg-gray-50 border-gray-200'
          } border rounded-xl p-6 text-center`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagements</h3>
            {isAnalyzing ? (
              <>
                <p className="text-3xl font-bold text-blue-400 mb-3">
                  <span className="animate-pulse">...</span>
                </p>
                <p className="text-blue-400 font-medium text-base mb-3">Analyzing...</p>
                <p className="text-sm text-blue-500">Please wait</p>
              </>
            ) : compareResult ? (
              <>
                <p className="text-3xl font-bold text-red-700 mb-4">-8.7%</p>
                <div className="flex items-center justify-center space-x-3 mb-3">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">A</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">1,247</p>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#987D7C' }}>
                    <span className="text-xs font-bold text-white">B</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-700">1,365</p>
                </div>
              </>
            ) : (
              <>
                <p className="text-3xl font-bold text-gray-400 mb-3">---</p>
                <p className="text-gray-400 font-medium text-base mb-3">---%</p>
                <p className="text-sm text-gray-400">Select campaigns to analyze</p>
              </>
            )}
          </div>
        </div>

        {/* Secondary KPI Cards - Smaller */}
        <div className="mb-4">
          <h3 className="text-base font-medium text-gray-700 mb-4">Additional Metrics</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {(() => {
            const kpiData = getKPIData();
            const kpiMetrics = ['ad_displays', 'engagements', 'visitors', 'leads', 'attributions'];

            return kpiMetrics.map(kpi =>
              renderKPICard(kpi, kpiData?.[kpi])
            );
          })()}
        </div>
      </div>

      <AnalysisSection
        primaryCampaign={primaryCampaign}
        comparisonCampaign={comparisonCampaign}
        compareResult={compareResult}
        isAnalyzing={isAnalyzing}
      />
    </div>
  );
};

export default CompareCampaigns;