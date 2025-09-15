import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, FileText, Target, Upload, Users, Calendar, BarChart3, TrendingUp, Award, Lightbulb, CheckCircle, AlertTriangle } from 'lucide-react';
import { apiService, CampaignSummary, Client, formatCampaignName, formatDuration } from '../services/api';

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

  // Simple ROI calculation
  const calculateSimpleROI = () => {
    const campaign = parseFloat(campaignCost) || 0;
    const goods = parseFloat(costOfGoods) || 0;
    const additional = parseFloat(additionalCosts) || 0;
    const totalCost = campaign + goods + additional;
    const revenue = parseFloat(simpleRevenue) || 0;
    
    if (totalCost <= 0 || revenue <= 0) {
      setCalculationError('Please enter valid cost and revenue amounts');
      return;
    }
    
    const profit = revenue - totalCost;
    const roiPercentage = ((profit / totalCost) * 100);
    
    setSimpleResults({
      campaignCost: campaign,
      costOfGoods: goods,
      additionalCosts: additional,
      totalCost,
      revenue,
      profit,
      roiPercentage,
      explanation: `ROI calculated: $${revenue.toLocaleString()} revenue - $${totalCost.toLocaleString()} total cost = $${profit.toLocaleString()} profit (${roiPercentage.toFixed(1)}% ROI)`
    });
    setCalculationError(null);
  };

  // Campaign-matched ROI calculation (placeholder for backend integration)
  const calculateCampaignROI = async () => {
    if (!selectedCampaign || !salesDataFile || !matchedCampaignCost) {
      setCalculationError('Please select a campaign, upload sales data, and enter campaign cost');
      return;
    }

    try {
      setIsCalculating(true);
      setCalculationError(null);
      
      // This would be the actual API call to the backend
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing
      
      // Mock results - in reality this would come from the backend
      const cost = parseFloat(matchedCampaignCost);
      const matchedRevenue = 45000; // This would come from backend matching
      const matchedCustomers = 23; // Number of customers matched
      const totalMailedCustomers = 1500; // From campaign data
      const profit = matchedRevenue - cost;
      const roiPercentage = ((profit / cost) * 100);
      
      setCampaignResults({
        cost,
        revenue: matchedRevenue,
        profit,
        roiPercentage,
        matchedCustomers,
        totalMailedCustomers,
        matchRate: ((matchedCustomers / totalMailedCustomers) * 100).toFixed(1),
        campaignName: formatCampaignName(selectedCampaign),
        campaignDuration: formatDuration(selectedCampaign.duration_days),
        explanation: `Campaign ROI: $${matchedRevenue.toLocaleString()} matched revenue - $${cost.toLocaleString()} cost = $${profit.toLocaleString()} profit (${roiPercentage.toFixed(1)}% ROI)`
      });
      
    } catch (error) {
      setCalculationError('Failed to calculate campaign ROI. Please try again.');
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

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Advanced ROI Calculator</h1>
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
            className={`p-6 rounded-xl border-2 transition-all ${
              calculatorMode === 'campaign-matched'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
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

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Explanation:</h3>
                  <p className="text-gray-700 text-sm">{simpleResults.explanation}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Enter cost and revenue values to calculate ROI</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Campaign-Matched ROI Calculator */}
      {calculatorMode === 'campaign-matched' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Customers Matched</p>
                      <p className="font-semibold text-gray-900">{campaignResults.matchedCustomers}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Match Rate</p>
                      <p className="font-semibold text-green-700">{campaignResults.matchRate}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Campaign Context:</h3>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p><span className="font-medium">Campaign:</span> {campaignResults.campaignName}</p>
                    <p><span className="font-medium">Duration:</span> {campaignResults.campaignDuration}</p>
                    <p><span className="font-medium">Total Mailed:</span> {campaignResults.totalMailedCustomers.toLocaleString()} customers</p>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Explanation:</h3>
                  <p className="text-gray-700 text-sm">{campaignResults.explanation}</p>
                </div>
                </div>

                {/* AI Analysis Section */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <Lightbulb className="w-5 h-5 text-purple-600" />
                    <span>AI Campaign Analysis</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-3 border border-purple-200">
                      <p className="text-sm font-medium text-gray-900 mb-1">Performance Assessment</p>
                      <p className="text-sm text-gray-700">
                        Your {campaignResults.roiPercentage.toFixed(1)}% ROI significantly exceeds typical direct mail benchmarks of 15-25%, 
                        indicating strong campaign targeting and customer response.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-purple-200">
                      <p className="text-sm font-medium text-gray-900 mb-1">Customer Matching Insights</p>
                      <p className="text-sm text-gray-700">
                        {campaignResults.matchRate}% match rate suggests {
                          parseFloat(campaignResults.matchRate) > 2 
                            ? 'excellent data quality and strong campaign attribution' 
                            : 'room for improvement in data matching - consider address standardization'
                        }.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-purple-200">
                      <p className="text-sm font-medium text-gray-900 mb-1">Revenue per Customer</p>
                      <p className="text-sm text-gray-700">
                        Average revenue of ${(campaignResults.revenue / campaignResults.matchedCustomers).toLocaleString()} 
                        per matched customer indicates strong customer value and effective targeting.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Performance Metrics */}
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
                
                {/* Recommendations */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <Award className="w-5 h-5 text-orange-600" />
                    <span>AI Recommendations</span>
                  </h3>
                  <div className="space-y-2">
                    {campaignResults.roiPercentage > 100 ? (
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">
                          <strong>Scale Success:</strong> Consider increasing budget allocation to similar campaigns with this performance level.
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">
                          <strong>Optimize Performance:</strong> Review targeting criteria and creative elements to improve conversion rates.
                        </p>
                      </div>
                    )}
                    
                    {parseFloat(campaignResults.matchRate) < 2 ? (
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">
                          <strong>Improve Data Quality:</strong> Consider address standardization and data cleansing to increase match rates.
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">
                          <strong>Excellent Tracking:</strong> Your data quality enables accurate ROI attribution - maintain current processes.
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-start space-x-2">
                      <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">
                        <strong>Future Analysis:</strong> Track customer lifetime value to understand long-term campaign impact beyond initial sales.
                      </p>
                    </div>
                  </div>
                </div>
                {/* AI Analysis Section */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <Lightbulb className="w-5 h-5 text-purple-600" />
                    <span>AI Campaign Analysis</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-3 border border-purple-200">
                      <p className="text-sm font-medium text-gray-900 mb-1">Performance Assessment</p>
                      <p className="text-sm text-gray-700">
                        Your {campaignResults.roiPercentage.toFixed(1)}% ROI significantly exceeds typical direct mail benchmarks of 15-25%, 
                        indicating strong campaign targeting and customer response.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-purple-200">
                      <p className="text-sm font-medium text-gray-900 mb-1">Customer Matching Insights</p>
                      <p className="text-sm text-gray-700">
                        {campaignResults.matchRate}% match rate suggests {
                          parseFloat(campaignResults.matchRate) > 2 
                            ? 'excellent data quality and strong campaign attribution' 
                            : 'room for improvement in data matching - consider address standardization'
                        }.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-purple-200">
                      <p className="text-sm font-medium text-gray-900 mb-1">Revenue per Customer</p>
                      <p className="text-sm text-gray-700">
                        Average revenue of ${(campaignResults.revenue / campaignResults.matchedCustomers).toLocaleString()} 
                        per matched customer indicates strong customer value and effective targeting.
                      </p>
                    </div>
                  </div>
                </div>
                {/* Performance Metrics */}
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
                {/* Recommendations */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <Award className="w-5 h-5 text-orange-600" />
                    <span>AI Recommendations</span>
                  </h3>
                  <div className="space-y-2">
                    {campaignResults.roiPercentage > 100 ? (
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">
                          <strong>Scale Success:</strong> Consider increasing budget allocation to similar campaigns with this performance level.
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">
                          <strong>Optimize Performance:</strong> Review targeting criteria and creative elements to improve conversion rates.
                        </p>
                      </div>
                    )}
                    
                    {parseFloat(campaignResults.matchRate) < 2 ? (
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">
                          <strong>Improve Data Quality:</strong> Consider address standardization and data cleansing to increase match rates.
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">
                          <strong>Excellent Tracking:</strong> Your data quality enables accurate ROI attribution - maintain current processes.
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-start space-x-2">
                      <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">
                        <strong>Future Analysis:</strong> Track customer lifetime value to understand long-term campaign impact beyond initial sales.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Upload sales data and select campaign</p>
                <p className="text-sm text-gray-400">Results will show customer matching and ROI analysis</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedROI;