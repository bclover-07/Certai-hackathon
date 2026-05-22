'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

function useCountUp(target: number, duration = 2000, isDecimal = false) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) {
            setCount(target);
            clearInterval(timer);
          } else {
            setCount(isDecimal ? parseFloat(start.toFixed(1)) : Math.floor(start));
          }
        }, 16);
        observer.disconnect();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, isDecimal]);
  
  return { count, ref };
}

const sectionVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, y: 0,
    transition: { 
      duration: 0.7, 
      ease: [0.25, 0.46, 0.45, 0.94] as any,
      staggerChildren: 0.12, 
      delayChildren: 0.1 
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as any } 
  }
};

const ProblemSection = () => {
  const stat1 = useCountUp(6, 2000, false);
  const stat2 = useCountUp(10000, 2000, false);
  const stat3 = useCountUp(2.1, 2000, true);

  return (
    <motion.section
      id="problem-section"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      className="bg-[#090d14] py-[100px] border-t border-slate-900 px-6 sm:px-8 lg:px-16 relative overflow-hidden"
    >
      {/* Background Matrix Red Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-red-950/[0.04] blur-[150px] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* Left Column - Bold Statement & Cyber Log Pain Points */}
        <div className="space-y-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            Healthcare credentialing is <span className="bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">broken</span>.
          </h2>
          <p className="text-base sm:text-lg text-[#7890a8] leading-relaxed max-w-xl">
            Medical boards rely on archaic paper workflows, unsecure channels, and months-long manual audits that leak billions in administrative overhead and invite compliance vulnerabilities.
          </p>

          <div className="space-y-4 font-mono text-xs sm:text-sm">
            <motion.div variants={itemVariants} className="flex items-center gap-3 bg-red-950/20 border border-red-500/10 rounded-xl px-4 py-3 text-red-200">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ef4444] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ef4444]"></span>
              </span>
              <span>[FATAL] DELAY_TIMEOUT: 3–6 months average verification latency</span>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex items-center gap-3 bg-red-950/20 border border-red-500/10 rounded-xl px-4 py-3 text-red-200">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ef4444] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ef4444]"></span>
              </span>
              <span>[FATAL] CAPITAL_DRAIN: $10,000 per physician administrative overhead</span>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex items-center gap-3 bg-red-950/20 border border-red-500/10 rounded-xl px-4 py-3 text-red-200">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ef4444] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ef4444]"></span>
              </span>
              <span>[FATAL] INTEGRITY_BREACH: $2.1 billion lost annually to credential fraud</span>
            </motion.div>
          </div>
        </div>

        {/* Right Column - Red Security Diagnostic Terminals */}
        <div className="space-y-6">
          {/* Card 1 */}
          <div ref={stat1.ref} className="bg-[#05080e] border border-red-500/15 rounded-2xl overflow-hidden relative group hover:border-red-500/30 transition-all duration-300">
            {/* Warning Grid Overlay */}
            <div 
              className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity duration-300"
              style={{
                backgroundImage: 'radial-gradient(rgba(239, 68, 68, 0.5) 1px, transparent 1px)',
                backgroundSize: '14px 14px'
              }}
            />
            {/* Terminal Header */}
            <div className="bg-red-950/15 border-b border-red-500/10 px-5 py-2.5 flex items-center justify-between text-[10px] font-mono text-red-400">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                <span>DIAGNOSTIC_ERR_01 // LATENCY_OVERFLOW</span>
              </div>
              <span>CRITICAL</span>
            </div>
            {/* Body */}
            <div className="p-6 relative">
              <div className="text-5xl sm:text-6xl font-extrabold text-[#ef4444] tracking-tight">
                {stat1.count}
                <span className="text-2xl sm:text-3xl font-bold text-red-400/80"> months</span>
              </div>
              <div className="text-[11px] font-mono text-slate-500 mt-3 flex justify-between items-center border-t border-slate-900 pt-3">
                <span>SYSTEM STATUS: STALLED // MANUAL_AUDIT</span>
                <span className="text-red-400/60 font-bold">AVG_WAIT_TIME</span>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div ref={stat2.ref} className="bg-[#05080e] border border-red-500/15 rounded-2xl overflow-hidden relative group hover:border-red-500/30 transition-all duration-300">
            {/* Warning Grid Overlay */}
            <div 
              className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity duration-300"
              style={{
                backgroundImage: 'radial-gradient(rgba(239, 68, 68, 0.5) 1px, transparent 1px)',
                backgroundSize: '14px 14px'
              }}
            />
            {/* Terminal Header */}
            <div className="bg-red-950/15 border-b border-red-500/10 px-5 py-2.5 flex items-center justify-between text-[10px] font-mono text-red-400">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                <span>DIAGNOSTIC_ERR_02 // SYSTEM_OVERHEAD</span>
              </div>
              <span>SEVERE</span>
            </div>
            {/* Body */}
            <div className="p-6 relative">
              <div className="text-5xl sm:text-6xl font-extrabold text-[#ef4444] tracking-tight">
                <span className="text-3xl sm:text-4xl font-bold text-red-400/80">$</span>
                {stat2.count.toLocaleString()}
              </div>
              <div className="text-[11px] font-mono text-slate-500 mt-3 flex justify-between items-center border-t border-slate-900 pt-3">
                <span>IMPACT: EXTREME // WASTED_ADMIN_RESOURCES</span>
                <span className="text-red-400/60 font-bold">PER_PHYSICIAN_COST</span>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div ref={stat3.ref} className="bg-[#05080e] border border-red-500/15 rounded-2xl overflow-hidden relative group hover:border-red-500/30 transition-all duration-300">
            {/* Warning Grid Overlay */}
            <div 
              className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity duration-300"
              style={{
                backgroundImage: 'radial-gradient(rgba(239, 68, 68, 0.5) 1px, transparent 1px)',
                backgroundSize: '14px 14px'
              }}
            />
            {/* Terminal Header */}
            <div className="bg-red-950/15 border-b border-red-500/10 px-5 py-2.5 flex items-center justify-between text-[10px] font-mono text-red-400">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                <span>DIAGNOSTIC_ERR_03 // INTEGRITY_EXPLOIT</span>
              </div>
              <span>CRITICAL</span>
            </div>
            {/* Body */}
            <div className="p-6 relative">
              <div className="text-5xl sm:text-6xl font-extrabold text-[#ef4444] tracking-tight">
                <span className="text-3xl sm:text-4xl font-bold text-red-400/80">$</span>
                {stat3.count}
                <span className="text-4xl font-bold text-[#ef4444]">B</span>
              </div>
              <div className="text-[11px] font-mono text-slate-500 mt-3 flex justify-between items-center border-t border-slate-900 pt-3">
                <span>SECURITY THREAT: HIGH // COUNTERFEIT_CREDENTIALS</span>
                <span className="text-red-400/60 font-bold">ANNUAL_FRAUD_LOSS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Horizontal Divider with text */}
      <motion.div
        variants={{
          hidden: { opacity: 0, scale: 0.95 },
          visible: { 
            opacity: 1, 
            scale: 1, 
            transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as any, delay: 0.3 } 
          }
        }}
        className="mt-20 border-t border-cyan-500/20 pt-8 text-center"
      >
        <span className="text-base sm:text-lg font-mono text-[#00d4ff] tracking-widest font-semibold uppercase">
          CERTAI solves all three. Instantly. Gaslessly.
        </span>
      </motion.div>
    </motion.section>
  );
};

export default React.memo(ProblemSection);
