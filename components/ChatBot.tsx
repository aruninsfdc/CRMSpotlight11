
import React, { useState, useRef, useEffect } from 'react';
import { Message, NewsItem } from '../types';
import { chatWithAssistant } from '../services/geminiService';

interface ChatBotProps {
  currentNews: NewsItem[];
}

const ChatBot: React.FC<ChatBotProps> = ({ currentNews }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'Hello! I am your CRM Intelligence assistant. How can I help you analyze today\'s market?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await chatWithAssistant(messages, input, currentNews);
      const modelMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: response || 'I am sorry, I could not process that.', timestamp: new Date() };
      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { id: 'err', role: 'model', text: 'My neural link is currently unstable. Please try again.', timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-indigo-600 p-4 flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold">Spotlight Assistant</h3>
                <p className="text-[10px] text-indigo-100 font-medium uppercase tracking-widest">Powered by Gemini 3 Pro</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none flex space-x-1 items-center shadow-sm">
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Ask about CRM trends..."
              className="flex-grow text-sm border-none bg-slate-100 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isTyping}
              className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-100"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-700 to-indigo-500"></div>
        <svg className={`w-7 h-7 relative z-10 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          )}
        </svg>
      </button>
    </div>
  );
};

export default ChatBot;
