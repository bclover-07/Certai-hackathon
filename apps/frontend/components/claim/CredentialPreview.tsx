"use client";

import Badge from "../ui/Badge";
import GlassCard from "../ui/GlassCard";
import NeonButton from "../ui/NeonButton";
import { CredentialType } from "../../lib/constants";

interface CredentialPreviewProps {
  credential: {
    title: string;
    issuerName: string;
    description: string;
    hoursCompleted: number;
    skills: string[];
    credentialType: CredentialType;
    aiConfidence?: number;
  };
  onConfirm: () => void;
  isMinting: boolean;
}

export default function CredentialPreview({
  credential,
  onConfirm,
  isMinting,
}: CredentialPreviewProps) {
  const confidencePercent = Math.round((credential.aiConfidence || 0.95) * 100);

  return (
    <GlassCard
      glowColor="blue"
      className="p-6 relative overflow-hidden flex flex-col justify-between h-full border border-cyan-500/20 bg-gradient-to-br from-cyan-950/10 to-indigo-950/10 animate-scale-in"
    >
      {/* Laser line hologram effect */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30 shadow-[0_0_10px_#22d3ee] animate-pulse" />

      <div>
        <div className="flex items-center justify-between">
          <Badge type={credential.credentialType} />
          {credential.aiConfidence && (
            <div className="flex items-center gap-1.5 rounded-full bg-cyan-950/30 border border-cyan-500/10 px-2.5 py-1 text-[10px] font-bold text-cyan-300">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
              AI MATCH: {confidencePercent}%
            </div>
          )}
        </div>

        {/* Floating holographic card body */}
        <div className="mt-6 flex flex-col items-center justify-center py-6 text-center border border-slate-800/40 rounded-xl bg-slate-900/30">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-3xl mb-4 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
            🎓
          </div>
          <h4 className="text-lg font-bold tracking-tight text-white px-4 leading-snug">
            {credential.title || "Accomplishment Attestation"}
          </h4>
          <p className="text-xs font-semibold text-cyan-300 mt-1 uppercase tracking-widest">
            {credential.issuerName || "Verified Issuer"}
          </p>
        </div>

        {/* Metadata summary */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-slate-850 pb-2">
            <span className="text-slate-500 font-bold uppercase tracking-wider">Total Value:</span>
            <span className="text-slate-300 font-semibold">{credential.hoursCompleted} Hours Logged</span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              Extracted Skills Attested
            </span>
            <div className="flex flex-wrap gap-1.5">
              {credential.skills?.map((skill, i) => (
                <span
                  key={i}
                  className="rounded-lg bg-slate-900/80 border border-slate-850/60 px-2 py-0.5 text-[10px] font-medium text-slate-400"
                >
                  {skill}
                </span>
              ))}
              {(!credential.skills || credential.skills.length === 0) && (
                <span className="text-xs text-slate-600 font-semibold italic">No skill tags parsed.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-slate-800/60 pt-6">
        <NeonButton
          onClick={onConfirm}
          isLoading={isMinting}
          variant="blue"
          fullWidth
          className="shadow-[0_0_25px_rgba(6,182,212,0.2)]"
        >
          Confirm & Mint SBT Gaslessly
        </NeonButton>
        <p className="mt-2.5 text-center text-[10px] text-slate-500 font-medium">
          Relayed via Base Sepolia UGF Stablecoin Pool. Zero gas fees required.
        </p>
      </div>
    </GlassCard>
  );
}
