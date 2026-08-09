import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User as UserIcon, Sparkles, Copy, Check, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { api } from '../services/api';
import MarkdownRenderer from '../components/MarkdownRenderer';

interface Message {
  role: 'user' | 'model';
  parts: string;
  timestamp?: string;
}

export default function AIChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      parts: "✨ **Welcome to Voyage AI!** I am your personal AI travel architect.\n\nAsk me for custom **day-by-day itineraries**, **budget calculations in ₹ (INR)**, **hotel recommendations**, or **smart packing checklists**!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const starterPrompts = [
    { label: "🏔️ 3-Day Manali Trip & Budget", prompt: "Plan a realistic 3-day weekend trip to Manali with day-by-day plans and estimated budget in INR (₹)." },
    { label: "🌴 4-Day Goa Beach Plan", prompt: "Create a 4-day itinerary for Goa covering top beaches, water sports, historic forts, and seafood restaurants with costs in INR." },
    { label: "⛩️ 7-Day Japan (Tokyo & Kyoto)", prompt: "Design an exciting 7-day itinerary for Tokyo and Kyoto with top sights, food recommendations, and budget tips." },
    { label: "🎒 Smart Travel Packing Checklist", prompt: "Generate a smart travel packing checklist for a 5-day mountain vacation." },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClearChat = () => {
    if (messages.length <= 1) return;
    if (window.confirm("Start a fresh conversation?")) {
      setMessages([
        { 
          role: 'model', 
          parts: "✨ **Chat reset!** Where are you planning your next journey?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim() || isLoading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { role: 'user', parts: promptText, timestamp: timeStr };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build history for backend
      const history = messages
        .filter(m => !m.parts.includes("Welcome to Voyage AI"))
        .map(m => ({ role: m.role, parts: m.parts }));

      const response = await api.post('/ai/chat', { 
        message: userMsg.parts,
        history: history
      });
      
      const aiMsg: Message = { 
        role: 'model', 
        parts: response.data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat Error", error);
      setMessages((prev) => [
        ...prev, 
        { 
          role: 'model', 
          parts: "⚠️ **Connection Notice:** Unable to reach the AI engine. Please verify the backend service is running.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] bg-white/5 border border-white/10 rounded-3xl backdrop-blur-2xl overflow-hidden relative shadow-2xl">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-md z-10">
        <div className="flex items-center gap-3.5">
          <div className="bg-gradient-to-br from-primary to-orange-500 p-2.5 rounded-2xl shadow-lg shadow-primary/20 text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">Voyage AI Travel Concierge</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                LIVE AI
              </span>
            </div>
            <p className="text-xs text-gray-400">Intelligent Day-by-Day Itineraries, Budgets (INR ₹) & Travel Insights</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 1 && (
            <button
              onClick={handleClearChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all border border-white/10 text-xs font-medium"
              title="Clear Conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 z-10">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`p-2.5 rounded-2xl flex-shrink-0 shadow-md ${
                isUser 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gradient-to-br from-primary/30 to-amber-500/20 text-primary border border-primary/30'
              }`}>
                {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] sm:max-w-[78%] rounded-3xl p-5 relative group shadow-xl ${
                isUser 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-sm' 
                  : 'bg-white/10 border border-white/10 text-gray-100 rounded-tl-sm backdrop-blur-md'
              }`}>
                {isUser ? (
                  <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.parts}</p>
                ) : (
                  <div className="prose prose-invert max-w-none">
                    <MarkdownRenderer content={msg.parts} />
                  </div>
                )}

                {/* Footer with Timestamp and Copy */}
                <div className={`flex items-center gap-3 mt-3 pt-2 border-t border-white/10 text-[11px] ${
                  isUser ? 'text-purple-200 justify-end' : 'text-gray-400 justify-between'
                }`}>
                  <span>{msg.timestamp}</span>

                  {!isUser && (
                    <button
                      onClick={() => handleCopy(msg.parts, index)}
                      className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity hover:text-white"
                      title="Copy Itinerary"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="w-3 h-3 text-green-400" />
                          <span className="text-green-400 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-2xl bg-primary/20 text-primary border border-primary/30 flex-shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white/10 border border-white/10 rounded-3xl rounded-tl-sm p-4 flex items-center gap-3 backdrop-blur-md">
              <span className="text-xs text-gray-300 font-medium">Voyage AI is generating your itinerary...</span>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompt Chips */}
      {messages.length <= 2 && !isLoading && (
        <div className="px-6 py-2 bg-black/20 border-t border-white/5 flex gap-2 overflow-x-auto no-scrollbar z-10">
          {starterPrompts.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(chip.prompt)}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-primary/20 hover:border-primary/40 border border-white/10 text-xs font-medium text-gray-300 hover:text-white transition-all shadow-sm flex items-center gap-1.5"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 sm:p-5 border-t border-white/10 bg-black/40 backdrop-blur-xl z-10">
        <form onSubmit={(e) => { e.preventDefault(); handleSendPrompt(input); }} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me: 'Plan 4 days in Goa with budget', 'Best cafes in Tokyo', 'Packing tips'..."
            className="flex-1 bg-white/5 border border-white/15 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white px-6 py-3.5 rounded-2xl shadow-lg shadow-primary/25 transition-all flex items-center gap-2 font-bold"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask AI</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
