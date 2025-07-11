import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { WaitTimeCard } from "./WaitTimeCard";
import { ReportForm } from "./ReportForm";
import { ChatPanel } from "./ChatPanel";
import { HistoryChart } from "./HistoryChart";
import { NotificationSettings } from "./NotificationSettings";

interface DashboardProps {
  isDarkMode: boolean;
}

export function Dashboard({ isDarkMode }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'report' | 'chat' | 'history' | 'notifications'>('dashboard');
  const [selectedCrossing, setSelectedCrossing] = useState<string | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<'ro-bg' | 'bg-ro'>('ro-bg');

  const waitTimes = useQuery(api.borderCrossings.getCurrentWaitTimes);
  const seedData = useMutation(api.seedData.seedBorderCrossings);

  // Seed data on first load if no crossings exist
  useEffect(() => {
    if (waitTimes && waitTimes.length === 0) {
      seedData();
    }
  }, [waitTimes, seedData]);

  const tabs = [
    { id: 'dashboard', label: 'Acasă', icon: '🏠' },
    { id: 'report', label: 'Raportează', icon: '📝' },
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'history', label: 'Istoric', icon: '📊' },
    { id: 'notifications', label: 'Alerte', icon: '🔔' },
  ];

  if (!waitTimes) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className={`animate-spin rounded-full h-8 w-8 border-2 border-t-transparent ${isDarkMode ? 'border-green-400' : 'border-green-600'}`}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Hero Section */}
            <div className="text-center mb-8">
              <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Timpii de așteptare
              </h2>
              <p className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Informații în timp real de la șoferi
              </p>
            </div>

            {/* Wait Time Cards */}
            <div className="grid gap-4">
              {waitTimes.map((crossing) => (
                <WaitTimeCard
                  key={crossing._id}
                  crossing={crossing}
                  isDarkMode={isDarkMode}
                  onSelect={(id) => {
                    setSelectedCrossing(id);
                    setActiveTab('chat');
                  }}
                />
              ))}
            </div>

            {/* Quick Report Button */}
            <div className="fixed bottom-24 right-4 z-40">
              <button
                onClick={() => setActiveTab('report')}
                className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-colors"
              >
                <div className="text-xl">📝</div>
              </button>
            </div>

            {/* Legend */}
            <div className={`mt-8 p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`font-semibold mb-3 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Legenda culorilor
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    ≤ 30 min
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    31-60 min
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {'>'} 60 min
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'} rounded-full`}></div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Fără date
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'report' && (
          <ReportForm 
            borderCrossings={waitTimes} 
            isDarkMode={isDarkMode}
            onSuccess={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'chat' && (
          <ChatPanel 
            borderCrossings={waitTimes}
            selectedCrossing={selectedCrossing}
            selectedDirection={selectedDirection}
            onCrossingChange={setSelectedCrossing}
            onDirectionChange={setSelectedDirection}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === 'history' && (
          <HistoryChart 
            borderCrossings={waitTimes}
            selectedCrossing={selectedCrossing}
            selectedDirection={selectedDirection}
            onCrossingChange={setSelectedCrossing}
            onDirectionChange={setSelectedDirection}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationSettings 
            borderCrossings={waitTimes}
            isDarkMode={isDarkMode}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <div className={`fixed bottom-0 left-0 right-0 ${isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-sm border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} z-50`}>
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex justify-around py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? `${isDarkMode ? 'text-green-400 bg-green-900/20' : 'text-green-600 bg-green-50'}`
                    : `${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                <span className="text-lg mb-1">{tab.icon}</span>
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
