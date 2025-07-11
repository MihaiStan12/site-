import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface ChatPanelProps {
  borderCrossings: any[];
  selectedCrossing: string | null;
  selectedDirection: 'ro-bg' | 'bg-ro';
  onCrossingChange: (id: string | null) => void;
  onDirectionChange: (direction: 'ro-bg' | 'bg-ro') => void;
  isDarkMode: boolean;
}

export function ChatPanel({ 
  borderCrossings, 
  selectedCrossing, 
  selectedDirection, 
  onCrossingChange, 
  onDirectionChange, 
  isDarkMode 
}: ChatPanelProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = useQuery(api.chat.getMessages, {
    borderCrossingId: selectedCrossing as any,
    direction: selectedDirection,
    limit: 100,
  });

  const sendMessage = useMutation(api.chat.sendMessage);
  const sendQuickStatus = useMutation(api.chat.sendQuickStatus);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    if (!selectedCrossing) {
      toast.error('Selectează un punct de trecere');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await sendMessage({
        message: message.trim(),
        borderCrossingId: selectedCrossing as any,
        direction: selectedDirection,
        messageType: 'text',
      });
      
      setMessage('');
    } catch (error) {
      toast.error('Eroare la trimiterea mesajului');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatus = async (status: 'in_queue' | 'crossed' | 'blocked' | 'moving_fast' | 'moving_slow' | 'how_long') => {
    if (!selectedCrossing) {
      toast.error('Selectează un punct de trecere');
      return;
    }

    try {
      await sendQuickStatus({
        borderCrossingId: selectedCrossing as any,
        direction: selectedDirection,
        status,
      });
    } catch (error) {
      toast.error('Eroare la trimiterea statusului');
      console.error(error);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ro-RO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageStyle = (messageType: string, status?: string) => {
    if (messageType === 'status') {
      switch (status) {
        case 'in_queue':
          return isDarkMode ? 'bg-yellow-900/20 border-yellow-700/30' : 'bg-yellow-50 border-yellow-200';
        case 'crossed':
          return isDarkMode ? 'bg-green-900/20 border-green-700/30' : 'bg-green-50 border-green-200';
        case 'blocked':
          return isDarkMode ? 'bg-red-900/20 border-red-700/30' : 'bg-red-50 border-red-200';
        case 'moving_fast':
          return isDarkMode ? 'bg-teal-900/20 border-teal-700/30' : 'bg-teal-50 border-teal-200';
        case 'moving_slow':
          return isDarkMode ? 'bg-orange-900/20 border-orange-700/30' : 'bg-orange-50 border-orange-200';
        case 'how_long':
          return isDarkMode ? 'bg-blue-900/20 border-blue-700/30' : 'bg-blue-50 border-blue-200';
        default:
          return isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200';
      }
    }
    return isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">💬</div>
        <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Chat Live
        </h2>
        <p className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Comunică în timp real cu alți șoferi
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
              <option value="">Toate punctele</option>
              {borderCrossings.map((crossing) => (
                <option key={crossing._id} value={crossing._id}>
                  {crossing.nameRo}
                </option>
              ))}
            </select>
          </div>

          {/* Direction Selection */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Direcția
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onDirectionChange('ro-bg')}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedDirection === 'ro-bg'
                    ? 'bg-green-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🇷🇴 → 🇧🇬
              </button>
              <button
                onClick={() => onDirectionChange('bg-ro')}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedDirection === 'bg-ro'
                    ? 'bg-green-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🇧🇬 → 🇷🇴
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Status Buttons */}
      {selectedCrossing && (
        <div className={`p-4 rounded-2xl border mb-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`font-semibold mb-3 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Status rapid
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickStatus('in_queue')}
              className="px-3 py-2 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-colors text-sm font-medium"
            >
              🚗 În coadă
            </button>
            <button
              onClick={() => handleQuickStatus('crossed')}
              className="px-3 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-medium"
            >
              ✅ Am trecut
            </button>
            <button
              onClick={() => handleQuickStatus('blocked')}
              className="px-3 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-medium"
            >
              🚫 Blocat
            </button>
            <button
              onClick={() => handleQuickStatus('moving_fast')}
              className="px-3 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors text-sm font-medium"
            >
              💨 Se mișcă repede
            </button>
            <button
              onClick={() => handleQuickStatus('moving_slow')}
              className="px-3 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors text-sm font-medium"
            >
              🐌 Se mișcă încet
            </button>
            <button
              onClick={() => handleQuickStatus('how_long')}
              className="px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              ❓ Cât mai durează?
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className={`border rounded-2xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="h-80 overflow-y-auto p-4 space-y-3">
          {!messages ? (
            <div className="flex justify-center items-center h-full">
              <div className={`animate-spin rounded-full h-6 w-6 border-2 border-t-transparent ${isDarkMode ? 'border-green-400' : 'border-green-600'}`}></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 h-full flex items-center justify-center">
              <div>
                <div className="text-4xl mb-2">💬</div>
                <p className="text-sm">Niciun mesaj încă. Fii primul!</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`p-3 rounded-xl border ${getMessageStyle(msg.messageType, msg.status)}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`font-medium text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {msg.user?.name || 'Utilizator anonim'}
                  </span>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatTime(msg.sentAt)}
                  </span>
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {msg.message}
                </p>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className={`border-t p-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Scrie un mesaj..."
              className={`flex-1 px-4 py-3 rounded-xl border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none`}
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting || !message.trim() || !selectedCrossing}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                isSubmitting || !message.trim() || !selectedCrossing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white'
              }`}
            >
              {isSubmitting ? '...' : 'Trimite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
