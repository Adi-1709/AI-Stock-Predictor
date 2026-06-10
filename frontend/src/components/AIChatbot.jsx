import React, { useState, useRef, useEffect } from 'react';
import { useStock } from '../context/StockContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMessageSquare,
  FiX,
  FiSend,
  FiMic,
  FiVolume2,
  FiVolumeX,
  FiCpu,
  FiUser,
  FiArrowRight,
  FiCornerDownLeft
} from 'react-icons/fi';

export default function AIChatbot() {
  const { sendChatMessage } = useStock();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "### 💬 AI Investment Assistant\n\nHello! I am your AI stock companion. I evaluate live technical indicators, RandomForest model forecasts, and financial news sentiment.\n\nAsk me questions like:\n- *\"Should I buy RELIANCE.NS?\"*\n- *\"Compare Apple and Tesla\"*\n- *\"Explain the indicators of AAPL\"*\n- *\"Which Indian stocks are bullish?\"*",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingId, setIsSpeakingId] = useState(null);

  const messagesEndRef = useRef(null);
  const speechUtteranceRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    // Add user message
    const userMsg = {
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    
    setIsLoading(true);

    try {
      const res = await sendChatMessage(query);
      const aiMsg = {
        sender: 'ai',
        text: res.answer || "I encountered an error compiling stock metrics. Please retry in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg = {
        sender: 'ai',
        text: "Sorry, I am unable to connect to the quant API terminal at this time. Running local diagnostic backups failed.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── BONUS: VOICE INPUT (Speech Recognition) ──
  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      if (window.speechSynthesis) window.speechSynthesis.cancel(); // Stop talking when user talks
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const resultText = event.results[0][0].transcript;
      setInputText(resultText);
      // Automatically send
      setTimeout(() => {
        handleSendMessage(resultText);
      }, 500);
    };

    recognition.start();
  };

  // ── BONUS: TEXT-TO-SPEECH SYNTHESIS ──
  const speakText = (text, msgIndex) => {
    if (!window.speechSynthesis) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isSpeakingId === msgIndex) {
      window.speechSynthesis.cancel();
      setIsSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel(); // Stop current speaking

    // Strip markdown formatting out of spoken text
    const cleanText = text
      .replace(/###/g, '')
      .replace(/####/g, '')
      .replace(/\*/g, '')
      .replace(/\|/g, '')
      .replace(/- /g, '')
      .replace(/\[.*\]\(.*\)/g, '')
      .slice(0, 300) + (text.length > 300 ? "..." : ""); // truncate reading size for speed

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsSpeakingId(null);
    };
    utterance.onerror = () => {
      setIsSpeakingId(null);
    };

    setIsSpeakingId(msgIndex);
    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Simple Markdown-to-JSX parser helper for structured markdown responses
  const renderMessageContent = (text) => {
    const lines = text.split('\n');
    let inTable = false;
    let tableRows = [];

    const elements = [];

    lines.forEach((line, index) => {
      // Parse Table structures
      if (line.trim().startsWith('|')) {
        inTable = true;
        const cols = line.split('|').map(c => c.trim()).filter(c => c !== '');
        
        // Skip separator rows
        if (line.includes('---')) return;

        tableRows.push(cols);
        return;
      } else if (inTable) {
        // Table finished, render table accumulator
        inTable = false;
        elements.push(
          <div key={`table-${index}`} className="my-3 overflow-x-auto border border-slate-900 rounded-xl bg-slate-950/70 p-1 font-mono text-[8px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900/60 text-slate-500 font-black">
                  {tableRows[0]?.map((col, idx) => (
                    <th key={idx} className="py-2 px-3">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/40 text-slate-200">
                {tableRows.slice(1).map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-900/20">
                    {row.map((col, cIdx) => (
                      <td key={cIdx} className="py-2 px-3 font-semibold">{col}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
      }

      // Parse Headers
      if (line.startsWith('###')) {
        elements.push(
          <h3 key={index} className="text-[10px] font-black text-slate-100 font-mono tracking-wider uppercase mt-3 mb-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
            {line.replace('###', '').trim()}
          </h3>
        );
      } else if (line.startsWith('####')) {
        elements.push(
          <h4 key={index} className="text-[8.5px] font-black text-neon-cyan font-mono tracking-widest uppercase mt-3 mb-1.5">
            {line.replace('####', '').trim()}
          </h4>
        );
      }
      // Parse Bullet lists
      else if (line.startsWith('-')) {
        elements.push(
          <div key={index} className="flex items-start gap-1.5 ml-2 my-1 text-[8.5px] text-slate-350">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-purple shrink-0 mt-1" />
            <p className="leading-relaxed font-sans">{parseInlineFormatting(line.replace('-', '').trim())}</p>
          </div>
        );
      }
      // General paragraph
      else if (line.trim() !== '') {
        elements.push(
          <p key={index} className="text-[8.5px] text-slate-300 leading-relaxed font-sans font-medium my-1">
            {parseInlineFormatting(line)}
          </p>
        );
      }
    });

    // Handle trailing open table if any
    if (inTable && tableRows.length > 0) {
      elements.push(
        <div key="table-trailing" className="my-3 overflow-x-auto border border-slate-900 rounded-xl bg-slate-950/70 p-1 font-mono text-[8px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-900/60 text-slate-500 font-black">
                {tableRows[0]?.map((col, idx) => (
                  <th key={idx} className="py-2 px-3 text-left">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/40 text-slate-200">
              {tableRows.slice(1).map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-900/20">
                  {row.map((col, cIdx) => (
                    <td key={cIdx} className="py-2 px-3">{col}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return elements;
  };

  const parseInlineFormatting = (text) => {
    // Simple parser for bold **text** and highlights
    const regex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      parts.push(
        <strong key={match.index} className="text-slate-100 font-bold font-mono">
          {match[1]}
        </strong>
      );
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="fixed bottom-6 right-6 z-100 flex flex-col items-end">
      
      {/* ── Chat expansion Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-[320px] sm:w-[360px] h-[480px] sm:h-[520px] glass-card rounded-2xl border border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col mb-4 overflow-hidden"
          >
            {/* Top Glow Bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-cyan" />
            <div className="absolute inset-0 grid-mesh-subtle opacity-5 pointer-events-none" />

            {/* Header */}
            <div className="px-4 py-3.5 border-b border-slate-900 bg-slate-950/45 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-neon-cyan/8 border border-neon-cyan/20 flex items-center justify-center animate-pulse">
                  <FiCpu className="w-3.5 h-3.5 text-neon-cyan" />
                </div>
                <div className="font-mono leading-tight">
                  <h4 className="text-[10px] font-black tracking-widest text-slate-100 uppercase">Alpha AI Advisor</h4>
                  <span className="text-[7.5px] font-black uppercase text-neon-emerald flex items-center gap-1 tracking-wider mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-emerald animate-ping" />
                    Quant Silicon Online
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-900/60 border border-slate-900 cursor-pointer transition-colors"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Suggested Question Chips (Scrollable Row) */}
            <div className="px-3.5 py-2.5 border-b border-slate-900/50 bg-slate-950/20 flex items-center gap-1.5 overflow-x-auto scrollbar-none font-mono text-[7px] font-black uppercase tracking-wider text-slate-500">
              {[
                { label: 'Advice AAPL', q: 'Should I buy AAPL?' },
                { label: 'TCS vs INFY', q: 'Compare TCS and Infosys' },
                { label: 'Risk TSLA', q: 'Explain volatility risk of TSLA' },
                { label: 'Bullish NSE', q: 'Which Indian stocks are bullish?' }
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.q)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-slate-900 hover:border-neon-cyan/40 hover:text-neon-cyan cursor-pointer transition-colors whitespace-nowrap"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none bg-[#090d16]/30">
              {messages.map((msg, index) => {
                const isAI = msg.sender === 'ai';
                return (
                  <div key={index} className={`flex gap-2.5 ${isAI ? 'justify-start' : 'justify-end'}`}>
                    
                    {/* Avatar for AI */}
                    {isAI && (
                      <div className="w-6 h-6 rounded-lg bg-neon-cyan/10 border border-neon-cyan/25 flex items-center justify-center shrink-0">
                        <FiCpu className="w-3 h-3 text-neon-cyan" />
                      </div>
                    )}

                    <div className="flex flex-col gap-1 max-w-[80%]">
                      {/* Message bubble */}
                      <div
                        className={`p-3 rounded-2xl relative border ${
                          isAI
                            ? 'bg-slate-900/65 border-slate-800/80 text-slate-200 shadow-sm'
                            : 'bg-gradient-to-br from-neon-purple/20 to-neon-purple/5 border-neon-purple/20 text-slate-100'
                        }`}
                      >
                        {isAI ? renderMessageContent(msg.text) : <p className="text-[9px] font-medium leading-relaxed">{msg.text}</p>}

                        {/* Speaker TTS audio activator */}
                        {isAI && (
                          <div className="flex justify-end mt-2 pt-2 border-t border-slate-900/40">
                            <button
                              onClick={() => speakText(msg.text, index)}
                              className={`p-1 rounded bg-slate-950/80 border border-slate-900 hover:text-neon-cyan cursor-pointer transition-colors ${
                                isSpeakingId === index ? 'text-neon-cyan border-neon-cyan/25 animate-pulse' : 'text-slate-500'
                              }`}
                              title={isSpeakingId === index ? 'Stop audio' : 'Speak summary aloud'}
                            >
                              {isSpeakingId === index ? <FiVolumeX className="w-2.5 h-2.5" /> : <FiVolume2 className="w-2.5 h-2.5" />}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Timestamp */}
                      <span className="text-[6.5px] font-mono text-slate-650 px-1">
                        {msg.sender === 'ai' ? 'Neural feed' : 'Investor'} · {msg.timestamp}
                      </span>
                    </div>

                    {/* Avatar for user */}
                    {!isAI && (
                      <div className="w-6 h-6 rounded-lg bg-neon-purple/10 border border-neon-purple/25 flex items-center justify-center shrink-0">
                        <FiUser className="w-3 h-3 text-neon-purple" />
                      </div>
                    )}

                  </div>
                );
              })}

              {/* Typing Loader Indicator */}
              {isLoading && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-6 h-6 rounded-lg bg-neon-cyan/10 border border-neon-cyan/25 flex items-center justify-center shrink-0">
                    <FiCpu className="w-3 h-3 text-neon-cyan animate-spin" />
                  </div>
                  <div className="p-3 bg-slate-900/65 border border-slate-800/80 rounded-2xl flex items-center gap-1">
                    {[1, 2, 3].map(dot => (
                      <span
                        key={dot}
                        className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-bounce"
                        style={{ animationDelay: `${dot * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form Footer */}
            <div className="p-3 border-t border-slate-900 bg-slate-950/65">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1 relative font-mono text-[9px]"
              >
                {/* Voice mic button */}
                <button
                  type="button"
                  onClick={startSpeechRecognition}
                  className={`p-2 rounded-lg border cursor-pointer transition-all ${
                    isListening
                      ? 'bg-neon-rose/15 text-neon-rose border-neon-rose/30 animate-pulse'
                      : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200'
                  }`}
                  title="Speak query"
                >
                  <FiMic className="w-3.5 h-3.5" />
                </button>

                {/* Input Text Box */}
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={isListening ? "Listening context..." : "Ask alpha model..."}
                  className="flex-1 pl-1 pr-8 py-2 bg-transparent text-slate-200 placeholder:text-slate-600 focus:outline-none text-[9.5px]"
                />

                {/* Send button */}
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple text-slate-950 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-md hover:shadow-neon-cyan/20 cursor-pointer transition-shadow"
                >
                  <FiSend className="w-3.5 h-3.5" />
                </button>

                {/* Keyboard submit clue */}
                <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[6.5px] text-slate-700 bg-slate-900 px-1 py-0.5 rounded border border-slate-850 pointer-events-none">
                  <FiCornerDownLeft className="w-2 h-2" />
                  <span>Enter</span>
                </div>
              </form>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Chat Bubble toggle Button ── */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-neon-cyan via-neon-purple to-pink-500 text-slate-950 flex items-center justify-center shadow-lg shadow-neon-purple/20 cursor-pointer border border-white/5 relative overflow-hidden group"
      >
        {/* Glowing border loop */}
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        {isOpen ? (
          <FiX className="w-5 h-5 sm:w-6 sm:h-6 text-slate-100 relative z-10" />
        ) : (
          <div className="relative z-10">
            <FiMessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-slate-100" />
            {/* Notification alert pulse */}
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-emerald opacity-70" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-neon-emerald" />
            </span>
          </div>
        )}
      </motion.button>

    </div>
  );
}
