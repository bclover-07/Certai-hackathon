"use client";

import Badge from "../ui/Badge";
import GlassCard from "../ui/GlassCard";
import { CredentialType } from "../../lib/constants";

interface Credential {
  _id: string;
  tokenId?: string;
  txHash?: string;
  credentialType: CredentialType;
  title: string;
  issuerName: string;
  description: string;
  hoursCompleted: number;
  skills: string[];
  status: "pending" | "minting" | "active" | "expired" | "revoked";
  issuedAt: string;
  verificationCount: number;
}

interface CredentialCardProps {
  credential: Credential;
  onVerify?: (id: string) => void;
  onEndorse?: (id: string) => void;
}

export default function CredentialCard({
  credential,
  onVerify,
  onEndorse,
}: CredentialCardProps) {
  const statusColors = {
    pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    minting: "text-blue-400 bg-blue-400/10 border-blue-400/20 animate-pulse",
    active: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
    expired: "text-slate-400 bg-slate-400/10 border-slate-400/20",
    revoked: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  };

  return (
    <GlassCard
      hoverable
      className="p-6 transition-all duration-300 hover:scale-[1.01]"
      glowColor={credential.status === "active" ? "blue" : "none"}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* Title and Issuer */}
        <div className="space-y-1">
          <Badge type={credential.credentialType} />
          <h3 className="text-xl font-bold tracking-tight text-white mt-2">
            {credential.title}
          </h3>
          <p className="text-sm font-semibold text-cyan-300">{credential.issuerName}</p>
        </div>

        {/* Status Tag */}
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border border-solid ${
            statusColors[credential.status]
          }`}
        >
          {credential.status}
        </span>
      </div>

      {/* Description */}
      <p className="mt-4 text-sm text-slate-400 line-clamp-2">
        {credential.description}
      </p>

      {/* Stats (Hours + Verification Count) */}
      <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-slate-800/60 pt-4 text-xs font-semibold text-slate-500">
        <div className="flex items-center gap-1.5">
          <span>⏱️</span>
          <span className="text-slate-300">{credential.hoursCompleted} hours</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>🛡️</span>
          <span className="text-slate-300">
            {credential.verificationCount} verification
            {credential.verificationCount !== 1 ? "s" : ""}
          </span>
        </div>
        {credential.tokenId && (
          <div className="flex items-center gap-1.5">
            <span>🆔</span>
            <span className="text-slate-300 font-mono">Token #{credential.tokenId}</span>
          </div>
        )}
      </div>

      {/* Skills list */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {credential.skills.map((skill, i) => (
          <span
            key={i}
            className="rounded-lg bg-slate-900/60 border border-slate-850 px-2 py-1 text-xs font-medium text-slate-400"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-800/60 pt-4">
        {credential.txHash ? (
          <a
            href={`https://sepolia.basescan.org/tx/${credential.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors duration-200 flex items-center gap-1"
          >
            🔗 View on Basescan
          </a>
        ) : (
          <div className="text-xs text-slate-600 font-semibold italic">Gasless relaying...</div>
        )}

        <div className="flex items-center gap-2">
          {onVerify && credential.status === "active" && (
            <button
              onClick={() => onVerify(credential._id)}
              className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all duration-200"
            >
              Verify Audit
            </button>
          )}
          {onEndorse && credential.status === "active" && (
            <button
              onClick={() => onEndorse(credential._id)}
              className="rounded-lg bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 hover:border-purple-500/40 transition-all duration-200"
            >
              Endorse Skill
            </button>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
