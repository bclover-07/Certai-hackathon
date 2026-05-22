"use client";

import { usePrivy } from "../../../hooks/usePrivy";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import GlassCard from "../../../components/ui/GlassCard";
import NeonButton from "../../../components/ui/NeonButton";

export default function LoginPage() {
  const { login, authenticated, ready } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) {
      router.push("/dashboard");
    }
  }, [ready, authenticated, router]);

  return (
    <div className="relative min-h-screen bg-[#070a24] flex items-center justify-center p-6 overflow-hidden">
      {/* Background spotlights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      
      <GlassCard glowColor="blue" className="w-full max-w-md p-8 text-center space-y-6 animate-scale-in">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-400 to-purple-600 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <span className="text-2xl font-bold text-white">C</span>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            Secure Console Access
          </h2>
          <p className="text-sm text-slate-400 mt-1.5 font-medium">
            Connect to the CERTAI Credential Hub
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <NeonButton
            onClick={login}
            variant="blue"
            fullWidth
            className="shadow-[0_0_20px_rgba(6,182,212,0.2)]"
          >
            Authenticate Profile
          </NeonButton>
          
          <button
            onClick={() => router.push("/")}
            className="text-xs text-slate-500 hover:text-slate-400 font-semibold uppercase tracking-wider block mx-auto transition-colors"
          >
            Back to homepage
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
