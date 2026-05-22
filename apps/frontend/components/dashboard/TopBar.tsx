"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useWalletStore } from "../../store/walletStore";
import { useEffect, useState, useRef } from "react";
import { BACKEND_URL } from "../../lib/constants";

interface TopBarProps {
  onOpenMobileMenu: () => void;
}

export default function TopBar({ onOpenMobileMenu }: TopBarProps) {
  const { user, getAccessToken } = usePrivy();
  const { wallets } = useWallets();
  const { address, balance, setWallet } = useWalletStore();
  const [profile, setProfile] = useState<any>(null);
  const getTokenRef = useRef(getAccessToken);
  getTokenRef.current = getAccessToken;

  useEffect(() => {
    const activeAddress = user?.wallet?.address || wallets[0]?.address || user?.id;
    if (activeAddress) {
      setWallet(activeAddress, user?.email?.address || user?.id);
    }
  }, [user, wallets, setWallet]);


  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    const fetchProfile = async () => {
      try {
        const token = await getTokenRef.current();
        const res = await fetch(`${BACKEND_URL}/api/v1/users/${address}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok && !cancelled) {
          const data = await res.json();
          if (data.success && data.data) {
            setProfile(data.data);
          }
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };
    fetchProfile();
    return () => { cancelled = true; };
  }, [address]);

  const truncateAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-800 bg-[#0d112d]/50 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileMenu}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
        >
          ☰
        </button>
        <h1 className="text-xl font-bold tracking-tight text-white hidden sm:block">
          Welcome back,{" "}
          <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            {profile?.profile?.displayName || user?.email?.address?.split("@")[0] || "Scholar"}
          </span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-xl bg-slate-900/60 border border-slate-800 px-4 py-2 hover:border-cyan-500/30 transition-all duration-300">
          <span className="text-lg">💵</span>
          <div>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Gasless Balance</p>
            <p className="text-sm font-semibold text-cyan-200">
              ${balance} <span className="text-[10px] text-slate-400">USD</span>
            </p>
          </div>
        </div>

        {address && (
          <div className="hidden md:flex items-center gap-2 rounded-xl bg-slate-900/60 border border-slate-800 px-4 py-2 hover:border-purple-500/30 transition-all duration-300">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span className="text-sm font-medium text-slate-300 font-mono">
              {truncateAddress(address)}
            </span>
          </div>
        )}

        {profile?.profile?.role && (
          <div className="hidden sm:block rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-purple-500/20 px-3 py-1.5">
            <p className="text-xs font-semibold text-purple-300 capitalize">
              {profile.profile.role}
            </p>
          </div>
        )}

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 text-white font-bold text-sm shadow-[0_0_10px_rgba(6,182,212,0.3)]">
          {profile?.profile?.displayName?.substring(0, 2).toUpperCase() ||
            user?.email?.address?.substring(0, 2).toUpperCase() ||
            "CR"}
        </div>
      </div>
    </header>
  );
}
