'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BACKEND_URL } from '../../lib/constants';

// High-performance requestAnimationFrame count-up hook
function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (target <= 0) return;
    
    let active = true;
    let animationFrameId: number;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && active) {
        let startTime: number | null = null;

        const animate = (timestamp: number) => {
          if (!startTime) startTime = timestamp;
          const progress = Math.min((timestamp - startTime) / duration, 1);
          const easeOutQuad = 1 - (1 - progress) * (1 - progress);
          setCount(Math.floor(easeOutQuad * target));
          
          if (progress < 1) {
            animationFrameId = requestAnimationFrame(animate);
          } else {
            setCount(target);
          }
        };

        animationFrameId = requestAnimationFrame(animate);
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    if (ref.current) observer.observe(ref.current);
    
    return () => {
      active = false;
      observer.disconnect();
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [target, duration]);
  
  return { count, ref };
}

interface StatsData {
  credentialsMinted: number;
  verificationsRun: number;
  endorsementsGiven: number;
  hoursLogged: number;
}

const marqueeEvents = [
  { type: "hospital", emoji: "🏥", text: "Dr. Chen claimed Cardiology Residency", time: "just now" },
  { type: "academic", emoji: "🎓", text: "James minted Academic Degree", time: "2m ago" },
  { type: "verify", emoji: "✓", text: "Memorial Hospital verified a credential", time: "5m ago" },
  { type: "clinical", emoji: "🩺", text: "Nurse Sarah claimed ICU Clinical Rotation", time: "12m ago" },
  { type: "verify", emoji: "✓", text: "Dr. Okafor verified Professional Certification", time: "15m ago" },
  { type: "academic", emoji: "🎓", text: "Priya Ramaswamy completed BLS Certification", time: "20m ago" },
  { type: "hospital", emoji: "🏥", text: "Stanford Medical School endorsed Cardiology Skill", time: "30m ago" },
  { type: "verify", emoji: "✓", text: "GenHospital verified Residency Completion", time: "45m ago" },
  { type: "academic", emoji: "🎓", text: "Marcus Webb claimed Stanford Research Publication", time: "1h ago" },
  { type: "clinical", emoji: "🩺", text: "Emily claimed Continuing Education 10 hours", time: "2h ago" }
];

// Duplicate items for seamless looping
const marqueeItems = [...marqueeEvents, ...marqueeEvents, ...marqueeEvents];

