"use client";

import { useState, useRef, useEffect } from "react";
import { useClaimStore } from "../../store/claimStore";
import VoiceInput from "./VoiceInput";

interface ClaimChatProps {
  onSend: (text: string) => void;
  isLoading: boolean;
}

export default function ClaimChat({ onSend, isLoading }: ClaimChatProps) {
  const { messages } = useClaimStore();
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Autoscroll chat history
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    onSend(inputText.trim());
    setInputText("");
  };

  const handleVoiceInput = (text: string) => {
    setInputText(text);
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-800 bg-[#0d112d]/40 backdrop-blur-md overflow-hidden">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
        {messages.map((msg, idx) => {
          const isAssistant = msg.role === "assistant";
          return (
            <div
              key={idx}
              className={`flex items-start gap-3.5 ${
                isAssistant ? "justify-start" : "justify-end"
              }`}
            >
              {isAssistant && (
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-600 text-sm shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                  🤖
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed border transition-all duration-200 ${
                  isAssistant
                    ? "bg-slate-900/60 border-slate-800 text-slate-300 shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
                    : "bg-cyan-500/10 border-cyan-500/20 text-cyan-100 shadow-[0_2px_8px_rgba(6,182,212,0.05)]"
                }`}
              >
                {msg.content}
              </div>

              {!isAssistant && (
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-sm shadow-[0_0_10px_rgba(124,58,237,0.3)]">
                  👤
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3.5 justify-start">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-600 text-sm">
              🤖
            </div>
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 px-4 py-3.5 text-sm text-slate-400 flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-bounce stagger-1" />
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-bounce stagger-2" />
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-bounce stagger-3" />
              <span className="text-xs text-slate-500 italic font-semibold ml-1">Analyzing credential...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Form Section */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-slate-800 bg-[#0d112d]/80 p-4 flex gap-3 items-center"
      >
        {/* Voice Trigger */}
        <VoiceInput onTranscriptChange={handleVoiceInput} onSend={onSend} />

        <input
          type="text"
          placeholder="Speak or type your accomplishment..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
          className="flex-1 rounded-xl bg-slate-950/60 border border-slate-850 py-3.5 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all duration-300"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500 hover:text-white transition-all duration-300 active:scale-[0.96] disabled:opacity-30 disabled:pointer-events-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
