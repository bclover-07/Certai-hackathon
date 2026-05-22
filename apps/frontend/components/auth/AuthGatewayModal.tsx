"use client";

import React, { useState, useEffect } from "react";
import { usePrivy as usePrivyActual } from "@privy-io/react-auth";
import { setMockAuth } from "../../hooks/usePrivy";
import { motion, AnimatePresence } from "framer-motion";
import NeonButton from "../ui/NeonButton";

// Custom Colored SVG Icons
const MetaMaskIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 320 293" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M312.062 1.938L193.312 92.5625L173.812 55.4375L312.062 1.938Z" fill="#E2761B" stroke="#E2761B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.9375 1.938L126.688 92.5625L146.188 55.4375L7.9375 1.938Z" fill="#E2761B" stroke="#E2761B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M260.625 240L233.125 290.875L312.188 231.25L260.625 240Z" fill="#E2761B" stroke="#E2761B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M59.375 240L86.875 290.875L7.8125 231.25L59.375 240Z" fill="#E2761B" stroke="#E2761B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M259.625 158.438L262.812 231.5L311.938 184.25L259.625 158.438Z" fill="#E2761B" stroke="#E2761B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M60.375 158.438L57.1875 231.5L8.0625 184.25L60.375 158.438Z" fill="#E2761B" stroke="#E2761B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M125.625 91.5625L106.688 152.125L59.375 158.438L125.625 91.5625Z" fill="#E2761B" stroke="#E2761B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M194.375 91.5625L213.312 152.125L260.625 158.438L194.375 91.5625Z" fill="#E2761B" stroke="#E2761B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M126.688 92.5625L160 137.812L193.312 92.5625L173.812 55.4375L146.188 55.4375L126.688 92.5625Z" fill="#E2761B" stroke="#E2761B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M160 216L124.375 151L106.688 152.125L111.188 196.812L160 216Z" fill="#E2761B" stroke="#E2761B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M160 216L195.625 151L213.312 152.125L208.812 196.812L160 216Z" fill="#E2761B" stroke="#E2761B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M233.125 290.875L208.812 196.812L195.625 151L160 216L124.375 151L111.188 196.812L86.875 290.875L160 252L233.125 290.875Z" fill="#D7C1B1" stroke="#D7C1B1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M259.625 158.438L213.312 152.125L195.625 151L208.812 196.812L260.625 240L259.625 158.438Z" fill="#161616" stroke="#161616" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M60.375 158.438L106.688 152.125L124.375 151L111.188 196.812L59.375 240L60.375 158.438Z" fill="#161616" stroke="#161616" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

const EmailIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
  </svg>
);

