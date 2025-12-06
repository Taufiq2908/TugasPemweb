import React, { useState, useRef, useEffect } from 'react';
import { streamCulinaryAdvice } from '../services/geminiService';

export const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 'init', role: 'model', text: 'Halo! Saya asisten Makan Ki\'. Mau cari makan enak di mana hari ini?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const stream = await streamCulinaryAdvice(userMsg.text);
      
      const botMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '' }]);

      for await (const chunk of stream) {
        // Adaptasi jika response dari Google AI
        const contentText = chunk.text ? (typeof chunk.text === 'function' ? chunk.text() : chunk.text) : '';
        
        if (contentText) {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === botMsgId 
                ? { ...msg, text: msg.text + contentText } 
                : msg
            )
          );
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        text: 'Maaf, saya sedang mengalami gangguan koneksi. Coba lagi nanti ya.', 
        isError: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-brand-600 hover:bg-brand-500 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
        aria-label="Chat Assistant"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col h-[500px] animate-fade-in-up">
          <div className="bg-brand-600 p-4 text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              🤖
            </div>
            <div>
              <h3 className="font-bold text-sm">Asisten Kuliner</h3>
              <p className="text-xs text-brand-100">Powered by Gemini AI</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-brand-500 text-white rounded-br-none'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none'
                  } ${msg.isError ? 'bg-red-100 text-red-600 border-red-200' : ''}`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms'}}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms'}}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms'}}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Cari rekomendasi..."
              className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-brand-600 text-white p-2 rounded-full hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
};