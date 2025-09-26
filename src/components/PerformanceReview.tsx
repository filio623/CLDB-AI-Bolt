import React from 'react';
import { Brain, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Star, MessageSquare, BarChart3, Target, Award } from 'lucide-react';

const PerformanceReview: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Performance Review</h1>
        <p className="text-gray-600">AI-powered analysis of your campaign performance in plain English</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Campaign Selection Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Campaign Selection</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Campaign to Review
                </label>
                <p className="text-sm text-gray-500 mb-3">Choose a campaign for AI performance analysis</p>
                <select className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                  <option>Holiday Home Decor (20 days)</option>
                  <option>Summer Office Furniture (17 days)</option>
                  <option>Living Room Sets Promo (10 days)</option>
                </select>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Campaign Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Campaign:</span> Holiday Home Decor</p>
                  <p><span className="font-medium">Client:</span> Baker, Williams and Stevens</p>
                  <p><span className="font-medium">Duration:</span> 20 days</p>
                  <p><span className="font-medium">Status:</span> <span className="text-green-600">Completed</span></p>
                </div>
              </div>

              <button className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
                <Brain className="w-5 h-5" />
                <span>Generate AI Review</span>
              </button>
              
              <p className="text-sm text-gray-600 text-center italic">
                AI will analyze CLDB results and provide feedback in plain English
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2">
          {/* Overall Performance Score */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Overall Performance Score</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">B+</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Campaign Grade</h3>
                <p className="text-sm text-gray-600">Above average performance with room for improvement</p>
              </div>
              
              <div className="text-center p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Confidence</h3>
                <p className="text-sm text-gray-600">High confidence in analysis based on complete data</p>
              </div>
              
              <div className="text-center p-6 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Quality</h3>
                <p className="text-sm text-gray-600">Complete CLDB dataset available for analysis</p>
              </div>
            </div>
          </div>

          {/* AI Feedback Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">AI Performance Feedback</h2>
            </div>

            <div className="space-y-6">
              {/* Campaign Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <span>Campaign Summary</span>
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Your Holiday Home Decor campaign performed well overall, achieving strong engagement rates and solid visitor conversion. 
                  The campaign successfully reached your target audience during the holiday season, with particularly strong performance 
                  in social media channels. However, there are opportunities to improve lead generation and attribution tracking.
                </p>
              </div>

              {/* What Worked Well */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>What Worked Well</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">
                      <strong>Strong Social Engagement:</strong> Your social media posts generated 40% more engagement than typical furniture campaigns, 
                      indicating your creative content resonated well with the audience.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">
                      <strong>Effective Timing:</strong> The holiday season timing was optimal, with peak engagement occurring during 
                      the first two weeks when holiday shopping intent was highest.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">
                      <strong>Quality Traffic:</strong> Visitors spent an average of 3.2 minutes on your site, well above the 
                      industry average of 2.1 minutes, suggesting high content relevance.
                    </p>
                  </div>
                </div>
              </div>

              {/* Areas for Improvement */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <span>Areas for Improvement</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">
                      <strong>Lead Conversion:</strong> While you attracted quality visitors, only 7% converted to leads. 
                      Consider adding more compelling calls-to-action and lead magnets like design consultations or catalogs.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">
                      <strong>Attribution Tracking:</strong> Some conversions may not be properly attributed to your campaign. 
                      Implementing better tracking pixels and UTM parameters could reveal additional ROI.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">
                      <strong>Mobile Experience:</strong> Mobile visitors had a 15% higher bounce rate than desktop users. 
                      Optimizing your mobile landing pages could capture more leads from mobile traffic.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span>Key Metrics Breakdown</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Engagement Rate</p>
                    <p className="text-sm text-gray-600">Above industry average</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-green-600">+23%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Click-Through Rate</p>
                    <p className="text-sm text-gray-600">Strong performance</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-green-600">+18%</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Lead Conversion</p>
                    <p className="text-sm text-gray-600">Needs improvement</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="w-4 h-4 text-orange-600" />
                    <span className="font-bold text-orange-600">-12%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Cost Efficiency</p>
                    <p className="text-sm text-gray-600">Good value for spend</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-green-600">+8%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps Recommendations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span>AI Recommended Next Steps</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Optimize Lead Capture</p>
                  <p className="text-sm text-gray-700">Add exit-intent popups and improve your contact forms to capture more leads from existing traffic.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Scale Successful Elements</p>
                  <p className="text-sm text-gray-700">Increase budget allocation to social media channels that performed well in this campaign.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Improve Mobile Experience</p>
                  <p className="text-sm text-gray-700">Focus on mobile optimization to reduce bounce rates and capture more mobile leads.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceReview;