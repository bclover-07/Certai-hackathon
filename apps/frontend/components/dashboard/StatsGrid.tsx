"use client";

import { useEffect, useState } from "react";
import { BACKEND_URL } from "../../lib/constants";
import { useWalletStore } from "../../store/walletStore";
import GlassCard from "../ui/GlassCard";

export default function StatsGrid() {
  const { address } = useWalletStore();
  const [stats, setStats] = useState({
    credentialsMinted: 0,
    endorsementsReceived: 0,
    verificationsRun: 0,
    totalHoursLogged: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    const fetchStats = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/users/${address}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setStats(data.data.stats || {
              credentialsMinted: 0,
              endorsementsReceived: 0,
              verificationsRun: 0,
              totalHoursLogged: 0,
            });
          }
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [address]);

  const cards = [
    {
      title: "Credentials Minted",
      value: stats.credentialsMinted,
      icon: "📜",
      color: "blue" as const,
      desc: "Permanent SoulBound SBTs",
    },
    {
      title: "Endorsements",
      value: stats.endorsementsReceived,
      icon: "🤝",
      color: "purple" as const,
      desc: "Verified skill attestations",
    },
    {
      title: "Verifications Run",
      value: stats.verificationsRun,
      icon: "✅",
      color: "emerald" as const,
      desc: "Third-party audit requests",
    },
    {
      title: "Hours Logged",
      value: `${stats.totalHoursLogged} hrs`,
      icon: "⏱️",
      color: "pink" as const,
      desc: "Total verified study/service",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-2xl border border-slate-800 bg-[#111638]/40"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => (
        <GlassCard
          key={idx}
          glowColor={card.color}
          hoverable
          className="flex flex-col justify-between p-6 transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold tracking-wider text-slate-400 uppercase">
              {card.title}
            </span>
            <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
              {card.icon}
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold tracking-tight text-white">
              {card.value}
            </span>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              {card.desc}
            </p>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
