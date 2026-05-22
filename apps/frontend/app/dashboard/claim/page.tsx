"use client";

import { useState } from "react";
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
import dynamic from 'next/dynamic';

const BioVerificationModal = dynamic(
  () => import('@/components/bio/BioVerificationModal'),
  { ssr: false }
);

export default function ClaimPage() {
  const { currentCredential, ugfStage, setUGFStage, setCredential, addMessage } = useClaimStore();
  const { address } = useWalletStore();
  
  const { parseClaim, isLoading: isAnalyzing } = useClaimParser();
  const { executeUGF } = useUGFExecute();

  const [showBioModal, setShowBioModal] = useState(false);
  const [bioCredentialTitle, setBioCredentialTitle] = useState('');
  const [bioVerified, setBioVerified] = useState(false);
  const [bioResult, setBioResult] = useState<any>(null);
  const [pendingBioCredential, setPendingBioCredential] = useState<any>(null);

  // Detect if AI response requires bio verification
  const checkIfBioRequired = (reply: string, credential: any): boolean => {
    const HIGH_STAKES = [
      'cpr', 'bls', 'acls', 'pals', 'trauma', 'emergency',
      'resuscitation', 'airway', 'triage', 'cardiac', 'life support',
      'board certification', 'medical license', 'clinical'
    ];
    const inputLower = (credential?.title || '').toLowerCase();
    return HIGH_STAKES.some(term => inputLower.includes(term));
  };

  // Called when AI returns a parsed credential
  const handleAIResponse = (response: any) => {
    if (response.credential && checkIfBioRequired('', response.credential)) {
      // Store the credential and trigger bio verification
      setPendingBioCredential(response);
      setBioCredentialTitle(response.credential.title || 'Clinical Credential');
      setShowBioModal(true);
    } else {
      // Regular credential — mint directly (existing UGF flow)
      if (response.credential && response.credential.credentialType !== 'invalid') {
        setCredential({
          ...response.credential,
          id: response.credentialId,
          calldata: response.calldata,
          contractAddress: response.contractAddress
        });
      }
    }
  };

  // Called when bio verification completes
  const handleBioComplete = (result: any) => {
    setShowBioModal(false);
    setBioResult(result);
    setBioVerified(true);

    if (result.passed) {
      // Attach bio data to pending credential and proceed to UGF
      const enrichedCredential = {
        ...pendingBioCredential.credential,
        id: pendingBioCredential.credentialId,
        calldata: pendingBioCredential.calldata,
        contractAddress: pendingBioCredential.contractAddress,
        bioVerification: {
          passed: true,
          livenessScore: result.livenessScore,
          heartRateAvg: result.heartRateAvg,
          stressScore: result.stressScore,
          clinicalScore: `${result.clinicalScore}/3`,
          meshDetected: result.meshDetected,
          verifiedAt: new Date().toISOString()
        }
      };

      // Add confirmation message to chat
      addMessage({
        role: 'assistant',
        content: `✅ Bio-verification passed!\n\n🫀 Heart Rate: ${result.heartRateAvg} BPM\n👁 Liveness: ${result.livenessScore}%\n🧠 Clinical: ${result.clinicalScore}/3 correct\n\nYour SoulBound credential will include the "Bio-Verified" trait permanently on Base Sepolia. Ready to mint with UGF?`
      });

      // Proceed to UGF by setting currentCredential in Zustand store
      setCredential(enrichedCredential);
    } else {
      addMessage({
        role: 'assistant',
        content: `⚠️ Bio-verification did not pass (Clinical: ${result.clinicalScore}/3, Liveness: ${result.livenessScore}%). The credential requires at least 2/3 correct answers and liveness confirmation. Please try again.`
      });
      setPendingBioCredential(null);
    }
  };

  const handleSendClaim = async (text: string) => {
    if (!address) {
      alert("Please connect your wallet session first!");
      return;
    }
    const result = await parseClaim(text, address);
    if (result) {
      handleAIResponse(result);
    }
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
              tokenId={currentCredential.tokenId || "1"}
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

      {/* Bio Verification Modal */}
      {showBioModal && (
        <BioVerificationModal
          credentialTitle={bioCredentialTitle}
          onComplete={handleBioComplete}
          onCancel={() => {
            setShowBioModal(false);
            setPendingBioCredential(null);
            addMessage({
              role: 'assistant',
              content: 'Bio-verification cancelled. High-stakes credentials require biometric verification. Let me know when you are ready to try again.'
            });
          }}
        />
      )}
    </div>
  );
}
