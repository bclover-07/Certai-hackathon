"use client";

import { useEffect, useState, useRef } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { BACKEND_URL } from "../../../lib/constants";
import { useWalletStore } from "../../../store/walletStore";
import GlassCard from "../../../components/ui/GlassCard";
import NeonButton from "../../../components/ui/NeonButton";

export default function ProfilePage() {
  const { getAccessToken } = usePrivy();
  const getTokenRef = useRef(getAccessToken);
  getTokenRef.current = getAccessToken;
  const { address } = useWalletStore();

  const [displayName, setDisplayName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [organization, setOrganization] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState("learner");
  const [points, setPoints] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    const fetchProfile = async () => {
      try {
        const token = await getTokenRef.current();
        const res = await fetch(`${BACKEND_URL}/api/v1/users/${address}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setDisplayName(data.data.profile?.displayName || "");
            setSpecialty(data.data.profile?.specialty || "");
            setOrganization(data.data.profile?.organization || "");
            setBio(data.data.profile?.bio || "");
            setRole(data.data.profile?.role || "learner");
            setPoints(data.data.stats?.points || 0);
          }
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || isUpdating) return;

    setIsUpdating(true);
    try {
      const token = await getAccessToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/users/${address}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
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
        alert("Profile details updated successfully!");
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update profile");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred during update");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-500 font-semibold uppercase tracking-wider font-mono">
        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping mr-2" />
        Loading profile...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-wide">
          My Scholar Settings
        </h2>
        <p className="text-xs text-slate-400 font-semibold uppercase mt-1">
          Customize your clinical title, institutional affiliations, and review account statistics.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Side: Stats and Info Cards */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white tracking-wide">
            Attestation Profile
          </h3>
          <GlassCard className="p-6 text-center space-y-4" glowColor="blue">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-400 to-purple-600 text-white font-extrabold text-xl shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                {displayName.substring(0, 2).toUpperCase() || "CR"}
              </div>
            </div>

            <div>
              <h4 className="text-base font-extrabold text-white">{displayName || "Active Scholar"}</h4>
              <p className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider mt-0.5 capitalize">
                ROLE: {role}
              </p>
            </div>

            <div className="border-t border-slate-850 pt-4 flex justify-between items-center text-xs font-mono">
              <span className="text-slate-500 font-bold uppercase">Ledger Points:</span>
              <span className="text-cyan-200 font-black tracking-wide text-sm">{points} PTS</span>
            </div>

            <div className="border-t border-slate-850 pt-4 flex flex-col gap-1 items-start text-left text-[10px] text-slate-400 font-mono">
              <span className="text-slate-500 font-bold uppercase">Secure EOA Wallet Address</span>
              <span className="text-slate-350 truncate w-full font-medium">{address}</span>
            </div>
          </GlassCard>
        </div>

        {/* Right Side: Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-white tracking-wide">
            Edit Details
          </h3>
          <GlassCard className="p-6" glowColor="purple">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full rounded-xl bg-slate-900/60 border border-slate-800 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Organization / Affiliation
                  </label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full rounded-xl bg-slate-900/60 border border-slate-800 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Primary Domain / Specialty
                  </label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full rounded-xl bg-slate-900/60 border border-slate-800 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Role Category
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-xl bg-slate-900/60 border border-slate-800 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all duration-300 appearance-none capitalize"
                  >
                    <option value="learner">Scholar</option>
                    <option value="issuer">Issuer Office</option>
                    <option value="verifier">Verifier Auditor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  About Bio
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-xl bg-slate-900/60 border border-slate-800 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all duration-300 resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <NeonButton
                  type="submit"
                  variant="purple"
                  isLoading={isUpdating}
                  className="px-8 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                >
                  Save Profile Settings
                </NeonButton>
              </div>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
