"use client";

import { useVoiceInput } from "../../hooks/useVoiceInput";
import { useEffect, useRef } from "react";

interface VoiceInputProps {
  onTranscriptChange: (text: string) => void;
  onSend: (text: string) => void;
}

export default function VoiceInput({
  onTranscriptChange,
  onSend,
}: VoiceInputProps) {
  const onTranscriptRef = useRef(onTranscriptChange);
  onTranscriptRef.current = onTranscriptChange;

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported,
  } = useVoiceInput((finalText) => {
    onTranscriptRef.current(finalText);
  });

  useEffect(() => {
    if (transcript) {
      onTranscriptRef.current(transcript);
    }
  }, [transcript]);

  if (!isSupported) {
    return null;
  }

  const handleToggle = () => {
    if (isListening) {
      stopListening();
      if (transcript.trim()) {
        onSend(transcript.trim());
      }
    } else {
      startListening();
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${
        isListening
          ? "bg-rose-500/20 border border-rose-400 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse"
          : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30"
      }`}
      title={isListening ? "Stop listening & Send" : "Use voice claim"}
    >
      {isListening ? (
        <>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-xl bg-rose-500/10 opacity-75" />
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
              d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z"
            />
          </svg>
        </>
      ) : (
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
            d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
          />
        </svg>
      )}
    </button>
  );
}
