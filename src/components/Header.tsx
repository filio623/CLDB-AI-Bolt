import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Zap, Target, Trophy, ChevronDown, Building2, BookmarkCheck } from 'lucide-react';
import { apiService, Client, APIError } from '../services/api';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  selectedClient: Client | null;
  onClientChange: (client: Client | null) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, selectedClient, onClientChange }) => {
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [clientError, setClientError] = useState<string | null>(null);

  // Load clients on component mount
  useEffect(() => {
    const loadClients = async () => {
      try {
        setIsLoadingClients(true);
        setClientError(null);
        const clientData = await apiService.getClients();
        setClients(clientData);
        
        // Auto-select first client if none selected
        if (!selectedClient && clientData.length > 0) {
          onClientChange(clientData[0]);
        }
      } catch (error) {
        console.error('Failed to load clients:', error);
        setClientError(error instanceof APIError ? error.message : 'Failed to load clients');
      } finally {
        setIsLoadingClients(false);
      }
    };

    loadClients();
  }, [selectedClient, onClientChange]);

  const tabs = [
    { id: 'compare', label: 'Compare Campaigns', icon: BarChart3 },
    { id: 'benchmark', label: 'Industry Benchmark', icon: Trophy },
    { id: 'advanced-roi', label: 'ROI', icon: BookmarkCheck },
  ];

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <img 
              src="https://directmail2.com/wp-content/themes/dm20/img/logo.svg" 
              alt="DirectMail 2.0 Logo" 
              className="h-8 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">CLDB-AI Campaign Intelligence Platform</h1>
              <p className="text-sm text-gray-600">AI-powered campaign analytics with industry benchmarking</p>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
              disabled={isLoadingClients}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Building2 className="w-3 h-3" />
              <span className="max-w-48 truncate">
                {isLoadingClients 
                  ? 'Loading clients...' 
                  : clientError 
                    ? 'Error loading clients' 
                    : selectedClient?.client_name || 'Select client'
                }
              </span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isClientDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isClientDropdownOpen && (
              <div className="absolute right-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-2 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900 flex items-center space-x-1 text-sm">
                    <Building2 className="w-3 h-3" />
                    <span>Select Client</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Choose a client to analyze their campaigns</p>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {clientError ? (
                    <div className="px-3 py-2 text-sm text-red-600">
                      {clientError}
                    </div>
                  ) : isLoadingClients ? (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      Loading clients...
                    </div>
                  ) : clients.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      No clients available
                    </div>
                  ) : (
                    clients.map((client) => (
                      <button
                        key={client.client_id}
                        onClick={() => {
                          onClientChange(client);
                          setIsClientDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 text-sm ${
                          selectedClient?.client_id === client.client_id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        <div className="font-medium text-sm">{client.client_name}</div>
                        <div className="text-xs text-gray-500 flex justify-between">
                          <span>{client.industry}</span>
                          <span>{client.campaign_count} campaigns</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <nav className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-orange-100 text-orange-700 border border-orange-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;