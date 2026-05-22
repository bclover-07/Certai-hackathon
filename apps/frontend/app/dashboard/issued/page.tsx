"use client";

import { useEffect, useState, useRef } from "react";
import { BACKEND_URL } from "../../../lib/constants";
import { useWalletStore } from "../../../store/walletStore";
import CredentialCard from "../../../components/dashboard/CredentialCard";
import NeonButton from "../../../components/ui/NeonButton";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import DocumentUploadModal from "../../../components/documents/DocumentUploadModal";

export default function IssuedPage() {
  const { address } = useWalletStore();
  const { getAccessToken } = usePrivy();
  const getTokenRef = useRef(getAccessToken);
  getTokenRef.current = getAccessToken;
  const [credentials, setCredentials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  // Document upload state
  const [uploadingCredId, setUploadingCredId] = useState<string | null>(null);

  // Revocation state
  const [revokingCredId, setRevokingCredId] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [isRevoking, setIsRevoking] = useState(false);

  const fetchCredentials = async () => {
    if (!address) return;
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

  const fetchProfile = async () => {
    if (!address) return;
    try {
      const token = await getTokenRef.current();
      const res = await fetch(`${BACKEND_URL}/api/v1/users/${address}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setProfile(data.data);
        }
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  useEffect(() => {
    if (address) {
      fetchCredentials();
      fetchProfile();
    }
  }, [address]);

  const handleUploadSuccess = () => {
    fetchCredentials();
  };

  const handleRevoke = async () => {
    if (!revokingCredId || !address) return;
    setIsRevoking(true);
    try {
      const token = await getTokenRef.current();
      const res = await fetch(`${BACKEND_URL}/api/v1/credentials/${revokingCredId}/revoke`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: revokeReason,
          revokerAddress: address,
        }),
      });
      if (res.ok) {
        setRevokingCredId(null);
        setRevokeReason("");
        fetchCredentials();
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to revoke credential");
      }
    } catch (err) {
      console.error("Error revoking credential:", err);
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-wide">
            My SoulBound SBT Gallery
          </h2>
          <p className="text-xs text-slate-400 font-semibold uppercase mt-1">
            Browse your permanently locked, verified on-chain professional accomplishments.
          </p>
        </div>
        
        {credentials.length > 0 && (
          <NeonButton
            variant="blue"
            onClick={() => router.push("/dashboard/claim")}
            className="py-2.5 text-sm"
          >
            Claim New Credential
          </NeonButton>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl border border-slate-800 bg-[#111638]/40" />
          ))}
        </div>
      ) : credentials.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed border-slate-850 rounded-3xl bg-[#0d112d]/10">
          <span className="text-6xl animate-bounce">📜</span>
          <h3 className="text-xl font-bold text-white mt-4">No SoulBound Credentials Minted</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm leading-relaxed font-medium">
            You don&apos;t have any verified achievements linked to your wallet address. Claim an accomplishment using natural language chat!
          </p>
          <NeonButton
            variant="blue"
            onClick={() => router.push("/dashboard/claim")}
            className="mt-6 px-8 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
          >
            Claim SBT Accomplishment
          </NeonButton>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {credentials.map((cred) => (
            <CredentialCard
              key={cred._id}
              credential={cred}
              onUploadDocument={(id) => setUploadingCredId(id)}
              onRevoke={(id) => {
                setRevokingCredId(id);
                setRevokeReason("");
              }}
              showRevokeButton={true}
            />
          ))}
        </div>
      )}

      {/* Document Upload Modal */}
      {uploadingCredId && (
        <DocumentUploadModal
          isOpen={true}
          credentialId={uploadingCredId}
          onClose={() => setUploadingCredId(null)}
          onSuccess={handleUploadSuccess}
        />
      )}

      {/* Revocation Modal */}
      {revokingCredId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl p-6 relative shadow-2xl text-white">
            <h3 className="text-lg font-bold text-rose-400 mb-2">
              Revoke SoulBound Credential
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Are you sure you want to revoke this credential? This action is permanent and will reset its Trust Score to 0.
            </p>
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Reason for Revocation
              </label>
              <textarea
                required
                placeholder="e.g. Credential expired or invalid proof"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="w-full h-24 rounded-xl bg-slate-900/60 border border-slate-800 py-3 px-4 text-sm text-white placeholder-slate-650 focus:outline-none focus:border-rose-500/50 transition-all duration-300 resize-none font-medium"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setRevokingCredId(null);
                  setRevokeReason("");
                }}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRevoking || !revokeReason.trim()}
                onClick={handleRevoke}
                className="px-5 py-2 bg-gradient-to-r from-rose-500 to-red-650 hover:from-rose-400 hover:to-red-550 text-white font-semibold text-sm rounded-lg transition-all duration-300 shadow-[0_4px_12px_rgba(239,68,68,0.25)] disabled:opacity-50"
              >
                {isRevoking ? "Revoking..." : "Revoke"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
