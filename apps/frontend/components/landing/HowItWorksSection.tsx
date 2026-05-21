'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as any },
  },
};

// Custom mini typing effect component for Step 1 Mock
const TypingMock = () => {
  const [text, setText] = useState('');
  const fullText = 'I completed 40-hour ACLS certification at Memorial Hospital';
  
  useEffect(() => {
    let index = 0;
    let isDeleting = false;
    const interval = setInterval(() => {
      if (!isDeleting) {
        setText(fullText.slice(0, index + 1));
        index++;
        if (index === fullText.length) {
          isDeleting = true;
          clearInterval(interval);
          setTimeout(() => {
            // Restart deleting loop
            const deleteInterval = setInterval(() => {
              setText(prev => prev.slice(0, -1));
              if (setText.name === '') {
                // wait... let's just let it restart simple
              }
            }, 20);
            setTimeout(() => {
              clearInterval(deleteInterval);
              setText('');
              // Trigger typing restart
              index = 0;
              isDeleting = false;
            }, 1000);
          }, 3000);
        }
      }
    }, 60);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#030508] border border-cyan-500/10 rounded-xl p-3 text-xs text-cyan-200 font-mono flex items-center justify-between min-h-[50px] relative shadow-[0_0_15px_rgba(6,182,212,0.05)]">
      <span>
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
        <div className="space-y-2 animate-pulse">
          <div className="h-3 w-2/3 bg-purple-500/10 rounded" />
          <div className="h-3 w-1/2 bg-purple-500/10 rounded" />
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
            <span className="text-[10px] text-emerald-400 font-bold">✓ 98.4% Confidence</span>
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
    <div className="w-full bg-[#030508] border border-amber-500/10 rounded-xl p-3 min-h-[70px] flex items-center gap-3 relative shadow-[0_0_15px_rgba(251,191,36,0.05)]">
      <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
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
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-slate-200 font-bold">SBT Minted Gaslessly</p>
        <p className="text-[9px] text-[#7890a8] font-mono truncate mt-0.5">Tx: 0x5b3a...a1d4</p>
      </div>
    </div>
  );
};

const HowItWorksSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.connector-line', {
        scaleX: 0,
        transformOrigin: 'left center',
        scrollTrigger: {
          trigger: '.how-it-works-trigger',
          start: 'top 70%',
          end: 'bottom 50%',
          scrub: 1,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <motion.section
      ref={containerRef}
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      className="how-it-works-trigger bg-[#030508] py-[100px] border-t border-slate-900 px-6 sm:px-8 lg:px-16"
    >
      <div className="max-w-[1200px] mx-auto space-y-16">
        {/* Title Block */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Three steps. Fifteen seconds.
          </h2>
          <p className="text-base sm:text-lg text-[#00d4ff] font-mono tracking-wider font-semibold uppercase">
            From natural language to on-chain credential.
          </p>
        </div>

        {/* Steps Layout */}
        <div className="relative flex flex-col md:flex-row items-stretch justify-between gap-8 md:gap-4 lg:gap-8 pt-8">
          
          {/* Step 1 Card */}
          <motion.div variants={cardVariants} className="flex-1 bg-[#090d14]/40 border border-slate-900 rounded-2xl p-8 relative overflow-hidden flex flex-col justify-between h-[360px] group hover:border-cyan-500/20 transition-all duration-300">
            {/* Step Number behind */}
            <div className="absolute right-4 top-4 text-8xl font-black text-slate-900/40 select-none group-hover:text-cyan-500/5 transition-colors duration-300 font-mono">
              01
            </div>

            <div className="space-y-4 relative z-10">
              <div className="h-12 w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-2xl font-bold">
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

          {/* Connector Line 1 */}
          <div className="hidden md:flex items-center justify-center w-8 lg:w-16 shrink-0 relative self-center">
            <div className="connector-line w-full h-[2px] bg-gradient-to-r from-cyan-500 to-purple-500" />
            <span className="absolute right-0 text-purple-500 -translate-y-[2px] font-bold">➔</span>
          </div>

          {/* Step 2 Card */}
          <motion.div variants={cardVariants} className="flex-1 bg-[#090d14]/40 border border-slate-900 rounded-2xl p-8 relative overflow-hidden flex flex-col justify-between h-[360px] group hover:border-purple-500/20 transition-all duration-300">
            {/* Step Number behind */}
            <div className="absolute right-4 top-4 text-8xl font-black text-slate-900/40 select-none group-hover:text-purple-500/5 transition-colors duration-300 font-mono">
              02
            </div>

            <div className="space-y-4 relative z-10">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 text-2xl font-bold">
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

          {/* Connector Line 2 */}
          <div className="hidden md:flex items-center justify-center w-8 lg:w-16 shrink-0 relative self-center">
            <div className="connector-line w-full h-[2px] bg-gradient-to-r from-purple-500 to-amber-500" />
            <span className="absolute right-0 text-amber-500 -translate-y-[2px] font-bold">➔</span>
          </div>

          {/* Step 3 Card */}
          <motion.div variants={cardVariants} className="flex-1 bg-[#090d14]/40 border border-slate-900 rounded-2xl p-8 relative overflow-hidden flex flex-col justify-between h-[360px] group hover:border-amber-500/20 transition-all duration-300">
            {/* Step Number behind */}
            <div className="absolute right-4 top-4 text-8xl font-black text-slate-900/40 select-none group-hover:text-amber-500/5 transition-colors duration-300 font-mono">
              03
            </div>

            <div className="space-y-4 relative z-10">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 text-2xl font-bold">
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
      </div>
    </motion.section>
  );
};

export default React.memo(HowItWorksSection);
