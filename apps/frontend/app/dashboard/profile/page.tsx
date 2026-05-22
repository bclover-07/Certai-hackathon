"use client";

import { useEffect, useState, useRef } from "react";
import { usePrivy } from "../../../hooks/usePrivy";
import { BACKEND_URL } from "../../../lib/constants";
import { useWalletStore } from "../../../store/walletStore";
import GlassCard from "../../../components/ui/GlassCard";
import NeonButton from "../../../components/ui/NeonButton";

const AVATAR_PRESETS = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=Aura",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Vector",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Matrix",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Cyber",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Apex",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Orbit",
];

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
  const [avatarUrl, setAvatarUrl] = useState("");
  const [points, setPoints] = useState(0);
  
  const [stats, setStats] = useState({
    credentialsMinted: 0,
    endorsementsReceived: 0,
    verificationsRun: 0,
    totalHoursLogged: 0,
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

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
            setAvatarUrl(data.data.profile?.avatarUrl || "");
            setPoints(data.data.stats?.points || 0);
            
            setStats({
              credentialsMinted: data.data.stats?.credentialsMinted || 0,
              endorsementsReceived: data.data.stats?.endorsementsReceived || 0,
              verificationsRun: data.data.stats?.verificationsRun || 0,
              totalHoursLogged: data.data.stats?.totalHoursLogged || 0,
            });
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
    setNotification(null);
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
            avatarUrl,
          },
        }),
      });

      if (res.ok) {
        setNotification({
          type: "success",
          message: "Scholar settings saved successfully!",
        });
        
        // Auto-refresh the page profile to synchronize topbar or sidebar state
        const data = await res.json();
        if (data.success && data.data) {
          setDisplayName(data.data.profile?.displayName || "");
          setAvatarUrl(data.data.profile?.avatarUrl || "");
        }
        
        setTimeout(() => setNotification(null), 4000);
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update profile");
      }
    } catch (err: any) {
      console.error(err);
      setNotification({
        type: "error",
        message: err.message || "Failed to save profile settings",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const calculateProfileStrength = () => {
    let score = 0;
    if (displayName.trim()) score += 20;
    if (specialty.trim()) score += 20;
    if (organization.trim()) score += 20;
    if (bio.trim()) score += 20;
    if (avatarUrl) score += 20;
    return score;
  };

  const profileStrength = calculateProfileStrength();

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center bg-[#070a24]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <span className="text-cyan-400 animate-pulse text-sm font-semibold uppercase tracking-wider font-mono">
            Initializing Profile details...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-wide">
            Scholar Identity Registry
          </h2>
          <p className="text-xs text-slate-400 font-semibold uppercase mt-1">
            Customize your professional details, choose an attestation avatar, and view on-chain stats.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-purple-500/20 px-4 py-2 self-start md:self-auto shadow-md">
          <span className="text-lg">⚡</span>
          <div>
            <p className="text-[9px] text-purple-300 font-bold uppercase tracking-wider">Accumulated Rank Points</p>
            <p className="text-sm font-black text-cyan-200 font-mono">{points} PTS</p>
          </div>
        </div>
      </div>

      {/* Stats Grid Dashboard */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Credentials Minted",
            value: stats.credentialsMinted,
            desc: "Soulbound Attestations",
            icon: (
              <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l9-5-9-5-9 5 9 5zm0 0v6m0 0l3-3m-3 3l-3-3" />
              </svg>
            ),
            glow: "emerald",
          },
          {
            title: "Endorsements",
            value: stats.endorsementsReceived,
            desc: "Peer Backed Ratings",
            icon: (
              <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.242.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.17 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h4.908a1 1 0 00.95-.69l1.519-4.674z" />
              </svg>
            ),
            glow: "purple",
          },
          {
            title: "Audits Checked",
            value: stats.verificationsRun,
            desc: "Verifications Triggered",
            icon: (
              <svg className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            ),
            glow: "pink",
          },
          {
            title: "Hours Logged",
            value: stats.totalHoursLogged,
            desc: "Clinical Practice Hours",
            icon: (
              <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            glow: "blue",
          },
        ].map((stat, idx) => (
          <GlassCard
            key={idx}
            className="p-5 flex flex-col justify-between hover:scale-[1.03] transition-all duration-300 relative overflow-hidden group hover:border-cyan-500/20"
            glowColor={stat.glow as any}
          >
            {/* Subtle card glow overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                {stat.title}
              </span>
              <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800">
                {stat.icon}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-black text-white font-mono leading-none tracking-tight">
                {stat.value}
              </p>
              <p className="text-[9px] text-slate-400 font-semibold mt-1">
                {stat.desc}
              </p>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Side: Avatar Card & Identity Progress */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white tracking-wide">
            Secure Attestation Card
          </h3>
          
          <GlassCard className="p-6 text-center space-y-6 relative overflow-hidden" glowColor="blue">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
            
            {/* Avatar container */}
            <div className="flex justify-center relative">
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Active Avatar"
                    className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-[#0d112d] to-slate-900 border border-slate-800 p-2 shadow-2xl transition-transform duration-500 hover:rotate-6"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-400/20 to-purple-600/20 border border-purple-500/30 text-white font-extrabold text-2xl shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                    {displayName.substring(0, 2).toUpperCase() || "CR"}
                  </div>
                )}
                <span className="absolute bottom-[-4px] right-[-4px] flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 border-2 border-[#070a24] text-[10px] text-white font-bold shadow-[0_0_10px_#10b981]">
                  ✓
                </span>
              </div>
            </div>

            {/* Profile summary */}
            <div className="space-y-1">
              <h4 className="text-lg font-black text-white tracking-wide">
                {displayName || "Active Scholar"}
              </h4>
              <p className="text-[9px] text-cyan-300 font-bold uppercase tracking-widest leading-none capitalize">
                ROLE: {role === "learner" ? "Scholar" : role === "issuer" ? "Issuer Office" : "Verifier Auditor"}
              </p>
              {specialty && (
                <p className="text-xs text-slate-400 font-medium">
                  {specialty}
                </p>
              )}
            </div>

            {/* Profile completeness progress */}
            <div className="space-y-2 border-t border-slate-850 pt-5 text-left">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-500 font-bold uppercase">Profile Completeness:</span>
                <span className="text-cyan-300 font-black">{profileStrength}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden p-[2px] border border-slate-850 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 shadow-[0_0_8px_rgba(6,182,212,0.5)] transition-all duration-700 ease-out"
                  style={{ width: `${profileStrength}%` }}
                />
              </div>
            </div>

            {/* Secure EOA Wallet address */}
            <div className="border-t border-slate-850 pt-5 flex flex-col gap-1.5 items-start text-left text-[10px] text-slate-400 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                <span className="text-slate-500 font-bold uppercase">Attestation Identifier</span>
              </div>
              <span className="text-slate-350 bg-slate-950/60 border border-slate-850 py-2 px-3 rounded-lg w-full font-medium break-all select-all select-none hover:border-slate-800 transition-colors">
                {address}
              </span>
            </div>
          </GlassCard>
        </div>

        {/* Right Side: Scholar Settings Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-white tracking-wide">
            Edit Scholar Attestation Profile
          </h3>
          
          <GlassCard className="p-6 relative overflow-hidden" glowColor="purple">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Custom Slide-In Alert Banners */}
              {notification && (
                <div className={`p-4 rounded-xl border flex items-center justify-between animate-slide-in relative ${
                  notification.type === "success" 
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                    : "bg-pink-500/10 border-pink-500/30 text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.1)]"
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-base">{notification.type === "success" ? "🛡️" : "⚠️"}</span>
                    <p className="text-xs font-semibold uppercase tracking-wider font-mono">{notification.message}</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setNotification(null)}
                    className="text-xs text-slate-500 hover:text-slate-350 transition-colors px-1"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Avatar Preset Scroller Section */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select Attestation Identity Preset
                </label>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin max-w-full">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(preset)}
                      className={`flex-shrink-0 relative rounded-xl border p-2 bg-slate-900/60 hover:bg-slate-900/80 transition-all duration-300 active:scale-95 ${
                        avatarUrl === preset
                          ? "border-purple-500 ring-2 ring-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                          : "border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <img
                        src={preset}
                        alt={`Preset ${idx + 1}`}
                        className="h-10 w-10 transition-transform duration-300 group-hover:scale-105"
                      />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAvatarUrl(`https://api.dicebear.com/7.x/bottts/svg?seed=${displayName || "Scholar"}`)}
                    className={`flex-shrink-0 px-3.5 rounded-xl border text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-300 ${
                      avatarUrl !== "" && !AVATAR_PRESETS.includes(avatarUrl)
                        ? "border-purple-500 text-purple-300 bg-purple-500/10"
                        : "border-slate-800 text-slate-400 bg-slate-900/40 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    Custom
                  </button>
                </div>
              </div>

              {/* Input Form Fields */}
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
                    className="w-full rounded-xl bg-slate-900/60 border border-slate-800 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all duration-300 shadow-inner"
                    placeholder="e.g. Dr. Alexander Vance"
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
                    className="w-full rounded-xl bg-slate-900/60 border border-slate-800 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all duration-300 shadow-inner"
                    placeholder="e.g. Mass General Hospital"
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
                    className="w-full rounded-xl bg-slate-900/60 border border-slate-800 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all duration-300 shadow-inner"
                    placeholder="e.g. Critical Care Cardiology"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Role Category
                  </label>
                  <div className="relative">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full rounded-xl bg-slate-900/60 border border-slate-800 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all duration-300 appearance-none capitalize cursor-pointer pr-10 shadow-inner"
                    >
                      <option value="learner">Scholar</option>
                      <option value="issuer">Issuer Office</option>
                      <option value="verifier">Verifier Auditor</option>
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">
                      ▼
                    </span>
                  </div>
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
                  className="w-full rounded-xl bg-slate-900/60 border border-slate-800 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all duration-300 resize-none shadow-inner"
                  placeholder="Briefly state your background or career goals..."
                />
              </div>

              <div className="flex justify-end pt-2">
                <NeonButton
                  type="submit"
                  variant="purple"
                  isLoading={isUpdating}
                  className="px-8 shadow-[0_0_20px_rgba(168,85,247,0.2)] w-full sm:w-auto"
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
