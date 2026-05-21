"use client";

import dynamic from "next/dynamic";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import NeonButton from "../components/ui/NeonButton";

const LandingScene = dynamic(() => import("../components/three/LandingScene"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-[#0d112d]/20">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Loading 3D Scene...</span>
      </div>
    </div>
  ),
});

export default function Home() {
  const { login, authenticated, ready } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) {
      router.push("/dashboard");
    }
  }, [ready, authenticated, router]);

  return (
    <div className="relative min-h-screen bg-[#070a24] overflow-hidden flex flex-col justify-between">
      <div className="absolute top-[-10%] left-[-10%] h-[60%] w-[60%] rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-purple-500/10 blur-[150px] pointer-events-none" />

      <header className="relative z-10 flex h-20 items-center justify-between px-8 lg:px-16">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-400 to-purple-600 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <span className="text-xl font-bold text-white">C</span>
          </div>
          <span className="text-xl font-extrabold tracking-wider text-white">
            CERT<span className="bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">AI</span>
          </span>
        </div>
        
        {ready && !authenticated && (
          <button
            onClick={login}
            className="rounded-xl border border-slate-800 bg-[#0d112d]/60 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:border-cyan-500/30 hover:text-white transition-all duration-300 backdrop-blur-md"
          >
            Launch Console
          </button>
        )}
      </header>

      <main className="relative z-10 grid flex-1 gap-12 px-8 py-10 lg:grid-cols-2 lg:px-16 lg:py-20 items-center max-w-7xl mx-auto w-full">
        <div className="space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-4 py-1.5 text-xs font-semibold text-cyan-400">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            UGF GASLESS PROTOCOL ON BASE SEPOLIA
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            AI-Attested{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
              SoulBound
            </span>{" "}
            Credential Registry
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
            CERTAI translates natural language clinical and academic claims into permanently verified, tamper-proof SoulBound NFT credentials gaslessly. Built for next-gen medical staffing and compliance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
            <NeonButton
              variant="blue"
              onClick={login}
              className="px-8 shadow-[0_0_30px_rgba(6,182,212,0.25)]"
            >
              Verify Your Claim
            </NeonButton>
            <a
              href="https://sepolia.basescan.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center font-semibold rounded-xl border border-slate-800 bg-[#0d112d]/40 px-8 py-3 text-slate-300 hover:border-slate-700 hover:text-white transition-all duration-300 backdrop-blur-md"
            >
              Explorer Ledger
            </a>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-10 border-t border-slate-800/60 max-w-md mx-auto lg:mx-0">
            <div>
              <p className="text-3xl font-extrabold text-white">0 Gas</p>
              <p className="text-xs text-slate-500 font-bold uppercase mt-1">UGF Relay</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white">100%</p>
              <p className="text-xs text-slate-500 font-bold uppercase mt-1">Soulbound</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white">&lt; 3s</p>
              <p className="text-xs text-slate-500 font-bold uppercase mt-1">AI Audit</p>
            </div>
          </div>
        </div>

        <div className="h-[400px] sm:h-[500px] lg:h-[600px] w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#0d112d]/20 backdrop-blur-md relative shadow-[inset_0_0_30px_rgba(0,0,0,0.6)]">
          <Suspense fallback={
            <div className="h-full w-full flex items-center justify-center">
              <div className="h-8 w-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            </div>
          }>
            <LandingScene />
          </Suspense>
        </div>
      </main>

      <footer className="relative z-10 border-t border-slate-900 bg-[#070a24]/90 py-6 px-8 text-center text-xs text-slate-600 font-semibold tracking-wider uppercase">
        © 2026 CERTAI Protocol. All rights reserved. Built for Base Sepolia Hackathon.
      </footer>
    </div>
  );
}
