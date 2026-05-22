'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BACKEND_URL } from '../../lib/constants';

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (target <= 0) return;
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
            setCount(Math.floor(start));
          }
        }, 16);
        observer.disconnect();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  
  return { count, ref };
}

interface StatsData {
  credentialsMinted: number;
  verificationsRun: number;
  endorsementsGiven: number;
  hoursLogged: number;
}

const defaultMarqueeEvents = [
  "🏥 Dr. Chen claimed Cardiology Residency · just now",
  "🎓 James minted Academic Degree · 2m ago",
  "✓ Memorial Hospital verified a credential · 5m ago",
  "🩺 Nurse Sarah claimed ICU Clinical Rotation · 12m ago",
  "🎓 Dr. Okafor verified Professional Certification · 15m ago",
  "🏆 Priya Ramaswamy completed BLS Certification · 20m ago",
  "🏥 Stanford Medical School endorsed Cardiology Skill · 30m ago",
  "✓ GenHospital verified Residency Completion · 45m ago",
  "🎓 Marcus Webb claimed Stanford Research Publication · 1h ago",
  "🩺 Emily claimed Continuing Education 10 hours · 2h ago"
];

// Duplicate the array for seamless looping
const marqueeItems = [...defaultMarqueeEvents, ...defaultMarqueeEvents];

const StatsBlock = ({ target, label, colorClass }: { target: number; label: string; colorClass: string }) => {
  const { count, ref } = useCountUp(target, 2000);
  
  return (
    <div ref={ref} className="text-center py-4 flex-1">
      <div className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${colorClass}`}>
        {count.toLocaleString()}
      </div>
      <div className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 mt-2">
        {label}
      </div>
    </div>
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
          // Fallbacks for empty database
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
    <section className="relative overflow-hidden py-12 bg-gradient-to-r from-cyan-500/[0.02] via-purple-500/[0.02] to-amber-500/[0.02] border-t border-b border-cyan-500/10">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-16">
        
        {/* Top Row: 4 Count-Up Stats */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse py-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center space-y-3">
                <div className="h-10 bg-slate-800/40 rounded w-1/2 mx-auto" />
                <div className="h-3 bg-slate-800/30 rounded w-2/3 mx-auto" />
              </div>
            ))}
          </div>
        ) : (
          stats && (
            <div className="flex flex-wrap md:flex-nowrap justify-between items-center divide-y md:divide-y-0 md:divide-x divide-slate-800/50">
              <StatsBlock target={stats.credentialsMinted} label="Credentials Minted" colorClass="text-cyan-400" />
              <StatsBlock target={stats.verificationsRun} label="Verifications Done" colorClass="text-emerald-400" />
              <StatsBlock target={stats.endorsementsGiven} label="Peer Endorsements" colorClass="text-purple-400" />
              <StatsBlock target={stats.hoursLogged} label="Hours Logged On-Chain" colorClass="text-amber-400" />
            </div>
          )
        )}

        {/* Bottom Row: scrolling marquee of recent activity */}
        <div className="mt-16 relative w-full overflow-hidden py-4 border-t border-slate-900">
          {/* Faders for left/right edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#030508] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#030508] to-transparent z-10 pointer-events-none" />

          <div className="marquee-container overflow-hidden w-full">
            <div className="marquee-track flex gap-8 items-center w-max animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused]">
              {marqueeItems.map((item, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 rounded-full bg-white/[0.02] border border-white/[0.05] text-xs font-semibold text-slate-300 flex items-center gap-2 hover:border-cyan-500/30 hover:bg-cyan-500/[0.02] transition-colors duration-300 whitespace-nowrap"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default React.memo(StatsSection);
