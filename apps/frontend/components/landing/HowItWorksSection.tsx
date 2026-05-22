'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const sectionVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94] as any,
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as any },
  },
};

// Custom mini typing effect component for Step 1 Mock
const TypingMock = () => {
  const [text, setText] = useState('');
  const fullText = 'I completed 40-hour ACLS certification at Memorial Hospital';
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    let index = 0;
    let active = true;

    const typeChar = () => {
      if (!active) return;
      if (index <= fullText.length) {
        setText(fullText.slice(0, index));
        index++;
        timeoutRef.current = setTimeout(typeChar, 60);
      } else {
        // Wait then restart
        timeoutRef.current = setTimeout(() => {
          index = 0;
          setText('');
          timeoutRef.current = setTimeout(typeChar, 800);
        }, 3000);
      }
    };

    typeChar();
    return () => {
      active = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="w-full bg-[#030508] border border-cyan-500/10 rounded-xl p-3 text-xs text-cyan-200 font-mono flex items-center justify-between min-h-[50px] relative shadow-[0_0_15px_rgba(6,182,212,0.05)] overflow-hidden">
      {/* Subtle scanline */}
      <motion.div
        className="absolute left-0 right-0 h-[1px] bg-cyan-400/10 pointer-events-none"
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
      <span className="relative z-10">
        {text}
        <span className="w-1.5 h-3 bg-cyan-400 inline-block ml-0.5 animate-pulse" />
      </span>
    </div>
  );
};

// Shimmering Mock for Step 2
const ValidationMock = () => {
  const [isValidated, setIsValidated] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsValidated(prev => !prev);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-[#030508] border border-purple-500/10 rounded-xl p-3 min-h-[70px] flex flex-col justify-center relative overflow-hidden shadow-[0_0_15px_rgba(168,85,247,0.05)]">
      {!isValidated ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <motion.div
              className="h-3 w-3 rounded-full border border-purple-400/40"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <div className="h-full w-full rounded-full border-t border-purple-400" />
            </motion.div>
            <span className="text-[10px] font-mono text-purple-300/60 animate-pulse">ANALYZING_CLAIM...</span>
          </div>
          <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500/40 to-fuchsia-500/40 rounded-full"
              animate={{ width: ['0%', '100%'] }}
              transition={{ duration: 3.5, ease: 'easeInOut' }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-1.5"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] bg-purple-500/20 text-purple-300 font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider">ACLS CERTIFIED</span>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              98.4% Confidence
            </span>
          </div>
          <p className="text-[11px] text-slate-300 font-medium">Memorial Hospital · 40 Hours Logged</p>
        </motion.div>
      )}
    </div>
  );
};

