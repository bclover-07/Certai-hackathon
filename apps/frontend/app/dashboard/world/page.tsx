"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useWalletStore } from "../../../store/walletStore";
import { useWorldStore } from "../../../store/worldStore";
import { BACKEND_URL } from "../../../lib/constants";
import GlassCard from "../../../components/ui/GlassCard";
import Badge from "../../../components/ui/Badge";
import { usePrivy } from "../../../hooks/usePrivy";

const CredentialWorld = dynamic(
  () => import("../../../components/three/CredentialWorld"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center text-slate-500 font-semibold uppercase tracking-wider font-mono">
        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping mr-2" />
        Loading 3D space...
      </div>
    ),
  }
);

export default function WorldPage() {
  const { address, setBalance } = useWalletStore();
  const { selectedCredentialId, clearSelection } = useWorldStore();
  const { getAccessToken } = usePrivy();
  const getTokenRef = useRef(getAccessToken);
  getTokenRef.current = getAccessToken;
  
  const [credentials, setCredentials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Compliance Auditing states
  const [isVerifying, setIsVerifying] = useState(false);
  const [auditLog, setAuditLog] = useState<any>(null);
  const [auditError, setAuditError] = useState<string | null>(null);

  // Clear audit states when selecting a different credential
  useEffect(() => {
    setAuditLog(null);
    setAuditError(null);
  }, [selectedCredentialId]);

  useEffect(() => {
    if (!address) return;
    const fetchCredentials = async () => {
      try {
        const token = await getTokenRef.current();
        const res = await fetch(`${BACKEND_URL}/api/v1/credentials/holder/${address}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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

  // Handlers for on-chain compliance check
  const handleVerifyCredential = async (tokenId: number) => {
    if (!address || isVerifying) return;
    setIsVerifying(true);
    setAuditLog(null);
    setAuditError(null);

    try {
      const token = await getTokenRef.current();
      const res = await fetch(`${BACKEND_URL}/api/v1/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tokenId: tokenId,
          credentialTokenId: tokenId,
          verifierAddress: address,
          purpose: "general_audit",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Compliance check failed");
      }

      setAuditLog(data.data);

      // Dynamically increment verification count in-state to update UI immediately
      setCredentials((prev) =>
        prev.map((c) =>
          c.tokenId === tokenId
            ? { ...c, verificationCount: (c.verificationCount || 0) + 1 }
            : c
        )
      );

      // Query updated user profile points to trigger allowance pool refresh immediately
      const userRes = await fetch(`${BACKEND_URL}/api/v1/users/${address}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.success && userData.data) {
          const points = userData.data.stats?.points || 0;
          const newAllowance = (100.0 + points * 2.5).toFixed(2);
          setBalance(newAllowance);
        }
      }
    } catch (err: any) {
      console.error("Compliance check error:", err);
      setAuditError(err.message || "An unexpected error occurred during registry check");
    } finally {
      setIsVerifying(false);
    }
  };

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
        <div className="absolute inset-x-4 bottom-4 md:inset-y-6 md:right-6 md:left-auto md:top-6 z-20 w-auto md:w-full max-w-full md:max-w-sm animate-slide-up h-auto">
          <GlassCard glowColor="blue" className="h-auto md:h-full p-6 flex flex-col justify-between bg-[#0d112d]/85 backdrop-blur-xl border border-cyan-500/25">
            <div className="overflow-y-auto max-h-[70vh] md:max-h-full pr-1 scrollbar-thin">
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

              {/* Real-time Compliance Verification Desk */}
              <div className="mt-6 border-t border-slate-800/40 pt-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Compliance Registry Audit
                </span>
                
                {!inspectedCred.tokenId ? (
                  <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 text-[10.5px] text-amber-400 font-medium leading-normal">
                    ⚠️ MINTING REQUIRED: This credential must be fully minted on-chain before running a compliance audit.
                  </div>
                ) : auditLog ? (
                  <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3 animate-scale-in">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] uppercase tracking-wider">
                      <span>✅ Audit Registry Passed</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Auditor verified that SBT #{inspectedCred.tokenId} is active, unrevoked, and certified valid on Base Sepolia.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleVerifyCredential(inspectedCred.tokenId)}
                      disabled={isVerifying}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 py-2.5 text-xs font-bold text-cyan-300 hover:from-blue-500 hover:to-indigo-500 hover:text-white hover:border-transparent transition-all duration-300 shadow-[0_0_12px_rgba(59,130,246,0.1)] active:scale-95 disabled:opacity-50"
                    >
                      {isVerifying ? (
                        <>
                          <span className="h-3.5 w-3.5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mr-1" />
                          Auditing Registry...
                        </>
                      ) : (
                        "🛡️ Run On-Chain Compliance Audit"
                      )}
                    </button>
                    {auditError && (
                      <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-3 text-[10px] text-rose-400 font-mono leading-normal">
                        ⚠️ {auditError}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Basescan explorer button */}
            {inspectedCred.txHash && (
              <div className="pt-4 border-t border-slate-800/60 mt-4">
                <a
                  href={`/explorer/${inspectedCred.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 py-2.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500 hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                >
                  ⛓️ Explorer Attestation Ledger
                </a>
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
}
