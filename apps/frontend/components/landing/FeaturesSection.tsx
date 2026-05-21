'use client';

import React from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const MiniCanvas = dynamic(() => import('../three/MiniCanvas'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 200 }} className="bg-[#030508]/60 rounded-xl flex items-center justify-center border border-white/5">
      <div className="h-6 w-6 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
    </div>
  ),
});

const sectionVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94] as any,
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as any },
  },
};

// SVG Flow Diagram for Card 1
const PipelineDiagram = () => {
  return (
    <div className="w-full bg-[#030508]/40 border border-cyan-500/10 rounded-xl p-4 mt-6">
      <svg className="w-full h-16 sm:h-20" viewBox="0 0 540 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Animated paths */}
        <path d="M40 40H100" stroke="#00d4ff" strokeWidth="2" strokeDasharray="6, 6" className="animate-[dash_10s_linear_infinite]" />
        <path d="M140 40H200" stroke="#00d4ff" strokeWidth="2" strokeDasharray="6, 6" className="animate-[dash_10s_linear_infinite]" />
        <path d="M240 40H300" stroke="#00d4ff" strokeWidth="2" strokeDasharray="6, 6" className="animate-[dash_10s_linear_infinite]" />
        <path d="M340 40H400" stroke="#00d4ff" strokeWidth="2" strokeDasharray="6, 6" className="animate-[dash_10s_linear_infinite]" />
        <path d="M440 40H500" stroke="#00d4ff" strokeWidth="2" strokeDasharray="6, 6" className="animate-[dash_10s_linear_infinite]" />

        {/* Node 1: Input */}
        <circle cx="20" cy="40" r="14" fill="#030508" stroke="#00d4ff" strokeWidth="2" />
        <text x="20" y="44" fill="#00d4ff" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">IN</text>

        {/* Node 2: Classify */}
        <circle cx="120" cy="40" r="14" fill="#030508" stroke="#00d4ff" strokeWidth="2" />
        <text x="120" y="44" fill="#00d4ff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">CLS</text>

        {/* Node 3: Extract */}
        <circle cx="220" cy="40" r="14" fill="#030508" stroke="#00d4ff" strokeWidth="2" />
        <text x="220" y="44" fill="#00d4ff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">EXT</text>

        {/* Node 4: Validate */}
        <circle cx="320" cy="40" r="14" fill="#030508" stroke="#00d4ff" strokeWidth="2" />
        <text x="320" y="44" fill="#00d4ff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">VAL</text>

        {/* Node 5: Encode */}
        <circle cx="420" cy="40" r="14" fill="#030508" stroke="#00d4ff" strokeWidth="2" />
        <text x="420" y="44" fill="#00d4ff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">ENC</text>

        {/* Node 6: Compose */}
        <circle cx="520" cy="40" r="14" fill="#030508" stroke="#00d4ff" strokeWidth="2" />
        <text x="520" y="44" fill="#00d4ff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">CMP</text>
      </svg>
      <style jsx global>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -100;
          }
        }
      `}</style>
    </div>
  );
};

const FeaturesSection = () => {
  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      className="bg-[#090d14] py-[100px] border-t border-slate-900 px-6 sm:px-8 lg:px-16"
    >
      <div className="max-w-[1200px] mx-auto space-y-16">
        {/* Title */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Everything you need. Nothing you don't.
          </h2>
          <p className="text-base sm:text-lg text-slate-500 font-medium">
            Cutting-edge cryptographical security and instant AI verification.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-auto">
          {/* Card 1 - LangGraph AI Agent (LARGE, 2 cols, 1 row) */}
          <motion.div
            variants={cardVariants}
            whileHover={{
              y: -4,
              borderColor: 'rgba(6, 182, 212, 0.4)',
              backgroundColor: 'rgba(6, 182, 212, 0.04)',
            }}
            className="md:col-span-2 bg-white/[0.01] border border-white/[0.05] rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between transition-colors duration-300"
          >
            <div className="space-y-3">
              <h3 className="text-2xl font-extrabold text-white">Multi-agent AI brain</h3>
              <p className="text-sm sm:text-base text-[#7890a8] leading-relaxed max-w-xl">
                LangGraph orchestrates Gemini Flash, HuggingFace, and Groq in a 6-node pipeline — classify, extract, validate, encode, compose.
              </p>
            </div>
            <PipelineDiagram />
          </motion.div>

          {/* Card 2 - SoulBound Token (SMALL, 1 col, 1 row) */}
          <motion.div
            variants={cardVariants}
            whileHover={{
              y: -4,
              borderColor: 'rgba(168, 85, 247, 0.4)',
              backgroundColor: 'rgba(168, 85, 247, 0.04)',
            }}
            className="bg-white/[0.01] border border-white/[0.05] rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between transition-colors duration-300"
          >
            <div className="h-10 w-10 text-purple-400 text-3xl">
              🛡️
            </div>
            <div className="mt-8 space-y-2">
              <h3 className="text-xl font-bold text-white">Tamper-proof SBT</h3>
              <p className="text-sm text-[#7890a8] leading-relaxed">
                Non-transferable. Permanently yours. Cryptographically verifiable forever.
              </p>
            </div>
          </motion.div>

          {/* Card 3 - 3D World (TALL, 1 col, 2 rows) */}
          <motion.div
            variants={cardVariants}
            whileHover={{
              y: -4,
              borderColor: 'rgba(251, 191, 36, 0.4)',
              backgroundColor: 'rgba(251, 191, 36, 0.04)',
            }}
            className="md:row-span-2 bg-white/[0.01] border border-white/[0.05] rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between transition-colors duration-300 min-h-[400px]"
          >
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white">Immersive 3D gallery</h3>
              <p className="text-sm text-[#7890a8] leading-relaxed">
                Your credentials orbit you in a living 3D space. Click any card to inspect, verify, or share.
              </p>
            </div>
            <div className="mt-6 flex-grow flex items-center justify-center">
              <MiniCanvas />
            </div>
          </motion.div>

          {/* Card 4 - Gasless UGF (SMALL, 1 col, 1 row) */}
          <motion.div
            variants={cardVariants}
            whileHover={{
              y: -4,
              borderColor: 'rgba(16, 185, 129, 0.4)',
              backgroundColor: 'rgba(16, 185, 129, 0.04)',
            }}
            className="bg-white/[0.01] border border-white/[0.05] rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between transition-colors duration-300"
          >
            <div className="h-10 w-10 text-emerald-400 text-3xl">
              ⚡
            </div>
            <div className="mt-8 space-y-2">
              <h3 className="text-xl font-bold text-white">Zero ETH. Zero friction.</h3>
              <p className="text-sm text-[#7890a8] leading-relaxed">
                UGF's 5-stage pipeline executes transactions using Mock USD. No crypto knowledge needed.
              </p>
            </div>
          </motion.div>

          {/* Card 5 - Instant Verify (SMALL, 1 col, 1 row) */}
          <motion.div
            variants={cardVariants}
            whileHover={{
              y: -4,
              borderColor: 'rgba(59, 130, 246, 0.4)',
              backgroundColor: 'rgba(59, 130, 246, 0.04)',
            }}
            className="bg-white/[0.01] border border-white/[0.05] rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between transition-colors duration-300"
          >
            <div className="h-10 w-10 text-blue-400 text-3xl">
              ✓
            </div>
            <div className="mt-8 space-y-2">
              <h3 className="text-xl font-bold text-white">Verify in one click</h3>
              <p className="text-sm text-[#7890a8] leading-relaxed">
                Any employer or licensing board can verify any credential on-chain instantly. Free forever.
              </p>
            </div>
          </motion.div>

          {/* Card 6 - Peer Endorsements (SMALL, 1 col, 1 row) */}
          <motion.div
            variants={cardVariants}
            whileHover={{
              y: -4,
              borderColor: 'rgba(236, 72, 153, 0.4)',
              backgroundColor: 'rgba(236, 72, 153, 0.04)',
            }}
            className="bg-white/[0.01] border border-white/[0.05] rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between transition-colors duration-300"
          >
            <div className="h-10 w-10 text-pink-400 text-3xl">
              👥
            </div>
            <div className="mt-8 space-y-2">
              <h3 className="text-xl font-bold text-white">Peer endorsements</h3>
              <p className="text-sm text-[#7890a8] leading-relaxed">
                Colleagues endorse your skills on-chain. Adds social proof to your credentials.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </motion.section>
  );
};

export default React.memo(FeaturesSection);
