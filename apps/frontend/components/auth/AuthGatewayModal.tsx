"use client";

import React, { useState, useEffect } from "react";
import { usePrivy as usePrivyActual } from "@privy-io/react-auth";
import { setMockAuth } from "../../hooks/usePrivy";
import { motion, AnimatePresence } from "framer-motion";
import NeonButton from "../ui/NeonButton";

export default function AuthGatewayModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"privy" | "sandbox">("sandbox");
  const { login: privyLogin } = usePrivyActual();

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-auth-gateway", handleOpen);
    return () => window.removeEventListener("open-auth-gateway", handleOpen);
  }, []);

  const handleSandboxLogin = (role: "doctor" | "hospital" | "trust") => {
    let address = "";
    let email = "";
    
    if (role === "doctor") {
      address = "0x742d35cc6634c0532925a3b844bc454e4438f44e";
      email = "doctor.okafors@certai.academy";
    } else if (role === "hospital") {
      address = "0x90F8bf6A479f320ead0075471d310030F88937f2";
      email = "admin@memorialhospital.org";
    } else {
      address = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293bc";
      email = "audits@nhs-trust.gov";
    }

    setMockAuth(true, address, email);
    setIsOpen(false);
    
    // Refresh or redirect to trigger the routing logic
    window.location.href = "/dashboard";
  };

  const handlePrivyConnect = () => {
    setIsOpen(false);
    try {
      privyLogin();
    } catch (err) {
      console.error("Privy login failed:", err);
      // Fallback
      handleSandboxLogin("doctor");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Dark blurred backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="absolute inset-0 bg-[#030508]/85 backdrop-blur-md"
        />

        {/* Modal body */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800 bg-[#070a19]/90 p-8 shadow-[0_0_50px_rgba(0,212,255,0.15)] backdrop-blur-2xl"
        >
          {/* Laser beam top scanner line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00d4ff]" />

          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors duration-200 text-lg"
          >
            ✕
          </button>

          {/* Header */}
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-400 to-purple-600 shadow-[0_0_20px_rgba(6,182,212,0.4)] mb-2">
              <span className="text-2xl font-bold text-white">C</span>
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight text-white font-outfit">
              Select Security Gateway
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Choose your authentication protocol. Sandbox simulator bypass is recommended for evaluation.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-800/80 mb-6 bg-slate-950/40 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("sandbox")}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                activeTab === "sandbox"
                  ? "bg-purple-500/10 border border-purple-500/30 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.1)]"
                  : "text-slate-500 hover:text-slate-350"
              }`}
            >
              🛠️ Sandbox Simulator
            </button>
            <button
              onClick={() => setActiveTab("privy")}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                activeTab === "privy"
                  ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                  : "text-slate-500 hover:text-slate-350"
              }`}
            >
              🔑 Base Sepolia (Privy)
            </button>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === "sandbox" ? (
              <motion.div
                key="sandbox"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 text-[11px] leading-relaxed text-purple-350 font-mono">
                  🚨 <span className="font-extrabold">SANDBOX BYPASS IS ACTIVE:</span> Instant dynamic login bypasses any API rate-limits, allows creating demo claims, and operates gaslessly.
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                    Predefined Sandbox Roles
                  </p>

                  <button
                    onClick={() => handleSandboxLogin("doctor")}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-800 bg-[#090d22]/80 hover:border-purple-500/40 hover:bg-purple-500/5 hover:-translate-y-0.5 transition-all duration-300 text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 bg-slate-900 rounded-xl group-hover:scale-110 transition-transform">🩺</span>
                      <div>
                        <p className="text-sm font-bold text-white">Dr. Okafor (Scholar)</p>
                        <p className="text-[10px] text-slate-500 font-mono">doctor.okafors@certai.academy</p>
                      </div>
                    </div>
                    <span className="text-xs text-purple-400 font-bold group-hover:translate-x-1 transition-transform">➔</span>
                  </button>

                  <button
                    onClick={() => handleSandboxLogin("hospital")}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-800 bg-[#090d22]/80 hover:border-purple-500/40 hover:bg-purple-500/5 hover:-translate-y-0.5 transition-all duration-300 text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 bg-slate-900 rounded-xl group-hover:scale-110 transition-transform">🏛️</span>
                      <div>
                        <p className="text-sm font-bold text-white">Memorial Hospital (Issuer)</p>
                        <p className="text-[10px] text-slate-500 font-mono">admin@memorialhospital.org</p>
                      </div>
                    </div>
                    <span className="text-xs text-purple-400 font-bold group-hover:translate-x-1 transition-transform">➔</span>
                  </button>

                  <button
                    onClick={() => handleSandboxLogin("trust")}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-800 bg-[#090d22]/80 hover:border-purple-500/40 hover:bg-purple-500/5 hover:-translate-y-0.5 transition-all duration-300 text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 bg-slate-900 rounded-xl group-hover:scale-110 transition-transform">🔍</span>
                      <div>
                        <p className="text-sm font-bold text-white">NHS Trust (Verifier Auditor)</p>
                        <p className="text-[10px] text-slate-500 font-mono">audits@nhs-trust.gov</p>
                      </div>
                    </div>
                    <span className="text-xs text-purple-400 font-bold group-hover:translate-x-1 transition-transform">➔</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="privy"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-[11px] leading-relaxed text-cyan-350 font-mono">
                  🔑 <span className="font-extrabold">SECURE LEDGER CONNECTION:</span> Uses Privy to link on-chain credentials to your email, Google profile, or web3 wallets directly on Base Sepolia.
                </div>

                <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-800 text-center space-y-4">
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    Connecting via Privy requires a configured Privy App ID. If the Privy servers are unreachable or the modal does not load, please switch to the Sandbox Simulator.
                  </p>

                  <NeonButton
                    onClick={handlePrivyConnect}
                    variant="blue"
                    fullWidth
                    className="shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                  >
                    Launch Privy Modal
                  </NeonButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
