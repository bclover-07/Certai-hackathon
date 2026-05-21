'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

function useCountUp(target: number, duration = 2000, isDecimal = false) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) {
            setCount(target);
            clearInterval(timer);
          } else {
            setCount(isDecimal ? parseFloat(start.toFixed(1)) : Math.floor(start));
          }
        }, 16);
        observer.disconnect();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, isDecimal]);
  
  return { count, ref };
}

const sectionVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, y: 0,
    transition: { 
      duration: 0.7, 
      ease: [0.25, 0.46, 0.45, 0.94] as any,
      staggerChildren: 0.12, 
      delayChildren: 0.1 
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as any } 
  }
};

const ProblemSection = () => {
  const stat1 = useCountUp(6, 2000, false);
  const stat2 = useCountUp(10000, 2000, false);
  const stat3 = useCountUp(2.1, 2000, true);

  return (
    <motion.section
      id="problem-section"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      className="bg-[#090d14] py-[100px] border-t border-slate-900 px-6 sm:px-8 lg:px-16"
    >
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Column - Bold Statement & Staggered Pain Points */}
        <div className="space-y-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            Healthcare credentialing is broken.
          </h2>
          <p className="text-base sm:text-lg text-[#7890a8] leading-relaxed max-w-xl">
            Medical boards rely on paper forms, phone calls, and months-long verification processes that cost hospitals billions and leave patients waiting.
          </p>

          <div className="space-y-4">
            <motion.div variants={itemVariants} className="flex items-center gap-3 text-white font-medium">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500 font-bold">✕</span>
              <span>3–6 months average verification time</span>
            </motion.div>
            <motion.div variants={itemVariants} className="flex items-center gap-3 text-white font-medium">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500 font-bold">✕</span>
              <span>$10,000 per physician credentialing cost</span>
            </motion.div>
            <motion.div variants={itemVariants} className="flex items-center gap-3 text-white font-medium">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500 font-bold">✕</span>
              <span>$2.1 billion lost annually to credential fraud</span>
            </motion.div>
          </div>
        </div>

        {/* Right Column - 3 Count-Up Stat Cards */}
        <div className="space-y-6">
          {/* Card 1 */}
          <div ref={stat1.ref} className="bg-red-500/[0.06] border border-red-500/15 rounded-2xl p-8 hover:bg-red-500/[0.09] transition-colors duration-300">
            <div className="text-5xl sm:text-6xl font-extrabold text-[#ef4444] tracking-tight">
              {stat1.count}
              <span className="text-3xl font-bold"> months</span>
            </div>
            <div className="text-sm font-semibold text-[#7890a8] uppercase tracking-wider mt-2">
              Average wait time
            </div>
          </div>

          {/* Card 2 */}
          <div ref={stat2.ref} className="bg-red-500/[0.06] border border-red-500/15 rounded-2xl p-8 hover:bg-red-500/[0.09] transition-colors duration-300">
            <div className="text-5xl sm:text-6xl font-extrabold text-[#ef4444] tracking-tight">
              <span className="text-4xl font-bold">$</span>
              {stat2.count.toLocaleString()}
            </div>
            <div className="text-sm font-semibold text-[#7890a8] uppercase tracking-wider mt-2">
              Per physician cost
            </div>
          </div>

          {/* Card 3 */}
          <div ref={stat3.ref} className="bg-red-500/[0.06] border border-red-500/15 rounded-2xl p-8 hover:bg-red-500/[0.09] transition-colors duration-300">
            <div className="text-5xl sm:text-6xl font-extrabold text-[#ef4444] tracking-tight">
              <span className="text-4xl font-bold">$</span>
              {stat3.count}
              <span className="text-4xl font-bold">B</span>
            </div>
            <div className="text-sm font-semibold text-[#7890a8] uppercase tracking-wider mt-2">
              Lost to fraud yearly
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Horizontal Divider with text */}
      <motion.div
        variants={{
          hidden: { opacity: 0, scale: 0.95 },
          visible: { 
            opacity: 1, 
            scale: 1, 
            transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as any, delay: 0.3 } 
          }
        }}
        className="mt-20 border-t border-cyan-500/20 pt-8 text-center"
      >
        <span className="text-base sm:text-lg font-mono text-[#00d4ff] tracking-widest font-semibold uppercase">
          CERTAI solves all three. Instantly. Gaslessly.
        </span>
      </motion.div>
    </motion.section>
  );
};

export default React.memo(ProblemSection);
