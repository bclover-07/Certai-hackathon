"use client";

import { useEffect, useState, useRef } from "react";
import { BACKEND_URL } from "../../../lib/constants";
import GlassCard from "../../../components/ui/GlassCard";
import { usePrivy } from "../../../hooks/usePrivy";

interface LeaderboardUser {
  walletAddress: string;
  displayName: string;
  organization: string;
  points: number;
  breakdown: {
    credentialsMinted: number;
    endorsementsReceived: number;
    verificationsRun: number;
    hoursLogged: number;
  };
}

export default function LeaderboardPage() {
  const [board, setBoard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getAccessToken } = usePrivy();
  const getTokenRef = useRef(getAccessToken);
  getTokenRef.current = getAccessToken;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = await getTokenRef.current();
        const res = await fetch(`${BACKEND_URL}/api/v1/leaderboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            setBoard(data.data);
          }
        }
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-wide">
          Scholastic Points Ladder
        </h2>
        <p className="text-xs text-slate-400 font-semibold uppercase mt-1">
          Compete on certified training hours, peer endorsements, and compliance verification.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
          <h3 className="text-lg font-bold text-white tracking-wide">
            Registry Leaderboard
          </h3>
          <span className="text-[10px] font-bold text-cyan-400 font-mono tracking-widest uppercase">
            Points updated live
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-900/40 border border-slate-800" />
            ))}
          </div>
        ) : board.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed border-slate-850 rounded-3xl bg-[#0d112d]/10">
            <span className="text-5xl animate-bounce">🏆</span>
            <h3 className="text-lg font-bold text-white mt-4">Empty Leaderboard</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed font-medium">
              Mint your first SBT credential, verify peer certificates, or gain endorsements to start climbing the points ladder!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {board.map((user, idx) => {
              const rank = idx + 1;
              const isTopThree = rank <= 3;
              const rankEmojis = ["🏆", "🥈", "🥉"];

              return (
                <GlassCard
                  key={user.walletAddress}
                  className="p-5 flex items-center justify-between transition-all duration-300 hover:scale-[1.01]"
                  glowColor={rank === 1 ? "blue" : rank === 2 ? "purple" : rank === 3 ? "emerald" : "none"}
                >
                  {/* Left: Rank, Name, Organization */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold font-mono text-sm border border-solid ${
                      isTopThree
                        ? "bg-slate-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.15)]"
                        : "bg-slate-900 border-slate-800 text-slate-500"
                    }`}>
                      {isTopThree ? rankEmojis[idx] : `#${rank}`}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm font-extrabold text-white truncate">
                        {user.displayName || `Scholar ${user.walletAddress.substring(0, 8)}`}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate mt-0.5">
                        {user.organization || "No Affiliation"}
                      </p>
                    </div>
                  </div>

                  {/* Right: Breakdown & Points */}
                  <div className="flex items-center gap-6 shrink-0">
                    {/* Activity breakdowns */}
                    <div className="hidden sm:flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase font-mono">
                      <div className="text-center">
                        <span className="text-slate-400 block">{user.breakdown?.credentialsMinted || 0}</span>
                        <span>SBTs</span>
                      </div>
                      <div className="text-center border-l border-slate-800/80 pl-4">
                        <span className="text-slate-400 block">{user.breakdown?.hoursLogged || 0}</span>
                        <span>Hours</span>
                      </div>
                      <div className="text-center border-l border-slate-800/80 pl-4">
                        <span className="text-slate-400 block">{user.breakdown?.endorsementsReceived || 0}</span>
                        <span>Endorses</span>
                      </div>
                    </div>

                    {/* Points total */}
                    <div className="text-right">
                      <span className="text-lg font-black text-cyan-300 font-mono tracking-wide">
                        {user.points || 0}
                      </span>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Points</p>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
