import React, { useState } from 'react';
import { Lightbulb, Upload, Image, BarChart3, Trophy, Target, Zap, Eye, Camera, FileText, TrendingUp, Award, CheckCircle, AlertTriangle } from 'lucide-react';

const Improvements: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Campaign Improvements</h1>
        <p className="text-gray-600">AI-powered analysis and recommendations to optimize your campaign performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analysis Input Sidebar */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Campaign Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Campaign Selection</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Campaign to Improve
                  </label>
                  <p className="text-sm text-gray-500 mb-3">Choose a campaign for AI improvement analysis</p>
                  <select className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500">
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
                    <p><span className="font-medium">Status:</span> <span className="text-green-600">Completed</span></p>
                    <p><span className="font-medium">Performance:</span> <span className="text-orange-600">Needs Improvement</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Creative Upload */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Creative Analysis</h2>
              </div>

              <p className="text-sm text-gray-600 mb-4">Upload campaign creatives for AI analysis and optimization suggestions</p>

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer mb-4"
              >
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="creative-upload"
                  accept="image/*,.pdf,.ai,.psd"
                />
                <label htmlFor="creative-upload" className="cursor-pointer">
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    {selectedFile ? selectedFile.name : 'Upload Creative Files'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedFile ? 'File ready for analysis' : 'Drop files here or click to upload'}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Images, PDF, AI, PSD files supported
                  </p>
                </label>
              </div>

              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Analyze Creative</span>
              </button>
            </div>

            {/* Analysis Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">AI Analysis</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Results Analysis Ready</span>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Benchmark Data Available</span>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">Creative Upload Pending</span>
                </div>
              </div>

              <button className="w-full mt-4 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                <Lightbulb className="w-5 h-5" />
                <span>Generate Improvements</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Analysis Content */}
        <div className="lg:col-span-2">
          {/* Analysis Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">AI Improvement Analysis</h2>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                <span>Analysis Summary:</span>
              </h3>
              <div className="space-y-1 text-sm text-gray-700">
                <p><strong>Campaign:</strong> Holiday Home Decor</p>
                <p><strong>Overall Score:</strong> <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Needs Improvement</span></p>
                <p><strong>Primary Focus Areas:</strong> Creative optimization, audience targeting, lead conversion</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Camera className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Creative Analysis</h3>
                <p className="text-sm text-gray-600">Visual design optimization</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Results Analysis</h3>
                <p className="text-sm text-gray-600">Performance data insights</p>
              </div>
              
              <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <Trophy className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Benchmarking</h3>
                <p className="text-sm text-gray-600">Industry comparison</p>
              </div>
            </div>
          </div>

          {/* Creative Analysis Results */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <Camera className="w-5 h-5 text-blue-600" />
              <span>Creative Analysis Results</span>
            </h3>
            
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Visual Design Assessment</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700"><strong>Color Scheme:</strong> Holiday colors work well for seasonal appeal, good contrast ratios</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700"><strong>Typography:</strong> Headlines could be larger and more prominent for better readability</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700"><strong>Call-to-Action:</strong> CTA button needs more contrast and prominent placement</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Content Optimization</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700"><strong>Messaging:</strong> Clear value proposition, seasonal relevance is strong</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700"><strong>Urgency:</strong> Add time-sensitive elements to create urgency</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700"><strong>Benefits:</strong> Focus more on customer benefits rather than product features</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Analysis */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span>Performance Analysis</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Underperforming Areas</span>
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Lead conversion rate: 2.1% (Industry avg: 3.8%)</li>
                    <li>• Email open rate: 18% (Industry avg: 25%)</li>
                    <li>• Mobile engagement: 45% below desktop</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Strong Performance</span>
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Social media engagement: 34% above average</li>
                    <li>• Click-through rate: 1.8% (Industry avg: 1.2%)</li>
                    <li>• Brand awareness lift: +23%</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Benchmark Comparison</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Overall Performance</span>
                    <span className="text-sm font-medium text-orange-600">65th percentile</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Industry Ranking</span>
                    <span className="text-sm font-medium text-blue-600">Above Average</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">ROI Performance</span>
                    <span className="text-sm font-medium text-green-600">Top 30%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <Award className="w-5 h-5 text-green-600" />
              <span>AI Improvement Recommendations</span>
            </h3>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span>Priority Improvements (High Impact)</span>
                </h4>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Optimize Mobile Experience</p>
                      <p className="text-sm text-gray-700 mb-2">Mobile users have 45% lower engagement. Implement responsive design improvements and mobile-specific CTAs.</p>
                      <p className="text-xs text-green-600 font-medium">Expected Impact: +25% mobile conversions</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Enhance Call-to-Action Design</p>
                      <p className="text-sm text-gray-700 mb-2">Increase CTA button size by 40%, use contrasting colors, and add urgency messaging.</p>
                      <p className="text-xs text-green-600 font-medium">Expected Impact: +18% click-through rate</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Improve Lead Capture Forms</p>
                      <p className="text-sm text-gray-700 mb-2">Reduce form fields from 8 to 4, add social proof, and implement progressive profiling.</p>
                      <p className="text-xs text-green-600 font-medium">Expected Impact: +35% form completions</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Secondary Improvements</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">Creative Enhancements</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• A/B test headline variations</li>
                      <li>• Add customer testimonials</li>
                      <li>• Include product lifestyle images</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">Targeting Optimization</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Refine audience segments</li>
                      <li>• Implement lookalike audiences</li>
                      <li>• Adjust geographic targeting</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Improvements;