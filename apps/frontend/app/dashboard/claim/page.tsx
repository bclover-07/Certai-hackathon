"use client";

import { useClaimStore } from "../../../store/claimStore";
import { useWalletStore } from "../../../store/walletStore";
import { useClaimParser } from "../../../hooks/useClaimParser";
import { useUGFExecute } from "../../../hooks/useUGFExecute";
import ClaimChat from "../../../components/claim/ClaimChat";
import CredentialPreview from "../../../components/claim/CredentialPreview";
import UGFInspector from "../../../components/claim/UGFInspector";
import ConfirmedBadge from "../../../components/claim/ConfirmedBadge";
import QuickClaims from "../../../components/claim/QuickClaims";
import GlassCard from "../../../components/ui/GlassCard";

export default function ClaimPage() {
  const { currentCredential, ugfStage, setUGFStage, setCredential } = useClaimStore();
  const { address } = useWalletStore();
  
  const { parseClaim, isLoading: isAnalyzing } = useClaimParser();
  const { executeUGF } = useUGFExecute();

  const handleSendClaim = (text: string) => {
    if (!address) {
      alert("Please connect your wallet session first!");
      return;
    }
    parseClaim(text, address);
  };

  const handleTriggerMint = () => {
    executeUGF();
  };

  const handleCelebrationClose = () => {
    setUGFStage("idle");
    setCredential(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-wide">
          Conversational SBT Claiming
        </h2>
        <p className="text-xs text-slate-400 font-semibold uppercase mt-1">
          Powered by LangGraph, Google Gemini, and Universal Gas Framework (UGF)
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-stretch h-[calc(100vh-14rem)]">
        {/* Left Column: Chat Room dialogue (Col 7) */}
        <div className="lg:col-span-7 flex flex-col h-full">
          <ClaimChat onSend={handleSendClaim} isLoading={isAnalyzing} />
        </div>

        {/* Right Column: AI previews and terminals (Col 5) */}
        <div className="lg:col-span-5 flex flex-col h-full space-y-6 justify-between">
          
          {/* Celebrating Confirmed Card */}
          {ugfStage === "confirmed" && currentCredential && (
            <ConfirmedBadge
              title={currentCredential.title}
              tokenId={Math.floor(Math.random() * 1000000).toString()} // Simulated token ID for mock state
              txHash={currentCredential.txHash || "0x98f...e3a"}
              onClose={handleCelebrationClose}
            />
          )}

          {/* UGF Relayer console terminal */}
          {ugfStage !== "idle" && ugfStage !== "confirmed" && (
            <div className="flex-1 flex flex-col">
              <UGFInspector stage={ugfStage} txHash={currentCredential?.txHash} />
            </div>
          )}

          {/* Credential Hologram Preview */}
          {ugfStage === "idle" && currentCredential && (
            <div className="flex-1 flex flex-col">
              <CredentialPreview
                credential={currentCredential}
                onConfirm={handleTriggerMint}
                isMinting={false}
              />
            </div>
          )}

          {/* Suggestion Chips & Instructions */}
          {ugfStage === "idle" && !currentCredential && (
            <GlassCard className="p-6 flex-1 flex flex-col justify-between" glowColor="purple">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>🌟</span> SBT Claim Instructions
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-400 font-medium">
                    State your learning or training accomplishments. Our LangGraph AI agent automatically analyzes the text, validates organizational eligibility, parses skills, and prepares signed Solidity calldata.
                  </p>
                </div>
                
                <QuickClaims onSelect={handleSendClaim} />
              </div>

              <div className="mt-8 border-t border-slate-850 pt-5 text-[10px] text-slate-500 font-semibold flex items-center justify-between">
                <span>Relayer status: ONLINE</span>
                <span>Active Network: Base Sepolia</span>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
