'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

const sectionVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94] as any
    }
  }
};

const CTASection = () => {
  const { login, authenticated, ready } = usePrivy();
  const router = useRouter();
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleAction = () => {
    // Trigger particle burst
    const newParticles = Array.from({ length: 12 }).map((_, i) => {
      const angle = (i / 12) * 2 * Math.PI + (Math.random() - 0.5) * 0.3;
      const distance = 40 + Math.random() * 40;
      return {
        id: Date.now() + i + Math.random(),
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      };
    });
    setParticles(newParticles);
    setTimeout(() => {
      setParticles([]);
    }, 800);

    // Navigate or login
    setTimeout(() => {
      if (ready && authenticated) {
        router.push('/dashboard');
      } else {
        login();
      }
    }, 400);
  };

  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      className="relative overflow-hidden bg-[#030508] border-t border-slate-900"
      style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0, 212, 255, 0.08) 0%, transparent 70%), #030508'
      }}
    >
      {/* CTA Body */}
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-16 py-[120px] text-center space-y-8 relative z-10">
        <span className="text-xs sm:text-sm font-mono text-[#00d4ff] tracking-[0.2em] font-bold uppercase">
          START IN 30 SECONDS
        </span>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight max-w-4xl mx-auto">
          Your achievements deserve to be permanent.
        </h2>

        <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed font-semibold">
          Type what you've accomplished. Let CERTAI do the rest.
        </p>

        <div className="relative inline-block pt-4">
          <motion.button
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 0 40px rgba(0, 212, 255, 0.4), 0 0 80px rgba(0, 212, 255, 0.15)' 
            }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAction}
            className="px-12 py-5 bg-[#00d4ff] text-[#030508] font-extrabold text-lg rounded-[50px] transition-shadow duration-300 relative focus:outline-none cursor-pointer"
          >
            Claim Your First Credential →
          </motion.button>

          {/* Particle Burst on Click */}
          <AnimatePresence>
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none h-2 w-2 rounded-full bg-cyan-400"
                style={{ zIndex: 50 }}
              />
            ))}
          </AnimatePresence>
        </div>

        <p className="text-[11px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest pt-2">
          No ETH required · Free to try · Base Sepolia testnet
        </p>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-16 px-6 sm:px-8 lg:px-16 bg-[#030508]/80 backdrop-blur-md relative z-10">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          
          {/* Left Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-400 to-purple-600 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                <span className="text-xl font-bold text-white">C</span>
              </div>
              <span className="text-xl font-extrabold tracking-wider text-white">
                CERT<span className="bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">AI</span>
              </span>
            </div>
            <p className="text-sm text-[#7890a8] max-w-[280px] leading-relaxed">
              On-chain credentials for everyone. Verified instantly by AI.
            </p>
          </div>

          {/* Center Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Platform</h4>
            <div className="flex flex-col gap-2.5 text-sm font-semibold text-slate-500">
              <span onClick={handleAction} className="hover:text-cyan-400 cursor-pointer transition-colors duration-300">Dashboard</span>
              <span onClick={handleAction} className="hover:text-cyan-400 cursor-pointer transition-colors duration-300">Claim Credential</span>
              <span onClick={handleAction} className="hover:text-cyan-400 cursor-pointer transition-colors duration-300">Verify Ledger</span>
              <span onClick={handleAction} className="hover:text-cyan-400 cursor-pointer transition-colors duration-300">Leaderboard</span>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tech Stack</h4>
            <div className="flex flex-col gap-2.5 text-sm font-semibold text-slate-500">
              <span>Powered by UGF Gasless Protocol</span>
              <span>Base Sepolia Rollup Ledger</span>
              <span>LangGraph + Gemini 2.5 Flash</span>
              <span>Secure MongoDB Clusters</span>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="max-w-[1200px] mx-auto border-t border-slate-900/60 mt-12 pt-8 text-center text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-widest">
          © 2026 CERTAI · Built for hackathon
        </div>
      </footer>
    </motion.section>
  );
};

export default React.memo(CTASection);
