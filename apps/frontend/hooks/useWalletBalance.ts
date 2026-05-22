import { useEffect, useRef } from "react";
import { useWalletStore } from "../store/walletStore";
import { usePrivy } from "./usePrivy";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "../lib/constants";

export const useWalletBalance = () => {
  const { address, setBalance } = useWalletStore();
  const { getAccessToken } = usePrivy();
  const router = useRouter();
  const getTokenRef = useRef(getAccessToken);
  getTokenRef.current = getAccessToken;

  useEffect(() => {
    if (!address) return;

    const fetchBalanceAndProfile = async () => {
      try {
        const token = await getTokenRef.current();
        const response = await fetch(`${BACKEND_URL}/api/v1/users/${address}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.status === 404) {
          router.push("/onboard");
          return;
        }

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const points = data.data.stats?.points || 0;
            const balanceVal = (100.0 + points * 2.5).toFixed(2);
            setBalance(balanceVal);
          }
        }
      } catch (err) {
        console.error("Error fetching balance:", err);
      }
    };

    fetchBalanceAndProfile();
    const interval = setInterval(fetchBalanceAndProfile, 30000);
    return () => clearInterval(interval);
  }, [address, setBalance, router]);
};
