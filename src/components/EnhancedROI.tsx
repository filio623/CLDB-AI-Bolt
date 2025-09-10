import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, Calculator, TrendingUp, Target, Award, Lightbulb } from 'lucide-react';
import { apiService, ROIRequest, ROIResponse, CampaignSummary, Client, formatCampaignName, formatDuration } from '../services/api';

interface EnhancedROIProps {
  selectedClient?: Client | null;
}

const EnhancedROI: React.FC<EnhancedROIProps> = ({ selectedClient }) => {
  // State management for ROI calculation
  const [campaignCost, setCampaignCost] = useState('');
  const [pastedData, setPastedData] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // API integration state (Phase 2)
  const [roiResult, setROIResult] = useState<ROIResponse | null>(null);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  
  // PHASE 3: Paste data processing state
  const [isParsing, setIsParsing] = useState(false);
  const [pasteError, setPasteError] = useState<string | null>(null);
  
  // PHASE 4: File processing state
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [fileProcessingError, setFileProcessingError] = useState<string | null>(null);
  
  // PHASE 7: Campaign context integration state
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignSummary | null>(null);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [campaignError, setCampaignError] = useState<string | null>(null);

  // Fallback calculation for UI display (when no API result available)
  const calculateROI = () => {
    const cost = parseFloat(campaignCost) || 0;
    const revenue = 0; // Revenue now comes from AI parsing, not manual input
    const profit = revenue - cost;
    const roiPercentage = cost > 0 && revenue > 0 ? ((profit / cost) * 100).toFixed(1) : '0.0';
    return { cost, revenue, profit, roiPercentage };
  };


  // UPDATED: Paste data processing - handle both PATH 2 and PATH 3 scenarios
  const handlePasteDataProcessing = async (pastedText: string) => {
    // Only process if there's actual text
    if (!pastedText.trim()) return;
    
    try {
      setIsParsing(true);
      setPasteError(null);
      
      const cost = parseFloat(campaignCost) || 0;
      
      // Build request based on whether we have manual cost or not
      const request: ROIRequest = {
        uploaded_data: pastedText,
        data_format: 'text', // Use text parser
        campaign_id: selectedCampaign?.campaign_id,
        // Include campaign_cost only if user entered it (PATH 2)
        // Leave it undefined for PATH 3 (text-only extraction)
        ...(cost > 0 && { campaign_cost: cost })
      };
      
      console.log('🔍 Sending ROI request:', request);
      
      const result = await apiService.calculateROI(request);
      console.log('✅ Received ROI response:', result);
      console.log('📊 Setting roiResult state to:', result);
      setROIResult(result);
      
      // Update manual input field with parsed cost value for user verification
      if (result.total_cost && result.total_cost !== cost) {
        setCampaignCost(result.total_cost.toString());
      }
      // Revenue is now shown in results section, not as manual input
      
    } catch (error) {
      console.error('Paste processing error:', error);
      setPasteError(error instanceof Error ? error.message : 'Could not parse revenue data');
    } finally {
      setIsParsing(false);
    }
  };

  // PHASE 4: File processing - send uploaded files to backend for AI parsing
  const handleFileProcessing = async (file: File) => {
    try {
      setIsProcessingFile(true);
      setFileProcessingError(null);
      
      // Validate file exists and has reasonable size
      if (!file) {
        throw new Error('No file selected');
      }
      
      if (file.size === 0) {
        throw new Error('File appears to be empty');
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('File size too large (max 10MB)');
      }
      
      // Send raw file to backend for processing (PHASE 7: enhanced with campaign context)
      const result = await apiService.calculateROIWithFile(
        file, 
        selectedCampaign?.campaign_id, // PHASE 7: Optional campaign context for enhanced insights
        undefined, // additional_costs
        parseFloat(campaignCost) || undefined // campaign_cost from manual input
      );
      setROIResult(result);
      
      // Auto-populate manual input field with parsed cost value for user verification
      if (result.total_cost) setCampaignCost(result.total_cost.toString());
      // Revenue is now shown in results, not as manual input field
      
    } catch (error) {
      setFileProcessingError(error instanceof Error ? error.message : 'Failed to process file');
    } finally {
      setIsProcessingFile(false);
    }
  };

  // PHASE 7: Campaign loading functionality following Compare/Benchmark pattern
  const loadCampaigns = async (clientId: number) => {
    try {
      setIsLoadingCampaigns(true);
      setCampaignError(null);
      
      const campaignData = await apiService.getCampaignsByClient(clientId);
      setCampaigns(campaignData);
      
    } catch (error) {
      setCampaignError(error instanceof Error ? error.message : 'Failed to load campaigns');
      setCampaigns([]);
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  // PHASE 7: Load campaigns when selectedClient changes
  useEffect(() => {
    if (selectedClient?.client_id) {
      loadCampaigns(selectedClient.client_id);
    } else {
      // Clear campaigns if no client selected
      setCampaigns([]);
      setSelectedCampaign(null);
      setCampaignError(null);
    }
  }, [selectedClient]);

  const { cost, revenue, profit, roiPercentage } = calculateROI();
  
  // Debug logging for roiResult state
  console.log('🎯 Current roiResult state:', roiResult);
  console.log('📊 Manual calculation fallback:', { cost, revenue, profit, roiPercentage });

  // File upload handlers - just set the file, processing happens on button click
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Clear any previous errors
      setFileProcessingError(null);
      setCalculationError(null);
      // Clear pasted data since user is now using file upload
      setPastedData('');
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      // Clear any previous errors
      setFileProcessingError(null);
      setCalculationError(null);
      // Clear pasted data since user is now using file upload
      setPastedData('');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Enhanced ROI Calculator</h1>
        <p className="text-gray-600">Calculate return on investment with manual cost/revenue input for accurate financial analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Manual Input Fields */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Manual Input Fields</h2>
            </div>

            <p className="text-sm text-gray-600 mb-6">Enter your campaign cost and revenue for instant ROI calculation</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Cost ($)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Total campaign spend (optional - improves accuracy)
                  {campaignCost && parseFloat(campaignCost) > 0 && (
                    <span className="text-green-600 ml-2">✓ Valid amount</span>
                  )}
                </p>
                <input
                  type="number"
                  value={campaignCost}
                  onChange={(e) => setCampaignCost(e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    campaignCost && parseFloat(campaignCost) < 0 
                      ? 'border-red-300 bg-red-50' 
                      : campaignCost && parseFloat(campaignCost) > 0
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-300'
                  }`}
                  placeholder="Enter campaign cost (e.g. 5000)"
                />
                {campaignCost && parseFloat(campaignCost) < 0 && (
                  <p className="text-xs text-red-600 mt-1">Campaign cost cannot be negative</p>
                )}
              </div>

              {/* Revenue Data Input Options - Paste OR Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Revenue Data
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Option 1: Paste revenue data in any format - AI will parse it automatically
                </p>
                <textarea
                  value={pastedData}
                  onChange={(e) => setPastedData(e.target.value)}
                  disabled={isParsing || isProcessingFile}
                  className={`w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                    isParsing || isProcessingFile ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  placeholder="Paste your revenue data here...&#10;&#10;Example from Excel:&#10;Product Sales: $18,500&#10;Service Revenue: $6,500&#10;Total Revenue: $25,000&#10;Q1 Sales: $12,000&#10;Q2 Sales: $13,000"
                />
                {isParsing && (
                  <p className="text-xs text-blue-600 mt-2">• Processing revenue data...</p>
                )}
                
                {/* OR Separator */}
                <div className="flex items-center my-4">
                  <hr className="flex-grow border-gray-300" />
                  <span className="px-3 text-sm text-gray-500 bg-white">OR</span>
                  <hr className="flex-grow border-gray-300" />
                </div>
                
                {/* File Upload Option */}
                <div>
                  <p className="text-xs text-gray-500 mb-3">
                    Option 2: Upload a document with revenue data (CSV, TXT, DOC, DOCX, PDF, Excel)
                    {isProcessingFile && <span className="text-blue-600 ml-2">• Processing file...</span>}
                  </p>
                  
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className={`border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer ${
                      isProcessingFile ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept=".csv,.txt,.doc,.docx,.pdf,.xlsx,.xls"
                      disabled={isProcessingFile || isParsing}
                    />
                    <label htmlFor="file-upload" className={`cursor-pointer ${isProcessingFile || isParsing ? 'cursor-not-allowed' : ''}`}>
                      <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        {isProcessingFile 
                          ? 'Processing...' 
                          : selectedFile 
                            ? selectedFile.name 
                            : 'Drop file here or click to upload'
                        }
                      </p>
                      <p className="text-xs text-gray-500">
                        {isProcessingFile 
                          ? 'AI is parsing your file...' 
                          : selectedFile 
                            ? 'File ready for processing' 
                            : 'CSV, TXT, DOC, DOCX, PDF, Excel supported'
                        }
                      </p>
                    </label>
                  </div>
                  
                  {/* File processing error display */}
                  {fileProcessingError && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">
                        {fileProcessingError}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Calculate ROI Button - Unified action button for all input methods */}
              <button 
                onClick={async () => {
                  const cost = parseFloat(campaignCost) || 0;
                  
                  // Priority 1: Process uploaded file (if one exists)
                  if (selectedFile && !isProcessingFile) {
                    await handleFileProcessing(selectedFile);
                  }
                  // Priority 2: Process pasted text data
                  else if (pastedData.trim() && cost > 0) {
                    // PATH 2: Manual cost + pasted text 
                    await handlePasteDataProcessing(pastedData);
                  } else if (pastedData.trim() && cost === 0) {
                    // PATH 3: Text-only extraction (both cost and revenue)
                    await handlePasteDataProcessing(pastedData);
                  } 
                  // Priority 3: Check for manual input only
                  else if (cost > 0) {
                    // Show error - need revenue data
                    setCalculationError('Please paste revenue data in the text area or upload a file with revenue data.');
                  } else {
                    // No input at all
                    setCalculationError('Please enter campaign cost and paste revenue data OR upload a file with revenue data.');
                  }
                }}
                disabled={isParsing || isProcessingFile}
                className="w-full mt-4 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Calculator className="w-5 h-5" />
                <span>
                  {isParsing 
                    ? 'Parsing Text Data...' 
                    : isProcessingFile
                      ? 'Processing File...'
                      : selectedFile
                        ? 'Process File & Calculate ROI'
                        : pastedData.trim() 
                          ? 'Parse Data & Calculate ROI' 
                          : 'Calculate ROI'
                  }
                </span>
              </button>
              
              {/* Error display for both calculation and parsing */}
              {(calculationError || pasteError) && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    {calculationError || pasteError}
                  </p>
                </div>
              )}
              
              {/* Status indicators for different input scenarios */}
              {/* File selected - ready to calculate */}
              {selectedFile && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></div>
                    <p className="text-sm text-green-800">
                      <strong>File ready for processing!</strong> {selectedFile.name}
                      {campaignCost && parseFloat(campaignCost) > 0 && (
                        <span> + Cost: ${parseFloat(campaignCost).toLocaleString()}</span>
                      )}
                    </p>
                  </div>
                  <p className="text-xs text-green-600 mt-1">👆 Click "Process File & Calculate ROI" button above</p>
                </div>
              )}
              
              {/* Pasted data ready - when no file selected */}
              {!selectedFile && campaignCost && parseFloat(campaignCost) > 0 && pastedData.trim() && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></div>
                    <p className="text-sm text-green-800">
                      <strong>Ready for ROI calculation!</strong> Cost: ${parseFloat(campaignCost).toLocaleString()}, Revenue data provided.
                    </p>
                  </div>
                  <p className="text-xs text-green-600 mt-1">👆 Click "Parse Data & Calculate ROI" button above</p>
                </div>
              )}
              
              {/* Help text when only cost is entered and no file selected */}
              {!selectedFile && campaignCost && parseFloat(campaignCost) > 0 && !pastedData.trim() && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <p className="text-sm text-blue-800">
                      <strong>Campaign cost set:</strong> ${parseFloat(campaignCost).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">👆 Now paste revenue data or upload a file for automatic ROI calculation</p>
                </div>
              )}
            </div>
          </div>


          {/* PHASE 7: Campaign Context Integration */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Campaign Context (Optional)</h2>
            </div>

            <p className="text-sm text-gray-600 mb-4">Select a campaign for enhanced ROI analysis with campaign correlation</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign (Optional - for enhanced insights)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Select a campaign to get enhanced ROI insights with revenue per piece analysis
                {selectedCampaign && (
                  <span className="text-orange-600 ml-2">✓ Enhanced insights enabled</span>
                )}
                {isLoadingCampaigns && (
                  <span className="text-blue-600 ml-2">• Loading campaigns...</span>
                )}
              </p>
              
              <select 
                value={selectedCampaign?.campaign_id || ''} 
                onChange={(e) => {
                  const campaignId = parseInt(e.target.value);
                  const campaign = campaigns.find(c => c.campaign_id === campaignId) || null;
                  setSelectedCampaign(campaign);
                }}
                disabled={isLoadingCampaigns || !selectedClient}
                className={`w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  !selectedClient ? 'opacity-50 cursor-not-allowed' : 
                  isLoadingCampaigns ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  selectedCampaign ? 'border-orange-300 bg-orange-50' : 'border-gray-300'
                }`}
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
              
              {/* Error display */}
              {campaignError && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {campaignError}
                </div>
              )}
              
              {/* Client selection hint */}
              {!selectedClient && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                  💡 <strong>Tip:</strong> Select a client from the top navigation to enable campaign selection for enhanced ROI insights.
                </div>
              )}
              
              {/* Selected campaign info */}
              {selectedCampaign && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                    <span className="font-medium text-orange-900">Campaign Selected</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-orange-700">Campaign:</span>
                      <p className="font-medium text-orange-900">{formatCampaignName(selectedCampaign)}</p>
                    </div>
                    <div>
                      <span className="text-orange-700">Duration:</span>
                      <p className="font-medium text-orange-900">{formatDuration(selectedCampaign.duration_days)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-orange-600 mt-2">
                    ROI analysis will include campaign correlation, revenue per piece, and performance insights.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {/* ROI Analysis Results */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">ROI Analysis Results (v3.0 Enhanced)</h2>
            </div>

            {/* Your ROI Section */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <span>Your ROI:</span>
              </h3>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">ROI Percentage</p>
                    <p className="text-3xl font-bold text-green-700">
                      {roiResult?.roi_percentage ? `${roiResult.roi_percentage.toFixed(1)}%` : `${roiPercentage}%`}
                    </p>
                    <div className="flex items-center justify-center space-x-1 mt-1">
                      {(() => {
                        const roi = roiResult?.roi_percentage || parseFloat(roiPercentage);
                        if (roi >= 300) return (
                          <>
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                            <span className="text-sm font-medium text-green-700">🚀 Excellent ROI</span>
                          </>
                        );
                        if (roi >= 100) return (
                          <>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-green-600">✅ Good ROI</span>
                          </>
                        );
                        if (roi >= 0) return (
                          <>
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-blue-600">📈 Positive ROI</span>
                          </>
                        );
                        return (
                          <>
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-sm font-medium text-red-600">⚠️ Loss</span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Profit</p>
                    <p className="text-3xl font-bold text-gray-900">
                      ${roiResult?.profit_amount ? roiResult.profit_amount.toLocaleString() : profit.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Cost:</p>
                    <p className="font-semibold text-gray-900">
                      ${roiResult?.total_cost ? roiResult.total_cost.toLocaleString() : cost.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Revenue:</p>
                    <p className="font-semibold text-gray-900">
                      ${roiResult?.total_revenue ? roiResult.total_revenue.toLocaleString() : revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Explanation - DESIGN PRESERVATION: Keep exact styling, use live API data */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <span>Explanation:</span>
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-700">
                  {roiResult?.explanation || 
                   `ROI calculated: $${revenue.toLocaleString()} revenue - $${cost.toLocaleString()} cost = $${profit.toLocaleString()} profit (${roiPercentage}% ROI)`
                  }
                </p>
              </div>
            </div>

            {/* Data Information - DESIGN PRESERVATION: Keep exact styling, use live API data */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <span>Data Information:</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    📊
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong>Data Source:</strong> {
                      roiResult?.data_source === 'manual_input' ? 'Manual Input (High Accuracy)' :
                      roiResult?.data_source === 'csv_parsed' ? 'AI Parsed Text (Medium-High Accuracy)' :
                      'Manual Input (High Accuracy)'
                    }
                  </p>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                  <p className="text-sm text-gray-700">
                    {roiResult ? 
                      'AI-enhanced ROI analysis with intelligent data processing' :
                      'Simple, accurate ROI calculation focused on what matters to you'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Insights */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              <span>Enhanced ROI Insights:</span>
            </h3>
            
            <div className="space-y-4">
              {/* DESIGN PRESERVATION: Show campaign context insights when available, fallback to default */}
              {roiResult?.campaign_context?.performance_insights && roiResult.campaign_context.performance_insights.length > 0 ? (
                // Show live campaign context insights
                roiResult.campaign_context.performance_insights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Campaign Insight</p>
                      <p className="text-sm text-gray-700">{insight}</p>
                    </div>
                  </div>
                ))
              ) : (
                // Default insights (preserve existing bolt.new design)
                <>
                  <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Strong Performance Indicator</p>
                      <p className="text-sm text-gray-700">Your {roiResult?.roi_percentage?.toFixed(1) || roiPercentage}% ROI significantly exceeds typical industry benchmarks of 15-25%.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Revenue Efficiency</p>
                      <p className="text-sm text-gray-700">Each dollar invested generated ${((roiResult?.total_revenue || revenue) / (roiResult?.total_cost || cost)).toFixed(2)} in revenue, indicating excellent campaign efficiency.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Scaling Opportunity</p>
                      <p className="text-sm text-gray-700">Consider increasing budget allocation to similar high-performing campaigns to maximize returns.</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Campaign Context (when available) - PHASE 5 ENHANCEMENT */}
          {roiResult?.campaign_context && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span>Campaign Performance Context:</span>
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {roiResult.campaign_context.campaign_name && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Campaign</p>
                    <p className="font-semibold text-gray-900">{roiResult.campaign_context.campaign_name}</p>
                  </div>
                )}
                {roiResult.campaign_context.total_pcs_mailed && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Pieces Mailed</p>
                    <p className="font-semibold text-gray-900">{roiResult.campaign_context.total_pcs_mailed.toLocaleString()}</p>
                  </div>
                )}
                {roiResult.campaign_context.revenue_per_piece && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Revenue/Piece</p>
                    <p className="font-semibold text-purple-600">${roiResult.campaign_context.revenue_per_piece.toFixed(2)}</p>
                  </div>
                )}
                {roiResult.campaign_context.campaign_duration_days && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Duration</p>
                    <p className="font-semibold text-gray-900">{roiResult.campaign_context.campaign_duration_days} days</p>
                  </div>
                )}
              </div>
              
              {(roiResult.campaign_context.industry || roiResult.campaign_context.job_type) && (
                <div className="flex items-center space-x-4 text-sm text-gray-600 border-t pt-3">
                  {roiResult.campaign_context.industry && (
                    <span className="bg-gray-100 px-3 py-1 rounded-full">Industry: {roiResult.campaign_context.industry}</span>
                  )}
                  {roiResult.campaign_context.job_type && (
                    <span className="bg-gray-100 px-3 py-1 rounded-full">Type: {roiResult.campaign_context.job_type}</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quick ROI Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Profit Margin</h3>
              <p className="text-2xl font-bold text-green-600">{((profit / revenue) * 100).toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-1">Of total revenue</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calculator className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Revenue Multiple</h3>
              <p className="text-2xl font-bold text-blue-600">{(revenue / cost).toFixed(1)}x</p>
              <p className="text-xs text-gray-500 mt-1">Return on investment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedROI;