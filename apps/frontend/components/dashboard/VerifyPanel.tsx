"use client";

import { useState } from "react";
import { BACKEND_URL } from "../../lib/constants";
import { useWalletStore } from "../../store/walletStore";
import GlassCard from "../ui/GlassCard";
import { usePrivy } from "@privy-io/react-auth";
import NeonButton from "../ui/NeonButton";

export default function VerifyPanel() {
  const [tokenId, setTokenId] = useState("");
  const [purpose, setPurpose] = useState("employment_audit");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { address } = useWalletStore();
  const { getAccessToken } = usePrivy();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenId.trim()) return;

    setIsVerifying(true);
    setResult(null);
    setError(null);

    try {
      const token = await getAccessToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tokenId: parseInt(tokenId),
          credentialTokenId: parseInt(tokenId),
          verifierAddress: address || "0x0000000000000000000000000000000000000000",
          purpose,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Verification request failed");
      }

      setResult(data.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during verification");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <GlassCard className="p-6" glowColor="blue">
      <h3 className="text-lg font-bold tracking-tight text-white mb-2 flex items-center gap-2">
        <span>🛡️</span> On-Chain Credential Auditor
      </h3>
      <p className="text-xs text-slate-400 font-medium mb-6">
        Instantly audit any issued CERTAI SBT using its permanent token ID and on-chain verification contracts.
      </p>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Token ID
          </label>
          <input
            type="number"
            required
            placeholder="e.g. 4832"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            className="w-full rounded-xl bg-slate-900/60 border border-slate-800 py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all duration-300"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Audit Purpose
          </label>
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full rounded-xl bg-slate-900/60 border border-slate-800 py-3 px-4 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all duration-300 appearance-none"
          >
            <option value="employment_audit">Employment & Staffing Audit</option>
            <option value="clinical_privileges">Clinical Privileges Review</option>
            <option value="academic_admission">Academic Admission</option>
            <option value="licensing_verification">State Licensing Verification</option>
            <option value="general_audit">General Compliance Check</option>
          </select>
        </div>

        <NeonButton
          type="submit"
          fullWidth
          variant="blue"
          isLoading={isVerifying}
          disabled={!tokenId}
          className="mt-4"
        >
          Run Audit
        </NeonButton>
      </form>

      {/* Result presentation */}
      {result && (
        <div className="mt-6 border-t border-slate-800/60 pt-6 animate-scale-in">
          {result.isValid ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <span>✅ VERIFIED VALID</span>
              </div>
              <p className="text-xs text-emerald-300/80 mt-1 font-medium">
                The SBT contract confirmed this credential is active, unrevoked, and unexpired.
              </p>
              <div className="mt-3 space-y-1 text-[11px] text-slate-400 font-mono">
                <p>Holder: {result.holder.substring(0, 18)}...</p>
                <p>Issued By: {result.issuerName}</p>
                <p>Course: {result.title}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <span>⚠️ INVALID OR REVOKED</span>
              </div>
              <p className="text-xs text-rose-300/80 mt-1 font-medium">
                This credential could not be verified. It may be revoked, expired, or non-existent.
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs text-rose-400 font-medium font-mono animate-scale-in">
          ⚠️ {error}
        </div>
      )}
    </GlassCard>
  );
}
