'use client';

import { useState, useRef, useEffect } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { LogIn, Send, X, Bot, Loader2, Sparkles, Database } from 'lucide-react'; 
import Link from 'next/link';

type ChatBotProps = {
  user: SupabaseUser | null;
  className?: string; 
  onClose?: () => void; 
};

type Message = {
  role: 'user' | 'bot';
  text: string;
};

// Define Model Types
type AIModel = 'rag' | 'generative';

export default function ChatBot({ user, className = '', onClose }: ChatBotProps) {
  // State Models
  const [activeModel, setActiveModel] = useState<AIModel>('rag'); // Default ke RAG

  // State Chat
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Halo! Saya asisten AI GeoValid. Tanyakan apa saja tentang gempa atau sesar.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Fungsi Kirim Pesan (Dual Endpoint)
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userQuestion = input.trim();
    setInput('');
    setIsLoading(true);

    setMessages((prev) => [...prev, { role: 'user', text: userQuestion }]);

    try {
      let endpoint = '';
      let payload = {};

      // LOGIC SWITCH ENDPOINT
      if (activeModel === 'rag') {
        // 1. RAG Model (Context Aware)
        endpoint = 'https://kresa12-geovalid-chatbot-rag.hf.space/chatbot-RAG';
        payload = { question: userQuestion };
      } else {
        // 2. Generative Model (Gemini Base)
        endpoint = 'https://kresa12-geovalid-chatbot-generative.hf.space/chatbot-generative';
        // Asumsi endpoint generative menerima format yang sama { question: ... }
        // Jika endpoint generative butuh key lain (misal 'input' atau 'text'), ganti di sini.
        payload = { question: userQuestion }; 
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Gagal menghubungi server AI');

      const data = await response.json();
      
      // Handle response key (rag biasanya 'answer', generative mungkin beda, kita kasih fallback)
      const botReply = data.answer || data.generated_text || data.response || 'Maaf, saya tidak menemukan jawaban.';

      setMessages((prev) => [...prev, { role: 'bot', text: botReply }]);

    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, { role: 'bot', text: 'Maaf, server sedang sibuk atau tidur. Silakan coba lagi nanti.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className={`flex w-80 shrink-0 flex-col border-l bg-white z-50 md:z-40 ${className}`}>
      
      {/* --- HEADER CHATBOT (MODIFIED) --- */}
      <div className="flex flex-col border-b bg-white">
        <div className="flex h-14 shrink-0 items-center justify-between px-4 pt-2">
          <div className="w-6"></div>
          <h2 className="flex-1 text-center font-bold text-gray-800 flex items-center justify-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" /> GEO ChatBot
          </h2>
          {onClose ? (
            <button onClick={onClose} className="w-6 rounded p-1 text-gray-500 hover:bg-gray-100 lg:hidden">
              <X className="h-5 w-5" />
            </button>
          ) : (<div className="w-6"></div>)}
        </div>

        {/* --- MODEL SWITCHER UI --- */}
        <div className="px-4 pb-3 pt-1">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveModel('rag')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-md transition-all ${
                activeModel === 'rag' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Database className="h-3 w-3" />
              Geo RAG
            </button>
            <button
              onClick={() => setActiveModel('generative')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-md transition-all ${
                activeModel === 'generative' 
                  ? 'bg-white text-purple-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Sparkles className="h-3 w-3" />
              Gemini Base
            </button>
          </div>
        </div>
      </div>

      {user ? (
        <>
          {/* Chat Area */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4 bg-gray-50">
            {/* Indikator Model Aktif (Optional, biar user tau dia lagi pake apa) */}
            <div className="flex justify-center">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                activeModel === 'rag' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'
              }`}>
                Mode: {activeModel === 'rag' ? 'Context Aware (RAG)' : 'Creative (Generative)'}
              </span>
            </div>

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-gray-200 text-gray-500 rounded-2xl rounded-bl-none p-3 text-xs flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {activeModel === 'rag' ? 'Menganalisis data...' : 'Sedang berpikir...'}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex items-center gap-2 border-t p-4 bg-white">
            <input
              type="text"
              placeholder={activeModel === 'rag' ? "Tanya soal data gempa..." : "Tanya apa saja..."}
              className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className={`rounded-full p-2 hover:bg-opacity-10 transition-colors ${
                activeModel === 'rag' ? 'text-blue-600 hover:bg-blue-600' : 'text-purple-600 hover:bg-purple-600'
              } disabled:text-gray-300`}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center p-4 text-center bg-gray-50">
          <LogIn className="h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Silakan <Link href="/auth/login" className="font-medium text-blue-600 hover:underline">login</Link> untuk bertanya pada AI kami.
          </p>
        </div>
      )}
    </aside>
  );
}