/* ─── Animated Radar Ring SVG ─── */
const RadarRing = ({ color, size = 60 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" className="absolute top-3 right-3 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
    <circle cx="30" cy="30" r="24" fill="none" stroke={color} strokeWidth="0.5" opacity="0.3" />
    <circle cx="30" cy="30" r="16" fill="none" stroke={color} strokeWidth="0.5" opacity="0.2" />
    <circle cx="30" cy="30" r="8" fill="none" stroke={color} strokeWidth="0.5" opacity="0.15" />
    <line x1="30" y1="6" x2="30" y2="54" stroke={color} strokeWidth="0.3" opacity="0.1" />
    <line x1="6" y1="30" x2="54" y2="30" stroke={color} strokeWidth="0.3" opacity="0.1" />
    {/* Rotating sweep line */}
    <line x1="30" y1="30" x2="30" y2="6" stroke={color} strokeWidth="1" opacity="0.6">
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 30 30"
        to="360 30 30"
        dur="4s"
        repeatCount="indefinite"
      />
    </line>
    {/* Pulsing dot */}
    <circle cx="30" cy="30" r="2" fill={color} opacity="0.8">
      <animate attributeName="r" values="1.5;3;1.5" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
    </circle>
  </svg>
);

const StatsCard = ({ 
  target, 
  label, 
  glowColor, 
  textColor, 
  borderColor,
  accentHex,
  icon,
  hashId,
}: { 
  target: number; 
  label: string; 
  glowColor: string; 
  textColor: string; 
  borderColor: string;
  accentHex: string;
  icon: React.ReactNode;
  hashId: string;
}) => {
  const { count, ref } = useCountUp(target, 2000);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const borderHoverClasses: Record<string, string> = {
    "cyan-500": "hover:border-cyan-500/30",
    "emerald-500": "hover:border-emerald-500/30",
    "purple-500": "hover:border-purple-500/30",
    "amber-500": "hover:border-amber-500/30",
  };

  const hoverBorderClass = borderHoverClasses[borderColor] || "hover:border-white/20";

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`relative overflow-hidden rounded-2xl bg-[#060a12]/80 border border-white/[0.04] p-6 sm:p-8 flex flex-col items-center justify-between text-center transition-all duration-500 backdrop-blur-md group ${hoverBorderClass} hover:shadow-[0_0_40px_-5px_rgba(0,0,0,0.4)]`}
    >
      {/* Animated top border glow */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentHex}, transparent)`,
          backgroundSize: '200% 100%',
        }}
        animate={{ backgroundPosition: ['200% 0%', '-200% 0%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />

      {/* Scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015] group-hover:opacity-[0.03] transition-opacity duration-300"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, ${accentHex}20, ${accentHex}20 1px, transparent 1px, transparent 3px)`,
        }}
      />

      {/* Dynamic Hover Radial Light */}
      <div
        className="absolute pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100"
        style={{
          width: '280px',
          height: '280px',
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          left: `${mousePosition.x - 140}px`,
          top: `${mousePosition.y - 140}px`,
          filter: 'blur(40px)',
        }}
      />

      {/* Radar Ring */}
      <RadarRing color={accentHex} />

      {/* SVG Icon Container with HUD frame */}
      <div className="relative z-10 mb-5">
        <div className="relative p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] group-hover:bg-white/[0.05] group-hover:border-white/[0.12] transition-all duration-300 shadow-inner">
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l opacity-30 group-hover:opacity-60 transition-opacity" style={{ borderColor: accentHex }} />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r opacity-30 group-hover:opacity-60 transition-opacity" style={{ borderColor: accentHex }} />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l opacity-30 group-hover:opacity-60 transition-opacity" style={{ borderColor: accentHex }} />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r opacity-30 group-hover:opacity-60 transition-opacity" style={{ borderColor: accentHex }} />
          {icon}
        </div>
      </div>

      {/* Counter with glitch styling */}
      <div ref={ref} className="relative z-10 flex flex-col items-center">
        <span className={`text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r ${textColor} bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105`}>
          {count.toLocaleString()}
        </span>
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-400/80 mt-3 group-hover:text-white transition-colors duration-300">
          {label}
        </span>
      </div>

      {/* On-chain hash readout */}
      <div className="relative z-10 mt-4 w-full flex items-center justify-center gap-1.5 text-[8px] font-mono text-slate-600 group-hover:text-slate-400 transition-colors duration-300">
        <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: accentHex }} />
        <span className="truncate max-w-[160px]">{hashId}</span>
      </div>

      {/* Bottom border glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </motion.div>
  );
};

const StatsSection = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/stats`);
        const json = await res.json();
        if (json.success && json.data) {
          setStats(json.data);
        } else {
          setStats({
            credentialsMinted: 142,
            verificationsRun: 859,
            endorsementsGiven: 311,
            hoursLogged: 4560,
          });
        }
      } catch (e) {
        console.error('Failed to fetch stats:', e);
        setStats({
          credentialsMinted: 142,
          verificationsRun: 859,
          endorsementsGiven: 311,
          hoursLogged: 4560,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <section className="relative overflow-hidden py-24 bg-[#030508] border-t border-b border-white/[0.04]">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-cyan-500/[0.02] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[350px] h-[350px] rounded-full bg-purple-500/[0.02] blur-[120px] pointer-events-none" />

      {/* Full-width subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,212,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Animated Headline */}
        <div className="text-center mb-16 relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold text-cyan-400 uppercase tracking-[0.3em] bg-cyan-950/20 border border-cyan-500/20 px-3.5 py-1.5 rounded-full inline-block mb-4 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
          >
            <span className="inline-flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400" />
              </span>
              Network Operations Center
            </span>
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight"
          >
            Trust Infrastructure{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              At Scale
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto font-medium"
          >
            Verifiably tracking credentials, processing validations, and logging hours across decentralized platforms in real-time.
          </motion.p>
        </div>

        {/* 4 Premium Metric Grid Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-900/35 border border-white/[0.04] rounded-2xl p-8 h-[260px] flex flex-col justify-between items-center">
                <div className="h-14 w-14 rounded-2xl bg-slate-800/40" />
                <div className="h-8 bg-slate-800/40 rounded w-2/3 mt-6" />
                <div className="h-3 bg-slate-800/30 rounded w-1/2 mt-4" />
              </div>
            ))}
          </div>
        ) : (
          stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              <StatsCard 
                target={stats.credentialsMinted} 
                label="Credentials Minted" 
                glowColor="rgba(6,182,212,0.08)" 
                textColor="from-cyan-400 to-blue-500" 
                borderColor="cyan-500" 
                accentHex="#00d4ff"
                hashId="0x7f3a...b2c1 · contract: SBT_REGISTRY"
                icon={
                  <svg className="w-7 h-7 text-cyan-400 transition-transform duration-500 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
                    <polygon points="12 11 13.5 14.5 17 14.5 14 16.5 15.5 20 12 18 8.5 20 10 16.5 7 14.5 10.5 14.5" fill="currentColor" fillOpacity="0.2" className="origin-center group-hover:animate-pulse" />
                  </svg>
                }
              />
              <StatsCard 
                target={stats.verificationsRun} 
                label="Verifications Done" 
                glowColor="rgba(16,185,129,0.08)" 
                textColor="from-emerald-400 to-teal-500" 
                borderColor="emerald-500" 
                accentHex="#10b981"
                hashId="0xa4e2...9f01 · method: verifyOnChain()"
                icon={
                  <svg className="w-7 h-7 text-emerald-400 transition-transform duration-500 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="4" y="3" width="16" height="18" rx="2" strokeLinecap="round" />
                    <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
                    <path d="m10.5 12 1 1 2-2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                }
              />
              <StatsCard 
                target={stats.endorsementsGiven} 
                label="Peer Endorsements" 
                glowColor="rgba(168,85,247,0.08)" 
                textColor="from-purple-400 to-fuchsia-500" 
                borderColor="purple-500" 
                accentHex="#a855f7"
                hashId="0xd9c1...e4b7 · event: EndorsementMinted"
                icon={
                  <svg className="w-7 h-7 text-purple-400 transition-transform duration-500 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2a5 5 0 1 0 0 10 5 5 0 1 0 0-10z" fill="currentColor" fillOpacity="0.1" />
                    <circle cx="6" cy="18" r="3" fill="currentColor" fillOpacity="0.1" />
                    <circle cx="18" cy="18" r="3" fill="currentColor" fillOpacity="0.1" />
                    <path d="M10 10l-2.5 5.5M14 10l2.5 5.5M9 18h6" strokeDasharray="2 2" />
                    <circle cx="12" cy="7" r="1.5" fill="currentColor" />
                  </svg>
                }
              />
              <StatsCard 
                target={stats.hoursLogged} 
                label="Hours On-Chain" 
                glowColor="rgba(245,158,11,0.08)" 
                textColor="from-amber-400 to-orange-500" 
                borderColor="amber-500" 
                accentHex="#f59e0b"
                hashId="0x2e8b...c3a0 · log: HoursCommitted"
                icon={
                  <svg className="w-7 h-7 text-amber-400 transition-transform duration-500 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 6v6l3 2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="origin-center" style={{ transformOrigin: "12px 12px" }} />
                  </svg>
                }
              />
            </div>
          )
        )}

        {/* Live Network Activity Feed Header */}
        <div className="mt-24 relative z-10">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Live Activity Feed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-mono text-slate-600 hidden sm:inline">BLOCK_LISTENER: ACTIVE</span>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-500 tracking-wider">Updates dynamically</span>
            </div>
          </div>
        </div>

        {/* Bottom Row: scrolling marquee of recent activity */}
        <div className="mt-6 relative w-full overflow-hidden py-3">
          {/* Faders for left/right edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-36 bg-gradient-to-r from-[#030508] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-36 bg-gradient-to-l from-[#030508] to-transparent z-10 pointer-events-none" />

          <div className="marquee-container overflow-hidden w-full">
            <div className="marquee-track flex gap-4 items-center w-max animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused]">
              {marqueeItems.map((item, idx) => {
                let badgeStyle = "bg-cyan-500/10 border-cyan-500/20 text-cyan-400";
                if (item.type === "academic") badgeStyle = "bg-purple-500/10 border-purple-500/20 text-purple-400";
                if (item.type === "clinical") badgeStyle = "bg-amber-500/10 border-amber-500/20 text-amber-400";
                if (item.type === "verify") badgeStyle = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";

                return (
                  <div
                    key={idx}
                    className="px-4 py-2.5 rounded-xl bg-[#060a12]/60 border border-white/[0.04] text-[11px] sm:text-xs font-semibold text-slate-300 flex items-center gap-3 hover:border-cyan-500/30 hover:bg-slate-900/60 transition-all duration-300 whitespace-nowrap backdrop-blur-sm cursor-default group/item"
                  >
                    {/* Emoji indicator */}
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs border ${badgeStyle} shadow-inner`}>
                      {item.emoji}
                    </span>
                    
                    {/* Event Detail */}
                    <span>{item.text}</span>
                    
                    {/* Time Badge */}
                    <span className="text-[10px] text-slate-500 font-medium bg-white/[0.02] border border-white/[0.05] px-2 py-0.5 rounded-full ml-1">
                      {item.time}
                    </span>

                    {/* Verified indicator on hover */}
                    <span className="w-1 h-1 rounded-full bg-emerald-400 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default React.memo(StatsSection);
