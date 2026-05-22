"use client";

import { useState } from "react";
import Badge from "../ui/Badge";
import GlassCard from "../ui/GlassCard";
import { CredentialType } from "../../lib/constants";
import QRVerifyBadge from "../credentials/QRVerifyBadge";

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
  trustLevel?: "self_claimed" | "ai_verified" | "institution_verified";
  trustScore?: number;
  documentVerification?: {
    uploaded: boolean;
    documentData?: string;
    mimeType?: string;
    ocrText?: string;
    logoDetected?: boolean;
    issuerNameMatch?: boolean;
    titleMatch?: boolean;
    fraudIndicators?: string[];
    documentConfidence?: number;
    analyzedAt?: string;
  };
  revocation?: {
    revokedAt?: string;
    reason?: string;
    revokerAddress?: string;
  };
}

interface CredentialCardProps {
  credential: Credential;
  onVerify?: (id: string) => void;
  onEndorse?: (id: string) => void;
  onUploadDocument?: (id: string) => void;
  onRevoke?: (id: string) => void;
  showRevokeButton?: boolean;
}

export default function CredentialCard({
  credential,
  onVerify,
  onEndorse,
  onUploadDocument,
  onRevoke,
  showRevokeButton = false,
}: CredentialCardProps) {
  const [showQR, setShowQR] = useState(false);

  const statusColors = {
    pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    minting: "text-blue-400 bg-blue-400/10 border-blue-400/20 animate-pulse",
    active: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
    expired: "text-slate-400 bg-slate-400/10 border-slate-400/20",
    revoked: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  };

  const trustLevelText = {
    self_claimed: "Self-Claimed",
    ai_verified: "AI Verified",
    institution_verified: "Institution Verified",
  };

  const trustLevelColors = {
    self_claimed: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    ai_verified: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20 shadow-[0_0_8px_rgba(6,182,212,0.15)]",
    institution_verified: "text-green-400 bg-green-400/10 border-green-500/30 animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.3)]",
  };

  const level = credential.trustLevel || "self_claimed";
  const score = credential.trustScore || 0;

  // Gauge colors
  const gaugeColor = 
    score >= 90 ? "stroke-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" :
    score >= 70 ? "stroke-cyan-500" :
    score >= 40 ? "stroke-amber-500" :
    "stroke-rose-500";

  return (
    <div className="relative">
      <GlassCard
        hoverable
        className={`p-6 transition-all duration-300 hover:scale-[1.01] relative overflow-hidden ${
          credential.status === "revoked" ? "border-red-500/30 bg-red-950/5" : ""
        }`}
        glowColor={credential.status === "active" ? (level === "institution_verified" ? "emerald" : "blue") : "none"}
      >
        {/* Revoked Overlay banner */}
        {credential.status === "revoked" && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-red-500 text-black font-extrabold text-sm uppercase px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)] mb-3 flex items-center gap-1.5 animate-bounce">
              <span>⛔</span> Revoked
            </div>
            {credential.revocation?.reason && (
              <p className="text-sm font-semibold text-red-300 max-w-md">
                Reason: &ldquo;{credential.revocation.reason}&rdquo;
              </p>
            )}
            {credential.revocation?.revokedAt && (
              <p className="text-xs text-red-400/80 mt-1">
                Date: {new Date(credential.revocation.revokedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* Title and Issuer */}
          <div className="space-y-1 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge type={credential.credentialType} />
              
              {/* Trust Level Badge */}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-solid ${
                  trustLevelColors[level]
                }`}
              >
                {level === "institution_verified" && <span className="mr-1">🛡️</span>}
                {level === "ai_verified" && <span className="mr-1">✨</span>}
                {trustLevelText[level]}
              </span>

              {/* Document Proof Uploaded Badge */}
              {credential.documentVerification?.uploaded && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 border border-green-500/30 text-green-300 uppercase tracking-wider">
                  📄 Doc Verified
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white mt-2">
              {credential.title}
            </h3>
            <p className="text-sm font-semibold text-cyan-300">{credential.issuerName}</p>
          </div>

          {/* Right side: Status and Score circular gauge */}
          <div className="flex items-center gap-4">
            {/* Trust Score Gauge */}
            {credential.status !== "revoked" && (
              <div className="flex flex-col items-center">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle cx="24" cy="24" r="20" className="stroke-white/5 fill-transparent" strokeWidth="3.5" />
                    <circle 
                      cx="24" 
                      cy="24" 
                      r="20" 
                      className={`fill-transparent transition-all duration-500 ${gaugeColor}`} 
                      strokeWidth="3.5" 
                      strokeDasharray={126} 
                      strokeDashoffset={126 - (126 * score) / 100} 
                    />
                  </svg>
                  <span className="text-xs font-black text-white">
                    {score}
                  </span>
                </div>
                <span className="text-[9px] text-gray-500 font-bold uppercase mt-1">Trust Score</span>
              </div>
            )}

            {/* Status Tag */}
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border border-solid ${
                statusColors[credential.status]
              }`}
            >
              {credential.status}
            </span>
          </div>
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
            {/* Document Upload Button */}
            {onUploadDocument && credential.status === "active" && !credential.documentVerification?.uploaded && (
              <button
                onClick={() => onUploadDocument(credential._id)}
                className="rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 px-3 py-1.5 text-xs font-semibold text-gray-300 transition-all duration-200 flex items-center gap-1"
                title="Upload PDF or Image Proof"
              >
                📄 Upload Proof
              </button>
            )}

            {/* QR Code Button */}
            {credential.status === "active" && credential.tokenId && (
              <button
                onClick={() => setShowQR(!showQR)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 flex items-center gap-1 ${
                  showQR 
                    ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300"
                    : "bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300"
                }`}
              >
                📱 QR Code
              </button>
            )}

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

            {/* Revoke Button (shown for issuer Dashboard or verified issuers) */}
            {showRevokeButton && onRevoke && credential.status === "active" && (
              <button
                onClick={() => onRevoke(credential._id)}
                className="rounded-lg bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/25 px-3 py-1.5 text-xs font-semibold text-rose-300 transition-all duration-200"
              >
                Revoke
              </button>
            )}
          </div>
        </div>

        {/* QR Code Panel inside the card */}
        {showQR && credential.status === "active" && credential.tokenId && (
          <div className="mt-4 border-t border-slate-800/60 pt-4 flex justify-center animate-fadeIn">
            <QRVerifyBadge tokenId={credential.tokenId} title={credential.title} />
          </div>
        )}
      </GlassCard>
    </div>
  );
}
