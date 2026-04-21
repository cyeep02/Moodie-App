import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, ArrowLeft, Heart, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { ai, PANDA_SYSTEM_INSTRUCTION } from '../../lib/ai';
import { DataService, AlertService } from '../../services/dataService';
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
    
    // Safety check for sensitive words
    if (user) {
      AlertService.checkSensitiveContent(input, user.user_id);
    }

    setInput('');
    setIsTyping(true);

    try {
      console.log("Panda starting to think...");
      
      // Safety check - await it but don't let it crash the chat
      if (user) {
        try {
          await AlertService.checkSensitiveContent(input, user.user_id);
        } catch (e) {
          console.error("Safety log error (non-blocking):", e);
        }
      }

      // Build context
      const contents = messages
        .filter((_, i) => i > 0)
        .map(m => ({
          role: m.role === 'panda' ? 'model' : 'user',
          parts: [{ text: m.text }]
        }));

      contents.push({
        role: 'user',
        parts: [{ text: input }]
      });

      console.log("Sending to AI...", { contentCount: contents.length });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: PANDA_SYSTEM_INSTRUCTION,
        },
        contents: contents
      });

      console.log("AI Response received");

      const pandaMsg: Message = { 
        id: `panda-${Date.now()}`, 
        role: 'panda', 
        text: response.text || "I'm here for you." 
      };
      setMessages(prev => [...prev, pandaMsg]);
    } catch (error: any) {
      console.error("Panda AI Error Details:", error);
      
      let errorText = "I'm sorry, I'm having trouble connecting to my wise panda senses. Could you try sending that again?";
      
      const errorStr = JSON.stringify(error).toLowerCase();
      if (error?.status === 429 || error?.code === 429 || errorStr.includes('429') || errorStr.includes('exhausted') || errorStr.includes('credits') || errorStr.includes('quota')) {
        errorText = "I'm feeling a bit exhausted! It looks like your Gemini API credits are depleted. Please check your billing settings in AI Studio to restore my energy.";
      } else if (errorStr.includes('key') || errorStr.includes('unauthorized') || errorStr.includes('401')) {
        errorText = "I can't seem to find my key! Please check if your GEMINI_API_KEY is correctly set in the Secrets panel.";
      }

      setMessages(prev => [...prev, { 
        id: `err-${Date.now()}`, 
        role: 'panda', 
        text: errorText 
      }]);
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

  const downloadChat = () => {
    const doc = new jsPDF();
    const title = "Panda Talk Conversation";
    const studentName = user?.full_name || 'Student';
    const dateStr = new Date().toLocaleString();

    doc.setFontSize(18);
    doc.text(title, 10, 20);
    
    doc.setFontSize(12);
    doc.text(`Student: ${studentName}`, 10, 30);
    doc.text(`Date: ${dateStr}`, 10, 40);
    doc.line(10, 45, 200, 45);

    let y = 55;
    const margin = 10;
    const pageWidth = doc.internal.pageSize.width;
    const maxWidth = pageWidth - margin * 2;

    messages.forEach((msg) => {
      const role = msg.role === 'user' ? 'You' : 'Panda';
      const text = `${role}: ${msg.text}`;
      
      const lines = doc.splitTextToSize(text, maxWidth);
      
      // Check if we need a new page
      if (y + (lines.length * 7) > 280) {
        doc.addPage();
        y = 20;
      }

      doc.text(lines, margin, y);
      y += (lines.length * 7) + 5;
    });

    const fileName = `Panda_Talk_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  // Input container handling
  const inputContainerRef = useRef<HTMLDivElement>(null);

  const handleInputFocus = () => {
    // Small delay to allow keyboard to appear
    setTimeout(() => {
      inputContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#f8fafc] overscroll-none">
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
        
        <div className="flex items-center gap-2">
          {messages.length > 1 && (
            <button 
              onClick={downloadChat}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-all flex items-center gap-1.5"
              title="Download as PDF"
            >
              <Download size={18} />
              <span className="text-[10px] font-bold uppercase hidden sm:inline">Save PDF</span>
            </button>
          )}

          <button 
            onClick={wrapUp}
            className="px-4 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95"
          >
            Finish
          </button>
        </div>
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
                ? "bg-[#FF8095] text-white rounded-tr-none" 
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
      <div 
        ref={inputContainerRef}
        className="p-4 bg-white border-t border-gray-100 sm:pb-4 pb-8"
      >
        <div className="relative flex items-center bg-gray-50 rounded-full px-4 py-1">
          <input 
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            onFocus={handleInputFocus}
            className="flex-1 bg-transparent py-3 outline-none text-sm text-gray-700"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-2 text-[#FF8095] hover:bg-gray-200/50 rounded-full transition-all disabled:opacity-30"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
