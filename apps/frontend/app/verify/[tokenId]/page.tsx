"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { BACKEND_URL } from '../../../lib/constants';

interface VerificationResult {
  verified: boolean;
  isValid: boolean;
  credential: {
    _id: string;
    tokenId: string;
    txHash?: string;
    credentialType: string;
    title: string;
    description: string;
    issuerName: string;
    hoursCompleted: number;
    skills: string[];
    status: string;
    issuedAt: string;
    verificationCount: number;
    trustLevel?: "self_claimed" | "ai_verified" | "institution_verified";
    trustScore?: number;
    trustScoreBreakdown?: {
      issuerReputation: number;
      aiConfidence: number;
      verificationHistory: number;
      endorsementCount: number;
      documentProof: number;
      institutionApproval: number;
    };
    trustLevelHistory?: Array<{
      level: string;
      changedBy: string;
      changedAt: string;
      reason: string;
    }>;
    bioVerification?: {
      bioVerified?: boolean;
      passed?: boolean;
      livenessScore?: number;
      heartRateAvg?: number;
      clinicalScore?: string;
      verifiedAt: string;
    };
    documentVerification?: {
      uploaded: boolean;
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
  };
  log: any;
}

export default function QRVerifyPage() {
  const params = useParams();
  const tokenId = params.tokenId as string;
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenId) return;

