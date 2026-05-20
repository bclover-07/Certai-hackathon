"use client";

import { useEffect, useState } from "react";
import { useWalletStore } from "../../../store/walletStore";
import { useWorldStore } from "../../../store/worldStore";
import { BACKEND_URL } from "../../../lib/constants";
import CredentialWorld from "../../../components/three/CredentialWorld";
import GlassCard from "../../../components/ui/GlassCard";
import Badge from "../../../components/ui/Badge";

export default function WorldPage() {
  const { address } = useWalletStore();
  const { selectedCredentialId, clearSelection } = useWorldStore();
  const [credentials, setCredentials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    const fetchCredentials = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/credentials/holder/${address}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            setCredentials(data.data);
          }
        }
      } catch (err) {
        console.error("Error fetching credentials:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCredentials();
  }, [address]);

  // Find currently inspected card details
  const inspectedCred = credentials.find((c) => c._id === selectedCredentialId);

  return (
    <div className="relative h-[calc(100vh-10rem)] w-full rounded-3xl overflow-hidden border border-slate-800 bg-[#030616]">
      {/* 3D Canvas Mount */}
      {isLoading ? (
        <div className="flex h-full w-full items-center justify-center text-slate-500 font-semibold uppercase tracking-wider font-mono">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping mr-2" />
          Loading 3D space...
        </div>
      ) : credentials.length === 0 ? (
        <div className="flex h-full w-full flex-col items-center justify-center text-center p-6 space-y-4">
          <span className="text-5xl animate-bounce">🪐</span>
          <div>
            <h3 className="text-xl font-bold text-white">Empty Credentials Orbit</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed font-medium">
              You haven&apos;t minted any SoulBound credentials yet. Visit the Claim tab to create your first SBT!
            </p>
          </div>
        </div>
      ) : (
        <CredentialWorld credentials={credentials} />
      )}

      {/* Slide-over Inspection Panel */}
      {inspectedCred && (
        <div className="absolute right-6 top-6 bottom-6 z-20 w-full max-w-sm animate-slide-up">
          <GlassCard glowColor="blue" className="h-full p-6 flex flex-col justify-between bg-[#0d112d]/85 backdrop-blur-xl border border-cyan-500/25">
            <div>
              {/* Close trigger */}
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-4">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                  SBT Inspector
                </span>
                <button
                  onClick={clearSelection}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Badges and titles */}
              <Badge type={inspectedCred.credentialType} />
              <h3 className="text-xl font-extrabold text-white mt-3 leading-snug">
                {inspectedCred.title}
              </h3>
              <p className="text-xs font-bold text-cyan-300 uppercase tracking-wider mt-1">
                {inspectedCred.issuerName}
              </p>

              {/* Description */}
              <p className="text-xs text-slate-400 mt-4 leading-relaxed font-medium">
                {inspectedCred.description}
              </p>

              {/* Meta metrics grid */}
              <div className="grid grid-cols-2 gap-4 mt-6 border-y border-slate-800/50 py-4 font-mono text-[11px] text-slate-400">
                <div>
                  <p className="text-slate-500 font-bold uppercase">Token ID</p>
                  <p className="text-cyan-200 mt-0.5">#{inspectedCred.tokenId || "Pending"}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-bold uppercase">Total Hours</p>
                  <p className="text-cyan-200 mt-0.5">{inspectedCred.hoursCompleted} hours</p>
                </div>
                <div>
                  <p className="text-slate-500 font-bold uppercase">Verified Audits</p>
                  <p className="text-cyan-200 mt-0.5">{inspectedCred.verificationCount} run</p>
                </div>
                <div>
                  <p className="text-slate-500 font-bold uppercase">NFT Standard</p>
                  <p className="text-cyan-200 mt-0.5">ERC-5192 SoulBound</p>
                </div>
              </div>

              {/* Skills checklist */}
              <div className="mt-5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Skills Attested
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {inspectedCred.skills.map((skill: string, i: number) => (
                    <span
                      key={i}
                      className="rounded-lg bg-slate-900 border border-slate-850 px-2 py-0.5 text-[10px] font-medium text-slate-350"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Basescan explorer button */}
            {inspectedCred.txHash && (
              <div className="pt-4 border-t border-slate-800/60 mt-4">
                <a
                  href={`https://sepolia.basescan.org/tx/${inspectedCred.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 py-2.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500 hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                >
                  ⛓️ Explorer Basescan Ledger
                </a>
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
}
