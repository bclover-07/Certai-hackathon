import { useEffect } from "react";
import { useWalletStore } from "../store/walletStore";
import { usePrivy } from "@privy-io/react-auth";
import { BACKEND_URL } from "../lib/constants";

export const useWalletBalance = () => {
  const { address, setBalance } = useWalletStore();
  const { getAccessToken } = usePrivy();

  useEffect(() => {
    if (!address) return;

    const fetchBalanceAndProfile = async () => {
      try {
        const token = await getAccessToken();
        const response = await fetch(`${BACKEND_URL}/api/v1/users/${address}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
    const interval = setInterval(fetchBalanceAndProfile, 10000); 

    return () => clearInterval(interval);
  }, [address, setBalance, getAccessToken]);
};
