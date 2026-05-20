"use client";

import { useEffect, useState } from "react";
import { BACKEND_URL } from "../../../lib/constants";
import { useWalletStore } from "../../../store/walletStore";
import GlassCard from "../../../components/ui/GlassCard";
import NeonButton from "../../../components/ui/NeonButton";

export default function EndorsementsPage() {
  const { address } = useWalletStore();
  const [endorsements, setEndorsements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New endorsement form state
  const [recipient, setRecipient] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [skillTag, setSkillTag] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!address) return;
    const fetchEndorsements = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/endorse/:address`); // Wait, let's look at received endorsements routes: `/api/v1/endorse/received/:address`
        // Let's use `/api/v1/endorse/received/${address}` to match backend routes!
        const resReal = await fetch(`${BACKEND_URL}/api/v1/endorse/received/${address}`);
        if (resReal.ok) {
          const data = await resReal.json();
          if (data.success && Array.isArray(data.data)) {
            setEndorsements(data.data);
          }
        }
      } catch (err) {
        console.error("Error fetching endorsements:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEndorsements();
  }, [address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !tokenId || !skillTag || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/endorse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endorserAddress: address || "0x0000000000000000000000000000000000000000",
          recipientAddress: recipient,
          credentialTokenId: parseInt(tokenId),
          skillTag,
          note,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Endorsement submission failed");
      }

      alert("Peer attestation endorsement logged successfully!");
      setRecipient("");
      setTokenId("");
      setSkillTag("");
      setNote("");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred during endorsement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-wide">
          Peer Attestation Center
        </h2>
        <p className="text-xs text-slate-400 font-semibold uppercase mt-1">
          Endorse peer accomplishments, attest professional skills, and review colleague feedback.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Endorse a Colleague Form */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white tracking-wide">
            Attest Colleague Skill
          </h3>
          <GlassCard className="p-6" glowColor="purple">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Peer EOA Wallet Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full rounded-xl bg-slate-900/60 border border-slate-800 py-3 px-4 text-sm text-white placeholder-slate-650 focus:outline-none focus:border-purple-500/50 transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Credential Token ID
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 5293"
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  className="w-full rounded-xl bg-slate-900/60 border border-slate-800 py-3 px-4 text-sm text-white placeholder-slate-650 focus:outline-none focus:border-purple-500/50 transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Skill Tag
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Critical Care, HIPAA Auditor"
                  value={skillTag}
                  onChange={(e) => setSkillTag(e.target.value)}
                  className="w-full rounded-xl bg-slate-900/60 border border-slate-800 py-3 px-4 text-sm text-white placeholder-slate-650 focus:outline-none focus:border-purple-500/50 transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Audit Attestation Note (max 280 chars)
                </label>
                <textarea
                  rows={3}
                  maxLength={280}
                  placeholder="Affirm colleague competency or course completion..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full rounded-xl bg-slate-900/60 border border-slate-800 py-3 px-4 text-sm text-white placeholder-slate-650 focus:outline-none focus:border-purple-500/50 transition-all duration-300 resize-none"
                />
              </div>

              <NeonButton
                type="submit"
                fullWidth
                variant="purple"
                isLoading={isSubmitting}
                className="mt-4"
              >
                Log Attestation
              </NeonButton>
            </form>
          </GlassCard>
        </div>

        {/* Received Feed list */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-white tracking-wide">
            My Skill Attestations Received
          </h3>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-900/40 border border-slate-800" />
              ))}
            </div>
          ) : endorsements.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-850 rounded-2xl bg-[#0d112d]/10">
              <span className="text-4xl">🤝</span>
              <h4 className="text-base font-bold text-white mt-3">No attestations yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed font-medium">
                Share your SoulBound credential Token ID with professional colleagues so they can log peer endorsements directly on the Base ledger!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {endorsements.map((end) => (
                <GlassCard key={end._id} className="p-5 flex flex-col justify-between" glowColor="purple">
                  <div>
                    <div className="flex items-center justify-between text-xs border-b border-slate-850 pb-2 mb-3">
                      <span className="text-slate-500 font-bold uppercase tracking-wider">
                        Attested By: {end.endorserAddress.substring(0, 16)}...
                      </span>
                      <span className="text-[10px] font-bold text-purple-400 font-mono">
                        SKILL: {end.skillTag}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-350 italic">
                      &quot;{end.note || "Attested skill competency on-chain."}&quot;
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 font-semibold font-mono">
                    <span>Token Reference: #{end.credentialTokenId}</span>
                    <span>{new Date(end.createdAt).toLocaleDateString()}</span>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
