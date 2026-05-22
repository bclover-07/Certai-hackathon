'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
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

/* ─── Floating Credential Card (decorative) ─── */
const FloatingCredential = ({
  label,
  color,
  delay,
  x,
  y,
}: {
  label: string;
  color: string;
  delay: number;
  x: string;
  y: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    className="absolute pointer-events-none hidden lg:block"
    style={{ left: x, top: y }}
  >
    <motion.div
      animate={{ y: [0, -8, 0], rotate: [-1, 1, -1] }}
      transition={{ duration: 4 + delay, repeat: Infinity, ease: 'easeInOut' }}
      className="px-4 py-2.5 rounded-xl border backdrop-blur-md text-[10px] font-bold uppercase tracking-wider"
      style={{
        borderColor: `${color}30`,
        background: `${color}08`,
        color: `${color}cc`,
        boxShadow: `0 4px 20px ${color}10`,
      }}
    >
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: color }} />
        {label}
      </div>
    </motion.div>
  </motion.div>
);

const CTASection = () => {
  const { login, authenticated, ready } = usePrivy();
  const router = useRouter();
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Mouse tracking for the button glow
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleButtonMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  const handleAction = () => {
    // Trigger particle burst
    const newParticles = Array.from({ length: 20 }).map((_, i) => {
      const angle = (i / 20) * 2 * Math.PI + (Math.random() - 0.5) * 0.5;
      const distance = 50 + Math.random() * 60;
      return {
        id: Date.now() + i + Math.random(),
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      };
    });
    setParticles(newParticles);
    setTimeout(() => {
      setParticles([]);
    }, 1000);

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
    >
      {/* Dramatic background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0, 212, 255, 0.08) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 30% 80%, rgba(124, 58, 237, 0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 70% 80%, rgba(16, 185, 129, 0.04) 0%, transparent 60%)',
        }}
      />

      {/* Animated grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      {/* Floating credential badges */}
      <FloatingCredential label="ACLS Certified" color="#00d4ff" delay={0.2} x="8%" y="25%" />
      <FloatingCredential label="Board Certified" color="#a855f7" delay={0.5} x="85%" y="20%" />
      <FloatingCredential label="500 CME Hours" color="#10b981" delay={0.8} x="5%" y="55%" />
      <FloatingCredential label="ICU Specialist" color="#f59e0b" delay={1.1} x="88%" y="50%" />

      {/* CTA Body */}
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-16 py-[120px] text-center space-y-8 relative z-10">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono text-[#00d4ff] tracking-[0.2em] font-bold uppercase"
        >
          <span className="h-1 w-8 rounded-full bg-gradient-to-r from-cyan-400 to-transparent" />
          START IN 30 SECONDS
          <span className="h-1 w-8 rounded-full bg-gradient-to-l from-cyan-400 to-transparent" />
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight max-w-4xl mx-auto"
        >
          Your achievements deserve to be{' '}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
              permanent
            </span>
            {/* Underline glow */}
            <motion.span
              className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full"
              style={{
                background: 'linear-gradient(90deg, #00d4ff, #8b5cf6, #00d4ff)',
                backgroundSize: '200% 100%',
              }}
              animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
          </span>
          .
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35 }}
          className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed font-semibold"
        >
          Type what you&apos;ve accomplished. Let CERTAI do the rest.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="relative inline-block pt-4"
        >
          <motion.button
            ref={buttonRef}
            onMouseMove={handleButtonMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAction}
            className="relative px-12 py-5 bg-gradient-to-r from-cyan-400 to-cyan-500 text-[#030508] font-extrabold text-lg rounded-[50px] transition-all duration-300 focus:outline-none cursor-pointer overflow-hidden"
            style={{
              boxShadow: isHovered
                ? '0 0 40px rgba(0, 212, 255, 0.5), 0 0 80px rgba(0, 212, 255, 0.2), 0 0 120px rgba(0, 212, 255, 0.1)'
                : '0 0 30px rgba(0, 212, 255, 0.25)',
            }}
          >
            {/* Internal shimmer effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
              }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
            />
            <span className="relative z-10">Claim Your First Credential →</span>
          </motion.button>

          {/* Particle Burst on Click */}
          <AnimatePresence>
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none h-2 w-2 rounded-full"
                style={{
                  zIndex: 50,
                  background: `hsl(${180 + Math.random() * 60}, 80%, 60%)`,
                }}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
          className="text-[11px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest pt-2"
        >
          No ETH required · Free to try · Base Sepolia testnet
        </motion.p>
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
              <span className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-cyan-400" />
                Powered by UGF Gasless Protocol
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-purple-400" />
                Base Sepolia Rollup Ledger
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-emerald-400" />
                LangGraph + Gemini 2.5 Flash
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-amber-400" />
                Secure MongoDB Clusters
              </span>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="max-w-[1200px] mx-auto border-t border-slate-900/60 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-widest">
            © 2026 CERTAI · Built for hackathon
          </span>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono text-emerald-400/70">All systems operational</span>
          </div>
        </div>
      </footer>
    </motion.section>
  );
};

export default React.memo(CTASection);
