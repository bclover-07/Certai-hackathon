"use client";

import { useEffect, useState } from "react";
import { BACKEND_URL } from "../../../lib/constants";
import { useWalletStore } from "../../../store/walletStore";
import GlassCard from "../../../components/ui/GlassCard";
import VerifyPanel from "../../../components/dashboard/VerifyPanel";

export default function VerifyPage() {
  const { address } = useWalletStore();
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/verify/history/${address}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            setHistory(data.data);
          }
        }
      } catch (err) {
        console.error("Error fetching verification history:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [address]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-wide">
          On-Chain Auditing Desk
        </h2>
        <p className="text-xs text-slate-400 font-semibold uppercase mt-1">
          Review third-party staff compliance audits and run registry checks.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Side: Audit Form */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white tracking-wide">
            Run Verification
          </h3>
          <VerifyPanel />
        </div>

        {/* Right Side: Log History */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            Audit Ledger Logs
          </h3>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-900/40 border border-slate-800" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-850 rounded-2xl bg-[#0d112d]/20">
              <span className="text-4xl">📁</span>
              <h4 className="text-base font-bold text-white mt-3">No audits logged</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed font-medium">
                Once you run on-chain compliance audits for personnel, verification ledger records will register here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#0d112d]/30 backdrop-blur-md">
              <table className="min-w-full divide-y divide-slate-850 text-left text-sm text-slate-350">
                <thead className="bg-slate-900/60 text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  <tr>
                    <th scope="col" className="px-6 py-4">Token ID</th>
                    <th scope="col" className="px-6 py-4">Purpose</th>
                    <th scope="col" className="px-6 py-4">Result</th>
                    <th scope="col" className="px-6 py-4">Verified At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/60 bg-transparent font-medium">
                  {history.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-cyan-200">
                        #{log.credentialTokenId}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 capitalize text-slate-400">
                        {log.purpose?.replace("_", " ") || "General Compliance"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          log.result
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}>
                          {log.result ? "SUCCESS" : "INVALID"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-500">
                        {new Date(log.verifiedAt || log.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
