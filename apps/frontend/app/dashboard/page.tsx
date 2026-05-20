"use client";

import StatsGrid from "../../components/dashboard/StatsGrid";
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import VerifyPanel from "../../components/dashboard/VerifyPanel";
import GlassCard from "../../components/ui/GlassCard";

export default function DashboardHome() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner Card */}
      <GlassCard className="p-6 md:p-8" glowColor="blue">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <h2 className="text-3xl font-extrabold text-white">
            Decentralized Credential Console
          </h2>
          <p className="text-sm sm:text-base text-slate-400 font-medium leading-relaxed">
            Verify training hours, mint permanent SoulBound credentials, attests peer competencies, and run on-chain compliance audits. All gaslessly relayed on the Base Sepolia ledger.
          </p>
        </div>
        {/* Background ambient beam */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-cyan-500/10 to-transparent blur-md rounded-r-2xl hidden md:block" />
      </GlassCard>

      {/* 4-card Overview Stats */}
      <StatsGrid />

      {/* 2-column feed section */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent activity list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-wide">
              Attestation Activity
            </h3>
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
          </div>
          <GlassCard className="p-6">
            <ActivityFeed />
          </GlassCard>
        </div>

        {/* Quick verification panel */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white tracking-wide">
            Registry Check
          </h3>
          <VerifyPanel />
        </div>
      </div>
    </div>
  );
}
