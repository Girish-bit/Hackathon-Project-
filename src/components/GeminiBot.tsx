import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, X, MessageSquare, Sparkles, Terminal } from 'lucide-react';
import { chatWithGemini } from '../services/geminiService';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export default function GeminiBot() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showWelcome, setShowWelcome] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('gemini_welcome_seen');
    if (!hasSeenWelcome) {
      setTimeout(() => setShowWelcome(true), 2000);
    }
  }, []);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));
      
      const response = await chatWithGemini(input, history);
      
      const botMessage: Message = {
        role: 'model',
        content: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'model',
        content: "Neural link disruption detected. Could not process request.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const closeWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('gemini_welcome_seen', 'true');
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {showWelcome && !isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.5, x: 20 }}
            className="absolute bottom-20 right-0 w-64 glass-card p-4 border-brand-primary/30"
          >
            <button 
              onClick={closeWelcome}
              className="absolute top-2 right-2 text-slate-500 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="flex gap-3 items-center mb-2">
              <Sparkles className="w-4 h-4 text-brand-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Neural Assistant</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              If you have any questions, ask with Gemini. I'm here to assist with threat forensics.
            </p>
          </motion.div>
        )}

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-20 right-0 w-[400px] h-[550px] glass-card flex flex-col overflow-hidden border-brand-primary/20 shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-brand-primary/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-tighter text-white">CYBER SHIELD AI</div>
                  <div className="text-[10px] text-brand-primary font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                    NEURAL LINK ESTABLISHED
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
            >
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <Terminal className="w-12 h-12 mb-4" />
                  <p className="text-xs font-mono">NEURAL_TERMINAL_IDLE</p>
                  <p className="text-[10px] mt-1">Awaiting forensic query...</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={cn(
                  "flex flex-col max-w-[85%]",
                  m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                )}>
                  <div className={cn(
                    "p-3 rounded-2xl text-xs leading-relaxed",
                    m.role === 'user' 
                      ? "bg-brand-primary text-white rounded-br-none" 
                      : "bg-white/5 border border-white/10 text-slate-300 rounded-bl-none"
                  )}>
                    {m.content}
                  </div>
                  <span className="text-[9px] mt-1 text-slate-500 font-mono">{m.timestamp}</span>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/5 bg-black/20">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Analyze neural vector..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-primary/50 transition-colors pr-12"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1.5 p-2 text-brand-primary hover:bg-brand-primary/20 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setIsOpen(!isOpen);
          if (showWelcome) closeWelcome();
        }}
        className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-colors relative",
          isOpen ? "bg-slate-800 text-white" : "bg-brand-primary text-white neon-shadow"
        )}
      >
        <div className="absolute -inset-1 blur-lg opacity-30 bg-brand-primary animate-pulse" />
        {isOpen ? <MessageSquare className="w-6 h-6 relative z-10" /> : <Bot className="w-6 h-6 relative z-10" />}
      </motion.button>
    </div>
  );
}
