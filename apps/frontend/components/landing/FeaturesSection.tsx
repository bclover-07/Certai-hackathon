'use client';

import React, { useRef, useCallback, useState, useMemo, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
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

function Magnetic({ children, range = 80 }: { children: React.ReactNode; range?: number }) {
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
      const factor = 0.25;
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
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  );
}

const BinaryRain = () => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const streams = useMemo(() => {
    if (!mounted) return [];
    return Array.from({ length: 8 }).map((_, i) => {
      const delay = Math.random() * -10;
      const duration = 5 + Math.random() * 7;
      const left = (i / 8) * 100 + (Math.random() * 8 - 4);
      const chars = Array.from({ length: 15 })
        .map(() => (Math.random() > 0.5 ? '1' : '0'))
        .join('\n');
      return { left, delay, duration, chars };
    });
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500 z-0">
      {streams.map((stream, idx) => (
        <div
          key={idx}
          className="absolute text-[7px] font-mono text-cyan-400 whitespace-pre leading-none"
          style={{
            left: `${stream.left}%`,
            top: -120,
            animation: `matrixRain ${stream.duration}s linear infinite`,
            animationDelay: `${stream.delay}s`,
          }}
        >
          {stream.chars}
        </div>
      ))}
      <style>{`
        @keyframes matrixRain {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(400px); }
        }
      `}</style>
    </div>
  );
};

