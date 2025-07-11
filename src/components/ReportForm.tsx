import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface ReportFormProps {
  borderCrossings: any[];
  isDarkMode: boolean;
  onSuccess: () => void;
}

export function ReportForm({ borderCrossings, isDarkMode, onSuccess }: ReportFormProps) {
  const [selectedCrossing, setSelectedCrossing] = useState('');
  const [direction, setDirection] = useState<'ro-bg' | 'bg-ro'>('ro-bg');
  const [waitTime, setWaitTime] = useState('');
  const [vehicleType, setVehicleType] = useState<'car' | 'truck' | 'bus' | 'motorcycle'>('car');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportWaitTime = useMutation(api.borderCrossings.reportWaitTime);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCrossing || !waitTime) {
      toast.error('Te rog completează toate câmpurile');
      return;
    }

    const waitTimeMinutes = parseInt(waitTime);
    if (isNaN(waitTimeMinutes) || waitTimeMinutes < 0) {
      toast.error('Te rog introdu un timp valid');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await reportWaitTime({
        borderCrossingId: selectedCrossing as any,
        direction,
        waitTimeMinutes,
        vehicleType,
      });
      
      toast.success('Raportarea a fost trimisă!');
      
      // Reset form
      setSelectedCrossing('');
      setWaitTime('');
      setVehicleType('car');
      
      onSuccess();
    } catch (error) {
      toast.error('Eroare la trimiterea raportării');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <div className="text-4xl mb-4">📝</div>
        <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Raportează timpul
        </h2>
        <p className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Ajută comunitatea cu informații actualizate
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Border Crossing Selection */}
        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Punct de trecere
          </label>
          <select
            value={selectedCrossing}
            onChange={(e) => setSelectedCrossing(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all`}
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

        {/* Direction Selection */}
        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Direcția
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDirection('ro-bg')}
              className={`p-4 rounded-xl border-2 transition-all ${
                direction === 'ro-bg'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : isDarkMode
                  ? 'border-gray-600 bg-gray-700 hover:border-gray-500'
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400'
              }`}
            >
              <div className="text-2xl mb-2">🇷🇴 → 🇧🇬</div>
              <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                România → Bulgaria
              </div>
            </button>
            <button
              type="button"
              onClick={() => setDirection('bg-ro')}
              className={`p-4 rounded-xl border-2 transition-all ${
                direction === 'bg-ro'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : isDarkMode
                  ? 'border-gray-600 bg-gray-700 hover:border-gray-500'
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400'
              }`}
            >
              <div className="text-2xl mb-2">🇧🇬 → 🇷🇴</div>
              <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Bulgaria → România
              </div>
            </button>
          </div>
        </div>

        {/* Wait Time Input */}
        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Timpul de așteptare (minute)
          </label>
          <input
            type="number"
            min="0"
            max="600"
            value={waitTime}
            onChange={(e) => setWaitTime(e.target.value)}
            placeholder="ex: 45"
            className={`w-full px-4 py-3 rounded-xl border text-lg ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all`}
            required
          />
          <p className={`mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Introdu 0 dacă nu există coadă
          </p>
        </div>

        {/* Vehicle Type Selection */}
        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Tipul vehiculului
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'car', label: 'Autoturism', icon: '🚗' },
              { value: 'truck', label: 'Camion', icon: '🚛' },
              { value: 'bus', label: 'Autobus', icon: '🚌' },
              { value: 'motorcycle', label: 'Motocicletă', icon: '🏍️' },
            ].map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setVehicleType(type.value as any)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  vehicleType === type.value
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : isDarkMode
                    ? 'border-gray-600 bg-gray-700 hover:border-gray-500'
                    : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-1">{type.icon}</div>
                <div className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {type.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white shadow-lg'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-white"></div>
              Se trimite...
            </div>
          ) : (
            '📤 Trimite raportarea'
          )}
        </button>

        <p className={`text-xs text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Raportările sunt verificate de comunitate pentru acuratețe
        </p>
      </form>
    </div>
  );
}
