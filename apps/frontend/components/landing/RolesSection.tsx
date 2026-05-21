'use client';

import React from 'react';
import { motion } from 'framer-motion';

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

interface FlipCardProps {
  icon: string;
  title: string;
  tagline: string;
  bullets: string[];
  accentColor: string;
  glowColor: string;
}

const FlipCard = ({ icon, title, tagline, bullets, accentColor, glowColor }: FlipCardProps) => {
  return (
    <motion.div
      variants={cardVariants}
      className="card group w-full h-[320px] cursor-pointer select-none"
      style={{ perspective: '1000px' }}
    >
      <div
        className="card-inner w-full h-full relative duration-700 preserve-3d"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        {/* Front Face */}
        <div
          className="card-front absolute w-full h-full backface-hidden bg-white/[0.02] border border-white/[0.06] rounded-3xl p-8 flex flex-col justify-between items-center text-center hover:border-white/10 transition-colors duration-300"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center text-4xl mt-4"
            style={{
              background: `rgba(${accentColor}, 0.1)`,
              boxShadow: `0 0 20px rgba(${accentColor}, 0.15)`,
            }}
          >
            {icon}
          </div>
          <div className="space-y-2 mb-4">
            <h3 className="text-2xl font-extrabold text-white">{title}</h3>
            <p className="text-sm font-medium" style={{ color: `rgb(${accentColor})` }}>
              {tagline}
            </p>
          </div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest group-hover:text-slate-300 transition-colors duration-300">
            Hover to Reveal Benefits ➔
          </span>
        </div>

        {/* Back Face */}
        <div
          className="card-back absolute w-full h-full backface-hidden bg-white/[0.02] border border-white/[0.06] rounded-3xl p-8 flex flex-col justify-center transition-all duration-300"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            border: `1px solid rgba(${accentColor}, 0.25)`,
            boxShadow: `inset 0 0 20px rgba(${accentColor}, 0.05)`,
          }}
        >
          <h4 className="text-lg font-bold text-white mb-4 border-b border-white/5 pb-2">Benefits</h4>
          <ul className="space-y-3">
            {bullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-slate-300 text-xs sm:text-sm font-semibold">
                <span style={{ color: `rgb(${accentColor})` }}>✓</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

const RolesSection = () => {
  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      className="bg-[#030508] py-[100px] border-t border-slate-900 px-6 sm:px-8 lg:px-16"
    >
      <div className="max-w-[1200px] mx-auto space-y-16">
        {/* Title */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Built for every role in the credentialing chain.
          </h2>
          <p className="text-base sm:text-lg text-slate-500 font-medium">
            Bridging professionals, learners, and healthcare verifiers seamlessly.
          </p>
        </div>

        {/* Roles Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FlipCard
            icon="🩺"
            title="Doctors & Nurses"
            tagline="Own your credentials forever"
            bullets={[
              'Claim residency completions instantly',
              'Log CME hours on-chain',
              'Share verifiable proof with employers',
              'Never lose a credential again',
            ]}
            accentColor="6, 182, 212" // cyan
            glowColor="rgba(6, 182, 212, 0.4)"
          />

          <FlipCard
            icon="🎓"
            title="Students & Trainees"
            tagline="Build your on-chain portfolio"
            bullets={[
              'Log every course completion',
              'Earn peer endorsements',
              'Showcase to employers',
              'Prove skills without paperwork',
            ]}
            accentColor="168, 85, 247" // purple
            glowColor="rgba(168, 85, 247, 0.4)"
          />

          <FlipCard
            icon="🏥"
            title="Hospitals & Boards"
            tagline="Verify any credential in seconds"
            bullets={[
              'On-chain audit trail for every check',
              'Eliminate credential fraud',
              'Cut hiring time from months to hours',
              'Free verification forever',
            ]}
            accentColor="251, 191, 36" // gold
            glowColor="rgba(251, 191, 36, 0.4)"
          />
        </div>
      </div>
    </motion.section>
  );
};

export default React.memo(RolesSection);
