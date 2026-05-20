"use client";

import { useEffect, useState, useRef } from "react";
import { UGFStage } from "../../store/claimStore";

interface UGFInspectorProps {
  stage: UGFStage;
  txHash?: string;
}

export default function UGFInspector({ stage, txHash }: UGFInspectorProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stage === "idle") {
      setLogs(["[SYSTEM] Ready. Awaiting claim verification and execution request..."]);
      return;
    }

    const logMapping: Record<Exclude<UGFStage, "idle">, string[]> = {
      quoting: [
        "[UGF] Contacting Universal Gas Framework API relayer...",
        "[UGF] Fetching gasless transaction fee quote on Chain: Base Sepolia (84532)...",
        "[UGF] Fee denomination set: TYI_MOCK_USD stablecoin.",
        "[UGF] Quote generated! Value: 0.0125 TYI_MOCK_USD. Digest signed.",
      ],
      settling: [
        "[UGF] Initiating ERC-20 payment settlement flow...",
        "[UGF] Signing gasless payment allowance via Privy embedded wallet...",
        "[UGF] Relaying payment settlement proof to UGF settlement pool...",
        "[UGF] Settlement successful! Stablecoin collateral deposited.",
      ],
      executing: [
        "[UGF] Executing Base Sepolia calldata signature relay...",
        "[LEDGER] Submitting CertNFT.sol minting transaction payload...",
        "[LEDGER] Opcodes executed: MCOPY (Cancun EVM activation)...",
        "[LEDGER] Awaiting block confirmation on Base Ledger...",
      ],
      confirmed: [
        "[LEDGER] Transaction confirmed in Block #8493021!",
        `[LEDGER] Transaction Hash: ${txHash || "0x98f...e3a"}`,
        "[SBT] SoulBound Credential minted successfully!",
        "[SBT] ERC-5192 status: LOCKED. Transfers disabled.",
        "[SYSTEM] Gasless credential execution lifecycle COMPLETE.",
      ],
      error: [
        "[SYSTEM] Relayer execution failed.",
        "[SYSTEM] Revert Reason: Insufficient stablecoin gas balance or signature mismatch.",
      ],
    };

    const runLogs = async () => {
      const stageLogs = logMapping[stage];
      if (!stageLogs) return;

      for (let i = 0; i < stageLogs.length; i++) {
        await new Promise((r) => setTimeout(r, i === 0 ? 100 : 400));
        setLogs((prev) => [...prev, stageLogs[i]]);
      }
    };

    runLogs();
  }, [stage, txHash]);

  // Autoscroll logs
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const stageGauges: Record<UGFStage, { label: string; pct: number; color: string }> = {
    idle: { label: "Awaiting Action", pct: 0, color: "bg-slate-700" },
    quoting: { label: "1. Quoting Fee", pct: 25, color: "bg-cyan-500 animate-pulse" },
    settling: { label: "2. Settling Collateral", pct: 50, color: "bg-indigo-500 animate-pulse" },
    executing: { label: "3. Relaying Tx", pct: 75, color: "bg-purple-500 animate-pulse" },
    confirmed: { label: "4. Confirmed", pct: 100, color: "bg-emerald-500" },
    error: { label: "relayer Failure", pct: 100, color: "bg-rose-500" },
  };

  const currentGauge = stageGauges[stage];

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#070a1f] p-5 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] flex flex-col h-72">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-rose-500" />
          <div className="h-3 w-3 rounded-full bg-amber-500" />
          <div className="h-3 w-3 rounded-full bg-emerald-500" />
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest font-mono ml-2">
            UGF Relay Terminal v1.02
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          <span>UGF NODE ACTIVE</span>
        </div>
      </div>

      {/* Progress slider bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 mb-1">
          <span>{currentGauge.label}</span>
          <span>{currentGauge.pct}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${currentGauge.color}`}
            style={{ width: `${currentGauge.pct}%` }}
          />
        </div>
      </div>

      {/* Terminal log panel */}
      <div className="flex-1 overflow-y-auto font-mono text-xs text-cyan-300 space-y-1.5 scrollbar-thin pr-2">
        {logs.map((log, i) => {
          let lineClass = "text-slate-400";
          if (log.includes("[UGF]")) lineClass = "text-cyan-400";
          if (log.includes("[LEDGER]")) lineClass = "text-purple-400";
          if (log.includes("Hash") || log.includes("[SBT]")) lineClass = "text-emerald-400 font-bold";
          if (log.includes("Revert") || log.includes("failed")) lineClass = "text-rose-400 font-bold";

          return (
            <div key={i} className={`leading-relaxed tracking-wide ${lineClass}`}>
              {log}
            </div>
          );
        })}
        {stage !== "confirmed" && stage !== "error" && stage !== "idle" && (
          <div className="text-cyan-400/60 animate-pulse flex items-center">
            <span>▋</span>
            <span className="text-[10px] text-slate-500 italic ml-1">Relaying metadata packet...</span>
          </div>
        )}
        <div ref={consoleEndRef} />
      </div>
    </div>
  );
}
