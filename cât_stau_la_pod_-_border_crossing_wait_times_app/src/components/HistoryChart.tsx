import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

interface HistoryChartProps {
  borderCrossings: any[];
  selectedCrossing: string | null;
  selectedDirection: 'ro-bg' | 'bg-ro';
  onCrossingChange: (id: string | null) => void;
  onDirectionChange: (direction: 'ro-bg' | 'bg-ro') => void;
  isDarkMode: boolean;
}

export function HistoryChart({ 
  borderCrossings, 
  selectedCrossing, 
  selectedDirection, 
  onCrossingChange, 
  onDirectionChange, 
  isDarkMode 
}: HistoryChartProps) {
  const [timeRange, setTimeRange] = useState<number>(24);

  const history = useQuery(
    api.borderCrossings.getWaitTimeHistory,
    selectedCrossing ? {
      borderCrossingId: selectedCrossing as any,
      direction: selectedDirection,
      hours: timeRange,
    } : "skip"
  );

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ro-RO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getWaitTimeColor = (minutes: number) => {
    if (minutes <= 30) return 'text-green-600';
    if (minutes <= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBarColor = (minutes: number) => {
    if (minutes <= 30) return 'bg-green-500';
    if (minutes <= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const maxWaitTime = history ? Math.max(...history.map(h => h.waitTimeMinutes), 60) : 60;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">📊</div>
        <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Istoric
        </h2>
        <p className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Analizează tendințele și planifică călătoria
        </p>
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-2xl border mb-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="space-y-4">
          {/* Border Crossing Selection */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Punct de trecere
            </label>
            <select
              value={selectedCrossing || ''}
              onChange={(e) => onCrossingChange(e.target.value || null)}
              className={`w-full px-3 py-2 rounded-xl border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none`}
            >
              <option value="">Selectează punctul</option>
              {borderCrossings.map((crossing) => (
                <option key={crossing._id} value={crossing._id}>
                  {crossing.nameRo}
                </option>
              ))}
            </select>
          </div>

          {/* Direction and Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Direcția
              </label>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => onDirectionChange('ro-bg')}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                    selectedDirection === 'ro-bg'
                      ? 'bg-green-600 text-white'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🇷🇴→🇧🇬
                </button>
                <button
                  onClick={() => onDirectionChange('bg-ro')}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                    selectedDirection === 'bg-ro'
                      ? 'bg-green-600 text-white'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🇧🇬→🇷🇴
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Perioada
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className={`w-full px-3 py-2 rounded-xl border text-sm ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none`}
              >
                <option value={6}>6 ore</option>
                <option value={12}>12 ore</option>
                <option value={24}>24 ore</option>
                <option value={72}>3 zile</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      {!selectedCrossing ? (
        <div className={`text-center py-12 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="text-4xl mb-4">📈</div>
          <p className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Selectează un punct pentru istoric
          </p>
        </div>
      ) : !history ? (
        <div className="flex justify-center items-center py-12">
          <div className={`animate-spin rounded-full h-8 w-8 border-2 border-t-transparent ${isDarkMode ? 'border-green-400' : 'border-green-600'}`}></div>
        </div>
      ) : history.length === 0 ? (
        <div className={`text-center py-12 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="text-4xl mb-4">📊</div>
          <p className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Nu există date pentru perioada selectată
          </p>
        </div>
      ) : (
        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          {/* Chart Header */}
          <div className="mb-4">
            <h3 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {borderCrossings.find(c => c._id === selectedCrossing)?.nameRo}
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {selectedDirection === 'ro-bg' ? '🇷🇴 → 🇧🇬' : '🇧🇬 → 🇷🇴'} • {history.length} raportări
            </p>
          </div>

          {/* Simple Bar Chart */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.slice().reverse().slice(0, 20).map((report, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className={`text-xs w-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {formatTime(report.reportedAt)}
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div className={`h-4 rounded-full ${getBarColor(report.waitTimeMinutes)}`} 
                       style={{ width: `${Math.max((report.waitTimeMinutes / maxWaitTime) * 100, 2)}%`, minWidth: '8px' }}>
                  </div>
                  <span className={`text-xs font-medium ${getWaitTimeColor(report.waitTimeMinutes)} min-w-[3rem]`}>
                    {report.waitTimeMinutes} min
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Statistics */}
          <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className={`text-lg font-bold ${getWaitTimeColor(Math.min(...history.map(h => h.waitTimeMinutes)))}`}>
                  {Math.min(...history.map(h => h.waitTimeMinutes))}
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Min
                </div>
              </div>
              <div>
                <div className={`text-lg font-bold ${getWaitTimeColor(Math.round(history.reduce((sum, h) => sum + h.waitTimeMinutes, 0) / history.length))}`}>
                  {Math.round(history.reduce((sum, h) => sum + h.waitTimeMinutes, 0) / history.length)}
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Medie
                </div>
              </div>
              <div>
                <div className={`text-lg font-bold ${getWaitTimeColor(Math.max(...history.map(h => h.waitTimeMinutes)))}`}>
                  {Math.max(...history.map(h => h.waitTimeMinutes))}
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Max
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
