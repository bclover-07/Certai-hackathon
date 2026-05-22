"use client";

import { usePrivy as usePrivyActual, useWallets as useWalletsActual } from "@privy-io/react-auth";
import { useState, useEffect } from "react";

interface MockUser {
  id: string;
  email?: { address: string };
  wallet?: { address: string };
  google?: { name?: string; email?: string };
  linkedAccounts?: any[];
}

interface MockAuthState {
  authenticated: boolean;
  token: string | null;
  user: MockUser | null;
}

let mockAuthState: MockAuthState = {
  authenticated: false,
  token: null,
  user: null,
};

const listeners = new Set<() => void>();

export function setMockAuth(
  authenticated: boolean,
  userAddress: string | null = null,
  email: string | null = null
) {
  if (authenticated) {
    mockAuthState = {
      authenticated: true,
      token: "mock-test-token",
      user: {
        id: "did:privy:mockuser123",
        email: { address: email || "doctor.okafors@certai.academy" },
        wallet: { address: userAddress || "0x742d35cc6634c0532925a3b844bc454e4438f44e" },
      },
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("certai_mock_auth", JSON.stringify(mockAuthState));
    }
  } else {
    mockAuthState = {
      authenticated: false,
      token: null,
      user: null,
    };
    if (typeof window !== "undefined") {
      localStorage.removeItem("certai_mock_auth");
    }
  }
  listeners.forEach((l) => l());
}

export function usePrivy() {
  const actual = usePrivyActual();
  const [, setTick] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined" && !mockAuthState.authenticated) {
      const saved = localStorage.getItem("certai_mock_auth");
      if (saved) {
        try {
          mockAuthState = JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }

    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const login = () => {
    // Open a beautiful custom auth gateway selector modal
    if (typeof window !== "undefined") {
      const event = new CustomEvent("open-auth-gateway");
      window.dispatchEvent(event);
    }
  };

  const logout = async () => {
    if (mockAuthState.authenticated) {
      setMockAuth(false);
    } else {
      await actual.logout();
    }
  };

  const getAccessToken = async () => {
    if (mockAuthState.authenticated) {
      return mockAuthState.token || "mock-test-token";
    }
    try {
      return await actual.getAccessToken();
    } catch {
      return "mock-test-token"; // fallback
    }
  };

  if (mockAuthState.authenticated) {
    return {
      authenticated: true,
      ready: true,
      user: mockAuthState.user,
      login,
      logout,
      getAccessToken,
    };
  }

  return {
    ...actual,
    login,
    logout,
    getAccessToken,
  };
}

export function useWallets() {
  const actual = useWalletsActual();
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  if (mockAuthState.authenticated) {
    const mockWallet = {
      address: mockAuthState.user?.wallet?.address || "0x742d35cc6634c0532925a3b844bc454e4438f44e",
      getEthereumProvider: async () => {
        return {
          request: async ({ method, params }: any) => {
            if (method === "personal_sign") {
              return "0xsignature";
            }
            if (method === "eth_sendTransaction") {
              return `0x${Array.from({ length: 64 }, () =>
                Math.floor(Math.random() * 16).toString(16)
              ).join("")}`;
            }
            return null;
          },
        };
      },
    };
    return {
      wallets: [mockWallet],
      ready: true,
    };
  }

  return actual;
}