/* ─── 3D Tilt Card Wrapper ─── */
const TiltCard = ({
  children,
  className,
  glowColor = 'rgba(0, 212, 255, 0.15)',
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useTransform(mouseY, [0, 1], [5, -5]);
  const rotateY = useTransform(mouseX, [0, 1], [-5, 5]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 800,
      }}
      whileHover={{
        borderColor: glowColor,
        boxShadow: `0 8px 40px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
      className={`group bg-white/[0.01] border border-white/[0.05] rounded-3xl relative overflow-hidden transition-all duration-500 ${className || ''}`}
    >
      {/* Falling Binary Background */}
      <BinaryRain />
      
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </motion.div>
  );
};

/* ─── Animated Pipeline Diagram ─── */
const PipelineDiagram = () => {
  const [activeNode, setActiveNode] = useState(-1);

  const nodes = [
    { label: 'IN', x: 20, desc: 'Input' },
    { label: 'CLS', x: 120, desc: 'Classify' },
    { label: 'EXT', x: 220, desc: 'Extract' },
    { label: 'VAL', x: 320, desc: 'Validate' },
    { label: 'ENC', x: 420, desc: 'Encode' },
    { label: 'CMP', x: 520, desc: 'Compose' },
  ];

  return (
    <div className="w-full bg-[#030508]/40 border border-cyan-500/10 rounded-xl p-4 mt-6">
      <svg
        className="w-full h-20 sm:h-24"
        viewBox="0 0 540 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Animated connecting lines */}
        {[40, 140, 240, 340, 440].map((startX, i) => (
          <g key={`line-${i}`}>
            <path
              d={`M${startX} 40H${startX + 60}`}
              stroke={activeNode >= i + 1 ? '#00d4ff' : '#00d4ff40'}
              strokeWidth="2"
              strokeDasharray="6, 6"
              className="animate-[dash_10s_linear_infinite]"
            />
            {/* Animated dot traveling along the path */}
            <circle r="2" fill="#00d4ff" opacity="0.8">
              <animateMotion
                dur={`${2 + i * 0.3}s`}
                repeatCount="indefinite"
                path={`M${startX},40 L${startX + 60},40`}
              />
            </circle>
          </g>
        ))}

        {/* Nodes */}
        {nodes.map((node, i) => (
          <g
            key={node.label}
            onMouseEnter={() => setActiveNode(i)}
            onMouseLeave={() => setActiveNode(-1)}
            style={{ cursor: 'pointer' }}
          >
            {/* Glow ring on active */}
            {activeNode === i && (
              <circle
                cx={node.x}
                cy="40"
                r="22"
                fill="none"
                stroke="#00d4ff"
                strokeWidth="1"
                opacity="0.3"
              >
                <animate
                  attributeName="r"
                  from="16"
                  to="24"
                  dur="0.8s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.4"
                  to="0"
                  dur="0.8s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
            <circle
              cx={node.x}
              cy="40"
              r="14"
              fill={activeNode === i ? '#0a1628' : '#030508'}
              stroke={activeNode === i ? '#00d4ff' : '#00d4ff80'}
              strokeWidth="2"
            />
            <text
              x={node.x}
              y="44"
              fill={activeNode === i ? '#00d4ff' : '#00d4ff80'}
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="monospace"
            >
              {node.label}
            </text>
            {/* Label below */}
            <text
              x={node.x}
              y="70"
              fill={activeNode === i ? '#00d4ff' : '#64748b'}
              fontSize="8"
              textAnchor="middle"
              fontFamily="sans-serif"
              fontWeight="600"
            >
              {node.desc}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

/* ─── Animated Icon with pulse ring ─── */
const PulseIcon = ({ emoji, color }: { emoji: string; color: string }) => (
  <Magnetic range={65}>
    <div className="relative h-12 w-12 cursor-pointer select-none">
      <div
        className="absolute inset-0 rounded-xl animate-pulse-glow"
        style={{
          background: `${color}10`,
          boxShadow: `0 0 20px ${color}15`,
        }}
      />
      <div className="relative h-12 w-12 rounded-xl flex items-center justify-center text-3xl">
        {emoji}
      </div>
    </div>
  </Magnetic>
);

const FeaturesSection = () => {
  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      className="bg-[#090d14] py-[100px] border-t border-slate-900 px-6 sm:px-8 lg:px-16"
      style={{ perspective: '1200px' }}
    >
      <div className="max-w-[1200px] mx-auto space-y-16">
        {/* Title */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
              Core Features
            </span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Everything you need.{' '}
            <span className="bg-gradient-to-r from-slate-500 to-slate-700 bg-clip-text text-transparent">
              Nothing you don&apos;t.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-500 font-medium max-w-2xl mx-auto">
            Cutting-edge cryptographic security and instant AI verification — all in one platform.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-auto">
          {/* Card 1 - LangGraph AI Agent (LARGE, 2 cols) */}
          <TiltCard
            className="md:col-span-2 p-8 flex flex-col justify-between"
            glowColor="rgba(6, 182, 212, 0.25)"
          >
            {/* Animated gradient border top */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-40" />
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <PulseIcon emoji="🧠" color="#00d4ff" />
                <div>
                  <h3 className="text-2xl font-extrabold text-white">Multi-agent AI brain</h3>
                  <span className="text-[10px] font-mono text-cyan-500/60 uppercase tracking-widest">
                    LangGraph · Gemini Flash · HuggingFace
                  </span>
                </div>
              </div>
              <p className="text-sm sm:text-base text-[#7890a8] leading-relaxed max-w-xl">
                LangGraph orchestrates Gemini Flash, HuggingFace, and Groq in a 6-node pipeline — classify, extract, validate, encode, compose.
              </p>
            </div>
            <PipelineDiagram />
          </TiltCard>

          {/* Card 2 - SoulBound Token */}
          <TiltCard className="p-8 flex flex-col justify-between" glowColor="rgba(168, 85, 247, 0.25)">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-40" />
            <PulseIcon emoji="🛡️" color="#a855f7" />
            <div className="mt-8 space-y-2">
              <h3 className="text-xl font-bold text-white">Tamper-proof SBT</h3>
              <p className="text-sm text-[#7890a8] leading-relaxed">
                Non-transferable. Permanently yours. Cryptographically verifiable forever.
              </p>
            </div>
            {/* Mini visual: fake token ID */}
            <div className="mt-4 px-3 py-2 rounded-lg bg-purple-500/5 border border-purple-500/10">
              <span className="text-[9px] font-mono text-purple-400/60">
                tokenId: 0x7f3a...b2c1 · soulbound: true
              </span>
            </div>
          </TiltCard>

          {/* Card 3 - 3D World (TALL) */}
          <TiltCard
            className="md:row-span-2 p-8 flex flex-col justify-between min-h-[400px]"
            glowColor="rgba(251, 191, 36, 0.25)"
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-40" />
            <div className="space-y-3">
              <PulseIcon emoji="🌐" color="#f59e0b" />
              <h3 className="text-xl font-bold text-white">Immersive 3D gallery</h3>
              <p className="text-sm text-[#7890a8] leading-relaxed">
                Your credentials orbit you in a living 3D space. Click any card to inspect, verify, or share.
              </p>
            </div>
            <div className="mt-6 flex-grow flex items-center justify-center">
              <MiniCanvas />
            </div>
          </TiltCard>

          {/* Card 4 - Gasless UGF */}
          <TiltCard className="p-8 flex flex-col justify-between" glowColor="rgba(16, 185, 129, 0.25)">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-40" />
            <PulseIcon emoji="⚡" color="#10b981" />
            <div className="mt-8 space-y-2">
              <h3 className="text-xl font-bold text-white">Zero ETH. Zero friction.</h3>
              <p className="text-sm text-[#7890a8] leading-relaxed">
                UGF's 5-stage pipeline executes transactions using Mock USD. No crypto knowledge needed.
              </p>
            </div>
            {/* Cost comparison mini */}
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 h-1 rounded-full bg-red-500/20 relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-[80%] bg-red-500/50 rounded-full" />
              </div>
              <span className="text-[9px] font-mono text-red-400/60 line-through">$12.40</span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">$0.00</span>
            </div>
          </TiltCard>

          {/* Card 5 - Instant Verify */}
          <TiltCard className="p-8 flex flex-col justify-between" glowColor="rgba(59, 130, 246, 0.25)">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-40" />
            <PulseIcon emoji="✓" color="#3b82f6" />
            <div className="mt-8 space-y-2">
              <h3 className="text-xl font-bold text-white">Verify in one click</h3>
              <p className="text-sm text-[#7890a8] leading-relaxed">
                Any employer or licensing board can verify any credential on-chain instantly. Free forever.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[9px] font-mono text-blue-400/50">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              avg. verification: 0.3s
            </div>
          </TiltCard>

          {/* Card 6 - Peer Endorsements */}
          <TiltCard className="p-8 flex flex-col justify-between" glowColor="rgba(236, 72, 153, 0.25)">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-pink-400 to-transparent opacity-40" />
            <PulseIcon emoji="👥" color="#ec4899" />
            <div className="mt-8 space-y-2">
              <h3 className="text-xl font-bold text-white">Peer endorsements</h3>
              <p className="text-sm text-[#7890a8] leading-relaxed">
                Colleagues endorse your skills on-chain. Adds social proof to your credentials.
              </p>
            </div>
            {/* Mini endorsement avatars */}
            <div className="mt-4 flex items-center -space-x-2">
              {['bg-pink-500', 'bg-purple-500', 'bg-cyan-500', 'bg-emerald-500'].map((bg, i) => (
                <div
                  key={i}
                  className={`h-6 w-6 rounded-full ${bg} border-2 border-[#090d14] flex items-center justify-center text-[8px] font-bold text-white`}
                >
                  {['Dr', 'RN', 'PA', 'MD'][i]}
                </div>
              ))}
              <span className="ml-3 text-[9px] text-pink-400/60 font-mono">+12 endorsements</span>
            </div>
          </TiltCard>
        </div>
      </div>
    </motion.section>
  );
};

export default React.memo(FeaturesSection);