    const performVerification = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tokenId: parseInt(tokenId),
            credentialTokenId: parseInt(tokenId),
            verifierAddress: '0x0000000000000000000000000000000000000000',
            purpose: 'qr_scan',
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Verification failed');
        }

        setResult(data.data);
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message || 'Unable to retrieve verification records.');
      } finally {
        setLoading(false);
      }
    };

    performVerification();
  }, [tokenId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-cyan-400 font-semibold tracking-wide animate-pulse">
          AUDITING ON-CHAIN SBT & BIOMETRIC PROOF...
        </p>
      </div>
    );
  }

  if (errorMsg || !result) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white/5 border border-red-500/25 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 text-3xl">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-red-400 mb-2">Verification Failed</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            {errorMsg || 'The requested credential verification record could not be located or is invalid.'}
          </p>
          <a
            href="/"
            className="inline-block px-6 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all font-medium text-sm"
          >
            Go to CERTAI Home
          </a>
        </div>
      </div>
    );
  }

  const { isValid, credential } = result;
  const level = credential.trustLevel || 'self_claimed';
  const score = credential.trustScore || 0;

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

  const gaugeColor = 
    score >= 90 ? "stroke-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]" :
    score >= 70 ? "stroke-cyan-500" :
    score >= 40 ? "stroke-amber-500" :
    "stroke-rose-500";

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-2xl w-full bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl relative z-10 my-8">
        
        {/* Verification Status Header */}
        <div className="text-center pb-6 border-b border-white/5">
          <div className="inline-block mb-3">
            {isValid ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                🛡️ Verified Authenticity Valid
              </div>
            ) : (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
                ⚠️ Invalid or Revoked Credential
              </div>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400 mt-2">
            {credential.title}
          </h1>
          <p className="text-sm font-semibold text-cyan-300 mt-1">{credential.issuerName}</p>
        </div>

        {/* Revocation Warning Box */}
        {credential.status === 'revoked' && (
          <div className="my-6 p-4 rounded-2xl border border-red-500/30 bg-red-950/20 text-center animate-pulse">
            <div className="text-red-400 font-extrabold text-sm uppercase mb-2 flex items-center justify-center gap-1">
              <span>⛔</span> Credential Revoked
            </div>
            {credential.revocation?.reason && (
              <p className="text-sm font-semibold text-red-200">
                Reason: &ldquo;{credential.revocation.reason}&rdquo;
              </p>
            )}
            {credential.revocation?.revokedAt && (
              <p className="text-xs text-red-400/80 mt-1">
                Revoked On: {new Date(credential.revocation.revokedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          {/* Left Block: Basic Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Holder Address</h3>
              <p className="text-sm font-mono text-slate-300 mt-1 truncate bg-black/40 p-2.5 rounded-xl border border-white/5">
                {result.log?.holderAddress || 'Unknown Holder'}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Description</h3>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                {credential.description}
              </p>
            </div>
            <div className="flex gap-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Hours</h3>
                <p className="text-lg font-bold text-white mt-1">⏱️ {credential.hoursCompleted} Hours</p>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Audits</h3>
                <p className="text-lg font-bold text-white mt-1">🛡️ {credential.verificationCount} Audits</p>
              </div>
            </div>
            {credential.txHash && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">On-Chain Transaction</h3>
                <a
                  href={`/explorer/${credential.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 mt-1 font-semibold transition-colors"
                >
                  🔗 View Attestation Ledger ↗
                </a>
              </div>
            )}
          </div>

          {/* Right Block: Trust layers and Score */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Trust Layer</h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-solid ${
                    trustLevelColors[level]
                  }`}
                >
                  {level === 'institution_verified' && <span className="mr-1">🛡️</span>}
                  {level === 'ai_verified' && <span className="mr-1">✨</span>}
                  {trustLevelText[level]}
                </span>
              </div>

              {credential.status !== 'revoked' && (
                <div className="flex flex-col items-center">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                      <circle cx="24" cy="24" r="20" className="stroke-white/5 fill-transparent" strokeWidth="3" />
                      <circle 
                        cx="24" 
                        cy="24" 
                        r="20" 
                        className={`fill-transparent transition-all duration-500 ${gaugeColor}`} 
                        strokeWidth="3" 
                        strokeDasharray={126} 
                        strokeDashoffset={126 - (126 * score) / 100} 
                      />
                    </svg>
                    <span className="text-xs font-black text-white">{score}</span>
                  </div>
                  <span className="text-[9px] text-gray-500 font-bold uppercase mt-1">Trust Score</span>
                </div>
              )}
            </div>

            {/* Score Breakdown list */}
            {credential.trustScoreBreakdown && (
              <div className="space-y-1.5 border-t border-slate-800 pt-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Breakdown Metrics</h4>
                <div className="space-y-1 text-[11px]">
                  {[
                    { name: "Issuer Registry Check", val: credential.trustScoreBreakdown.issuerReputation, max: 25 },
                    { name: "AI Extraction Confidence", val: credential.trustScoreBreakdown.aiConfidence, max: 20 },
                    { name: "Dynamic Verification Log", val: credential.trustScoreBreakdown.verificationHistory, max: 15 },
                    { name: "Peer Endorsements", val: credential.trustScoreBreakdown.endorsementCount, max: 15 },
                    { name: "OCR & Document Check", val: credential.trustScoreBreakdown.documentProof, max: 15 },
                    { name: "Institutional Signature", val: credential.trustScoreBreakdown.institutionApproval, max: 10 }
                  ].map(item => (
                    <div key={item.name} className="flex justify-between items-center py-0.5">
                      <span className="text-gray-400">{item.name}</span>
                      <span className="font-semibold text-white">{item.val}/{item.max}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Biometrics Results Badge */}
        {credential.bioVerification && (credential.bioVerification.bioVerified || credential.bioVerification.passed) && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 my-6">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mb-4">
              <span>🛡️</span> Liveness & Biometric Verification Record
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs font-medium">
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 flex justify-between items-center">
                <span className="text-gray-400">MediaPipe Liveness</span>
                <span className="text-emerald-400 font-bold">Passed ({credential.bioVerification.livenessScore}%)</span>
              </div>
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 flex justify-between items-center">
                <span className="text-gray-400">rPPG Pulse Scan</span>
                <span className="text-emerald-400 font-bold">{credential.bioVerification.heartRateAvg} BPM avg</span>
              </div>
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 flex justify-between items-center">
                <span className="text-gray-400">Clinical Logic Challenge</span>
                <span className="text-emerald-400 font-bold">{credential.bioVerification.clinicalScore || 'Passed'}</span>
              </div>
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 flex justify-between items-center">
                <span className="text-gray-400">Verification Date</span>
                <span className="text-slate-300 font-bold">{new Date(credential.bioVerification.verifiedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Document Verification Proof Details */}
        {credential.documentVerification?.uploaded && (
          <div className="bg-white/5 border border-white/5 rounded-2xl p-5 my-6 space-y-3">
            <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-1.5">
              <span>📄</span> Institutional Certificate Document Verification
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                <div className="text-gray-400 text-[10px] font-bold uppercase mb-1">Logo Verification</div>
                <div className="font-bold text-emerald-400">{credential.documentVerification.logoDetected ? 'Passed ✓' : 'Failed ✗'}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                <div className="text-gray-400 text-[10px] font-bold uppercase mb-1">Issuer Match</div>
                <div className="font-bold text-emerald-400">{credential.documentVerification.issuerNameMatch ? 'Passed ✓' : 'Failed ✗'}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                <div className="text-gray-400 text-[10px] font-bold uppercase mb-1">Title Match</div>
                <div className="font-bold text-emerald-400">{credential.documentVerification.titleMatch ? 'Passed ✓' : 'Failed ✗'}</div>
              </div>
            </div>
            {credential.documentVerification.documentConfidence !== undefined && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-semibold">Gemini Vision Authenticity Rating:</span>
                <span className="text-cyan-400 font-bold">{Math.round(credential.documentVerification.documentConfidence * 100)}%</span>
              </div>
            )}
          </div>
        )}

        {/* Trust timeline logs */}
        {credential.trustLevelHistory && credential.trustLevelHistory.length > 0 && (
          <div className="border-t border-white/5 pt-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Trust Level Timeline</h3>
            <div className="relative border-l border-cyan-500/30 pl-4 ml-2 space-y-4">
              {credential.trustLevelHistory.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-cyan-500 ring-4 ring-gray-950" />
                  <div className="text-xs font-semibold text-white">
                    {item.level === 'institution_verified' ? 'Institution Verification Confirmed' : item.level === 'ai_verified' ? 'Document AI Verified' : item.level === 'revoked' ? 'Revocation Set' : 'Self-Claimed Creation'}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                    {item.reason} &bull; {new Date(item.changedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center border-t border-white/5 pt-6 mt-6">
          <p className="text-[10px] text-slate-500">
            Powered by CERTAI &bull; Verification logged at {new Date(result.log?.verifiedAt).toLocaleTimeString()}
          </p>
        </div>

      </div>
    </div>
  );
}
