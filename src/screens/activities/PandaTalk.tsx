import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, ArrowLeft, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ai, PANDA_SYSTEM_INSTRUCTION } from '../../lib/ai';
import { DataService } from '../../services/dataService';
import { cn } from '../../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'panda';
  text: string;
}

export const PandaTalk = () => {
  const navigate = useNavigate();
  const user = DataService.getCurrentUser();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'panda', text: `Hi ${user?.full_name.split(' ')[0]}! I'm Panda. I'm here to listen. How are you feeling right now?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: PANDA_SYSTEM_INSTRUCTION,
        },
        history: messages.map(m => ({
          role: m.role === 'panda' ? 'model' : 'user',
          parts: [{ text: m.text }]
        }))
      });

      const response = await chat.sendMessage({ message: input });
      const pandaMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'panda', 
        text: response.text || "I'm here for you." 
      };
      setMessages(prev => [...prev, pandaMsg]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { id: 'err', role: 'panda', text: "I'm sorry, I'm feeling a little sleepy right now. Could you try again?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const wrapUp = async () => {
    const duration = Math.floor((Date.now() - startTime.current) / 1000);
    if (user) {
      await DataService.saveActivityLog({
        user_id: user.user_id,
        result_name: `Panda Talk AI (${messages.length} messages)`,
        duration: duration
      });
    }
    navigate('/activities');
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      {/* Mini Header */}
      <header className="px-4 py-3 flex items-center justify-between bg-white border-b border-gray-100 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={wrapUp} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-400" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-xl">🐼</div>
            <div>
              <h3 className="font-bold text-gray-700 text-sm">Panda Talk</h3>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-[10px] text-gray-400 font-medium">Online</span>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={wrapUp}
          className="px-4 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95"
        >
          Finish
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
              "flex w-full",
              msg.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
              msg.role === 'user' 
                ? "bg-[#FF9EAA] text-white rounded-tr-none" 
                : "bg-white text-gray-700 shadow-sm border border-gray-100 rounded-tl-none"
            )}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100 flex gap-1">
              <span className="w-1 h-1 bg-gray-300 rounded-full animate-bounce" />
              <span className="w-1 h-1 bg-gray-300 rounded-full animate-bounce delay-100" />
              <span className="w-1 h-1 bg-gray-300 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100 pb-10">
        <div className="relative flex items-center bg-gray-50 rounded-full px-4 py-1">
          <input 
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent py-3 outline-none text-sm text-gray-700"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-2 text-[#FF9EAA] hover:bg-gray-200/50 rounded-full transition-all disabled:opacity-30"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