// Drawing checkmark Mock for Step 3
const MintMock = () => {
  const [key, setKey] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setKey(prev => prev + 1);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-[#030508] border border-amber-500/10 rounded-xl p-3 min-h-[70px] flex items-center gap-3 relative shadow-[0_0_15px_rgba(251,191,36,0.05)] overflow-hidden">
      {/* Energy pulse */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent pointer-events-none"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
      />
      <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 relative z-10">
        <svg key={key} className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <div className="flex-1 min-w-0 relative z-10">
        <p className="text-[11px] text-slate-200 font-bold">SBT Minted Gaslessly</p>
        <p className="text-[9px] text-[#7890a8] font-mono truncate mt-0.5">Tx: 0x5b3a...a1d4 · Block: #24598210</p>
      </div>
    </div>
  );
};

/* ─── Animated Energy Connector ─── */
const EnergyConnector = ({ fromColor, toColor }: { fromColor: string; toColor: string }) => (
  <div className="hidden md:flex items-center justify-center w-8 lg:w-16 shrink-0 relative self-center">
    <div className="w-full h-[2px] relative overflow-visible">
      {/* Base line */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${fromColor}, ${toColor})`, opacity: 0.3 }} />
      {/* Traveling energy pulse */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 w-4 h-[2px] rounded-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${toColor}, transparent)`,
          boxShadow: `0 0 8px ${toColor}`,
        }}
        animate={{ left: ['-10%', '110%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.5 }}
      />
    </div>
    <span className="absolute right-0 font-bold text-xs" style={{ color: toColor }}>→</span>
  </div>
);

const HowItWorksSection = () => {
  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      className="bg-[#030508] py-[100px] border-t border-slate-900 px-6 sm:px-8 lg:px-16 relative overflow-hidden"
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,212,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.4) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <div className="max-w-[1200px] mx-auto space-y-16 relative z-10">
        {/* Title Block */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-4 py-1.5 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Protocol Pipeline
            </span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Three steps.{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
              Fifteen seconds.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-400 font-medium max-w-2xl mx-auto">
            From natural language to on-chain credential.
          </p>
        </div>

        {/* Steps Layout */}
        <div className="relative flex flex-col md:flex-row items-stretch justify-between gap-8 md:gap-4 lg:gap-8 pt-8">
          
          {/* Step 1 Card */}
          <motion.div variants={cardVariants} className="flex-1 bg-[#060a12]/60 border border-slate-800/60 rounded-2xl p-8 relative overflow-hidden flex flex-col justify-between h-[380px] group hover:border-cyan-500/25 transition-all duration-500 backdrop-blur-sm">
            {/* Animated top border */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)', backgroundSize: '200% 100%' }}
              animate={{ backgroundPosition: ['200% 0%', '-200% 0%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
            
            {/* Step Number */}
            <div className="absolute right-4 top-4 text-8xl font-black text-slate-900/30 select-none group-hover:text-cyan-500/[0.04] transition-colors duration-500 font-mono">
              01
            </div>

            {/* HUD corners */}
            <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-cyan-500/20 group-hover:border-cyan-500/40 transition-colors" />
            <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-cyan-500/20 group-hover:border-cyan-500/40 transition-colors" />

            <div className="space-y-4 relative z-10">
              <div className="h-12 w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-2xl font-bold border border-cyan-500/10 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-shadow duration-500">
                ⌨️
              </div>
              <h3 className="text-xl font-bold text-white">Type Your Achievement</h3>
              <p className="text-sm text-[#7890a8] leading-relaxed">
                Write in plain English what you accomplished. No technical terms. No forms. Just your words.
              </p>
            </div>

            <div className="relative z-10 w-full pt-4">
              <TypingMock />
            </div>
          </motion.div>

          {/* Energy Connector 1 */}
          <EnergyConnector fromColor="#00d4ff" toColor="#a855f7" />

          {/* Step 2 Card */}
          <motion.div variants={cardVariants} className="flex-1 bg-[#060a12]/60 border border-slate-800/60 rounded-2xl p-8 relative overflow-hidden flex flex-col justify-between h-[380px] group hover:border-purple-500/25 transition-all duration-500 backdrop-blur-sm">
            {/* Animated top border */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: 'linear-gradient(90deg, transparent, #a855f7, transparent)', backgroundSize: '200% 100%' }}
              animate={{ backgroundPosition: ['200% 0%', '-200% 0%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />

            {/* Step Number */}
            <div className="absolute right-4 top-4 text-8xl font-black text-slate-900/30 select-none group-hover:text-purple-500/[0.04] transition-colors duration-500 font-mono">
              02
            </div>

            {/* HUD corners */}
            <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-purple-500/20 group-hover:border-purple-500/40 transition-colors" />
            <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-purple-500/20 group-hover:border-purple-500/40 transition-colors" />

            <div className="space-y-4 relative z-10">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 text-2xl font-bold border border-purple-500/10 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-shadow duration-500">
                🧠
              </div>
              <h3 className="text-xl font-bold text-white">AI Validates Instantly</h3>
              <p className="text-sm text-[#7890a8] leading-relaxed">
                Our LangGraph agent powered by Gemini Flash extracts, validates, and structures your credential in under 2 seconds.
              </p>
            </div>

            <div className="relative z-10 w-full pt-4">
              <ValidationMock />
            </div>
          </motion.div>

          {/* Energy Connector 2 */}
          <EnergyConnector fromColor="#a855f7" toColor="#f59e0b" />

          {/* Step 3 Card */}
          <motion.div variants={cardVariants} className="flex-1 bg-[#060a12]/60 border border-slate-800/60 rounded-2xl p-8 relative overflow-hidden flex flex-col justify-between h-[380px] group hover:border-amber-500/25 transition-all duration-500 backdrop-blur-sm">
            {/* Animated top border */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)', backgroundSize: '200% 100%' }}
              animate={{ backgroundPosition: ['200% 0%', '-200% 0%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />

            {/* Step Number */}
            <div className="absolute right-4 top-4 text-8xl font-black text-slate-900/30 select-none group-hover:text-amber-500/[0.04] transition-colors duration-500 font-mono">
              03
            </div>

            {/* HUD corners */}
            <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-amber-500/20 group-hover:border-amber-500/40 transition-colors" />
            <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-amber-500/20 group-hover:border-amber-500/40 transition-colors" />

            <div className="space-y-4 relative z-10">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 text-2xl font-bold border border-amber-500/10 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] transition-shadow duration-500">
                🛡️
              </div>
              <h3 className="text-xl font-bold text-white">Mint On-Chain Gaslessly</h3>
              <p className="text-sm text-[#7890a8] leading-relaxed">
                UGF executes the transaction using Mock USD. No ETH needed. SoulBound to your wallet forever.
              </p>
            </div>

            <div className="relative z-10 w-full pt-4">
              <MintMock />
            </div>
          </motion.div>

        </div>

        {/* Protocol Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-6 pt-4 text-[10px] font-mono text-slate-500"
        >
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            PROTOCOL: ACTIVE
          </span>
          <span>NETWORK: BASE_SEPOLIA</span>
          <span>LATENCY: &lt;2s</span>
          <span>GAS_COST: $0.00</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            UGF_RELAY: CONNECTED
          </span>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default React.memo(HowItWorksSection);
