"use client";

import React, { useState, useEffect, useRef } from "react";
import { Language, translations } from "../lib/translations";
import { Send, Mic, MicOff, AlertCircle, Bot, User, Volume2 } from "lucide-react";

interface AIChatProps {
  language: Language;
  userId: number;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  message: string;
  timestamp: string;
}

// Map regional languages to Speech Recognition locales
const LOCALE_MAP: Record<Language, string> = {
  English: "en-IN",
  Hindi: "hi-IN",
  Kannada: "kn-IN",
  Telugu: "te-IN",
  Tamil: "ta-IN",
  Marathi: "mr-IN"
};

export default function AIChat({ language, userId }: AIChatProps) {
  const t = translations[language];
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        
        rec.onstart = () => setIsListening(true);
        rec.onend = () => setIsListening(false);
        rec.onerror = (e: any) => {
          console.error("Speech recognition error", e);
          setIsListening(false);
        };
        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(prev => (prev ? prev + " " + transcript : transcript));
        };
        recognitionRef.current = rec;
      }
    }
  }, []);

  // Set correct locale when language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = LOCALE_MAP[language];
    }
  }, [language]);

  // Load chat history from DB
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch(`http://localhost:8000/api/chat/history/${userId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setMessages(data);
          } else {
            // Seed welcome message
            setMessages([
              {
                id: "welcome-msg",
                role: "assistant",
                message: translations[language].welcome + "! I am your Farmer Copilot. How can I assist you with your crops, weather, or farming concerns today?",
                timestamp: new Date().toISOString()
              }
            ]);
          }
        }
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    }
    loadHistory();
  }, [userId, language]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessageText = input.trim();
    setInput("");
    setError(null);
    
    // Add user message locally
    const userMsg: Message = {
      id: Math.random().toString(),
      role: "user",
      message: userMessageText,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("user_id", userId.toString());
      formData.append("message", userMessageText);

      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Failed to get response from server");

      const data = await res.json();
      
      const assistantMsg: Message = {
        id: Math.random().toString(),
        role: "assistant",
        message: data.response,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setError("Failed to get advice. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const speakText = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Remove markdown tags for cleaner speech
      const cleanText = text.replace(/[#*`_-]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = LOCALE_MAP[language];
      
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex h-[76vh] flex-col rounded-3xl border border-[var(--border)] bg-card shadow-sm overflow-hidden">
      
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-background/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Farmer Copilot AI</h3>
            <p className="text-xxs text-emerald-500 font-semibold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" /> Online • Ready to Assist
            </p>
          </div>
        </div>
        
        {recognitionRef.current && (
          <span className="text-xxs font-medium text-foreground/50 border border-[var(--border)] rounded-full px-2.5 py-1 bg-background">
            Mic Language: {LOCALE_MAP[language]}
          </span>
        )}
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
          >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-sm ${
              msg.role === "user" ? "bg-soil-500" : "bg-brand-500"
            }`}>
              {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            <div className="space-y-1">
              <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm relative group ${
                msg.role === "user" 
                  ? "bg-brand-500 text-white rounded-tr-none" 
                  : "bg-background border border-[var(--border)] text-foreground rounded-tl-none"
              }`}>
                {/* Text format */}
                <div className="whitespace-pre-line prose prose-sm dark:prose-invert">
                  {msg.message}
                </div>
                
                {/* Audio playback button for assistant messages */}
                {msg.role === "assistant" && (
                  <button 
                    onClick={() => speakText(msg.message)}
                    className="absolute -right-8 top-1 opacity-0 group-hover:opacity-100 p-1.5 text-foreground/50 hover:text-brand-500 rounded-full hover:bg-[var(--border)]/20 transition-all"
                    title="Speak answer out loud"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className={`text-[10px] text-foreground/40 ${msg.role === "user" ? "text-right" : ""}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-3 max-w-[80%]">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white shadow-sm">
              <Bot className="h-4 w-4 animate-bounce" />
            </div>
            <div className="rounded-2xl rounded-tl-none bg-background border border-[var(--border)] px-4 py-3 text-sm shadow-sm flex items-center gap-2">
              <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500 [animation-delay:0.2s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500 [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 text-sm text-red-600 dark:border-red-950 dark:bg-red-950/20 flex items-center gap-2">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="border-t border-[var(--border)] bg-background/50 p-4 flex gap-2 items-center">
        {/* Microphone Button */}
        <button
          type="button"
          onClick={toggleListening}
          className={`rounded-full p-3 transition shadow-sm ${
            isListening 
              ? "bg-red-500 text-white animate-pulse" 
              : "bg-background border border-[var(--border)] text-foreground/80 hover:bg-[var(--border)]/20"
          }`}
          title={isListening ? "Listening... click to stop" : "Voice control (Speech-to-text)"}
        >
          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? "Listening to your voice..." : "Type your agricultural query here..."}
          disabled={isListening}
          className="flex-1 rounded-full border border-[var(--border)] px-5 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="rounded-full bg-brand-500 p-3 text-white shadow-md shadow-brand-500/10 hover:bg-brand-600 disabled:bg-foreground/20 disabled:shadow-none transition"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
      
      {/* Quick speech guidance footer */}
      <div className="bg-soil-100/20 dark:bg-soil-600/5 px-6 py-1.5 text-xxs text-foreground/50 border-t border-[var(--border)]/50 flex justify-between">
        <span>{t.voice_tip}</span>
        <span>Supports: Hindi, Kannada, Tamil, Telugu, Marathi</span>
      </div>

    </div>
  );
}
