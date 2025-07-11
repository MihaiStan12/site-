import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface NotificationSettingsProps {
  borderCrossings: any[];
  isDarkMode: boolean;
}

export function NotificationSettings({ borderCrossings, isDarkMode }: NotificationSettingsProps) {
  const [selectedCrossing, setSelectedCrossing] = useState('');
  const [direction, setDirection] = useState<'ro-bg' | 'bg-ro'>('ro-bg');
  const [threshold, setThreshold] = useState('30');

  const notifications = useQuery(api.notifications.getUserNotifications);
  const setNotification = useMutation(api.notifications.setNotification);
  const removeNotification = useMutation(api.notifications.removeNotification);

  const handleAddNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCrossing || !threshold) {
      toast.error('Te rog completează toate câmpurile');
      return;
    }

    const thresholdMinutes = parseInt(threshold);
    if (isNaN(thresholdMinutes) || thresholdMinutes < 0) {
      toast.error('Te rog introdu un timp valid');
      return;
    }

    try {
      await setNotification({
        borderCrossingId: selectedCrossing as any,
        direction,
        thresholdMinutes,
        isActive: true,
      });
      
      toast.success('Notificarea a fost adăugată!');
      setSelectedCrossing('');
      setThreshold('30');
    } catch (error) {
      toast.error('Eroare la adăugarea notificării');
      console.error(error);
    }
  };

  const handleToggleNotification = async (notificationId: string, isActive: boolean) => {
    try {
      const notification = notifications?.find(n => n._id === notificationId);
      if (!notification) return;

      await setNotification({
        borderCrossingId: notification.borderCrossingId,
        direction: notification.direction,
        thresholdMinutes: notification.thresholdMinutes,
        isActive: !isActive,
      });
      
      toast.success(isActive ? 'Notificarea a fost dezactivată' : 'Notificarea a fost activată');
    } catch (error) {
      toast.error('Eroare la actualizarea notificării');
      console.error(error);
    }
  };

  const handleRemoveNotification = async (notificationId: string) => {
    try {
      await removeNotification({ notificationId: notificationId as any });
      toast.success('Notificarea a fost ștearsă');
    } catch (error) {
      toast.error('Eroare la ștergerea notificării');
      console.error(error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">🔔</div>
        <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Alerte
        </h2>
        <p className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Primește notificări când timpii scad
        </p>
      </div>

      {/* Add New Notification */}
      <div className={`p-4 rounded-2xl border mb-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-base font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Adaugă alertă nouă
        </h3>
        
        <form onSubmit={handleAddNotification} className="space-y-4">
          {/* Border Crossing Selection */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Punct de trecere
            </label>
            <select
              value={selectedCrossing}
              onChange={(e) => setSelectedCrossing(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none`}
              required
            >
              <option value="">Selectează punctul</option>
              {borderCrossings.map((crossing) => (
                <option key={crossing._id} value={crossing._id}>
                  {crossing.nameRo}
                </option>
              ))}
            </select>
          </div>

          {/* Direction and Threshold */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Direcția
              </label>
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setDirection('ro-bg')}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                    direction === 'ro-bg'
                      ? 'bg-green-600 text-white'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🇷🇴→🇧🇬
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('bg-ro')}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                    direction === 'bg-ro'
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
                Prag (minute)
              </label>
              <input
                type="number"
                min="0"
                max="300"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="30"
                className={`w-full px-3 py-2 rounded-xl border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none`}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
          >
            🔔 Adaugă alertă
          </button>
        </form>
      </div>

      {/* Existing Notifications */}
      <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-base font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Alertele tale
        </h3>

        {!notifications ? (
          <div className="flex justify-center py-8">
            <div className={`animate-spin rounded-full h-6 w-6 border-2 border-t-transparent ${isDarkMode ? 'border-green-400' : 'border-green-600'}`}></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔔</div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Nu ai alerte configurate încă
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-3 rounded-xl border ${
                  notification.isActive
                    ? isDarkMode ? 'bg-green-900/20 border-green-800/30' : 'bg-green-50 border-green-200'
                    : isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {notification.borderCrossing?.nameRo}
                    </h4>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {notification.direction === 'ro-bg' ? '🇷🇴 → 🇧🇬' : '🇧🇬 → 🇷🇴'} • 
                      Sub {notification.thresholdMinutes} min
                    </p>
                    <div className={`mt-1 text-xs ${
                      notification.isActive 
                        ? 'text-green-600' 
                        : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {notification.isActive ? '✅ Activă' : '⏸️ Dezactivată'}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-3">
                    <button
                      onClick={() => handleToggleNotification(notification._id, notification.isActive)}
                      className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                        notification.isActive
                          ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {notification.isActive ? 'Pauză' : 'Activează'}
                    </button>
                    <button
                      onClick={() => handleRemoveNotification(notification._id)}
                      className="px-2 py-1 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
                    >
                      Șterge
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className={`mt-6 p-4 rounded-2xl ${isDarkMode ? 'bg-blue-900/20 border border-blue-800/30' : 'bg-blue-50 border border-blue-200'}`}>
        <div className="flex items-start gap-3">
          <div className="text-blue-500 text-xl">ℹ️</div>
          <div>
            <h4 className={`font-medium mb-1 text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
              Cum funcționează?
            </h4>
            <p className={`text-xs ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
              Vei primi o notificare când timpul de așteptare scade sub pragul stabilit. 
              Verificăm la fiecare 5 minute.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
