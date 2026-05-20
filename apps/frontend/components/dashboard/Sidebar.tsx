"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { NAV_ITEMS } from "../../lib/constants";
import { useWalletStore } from "../../store/walletStore";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = usePrivy();
  const { address } = useWalletStore();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800 bg-[#0d112d]/90 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Logo */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-400 to-purple-600 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              <span className="text-xl font-bold text-white">C</span>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-wider text-white">
                CERT<span className="bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">AI</span>
              </span>
              <p className="text-[10px] text-slate-500 tracking-widest font-semibold uppercase">Base Sepolia</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            ✕
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 border border-transparent ${
                  isActive
                    ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.06)]"
                    : "text-slate-400 hover:bg-slate-900/50 hover:text-white"
                }`}
              >
                <span className="text-lg group-hover:scale-110 transition-transform duration-200">
                  {item.icon}
                </span>
                {item.label}
                {isActive && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="border-t border-slate-800 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all duration-200"
          >
            <span className="text-lg">🚪</span>
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}
