'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

/* ─── Sample Claims ─── */
const SAMPLE_CLAIMS = [
  'I completed a 40-hour Advanced Cardiac Life Support certification at Memorial Hospital in June 2024',
  'I finished my 3-year Cardiology residency at Johns Hopkins Medical Center',
  'Completed 120 CME credits in Emergency Medicine from Harvard Medical School',
  'I hold a Board Certification in Internal Medicine from ABIM, passed March 2024',
  'Finished 500-hour clinical rotation in Pediatric Surgery at Mayo Clinic',
];

/* ─── Extracted Field Type ─── */
interface ExtractedField {
  label: string;
  value: string;
  confidence: number;
  color: string;
}

/* ─── Simulate AI extraction from a claim ─── */
function simulateExtraction(claim: string): ExtractedField[] {
  const lc = claim.toLowerCase();
  const fields: ExtractedField[] = [];

  // credential type
  if (lc.includes('acls') || lc.includes('cardiac life support')) {
    fields.push({ label: 'Credential Type', value: 'ACLS Certification', confidence: 0.97, color: '#00d4ff' });
  } else if (lc.includes('residency')) {
    fields.push({ label: 'Credential Type', value: 'Medical Residency', confidence: 0.96, color: '#00d4ff' });
  } else if (lc.includes('cme') || lc.includes('continuing')) {
    fields.push({ label: 'Credential Type', value: 'CME Credits', confidence: 0.94, color: '#00d4ff' });
  } else if (lc.includes('board certification') || lc.includes('board certified')) {
    fields.push({ label: 'Credential Type', value: 'Board Certification', confidence: 0.98, color: '#00d4ff' });
  } else if (lc.includes('rotation') || lc.includes('clinical')) {
    fields.push({ label: 'Credential Type', value: 'Clinical Rotation', confidence: 0.93, color: '#00d4ff' });
  } else {
    fields.push({ label: 'Credential Type', value: 'Professional Credential', confidence: 0.88, color: '#00d4ff' });
  }

  // institution
  const instMatch = claim.match(/(?:at|from|by)\s+([A-Z][A-Za-z\s]+(?:Hospital|Center|School|Clinic|University|Medical|Institute|College))/i);
  if (instMatch) {
    fields.push({ label: 'Institution', value: instMatch[1].trim(), confidence: 0.95, color: '#a855f7' });
  }

  // hours/duration
  const hoursMatch = claim.match(/(\d+)[\s-]*(?:hour|hr)/i);
  const yearMatch = claim.match(/(\d+)[\s-]*year/i);
  if (hoursMatch) {
    fields.push({ label: 'Duration', value: `${hoursMatch[1]} Hours`, confidence: 0.99, color: '#10b981' });
  } else if (yearMatch) {
    fields.push({ label: 'Duration', value: `${yearMatch[1]} Year(s)`, confidence: 0.97, color: '#10b981' });
  }

  // date
  const dateMatch = claim.match(/((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}|\d{4})/i);
  if (dateMatch) {
    fields.push({ label: 'Date', value: dateMatch[1], confidence: 0.92, color: '#f59e0b' });
  }

  if (fields.length < 2) {
    fields.push({ label: 'Specialty', value: 'Medicine', confidence: 0.85, color: '#a855f7' });
  }

  return fields;
}

