"use client";

import { useEffect, useState } from "react";
import { BACKEND_URL } from "../../../lib/constants";
import { useWalletStore } from "../../../store/walletStore";
import CredentialCard from "../../../components/dashboard/CredentialCard";
import NeonButton from "../../../components/ui/NeonButton";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";

export default function IssuedPage() {
  const { address } = useWalletStore();
  const { getAccessToken } = usePrivy();
  const [credentials, setCredentials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!address) return;
    const fetchCredentials = async () => {
      try {
        const token = await getAccessToken();
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
  }, [address, getAccessToken]);

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
            <CredentialCard key={cred._id} credential={cred} />
          ))}
        </div>
      )}
    </div>
  );
}
