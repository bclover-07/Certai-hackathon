"use client";

import { useState } from "react";
import { BACKEND_URL } from "../../lib/constants";
import { useWalletStore } from "../../store/walletStore";
import GlassCard from "../ui/GlassCard";
import { usePrivy } from "../../hooks/usePrivy";
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
              {result.credential && (
                <>
                  <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                    {/* Trust Header with Level Badge and Score Gauge */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Trust Status</span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-solid ${
                            result.credential.trustLevel === "institution_verified"
                              ? "text-green-400 bg-green-400/10 border-green-500/30 animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                              : result.credential.trustLevel === "ai_verified"
                              ? "text-cyan-400 bg-cyan-400/10 border-cyan-400/20 shadow-[0_0_8px_rgba(6,182,212,0.15)]"
                              : "text-amber-400 bg-amber-400/10 border-amber-400/20"
                          }`}
                        >
                          {result.credential.trustLevel === "institution_verified" && <span className="mr-1">🛡️</span>}
                          {result.credential.trustLevel === "ai_verified" && <span className="mr-1">✨</span>}
                          {result.credential.trustLevel === "institution_verified" ? "Institution Verified" : result.credential.trustLevel === "ai_verified" ? "AI Verified" : "Self-Claimed"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 flex items-center justify-center">
                          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                            <circle cx="22" cy="22" r="18" className="stroke-white/5 fill-transparent" strokeWidth="3" />
                            <circle 
                              cx="22" 
                              cy="22" 
                              r="18" 
                              className={`fill-transparent transition-all duration-500 ${
                                (result.credential.trustScore || 0) >= 90 ? "stroke-green-500" :
                                (result.credential.trustScore || 0) >= 70 ? "stroke-cyan-500" :
                                (result.credential.trustScore || 0) >= 40 ? "stroke-amber-500" :
                                "stroke-rose-500"
                              }`} 
                              strokeWidth="3" 
                              strokeDasharray={113} 
                              strokeDashoffset={113 - (113 * (result.credential.trustScore || 0)) / 100} 
                            />
                          </svg>
                          <span className="text-xs font-black text-white">{result.credential.trustScore || 0}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Trust Score</span>
                      </div>
                    </div>

                    {/* Trust Score Breakdown */}
                    {result.credential.trustScoreBreakdown && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Score Breakdown</h4>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          {[
                            { name: "Issuer Reputation", val: result.credential.trustScoreBreakdown.issuerReputation, max: 25 },
                            { name: "AI Extraction Confidence", val: result.credential.trustScoreBreakdown.aiConfidence, max: 20 },
                            { name: "Verification History", val: result.credential.trustScoreBreakdown.verificationHistory, max: 15 },
                            { name: "Peer Endorsements", val: result.credential.trustScoreBreakdown.endorsementCount, max: 15 },
                            { name: "Document Upload Proof", val: result.credential.trustScoreBreakdown.documentProof, max: 15 },
                            { name: "Institution Approval", val: result.credential.trustScoreBreakdown.institutionApproval, max: 10 }
                          ].map((item) => (
                            <div key={item.name} className="bg-slate-950/40 p-2 rounded-lg border border-white/5">
                              <div className="flex justify-between text-gray-400 font-medium mb-1">
                                <span>{item.name}</span>
                                <span className="font-bold text-white">{item.val}/{item.max}</span>
                              </div>
                              <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                                <div 
                                  className="bg-cyan-500 h-1 rounded-full" 
                                  style={{ width: `${(item.val / item.max) * 100}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Trust Timeline History */}
                    {result.credential.trustLevelHistory && result.credential.trustLevelHistory.length > 0 && (
                      <div className="space-y-2 border-t border-slate-800 pt-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Trust Level Timeline</h4>
                        <div className="relative border-l border-cyan-500/30 pl-4 ml-2 space-y-3">
                          {result.credential.trustLevelHistory.map((item: any, idx: number) => (
                            <div key={idx} className="relative">
                              <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-cyan-500 ring-4 ring-gray-900" />
                              <div className="text-[11px] font-semibold text-white">
                                {item.level === "institution_verified" ? "Institution Approved" : item.level === "ai_verified" ? "AI Verified" : item.level === "revoked" ? "Revoked" : "Self-Claimed"}
                              </div>
                              <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                                {item.reason || "Status updated"} &bull; {new Date(item.changedAt).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 space-y-1 text-[11px] text-slate-400 font-mono">
                    <p>Holder: {result.credential.holderAddress?.substring(0, 18)}...</p>
                    <p>Issued By: {result.credential.issuerName}</p>
                    <p>Course: {result.credential.title}</p>
                  </div>
                  {(result.credential.bioVerification?.bioVerified || result.credential.bioVerification?.passed) && (
                    <div style={{
                      marginTop: 16,
                      padding: '16px 20px',
                      background: 'rgba(0, 230, 118, 0.05)',
                      border: '1px solid rgba(0, 230, 118, 0.2)',
                      borderRadius: 12
                    }}>
                      <div style={{ color: '#00e676', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
                        🛡️ BIO-VERIFIED CREDENTIAL
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[
                          { icon: '🟢', label: 'Human Liveness (MediaPipe 3D-Mesh)', value: 'Passed', score: `${result.credential.bioVerification.livenessScore}%` },
                          { icon: '🟢', label: 'Physiological Stress Control (rPPG)', value: 'Passed', score: `${result.credential.bioVerification.heartRateAvg} BPM avg` },
                          { icon: '🟢', label: 'Clinical Logic Score', value: 'Passed', score: result.credential.bioVerification.clinicalScore },
                          { icon: '📅', label: 'Verified At', value: new Date(result.credential.bioVerification.verifiedAt).toLocaleDateString(), score: '' }
                        ].map(row => (
                          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                            <span style={{ color: '#7890a8' }}>{row.icon} {row.label}</span>
                            <span style={{ color: '#00e676' }}>{row.value} {row.score && <span style={{ color: '#556', fontSize: 11 }}>({row.score})</span>}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <span>⚠️ INVALID OR REVOKED</span>
              </div>
              <p className="text-xs text-rose-300/80 mt-1 font-medium">
                This credential could not be verified. It may be revoked, expired, or non-existent.
              </p>
              {result.credential?.status === "revoked" && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mt-3 text-left">
                  <div className="text-xs font-bold text-red-400 uppercase">Revocation details</div>
                  {result.credential.revocation?.reason && (
                    <p className="text-xs text-red-300 mt-1">
                      Reason: &ldquo;{result.credential.revocation.reason}&rdquo;
                    </p>
                  )}
                  {result.credential.revocation?.revokedAt && (
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Date: {new Date(result.credential.revocation.revokedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
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
