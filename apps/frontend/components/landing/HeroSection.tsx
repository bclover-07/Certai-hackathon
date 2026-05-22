'use client';

import React, { useState, useRef, useEffect, Suspense, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { usePrivy } from '../../hooks/usePrivy';
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


// Mouse state tracker inside the WebGL canvas context
const mousePosGlobal = { x: 0, y: 0 };

function Magnetic({ children, range = 100 }: { children: React.ReactNode; range?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;
    const distance = Math.hypot(distanceX, distanceY);

  if (distance < range) {
      // Pull strength proportional to proximity
      const factor = 0.3;
      setPosition({ x: distanceX * factor, y: distanceY * factor });
    } else {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 120, damping: 12, mass: 0.1 }}
    >
      {children}
    </motion.div>
  );
}

export default function HeroSection() {
  const { login, authenticated, ready } = usePrivy();
  const router = useRouter();
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Real-time telemetry simulation
  const [telemetry, setTelemetry] = useState({
    blockHeight: 24598204,
    latency: 42,
    epoch: 198,
    gasPrice: 0.00,
    loadFactor: 0.65,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry((prev) => ({
        blockHeight: prev.blockHeight + 1,
        latency: Math.floor(38 + Math.random() * 8),
        epoch: Math.floor((prev.blockHeight + 1) / 100000),
        gasPrice: Math.random() > 0.82 ? parseFloat((Math.random() * 0.03).toFixed(4)) : 0.00,
        loadFactor: parseFloat((0.55 + Math.random() * 0.2).toFixed(2)),
      }));
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    mousePosGlobal.x = e.clientX;
    mousePosGlobal.y = e.clientY;
  }, []);

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
    <div className="relative min-h-screen bg-[#030508] overflow-hidden flex flex-col justify-between" onMouseMove={handleMouseMove}>
      {/* Mouse-Tracking Background Glow */}
      <div
        className="fixed pointer-events-none z-0 transition-opacity duration-300"
        style={{
          left: mousePos.x - 200,
          top: mousePos.y - 200,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.05) 0%, rgba(124,58,237,0.02) 40%, transparent 70%)',
          filter: 'blur(40px)',
          opacity: mousePos.x === 0 && mousePos.y === 0 ? 0 : 1,
        }}
      />
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
            <Magnetic range={120}>
              <div className="relative inline-block w-full sm:w-auto">
                <NeonButton
                  variant="blue"
                  onClick={login}
                  onMouseEnter={triggerParticles}
                  className="px-8 shadow-[0_0_30px_rgba(6,182,212,0.25)] relative w-full sm:w-auto"
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
            </Magnetic>

            <Magnetic range={120}>
              <a
                href="https://sepolia.basescan.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center font-semibold rounded-xl border border-slate-800 bg-[#090d14]/40 px-8 py-3 text-slate-300 hover:border-slate-700 hover:text-white transition-all duration-300 backdrop-blur-md w-full sm:w-auto"
              >
                Explorer Ledger
              </a>
            </Magnetic>
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

        {/* Cinematic WebGL & HUD Container */}
        <div className="h-[400px] sm:h-[500px] lg:h-[600px] w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#090d14]/20 backdrop-blur-md relative shadow-[inset_0_0_30px_rgba(0,0,0,0.6)] group">
          {/* Laser Scanning Line */}
          <motion.div
            className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent pointer-events-none z-10"
            style={{ boxShadow: '0 0 15px #00d4ff, 0 0 5px #00d4ff' }}
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* HUD Corner Brackets */}
          <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-cyan-500/60 z-20 pointer-events-none" />
          <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-cyan-500/60 z-20 pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-cyan-500/60 z-20 pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-cyan-500/60 z-20 pointer-events-none" />

          {/* HUD Crosshairs Grid */}
          <div className="absolute top-1/2 left-4 right-4 h-[1px] bg-cyan-500/10 border-dashed border-t pointer-events-none -translate-y-1/2 z-10" />
          <div className="absolute left-1/2 top-4 bottom-4 w-[1px] bg-cyan-500/10 border-dashed border-l pointer-events-none -translate-x-1/2 z-10" />

          {/* Left Telemetry Sidebar Overlay */}
          <div className="absolute left-6 top-6 bg-[#060a12]/80 border border-cyan-500/25 rounded-xl p-3 text-[10px] font-mono text-slate-400 backdrop-blur-md flex flex-col gap-1 w-44 z-20 shadow-[0_4px_16px_rgba(0,0,0,0.5)] hidden md:flex">
            <div className="text-[#00d4ff] font-extrabold border-b border-cyan-500/20 pb-1.5 mb-1 flex items-center justify-between">
              <span>SYSTEM STATE</span>
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            <div>
              <span className="text-slate-500">NODE:</span> BASE_SEPOLIA_8
            </div>
            <div>
              <span className="text-slate-500">HEIGHT:</span> {telemetry.blockHeight.toLocaleString()}
            </div>
            <div>
              <span className="text-slate-500">LATENCY:</span> {telemetry.latency} ms
            </div>
            <div>
              <span className="text-slate-500">GAS:</span> {telemetry.gasPrice > 0 ? `${telemetry.gasPrice} GWEI` : '0 GWEI (UGF)'}
            </div>
          </div>

          {/* Right Classifier Diagnostics Overlay */}
          <div className="absolute right-6 bottom-6 bg-[#060a12]/80 border border-purple-500/25 rounded-xl p-3 text-[10px] font-mono text-slate-400 backdrop-blur-md flex flex-col gap-1 w-44 z-20 shadow-[0_4px_16px_rgba(0,0,0,0.5)] hidden md:flex">
            <div className="text-purple-400 font-extrabold border-b border-purple-500/20 pb-1.5 mb-1 flex items-center justify-between">
              <span>AI SCAN_CORE</span>
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
            </div>
            <div>
              <span className="text-slate-500">MODEL:</span> Gemini-Flash-1.5
            </div>
            <div>
              <span className="text-slate-500">THREADS:</span> 6-Node Graph
            </div>
            <div>
              <span className="text-slate-500">LOAD:</span> {(telemetry.loadFactor * 100).toFixed(0)}%
            </div>
            <div className="flex items-end gap-1.5 h-6 mt-1.5">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: ["30%", "100%", "30%"],
                  }}
                  transition={{
                    duration: 0.6 + i * 0.15,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-1 bg-cyan-400/50 rounded-full"
                />
              ))}
            </div>
          </div>

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
