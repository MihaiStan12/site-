interface WaitTimeCardProps {
  crossing: any;
  isDarkMode: boolean;
  onSelect: (id: string) => void;
}

export function WaitTimeCard({ crossing, isDarkMode, onSelect }: WaitTimeCardProps) {
  const getWaitTimeColor = (minutes: number | null) => {
    if (minutes === null) return isDarkMode ? 'text-gray-400' : 'text-gray-500';
    if (minutes <= 30) return 'text-green-600';
    if (minutes <= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getWaitTimeBg = (minutes: number | null) => {
    if (minutes === null) return isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    if (minutes <= 30) return isDarkMode ? 'bg-green-900/10 border-green-800/30' : 'bg-green-50 border-green-200';
    if (minutes <= 60) return isDarkMode ? 'bg-yellow-900/10 border-yellow-800/30' : 'bg-yellow-50 border-yellow-200';
    return isDarkMode ? 'bg-red-900/10 border-red-800/30' : 'bg-red-50 border-red-200';
  };

  const formatTime = (minutes: number | null) => {
    if (minutes === null) return 'Fără date';
    if (minutes === 0) return 'Fără coadă';
    return `${minutes} min`;
  };

  const getLastUpdated = (timestamp: number | null) => {
    if (!timestamp) return 'Niciodată';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Acum';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}z`;
  };

  const maxWaitTime = Math.max(crossing.waitTimes['ro-bg'] || 0, crossing.waitTimes['bg-ro'] || 0);

  return (
    <div 
      className={`rounded-2xl border p-6 cursor-pointer transition-all hover:shadow-md active:scale-[0.98] ${getWaitTimeBg(maxWaitTime)}`}
      onClick={() => onSelect(crossing._id)}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className={`font-bold text-lg leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {crossing.nameRo}
          </h3>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {crossing.reportCount} raportări recente
          </p>
        </div>
        <div className="text-right">
          <div className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
            {getLastUpdated(crossing.lastUpdated)}
          </div>
        </div>
      </div>

      {/* Wait Times */}
      <div className="space-y-4">
        {/* România → Bulgaria */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-lg">🇷🇴</span>
            <span className="text-sm">→</span>
            <span className="text-lg">🇧🇬</span>
          </div>
          <div className="text-right">
            <div className={`font-bold text-xl ${getWaitTimeColor(crossing.waitTimes['ro-bg'])}`}>
              {formatTime(crossing.waitTimes['ro-bg'])}
            </div>
          </div>
        </div>

        {/* Bulgaria → România */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-lg">🇧🇬</span>
            <span className="text-sm">→</span>
            <span className="text-lg">🇷🇴</span>
          </div>
          <div className="text-right">
            <div className={`font-bold text-xl ${getWaitTimeColor(crossing.waitTimes['bg-ro'])}`}>
              {formatTime(crossing.waitTimes['bg-ro'])}
            </div>
          </div>
        </div>
      </div>

      {/* Tap indicator */}
      <div className="mt-4 pt-4 border-t border-gray-200/50">
        <div className="flex justify-center">
          <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Apasă pentru chat live
          </span>
        </div>
      </div>
    </div>
  );
}
