import { useState, useEffect } from 'react';
import { Calculator, DollarSign, FileText, Target, Upload, Users, BarChart3, TrendingUp, Award, Lightbulb, CheckCircle } from 'lucide-react';
import { apiService, CampaignSummary, Client, formatCampaignName, formatDuration } from '../services/api';
import { isFeatureEnabled } from '../config/features';

interface AdvancedROIProps {
  selectedClient?: Client | null;
}

const AdvancedROI: React.FC<AdvancedROIProps> = ({ selectedClient }) => {
  // Calculator mode state
  const [calculatorMode, setCalculatorMode] = useState<'simple' | 'campaign-matched'>('simple');
  
  // Simple ROI Calculator State
  const [campaignCost, setCampaignCost] = useState('');
  const [costOfGoods, setCostOfGoods] = useState('');
  const [additionalCosts, setAdditionalCosts] = useState('');
  const [simpleRevenue, setSimpleRevenue] = useState('');
  
  // Campaign-Matched ROI Calculator State
  const [matchedCampaignCost, setMatchedCampaignCost] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignSummary | null>(null);
  const [salesDataFile, setSalesDataFile] = useState<File | null>(null);
  
  // Campaign data state
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [campaignError, setCampaignError] = useState<string | null>(null);
  
  // Results state
  const [simpleResults, setSimpleResults] = useState<any>(null);
  const [campaignResults, setCampaignResults] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  // Feature flag check
  const isCampaignMatchedEnabled = isFeatureEnabled('CAMPAIGN_MATCHED_ROI');

  // Mock data for campaign-matched ROI demo
  const mockCampaignResults = {
    roiPercentage: 245.8,
    cost: 15000,
    revenue: 51870,
    profit: 36870,
    matchedCustomers: 127,
    totalEntries: 156,
    unmatchedCustomers: 29,
    matchRate: '81.4',
    totalMailedCustomers: 2500,
    campaignName: 'Summer Sale 2024',
    campaignDuration: '45 days',
    explanation: 'Campaign ROI calculated: $51,870 matched revenue - $15,000 cost = $36,870 profit (245.8% ROI)',
    optimizationRecommendations: [
      'Excellent match rate of 81.4% indicates strong mailing list quality and customer targeting',
      'Revenue per piece ($20.75) significantly exceeds industry benchmark of $12-15',
      'Consider scaling this campaign approach to similar customer segments for maximum ROI'
    ]
  };

  // Load campaigns when client changes
  useEffect(() => {
    const loadCampaigns = async () => {
      if (!selectedClient) {
        setCampaigns([]);
        setSelectedCampaign(null);
        return;
      }

      try {
        setIsLoadingCampaigns(true);
        setCampaignError(null);
        setSelectedCampaign(null);

        const campaignData = await apiService.getCampaignsByClient(selectedClient.client_id);
        setCampaigns(campaignData);
      } catch (error) {
        console.error('Failed to load campaigns:', error);
        setCampaignError(error instanceof Error ? error.message : 'Failed to load campaigns');
        setCampaigns([]);
      } finally {
        setIsLoadingCampaigns(false);
      }
    };

    loadCampaigns();
  }, [selectedClient]);

  // Simple ROI calculation (now using API)
  const calculateSimpleROI = async () => {
    const campaign = parseFloat(campaignCost) || 0;
    const goods = parseFloat(costOfGoods) || 0;
    const additional = parseFloat(additionalCosts) || 0;
    const revenue = parseFloat(simpleRevenue) || 0;
    
    if (campaign <= 0 || revenue <= 0) {
      setCalculationError('Please enter valid campaign cost and revenue amounts');
      return;
    }
    
    try {
      setIsCalculating(true);
      setCalculationError(null);
      
      const response = await apiService.calculateAdvancedROISimple(
        campaign,
        goods,
        additional,
        revenue
      );
      
      // Transform API response to match component state structure
      setSimpleResults({
        campaignCost: campaign,
        costOfGoods: goods,
        additionalCosts: additional,
        totalCost: response.total_cost,
        revenue: response.total_revenue,
        profit: response.profit,
        roiPercentage: response.roi_percentage
      });
      
    } catch (error) {
      console.error('Simple ROI calculation failed:', error);
      setCalculationError(error instanceof Error ? error.message : 'Failed to calculate ROI');
    } finally {
      setIsCalculating(false);
    }
  };

  // Campaign-matched ROI calculation (now using API)
  const calculateCampaignROI = async () => {
    // FEATURE FLAG CHECK - prevent API call if disabled
    if (!isCampaignMatchedEnabled) {
      setCalculationError('Campaign-matched ROI analysis is coming soon! This advanced feature is currently in development.');
      return;
    }

    if (!selectedCampaign || !salesDataFile || !matchedCampaignCost) {
      setCalculationError('Please select a campaign, upload sales data, and enter campaign cost');
      return;
    }

    try {
      setIsCalculating(true);
      setCalculationError(null);
      
      const response = await apiService.calculateAdvancedROICampaignMatched(
        selectedCampaign.campaign_id,
        parseFloat(matchedCampaignCost),
        salesDataFile
      );
      
      // Transform API response to match component state structure
      if (response.campaign_matched_results) {
        setCampaignResults({
          cost: response.total_cost,
          revenue: response.total_revenue,
          profit: response.profit,
          roiPercentage: response.roi_percentage,
          matchedCustomers: response.campaign_matched_results.matched_customers,
          unmatchedCustomers: response.campaign_matched_results.unmatched_customers,
          totalEntries: response.campaign_matched_results.total_entries,
          totalMailedCustomers: response.campaign_matched_results.total_mailed_customers,
          matchRate: response.campaign_matched_results.match_rate_percentage.toFixed(1),
          campaignName: formatCampaignName(selectedCampaign),
          campaignDuration: formatDuration(selectedCampaign.duration_days),
          explanation: response.explanation,
          customerMatches: response.campaign_matched_results.customer_matches,
          campaignDateRange: response.campaign_matched_results.campaign_date_range,
          matchingConfidence: response.campaign_matched_results.matching_confidence,
          optimizationRecommendations: response.optimization_recommendations
        });
      } else {
        throw new Error('No campaign matching results received from API');
      }
      
    } catch (error) {
      console.error('Campaign ROI calculation failed:', error);
      setCalculationError(error instanceof Error ? error.message : 'Failed to calculate campaign ROI');
    } finally {
      setIsCalculating(false);
    }
  };

  // File upload handlers
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSalesDataFile(file);
      setCalculationError(null);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSalesDataFile(file);
      setCalculationError(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  // Coming Soon overlay component for disabled features
  const ComingSoonOverlay = () => (
    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
      <div className="text-center p-8 max-w-md">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h3>
        <p className="text-gray-600 mb-4">Advanced Campaign-Matched ROI Analysis</p>
        <div className="text-sm text-gray-500 space-y-1">
          <p>✨ AI-powered customer attribution</p>
          <p>📊 Campaign mail list matching</p>
          <p>🎯 Precise ROI attribution</p>
        </div>
        <div className="mt-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm">
          This feature is in development and will be available soon!
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ROI Calculator</h1>
        <p className="text-gray-600">Choose between simple ROI calculation or campaign-matched customer analysis</p>
      </div>

      {/* Calculator Mode Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Calculator Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => {
              setCalculatorMode('simple');
              setSimpleResults(null);
              setCalculationError(null);
            }}
            className={`p-6 rounded-xl border-2 transition-all ${
              calculatorMode === 'simple'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                calculatorMode === 'simple' ? 'bg-blue-600' : 'bg-gray-400'
              }`}>
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Simple ROI Calculator</h3>
            </div>
            <p className="text-sm text-gray-600 text-left">
              Basic ROI calculation using manual cost and revenue inputs. Quick and straightforward for general analysis.
            </p>
          </button>

          <button
            onClick={() => {
              setCalculatorMode('campaign-matched');
              setCampaignResults(null);
              setCalculationError(null);
            }}
            className={`p-6 rounded-xl border-2 transition-all relative ${
              calculatorMode === 'campaign-matched'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            } ${!isCampaignMatchedEnabled ? 'opacity-75' : ''}`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                calculatorMode === 'campaign-matched' ? 'bg-purple-600' : 'bg-gray-400'
              }`}>
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Campaign-Matched ROI</h3>
            </div>
            <p className="text-sm text-gray-600 text-left">
              Advanced ROI calculation that matches your sales data to campaign mail lists for precise attribution analysis.
            </p>
            
            {/* FEATURE FLAG: Add "Coming Soon" badge */}
            {!isCampaignMatchedEnabled && (
              <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                Coming Soon
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Simple ROI Calculator */}
      {calculatorMode === 'simple' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Simple ROI Input</h2>
            </div>

            <div className="space-y-4">
              {/* Campaign Dropdown Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Campaign (Optional)
                </label>
                <p className="text-xs text-gray-500 mb-2">Choose a campaign to view metrics in results</p>
                <div className="relative">
                  <select
                    value={selectedCampaign?.campaign_id || ''}
                    onChange={(e) => {
                      const campaignId = parseInt(e.target.value);
                      const campaign = campaigns.find(c => c.campaign_id === campaignId) || null;
                      setSelectedCampaign(campaign);
                    }}
                    disabled={!selectedClient || isLoadingCampaigns}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                              : 'No campaign selected (manual input only)'
                      }
                    </option>
                    {campaigns.map((campaign) => (
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

              {/* Campaign Details (shown when campaign selected) */}
              {selectedCampaign && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">Campaign Details</h3>
                  <div className="space-y-1 text-xs">
                    <p><span className="font-medium">Campaign:</span> {formatCampaignName(selectedCampaign)}</p>
                    <p><span className="font-medium">Duration:</span> {formatDuration(selectedCampaign.duration_days)}</p>
                    <p><span className="font-medium">Mail Date:</span> {selectedCampaign.mail_date || 'N/A'}</p>
                    <p><span className="font-medium">Pieces Mailed:</span> {selectedCampaign.total_pcs_mailed?.toLocaleString() || 'N/A'}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Cost ($)
                </label>
                <p className="text-xs text-gray-500 mb-2">(print, postage, design)</p>
                <input
                  type="number"
                  value={campaignCost}
                  onChange={(e) => setCampaignCost(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter total campaign cost"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost of Goods ($)
                </label>
                <input
                  type="number"
                  value={costOfGoods}
                  onChange={(e) => setCostOfGoods(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter cost of goods sold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Costs ($)
                </label>
                <input
                  type="number"
                  value={additionalCosts}
                  onChange={(e) => setAdditionalCosts(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter any additional costs"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Revenue Generated ($)
                </label>
                <input
                  type="number"
                  value={simpleRevenue}
                  onChange={(e) => setSimpleRevenue(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter total revenue generated"
                />
              </div>

              <button
                onClick={calculateSimpleROI}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Calculator className="w-5 h-5" />
                <span>Calculate Simple ROI</span>
              </button>

              {calculationError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{calculationError}</p>
                </div>
              )}
            </div>
          </div>

          {/* Simple Results Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Simple ROI Results</h2>
            </div>

            {simpleResults ? (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600 mb-1">ROI Percentage</p>
                    <p className="text-3xl font-bold text-green-700">
                      {simpleResults.roiPercentage.toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <p className="text-gray-600">Total Cost</p>
                      <p className="font-semibold text-gray-900">${simpleResults.totalCost.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Revenue</p>
                      <p className="font-semibold text-gray-900">${simpleResults.revenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Profit</p>
                      <p className="font-semibold text-gray-900">${simpleResults.profit.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Cost Breakdown:</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Campaign Cost</p>
                      <p className="font-semibold text-gray-900">${simpleResults.campaignCost.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Cost of Goods</p>
                      <p className="font-semibold text-gray-900">${simpleResults.costOfGoods.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Additional Costs</p>
                      <p className="font-semibold text-gray-900">${simpleResults.additionalCosts.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="space-y-6">
                {/* Your ROI Section */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <span>Your ROI:</span>
                  </h3>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">ROI Percentage</p>
                        <p className="text-3xl font-bold text-green-700">0.0%</p>
                        <div className="flex items-center justify-center space-x-1 mt-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium text-blue-600">📈 Awaiting Data</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Profit</p>
                        <p className="text-3xl font-bold text-gray-900">$0</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total Cost:</p>
                        <p className="font-semibold text-gray-900">$0</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Revenue:</p>
                        <p className="font-semibold text-gray-900">$0</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <span>Cost Breakdown:</span>
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Campaign Cost:</p>
                        <p className="font-semibold text-gray-900">$0</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Cost of Goods:</p>
                        <p className="font-semibold text-gray-900">$0</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Additional Costs:</p>
                        <p className="font-semibold text-gray-900">$0</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <span>Explanation:</span>
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-gray-700">
                      ROI calculated: $0 revenue - $0 cost = $0 profit (0.0% ROI)
                    </p>
                  </div>
                </div>

                {/* Enhanced Insights */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    <span>Simple ROI Insights:</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                        1
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Comprehensive Cost Analysis</p>
                        <p className="text-sm text-gray-700">Track campaign costs, cost of goods, and additional expenses for complete ROI visibility.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                        2
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Instant Calculation</p>
                        <p className="text-sm text-gray-700">Get immediate ROI results with detailed cost breakdown and profit analysis.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                        3
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Performance Benchmarking</p>
                        <p className="text-sm text-gray-700">Compare your ROI against industry standards to gauge campaign effectiveness.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Campaign-Matched ROI Calculator */}
      {calculatorMode === 'campaign-matched' && (
        <div className="relative">
          
          {/* FEATURE FLAG: Demo Mode Banner */}
          {!isCampaignMatchedEnabled && (
            <div className="mb-4 bg-gradient-to-r from-orange-50 to-purple-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Demo Mode - Coming Soon</h3>
                  <p className="text-sm text-gray-600">This shows a preview of our advanced campaign-matched ROI analysis feature</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Campaign-matched UI */}
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${
            !isCampaignMatchedEnabled ? 'opacity-60 pointer-events-none' : ''
          }`}>
          {/* Input Section */}
          <div className="space-y-6">
            {/* Campaign Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Campaign Selection</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Cost ($)
                  </label>
                  <input
                    type="number"
                    value={matchedCampaignCost}
                    onChange={(e) => setMatchedCampaignCost(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter campaign cost"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Campaign
                  </label>
                  <select
                    value={selectedCampaign?.campaign_id || ''}
                    onChange={(e) => {
                      const campaignId = parseInt(e.target.value);
                      const campaign = campaigns.find(c => c.campaign_id === campaignId) || null;
                      setSelectedCampaign(campaign);
                    }}
                    disabled={isLoadingCampaigns || !selectedClient}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">
                      {!selectedClient 
                        ? 'Select a client first...' 
                        : isLoadingCampaigns 
                          ? 'Loading campaigns...'
                          : campaigns.length === 0 
                            ? 'No campaigns available'
                            : 'Select a campaign...'
                      }
                    </option>
                    {campaigns.map((campaign) => (
                      <option key={campaign.campaign_id} value={campaign.campaign_id}>
                        {formatCampaignName(campaign)} ({formatDuration(campaign.duration_days)})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCampaign && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Campaign Details</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Campaign:</span> {formatCampaignName(selectedCampaign)}</p>
                      <p><span className="font-medium">Duration:</span> {formatDuration(selectedCampaign.duration_days)}</p>
                      <p><span className="font-medium">Mail Date:</span> {selectedCampaign.mail_date || 'N/A'}</p>
                      <p><span className="font-medium">Pieces Mailed:</span> {selectedCampaign.total_pcs_mailed?.toLocaleString() || 'N/A'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sales Data Upload */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Sales Data Upload</h2>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Upload your sales data file containing customer names, addresses, sales amounts, and dates
              </p>

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors cursor-pointer"
              >
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="sales-data-upload"
                  accept=".csv,.xlsx,.xls,.txt"
                />
                <label htmlFor="sales-data-upload" className="cursor-pointer">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    {salesDataFile ? salesDataFile.name : 'Upload Sales Data'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {salesDataFile ? 'File ready for processing' : 'Drop file here or click to upload'}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    CSV, Excel, or TXT files supported
                  </p>
                </label>
              </div>

              <button
                onClick={calculateCampaignROI}
                disabled={!selectedCampaign || !salesDataFile || !matchedCampaignCost || isCalculating}
                className="w-full mt-4 bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Users className="w-5 h-5" />
                <span>{isCalculating ? 'Processing...' : 'Calculate Campaign ROI'}</span>
              </button>

              {calculationError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{calculationError}</p>
                </div>
              )}
            </div>
          </div>

          {/* Campaign Results Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Campaign ROI Results</h2>
            </div>

            {isCalculating ? (
              <div className="text-center py-8">
                <div className="animate-spin w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 mb-2">Processing sales data...</p>
                <p className="text-sm text-gray-500">Matching customers to mail list</p>
              </div>
            ) : campaignResults ? (
              <>
                <div className="space-y-6">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600 mb-1">Campaign ROI</p>
                    <p className="text-3xl font-bold text-purple-700">
                      {campaignResults.roiPercentage.toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center text-sm mb-4">
                    <div>
                      <p className="text-gray-600">Cost</p>
                      <p className="font-semibold text-gray-900">${campaignResults.cost.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Matched Revenue</p>
                      <p className="font-semibold text-gray-900">${campaignResults.revenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Profit</p>
                      <p className="font-semibold text-gray-900">${campaignResults.profit.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Customer Matching Results</span>
                  </h3>
                  <div className="mb-3">
                    <p className="text-sm text-gray-700 font-medium">
                      {campaignResults.matchedCustomers} customers matched out of {campaignResults.totalEntries} sales entries
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Matched</p>
                      <p className="font-semibold text-green-700">{campaignResults.matchedCustomers}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Unmatched</p>
                      <p className="font-semibold text-orange-700">{campaignResults.unmatchedCustomers}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Match Rate</p>
                      <p className="font-semibold text-green-700">{campaignResults.matchRate}%</p>
                    </div>
                  </div>
                </div>


                </div>

                {/* Key Performance Metrics */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span>Key Performance Metrics</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Revenue per Piece</p>
                      <p className="text-lg font-bold text-green-700">
                        ${(campaignResults.revenue / campaignResults.totalMailedCustomers).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Cost per Acquisition</p>
                      <p className="text-lg font-bold text-blue-700">
                        ${(campaignResults.cost / campaignResults.matchedCustomers).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Analysis Section */}
                {campaignResults.optimizationRecommendations && campaignResults.optimizationRecommendations.length > 0 && (
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5 text-purple-600" />
                      <span>AI Campaign Analysis</span>
                    </h3>
                    <div className="space-y-3">
                      {campaignResults.optimizationRecommendations.map((recommendation: string, index: number) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-purple-200">
                          <p className="text-sm text-gray-700">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* LLM Recommendations - Only show if available */}
                {/* {campaignResults.optimizationRecommendations && campaignResults.optimizationRecommendations.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                      <Award className="w-5 h-5 text-orange-600" />
                      <span>AI Recommendations</span>
                    </h3>
                    <div className="space-y-2">
                      {campaignResults.optimizationRecommendations.map((recommendation: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2">
                          <Lightbulb className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )} */}
              </>
            ) : (
              <div className="space-y-6">
                {/* Show mock data when feature disabled, empty when enabled */}
                {!isCampaignMatchedEnabled ? (
                  <>
                    {/* Mock ROI Results */}
                    <div className="space-y-6">
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                        <div className="text-center mb-4">
                          <p className="text-sm text-gray-600 mb-1">Campaign ROI</p>
                          <p className="text-3xl font-bold text-purple-700">
                            {mockCampaignResults.roiPercentage.toFixed(1)}%
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-center text-sm mb-4">
                          <div>
                            <p className="text-gray-600">Cost</p>
                            <p className="font-semibold text-gray-900">${mockCampaignResults.cost.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Matched Revenue</p>
                            <p className="font-semibold text-gray-900">${mockCampaignResults.revenue.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Profit</p>
                            <p className="font-semibold text-gray-900">${mockCampaignResults.profit.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      {/* Mock Customer Matching Results */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span>Customer Matching Results</span>
                        </h3>
                        <div className="mb-3">
                          <p className="text-sm text-gray-700 font-medium">
                            {mockCampaignResults.matchedCustomers} customers matched out of {mockCampaignResults.totalEntries} sales entries
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Matched</p>
                            <p className="font-semibold text-green-700">{mockCampaignResults.matchedCustomers}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Unmatched</p>
                            <p className="font-semibold text-orange-700">{mockCampaignResults.unmatchedCustomers}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Match Rate</p>
                            <p className="font-semibold text-green-700">{mockCampaignResults.matchRate}%</p>
                          </div>
                        </div>
                      </div>

                      {/* Mock Key Performance Metrics */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          <span>Key Performance Metrics</span>
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Revenue per Piece</p>
                            <p className="text-lg font-bold text-green-700">
                              ${(mockCampaignResults.revenue / mockCampaignResults.totalMailedCustomers).toFixed(2)}
                            </p>
                          </div>
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Cost per Acquisition</p>
                            <p className="text-lg font-bold text-blue-700">
                              ${(mockCampaignResults.cost / mockCampaignResults.matchedCustomers).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Mock AI Analysis */}
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <Lightbulb className="w-5 h-5 text-purple-600" />
                          <span>AI Campaign Analysis</span>
                        </h3>
                        <div className="space-y-3">
                          {mockCampaignResults.optimizationRecommendations.map((recommendation: string, index: number) => (
                            <div key={index} className="bg-white rounded-lg p-3 border border-purple-200">
                              <p className="text-sm text-gray-700">{recommendation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Empty state when feature enabled */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <span>Your Campaign ROI:</span>
                      </h3>
                      
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">ROI Percentage</p>
                            <p className="text-3xl font-bold text-purple-700">0.0%</p>
                            <div className="flex items-center justify-center space-x-1 mt-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm font-medium text-blue-600">📈 Awaiting Data</span>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">Profit</p>
                            <p className="text-3xl font-bold text-gray-900">$0</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Total Cost:</p>
                            <p className="font-semibold text-gray-900">$0</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Matched Revenue:</p>
                            <p className="font-semibold text-gray-900">$0</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Customer Matching Results */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        <span>Customer Matching Results:</span>
                      </h3>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="mb-3">
                          <p className="text-sm text-gray-700 font-medium">
                            0 customers matched out of 0 sales entries
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Matched:</p>
                            <p className="font-semibold text-gray-900">0</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Unmatched:</p>
                            <p className="font-semibold text-gray-900">0</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Match Rate:</p>
                            <p className="font-semibold text-gray-900">0.0%</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                        <span>Explanation:</span>
                      </h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-gray-700">
                          Campaign ROI calculated: $0 matched revenue - $0 cost = $0 profit (0.0% ROI)
                        </p>
                      </div>
                    </div>

                    {/* Enhanced Insights */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <Lightbulb className="w-5 h-5 text-yellow-600" />
                        <span>Campaign ROI Insights:</span>
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                            1
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 mb-1">Customer Attribution Analysis</p>
                            <p className="text-sm text-gray-700">Match your sales data to campaign mail lists for precise ROI attribution and customer insights.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                            2
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 mb-1">Time-Period Filtering</p>
                            <p className="text-sm text-gray-700">Sales data will be filtered to match your campaign timeframe for accurate performance measurement.</p>
                          </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                        3
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Advanced Analytics</p>
                        <p className="text-sm text-gray-700">Get detailed insights on customer matching rates, revenue per piece, and campaign effectiveness.</p>
                      </div>
                    </div>
                  </div>
                </div>
                    </>
                )}
              </div>
            )}
          </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedROI;