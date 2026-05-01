'use client';
import { useState, useRef, useEffect } from 'react';
import { createRequest } from './actions';
import { Mic, Milk, Coffee, Wheat, Carrot, Droplets, UtensilsCrossed, X, Send } from 'lucide-react';

const QUICK_ITEMS = [
  { name: 'Milk/Doodh', icon: Milk },
  { name: 'Sugar/Cheeni', icon: Coffee },
  { name: 'Atta', icon: Wheat },
  { name: 'Veggies/Sabzi', icon: Carrot },
  { name: 'Detergent/Surf', icon: Droplets },
  { name: 'Salt/Namak', icon: UtensilsCrossed },
];

export default function VoiceRequestInput() {
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingItems, setPendingItems] = useState<string[]>([]);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = 'hi-IN';
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setIsListening(false);
          
          // Parse Hindi transcript
          const parsedItems = transcript
            .split(/(?:\s+aur\s+|\s+and\s+|,|\.)/gi)
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0);

          setPendingItems((prev) => [...prev, ...parsedItems]);
          setFeedback('Added to staging list!');
          setTimeout(() => setFeedback(null), 3000);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          setFeedback('Could not understand. Please try again.');
          setTimeout(() => setFeedback(null), 3000);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const handleQuickAdd = (name: string) => {
    setPendingItems((prev) => [...prev, name]);
  };

  const handleRemovePending = (index: number) => {
    setPendingItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePlaceRequest = async () => {
    if (pendingItems.length === 0) return;
    setLoading(true);
    setFeedback('Placing requests...');

    try {
      await Promise.all(
        pendingItems.map((item) => {
          const formData = new FormData();
          formData.append('raw_text', item);
          return createRequest(formData);
        })
      );
      setPendingItems([]);
      setFeedback('All items requested successfully!');
    } catch (e) {
      setFeedback('An error occurred while placing requests.');
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (!recognitionRef.current) {
        setFeedback('Voice input not supported in this browser.');
        setTimeout(() => setFeedback(null), 3000);
        return;
      }
      setFeedback('Listening... Speak now.');
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
      <div className="p-4 bg-blue-50 border-b border-blue-100">
        <h2 className="text-lg font-semibold text-blue-900 text-center">Quick Add Items</h2>
      </div>
      
      <div className="p-4">
        {/* Visual Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {QUICK_ITEMS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickAdd(item.name)}
              disabled={loading || isListening}
              className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors active:bg-blue-100 disabled:opacity-50"
            >
              <item.icon className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-800 text-center">{item.name}</span>
            </button>
          ))}
        </div>

        {/* Voice Input */}
        <div className="flex flex-col items-center justify-center border-t border-gray-200 pt-8 pb-4">
          <p className="text-sm text-gray-500 mb-4 font-medium">Or tap mic and speak in Hindi</p>
          <button
            onClick={handleMicClick}
            disabled={loading}
            className={`relative flex items-center justify-center h-20 w-20 rounded-full transition-all duration-300 ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 scale-110 shadow-lg shadow-red-200 animate-pulse' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:scale-105 disabled:opacity-50'
            }`}
          >
            {isListening && (
              <span className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-75"></span>
            )}
            <Mic className="h-10 w-10 text-white relative z-10" />
          </button>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div className={`mt-4 p-3 rounded-lg text-center text-sm font-medium transition-opacity duration-300 ${
            feedback.includes('Error') || feedback.includes('not supported') || feedback.includes('Could not')
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {feedback}
          </div>
        )}

        {/* Staging List */}
        {pendingItems.length > 0 && (
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-md font-medium text-gray-900 mb-4">Pending Requests</h3>
            <ul className="space-y-2 mb-6">
              {pendingItems.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded-md border border-gray-200">
                  <span className="text-gray-800">{item}</span>
                  <button 
                    onClick={() => handleRemovePending(idx)}
                    disabled={loading}
                    className="text-gray-400 hover:text-red-600 p-1 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={handlePlaceRequest}
              disabled={loading}
              className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
            >
              <Send className="h-5 w-5 mr-2" />
              {loading ? 'Submitting...' : 'Place Request'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
