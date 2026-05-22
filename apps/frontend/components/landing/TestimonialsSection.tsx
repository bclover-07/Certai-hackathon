'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

const testimonials = [
  {
    quote: "I claimed my entire 3-year residency portfolio in 20 minutes. It would have taken 3 months the old way.",
    name: "Dr. Sarah Chen",
    role: "Cardiology Resident",
    org: "General Hospital",
    initial: "SC",
    color: "rgba(6, 182, 212, 0.15)", // Cyan
    borderColor: "cyan-500",
    textGradient: "from-cyan-400 to-blue-500",
    proof: "Verified by General Hospital · SBT #4829"
  },
  {
    quote: "Our hiring team now verifies credentials on-chain in seconds. We've completely eliminated fraudulent applications.",
    name: "James Okafor",
    role: "Head of Medical Hiring",
    org: "MedStaff Solutions",
    initial: "JO",
    color: "rgba(168, 85, 247, 0.15)", // Purple
    borderColor: "purple-500",
    textGradient: "from-purple-400 to-fuchsia-500",
    proof: "Verified by MedStaff Solutions · SBT #9281"
  },
  {
    quote: "I typed 'I completed my BLS certification' and had an on-chain proof in my wallet within 15 seconds. No crypto setup needed.",
    name: "Priya Ramaswamy",
    role: "Emergency Nurse",
    org: "City Medical Center",
    initial: "PR",
    color: "rgba(245, 158, 11, 0.15)", // Amber
    borderColor: "amber-500",
    textGradient: "from-amber-400 to-orange-500",
    proof: "Verified by City Medical Center · SBT #3942"
  },
  {
    quote: "The 3D credential gallery is stunning. My portfolio actually looks like the professional record I've built.",
    name: "Marcus Webb",
    role: "Medical Student",
    org: "Stanford Medical School",
    initial: "MW",
    color: "rgba(16, 185, 129, 0.15)", // Emerald
    borderColor: "emerald-500",
    textGradient: "from-emerald-400 to-teal-500",
    proof: "Verified by Stanford Med · SBT #1039"
  }
];

const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonials[0] }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Motion values for 3D card tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Calculate mouse position relative to card center (-100 to 100 range equivalent)
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
      className="relative rounded-2xl bg-slate-950/40 border border-white/[0.04] p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:border-white/[0.1] hover:bg-slate-950/60 group cursor-pointer"
    >
      {/* Glow highlight behind the card */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${testimonial.color} 0%, transparent 65%)`,
          filter: 'blur(30px)',
          zIndex: 0
        }}
      />

      <div className="relative z-10" style={{ transform: 'translateZ(20px)' }}>
        {/* Quote symbol */}
        <div className="text-5xl font-serif text-slate-700 leading-none select-none group-hover:text-slate-500 transition-colors duration-300">
          “
        </div>
        
        {/* Testimonial Quote */}
        <blockquote className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed font-medium group-hover:text-white transition-colors duration-300 italic">
          {testimonial.quote}
        </blockquote>
      </div>

      <div className="mt-8 pt-6 border-t border-white/[0.04] relative z-10 flex flex-col gap-4" style={{ transform: 'translateZ(10px)' }}>
        {/* User Info */}
        <div className="flex items-center gap-3">
          {/* Avatar with gradient border */}
          <div className="relative">
            <div className={`w-11 h-11 rounded-full bg-gradient-to-tr ${testimonial.textGradient} p-[1px] shadow-lg`}>
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-xs font-bold text-white uppercase tracking-wider">
                {testimonial.initial}
              </div>
            </div>
            {/* Small green verified badge */}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border border-slate-950 rounded-full flex items-center justify-center">
              <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          </div>
          
          <div>
            <div className="text-sm font-bold text-white tracking-tight">{testimonial.name}</div>
            <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
              {testimonial.role} <span className="text-slate-600">·</span> <span className="text-slate-500">{testimonial.org}</span>
            </div>
          </div>
        </div>

        {/* Verification Proof Hash */}
        <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.03] rounded-lg px-3 py-1.5 text-[10px] font-mono text-slate-500 group-hover:text-slate-400 group-hover:bg-white/[0.04] transition-all duration-300">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            {testimonial.proof}
          </span>
          <svg className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

const TestimonialsSection = () => {
  return (
    <section className="relative overflow-hidden py-24 bg-[#030508] border-t border-b border-white/[0.04]">
      {/* Glowing atmospheric elements */}
      <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] rounded-full bg-cyan-500/[0.01] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-[350px] h-[350px] rounded-full bg-purple-500/[0.01] blur-[120px] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        
        {/* Title Block */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-[0.3em] bg-purple-950/20 border border-purple-500/20 px-3.5 py-1.5 rounded-full inline-block mb-4 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
            Community Voices
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Verified Success Stories
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400 font-medium">
            Hear from residents, students, and hiring leads who have transformed their credential management using CERTAI.
          </p>
        </div>

        {/* 2x2 Grid of Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {testimonials.map((t, idx) => (
            <TestimonialCard key={idx} testimonial={t} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default React.memo(TestimonialsSection);