export default function AuthGatewayModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"privy" | "sandbox">("sandbox");
  const [emailInput, setEmailInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPresets, setShowPresets] = useState(false);
  
  const { login: privyLogin } = usePrivyActual();

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setErrorMsg("");
      setEmailInput("");
    };
    window.addEventListener("open-auth-gateway", handleOpen);
    return () => window.removeEventListener("open-auth-gateway", handleOpen);
  }, []);

  // Helper to generate a stable mock address from email
  const generateMockAddress = (email: string) => {
    const cleaned = email.trim().toLowerCase();
    if (cleaned === "doctor.okafors@certai.academy") return "0x742d35cc6634c0532925a3b844bc454e4438f44e";
    if (cleaned === "admin@memorialhospital.org") return "0x90F8bf6A479f320ead0075471d310030F88937f2";
    if (cleaned === "audits@nhs-trust.gov") return "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293bc";
    
    let hash = 0;
    for (let i = 0; i < cleaned.length; i++) {
      hash = (hash << 5) - hash + cleaned.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padEnd(8, "0") + 
                Math.abs(hash * 31).toString(16).padEnd(8, "0") + 
                Math.abs(hash * 17).toString(16).padEnd(8, "0") + 
                Math.abs(hash * 13).toString(16).padEnd(8, "0") + 
                Math.abs(hash * 7).toString(16).padEnd(8, "0");
    return "0x" + hex.substring(0, 40);
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

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
    window.location.href = "/dashboard";
  };

  const handleSandboxCustomEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setErrorMsg("Please enter an email address.");
      return;
    }
    if (!validateEmail(emailInput)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setErrorMsg("");
    const address = generateMockAddress(emailInput);
    setMockAuth(true, address, emailInput.trim());
    setIsOpen(false);
    window.location.href = "/dashboard";
  };

  const handleSandboxSocialLogin = (type: "google" | "metamask") => {
    let email = "";
    let address = "";
    if (type === "google") {
      email = "sandbox.google.user@gmail.com";
      address = generateMockAddress(email);
    } else {
      email = "sandbox.wallet.user@certai.io";
      address = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
    }
    setMockAuth(true, address, email);
    setIsOpen(false);
    window.location.href = "/dashboard";
  };

  const handlePrivyConnect = () => {
    setIsOpen(false);
    try {
      privyLogin();
    } catch (err) {
      console.error("Privy login failed:", err);
      handleSandboxLogin("doctor"); // Fallback
    }
  };

  const handlePrivyEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setErrorMsg("Please enter an email address.");
      return;
    }
    if (!validateEmail(emailInput)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setErrorMsg("");
    handlePrivyConnect();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
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
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-[#070a19]/90 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,212,255,0.15)] backdrop-blur-2xl my-auto z-10"
        >
          {/* Laser beam top scanner line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00d4ff]" />

          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors duration-200 text-lg w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5"
          >
            ✕
          </button>

          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-400 to-purple-600 shadow-[0_0_20px_rgba(6,182,212,0.4)] mb-2">
              <span className="text-2xl font-bold text-white font-outfit">C</span>
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight text-white font-outfit">
              Select Security Gateway
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Verify identity to access the credential network.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-800/80 mb-6 bg-slate-950/40 rounded-xl p-1">
            <button
              onClick={() => {
                setActiveTab("sandbox");
                setErrorMsg("");
                setEmailInput("");
              }}
              className={`flex-1 py-2 rounded-lg text-[10px] sm:text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                activeTab === "sandbox"
                  ? "bg-purple-500/10 border border-purple-500/30 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.1)]"
                  : "text-slate-550 hover:text-slate-300"
              }`}
            >
              🛠️ Sandbox Simulator
            </button>
            <button
              onClick={() => {
                setActiveTab("privy");
                setErrorMsg("");
                setEmailInput("");
              }}
              className={`flex-1 py-2 rounded-lg text-[10px] sm:text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                activeTab === "privy"
                  ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                  : "text-slate-550 hover:text-slate-300"
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
                className="space-y-5"
              >
                <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 text-[10px] sm:text-[11px] leading-relaxed text-purple-300 font-mono">
                  🚨 <span className="font-extrabold">SANDBOX SIMULATOR:</span> Fast simulation mode bypasses on-chain requirements for instant evaluation.
                </div>

                {/* Email Sign In */}
                <form onSubmit={handleSandboxCustomEmailLogin} className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">
                    Email Authentication
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="Enter email to simulate login"
                        className="w-full bg-slate-950/60 border border-slate-800 focus:border-purple-500/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 hover:border-purple-500/50 text-purple-200 transition-all duration-300 flex items-center justify-center active:scale-95"
                    >
                      <EmailIcon />
                      <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Submit</span>
                    </button>
                  </div>
                </form>

                {/* Social & Wallet Grids */}
                <div className="space-y-2">
                  <div className="flex items-center my-3">
                    <div className="flex-1 border-t border-slate-800/80"></div>
                    <span className="px-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">OR CONNECT VIA Presets</span>
                    <div className="flex-1 border-t border-slate-800/80"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleSandboxSocialLogin("google")}
                      className="flex items-center justify-center p-3 rounded-xl border border-slate-800 bg-[#090d22]/50 hover:border-purple-500/40 hover:bg-purple-500/5 active:scale-95 transition-all duration-300"
                    >
                      <GoogleIcon />
                      <span className="text-[11px] font-bold text-slate-350">Google Account</span>
                    </button>
                    <button
                      onClick={() => handleSandboxSocialLogin("metamask")}
                      className="flex items-center justify-center p-3 rounded-xl border border-slate-800 bg-[#090d22]/50 hover:border-purple-500/40 hover:bg-purple-500/5 active:scale-95 transition-all duration-300"
                    >
                      <MetaMaskIcon />
                      <span className="text-[11px] font-bold text-slate-350">MetaMask Wallet</span>
                    </button>
                  </div>
                </div>

                {/* Collapsible Preset Roles */}
                <div className="border border-slate-800/60 rounded-2xl bg-slate-950/20 overflow-hidden">
                  <button
                    onClick={() => setShowPresets(!showPresets)}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-900/20 transition-all duration-300 text-left"
                  >
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                      {showPresets ? "▼ Hide Role Presets" : "▶ Quick Predefined Roles"}
                    </span>
                    <span className="text-[10px] text-purple-400 font-bold uppercase font-mono">
                      {showPresets ? "Close" : "Open"}
                    </span>
                  </button>

                  <AnimatePresence>
                    {showPresets && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4 space-y-2 border-t border-slate-900/50 pt-2"
                      >
                        <button
                          onClick={() => handleSandboxLogin("doctor")}
                          className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-800/80 bg-slate-950/30 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-300 text-left group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🩺</span>
                            <div>
                              <p className="text-xs font-bold text-slate-200">Dr. Okafor (Scholar)</p>
                              <p className="text-[9px] text-slate-500 font-mono">doctor.okafors@certai.academy</p>
                            </div>
                          </div>
                          <span className="text-xs text-purple-400 group-hover:translate-x-1 transition-transform">➔</span>
                        </button>

                        <button
                          onClick={() => handleSandboxLogin("hospital")}
                          className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-800/80 bg-slate-950/30 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-300 text-left group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🏛️</span>
                            <div>
                              <p className="text-xs font-bold text-slate-200">Memorial Hospital (Issuer)</p>
                              <p className="text-[9px] text-slate-500 font-mono">admin@memorialhospital.org</p>
                            </div>
                          </div>
                          <span className="text-xs text-purple-400 group-hover:translate-x-1 transition-transform">➔</span>
                        </button>

                        <button
                          onClick={() => handleSandboxLogin("trust")}
                          className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-800/80 bg-slate-950/30 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-300 text-left group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🔍</span>
                            <div>
                              <p className="text-xs font-bold text-slate-200">NHS Trust (Verifier Auditor)</p>
                              <p className="text-[9px] text-slate-500 font-mono">audits@nhs-trust.gov</p>
                            </div>
                          </div>
                          <span className="text-xs text-purple-400 group-hover:translate-x-1 transition-transform">➔</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="privy"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 text-[10px] sm:text-[11px] leading-relaxed text-cyan-300 font-mono">
                  🔑 <span className="font-extrabold">SECURE CHAIN CONNECTION:</span> Use Privy to authenticate securely using your Web3 wallets, Google, or Email profile.
                </div>

                {/* Email Sign In */}
                <form onSubmit={handlePrivyEmailSubmit} className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">
                    Secure Email Sign In
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="Enter email to connect"
                        className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 hover:border-cyan-500/50 text-cyan-200 transition-all duration-300 flex items-center justify-center active:scale-95"
                    >
                      <EmailIcon />
                      <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Connect</span>
                    </button>
                  </div>
                </form>

                {/* Social & Wallet Grids */}
                <div className="space-y-2">
                  <div className="flex items-center my-3">
                    <div className="flex-1 border-t border-slate-800/80"></div>
                    <span className="px-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">OR LOG IN WITH</span>
                    <div className="flex-1 border-t border-slate-800/80"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handlePrivyConnect}
                      className="flex items-center justify-center p-3 rounded-xl border border-slate-800 bg-[#090d22]/50 hover:border-cyan-500/40 hover:bg-cyan-500/5 active:scale-95 transition-all duration-300"
                    >
                      <GoogleIcon />
                      <span className="text-[11px] font-bold text-slate-350">Google Account</span>
                    </button>
                    <button
                      onClick={handlePrivyConnect}
                      className="flex items-center justify-center p-3 rounded-xl border border-slate-800 bg-[#090d22]/50 hover:border-cyan-500/40 hover:bg-cyan-500/5 active:scale-95 transition-all duration-300"
                    >
                      <MetaMaskIcon />
                      <span className="text-[11px] font-bold text-slate-350">MetaMask Wallet</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60 text-center">
                  <p className="text-[10px] text-slate-450 leading-relaxed">
                    Privy securely orchestrates keys. Selecting any option above will open Privy's encrypted login environment to complete authorization.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Validation Error Banner */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-[11px] text-red-300 font-mono text-center flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.05)]"
              >
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
