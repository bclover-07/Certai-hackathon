"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "../../../hooks/usePrivy";
import { BACKEND_URL } from "../../../lib/constants";
import GlassCard from "../../../components/ui/GlassCard";
import NeonButton from "../../../components/ui/NeonButton";

export default function OnboardPage() {
  const { user, getAccessToken, ready, authenticated } = usePrivy();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"learner" | "verifier" | "issuer">("learner");
  const [displayName, setDisplayName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [organization, setOrganization] = useState("");
  const [bio, setBio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingOnboarded, setCheckingOnboarded] = useState(true);

  // Pre-fill displayName from Privy login method (Google profile name or email username)
  useEffect(() => {
    if (ready && user && !displayName) {
      const googleName = user.google?.name || 
        (user.linkedAccounts?.find((a: any) => a.type === "google_oauth") as any)?.name || "";
      
      if (googleName) {
        setDisplayName(googleName);
      } else if (user.email?.address) {
        // Fallback to username part of the email address
        setDisplayName(user.email.address.split("@")[0]);
      }
    }
  }, [ready, user, displayName]);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/login");
      return;
    }

    if (!ready || !user) return;

    const checkOnboardedStatus = async () => {
      try {
        const token = await getAccessToken();
        const address = user?.wallet?.address || user?.id;
        if (!address) {
          setCheckingOnboarded(false);
          return;
        }

        const res = await fetch(`${BACKEND_URL}/api/v1/users/${address}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          router.push("/dashboard");
        } else {
          setCheckingOnboarded(false);
        }
      } catch (err) {
        console.error("Error checking onboarding status:", err);
        setCheckingOnboarded(false);
      }
    };

    checkOnboardedStatus();
  }, [ready, authenticated, user, router, getAccessToken]);

  if (checkingOnboarded) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#070a24]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
          <span className="text-purple-400 animate-pulse text-sm font-semibold uppercase tracking-wider">
            Verifying Authentication Status...
          </span>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const token = await getAccessToken();
      const walletAddress = user?.wallet?.address || user?.id || "0x0000000000000000000000000000000000000000";

      // Dynamically extract email address from standard email or Google OAuth accounts
      const emailAddress = user?.email?.address || user?.google?.email || 
        (user?.linkedAccounts?.find((acc: any) => acc.type === "email" || acc.type === "google_oauth") as any)?.address || 
        (user?.linkedAccounts?.find((acc: any) => acc.type === "email" || acc.type === "google_oauth") as any)?.email || "";

      const res = await fetch(`${BACKEND_URL}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          walletAddress,
          privyUserId: user?.id,
          email: emailAddress,
          profile: {
            displayName,
            organization,
            specialty,
            role,
            bio,
          },
        }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Onboarding failed");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit onboarding profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#070a24] flex items-center justify-center p-6 overflow-hidden">
      {/* Glow circles */}
      <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      <GlassCard glowColor="purple" className="w-full max-w-xl p-8 space-y-6 animate-scale-in">
        {/* Progress header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">
            Onboarding Wizard
          </span>
          <span className="text-xs font-bold text-purple-400 font-mono">
            STEP {step} OF 3
          </span>
        </div>

        {/* STEP 1: Role picker */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white">Select Your Registry Role</h2>
              <p className="text-xs text-slate-400 font-medium">
                Choose how you intend to interact with the CERTAI credentialing registry network.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  id: "learner",
                  emoji: "🎓",
                  title: "Scholar",
                  desc: "Claim & showcase permanent SoulBound credentials.",
                },
                {
                  id: "issuer",
                  emoji: "📝",
                  title: "Issuer Office",
                  desc: "Issue or certify medical courses and credits.",
                },
                {
                  id: "verifier",
                  emoji: "🛡️",
                  title: "Verifier Auditor",
                  desc: "Request on-chain audits and verify staff records.",
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRole(item.id as any)}
                  className={`rounded-2xl border p-5 text-left flex flex-col justify-between transition-all duration-300 ${
                    role === item.id
                      ? "bg-purple-500/10 border-purple-500/40 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-350"
                  }`}
                >
                  <span className="text-2xl mb-3">{item.emoji}</span>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                    <p className="text-[10px] leading-relaxed text-slate-500 font-medium">
                      {item.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <NeonButton variant="purple" fullWidth onClick={() => setStep(2)}>
              Proceed to profile setup
            </NeonButton>
          </div>
        )}

        {/* STEP 2: Name and specialty */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white">Who are you?</h2>
              <p className="text-xs text-slate-400 font-medium">
                Provide your professional name and primary domain of practice.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Full Professional Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Alexander Vance"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-xl bg-slate-900/60 border border-slate-800 py-3.5 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50 transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Primary Specialty / Study
                </label>
                <input
                  type="text"
                  placeholder="e.g. Emergency Critical Care Medicine"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full rounded-xl bg-slate-900/60 border border-slate-800 py-3.5 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50 transition-all duration-300"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/2 rounded-xl border border-slate-800 bg-[#0d112d]/40 py-3 text-sm font-semibold text-slate-400 hover:border-slate-700 hover:text-white transition-all duration-350"
              >
                Back
              </button>
              <NeonButton
                variant="purple"
                className="w-1/2"
                onClick={() => setStep(3)}
                disabled={!displayName.trim()}
              >
                Continue
              </NeonButton>
            </div>
          </div>
        )}

        {/* STEP 3: Bio and Organization */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white">Affiliations & Bio</h2>
              <p className="text-xs text-slate-400 font-medium">
                Add where you currently work/study and a brief background bio.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Current Hospital / School Organization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Massachusetts General Hospital"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full rounded-xl bg-slate-900/60 border border-slate-800 py-3.5 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50 transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Brief Bio Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="Briefly state your background or career goals..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-xl bg-slate-900/60 border border-slate-800 py-3.5 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50 transition-all duration-300 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/2 rounded-xl border border-slate-800 bg-[#0d112d]/40 py-3 text-sm font-semibold text-slate-400 hover:border-slate-700 hover:text-white transition-all duration-350"
              >
                Back
              </button>
              <NeonButton
                type="submit"
                variant="purple"
                className="w-1/2 shadow-[0_0_20px_rgba(168,85,247,0.25)]"
                isLoading={isSubmitting}
              >
                Onboard Profile
              </NeonButton>
            </div>
          </form>
        )}
      </GlassCard>
    </div>
  );
}
