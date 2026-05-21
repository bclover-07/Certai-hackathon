'use client';

import { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import NeonButton from '../ui/NeonButton';

const LandingScene = dynamic(() => import('../three/LandingScene'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-[#030508]/40">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Loading 3D Scene...</span>
      </div>
    </div>
  ),
});

export default function HeroSection() {
  const { login, authenticated, ready } = usePrivy();
  const router = useRouter();
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  const triggerParticles = () => {
    const newParticles = Array.from({ length: 12 }).map((_, i) => {
      const angle = (i / 12) * 2 * Math.PI + (Math.random() - 0.5) * 0.3;
      const distance = 40 + Math.random() * 40; // 40 to 80 pixels
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
  };

  return (
    <div className="relative min-h-screen bg-[#030508] overflow-hidden flex flex-col justify-between">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] h-[60%] w-[60%] rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-purple-500/10 blur-[150px] pointer-events-none" />

      {/* Floating Badge (Top Right) */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-6 right-8 lg:right-16 z-20 hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs font-semibold text-slate-300 shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e676] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00e676]"></span>
        </span>
        <span>⚡ Powered by UGF · Base Sepolia</span>
      </motion.div>

      {/* Header */}
      <header className="relative z-10 flex h-20 items-center justify-between px-8 lg:px-16">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-400 to-purple-600 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <span className="text-xl font-bold text-white">C</span>
          </div>
          <span className="text-xl font-extrabold tracking-wider text-white">
            CERT<span className="bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">AI</span>
          </span>
        </div>
        
        {ready && !authenticated ? (
          <button
            onClick={login}
            className="rounded-xl border border-slate-800 bg-[#090d14]/60 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:border-cyan-500/30 hover:text-white transition-all duration-300 backdrop-blur-md"
          >
            Launch Console
          </button>
        ) : ready && authenticated ? (
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-xl border border-slate-800 bg-[#090d14]/60 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:border-cyan-500/30 hover:text-white transition-all duration-300 backdrop-blur-md"
          >
            Go to Dashboard
          </button>
        ) : null}
      </header>

      {/* Hero Body */}
      <main className="relative z-10 grid flex-1 gap-12 px-8 py-10 lg:grid-cols-2 lg:px-16 lg:py-20 items-center max-w-7xl mx-auto w-full">
        <div className="space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-4 py-1.5 text-xs font-semibold text-cyan-400">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            UGF GASLESS PROTOCOL ON BASE SEPOLIA
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            AI-Attested{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
              SoulBound
            </span>{' '}
            Credential Registry
          </h1>

          <div className="h-8 flex items-center justify-center lg:justify-start">
            <TypeAnimation
              sequence={[
                'Type your achievement.', 2000,
                'Claim your credential.', 2000,
                'Verify in seconds.', 2000,
                'No ETH. No wallet setup.', 2000,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
              style={{ color: '#00d4ff', fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: 600 }}
            />
          </div>

          <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
            CERTAI translates natural language clinical and academic claims into permanently verified, tamper-proof SoulBound NFT credentials gaslessly. Built for next-gen medical staffing and compliance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
            <div className="relative inline-block">
              <NeonButton
                variant="blue"
                onClick={login}
                onMouseEnter={triggerParticles}
                className="px-8 shadow-[0_0_30px_rgba(6,182,212,0.25)] relative"
              >
                Verify Your Claim
              </NeonButton>

              {/* Particle Burst Elements */}
              <AnimatePresence>
                {particles.map((particle) => (
                  <motion.div
                    key={particle.id}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{ x: particle.x, y: particle.y, opacity: 0, scale: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none h-2 w-2 rounded-full bg-cyan-400"
                    style={{ zIndex: 50 }}
                  />
                ))}
              </AnimatePresence>
            </div>

            <a
              href="https://sepolia.basescan.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center font-semibold rounded-xl border border-slate-800 bg-[#090d14]/40 px-8 py-3 text-slate-300 hover:border-slate-700 hover:text-white transition-all duration-300 backdrop-blur-md"
            >
              Explorer Ledger
            </a>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-10 border-t border-slate-800/60 max-w-md mx-auto lg:mx-0">
            <div>
              <p className="text-3xl font-extrabold text-white">0 Gas</p>
              <p className="text-xs text-slate-500 font-bold uppercase mt-1">UGF Relay</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white">100%</p>
              <p className="text-xs text-slate-500 font-bold uppercase mt-1">Soulbound</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white">&lt; 3s</p>
              <p className="text-xs text-slate-500 font-bold uppercase mt-1">AI Audit</p>
            </div>
          </div>
        </div>

        <div className="h-[400px] sm:h-[500px] lg:h-[600px] w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#090d14]/20 backdrop-blur-md relative shadow-[inset_0_0_30px_rgba(0,0,0,0.6)]">
          <Suspense fallback={
            <div className="h-full w-full flex items-center justify-center">
              <div className="h-8 w-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            </div>
          }>
            <LandingScene />
          </Suspense>
        </div>
      </main>

      {/* Bouncing Chevron down Indicator */}
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-cyan-400 text-xl font-bold cursor-pointer select-none"
        onClick={() => {
          document.getElementById('problem-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        ↓
      </motion.div>
    </div>
  );
}
