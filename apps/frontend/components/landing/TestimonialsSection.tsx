'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    quote: "I claimed my entire 3-year residency portfolio in 20 minutes. It would have taken 3 months the old way.",
    name: "Dr. Sarah Chen",
    role: "Cardiology Resident",
    org: "General Hospital",
    initial: "SC",
    color: "#00d4ff"
  },
  {
    quote: "Our hiring team now verifies credentials on-chain in seconds. We've completely eliminated fraudulent applications.",
    name: "James Okafor",
    role: "Head of Medical Hiring",
    org: "MedStaff Solutions",
    initial: "JO",
    color: "#a855f7"
  },
  {
    quote: "I typed 'I completed my BLS certification' and had an on-chain proof in my wallet within 15 seconds. No crypto setup needed.",
    name: "Priya Ramaswamy",
    role: "Emergency Nurse",
    org: "City Medical Center",
    initial: "PR",
    color: "#fbbf24"
  },
  {
    quote: "The 3D credential gallery is stunning. My portfolio actually looks like the professional record I've built.",
    name: "Marcus Webb",
    role: "Medical Student",
    org: "Stanford Medical School",
    initial: "MW",
    color: "#00e676"
  }
];

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

const TestimonialsSection = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const current = testimonials[index];

  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      className="bg-[#090d14] py-[100px] border-t border-slate-900 px-6 sm:px-8 lg:px-16 overflow-hidden"
    >
      <div className="max-w-[800px] mx-auto space-y-12 text-center relative">
        {/* Section Title */}
        <div className="space-y-3 mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Trusted by professionals.
          </h2>
          <p className="text-xs sm:text-sm text-[#00d4ff] font-mono tracking-wider font-semibold uppercase">
            Real feedback from early adopters
          </p>
        </div>

        {/* Carousel Container */}
        <div className="min-h-[280px] flex items-center justify-center relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="w-full flex flex-col items-center space-y-6"
            >
              {/* Giant Quote Mark */}
              <div
                className="text-7xl font-serif select-none leading-none absolute -top-8 left-0 sm:left-6 opacity-20 pointer-events-none"
                style={{ color: current.color }}
              >
                “
              </div>

              {/* Quote Text */}
              <blockquote className="text-lg sm:text-2xl text-white font-medium max-w-2xl leading-relaxed italic relative z-10">
                "{current.quote}"
              </blockquote>

              {/* Divider */}
              <div className="w-12 h-[1px] bg-slate-800 my-2" />

              {/* Avatar + Author details */}
              <div className="flex items-center gap-4 text-left">
                <div
                  className="h-14 w-14 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg"
                  style={{
                    backgroundColor: current.color,
                    boxShadow: `0 4px 15px rgba(0,0,0,0.3)`
                  }}
                >
                  {current.initial}
                </div>
                <div>
                  <div className="text-white font-extrabold text-base">{current.name}</div>
                  <div className="text-xs font-semibold text-slate-400 mt-0.5">
                    {current.role} <span className="text-slate-600">·</span> <span className="text-slate-500">{current.org}</span>
                  </div>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-2.5 pt-6">
          {testimonials.map((t, idx) => {
            const isActive = idx === index;
            return (
              <button
                key={idx}
                onClick={() => setIndex(idx)}
                className="h-2 rounded-full transition-all duration-300 focus:outline-none"
                style={{
                  width: isActive ? '24px' : '8px',
                  backgroundColor: isActive ? current.color : '#1e293b'
                }}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            );
          })}
        </div>

      </div>
    </motion.section>
  );
};

export default React.memo(TestimonialsSection);
