import React, { useState, useRef, useEffect } from 'react';
import { streamCulinaryAdvice } from '../services/geminiService';
import { RESTAURANTS, CITIES } from '../services/mockData';

export const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 'init', role: 'model', text: 'Halo! Saya asisten Makan Ki\'. Mau cari makan enak di mana hari ini?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // --- Logika Autocomplete ---
  useEffect(() => {
    if (!input.trim()) {
      setSuggestions([
        "Rekomendasi kuliner di Makassar",
        "Tempat makan murah di Jakarta",
        "Rawon Setan Surabaya",
        "Gudeg legendaris Yogyakarta"
      ]);
      return;
    }

    const lowerInput = input.toLowerCase();
    const newSuggestions = [];

    // 1. Kota & Makanan
    CITIES.forEach(city => {
        if (city.toLowerCase().includes(lowerInput) || lowerInput.includes(city.toLowerCase())) {
            if (city === 'Surabaya') newSuggestions.push(`Dimana Rawon paling enak di ${city}?`);
            if (city === 'Makassar') newSuggestions.push(`Coto atau Pallubasa di ${city}?`);
            if (city === 'Yogyakarta') newSuggestions.push(`Gudeg Yu Djum vs yang lain?`);
            newSuggestions.push(`Kuliner hidden gem di ${city}`);
        }
    });

    // 2. Nama Restoran
    RESTAURANTS.forEach(r => {
        if (r.name.toLowerCase().includes(lowerInput)) {
            newSuggestions.push(`Review jujur ${r.name}`);
            newSuggestions.push(`Berapa harga menu di ${r.name}?`);
        }
    });

    // 3. Kategori/Fasilitas
    if ('pedas'.includes(lowerInput)) newSuggestions.push('Rekomendasi makanan super pedas');
    if ('murah'.includes(lowerInput)) newSuggestions.push('Tempat makan murah meriah di sekitar sini');
    if ('wifi'.includes(lowerInput)) newSuggestions.push('Restoran dengan WiFi kencang');

    const uniqueSuggestions = Array.from(new Set(newSuggestions)).slice(0, 4);
    
    if (uniqueSuggestions.length === 0) {
        uniqueSuggestions.push(`Cari "${input}" di Bandung`);
        uniqueSuggestions.push(`Apakah "${input}" halal?`);
    }

    setSuggestions(uniqueSuggestions);
  }, [input]);

  const handleSubmit = async (e, manualText) => {
    if (e) e.preventDefault();
    const textToSend = manualText || input;

    if (!textToSend.trim() || isLoading) return;

    const userMsg = { id: Date.now().toString(), role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setShowSuggestions(false);
    setIsLoading(true);

    try {
      const stream = await streamCulinaryAdvice(userMsg.text);
      const botMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '' }]);

      for await (const chunk of stream) {
        const contentText = chunk.text ? chunk.text() : (chunk.candidates?.[0]?.content?.parts?.[0]?.text || '');
        if (contentText) {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === botMsgId ? { ...msg, text: msg.text + contentText } : msg
            )
          );
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), role: 'model', text: 'Maaf, koneksi terganggu. Coba lagi nanti ya.', isError: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button (Tetap di pojok kanan bawah) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-60 bg-brand-600 hover:bg-brand-500 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center border-4 border-brand-100"
        aria-label="Chat Assistant"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        ) : (
          <div className="relative">
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-secondary-500 rounded-full animate-ping"></span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-secondary-500 rounded-full"></span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          </div>
        )}
      </button>

      {/* Overlay Gelap untuk Mobile (Opsional, agar fokus) */}
      {isOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-40 sm:hidden backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Chat Window Container */}
      {/* PERUBAHAN UTAMA DI SINI: Class responsif untuk Mobile vs Desktop */}
      <div 
        className={`fixed z-50 bg-white shadow-2xl flex flex-col transition-all duration-300 ease-in-out
            ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}
            
            /* Tampilan Mobile: Full width, nempel di bawah, tinggi 85% layar, sudut atas rounded */
            bottom-0 left-0 right-0 w-full h-[85vh] rounded-t-2xl border-t border-gray-200
            
            /* Tampilan Desktop (sm ke atas): Floating card di kanan bawah, lebar fixed, tinggi fixed */
            sm:bottom-24 sm:right-6 sm:w-96 sm:h-[500px] sm:rounded-2xl sm:border sm:translate-y-0 sm:left-auto
            ${!isOpen && 'sm:hidden'} /* Sembunyikan total di desktop jika close */
        `}
      >
          {/* Header Chat */}
          <div className="bg-brand-600 p-4 text-white flex items-center justify-between shadow-md z-10 rounded-t-2xl">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl shadow-inner">
                🤖
                </div>
                <div>
                <h3 className="font-bold text-sm">Asisten Makan Ki'</h3>
                <p className="text-xs text-brand-100 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span> Online • Gemini AI
                </p>
                </div>
            </div>
            {/* Tombol Close (Penting untuk Mobile) */}
            <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors focus:outline-none"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Area Pesan */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 relative custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white rounded-br-none shadow-md'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none'
                  } ${msg.isError ? 'bg-red-100 text-red-600 border-red-200' : ''}`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 flex gap-1 items-center">
                  <span className="text-xs text-gray-400 mr-2">Sedang mengetik</span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms'}}></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms'}}></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms'}}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Area Input & Autocomplete */}
          <div className="relative">
             {/* Autocomplete */}
             {showSuggestions && (
                 <div className="absolute bottom-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg max-h-48 overflow-y-auto z-20">
                     <div className="p-2 bg-gray-50 text-xs font-bold text-gray-500 border-b border-gray-100">
                         {input ? 'Saran Pencarian' : 'Pertanyaan Populer'}
                     </div>
                     <ul>
                         {suggestions.map((s, idx) => (
                             <li key={idx}>
                                 <button
                                     onClick={() => handleSubmit(undefined, s)}
                                     className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors border-b border-gray-50 flex items-center gap-2"
                                 >
                                     <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                     {s}
                                 </button>
                             </li>
                         ))}
                     </ul>
                 </div>
             )}

            <form onSubmit={(e) => handleSubmit(e)} className="p-3 bg-white border-t border-gray-200 flex gap-2 relative z-30 pb-safe">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={input}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Tanya rekomendasi..."
                        className="w-full bg-gray-100 border-0 rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none focus:bg-white transition-all"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-brand-600 text-white p-3 rounded-full hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 shadow-md shrink-0"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
            </form>
          </div>
      </div>
    </>
  );
};