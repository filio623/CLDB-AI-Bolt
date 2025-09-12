import { useState } from 'react';
import Header from './components/Header';
import CompareCampaigns from './components/CompareCampaigns';
import IndustryBenchmark from './components/IndustryBenchmark';
import EnhancedROI from './components/EnhancedROI';
import AdvancedROI from './components/AdvancedROI';
import PerformanceReview from './components/PerformanceReview';
import Improvements from './components/Improvements';
import { Client } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('compare');

  // Global client state (shared between Header and all tabs)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'roi':
        return <EnhancedROI selectedClient={selectedClient} />;
      case 'advanced-roi':
        return <AdvancedROI selectedClient={selectedClient} />;
      case 'benchmark':
        return <IndustryBenchmark selectedClient={selectedClient} />;
      case 'performance':
        return <PerformanceReview />;
      case 'improvements':
        return <Improvements />;
      case 'compare':
      default:
        return <CompareCampaigns selectedClient={selectedClient} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedClient={selectedClient}
        onClientChange={setSelectedClient}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {renderTabContent()}
      </main>
    </div>
  );
}

export default App;