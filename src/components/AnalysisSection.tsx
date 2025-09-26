import React from 'react';
import { Brain, CheckCircle, Loader } from 'lucide-react';
import { CampaignSummary, CompareResponse } from '../services/api';

interface AnalysisSectionProps {
  primaryCampaign: CampaignSummary | null;
  comparisonCampaign: CampaignSummary | null;
  compareResult: CompareResponse | null;
  isAnalyzing: boolean;
}

const AnalysisSection: React.FC<AnalysisSectionProps> = ({ 
  primaryCampaign, 
  comparisonCampaign, 
  compareResult, 
  isAnalyzing 
}) => {
  // Helper function to format campaign name for display
  const formatCampaignName = (campaign: CampaignSummary) => {
    return campaign.name || `Campaign ${campaign.campaign_id}`;
  };

  // Helper function to format numbers with commas
  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return '--';
    return num.toLocaleString();
  };

  // Helper function to get campaign metrics from compareResult.metrics_comparison
  const getCampaignMetrics = (campaignId: number, isComparison: boolean = false) => {
    if (!compareResult?.metrics_comparison) return { displays: null, engagements: null, leads: null };
    
    const metrics = compareResult.metrics_comparison;
    
    // Data structure: { "ad_displays": { "previous": 123, "current": 456 }, ... }
    
    // The backend structure is: { "ad_displays": { "previous": 123, "current": 456 }, ... }
    // BUT: "previous" = primaryCampaign, "current" = comparisonCampaign (based on campaign_ids array order)
    // So Primary campaign gets "previous", comparison gets "current" 
    const valueKey = isComparison ? 'current' : 'previous';
    
    return {
      displays: metrics['ad_displays']?.[valueKey] || null,
      engagements: metrics['engagements']?.[valueKey] || null,
      leads: metrics['leads']?.[valueKey] || null
    };
  };

  // No data state - before analysis
  if (!primaryCampaign || !comparisonCampaign) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Analysis Results</h3>
        <p className="text-gray-500">Select two campaigns and click "Analyze" to see detailed insights and recommendations</p>
      </div>
    );
  }

  // Loading state - during analysis
  if (isAnalyzing) {
    return (
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-8 text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          <Brain className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Campaigns...</h3>
        <p className="text-blue-600 font-medium">AI is comparing your campaigns and generating insights</p>
        <div className="mt-4">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-lg bg-blue-200 h-4 w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  // Results state - after analysis
  return (
    <div className="space-y-8">
      {/* AI Campaign Analysis Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Campaign Analysis</h2>
            <p className="text-sm text-gray-600">Intelligent comparison and insights</p>
            <p className="text-sm text-gray-600">Key insights from campaign comparison</p>
          </div>
        </div>
        


        {/* Performance Analysis Summary */}
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border border-indigo-200 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900 mb-3">Performance Analysis Summary</h4>
                <p className="text-gray-700 leading-relaxed text-base mb-4">
                  {compareResult?.executive_summary || 'Analysis summary will appear here after AI processing completes.'}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-indigo-200/50">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <h5 className="font-semibold text-gray-900">Key Finding</h5>
                    </div>
                    <p className="text-sm text-gray-700">
                      {compareResult?.key_finding?.headline || 'Campaign performance differences will be analyzed here'}
                    </p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-indigo-200/50">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <h5 className="font-semibold text-gray-900">Primary Factor</h5>
                    </div>
                    <p className="text-sm text-gray-700">
                      {compareResult?.primary_factor?.tactical_detail || 'Root cause analysis will appear here'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Recommendations */}
      {compareResult?.insights && compareResult.insights.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Recommendations:</span>
          </h3>
          <div className="space-y-3">
            {(() => {
              // Get all recommendation-type insights
              const recommendations = compareResult.insights.filter(insight => insight.type === 'recommendation');
              
              // If we have API recommendations, use them
              if (recommendations.length > 0) {
                return recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{recommendation.message}</p>
                  </div>
                ));
              }
              
              // Fallback: Parse detailed_analysis for recommendations or use generic ones
              const fallbackRecommendations = [
                "Analyze the performance differences between campaigns to identify optimization opportunities",
                "Review targeting and creative strategies from the better-performing campaign", 
                "Consider adjusting budget allocation based on performance insights",
                "Implement A/B testing for creative variations to improve engagement rates"
              ];
              
              return fallbackRecommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-gray-700">{recommendation}</p>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

    </div>
  );
};

export default AnalysisSection;