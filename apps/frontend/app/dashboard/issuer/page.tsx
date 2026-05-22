"use client";

import React, { useState, useEffect } from 'react';
import { useWalletStore } from '../../../store/walletStore';
import { usePrivy } from '../../../hooks/usePrivy';
import { BACKEND_URL } from '../../../lib/constants';
import GlassCard from '../../../components/ui/GlassCard';
import NeonButton from '../../../components/ui/NeonButton';

interface PendingCredential {
  _id: string;
  holderAddress: string;
  title: string;
  description: string;
  hoursCompleted: number;
  createdAt: string;
  issuerName: string;
  trustLevel: string;
}

interface UserProfile {
  walletAddress: string;
  profile: {
    displayName: string;
    role: 'learner' | 'issuer' | 'verifier' | 'admin';
    isVerifiedIssuer: boolean;
    institutionName?: string;
    institutionDomain?: string;
    issuerVerifiedAt?: string;
  };
}

export default function IssuerPortal() {
  const { address } = useWalletStore();
  const { getAccessToken } = usePrivy();

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Registration Form
  const [instName, setInstName] = useState('');
  const [instDomain, setInstDomain] = useState('');
  const [submittingReg, setSubmittingReg] = useState(false);

  // Portal State
  const [pendingCreds, setPendingCreds] = useState<PendingCredential[]>([]);
  const [loadingCreds, setLoadingCreds] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [actioningId, setActioningId] = useState<string | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!address) {
      setLoadingProfile(false);
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/users/${address}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setProfile(data.data);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchPendingCredentials = async () => {
    if (!address) return;
    setLoadingCreds(true);
    try {
      const token = await getAccessToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/issuer/pending-credentials`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPendingCreds(data.data);
      }
    } catch (err) {
      console.error('Error fetching pending credentials:', err);
    } finally {
      setLoadingCreds(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [address]);

  useEffect(() => {
    if (profile?.profile.role === 'issuer' && profile?.profile.isVerifiedIssuer) {
      fetchPendingCredentials();
    }
  }, [profile]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !instName) return;

    setSubmittingReg(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const token = await getAccessToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/issuer/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          walletAddress: address,
          institutionName: instName,
          institutionDomain: instDomain,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccessMsg('Registration request submitted! Awaiting administrator approval.');
      fetchProfile();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error registering institutional portal.');
    } finally {
      setSubmittingReg(false);
    }
  };

  const handleApprove = async (credId: string) => {
    setActioningId(credId);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const token = await getAccessToken();
      const note = notes[credId] || '';

      const res = await fetch(`${BACKEND_URL}/api/v1/issuer/approve-credential`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          credentialId: credId,
          approvalNote: note,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Approval failed');
      }

      setSuccessMsg('Credential approved and updated to Institution Verified status!');
      
      // Clean note
      setNotes((prev) => {
        const next = { ...prev };
        delete next[credId];
        return next;
      });

      // Reload
      fetchPendingCredentials();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error approving credential.');
    } finally {
      setActioningId(null);
    }
  };

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[50vh]">
        <GlassCard className="p-8 max-w-md space-y-4">
          <div className="text-4xl">🏛️</div>
          <h3 className="text-xl font-bold text-white">Institutional Wallet Access</h3>
          <p className="text-sm text-slate-400">
            Please connect your wallet containing Privy credentials to register or manage issuer tasks.
          </p>
        </GlassCard>
      </div>
    );
  }

  if (loadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[50vh]">
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-cyan-400 font-semibold tracking-wide text-xs">LOADING INSTITUTIONAL PORTAL...</span>
      </div>
    );
  }

  // CASE 1: Need Registration
  if (!profile || profile.profile.role !== 'issuer') {
    return (
      <div className="max-w-xl mx-auto space-y-8 py-8 animate-fade-in">
        <GlassCard className="p-6 md:p-8" glowColor="blue">
          <h2 className="text-2xl font-extrabold text-white mb-2">Institutional Registration</h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
            Register your institution or organization on CERTAI to approve claims, audit bio-verified credentials, and issue high-stakes clinical certifications.
          </p>

          {errorMsg && <div className="mb-4 text-xs text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">{errorMsg}</div>}
          {successMsg && <div className="mb-4 text-xs text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20">{successMsg}</div>}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Institution / Organization Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. American Heart Association"
                value={instName}
                onChange={(e) => setInstName(e.target.value)}
                className="w-full rounded-xl bg-slate-900/60 border border-slate-800 py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Official Institution Domain (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. association.org"
                value={instDomain}
                onChange={(e) => setInstDomain(e.target.value)}
                className="w-full rounded-xl bg-slate-900/60 border border-slate-800 py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Submitting Wallet
              </label>
              <input
                type="text"
                disabled
                value={address}
                className="w-full rounded-xl bg-slate-950/80 border border-slate-900 py-3 px-4 text-xs text-cyan-400 font-mono focus:outline-none"
              />
            </div>

            <NeonButton
              type="submit"
              fullWidth
              variant="blue"
              isLoading={submittingReg}
              className="mt-6"
            >
              Submit Registration Request
            </NeonButton>
          </form>
        </GlassCard>
      </div>
    );
  }

  // CASE 2: Registered, Awaiting Verification
  if (!profile.profile.isVerifiedIssuer) {
    return (
      <div className="max-w-xl mx-auto py-8 animate-fade-in">
        <GlassCard className="p-8 text-center space-y-6" glowColor="blue">
          <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto text-cyan-400 text-3xl">
            🏛️
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Pending Verification</h2>
            <p className="text-cyan-400 text-sm font-semibold">
              Institution: {profile.profile.institutionName}
            </p>
          </div>
          <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            Your institutional registry is awaiting administrator verification. Once verified, you will be authorized to certify credentials matching your institution name.
          </p>
          <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 text-xs text-slate-500 space-y-1">
            <p>Wallet: <span className="font-mono text-slate-400">{profile.walletAddress}</span></p>
            {profile.profile.institutionDomain && (
              <p>Domain: <span className="text-slate-400">{profile.profile.institutionDomain}</span></p>
            )}
          </div>
        </GlassCard>
      </div>
    );
  }

  // CASE 3: Active Issuer Portal
  return (
    <div className="space-y-8 py-4 animate-fade-in">
      {/* Header Profile Dashboard */}
      <GlassCard className="p-6 md:p-8" glowColor="emerald">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 font-extrabold text-[10px] tracking-widest uppercase bg-green-500/10 border border-green-500/30 px-3 py-1 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.25)]">
                🛡️ Verified Institution Registry
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-white mt-3">
              {profile.profile.institutionName}
            </h2>
            <p className="text-sm text-slate-400 font-semibold mt-1">
              Registered Domain: {profile.profile.institutionDomain || 'None'}
            </p>
          </div>

          <div className="bg-slate-950/60 border border-white/5 p-4 rounded-xl text-center">
            <span className="text-[10px] text-gray-500 font-bold uppercase block">Pending Approvals</span>
            <span className="text-3xl font-black text-white">{pendingCreds.length}</span>
          </div>
        </div>
      </GlassCard>

      {/* Main Table for Approving Credentials */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
          <span>📜</span> Pending Institution Approvals
        </h3>

        {errorMsg && <div className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">{errorMsg}</div>}
        {successMsg && <div className="text-xs text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20">{successMsg}</div>}

        {loadingCreds ? (
          <div className="text-center p-12 bg-white/5 border border-white/10 rounded-2xl">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs text-gray-500 font-bold uppercase">Fetching pending claims...</span>
          </div>
        ) : pendingCreds.length === 0 ? (
          <div className="p-8 text-center bg-white/5 border border-white/10 rounded-2xl text-slate-500 font-semibold">
            No pending claims found matching &ldquo;{profile.profile.institutionName}&rdquo;.
          </div>
        ) : (
          <div className="overflow-x-auto bg-white/5 border border-white/10 rounded-2xl shadow-xl">
            <table className="min-w-full divide-y divide-white/5 text-sm text-left">
              <thead className="bg-white/5 text-xs text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Learner / Address</th>
                  <th className="px-6 py-4">Credential Claimed</th>
                  <th className="px-6 py-4">Claim Hours</th>
                  <th className="px-6 py-4">Claim Date</th>
                  <th className="px-6 py-4">Approval Note</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300 font-medium">
                {pendingCreds.map((cred) => (
                  <tr key={cred._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-cyan-400">
                      {cred.holderAddress.slice(0, 8)}...{cred.holderAddress.slice(-6)}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-white font-semibold">{cred.title}</div>
                        <div className="text-[10px] text-gray-500 font-semibold">{cred.issuerName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{cred.hoursCompleted} hours</td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(cred.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        placeholder="e.g. Validated via Registry Check"
                        value={notes[cred._id] || ''}
                        onChange={(e) => setNotes({ ...notes, [cred._id]: e.target.value })}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500/50 w-full"
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleApprove(cred._id)}
                        disabled={actioningId === cred._id}
                        className="rounded-lg bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 hover:border-green-500/40 text-green-400 font-semibold text-xs px-3.5 py-1.5 transition-all duration-200"
                      >
                        {actioningId === cred._id ? 'Approving...' : 'Approve'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
