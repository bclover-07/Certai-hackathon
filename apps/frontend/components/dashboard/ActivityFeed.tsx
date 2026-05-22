"use client";

import { useEffect, useState, useRef } from "react";
import { BACKEND_URL } from "../../lib/constants";
import { useWalletStore } from "../../store/walletStore";
import { usePrivy } from "../../hooks/usePrivy";

interface Activity {
  id: string;
  type: "mint" | "endorse" | "verify";
  title: string;
  timestamp: string;
  description: string;
  icon: string;
  txHash?: string;
}

export default function ActivityFeed() {
  const { address } = useWalletStore();
  const { getAccessToken } = usePrivy();
  const getTokenRef = useRef(getAccessToken);
  getTokenRef.current = getAccessToken;
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    const fetchActivity = async () => {
      try {
        const token = await getTokenRef.current();
        const res = await fetch(`${BACKEND_URL}/api/v1/credentials/holder/${address}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            // Build activities from active credentials
            const credActivities = data.data.map((cred: any) => ({
              id: cred._id,
              type: "mint" as const,
              title: "Credential SBT Minted",
              timestamp: new Date(cred.issuedAt || cred.createdAt).toLocaleDateString(),
              description: `Permanently logged "${cred.title}" of ${cred.hoursCompleted} hours.`,
              icon: "📜",
              txHash: cred.txHash,
            }));

            setActivities(credActivities.slice(0, 5));
          }
        }
      } catch (err) {
        console.error("Error fetching activity feed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActivity();
  }, [address]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-xl bg-slate-900/40 border border-slate-800"
          />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-850 rounded-2xl">
        <span className="text-3xl">📭</span>
        <p className="mt-2 text-sm font-semibold text-slate-400">No recent activity</p>
        <p className="text-xs text-slate-500 mt-1">Claims and verifications will appear here.</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, idx) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {idx !== activities.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-800"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                {/* Icon wrapper */}
                <div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 border border-slate-850 text-base shadow-[0_0_10px_rgba(255,255,255,0.02)]">
                    {activity.icon}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-500 font-semibold flex items-center justify-between">
                    <span>{activity.title}</span>
                    <time dateTime={activity.timestamp} className="font-medium">
                      {activity.timestamp}
                    </time>
                  </div>
                  <p className="mt-1 text-sm font-medium text-slate-300">
                    {activity.description}
                  </p>
                  {activity.txHash && (
                    <a
                      href={`https://sepolia.basescan.org/tx/${activity.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-flex items-center text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-all duration-200"
                    >
                      ⛓️ Basescan Receipt
                    </a>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
