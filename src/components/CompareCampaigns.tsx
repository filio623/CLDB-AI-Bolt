import React, { useState, useEffect } from 'react';
import { Search, BarChart3, Info } from 'lucide-react';
import AnalysisSection from './AnalysisSection';
import { Client, CampaignSummary, CompareResponse, KPIMetricData, StructuralAnalysis, StructuralDifference, apiService, APIError, formatCampaignName, formatDuration } from '../services/api';
import campaignPlaceholder from '../assets/images/campaign-placeholder.png';
import postcardThumbnail from '../assets/images/postcard2 save.png';

// Tooltip component for KPI cards
const KPITooltip: React.FC<{ content: string }> = ({ content }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 'center', y: 'above' });
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const iconRef = React.useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!tooltipRef.current || !iconRef.current) return;
    
    const iconRect = iconRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let x = 'center';
    let y = 'above';
    
    // Check horizontal positioning
    const tooltipWidth = 256; // w-64 = 256px
    const iconCenterX = iconRect.left + iconRect.width / 2;
    
    if (iconCenterX - tooltipWidth / 2 < 10) {
      // Too close to left edge, align to left
      x = 'left';
    } else if (iconCenterX + tooltipWidth / 2 > viewportWidth - 10) {
      // Too close to right edge, align to right
      x = 'right';
    }
    
    // Check vertical positioning
    if (iconRect.top < 100) {
      // Too close to top, show below
      y = 'below';
    }
    
    setPosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsVisible(true);
    // Small delay to ensure tooltip is rendered before calculating position
    setTimeout(updatePosition, 10);
  };

  return (
    <div className="relative">
      <div
        ref={iconRef}
        className="w-4 h-4 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center cursor-help transition-colors"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVisible(false)}
      >
        <span className="text-white text-xs font-bold">i</span>
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute w-64 bg-gray-900 text-white text-sm rounded-lg p-3 shadow-lg z-50 ${
            position.y === 'above' ? 'bottom-6' : 'top-6'
          } ${
            position.x === 'center' 
              ? 'left-1/2 transform -translate-x-1/2' 
              : position.x === 'left'
                ? 'left-0'
                : 'right-0'
          }`}
        >
          <div className={`absolute w-2 h-2 bg-gray-900 rotate-45 ${
            position.y === 'above' 
              ? '-bottom-1' 
              : '-top-1'
          } ${
            position.x === 'center' 
              ? 'left-1/2 transform -translate-x-1/2' 
              : position.x === 'left'
                ? 'left-4'
                : 'right-4'
          }`}></div>
          {content}
        </div>
      )}
    </div>
  );
};

const formatComparisonValue = (value: string | number | null, factor: string): string => {
  if (value === null || value === undefined) return 'N/A';

  const valueStr = String(value);
  const lowerFactor = factor.toLowerCase();

  if (lowerFactor === 'campaign_duration') {
    const numValue = parseInt(valueStr);
    return `${numValue} ${numValue === 1 ? 'day' : 'days'}`;
  }

  if (lowerFactor === 'total_pieces_mailed') {
    const numValue = parseInt(valueStr.replace(/,/g, ''));
    return `${numValue.toLocaleString()} pcs`;
  }

  if (lowerFactor === 'number_of_mailings') {
    const numValue = parseInt(valueStr);
    return `${numValue} ${numValue === 1 ? 'mailing' : 'mailings'}`;
  }

  if (lowerFactor === 'job_type') {
    return valueStr.replace(/^JobType\./, '');
  }

  return valueStr;
};

const CompareCampaigns: React.FC<{
  selectedClient: Client | null;
}> = ({
  selectedClient
}) => {
  // Internal state management
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [primaryCampaign, setPrimaryCampaign] = useState<CampaignSummary | null>(null);
  const [comparisonCampaign, setComparisonCampaign] = useState<CampaignSummary | null>(null);
  const [similarCampaigns, setSimilarCampaigns] = useState<CampaignSummary[]>([]);
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
        campaign_ids: [primaryCampaign.campaign_id, comparisonCampaign.campaign_id]
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

    const kpiTooltips: Record<string, string> = {
      'ad_displays': 'Total number of times your campaign ads were displayed to potential customers across all channels.',
      'engagements': 'Total interactions with your campaign content including clicks, likes, shares, and other engagement actions.',
      'visitors': 'Number of unique visitors who came to your website or landing page as a result of this campaign.',
      'leads': 'Qualified potential customers who provided their contact information or expressed interest in your products/services.',
      'attributions': 'Conversions and sales that can be directly attributed to this specific campaign through tracking.'
    };

    const displayName = kpiDisplayNames[kpiName] || kpiName;
    const tooltipContent = kpiTooltips[kpiName] || `Information about ${displayName}`;

    // Loading state - during analysis
    if (isAnalyzing) {
      return (
        <div key={kpiName} className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center relative">
          <div className="absolute top-3 right-3">
            <KPITooltip content={tooltipContent} />
          </div>
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
        <div key={kpiName} className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center relative">
          <div className="absolute top-3 right-3">
            <KPITooltip content={tooltipContent} />
          </div>
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
      <div key={kpiName} className={`${bgColor} border ${borderColor} rounded-xl p-4 text-center relative`}>
        <div className="absolute top-3 right-3">
          <KPITooltip content={tooltipContent} />
        </div>
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

      {/* Enhanced Structural Analysis Warning */}
      {compareResult?.structural_analysis && (
        (() => {
          const analysis = compareResult.structural_analysis;

          // Determine warning level and styling based on comparability
          const getWarningStyle = (comparability: string) => {
            switch (comparability.toLowerCase()) {
              case 'not recommended':
                return {
                  bgColor: 'bg-red-50',
                  borderColor: 'border-red-300',
                  accentColor: 'bg-red-500',
                  iconColor: 'text-red-600',
                  textColor: 'text-red-900',
                  titleColor: 'text-red-800',
                  badgeColor: 'bg-red-100 text-red-700',
                  icon: (
                    <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                  )
                };
              case 'low':
                return {
                  bgColor: 'bg-orange-50',
                  borderColor: 'border-orange-300',
                  accentColor: 'bg-orange-500',
                  iconColor: 'text-orange-600',
                  textColor: 'text-orange-900',
                  titleColor: 'text-orange-800',
                  badgeColor: 'bg-orange-100 text-orange-700',
                  icon: (
                    <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  )
                };
              case 'moderate':
                return {
                  bgColor: 'bg-yellow-50',
                  borderColor: 'border-yellow-300',
                  accentColor: 'bg-yellow-500',
                  iconColor: 'text-yellow-600',
                  textColor: 'text-yellow-900',
                  titleColor: 'text-yellow-800',
                  badgeColor: 'bg-yellow-100 text-yellow-700',
                  icon: (
                    <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  )
                };
              default: // 'high' comparability - don't show warning
                return null;
            }
          };

          const warningStyle = getWarningStyle(analysis.overall_comparability);

          // Only show warning if comparability is not 'High'
          if (!warningStyle) return null;

          return (
            <div className={`${warningStyle.bgColor} border-l-4 ${warningStyle.borderColor} rounded-xl shadow-md mb-6 overflow-hidden`}>
              <div className="p-6">
                <div className="mb-6">
                  <h3 className={`text-xl font-bold ${warningStyle.titleColor} mb-2.5`}>
                    {analysis.overall_comparability === 'not recommended'
                      ? 'Comparison Not Recommended'
                      : `${analysis.overall_comparability.charAt(0).toUpperCase() + analysis.overall_comparability.slice(1)} Comparability`}
                  </h3>
                  <p className={`text-base ${warningStyle.textColor} leading-relaxed`}>
                    {analysis.interpretation_guidance}
                  </p>
                </div>

                {/* Structural Differences */}
                {analysis.structural_differences.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`w-1 h-5 rounded-full ${warningStyle.accentColor}`}></div>
                      <h4 className={`text-sm font-bold ${warningStyle.titleColor} uppercase tracking-wide`}>
                        Structural Differences
                      </h4>
                    </div>
                    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${analysis.structural_differences.filter(diff => diff.comparability_concern).length}, minmax(0, 1fr))` }}>
                      {analysis.structural_differences.filter(diff => diff.comparability_concern).map((diff, idx) => (
                        <div key={idx} className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden hover:border-gray-300 transition-colors duration-200 flex flex-col">
                          <div className="p-5 flex-1 flex flex-col">
                            <div className="mb-4">
                              <div className="flex items-center gap-3 mb-3">
                                <h5 className="font-bold text-lg text-gray-900">
                                  {diff.factor.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                                </h5>

                                <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 bg-blue-600 rounded text-white text-[10px] font-bold flex items-center justify-center shadow-sm">A</span>
                                    <span className="font-bold text-blue-900 text-sm">{formatComparisonValue(diff.campaign_1_value, diff.factor)}</span>
                                  </div>

                                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                  </svg>

                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded text-white text-[10px] font-bold flex items-center justify-center shadow-sm" style={{ backgroundColor: '#987D7C' }}>B</span>
                                    <span className="font-bold text-gray-900 text-sm">{formatComparisonValue(diff.campaign_2_value, diff.factor)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="mb-4 flex-1">
                              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
                                Business Impact
                              </p>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {diff.business_impact}
                              </p>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-green-50 to-emerald-100 px-5 py-4 border-t-2 border-green-200">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-0.5">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-green-900 uppercase tracking-wider mb-1.5">
                                  Recommendation
                                </p>
                                <p className="text-sm text-gray-800 leading-relaxed font-medium">
                                  {diff.recommendation}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()
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
              : compareResult && compareResult.metrics_comparison?.impressions_per_piece
                ? compareResult.metrics_comparison.impressions_per_piece.is_positive ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-gray-200'
          } border rounded-xl p-6 text-center relative`}>
            <div className="absolute top-3 right-3">
              <KPITooltip content="Average number of ad impressions generated per piece of mail sent. Higher values indicate better digital amplification of your direct mail campaign." />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Impressions per Piece</h3>
            {isAnalyzing ? (
              <>
                <p className="text-3xl font-bold text-blue-400 mb-3">
                  <span className="animate-pulse">...</span>
                </p>
                <p className="text-blue-400 font-medium text-base mb-3">Analyzing...</p>
                <p className="text-sm text-blue-500">Please wait</p>
              </>
            ) : compareResult && compareResult.metrics_comparison?.impressions_per_piece ? (
              <>
                <p className={`text-3xl font-bold mb-4 ${
                  compareResult.metrics_comparison.impressions_per_piece.is_positive ? 'text-green-700' : 'text-red-700'
                }`}>
                  {compareResult.metrics_comparison.impressions_per_piece.change_percent >= 0 ? '+' : ''}
                  {compareResult.metrics_comparison.impressions_per_piece.change_percent.toFixed(1)}%
                </p>
                <div className="flex items-center justify-center space-x-3 mb-3">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">A</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {compareResult.metrics_comparison.impressions_per_piece.current.toFixed(1)}
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#987D7C' }}>
                    <span className="text-xs font-bold text-white">B</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-700">
                    {compareResult.metrics_comparison.impressions_per_piece.previous.toFixed(1)}
                  </p>
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

          {/* Engagement Rate Card */}
          <div className={`${
            isAnalyzing 
              ? 'bg-blue-50 border-blue-200' 
              : compareResult && compareResult.metrics_comparison?.engagement_rate
                ? compareResult.metrics_comparison.engagement_rate.is_positive ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-gray-200'
          } border rounded-xl p-6 text-center relative`}>
            <div className="absolute top-3 right-3">
              <KPITooltip content="Percentage of ad impressions that resulted in meaningful interactions. Calculated as (engagements ÷ ad displays) × 100. Higher rates indicate more engaging content." />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Engagement Rate</h3>
            {isAnalyzing ? (
              <>
                <p className="text-3xl font-bold text-blue-400 mb-3">
                  <span className="animate-pulse">...</span>
                </p>
                <p className="text-blue-400 font-medium text-base mb-3">Analyzing...</p>
                <p className="text-sm text-blue-500">Please wait</p>
              </>
            ) : compareResult && compareResult.metrics_comparison?.engagement_rate ? (
              <>
                <p className={`text-3xl font-bold mb-4 ${
                  compareResult.metrics_comparison.engagement_rate.is_positive ? 'text-green-700' : 'text-red-700'
                }`}>
                  {compareResult.metrics_comparison.engagement_rate.change_percent >= 0 ? '+' : ''}
                  {compareResult.metrics_comparison.engagement_rate.change_percent.toFixed(1)}%
                </p>
                <div className="flex items-center justify-center space-x-3 mb-3">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">A</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {compareResult.metrics_comparison.engagement_rate.current.toFixed(2)}%
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#987D7C' }}>
                    <span className="text-xs font-bold text-white">B</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-700">
                    {compareResult.metrics_comparison.engagement_rate.previous.toFixed(2)}%
                  </p>
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