import React from 'react';
import { ChevronDown, Search, Zap, Building2, Target, BarChart3 } from 'lucide-react';

const CampaignSelector: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <Search className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Campaign Selection</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Select Client
          </label>
          <p className="text-sm text-gray-500 mb-3">Choose a client to see their campaigns</p>
          <div className="relative">
            <select className="w-full p-3 border border-gray-300 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Baker, Williams and Stevens Furniture (ID: 1004, Furniture)</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Select Primary Campaign
          </label>
          <p className="text-sm text-gray-500 mb-3">Choose the main campaign to analyze</p>
          <div className="relative">
            <select className="w-full p-3 border border-gray-300 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Holiday Home Decor (20 days)</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Select Comparison Campaign
          </label>
          <p className="text-sm text-gray-500 mb-3">Choose a similar campaign to compare against</p>
          <div className="relative">
            <select className="w-full p-3 border border-gray-300 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Summer Office Furniture (17 days)</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <button className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2">
          <Zap className="w-5 h-5" />
          <span>Run AI Analysis</span>
        </button>
        
        <p className="text-sm text-gray-600 text-center italic">
          Ready to analyze! Click the button above.
        </p>
      </div>
    </div>
  );
};

export default CampaignSelector;