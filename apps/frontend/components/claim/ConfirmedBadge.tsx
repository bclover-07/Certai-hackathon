"use client";

import { useEffect, useState } from "react";
import NeonButton from "../ui/NeonButton";

interface ConfirmedBadgeProps {
  txHash: string;
  tokenId: string;
  title: string;
  onClose: () => void;
}

export default function ConfirmedBadge({
  txHash,
  tokenId,
  title,
  onClose,
}: ConfirmedBadgeProps) {
  const [particles, setParticles] = useState<Array<{ id: number; left: number; delay: number }>>([]);

  // Generate celebratory confetti particles
  useEffect(() => {
    setParticles(
      Array.from({ length: 24 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
      }))
    );
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-6 backdrop-blur-xl shadow-[0_0_50px_rgba(16,185,129,0.15)] flex flex-col items-center justify-center text-center animate-scale-in">
      {/* Confetti particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 h-2 w-2 rounded-full bg-emerald-400 opacity-0"
          style={{
            left: `${p.left}%`,
            animation: `confetti-fall 2.5s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Lock graphic */}
      <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-400/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-10 h-10 animate-bounce"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-extrabold tracking-tight text-white">
        Credential Lock Secured!
      </h2>
      <p className="mt-2 text-sm text-emerald-300 font-semibold uppercase tracking-wider">
        ERC-5192 SoulBound Attestation Active
      </p>
      <p className="mt-3 text-xs text-slate-400 max-w-sm font-medium">
        Your course accomplishment &quot;{title}&quot; is permanently linked to your wallet address. No transfer is possible.
      </p>

      {/* Token details */}
      <div className="mt-5 w-full rounded-xl bg-slate-950/60 border border-slate-900 px-4 py-3 text-left font-mono text-xs text-slate-300 space-y-1.5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]">
        <div className="flex justify-between">
          <span className="text-slate-500 font-bold uppercase">Token ID:</span>
          <span className="text-cyan-200">#{tokenId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 font-bold uppercase">Owner Wallet:</span>
          <span className="text-slate-400">Locked Holder EOA</span>
        </div>
        <div className="flex flex-col gap-1 mt-2">
          <span className="text-slate-500 font-bold uppercase">Attestation Receipt:</span>
          <a
            href={`/explorer/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-cyan-400 hover:text-cyan-300 truncate"
          >
            {txHash} 🔗
          </a>
        </div>
      </div>

      <NeonButton variant="emerald" onClick={onClose} className="mt-6 w-full py-2.5 text-sm">
        View In My Gallery
      </NeonButton>
    </div>
  );
}