/* ─── Animated Confidence Bar ─── */
const ConfidenceBar = ({ value, color, delay }: { value: number; color: string; delay: number }) => (
  <div className="flex items-center gap-2 w-full">
    <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value * 100}%` }}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
        className="h-full rounded-full"
        style={{ background: color, boxShadow: `0 0 8px ${color}60` }}
      />
    </div>
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay + 0.4 }}
      className="text-[10px] font-mono font-bold tabular-nums"
      style={{ color }}
    >
      {(value * 100).toFixed(1)}%
    </motion.span>
  </div>
);

/* ─── Scan Line ─── */
const ScanLine = () => (
  <motion.div
    className="absolute left-0 right-0 pointer-events-none z-20 overflow-hidden"
    style={{
      height: '100px',
      background: 'linear-gradient(180deg, rgba(0, 212, 255, 0.2) 0%, rgba(0, 212, 255, 0.04) 70%, transparent 100%)',
      borderTop: '2.5px solid rgba(0, 212, 255, 0.85)',
      boxShadow: '0 -8px 25px rgba(0, 212, 255, 0.25), inset 0 4px 15px rgba(0, 212, 255, 0.08)',
      backdropFilter: 'blur(0.5px)',
    }}
    initial={{ top: '-100px', opacity: 0 }}
    animate={{ top: ['-100px', '100%'], opacity: [0, 1, 1, 0] }}
    transition={{ duration: 1.8, ease: 'easeInOut' }}
  />
);

/* ─── Phase States ─── */
type Phase = 'idle' | 'typing' | 'scanning' | 'extracting' | 'minting' | 'done';

/* ─── 3D Rotating Credential Cube ─── */
const CredentialCube = ({ phase }: { phase: Phase }) => {
  return (
    <div className="relative w-36 h-36 flex items-center justify-center pointer-events-none" style={{ perspective: '400px' }}>
      {/* Outer holographic ring */}
      <motion.div
        className="absolute w-32 h-32 border border-dashed rounded-full border-cyan-500/20"
        style={{ transform: 'rotateX(75deg)' }}
        animate={{ rotateZ: 360 }}
        transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
      />
      {/* Inner fast ring */}
      <motion.div
        className="absolute w-24 h-24 border border-purple-500/25 rounded-full"
        style={{ transform: 'rotateX(60deg) rotateY(15deg)' }}
        animate={{ rotateZ: -360 }}
        transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
      />

      <motion.div
        className="w-14 h-14 relative"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{
          rotateY: phase === 'scanning' ? [0, 360] : phase === 'minting' ? [0, 360] : [0, 360],
          rotateX: phase === 'scanning' ? [15, 45, 15] : phase === 'minting' ? [15, 60, 15] : [15, 30, 15],
          scale: phase === 'scanning' ? [0.95, 1.05, 0.95] : phase === 'minting' ? [1, 1.25, 1] : 1,
        }}
        transition={{
          rotateY: { repeat: Infinity, duration: phase === 'scanning' ? 4 : phase === 'minting' ? 2 : 12, ease: "linear" },
          rotateX: { repeat: Infinity, duration: 6, ease: "easeInOut" },
          scale: { repeat: Infinity, duration: phase === 'scanning' ? 2 : phase === 'minting' ? 1 : 4, ease: "easeInOut" }
        }}
      >
        {/* Cube Faces */}
        {['front', 'back', 'left', 'right', 'top', 'bottom'].map((face) => {
          let transformStyle = '';
          if (face === 'front') transformStyle = 'rotateY(0deg) translateZ(28px)';
          if (face === 'back') transformStyle = 'rotateY(180deg) translateZ(28px)';
          if (face === 'left') transformStyle = 'rotateY(-90deg) translateZ(28px)';
          if (face === 'right') transformStyle = 'rotateY(90deg) translateZ(28px)';
          if (face === 'top') transformStyle = 'rotateX(90deg) translateZ(28px)';
          if (face === 'bottom') transformStyle = 'rotateX(-90deg) translateZ(28px)';

          let borderColor = 'border-cyan-500/35';
          let bgColor = 'bg-cyan-950/15';
          let glowColor = 'rgba(6, 182, 212, 0.1)';

          if (phase === 'scanning') {
            borderColor = 'border-cyan-400/70';
            bgColor = 'bg-cyan-500/20';
            glowColor = 'rgba(0, 212, 255, 0.3)';
          } else if (phase === 'extracting') {
            borderColor = 'border-purple-500/70';
            bgColor = 'bg-purple-950/20';
            glowColor = 'rgba(168, 85, 247, 0.3)';
          } else if (phase === 'minting') {
            borderColor = 'border-amber-500/80 animate-pulse';
            bgColor = 'bg-amber-950/30';
            glowColor = 'rgba(245, 158, 11, 0.4)';
          } else if (phase === 'done') {
            borderColor = 'border-emerald-500/90';
            bgColor = 'bg-emerald-950/30';
            glowColor = 'rgba(16, 185, 129, 0.4)';
          }

          return (
            <div
              key={face}
              className={`absolute inset-0 border rounded backdrop-blur-[1px] transition-colors duration-500 flex items-center justify-center ${borderColor} ${bgColor}`}
              style={{
                transform: transformStyle,
                backfaceVisibility: 'visible',
                boxShadow: `inset 0 0 10px ${glowColor}`,
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};

/* ─── 3D Glassmorphic SBT Card ─── */
const SBTCard = ({ fields, txHash }: { fields: ExtractedField[]; txHash: string }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    setTilt({ x: x * 20, y: -y * 20 }); // Up to 20 degrees tilt
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const typeField = fields.find((f) => f.label === 'Credential Type')?.value || 'Credential';
  const instField = fields.find((f) => f.label === 'Institution')?.value || 'Certified Authority';
  const dateField = fields.find((f) => f.label === 'Date')?.value || 'Verified Date';

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY: tilt.x,
        rotateX: tilt.y,
        transformStyle: 'preserve-3d',
        perspective: '600px',
      }}
      initial={{ scale: 0.9, opacity: 0, y: 15 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 12 }}
      className="relative w-[300px] h-[190px] rounded-xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-[#060a12]/95 to-cyan-500/10 p-5 shadow-[0_15px_35px_rgba(0,0,0,0.6),0_0_20px_rgba(16,185,129,0.15)] overflow-hidden cursor-grab active:cursor-grabbing"
    >
      {/* Volumetric light reflection sweep */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none" />

      {/* Grid Pattern inside Card */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />

      {/* Chip and Seal */}
      <div className="flex justify-between items-start mb-3" style={{ transform: 'translateZ(20px)' }}>
        <div className="flex flex-col">
          <span className="text-[8px] font-mono text-emerald-400/70 tracking-widest font-extrabold uppercase">SOULBOUND CREDENTIAL</span>
          <h4 className="text-xs font-black text-white tracking-tight uppercase mt-0.5 max-w-[200px] truncate">{typeField}</h4>
        </div>
        <div className="h-6 w-6 rounded bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.25)] shrink-0">
          <svg className="h-3.5 w-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
      </div>

      {/* Card Details */}
      <div className="space-y-2 mt-3" style={{ transform: 'translateZ(15px)' }}>
        <div>
          <span className="text-[7.5px] font-mono text-slate-500 uppercase tracking-widest font-bold">ISSUED TO</span>
          <p className="text-[10.5px] font-mono font-bold text-slate-300 truncate">Verified On-Chain Agent</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[7.5px] font-mono text-slate-500 uppercase tracking-widest font-bold">AUTHORITY</span>
            <p className="text-[9.5px] font-mono font-bold text-slate-300 truncate">{instField}</p>
          </div>
          <div>
            <span className="text-[7.5px] font-mono text-slate-500 uppercase tracking-widest font-bold">VERIFIED ON</span>
            <p className="text-[9.5px] font-mono font-bold text-slate-300">{dateField}</p>
          </div>
        </div>
      </div>

      {/* Card Footer: Logo + Tx */}
      <div className="absolute bottom-3 left-5 right-5 flex justify-between items-center border-t border-slate-800/60 pt-2" style={{ transform: 'translateZ(10px)' }}>
        <span className="text-[8px] font-mono text-slate-500 truncate max-w-[170px]">
          TX: {txHash ? `${txHash.slice(0, 12)}…${txHash.slice(-10)}` : '0x0000...0000'}
        </span>
        <span className="text-[9px] font-black tracking-widest text-emerald-400 flex items-center gap-1">
          CERT<span className="text-white">AI</span>
        </span>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */
const SandboxSection = () => {
  const [claim, setClaim] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [fields, setFields] = useState<ExtractedField[]>([]);
  const [overallConfidence, setOverallConfidence] = useState(0);
  const [txHash, setTxHash] = useState('');
  const [activeExample, setActiveExample] = useState(-1);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Mouse-tracking glow for the sandbox card
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glowX = useTransform(mouseX, (v) => `${v}px`);
  const glowY = useTransform(mouseY, (v) => `${v}px`);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = parseFloat((e.clientX - rect.left).toFixed(2));
    const y = parseFloat((e.clientY - rect.top).toFixed(2));
    setCoords({ x, y });
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }, [mouseX, mouseY]);

  // Generate fake tx hash
  const genTxHash = () => {
    const hex = '0123456789abcdef';
    let h = '0x';
    for (let i = 0; i < 64; i++) h += hex[Math.floor(Math.random() * 16)];
    return h;
  };

  /* ─── Run the full sandbox pipeline ─── */
  const runPipeline = useCallback(async (text: string) => {
    if (!text.trim() || phase !== 'idle') return;

    setPhase('scanning');
    setFields([]);
    setOverallConfidence(0);
    setTxHash('');

    // Phase 1: scanning (1.2s)
    await new Promise((r) => setTimeout(r, 1200));

    // Phase 2: extraction
    setPhase('extracting');
    const extracted = simulateExtraction(text);
    setFields(extracted);

    // Calculate overall confidence
    const avg = extracted.reduce((s, f) => s + f.confidence, 0) / extracted.length;
    await new Promise((r) => setTimeout(r, 1800));
    setOverallConfidence(avg);

    // Phase 3: minting
    setPhase('minting');
    await new Promise((r) => setTimeout(r, 1400));
    setTxHash(genTxHash());

    // Phase 4: done
    setPhase('done');
  }, [phase]);

  /* ─── Use a sample claim ─── */
  const selectSample = (idx: number) => {
    if (phase !== 'idle') return;
    setActiveExample(idx);
    setClaim(SAMPLE_CLAIMS[idx]);
    textareaRef.current?.focus();
  };

  /* ─── Reset ─── */
  const reset = () => {
    setPhase('idle');
    setClaim('');
    setFields([]);
    setOverallConfidence(0);
    setTxHash('');
    setActiveExample(-1);
  };

  /* ─── Status badge text ─── */
  const statusText: Record<Phase, string> = {
    idle: '● Ready',
    typing: '● Composing',
    scanning: '◌ Scanning Claim…',
    extracting: '◎ Extracting Fields…',
    minting: '◈ Minting SBT…',
    done: '✓ Credential Minted',
  };

  const statusColor: Record<Phase, string> = {
    idle: '#94a3b8',
    typing: '#00d4ff',
    scanning: '#00d4ff',
    extracting: '#a855f7',
    minting: '#f59e0b',
    done: '#10b981',
  };

  return (
    <section
      ref={sectionRef}
      id="sandbox-section"
      className="relative py-24 sm:py-32 bg-[#030508] overflow-hidden"
    >
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/[0.04] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/[0.04] blur-[120px] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-16">
        {/* ─── Section Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center space-y-4 mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-4 py-1.5 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            Interactive Playground
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Try It{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
              Right Now
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Type any clinical or academic achievement below and watch our AI engine extract, validate,
            and simulate a gasless SoulBound mint — all in real time.
          </p>
        </motion.div>

        {/* ─── Main Sandbox Card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          onMouseMove={handleMouseMove}
          className="relative rounded-2xl border border-slate-800/80 bg-[#060a12]/80 backdrop-blur-xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)]"
        >
          {/* Mouse-tracking glow */}
          <motion.div
            className="absolute w-[300px] h-[300px] rounded-full pointer-events-none opacity-[0.07] -translate-x-1/2 -translate-y-1/2 z-0"
            style={{
              left: glowX,
              top: glowY,
              background: 'radial-gradient(circle, rgba(0,212,255,1) 0%, transparent 70%)',
            }}
          />

          {/* HUD Corner Brackets */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-500/40 z-20 pointer-events-none" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-500/40 z-20 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-500/40 z-20 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-500/40 z-20 pointer-events-none" />

          {/* ─── Terminal Header ─── */}
          <div className="relative z-10 flex items-center justify-between px-5 py-3 border-b border-slate-800/60 bg-[#0a0f1a]/60">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500/60" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
                <span className="h-3 w-3 rounded-full bg-green-500/60" />
              </div>
              <span className="text-[11px] font-mono text-slate-500 ml-3">certai-sandbox.sh</span>
            </div>
            
            {/* Coordinates Tracker and status */}
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-[9px] font-mono text-slate-500 tracking-wider">
                [GRID_TRK: X:{coords.x.toFixed(1)} Y:{coords.y.toFixed(1)}]
              </span>
              <motion.span
                key={phase}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[11px] font-mono font-bold"
                style={{ color: statusColor[phase] }}
              >
                {statusText[phase]}
              </motion.span>
            </div>
          </div>

          {/* ─── Body ─── */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[420px]">
            {/* LEFT: Input Panel */}
            <div className="p-6 sm:p-8 flex flex-col gap-5 border-b lg:border-b-0 lg:border-r border-slate-800/40">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Your Claim
                </label>
                <div className="relative overflow-hidden rounded-xl">
                  <textarea
                    ref={textareaRef}
                    value={claim}
                    onChange={(e) => {
                      setClaim(e.target.value);
                    }}
                    disabled={phase !== 'idle'}
                    placeholder="Type your clinical or academic achievement here…"
                    className="w-full h-28 bg-[#030508] border border-slate-800/80 rounded-xl px-4 py-3 text-sm text-white font-mono resize-none focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 placeholder:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
                  />
                  {phase === 'scanning' && <ScanLine />}
                </div>
              </div>

              {/* Sample Claims */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                  Or try an example:
                </span>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_CLAIMS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => selectSample(i)}
                      disabled={phase !== 'idle'}
                      className={`text-[10px] px-3 py-1.5 rounded-full border font-semibold transition-all duration-200 ${
                        activeExample === i
                          ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                          : 'bg-white/[0.02] border-slate-800 text-slate-500 hover:border-cyan-500/20 hover:text-slate-300'
                      } disabled:opacity-30 disabled:cursor-not-allowed`}
                    >
                      {s.slice(0, 35)}…
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-auto">
                {phase === 'idle' ? (
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(0,212,255,0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => runPipeline(claim)}
                    disabled={!claim.trim()}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    ⚡ Attest &amp; Mint (Simulated)
                  </motion.button>
                ) : phase === 'done' ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={reset}
                    className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 text-sm font-bold hover:border-cyan-500/30 hover:text-white transition-all duration-200"
                  >
                    ↻ Try Another Claim
                  </motion.button>
                ) : (
                  <div className="flex-1 py-3 rounded-xl border border-slate-800/60 text-center text-sm text-slate-500 font-semibold">
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Processing…
                    </motion.span>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Output Panel */}
            <div className="p-6 sm:p-8 flex flex-col gap-5 bg-[#040810]/40 relative">
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                  AI Analysis Output
                </div>
                <span className="text-[9px] font-mono text-slate-600">
                  SYSTEM_DGN: {phase.toUpperCase()}
                </span>
              </div>

              {/* Holographic Visualization Window */}
              <div className="h-52 w-full flex items-center justify-center relative overflow-hidden bg-[#03060c]/60 border border-slate-800/40 rounded-xl py-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.6)]">
                {/* Visualizer sci-fi grid backing */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:14px_14px] pointer-events-none" />
                <div className="absolute inset-0 bg-radial-gradient-to-c from-cyan-500/[0.02] to-transparent pointer-events-none" />
                
                {/* Outer corners within visualization window */}
                <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-slate-700/50" />
                <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-slate-700/50" />
                <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-slate-700/50" />
                <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-slate-700/50" />

                <AnimatePresence mode="wait">
                  {phase !== 'done' ? (
                    <motion.div
                      key="cube"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex flex-col items-center justify-center"
                    >
                      <CredentialCube phase={phase} />
                      {phase === 'idle' && (
                        <p className="text-[10px] font-mono text-slate-500 mt-2">
                          [WAITING FOR ATTESTATION INPUT]
                        </p>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="card"
                      initial={{ opacity: 0, scale: 0.8, rotateX: -20 }}
                      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <SBTCard fields={fields} txHash={txHash} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Data readouts / NLP status */}
              <AnimatePresence mode="wait">
                {phase === 'idle' && (
                  <motion.div
                    key="idle-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800/40 rounded-xl bg-white/[0.01]"
                  >
                    <div className="text-3xl mb-2">🧬</div>
                    <h5 className="text-xs font-bold text-slate-400">Sandbox Attestation Engine</h5>
                    <p className="text-[11px] text-slate-500 max-w-xs mt-1 leading-relaxed">
                      Enter your clinical residency, CME credits, or board certifications on the left to trigger real-time AI classification &amp; SoulBound mint.
                    </p>
                  </motion.div>
                )}

                {phase === 'scanning' && (
                  <motion.div
                    key="scanning-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col justify-center gap-4"
                  >
                    <div className="space-y-1 text-center">
                      <p className="text-xs text-cyan-300 font-mono font-bold tracking-wider animate-pulse">
                        [INITIATING COGNITIVE SCAN...]
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">Loading NLP classifier context</p>
                    </div>
                    {/* Fake log lines */}
                    <div className="w-full space-y-1.5 bg-black/40 rounded-lg p-3 border border-slate-800/50 font-mono text-[10px]">
                      {['Tokenizing input credentials…', 'Connecting to Base Sepolia ledger…', 'Analyzing syntax and semantics…'].map(
                        (line, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 0.65, x: 0 }}
                            transition={{ delay: i * 0.25 }}
                            className="text-slate-400 flex items-center gap-1.5"
                          >
                            <span className="text-cyan-500">▶</span> {line}
                          </motion.div>
                        )
                      )}
                    </div>
                  </motion.div>
                )}

                {(phase === 'extracting' || phase === 'minting' || phase === 'done') && (
                  <motion.div
                    key="fields-results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col gap-4"
                  >
                    {/* Extracted Fields */}
                    <div className="space-y-2.5">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">{"// EXTRACTED ON-CHAIN ATTRIBUTES"}</span>
                      {fields.map((field, i) => (
                        <motion.div
                          key={field.label}
                          initial={{ opacity: 0, y: 8, filter: 'blur(2px)' }}
                          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                          transition={{ delay: i * 0.12, duration: 0.4, ease: 'easeOut' }}
                          className="bg-white/[0.015] border border-slate-800/50 rounded-lg p-2.5 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                              {field.label}
                            </span>
                            <span
                              className="text-xs font-bold font-mono"
                              style={{ color: field.color }}
                            >
                              {field.value}
                            </span>
                          </div>
                          <ConfidenceBar value={field.confidence} color={field.color} delay={i * 0.12 + 0.15} />
                        </motion.div>
                      ))}
                    </div>

                    {/* Overall Confidence */}
                    {overallConfidence > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="flex items-center justify-between py-2.5 px-3.5 rounded-lg bg-gradient-to-r from-cyan-500/5 to-purple-500/5 border border-cyan-500/10 shadow-sm"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                          AI Integrity Score
                        </span>
                        <span className="text-base font-extrabold text-emerald-400 font-mono">
                          {(overallConfidence * 100).toFixed(1)}%
                        </span>
                      </motion.div>
                    )}

                    {/* Mint Status / Success overlay */}
                    <AnimatePresence>
                      {phase === 'minting' && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-3 py-2.5 px-3.5 rounded-lg border border-amber-500/20 bg-amber-500/5"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                            className="h-4 w-4 rounded-full border-2 border-amber-400/40 border-t-amber-400 shrink-0"
                          />
                          <span className="text-[11px] font-semibold text-amber-300 font-mono">
                            Executing gasless SBT contract on Base Sepolia…
                          </span>
                        </motion.div>
                      )}

                      {phase === 'done' && txHash && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className="py-3 px-3.5 rounded-lg border border-emerald-500/25 bg-emerald-500/5 space-y-1.5"
                        >
                          <div className="flex items-center gap-2">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 250, damping: 12 }}
                            >
                              <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <motion.path
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: 0.5, ease: 'easeOut' }}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </motion.div>
                            <span className="text-[12px] font-bold text-emerald-300 font-mono">Soulbound SBT Minted!</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/40 pt-1.5 mt-1 font-mono">
                            <span>TRANSACTION:</span>
                            <span className="text-emerald-400/80 truncate max-w-[180px]">
                              {txHash.slice(0, 16)}…{txHash.slice(-14)}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ─── Footer Bar ─── */}
          <div className="relative z-10 flex items-center justify-between px-5 py-2.5 border-t border-slate-800/40 bg-[#0a0f1a]/40">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono text-slate-600">v1.0.0-sandbox</span>
              <span className="text-[10px] font-mono text-slate-700">|</span>
              <span className="text-[10px] font-mono text-slate-600">Base Sepolia · Chain 84532</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400/70">Connected</span>
            </div>
          </div>
        </motion.div>

        {/* ─── Bottom Notice ─── */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-[11px] text-slate-600 mt-6 font-medium"
        >
          ✦ No wallet required · No gas fees · Try it free on Base Sepolia testnet
        </motion.p>
      </div>
    </section>
  );
};

export default React.memo(SandboxSection);
